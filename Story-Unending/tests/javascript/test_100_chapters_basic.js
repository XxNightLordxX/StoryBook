/**
 * Test 100 Chapters - Basic Test Without Pool Expansion
 * Verifies story generation works correctly
 */

// Load required modules
const BackstoryEngine = require('../../backstory-engine.js');
const StoryEngine = require('../../story-engine.js');

// Make BackstoryEngine global for StoryEngine
global.BackstoryEngine = BackstoryEngine;

// Test configuration
const TEST_CONFIG = {
  totalChapters: 100
};

// Tracking variables
let uniqueTitles = new Set();
let duplicateTitles = [];

/**
 * Generate and test a single chapter
 */
function generateAndTestChapter(chapterNum) {
  // Generate chapter
  const chapter = StoryEngine.generateChapter(chapterNum);
  
  // Track title uniqueness
  if (chapter.title) {
    if (uniqueTitles.has(chapter.title)) {
      duplicateTitles.push({
        chapter: chapterNum,
        title: chapter.title
      });
    } else {
      uniqueTitles.add(chapter.title);
    }
  }
  
  return chapter;
}

/**
 * Run the main test
 */
function runTest() {
  console.log('\n========================================');
  console.log('Testing 100 Chapters - Basic Test');
  console.log('========================================\n');
  
  const startTime = Date.now();
  
  console.log(`\nGenerating ${TEST_CONFIG.totalChapters} chapters...\n`);
  
  // Generate chapters
  for (let i = 1; i <= TEST_CONFIG.totalChapters; i++) {
    generateAndTestChapter(i);
    
    // Progress update every 10 chapters
    if (i % 10 === 0) {
      const elapsed = Date.now() - startTime;
      const rate = (i / (elapsed / 1000)).toFixed(2);
      console.log(`✓ Generated ${i} chapters (${rate} chapters/sec)`);
    }
  }
  
  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;
  const avgRate = (TEST_CONFIG.totalChapters / totalTime).toFixed(2);
  
  // Calculate statistics
  const titleUniqueness = ((uniqueTitles.size / TEST_CONFIG.totalChapters) * 100).toFixed(2);
  
  // Display results
  console.log('\n========================================');
  console.log('TEST RESULTS');
  console.log('========================================\n');
  
  console.log('Performance:');
  console.log(`  Total Time: ${totalTime.toFixed(2)} seconds`);
  console.log(`  Average Rate: ${avgRate} chapters/sec`);
  
  console.log('\nTitle Uniqueness:');
  console.log(`  Unique Titles: ${uniqueTitles.size}/${TEST_CONFIG.totalChapters}`);
  console.log(`  Duplicate Titles: ${duplicateTitles.length}`);
  console.log(`  Uniqueness Rate: ${titleUniqueness}%`);
  
  // Final verdict
  console.log('\n========================================');
  console.log('FINAL VERDICT');
  console.log('========================================\n');
  
  const titleSuccess = uniqueTitles.size === TEST_CONFIG.totalChapters;
  
  if (titleSuccess) {
    console.log('✅ SUCCESS: Story generation working!');
    console.log(`   - ${TEST_CONFIG.totalChapters} chapters generated`);
    console.log(`   - ${uniqueTitles.size} unique titles`);
    console.log(`   - Performance: ${avgRate} chapters/sec`);
  } else {
    console.log('❌ FAILURE: Duplicates found');
    console.log(`   - Only ${uniqueTitles.size}/${TEST_CONFIG.totalChapters} unique titles`);
  }
  
  console.log('\n========================================\n');
  
  return {
    success: titleSuccess,
    totalChapters: TEST_CONFIG.totalChapters,
    uniqueTitles: uniqueTitles.size,
    duplicateTitles: duplicateTitles.length,
    titleUniqueness: parseFloat(titleUniqueness),
    totalTime: totalTime,
    avgRate: parseFloat(avgRate)
  };
}

// Run the test
try {
  const results = runTest();
  console.log('Test completed successfully');
  process.exit(results.success ? 0 : 1);
} catch (error) {
  console.error('Test failed with error:', error);
  process.exit(1);
}