// Test script to verify no duplicate chapters or paragraphs
const fs = require('fs');

// Load the story engine files
const storyEngineCode = fs.readFileSync('story-engine.js', 'utf8');
const backstoryEngineCode = fs.readFileSync('backstory-engine.js', 'utf8');

// Create a mock environment
const mockWindow = {
  localStorage: {
    getItem: (key) => null,
    setItem: (key, value) => {},
    removeItem: (key) => {}
  }
};

// Execute backstory engine first and capture the result
const evalBackstoryEngine = new Function('window', backstoryEngineCode + '\nreturn BackstoryEngine;');
const BackstoryEngine = evalBackstoryEngine(mockWindow);

// Execute story engine with BackstoryEngine available and capture the result
// The IIFE is self-invoking, so it returns the object directly
const evalStoryEngine = new Function('window', 'BackstoryEngine', storyEngineCode + '\nreturn StoryEngine;');
const StoryEngine = evalStoryEngine(mockWindow, BackstoryEngine);

// The IIFE is self-invoking, so StoryEngine is already the returned object
const { generateChapter, reset, getStoryTracker } = StoryEngine;

console.log('=== DUPLICATE DETECTION TEST ===\n');

// Reset story to start fresh
reset();

// Generate first 10 chapters
const chapters = [];
for (let i = 0; i < 10; i++) {
  const chapter = generateChapter();
  chapters.push(chapter);
  const content = chapter.paragraphs.join('\n\n');
  console.log(`  Chapter ${chapter.number}: "${chapter.title}" (${content.split(/\s+/).length} words)`);
}

// Check for duplicate chapter titles
console.log('\n=== CHECKING DUPLICATE CHAPTER TITLES ===');
const titles = chapters.map(c => c.title);
const duplicateTitles = titles.filter((title, index) => titles.indexOf(title) !== index);
if (duplicateTitles.length > 0) {
  console.log('❌ FOUND DUPLICATE TITLES:', duplicateTitles);
} else {
  console.log('✅ No duplicate chapter titles found');
}

// Check for duplicate paragraphs within each chapter
console.log('\n=== CHECKING DUPLICATE PARAGRAPHS WITHIN CHAPTERS ===');
let hasIntraChapterDuplicates = false;
for (const chapter of chapters) {
  const paragraphs = chapter.paragraphs;
  const seen = new Set();
  const duplicates = [];
  
  for (const para of paragraphs) {
    if (seen.has(para)) {
      duplicates.push(para.substring(0, 50) + '...');
    }
    seen.add(para);
  }
  
  if (duplicates.length > 0) {
    console.log(`❌ Chapter ${chapter.number} has ${duplicates.length} duplicate paragraphs:`);
    duplicates.forEach(d => console.log(`   - ${d}`));
    hasIntraChapterDuplicates = true;
  }
}
if (!hasIntraChapterDuplicates) {
  console.log('✅ No duplicate paragraphs within chapters found');
}

// Check for duplicate paragraphs across chapters
console.log('\n=== CHECKING DUPLICATE PARAGRAPHS ACROSS CHAPTERS ===');
const allParagraphs = new Map(); // paragraph -> [chapter numbers]
let hasCrossChapterDuplicates = false;

for (const chapter of chapters) {
  const paragraphs = chapter.paragraphs;
  
  for (const para of paragraphs) {
    if (!allParagraphs.has(para)) {
      allParagraphs.set(para, []);
    }
    allParagraphs.get(para).push(chapter.number);
  }
}

// Find paragraphs that appear in multiple chapters
const duplicateParas = [];
for (const [para, chapterNumbers] of allParagraphs.entries()) {
  if (chapterNumbers.length > 1) {
    duplicateParas.push({ para, chapterNumbers });
  }
}

if (duplicateParas.length > 0) {
  console.log(`❌ Found ${duplicateParas.length} paragraphs appearing in multiple chapters:`);
  duplicateParas.slice(0, 10).forEach(({ para, chapterNumbers }) => {
    console.log(`   Chapters ${chapterNumbers.join(', ')}: "${para.substring(0, 60)}..."`);
  });
  if (duplicateParas.length > 10) {
    console.log(`   ... and ${duplicateParas.length - 10} more`);
  }
  hasCrossChapterDuplicates = true;
} else {
  console.log('✅ No duplicate paragraphs across chapters found');
}

// Check tracking arrays
console.log('\n=== CHECKING TRACKING ARRAYS ===');
const tracker = getStoryTracker();
console.log(`usedBackstoryParagraphs: ${tracker.usedBackstoryParagraphs.length} paragraphs tracked`);
console.log(`usedVRParagraphs: ${tracker.usedVRParagraphs.length} paragraphs tracked`);

// Verify no duplicates in tracking arrays
const backstoryDuplicates = tracker.usedBackstoryParagraphs.filter((p, i) => 
  tracker.usedBackstoryParagraphs.indexOf(p) !== i
);
const vrDuplicates = tracker.usedVRParagraphs.filter((p, i) => 
  tracker.usedVRParagraphs.indexOf(p) !== i
);

if (backstoryDuplicates.length > 0) {
  console.log(`❌ ${backstoryDuplicates.length} duplicates in usedBackstoryParagraphs`);
} else {
  console.log('✅ No duplicates in usedBackstoryParagraphs');
}

if (vrDuplicates.length > 0) {
  console.log(`❌ ${vrDuplicates.length} duplicates in usedVRParagraphs`);
} else {
  console.log('✅ No duplicates in usedVRParagraphs');
}

// Final summary
console.log('\n=== TEST SUMMARY ===');
const allTestsPassed = 
  duplicateTitles.length === 0 &&
  !hasIntraChapterDuplicates &&
  !hasCrossChapterDuplicates &&
  backstoryDuplicates.length === 0 &&
  vrDuplicates.length === 0;

if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED - No duplicates found!');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED - Duplicates detected!');
  process.exit(1);
}