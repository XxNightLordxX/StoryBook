/**
 * Simple test to verify pool expansion and uniqueness tracking systems are loaded
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
console.log('SYSTEMS LOADED TEST');
console.log('='.repeat(80));

// Load modules
console.log('\nLoading modules...');

console.log('  1. Loading backstory-engine.js...');
global.BackstoryEngine = require('./backstory-engine.js');

console.log('  2. Loading story-engine.js...');
const StoryEngine = require('./story-engine.js');

console.log('  3. Loading js/web-content-discovery.js...');
global.WebContentDiscovery = require('./js/web-content-discovery.js');

console.log('  4. Loading js/dynamic-pool-expansion.js...');
global.DynamicPoolExpansion = require('./js/dynamic-pool-expansion.js');

console.log('  5. Loading js/uniqueness-tracker.js...');
global.UniquenessTracker = require('./js/uniqueness-tracker.js');

console.log('  6. Loading js/ever-expanding-integration.js...');
global.EverExpandingIntegration = require('./js/ever-expanding-integration.js');

console.log('  ✓ All modules loaded\n');

// Check if systems are available
console.log('Checking systems availability...');
console.log(`  StoryEngine: ${typeof StoryEngine !== 'undefined' ? '✓' : '✗'}`);
console.log(`  WebContentDiscovery: ${typeof WebContentDiscovery !== 'undefined' ? '✓' : '✗'}`);
console.log(`  DynamicPoolExpansion: ${typeof DynamicPoolExpansion !== 'undefined' ? '✓' : '✗'}`);
console.log(`  UniquenessTracker: ${typeof UniquenessTracker !== 'undefined' ? '✓' : '✗'}`);
console.log(`  EverExpandingIntegration: ${typeof EverExpandingIntegration !== 'undefined' ? '✓' : '✗'}`);
console.log();

// Initialize the integration
console.log('Initializing ever-expanding integration...');
try {
  EverExpandingIntegration.initialize(StoryEngine, {
    enableWebSearch: false,
    enablePoolExpansion: true,
    enableUniquenessTracking: true,
    expansionCount: 5,
    autoExpand: true,
    persistData: false,
    maxPoolSize: 100
  });
  console.log('  ✓ Integration initialized\n');
} catch (error) {
  console.log(`  ✗ Initialization failed: ${error.message}\n`);
}

// Generate a few chapters to test
console.log('Generating 5 chapters to test...');
for (let i = 1; i <= 5; i++) {
  const chapter = StoryEngine.generateChapter();
  console.log(`  Chapter ${i}: "${chapter.title}" (ID: ${chapter.id})`);
}
console.log();

// Check stats
console.log('Checking statistics...');
const uniquenessStats = UniquenessTracker.getGlobalStats();
console.log(`  Uniqueness tracker: ${uniquenessStats.totalContent} items tracked`);

const poolStats = DynamicPoolExpansion.getPoolStats();
console.log(`  Pool expansion: ${Object.keys(poolStats).length} pools registered`);

const integrationStats = EverExpandingIntegration.getStats();
console.log(`  Integration: ${integrationStats.initialized ? 'initialized' : 'not initialized'}`);
console.log();

console.log('='.repeat(80));
console.log('TEST COMPLETE');
console.log('='.repeat(80));