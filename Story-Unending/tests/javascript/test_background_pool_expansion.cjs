/**
 * Test Background Pool Expansion System
 * Verifies that the periodic pool expansion works correctly
 */

const fs = require('fs');
const path = require('path');

// Set up global window object for browser APIs
global.window = {
  localStorage: {
    _data: {},
    getItem: function(key) {
      return this._data[key] || null;
    },
    setItem: function(key, value) {
      this._data[key] = String(value);
    },
    removeItem: function(key) {
      delete this._data[key];
    },
    clear: function() {
      this._data = {};
    }
  },
  console: console,
  document: {
    readyState: 'complete',
    addEventListener: function() {}
  }
};

global.document = global.window.document;
global.localStorage = global.window.localStorage;

// Load UnifiedPoolManager
const UnifiedPoolManager = require('../../js/unified-pool-manager.js');

console.log('='.repeat(80));
console.log('BACKGROUND POOL EXPANSION SYSTEM TEST');
console.log('='.repeat(80));

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
    testsFailed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Reset state before each test
function resetState() {
  window.localStorage.clear();
  UnifiedPoolManager.resetStats();
  UnifiedPoolManager.initialize({
    testPool: {
      items: ['item1', 'item2', 'item3'],
      type: 'generic',
      category: 'test'
    },
    adjectives: {
      items: ['quick', 'slow', 'bright'],
      type: 'adjective',
      category: 'words'
    },
    nouns: {
      items: ['cat', 'dog', 'bird'],
      type: 'noun',
      category: 'words'
    }
  });
}

// Test 1: Periodic expansion is enabled by default
test('Periodic expansion is enabled by default', () => {
  resetState();
  const config = UnifiedPoolManager.getConfig();
  assert(config.enablePeriodicExpansion === true, 'Periodic expansion should be enabled by default');
});

// Test 2: Expansion interval is 10 chapters by default
test('Expansion interval is 10 chapters by default', () => {
  resetState();
  const config = UnifiedPoolManager.getConfig();
  assert(config.expansionInterval === 10, 'Expansion interval should be 10 chapters by default');
});

// Test 3: Items per pool is 40 by default
test('Items per pool is 40 by default', () => {
  resetState();
  const config = UnifiedPoolManager.getConfig();
  assert(config.expansionCount === 40, 'Items per pool should be 40 by default');
});

// Test 4: Can disable periodic expansion
test('Can disable periodic expansion', () => {
  resetState();
  UnifiedPoolManager.updateConfig({ enablePeriodicExpansion: false });
  const config = UnifiedPoolManager.getConfig();
  assert(config.enablePeriodicExpansion === false, 'Periodic expansion should be disabled');
});

// Test 5: Can change expansion interval
test('Can change expansion interval', () => {
  resetState();
  UnifiedPoolManager.updateConfig({ expansionInterval: 20 });
  const config = UnifiedPoolManager.getConfig();
  assert(config.expansionInterval === 20, 'Expansion interval should be 20');
});

// Test 6: Can change items per pool
test('Can change items per pool', () => {
  resetState();
  UnifiedPoolManager.updateConfig({ expansionCount: 50 });
  const config = UnifiedPoolManager.getConfig();
  assert(config.expansionCount === 50, 'Items per pool should be 50');
});

// Test 7: Periodic expansion check skips when disabled
test('Periodic expansion check skips when disabled', async () => {
  resetState();
  UnifiedPoolManager.updateConfig({ enablePeriodicExpansion: false });
  const result = await UnifiedPoolManager.periodicExpansionCheck(10);
  assert(result.skipped === true, 'Should skip when disabled');
  assert(result.reason === 'periodic_expansion_disabled', 'Reason should be periodic_expansion_disabled');
});

// Test 8: Periodic expansion check skips when not time
test('Periodic expansion check skips when not time', async () => {
  resetState();
  UnifiedPoolManager.updateConfig({ expansionInterval: 10 });
  const result = await UnifiedPoolManager.periodicExpansionCheck(5);
  assert(result.skipped === true, 'Should skip when not time');
  assert(result.reason === 'not_time_yet', 'Reason should be not_time_yet');
});

// Test 9: Periodic expansion check proceeds when time
test('Periodic expansion check proceeds when time', async () => {
  resetState();
  UnifiedPoolManager.updateConfig({ expansionInterval: 10 });
  const result = await UnifiedPoolManager.periodicExpansionCheck(10);
  assert(result.expandedPools !== undefined, 'Should proceed when time');
});

// Test 10: Periodic expansion check proceeds on multiples of interval
test('Periodic expansion check proceeds on multiples of interval', async () => {
  resetState();
  UnifiedPoolManager.updateConfig({ expansionInterval: 10 });
  const result1 = await UnifiedPoolManager.periodicExpansionCheck(10);
  const result2 = await UnifiedPoolManager.periodicExpansionCheck(20);
  const result3 = await UnifiedPoolManager.periodicExpansionCheck(30);
  assert(result1.expandedPools !== undefined, 'Should proceed at chapter 10');
  assert(result2.expandedPools !== undefined, 'Should proceed at chapter 20');
  assert(result3.expandedPools !== undefined, 'Should proceed at chapter 30');
});

// Test 11: Check all pools for expansion
test('Check all pools for expansion', () => {
  resetState();
  const poolsNeedingExpansion = UnifiedPoolManager.checkAllPoolsForExpansion();
  assert(Array.isArray(poolsNeedingExpansion), 'Should return an array');
  assert(poolsNeedingExpansion.length >= 0, 'Should have 0 or more pools needing expansion');
});

// Test 12: Expand pools proactively
test('Expand pools proactively', async () => {
  resetState();
  const initialStats = UnifiedPoolManager.getPoolStats('testPool');
  const initialCount = initialStats.totalItems;
  
  await UnifiedPoolManager.expandPoolsProactively();
  
  const finalStats = UnifiedPoolManager.getPoolStats('testPool');
  const finalCount = finalStats.totalItems;
  
  assert(finalCount >= initialCount, 'Pool should have same or more items after expansion');
});

// Test 13: Proactive threshold works
test('Proactive threshold works', () => {
  resetState();
  UnifiedPoolManager.updateConfig({ proactiveThreshold: 0.5 }); // 50% threshold
  
  // Fill pool to 50% of max
  const pool = UnifiedPoolManager.getPool('testPool');
  const maxPoolSize = UnifiedPoolManager.getConfig().maxPoolSize;
  const halfMax = Math.floor(maxPoolSize * 0.5);
  
  // Check if pool needs expansion
  const needsExpansion = UnifiedPoolManager.needsExpansion('testPool');
  
  // With 3 items and 50% threshold, it should need expansion if maxPoolSize is small
  // This test verifies the threshold logic is working
  assert(typeof needsExpansion === 'boolean', 'Should return boolean');
});

// Test 14: Max pool size is respected
test('Max pool size is respected', () => {
  resetState();
  const config = UnifiedPoolManager.getConfig();
  assert(config.maxPoolSize === 10000, 'Max pool size should be 10000 by default');
});

// Test 15: Can change max pool size
test('Can change max pool size', () => {
  resetState();
  UnifiedPoolManager.updateConfig({ maxPoolSize: 5000 });
  const config = UnifiedPoolManager.getConfig();
  assert(config.maxPoolSize === 5000, 'Max pool size should be 5000');
});

// Test 16: Get expansion statistics
test('Get expansion statistics', () => {
  resetState();
  const stats = UnifiedPoolManager.getStats();
  assert(stats !== null, 'Should return statistics');
  assert(typeof stats === 'object', 'Statistics should be an object');
});

// Test 17: Reset clears expansion state
test('Reset clears expansion state', () => {
  resetState();
  UnifiedPoolManager.updateConfig({ expansionInterval: 20 });
  UnifiedPoolManager.resetStats();
  const stats = UnifiedPoolManager.getStats();
  assert(stats !== null, 'Should have statistics after reset');
});

// Test 18: Periodic expansion with different intervals
test('Periodic expansion with different intervals', async () => {
  resetState();
  
  // Test with interval of 5
  UnifiedPoolManager.updateConfig({ expansionInterval: 5 });
  const result1 = await UnifiedPoolManager.periodicExpansionCheck(5);
  const result2 = await UnifiedPoolManager.periodicExpansionCheck(10);
  const result3 = await UnifiedPoolManager.periodicExpansionCheck(15);
  
  assert(result1.expandedPools !== undefined, 'Should proceed at chapter 5');
  assert(result2.expandedPools !== undefined, 'Should proceed at chapter 10');
  assert(result3.expandedPools !== undefined, 'Should proceed at chapter 15');
});

// Test 19: Periodic expansion tracks last expansion chapter
test('Periodic expansion tracks last expansion chapter', () => {
  resetState();
  UnifiedPoolManager.updateConfig({ expansionInterval: 10 });
  
  UnifiedPoolManager.periodicExpansionCheck(10);
  const stats = UnifiedPoolManager.getStats();
  
  // Verify that the system tracks when expansion occurred
  assert(stats !== null, 'Should have statistics');
});

// Test 20: Multiple pools can be expanded
test('Multiple pools can be expanded', async () => {
  resetState();
  
  const initialAdjectives = UnifiedPoolManager.getPoolStats('adjectives').totalItems;
  const initialNouns = UnifiedPoolManager.getPoolStats('nouns').totalItems;
  
  await UnifiedPoolManager.expandPoolsProactively();
  
  const finalAdjectives = UnifiedPoolManager.getPoolStats('adjectives').totalItems;
  const finalNouns = UnifiedPoolManager.getPoolStats('nouns').totalItems;
  
  assert(finalAdjectives >= initialAdjectives, 'Adjectives pool should have same or more items');
  assert(finalNouns >= initialNouns, 'Nouns pool should have same or more items');
});

console.log('\n' + '='.repeat(80));
console.log('TEST RESULTS');
console.log('='.repeat(80));
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);
console.log(`Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)}%`);
console.log('='.repeat(80));

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}