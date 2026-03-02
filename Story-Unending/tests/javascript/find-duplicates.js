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

const { generateChapter, reset, getStoryTracker } = StoryEngine;

reset();

// Generate 10 chapters
const chapters = [];
for (let i = 0; i < 10; i++) {
  chapters.push(generateChapter());
}

// Find all duplicate paragraphs
const allParagraphs = new Map();
for (const chapter of chapters) {
  for (const para of chapter.paragraphs) {
    if (!allParagraphs.has(para)) {
      allParagraphs.set(para, []);
    }
    allParagraphs.get(para).push(chapter.number);
  }
}

// Find duplicates
const duplicates = [];
for (const [para, chapterNumbers] of allParagraphs.entries()) {
  if (chapterNumbers.length > 1) {
    duplicates.push({ para, chapterNumbers });
  }
}

const tracker = getStoryTracker();
console.log(`usedBackstoryParagraphs has ${tracker.usedBackstoryParagraphs.length} items`);
console.log(`Unique items in usedBackstoryParagraphs: ${new Set(tracker.usedBackstoryParagraphs).size}`);

// Check for duplicates in usedBackstoryParagraphs
const duplicatesInTracker = tracker.usedBackstoryParagraphs.filter((p, i) => 
  tracker.usedBackstoryParagraphs.indexOf(p) !== i
);
console.log(`Duplicates in usedBackstoryParagraphs: ${duplicatesInTracker.length}`);

console.log(`\nFound ${duplicates.length} duplicate paragraphs:\n`);
duplicates.forEach(({ para, chapterNumbers }) => {
  console.log(`Chapters ${chapterNumbers.join(', ')}:`);
  console.log(`  ${para.substring(0, 100)}...`);
  console.log(`  Is in usedBackstoryParagraphs? ${tracker.usedBackstoryParagraphs.includes(para)}`);
  console.log(`  Count in usedBackstoryParagraphs: ${tracker.usedBackstoryParagraphs.filter(p => p === para).length}`);
  console.log();
});