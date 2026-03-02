/**
 * Test Unified Pool Manager
 * Verifies that the unified pool manager works correctly
 */

const UnifiedPoolManager = require('../../js/unified-pool-manager.js');

async function runTests() {
  console.log('=== Unified Pool Manager Tests ===\n');
  
  let passedTests = 0;
  let failedTests = 0;
  
  // Test 1: Initialize
  console.log('Test 1: Initialize');
  try {
    UnifiedPoolManager.initialize({
      testPool: {
        items: ['item1', 'item2', 'item3'],
        type: 'generic',
        category: 'test'
      }
    });
    console.log('✓ PASS: Initialized successfully\n');
    passedTests++;
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 2: Register Pool
  console.log('Test 2: Register Pool');
  try {
    UnifiedPoolManager.registerPool('testPool2', {
      items: ['item4', 'item5', 'item6'],
      type: 'generic',
      category: 'test'
    });
    const pool = UnifiedPoolManager.getPool('testPool2');
    if (pool && pool.items.length === 3) {
      console.log('✓ PASS: Pool registered successfully\n');
      passedTests++;
    } else {
      console.log('✗ FAIL: Pool not registered correctly\n');
      failedTests++;
    }
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 3: Get Pool Stats
  console.log('Test 3: Get Pool Stats');
  try {
    const stats = UnifiedPoolManager.getPoolStats('testPool');
    if (stats && stats.totalItems === 3) {
      console.log('✓ PASS: Pool stats retrieved successfully\n');
      passedTests++;
    } else {
      console.log('✗ FAIL: Pool stats incorrect\n');
      failedTests++;
    }
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 4: Get All Pool Stats
  console.log('Test 4: Get All Pool Stats');
  try {
    const stats = UnifiedPoolManager.getPoolStats();
    if (stats && stats.testPool && stats.testPool2) {
      console.log('✓ PASS: All pool stats retrieved successfully\n');
      passedTests++;
    } else {
      console.log('✗ FAIL: All pool stats incorrect\n');
      failedTests++;
    }
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 5: Needs Expansion
  console.log('Test 5: Needs Expansion');
  try {
    const needsExpansion = UnifiedPoolManager.needsExpansion('testPool');
    console.log('✓ PASS: Needs expansion check completed:', needsExpansion, '\n');
    passedTests++;
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 6: Check All Pools For Expansion
  console.log('Test 6: Check All Pools For Expansion');
  try {
    const poolsNeedingExpansion = UnifiedPoolManager.checkAllPoolsForExpansion();
    console.log('✓ PASS: Check all pools completed:', poolsNeedingExpansion.length, 'pools need expansion\n');
    passedTests++;
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 7: Get Unique Item
  console.log('Test 7: Get Unique Item');
  try {
    const item = UnifiedPoolManager.getUniqueItem('testPool');
    if (item) {
      console.log('✓ PASS: Unique item retrieved:', item, '\n');
      passedTests++;
    } else {
      console.log('✗ FAIL: No unique item retrieved\n');
      failedTests++;
    }
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 8: Story Engine Integration - Get Adjectives
  console.log('Test 8: Story Engine Integration - Get Adjectives');
  try {
    const adjectives = UnifiedPoolManager.getAdjectives();
    if (adjectives && adjectives.length > 0) {
      console.log('✓ PASS: Adjectives retrieved:', adjectives.length, 'adjectives\n');
      passedTests++;
    } else {
      console.log('✗ FAIL: No adjectives retrieved\n');
      failedTests++;
    }
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 9: Story Engine Integration - Get Nouns
  console.log('Test 9: Story Engine Integration - Get Nouns');
  try {
    const nouns = UnifiedPoolManager.getNouns();
    if (nouns && nouns.length > 0) {
      console.log('✓ PASS: Nouns retrieved:', nouns.length, 'nouns\n');
      passedTests++;
    } else {
      console.log('✗ FAIL: No nouns retrieved\n');
      failedTests++;
    }
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 10: Story Engine Integration - Get Actions
  console.log('Test 10: Story Engine Integration - Get Actions');
  try {
    const actions = UnifiedPoolManager.getActions();
    if (actions && actions.length > 0) {
      console.log('✓ PASS: Actions retrieved:', actions.length, 'actions\n');
      passedTests++;
    } else {
      console.log('✗ FAIL: No actions retrieved\n');
      failedTests++;
    }
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 11: Story Engine Integration - Get Patterns
  console.log('Test 11: Story Engine Integration - Get Patterns');
  try {
    const patterns = UnifiedPoolManager.getPatterns();
    if (patterns && patterns.length > 0) {
      console.log('✓ PASS: Patterns retrieved:', patterns.length, 'patterns\n');
      passedTests++;
    } else {
      console.log('✗ FAIL: No patterns retrieved\n');
      failedTests++;
    }
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 12: Get Statistics
  console.log('Test 12: Get Statistics');
  try {
    const stats = UnifiedPoolManager.getStats();
    if (stats && stats.totalPools > 0) {
      console.log('✓ PASS: Statistics retrieved:', stats.totalPools, 'pools\n');
      passedTests++;
    } else {
      console.log('✗ FAIL: No statistics retrieved\n');
      failedTests++;
    }
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 13: Update Configuration
  console.log('Test 13: Update Configuration');
  try {
    UnifiedPoolManager.updateConfig({ expansionCount: 50 });
    const config = UnifiedPoolManager.getConfig();
    if (config.expansionCount === 50) {
      console.log('✓ PASS: Configuration updated successfully\n');
      passedTests++;
    } else {
      console.log('✗ FAIL: Configuration not updated\n');
      failedTests++;
    }
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 14: Is Integrated
  console.log('Test 14: Is Integrated');
  try {
    const isIntegrated = UnifiedPoolManager.isIntegrated();
    if (isIntegrated) {
      console.log('✓ PASS: Pool manager is integrated\n');
      passedTests++;
    } else {
      console.log('✗ FAIL: Pool manager is not integrated\n');
      failedTests++;
    }
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 15: Sync Pools To Story Engine
  console.log('Test 15: Sync Pools To Story Engine');
  try {
    UnifiedPoolManager.syncPoolsToStoryEngine();
    console.log('✓ PASS: Pools synced to story engine\n');
    passedTests++;
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Summary
  console.log('=== Test Summary ===');
  console.log('Total Tests:', passedTests + failedTests);
  console.log('Passed:', passedTests);
  console.log('Failed:', failedTests);
  console.log('Success Rate:', ((passedTests / (passedTests + failedTests)) * 100).toFixed(2) + '%');
  
  if (failedTests === 0) {
    console.log('\n✓ All tests passed!');
  } else {
    console.log('\n✗ Some tests failed');
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});