/**
 * Test 1,000 Chapters with Manual Pool Expansion
 * Manually triggers expansion every 10 chapters for better performance
 */

// Load required modules
const BackstoryEngine = require('../../backstory-engine.js');
const StoryEngine = require('../../story-engine.js');

// Make BackstoryEngine global for StoryEngine
global.BackstoryEngine = BackstoryEngine;

// Load optimized systems
const WebContentDiscovery = require('../../js/web-content-discovery.js');
const OptimizedPoolManager = require('../../js/optimized-pool-manager.js');
const UniquenessTracker = require('../../js/uniqueness-tracker.js');

// Make modules global
global.WebContentDiscovery = WebContentDiscovery;
global.OptimizedPoolManager = OptimizedPoolManager;
global.UniquenessTracker = UniquenessTracker;

// Test configuration
const TEST_CONFIG = {
  totalChapters: 1000,
  expansionInterval: 10, // Expand every 10 chapters
  proactiveThreshold: 0.20, // Expand when pool is 20% full
  itemsToAdd: 40, // Add 40 items per pool
  enableWebSearch: true,
  enablePoolExpansion: true,
  enableUniquenessTracking: true
};

// Tracking variables
let uniqueTitles = new Set();
let uniqueParagraphs = new Set();
let duplicateTitles = [];
let duplicateParagraphs = [];

/**
 * Initialize the optimized systems
 */
async function initializeSystems() {
  console.log('Initializing optimized systems...');
  
  // Initialize uniqueness tracker
  UniquenessTracker.initialize({
    similarityThreshold: 0.85,
    enableSimilarityCheck: true,
    enableExactMatchCheck: true
  });
  
  // Initialize pool manager
  OptimizedPoolManager.initialize({}, {
    expansionInterval: TEST_CONFIG.expansionInterval,
    proactiveThreshold: TEST_CONFIG.proactiveThreshold,
    itemsToAdd: TEST_CONFIG.itemsToAdd,
    enableWebSearch: TEST_CONFIG.enableWebSearch,
    enablePredictiveDetection: true,
    enableProactiveExpansion: true
  });
  
  console.log('✓ Systems initialized');
  console.log(`  Expansion Interval: ${TEST_CONFIG.expansionInterval} chapters`);
  console.log(`  Proactive Threshold: ${(TEST_CONFIG.proactiveThreshold * 100).toFixed(0)}%`);
  console.log(`  Items to Add: ${TEST_CONFIG.itemsToAdd} per pool`);
}

/**
 * Generate and test a single chapter
 */
function generateAndTestChapter(chapterNum) {
  // Generate chapter (synchronous)
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
  
  // Track paragraph uniqueness
  if (chapter.paragraphs && Array.isArray(chapter.paragraphs)) {
    for (const paragraph of chapter.paragraphs) {
      const paraHash = hashString(paragraph);
      if (uniqueParagraphs.has(paraHash)) {
        duplicateParagraphs.push({
          chapter: chapterNum,
          paragraph: paragraph.substring(0, 50) + '...'
        });
      } else {
        uniqueParagraphs.add(paraHash);
      }
    }
  }
  
  return chapter;
}

/**
 * Generate a simple hash for string comparison
 */
function hashString(str) {
  let hash = 0;
  const normalized = str.toLowerCase().replace(/\s+/g, ' ').trim();
  
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return hash.toString(36);
}

/**
 * Run the main test
 */
async function runTest() {
  console.log('\n========================================');
  console.log('Testing 1,000 Chapters with Manual Expansion');
  console.log('========================================\n');
  
  const startTime = Date.now();
  
  // Initialize systems
  await initializeSystems();
  
  console.log(`\nGenerating ${TEST_CONFIG.totalChapters} chapters...\n`);
  
  // Generate chapters
  for (let i = 1; i <= TEST_CONFIG.totalChapters; i++) {
    // Generate chapter
    generateAndTestChapter(i);
    
    // Manually trigger expansion every N chapters
    if (i % TEST_CONFIG.expansionInterval === 0) {
      console.log(`  Expanding pools at chapter ${i}...`);
      await OptimizedPoolManager.expandPoolsProactively({
        chapterNumber: i
      });
    }
    
    // Progress update every 100 chapters
    if (i % 100 === 0) {
      const elapsed = Date.now() - startTime;
      const rate = (i / (elapsed / 1000)).toFixed(2);
      console.log(`✓ Generated ${i} chapters (${rate} chapters/sec)`);
      
      // Show pool stats
      const stats = OptimizedPoolManager.getPoolStats();
      console.log(`  Pool Stats: ${Object.keys(stats).length} pools registered`);
    }
  }
  
  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;
  const avgRate = (TEST_CONFIG.totalChapters / totalTime).toFixed(2);
  
  // Calculate statistics
  const titleUniqueness = ((uniqueTitles.size / TEST_CONFIG.totalChapters) * 100).toFixed(2);
  
  // Get final pool stats
  const finalPoolStats = OptimizedPoolManager.getPoolStats();
  
  // Display results
  console.log('\n========================================');
  console.log('TEST RESULTS');
  console.log('========================================\n');
  
  console.log('Performance:');
  console.log(`  Total Time: ${totalTime.toFixed(2)} seconds`);
  console.log(`  Average Rate: ${avgRate} chapters/sec`);
  console.log(`  Time per Chapter: ${(totalTime / TEST_CONFIG.totalChapters * 1000).toFixed(2)} ms`);
  
  console.log('\nTitle Uniqueness:');
  console.log(`  Unique Titles: ${uniqueTitles.size}/${TEST_CONFIG.totalChapters}`);
  console.log(`  Duplicate Titles: ${duplicateTitles.length}`);
  console.log(`  Uniqueness Rate: ${titleUniqueness}%`);
  
  console.log('\nParagraph Uniqueness:');
  console.log(`  Unique Paragraphs: ${uniqueParagraphs.size}`);
  console.log(`  Duplicate Paragraphs: ${duplicateParagraphs.length}`);
  
  console.log('\nPool Expansion Statistics:');
  console.log(`  Pools Registered: ${Object.keys(finalPoolStats).length}`);
  for (const [poolName, stats] of Object.entries(finalPoolStats)) {
    console.log(`  ${poolName}:`);
    console.log(`    Items: ${stats.itemCount}`);
    console.log(`    Used: ${stats.usedItems}`);
    console.log(`    Available: ${stats.availableItems}`);
    console.log(`    Available Ratio: ${(stats.availableRatio * 100).toFixed(1)}%`);
    console.log(`    Expansions: ${stats.expansionCount}`);
  }
  
  // Final verdict
  console.log('\n========================================');
  console.log('FINAL VERDICT');
  console.log('========================================\n');
  
  const titleSuccess = uniqueTitles.size === TEST_CONFIG.totalChapters;
  const paragraphSuccess = duplicateParagraphs.length === 0;
  const performanceSuccess = parseFloat(avgRate) > 1000;
  
  if (titleSuccess && paragraphSuccess && performanceSuccess) {
    console.log('✅ SUCCESS: All criteria met!');
    console.log(`   - ${TEST_CONFIG.totalChapters} unique titles (100%)`);
    console.log(`   - ${uniqueParagraphs.size} unique paragraphs`);
    console.log(`   - Performance: ${avgRate} chapters/sec (>1000)`);
    console.log(`   - Pool expansion working correctly`);
  } else {
    console.log('❌ FAILURE: Criteria not met');
    if (!titleSuccess) {
      console.log(`   - Only ${uniqueTitles.size}/${TEST_CONFIG.totalChapters} unique titles`);
    }
    if (!paragraphSuccess) {
      console.log(`   - ${duplicateParagraphs.length} duplicate paragraphs found`);
    }
    if (!performanceSuccess) {
      console.log(`   - Performance: ${avgRate} chapters/sec (<1000)`);
    }
  }
  
  console.log('\n========================================\n');
  
  // Return test results
  return {
    success: titleSuccess && paragraphSuccess && performanceSuccess,
    totalChapters: TEST_CONFIG.totalChapters,
    uniqueTitles: uniqueTitles.size,
    duplicateTitles: duplicateTitles.length,
    uniqueParagraphs: uniqueParagraphs.size,
    duplicateParagraphs: duplicateParagraphs.length,
    titleUniqueness: parseFloat(titleUniqueness),
    totalTime: totalTime,
    avgRate: parseFloat(avgRate),
    performanceSuccess: performanceSuccess,
    poolStats: finalPoolStats
  };
}

// Run the test
runTest()
  .then(results => {
    console.log('Test completed successfully');
    process.exit(results.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
  });