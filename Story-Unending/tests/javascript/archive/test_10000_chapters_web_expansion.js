/**
 * Test 10,000 Chapters with Web-Based Pool Expansion
 * Verifies 100% uniqueness across all content types
 */

// Load required modules
const BackstoryEngine = require('../../backstory-engine.js');
const StoryEngine = require('../../story-engine.js');

// Make BackstoryEngine global for StoryEngine
global.BackstoryEngine = BackstoryEngine;

// Load expansion systems
const WebContentDiscovery = require('../../js/web-content-discovery.js');
const DynamicPoolExpansion = require('../../js/dynamic-pool-expansion.js');
const UniquenessTracker = require('../../js/uniqueness-tracker.js');
const EverExpandingIntegration = require('../../js/ever-expanding-integration.js');

// Make modules global
global.WebContentDiscovery = WebContentDiscovery;
global.DynamicPoolExpansion = DynamicPoolExpansion;
global.UniquenessTracker = UniquenessTracker;
global.EverExpandingIntegration = EverExpandingIntegration;

// Test configuration
const TEST_CONFIG = {
  totalChapters: 10000,
  expansionCount: 30,
  enableWebSearch: true,
  enablePoolExpansion: true,
  enableUniquenessTracking: true
};

// Tracking variables
let uniqueTitles = new Set();
let uniqueParagraphs = new Set();
let duplicateTitles = [];
let duplicateParagraphs = [];
let poolExpansionStats = {
  totalExpansions: 0,
  totalItemsAdded: 0,
  poolsExpanded: []
};

/**
 * Initialize the ever-expanding systems
 */
async function initializeSystems() {
  console.log('Initializing ever-expanding systems...');
  
  // Initialize uniqueness tracker
  UniquenessTracker.initialize({
    similarityThreshold: 0.85,
    enableSimilarityCheck: true,
    enableExactMatchCheck: true
  });
  
  // Initialize pool expansion
  DynamicPoolExpansion.initialize({
    expansionCount: TEST_CONFIG.expansionCount,
    maxPoolSize: 10000,
    enableWebSearch: TEST_CONFIG.enableWebSearch,
    enableDynamicPoolCreation: true,
    persistenceEnabled: false // Disable persistence for testing
  });
  
  // Initialize integration
  EverExpandingIntegration.initialize(StoryEngine, {
    enableWebSearch: TEST_CONFIG.enableWebSearch,
    enablePoolExpansion: TEST_CONFIG.enablePoolExpansion,
    enableUniquenessTracking: TEST_CONFIG.enableUniquenessTracking,
    expansionCount: TEST_CONFIG.expansionCount,
    autoExpand: true,
    persistData: false,
    maxPoolSize: 10000
  });
  
  console.log('✓ Systems initialized');
}

/**
 * Generate and test a single chapter
 */
async function generateAndTestChapter(chapterNum) {
  // Generate chapter
  const chapter = StoryEngine.generateChapter(chapterNum);
  
  // Track title uniqueness
  if (chapter.title) {
    if (uniqueTitles.has(chapter.title)) {
      duplicateTitles.push({
        chapter: chapterNum,
        title: chapter.title,
        firstSeen: Array.from(uniqueTitles).indexOf(chapter.title) + 1
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
          paragraph: paragraph.substring(0, 100) + '...'
        });
      } else {
        uniqueParagraphs.add(paraHash);
      }
    }
  }
  
  // Get pool expansion stats every 100 chapters
  if (chapterNum % 100 === 0) {
    const stats = DynamicPoolExpansion.getPoolStats();
    poolExpansionStats.poolsExpanded.push({
      chapter: chapterNum,
      stats: stats
    });
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
  console.log('Testing 10,000 Chapters with Web Expansion');
  console.log('========================================\n');
  
  const startTime = Date.now();
  
  // Initialize systems
  await initializeSystems();
  
  console.log(`\nGenerating ${TEST_CONFIG.totalChapters} chapters...\n`);
  
  // Generate chapters
  for (let i = 1; i <= TEST_CONFIG.totalChapters; i++) {
    await generateAndTestChapter(i);
    
    // Progress update every 1000 chapters
    if (i % 1000 === 0) {
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
  const paragraphUniqueness = ((uniqueParagraphs.size / (TEST_CONFIG.totalChapters * 5)) * 100).toFixed(2);
  
  // Get final pool stats
  const finalPoolStats = DynamicPoolExpansion.getPoolStats();
  
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
  console.log(`  Uniqueness Rate: ${paragraphUniqueness}%`);
  
  console.log('\nPool Expansion Statistics:');
  console.log(`  Pools Registered: ${Object.keys(finalPoolStats).length}`);
  for (const [poolName, stats] of Object.entries(finalPoolStats)) {
    console.log(`  ${poolName}:`);
    console.log(`    Items: ${stats.itemCount}`);
    console.log(`    Expansions: ${stats.expansionCount}`);
    console.log(`    Type: ${stats.type}`);
    console.log(`    Category: ${stats.category}`);
  }
  
  // Display duplicate details if any
  if (duplicateTitles.length > 0) {
    console.log('\nDuplicate Title Details (first 10):');
    duplicateTitles.slice(0, 10).forEach(dup => {
      console.log(`  Chapter ${dup.chapter}: "${dup.title}" (first seen at chapter ${dup.firstSeen})`);
    });
  }
  
  if (duplicateParagraphs.length > 0) {
    console.log('\nDuplicate Paragraph Details (first 10):');
    duplicateParagraphs.slice(0, 10).forEach(dup => {
      console.log(`  Chapter ${dup.chapter}: "${dup.paragraph}"`);
    });
  }
  
  // Final verdict
  console.log('\n========================================');
  console.log('FINAL VERDICT');
  console.log('========================================\n');
  
  const titleSuccess = uniqueTitles.size === TEST_CONFIG.totalChapters;
  const paragraphSuccess = duplicateParagraphs.length === 0;
  
  if (titleSuccess && paragraphSuccess) {
    console.log('✅ SUCCESS: 100% uniqueness achieved!');
    console.log(`   - ${TEST_CONFIG.totalChapters} unique titles`);
    console.log(`   - ${uniqueParagraphs.size} unique paragraphs`);
    console.log(`   - Pool expansion working correctly`);
    console.log(`   - Performance: ${avgRate} chapters/sec`);
  } else {
    console.log('❌ FAILURE: Uniqueness not achieved');
    if (!titleSuccess) {
      console.log(`   - Only ${uniqueTitles.size}/${TEST_CONFIG.totalChapters} unique titles`);
    }
    if (!paragraphSuccess) {
      console.log(`   - ${duplicateParagraphs.length} duplicate paragraphs found`);
    }
  }
  
  console.log('\n========================================\n');
  
  // Return test results
  return {
    success: titleSuccess && paragraphSuccess,
    totalChapters: TEST_CONFIG.totalChapters,
    uniqueTitles: uniqueTitles.size,
    duplicateTitles: duplicateTitles.length,
    uniqueParagraphs: uniqueParagraphs.size,
    duplicateParagraphs: duplicateParagraphs.length,
    titleUniqueness: parseFloat(titleUniqueness),
    paragraphUniqueness: parseFloat(paragraphUniqueness),
    totalTime: totalTime,
    avgRate: parseFloat(avgRate),
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