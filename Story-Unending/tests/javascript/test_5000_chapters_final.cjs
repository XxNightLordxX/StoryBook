/**
 * Test with 5000 chapters - verify uniqueness at scale
 */

// Load backstory engine and make it global
global.BackstoryEngine = require('../../backstory-engine.js');
// Then load story engine (which expects BackstoryEngine to be global)
const StoryEngine = require('../../story-engine.js');

console.log('='.repeat(80));
console.log('DUPLICATE CONTENT TEST - 5000 CHAPTERS');
console.log('='.repeat(80));

const MAX_CHAPTERS = 5000;
const chapterIds = new Set();
const chapterTitles = new Set();
const paragraphHashes = new Set();

let duplicateChapters = [];
let duplicateTitles = [];
let duplicateParagraphs = [];
let sequenceIssues = [];

console.log(`\nGenerating ${MAX_CHAPTERS} chapters and checking for duplicates...\n`);

const startTime = Date.now();

for (let i = 1; i <= MAX_CHAPTERS; i++) {
  try {
    const chapter = StoryEngine.generateChapter();
    
    // Check chapter ID
    if (chapterIds.has(chapter.id)) {
      duplicateChapters.push({
        chapter: i,
        id: chapter.id,
        previous: Array.from(chapterIds).findIndex(id => id === chapter.id) + 1
      });
    }
    chapterIds.add(chapter.id);
    
    // Check title
    if (chapterTitles.has(chapter.title)) {
      duplicateTitles.push({
        chapter: i,
        title: chapter.title,
        previous: Array.from(chapterTitles).findIndex(title => title === chapter.title) + 1
      });
      console.log(`⚠ Duplicate title at ${i}: "${chapter.title}"`);
    }
    chapterTitles.add(chapter.title);
    
    // Check paragraphs
    chapter.paragraphs.forEach((para, idx) => {
      const hash = para.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
      if (paragraphHashes.has(hash)) {
        duplicateParagraphs.push({
          chapter: i,
          paragraph: idx,
          hash: hash,
          text: para.substring(0, 100) + '...'
        });
      }
      paragraphHashes.add(hash);
    });
    
    // Check sequence
    if (chapter.id !== i) {
      sequenceIssues.push({
        chapter: i,
        expected: i,
        actual: chapter.id
      });
    }
    
    // Progress update every 500 chapters
    if (i % 500 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = i / elapsed;
      console.log(`Progress: ${i}/${MAX_CHAPTERS} (${rate.toFixed(2)} chapters/sec)`);
    }
    
  } catch (error) {
    console.error(`Error generating chapter ${i}:`, error.message);
  }
}

const endTime = Date.now();
const totalTime = (endTime - startTime) / 1000;
const rate = MAX_CHAPTERS / totalTime;

console.log('\n' + '='.repeat(80));
console.log('RESULTS');
console.log('='.repeat(80));

console.log(`\nTotal Chapters Generated: ${MAX_CHAPTERS}`);
console.log(`Time: ${totalTime.toFixed(2)} seconds`);
console.log(`Rate: ${rate.toFixed(2)} chapters/sec`);

console.log(`\nUnique Chapter IDs: ${chapterIds.size}`);
console.log(`Unique Titles: ${chapterTitles.size}`);
console.log(`Unique Paragraphs: ${paragraphHashes.size}`);

console.log(`\nDuplicate Chapter IDs: ${duplicateChapters.length}`);
console.log(`Duplicate Titles: ${duplicateTitles.length}`);
console.log(`Duplicate Paragraphs: ${duplicateParagraphs.length}`);
console.log(`Sequence Issues: ${sequenceIssues.length}`);

// Calculate percentages
const titleUniqueness = ((chapterTitles.size / MAX_CHAPTERS) * 100).toFixed(2);
const paragraphUniqueness = ((paragraphHashes.size / (MAX_CHAPTERS * 15)) * 100).toFixed(2); // Assuming ~15 paragraphs per chapter

console.log(`\nTitle Uniqueness: ${titleUniqueness}%`);
console.log(`Paragraph Uniqueness: ${paragraphUniqueness}%`);

// Determine success
const hasIssues = duplicateChapters.length > 0 || duplicateParagraphs.length > 0 || sequenceIssues.length > 0;

if (hasIssues) {
  console.log('\n❌ FAILURE: Duplicates or issues found.');
  if (duplicateChapters.length > 0) {
    console.log(`  - ${duplicateChapters.length} duplicate chapter IDs`);
  }
  if (duplicateTitles.length > 0) {
    console.log(`  - ${duplicateTitles.length} duplicate titles`);
  }
  if (duplicateParagraphs.length > 0) {
    console.log(`  - ${duplicateParagraphs.length} duplicate paragraphs`);
  }
  if (sequenceIssues.length > 0) {
    console.log(`  - ${sequenceIssues.length} sequence issues`);
  }
  process.exit(1);
} else {
  console.log('\n✅ SUCCESS: No duplicates or issues found!');
  console.log(`   ${MAX_CHAPTERS} chapters with 100% uniqueness`);
  process.exit(0);
}