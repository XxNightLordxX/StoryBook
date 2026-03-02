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
const StoryEngineResult = evalStoryEngine(mockWindow, BackstoryEngine);

const { generateChapter, reset, getStoryTracker } = StoryEngineResult;

reset();

console.log('=== DEBUGGING CHAPTER 1 ===\n');
const chapter1 = generateChapter();
console.log(`Chapter 1 has ${chapter1.paragraphs.length} paragraphs`);
console.log(`Paragraphs in chapter 1:`);
chapter1.paragraphs.forEach((p, i) => {
  console.log(`  ${i+1}. ${p.substring(0, 50)}...`);
});

const tracker = getStoryTracker();
console.log(`\nusedBackstoryParagraphs has ${tracker.usedBackstoryParagraphs.length} paragraphs`);

// Find which paragraph is not tracked
const untracked = chapter1.paragraphs.filter(p => !tracker.usedBackstoryParagraphs.includes(p));
console.log(`\n${untracked.length} paragraphs from chapter 1 are NOT tracked:`);
untracked.forEach(p => {
  console.log(`  - ${p.substring(0, 80)}...`);
});

console.log('\n=== DEBUGGING CHAPTER 2 ===\n');

// Get the tracker state before generating Chapter 2
const trackerBefore = getStoryTracker();
console.log(`Before Chapter 2: usedBackstoryParagraphs has ${trackerBefore.usedBackstoryParagraphs.length} paragraphs`);

const chapter2 = generateChapter();
console.log(`\nChapter 2 has ${chapter2.paragraphs.length} paragraphs`);

// Get the tracker state after generating Chapter 2
const trackerAfter = getStoryTracker();
console.log(`After Chapter 2: usedBackstoryParagraphs has ${trackerAfter.usedBackstoryParagraphs.length} paragraphs`);

// Check for overlaps
const overlaps2 = chapter2.paragraphs.filter(p => chapter1.paragraphs.includes(p));
console.log(`\n${overlaps2.length} paragraphs from chapter 1 appear in chapter 2:`);
overlaps2.forEach(p => {
  const position = chapter2.paragraphs.indexOf(p);
  console.log(`  - Position ${position + 1}: ${p.substring(0, 80)}...`);
});

// Check for overlaps
const overlaps = chapter2.paragraphs.filter(p => chapter1.paragraphs.includes(p));
console.log(`\n${overlaps.length} paragraphs from chapter 1 appear in chapter 2:`);
overlaps.forEach(p => {
  const position = chapter2.paragraphs.indexOf(p);
  console.log(`  - Position ${position + 1}: ${p.substring(0, 80)}...`);
  console.log(`    Is it in usedBackstoryParagraphs? ${tracker.usedBackstoryParagraphs.includes(p)}`);
  console.log(`    Length: ${p.length}`);
  console.log(`    First 20 chars: ${JSON.stringify(p.substring(0, 20))}`);
  
  // Check if there's an exact match in usedBackstoryParagraphs
  const exactMatch = tracker.usedBackstoryParagraphs.find(tracked => tracked === p);
  console.log(`    Exact match found: ${!!exactMatch}`);
  if (exactMatch) {
    console.log(`    Match length: ${exactMatch.length}`);
    console.log(`    Match first 20 chars: ${JSON.stringify(exactMatch.substring(0, 20))}`);
  }
});