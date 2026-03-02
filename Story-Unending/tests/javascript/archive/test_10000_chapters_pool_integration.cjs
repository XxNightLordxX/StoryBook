/**
 * Test 10,000 Chapters with Pool Integration
 * Verifies that pool expansion maintains uniqueness at scale
 */

// Load backstory engine and make it global
global.BackstoryEngine = require('../../backstory-engine.js');
// Load pool expansion systems
global.DynamicPoolExpansion = require('../../js/dynamic-pool-expansion.js');
global.StoryPoolIntegration = require('../../js/story-pool-integration.js');
// Then load story engine (which expects BackstoryEngine to be global)
const StoryEngine = require('../../story-engine.js');

console.log('='.repeat(80));
console.log('10,000 CHAPTERS TEST - POOL INTEGRATION');
console.log('='.repeat(80));

async function runTest() {
  const MAX_CHAPTERS = 10000;
  const EXPANSION_INTERVAL = 100; // Expand every 100 chapters
  
  console.log(`\nTest Configuration:`);
  console.log(`  Total chapters: ${MAX_CHAPTERS}`);
  console.log(`  Expansion interval: Every ${EXPANSION_INTERVAL} chapters`);
  console.log(`  Items per expansion: 40 per pool`);
  
  // Initialize integration
  console.log('\nInitializing pool integration...');
  StoryPoolIntegration.initialize();
  StoryEngine.initializePoolIntegration(StoryPoolIntegration);
  console.log('✓ Pool integration initialized');
  
  // Track statistics
  const chapterIds = new Set();
  const chapterTitles = new Set();
  const duplicateTitles = [];
  const titleFrequency = new Map();
  
  let startTime = Date.now();
  let lastExpansionTime = startTime;
  
  console.log(`\nGenerating ${MAX_CHAPTERS} chapters...`);
  
  for (let i = 1; i <= MAX_CHAPTERS; i++) {
    const chapter = StoryEngine.generateChapter(i);
    
    // Track chapter IDs
    chapterIds.add(chapter.id);
    
    // Track titles
    if (chapterTitles.has(chapter.title)) {
      duplicateTitles.push({ chapter: i, title: chapter.title });
    }
    chapterTitles.add(chapter.title);
    
    // Track title frequency
    titleFrequency.set(chapter.title, (titleFrequency.get(chapter.title) || 0) + 1);
    
    // Expand pools periodically
    if (i % EXPANSION_INTERVAL === 0) {
      const expansionStart = Date.now();
      const expansionResult = await DynamicPoolExpansion.expandAllPools({
        chapterNum: i,
        type: chapter.type,
        setting: chapter.setting
      });
      StoryPoolIntegration.syncPoolsToStoryEngine();
      const expansionTime = Date.now() - expansionStart;
      lastExpansionTime = Date.now();
      
      // Progress update
      const progress = ((i / MAX_CHAPTERS) * 100).toFixed(1);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      const rate = (i / elapsed).toFixed(2);
      
      console.log(`  [${progress}%] Chapter ${i}: ${chapterTitles.size} unique titles, ` +
                  `${expansionResult.newItemsAdded} new items added ` +
                  `(${expansionTime}ms, ${rate} chapters/sec)`);
    }
  }
  
  const totalTime = Date.now() - startTime;
  const avgRate = (MAX_CHAPTERS / (totalTime / 1000)).toFixed(2);
  
  // Final statistics
  console.log('\n' + '='.repeat(80));
  console.log('FINAL STATISTICS');
  console.log('='.repeat(80));
  
  console.log(`\nPerformance:`);
  console.log(`  Total time: ${(totalTime / 1000).toFixed(2)} seconds`);
  console.log(`  Average rate: ${avgRate} chapters/sec`);
  console.log(`  Time per chapter: ${(totalTime / MAX_CHAPTERS).toFixed(2)}ms`);
  
  console.log(`\nChapter IDs:`);
  console.log(`  Unique IDs: ${chapterIds.size} / ${MAX_CHAPTERS}`);
  console.log(`  Duplicate IDs: ${MAX_CHAPTERS - chapterIds.size}`);
  
  console.log(`\nChapter Titles:`);
  console.log(`  Unique titles: ${chapterTitles.size} / ${MAX_CHAPTERS}`);
  console.log(`  Duplicate titles: ${duplicateTitles.length}`);
  console.log(`  Uniqueness rate: ${((chapterTitles.size / MAX_CHAPTERS) * 100).toFixed(2)}%`);
  
  if (duplicateTitles.length > 0) {
    console.log(`\nMost frequent duplicate titles:`);
    const sortedTitles = [...titleFrequency.entries()]
      .filter(([title, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    for (const [title, count] of sortedTitles) {
      console.log(`  "${title}" - ${count} times`);
    }
  }
  
  // Pool statistics
  const poolStats = StoryPoolIntegration.getPoolStats();
  console.log(`\nFinal Pool Sizes:`);
  console.log(`  Adjectives: ${poolStats.adjectives}`);
  console.log(`  Nouns: ${poolStats.nouns}`);
  console.log(`  Actions: ${poolStats.actions}`);
  console.log(`  Patterns: ${poolStats.patterns}`);
  
  // Results
  console.log('\n' + '='.repeat(80));
  console.log('RESULTS');
  console.log('='.repeat(80));
  
  let passed = true;
  
  if (chapterIds.size === MAX_CHAPTERS) {
    console.log('✓ Chapter IDs: 100% unique');
  } else {
    console.log(`✗ Chapter IDs: Only ${((chapterIds.size / MAX_CHAPTERS) * 100).toFixed(2)}% unique`);
    passed = false;
  }
  
  if (chapterTitles.size >= MAX_CHAPTERS * 0.99) {
    console.log('✓ Chapter Titles: ≥99% unique');
  } else if (chapterTitles.size >= MAX_CHAPTERS * 0.95) {
    console.log('⚠ Chapter Titles: ≥95% unique (good)');
  } else {
    console.log(`✗ Chapter Titles: Only ${((chapterTitles.size / MAX_CHAPTERS) * 100).toFixed(2)}% unique`);
    passed = false;
  }
  
  if (parseFloat(avgRate) >= 1000) {
    console.log('✓ Performance: ≥1000 chapters/sec');
  } else {
    console.log(`⚠ Performance: ${avgRate} chapters/sec (below 1000 target)`);
  }
  
  console.log('\n' + '='.repeat(80));
  
  if (passed) {
    console.log('✓ ALL TESTS PASSED');
    console.log('\nThe pool integration system successfully maintains uniqueness at scale!');
  } else {
    console.log('✗ SOME TESTS FAILED');
    console.log('\nReview the results above for details.');
  }
  
  console.log('='.repeat(80));
}

// Run test
runTest().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});