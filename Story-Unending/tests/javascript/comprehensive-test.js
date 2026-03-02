const fs = require('fs');

const storyEngineCode = fs.readFileSync('story-engine.js', 'utf8');
const backstoryEngineCode = fs.readFileSync('backstory-engine.js', 'utf8');

const mockWindow = {
  localStorage: {
    getItem: (key) => null,
    setItem: (key, value) => {},
    removeItem: (key) => {}
  }
};

const evalBackstoryEngine = new Function('window', backstoryEngineCode + '\nreturn BackstoryEngine;');
const BackstoryEngine = evalBackstoryEngine(mockWindow);

const evalStoryEngine = new Function('window', 'BackstoryEngine', storyEngineCode + '\nreturn StoryEngine;');
const StoryEngine = evalStoryEngine(mockWindow, BackstoryEngine);

const { generateChapter, reset, getStoryTracker, getMcState, addDirective, getPendingDirectives, getIncorporatedDirectives } = StoryEngine;

console.log('=== COMPREHENSIVE TEST SUITE ===\n');

// Test 1: Generate 150 chapters and check for duplicates
console.log('TEST 1: Generating 150 chapters and checking for duplicates...');
reset();
const chapters = [];
for (let i = 0; i < 150; i++) {
  chapters.push(generateChapter());
}
console.log(`✅ Generated ${chapters.length} chapters`);

// Check for duplicate titles
const titles = chapters.map(c => c.title);
const duplicateTitles = titles.filter((title, index) => titles.indexOf(title) !== index);
if (duplicateTitles.length > 0) {
  console.log(`❌ FOUND ${duplicateTitles.length} DUPLICATE TITLES:`, duplicateTitles);
} else {
  console.log('✅ No duplicate chapter titles found');
}

// Check for duplicate paragraphs within chapters
let intraChapterDuplicates = 0;
for (const chapter of chapters) {
  const paragraphs = chapter.paragraphs;
  const seen = new Set();
  for (const para of paragraphs) {
    if (seen.has(para)) {
      intraChapterDuplicates++;
    }
    seen.add(para);
  }
}
if (intraChapterDuplicates > 0) {
  console.log(`❌ FOUND ${intraChapterDuplicates} DUPLICATE PARAGRAPHS WITHIN CHAPTERS`);
} else {
  console.log('✅ No duplicate paragraphs within chapters found');
}

// Check for duplicate paragraphs across chapters
const allParagraphs = new Map();
let crossChapterDuplicates = 0;
for (const chapter of chapters) {
  for (const para of chapter.paragraphs) {
    if (!allParagraphs.has(para)) {
      allParagraphs.set(para, []);
    }
    allParagraphs.get(para).push(chapter.number);
  }
}
for (const [para, chapterNumbers] of allParagraphs.entries()) {
  if (chapterNumbers.length > 1) {
    crossChapterDuplicates++;
  }
}
if (crossChapterDuplicates > 0) {
  console.log(`❌ FOUND ${crossChapterDuplicates} DUPLICATE PARAGRAPHS ACROSS CHAPTERS`);
} else {
  console.log('✅ No duplicate paragraphs across chapters found');
}

// Test 2: Check tracking arrays
console.log('\nTEST 2: Checking tracking arrays...');
const tracker = getStoryTracker();
console.log(`usedBackstoryParagraphs: ${tracker.usedBackstoryParagraphs.length} paragraphs tracked`);
console.log(`usedVRParagraphs: ${tracker.usedVRParagraphs.length} paragraphs tracked`);

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

// Test 3: Check word counts
console.log('\nTEST 3: Checking word counts...');
let minWordCount = Infinity;
let maxWordCount = 0;
let totalWords = 0;
for (const chapter of chapters) {
  const wordCount = chapter.paragraphs.join(' ').split(/\s+/).length;
  minWordCount = Math.min(minWordCount, wordCount);
  maxWordCount = Math.max(maxWordCount, wordCount);
  totalWords += wordCount;
}
console.log(`Min word count: ${minWordCount}`);
console.log(`Max word count: ${maxWordCount}`);
console.log(`Average word count: ${Math.round(totalWords / chapters.length)}`);
console.log(`Total words: ${totalWords}`);

if (minWordCount < 100) {
  console.log(`⚠️  WARNING: Some chapters have less than 100 words (${minWordCount})`);
} else {
  console.log('✅ All chapters have at least 100 words');
}

// Test 4: Check MC stats progression
console.log('\nTEST 4: Checking MC stats progression...');
const mcState = getMcState();
console.log(`MC Level: ${mcState.level}`);
console.log(`MC HP: ${mcState.hp}/${mcState.maxHp}`);
console.log(`MC MP: ${mcState.mp}/${mcState.maxMp}`);
console.log(`MC Blood Essence: ${mcState.bloodEssence}/${mcState.maxBloodEssence}`);
console.log(`MC Strength: ${mcState.strength}`);
console.log(`MC Agility: ${mcState.agility}`);
console.log(`MC Intelligence: ${mcState.intelligence}`);

if (mcState.level > 1) {
  console.log('✅ MC has leveled up');
} else {
  console.log('⚠️  MC is still level 1 (expected for backstory chapters)');
}

// Test 5: Test reset functionality
console.log('\nTEST 5: Testing reset functionality...');
reset();
const trackerAfterReset = getStoryTracker();
const mcStateAfterReset = getMcState();

if (trackerAfterReset.chaptersGenerated === 0) {
  console.log('✅ Chapter count reset to 0');
} else {
  console.log(`❌ Chapter count not reset: ${trackerAfterReset.chaptersGenerated}`);
}

if (trackerAfterReset.usedBackstoryParagraphs.length === 0) {
  console.log('✅ usedBackstoryParagraphs cleared');
} else {
  console.log(`❌ usedBackstoryParagraphs not cleared: ${trackerAfterReset.usedBackstoryParagraphs.length}`);
}

if (trackerAfterReset.usedVRParagraphs.length === 0) {
  console.log('✅ usedVRParagraphs cleared');
} else {
  console.log(`❌ usedVRParagraphs not cleared: ${trackerAfterReset.usedVRParagraphs.length}`);
}

if (mcStateAfterReset.level === 1) {
  console.log('✅ MC level reset to 1');
} else {
  console.log(`❌ MC level not reset: ${mcStateAfterReset.level}`);
}

// Generate a few chapters after reset to verify it works
const chaptersAfterReset = [];
for (let i = 0; i < 5; i++) {
  chaptersAfterReset.push(generateChapter());
}
console.log(`✅ Generated ${chaptersAfterReset.length} chapters after reset`);

// Test 6: Test directive system
console.log('\nTEST 6: Testing directive system...');
reset();
const directive = addDirective('A mysterious stranger appears', 3);
console.log(`✅ Added directive: "${directive.text}"`);

const pending = getPendingDirectives();
console.log(`Pending directives: ${pending.length}`);

// Generate chapters to incorporate directive
for (let i = 0; i < 5; i++) {
  generateChapter();
}

const incorporated = getIncorporatedDirectives();
console.log(`Incorporated directives: ${incorporated.length}`);

if (incorporated.length > 0) {
  console.log('✅ Directive was incorporated');
} else {
  console.log('⚠️  Directive was not incorporated');
}

// Test 7: Verify seeded RNG produces same story
console.log('\nTEST 7: Testing seeded RNG consistency...');
reset();
const story1 = [];
for (let i = 0; i < 10; i++) {
  story1.push(generateChapter());
}

reset();
const story2 = [];
for (let i = 0; i < 10; i++) {
  story2.push(generateChapter());
}

let storiesMatch = true;
for (let i = 0; i < 10; i++) {
  if (story1[i].title !== story2[i].title || 
      story1[i].paragraphs.join('') !== story2[i].paragraphs.join('')) {
    storiesMatch = false;
    break;
  }
}

if (storiesMatch) {
  console.log('✅ Seeded RNG produces identical stories');
} else {
  console.log('❌ Seeded RNG produces different stories');
}

// Test 8: Check arc progression
console.log('\nTEST 8: Checking arc progression...');
reset();
const arcChapters = [];
for (let i = 0; i < 150; i++) {
  const chapter = generateChapter();
  arcChapters.push(chapter.arc);
}

const uniqueArcs = [...new Set(arcChapters)];
console.log(`Unique arcs: ${uniqueArcs.length}`);
console.log(`Arcs: ${uniqueArcs.join(', ')}`);

if (uniqueArcs.length > 1) {
  console.log('✅ Story progresses through multiple arcs');
} else {
  console.log('⚠️  Story only has one arc');
}

// Final summary
console.log('\n=== TEST SUMMARY ===');
const allTestsPassed = 
  duplicateTitles.length === 0 &&
  intraChapterDuplicates === 0 &&
  crossChapterDuplicates === 0 &&
  backstoryDuplicates.length === 0 &&
  vrDuplicates.length === 0 &&
  minWordCount >= 100 &&
  trackerAfterReset.chaptersGenerated === 0 &&
  trackerAfterReset.usedBackstoryParagraphs.length === 0 &&
  trackerAfterReset.usedVRParagraphs.length === 0 &&
  mcStateAfterReset.level === 1 &&
  incorporated.length > 0 &&
  storiesMatch &&
  uniqueArcs.length > 1;

if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED!');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED!');
  process.exit(1);
}