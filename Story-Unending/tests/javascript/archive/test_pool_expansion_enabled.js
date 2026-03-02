/**
 * Test pool expansion and uniqueness tracking with systems enabled
 */

// Mock browser environment
global.localStorage = {
  getItem: (key) => null,
  setItem: (key, value) => {},
  removeItem: (key) => {},
  clear: () => {}
};

global.window = {
  currentTextSize: 16,
  localStorage: global.localStorage
};

console.log('='.repeat(80));
console.log('POOL EXPANSION AND UNIQUENESS TRACKING TEST');
console.log('='.repeat(80));

// Load modules in correct order
console.log('\nLoading modules...');

// 1. Load backstory engine
console.log('  1. Loading backstory-engine.js...');
global.BackstoryEngine = require('./backstory-engine.js');

// 2. Load story engine
console.log('  2. Loading story-engine.js...');
const StoryEngine = require('./story-engine.js');

// 3. Load web content discovery
console.log('  3. Loading js/web-content-discovery.js...');
global.WebContentDiscovery = require('./js/web-content-discovery.js');

// 4. Load dynamic pool expansion
console.log('  4. Loading js/dynamic-pool-expansion.js...');
global.DynamicPoolExpansion = require('./js/dynamic-pool-expansion.js');

// 5. Load uniqueness tracker
console.log('  5. Loading js/uniqueness-tracker.js...');
global.UniquenessTracker = require('./js/uniqueness-tracker.js');

// 6. Load ever-expanding integration
console.log('  6. Loading js/ever-expanding-integration.js...');
global.EverExpandingIntegration = require('./js/ever-expanding-integration.js');

console.log('  ✓ All modules loaded successfully\n');

// Initialize the ever-expanding integration
console.log('Initializing ever-expanding integration...');
EverExpandingIntegration.initialize(StoryEngine, {
  enableWebSearch: false, // Disable web search for testing
  enablePoolExpansion: true,
  enableUniquenessTracking: true,
  expansionCount: 10, // Smaller for testing
  autoExpand: true,
  persistData: false, // Disable persistence for testing
  maxPoolSize: 1000
});
console.log('  ✓ Integration initialized\n');

// Test 1: Generate chapters and check for duplicates
console.log('Test 1: Generating 100 chapters with pool expansion enabled...');
const chapterIds = new Set();
const chapterTitles = new Set();
const duplicateTitles = [];

for (let i = 1; i <= 100; i++) {
  const chapter = StoryEngine.generateChapter();
  
  // Track chapter ID
  if (chapterIds.has(chapter.id)) {
    console.log(`  ⚠ Duplicate chapter ID at ${i}: ${chapter.id}`);
  } else {
    chapterIds.add(chapter.id);
  }
  
  // Track title
  if (chapterTitles.has(chapter.title)) {
    duplicateTitles.push({
      chapter: i,
      title: chapter.title
    });
  } else {
    chapterTitles.add(chapter.title);
  }
  
  if (i % 20 === 0) {
    console.log(`  Progress: ${i}/100 chapters`);
  }
}

console.log(`  ✓ Generated 100 chapters\n`);

// Test 2: Check uniqueness stats
console.log('Test 2: Checking uniqueness statistics...');
const uniquenessStats = UniquenessTracker.getGlobalStats();
console.log(`  Total content tracked: ${uniquenessStats.totalContent}`);
console.log(`  Total usage: ${uniquenessStats.totalUsage}`);
console.log(`  Similarity index size: ${uniquenessStats.similarityIndexSize}\n`);

// Test 3: Check pool expansion stats
console.log('Test 3: Checking pool expansion statistics...');
const poolStats = DynamicPoolExpansion.getPoolStats();
console.log(`  Registered pools: ${Object.keys(poolStats).length}`);
for (const [poolName, stats] of Object.entries(poolStats)) {
  console.log(`  - ${poolName}: ${stats.itemCount} items, expanded ${stats.expansionCount} times`);
}
console.log();

// Test 4: Check integration stats
console.log('Test 4: Checking integration statistics...');
const integrationStats = EverExpandingIntegration.getStats();
console.log(`  Initialized: ${integrationStats.initialized}`);
console.log(`  Expansion enabled: ${integrationStats.expansionEnabled}`);
console.log(`  Auto-expand: ${integrationStats.autoExpand}`);
if (integrationStats.uniqueness) {
  console.log(`  Uniqueness tracking: Active`);
}
if (integrationStats.pools) {
  console.log(`  Pool expansion: Active`);
}
console.log();

// Results summary
console.log('='.repeat(80));
console.log('RESULTS SUMMARY');
console.log('='.repeat(80));
console.log(`\nUnique Chapter IDs: ${chapterIds.size} out of 100`);
console.log(`Unique Titles: ${chapterTitles.size} out of 100`);
console.log(`Duplicate Titles: ${duplicateTitles.length}`);
console.log(`\nPool Expansion: ${Object.keys(poolStats).length} pools registered`);
console.log(`Uniqueness Tracking: ${uniquenessStats.totalContent} items tracked\n`);

if (duplicateTitles.length > 0) {
  console.log('Duplicate titles found:');
  duplicateTitles.slice(0, 10).forEach(dup => {
    console.log(`  - Chapter ${dup.chapter}: "${dup.title}"`);
  });
  if (duplicateTitles.length > 10) {
    console.log(`  ... and ${duplicateTitles.length - 10} more`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('TEST COMPLETE');
console.log('='.repeat(80));