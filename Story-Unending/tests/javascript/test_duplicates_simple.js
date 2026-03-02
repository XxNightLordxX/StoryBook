/**
 * Simple test to check for duplicates in generated chapters
 */

const StoryEngine = require('./story-engine.js');

console.log('='.repeat(80));
console.log('DUPLICATE CONTENT TEST');
console.log('='.repeat(80));

const MAX_CHAPTERS = 3000;
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
        title: chapter.title
      });
      console.log(`⚠ Duplicate chapter ID at ${i}: ${chapter.id}`);
    } else {
      chapterIds.add(chapter.id);
    }
    
    // Check title
    if (chapterTitles.has(chapter.title)) {
      duplicateTitles.push({
        chapter: i,
        title: chapter.title
      });
      console.log(`⚠ Duplicate title at ${i}: "${chapter.title}"`);
    } else {
      chapterTitles.add(chapter.title);
    }
    
    // Check paragraphs
    chapter.paragraphs.forEach((para, idx) => {
      const hash = `${chapter.id}-${idx}-${para.substring(0, 50)}`;
      if (paragraphHashes.has(hash)) {
        duplicateParagraphs.push({
          chapter: i,
          paragraphIndex: idx,
          text: para.substring(0, 80) + '...'
        });
      } else {
        paragraphHashes.add(hash);
      }
    });
    
    // Check sequence
    if (chapter.number !== i) {
      sequenceIssues.push({
        expected: i,
        actual: chapter.number,
        title: chapter.title
      });
    }
    
    // Progress
    if (i % 100 === 0) {
      const elapsed = Date.now() - startTime;
      const rate = (i / (elapsed / 1000)).toFixed(2);
      console.log(`Progress: ${i}/${MAX_CHAPTERS} (${rate} chapters/sec)`);
    }
    
  } catch (error) {
    console.log(`✗ Error at chapter ${i}: ${error.message}`);
  }
}

const elapsed = Date.now() - startTime;

console.log('\n' + '='.repeat(80));
console.log('RESULTS');
console.log('='.repeat(80));
console.log(`\nTotal Chapters Generated: ${MAX_CHAPTERS}`);
console.log(`Time: ${(elapsed / 1000).toFixed(2)} seconds`);
console.log(`Rate: ${(MAX_CHAPTERS / (elapsed / 1000)).toFixed(2)} chapters/sec\n`);
console.log(`Unique Chapter IDs: ${chapterIds.size}`);
console.log(`Unique Titles: ${chapterTitles.size}`);
console.log(`Unique Paragraphs: ${paragraphHashes.size}\n`);
console.log(`Duplicate Chapter IDs: ${duplicateChapters.length}`);
console.log(`Duplicate Titles: ${duplicateTitles.length}`);
console.log(`Duplicate Paragraphs: ${duplicateParagraphs.length}`);
console.log(`Sequence Issues: ${sequenceIssues.length}\n`);

if (duplicateChapters.length === 0 && duplicateTitles.length === 0 && duplicateParagraphs.length === 0 && sequenceIssues.length === 0) {
  console.log('✅ SUCCESS: No duplicates found! All chapters are unique.');
  process.exit(0);
} else {
  console.log('❌ FAILURE: Duplicates or issues found.');
  if (duplicateChapters.length > 0) console.log(`  - ${duplicateChapters.length} duplicate chapter IDs`);
  if (duplicateTitles.length > 0) console.log(`  - ${duplicateTitles.length} duplicate titles`);
  if (duplicateParagraphs.length > 0) console.log(`  - ${duplicateParagraphs.length} duplicate paragraphs`);
  if (sequenceIssues.length > 0) console.log(`  - ${sequenceIssues.length} sequence issues`);
  process.exit(1);
}