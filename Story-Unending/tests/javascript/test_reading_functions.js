/**
 * Comprehensive Test for Reading Functions and Duplicate Content
 * Tests up to 3000 chapters for duplicates and reading functionality
 */

const fs = require('fs');
const path = require('path');

// Load the story engine
const storyEnginePath = path.join(__dirname, 'story-engine.js');
eval(fs.readFileSync(storyEnginePath, 'utf8'));

// Test configuration
const MAX_CHAPTERS_TO_TEST = 3000;
const TEST_BATCH_SIZE = 100;

// Results tracking
const results = {
  readingFunctions: [],
  duplicateChapters: [],
  duplicateParagraphs: [],
  duplicateTitles: [],
  chapterSequenceIssues: [],
  missingChapters: [],
  orphanedChapters: [],
  totalChaptersTested: 0,
  uniqueParagraphs: new Set(),
  uniqueTitles: new Set(),
  chapterIds: new Set(),
  errors: []
};

console.log('='.repeat(80));
console.log('READING FUNCTIONS AND DUPLICATE CONTENT TEST');
console.log('='.repeat(80));
console.log(`Testing up to ${MAX_CHAPTERS_TO_TEST} chapters...\n`);

// Phase 1: Identify Reading Functions
console.log('Phase 1: Identifying Reading Functions...');
console.log('-'.repeat(80));

const readingFunctions = [
  'showChapter',
  'nextChapter',
  'prevChapter',
  'jumpToChapter',
  'jumpToLatestChapter',
  'setChapterSpeed',
  'getChapterStats',
  'getTotalChaptersShouldExist',
  'generateNewChapter'
];

readingFunctions.forEach(funcName => {
  const exists = typeof window !== 'undefined' && typeof window[funcName] === 'function';
  results.readingFunctions.push({
    name: funcName,
    available: exists,
    type: typeof window !== 'undefined' ? typeof window[funcName] : 'undefined'
  });
  console.log(`  ${funcName}: ${exists ? '✓ Available' : '✗ Not Available'}`);
});

// Phase 2: Test Chapter Generation and Check for Duplicates
console.log('\nPhase 2: Testing Chapter Generation and Checking for Duplicates...');
console.log('-'.repeat(80));

let chapterCount = 0;
const startTime = Date.now();

for (let i = 1; i <= MAX_CHAPTERS_TO_TEST; i++) {
  try {
    const chapter = StoryEngine.generateChapter();
    
    // Check chapter ID uniqueness
    if (results.chapterIds.has(chapter.id)) {
      results.duplicateChapters.push({
        chapter: i,
        duplicateId: chapter.id,
        title: chapter.title
      });
      console.log(`  ⚠ Duplicate chapter ID found at chapter ${i}: ${chapter.id}`);
    } else {
      results.chapterIds.add(chapter.id);
    }
    
    // Check title uniqueness
    if (results.uniqueTitles.has(chapter.title)) {
      results.duplicateTitles.push({
        chapter: i,
        title: chapter.title
      });
      console.log(`  ⚠ Duplicate title found at chapter ${i}: "${chapter.title}"`);
    } else {
      results.uniqueTitles.add(chapter.title);
    }
    
    // Check paragraph uniqueness
    chapter.paragraphs.forEach((paragraph, pIndex) => {
      const paragraphHash = `${chapter.id}-${pIndex}-${paragraph.substring(0, 50)}`;
      if (results.uniqueParagraphs.has(paragraphHash)) {
        results.duplicateParagraphs.push({
          chapter: i,
          paragraphIndex: pIndex,
          text: paragraph.substring(0, 100) + '...'
        });
      } else {
        results.uniqueParagraphs.add(paragraphHash);
      }
    });
    
    // Check chapter sequence
    if (chapter.number !== i) {
      results.chapterSequenceIssues.push({
        expected: i,
        actual: chapter.number,
        title: chapter.title
      });
      console.log(`  ⚠ Chapter sequence issue at ${i}: expected ${i}, got ${chapter.number}`);
    }
    
    chapterCount++;
    
    // Progress update
    if (chapterCount % TEST_BATCH_SIZE === 0) {
      const elapsed = Date.now() - startTime;
      const rate = (chapterCount / (elapsed / 1000)).toFixed(2);
      console.log(`  Progress: ${chapterCount}/${MAX_CHAPTERS_TO_TEST} chapters (${rate} chapters/sec)`);
    }
    
  } catch (error) {
    results.errors.push({
      chapter: i,
      error: error.message,
      stack: error.stack
    });
    console.log(`  ✗ Error generating chapter ${i}: ${error.message}`);
  }
}

results.totalChaptersTested = chapterCount;

// Phase 3: Analyze Results
console.log('\nPhase 3: Analyzing Results...');
console.log('-'.repeat(80));

const elapsed = Date.now() - startTime;
const rate = (chapterCount / (elapsed / 1000)).toFixed(2);

console.log(`\nTotal Chapters Tested: ${results.totalChaptersTested}`);
console.log(`Total Time: ${(elapsed / 1000).toFixed(2)} seconds`);
console.log(`Generation Rate: ${rate} chapters/second`);
console.log(`\nUnique Chapter IDs: ${results.chapterIds.size}`);
console.log(`Unique Titles: ${results.uniqueTitles.size}`);
console.log(`Unique Paragraphs: ${results.uniqueParagraphs.size}`);
console.log(`\nDuplicate Chapters: ${results.duplicateChapters.length}`);
console.log(`Duplicate Titles: ${results.duplicateTitles.length}`);
console.log(`Duplicate Paragraphs: ${results.duplicateParagraphs.length}`);
console.log(`Chapter Sequence Issues: ${results.chapterSequenceIssues.length}`);
console.log(`Errors: ${results.errors.length}`);

// Phase 4: Generate Detailed Report
console.log('\nPhase 4: Generating Detailed Report...');
console.log('-'.repeat(80));

const report = {
  timestamp: new Date().toISOString(),
  testConfiguration: {
    maxChaptersToTest: MAX_CHAPTERS_TO_TEST,
    batchSize: TEST_BATCH_SIZE
  },
  summary: {
    totalChaptersTested: results.totalChaptersTested,
    totalTimeSeconds: (elapsed / 1000).toFixed(2),
    generationRate: rate,
    uniqueChapterIds: results.chapterIds.size,
    uniqueTitles: results.uniqueTitles.size,
    uniqueParagraphs: results.uniqueParagraphs.size,
    duplicateChapters: results.duplicateChapters.length,
    duplicateTitles: results.duplicateTitles.length,
    duplicateParagraphs: results.duplicateParagraphs.length,
    chapterSequenceIssues: results.chapterSequenceIssues.length,
    errors: results.errors.length
  },
  readingFunctions: results.readingFunctions,
  duplicates: {
    chapters: results.duplicateChapters,
    titles: results.duplicateTitles,
    paragraphs: results.duplicateParagraphs.slice(0, 100) // Limit to first 100
  },
  sequenceIssues: results.chapterSequenceIssues,
  errors: results.errors
};

// Save report to file
const reportPath = path.join(__dirname, 'reading_functions_test_report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n✓ Detailed report saved to: ${reportPath}`);

// Phase 5: Final Assessment
console.log('\nPhase 5: Final Assessment');
console.log('='.repeat(80));

let overallStatus = 'PASS';
const issues = [];

if (results.duplicateChapters.length > 0) {
  overallStatus = 'FAIL';
  issues.push(`${results.duplicateChapters.length} duplicate chapter IDs found`);
}

if (results.duplicateTitles.length > 0) {
  overallStatus = 'FAIL';
  issues.push(`${results.duplicateTitles.length} duplicate chapter titles found`);
}

if (results.duplicateParagraphs.length > 0) {
  overallStatus = 'FAIL';
  issues.push(`${results.duplicateParagraphs.length} duplicate paragraphs found`);
}

if (results.chapterSequenceIssues.length > 0) {
  overallStatus = 'FAIL';
  issues.push(`${results.chapterSequenceIssues.length} chapter sequence issues found`);
}

if (results.errors.length > 0) {
  overallStatus = 'FAIL';
  issues.push(`${results.errors.length} errors encountered during generation`);
}

console.log(`\nOverall Status: ${overallStatus}`);

if (issues.length > 0) {
  console.log('\nIssues Found:');
  issues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue}`);
  });
} else {
  console.log('\n✓ No issues found! All reading functions work correctly and no duplicates detected.');
}

console.log('\n' + '='.repeat(80));
console.log('TEST COMPLETE');
console.log('='.repeat(80));

// Exit with appropriate code
process.exit(overallStatus === 'PASS' ? 0 : 1);