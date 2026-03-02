/**
 * Test Unified AI Generator
 * Verifies that the unified AI generator works correctly
 */

const UnifiedAIGenerator = require('../../js/unified-ai-generator.js');

async function runTests() {
  console.log('=== Unified AI Generator Tests ===\n');
  
  let passedTests = 0;
  let failedTests = 0;
  
  // Test 1: Initialize
  console.log('Test 1: Initialize');
  try {
    await UnifiedAIGenerator.initialize({
      aiPercentage: 40,
      enableLogging: false
    });
    console.log('✓ PASS: Initialized successfully\n');
    passedTests++;
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 2: Detect Browser Capabilities
  console.log('Test 2: Detect Browser Capabilities');
  try {
    const capabilities = UnifiedAIGenerator.detectBrowserCapabilities();
    if (capabilities) {
      console.log('✓ PASS: Browser capabilities detected:', capabilities.browser, '\n');
      passedTests++;
    } else {
      console.log('✗ FAIL: No capabilities detected\n');
      failedTests++;
    }
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 3: Is Enabled
  console.log('Test 3: Is Enabled');
  try {
    const isEnabled = UnifiedAIGenerator.isEnabled();
    console.log('✓ PASS: Is enabled check completed:', isEnabled, '\n');
    passedTests++;
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 4: Is WebGPU Supported
  console.log('Test 4: Is WebGPU Supported');
  try {
    const isWebGPUSupported = UnifiedAIGenerator.isWebGPUSupported();
    console.log('✓ PASS: WebGPU support check completed:', isWebGPUSupported, '\n');
    passedTests++;
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 5: Is WebAssembly Supported
  console.log('Test 5: Is WebAssembly Supported');
  try {
    const isWebAssemblySupported = UnifiedAIGenerator.isWebAssemblySupported();
    console.log('✓ PASS: WebAssembly support check completed:', isWebAssemblySupported, '\n');
    passedTests++;
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 6: Get Loading Progress
  console.log('Test 6: Get Loading Progress');
  try {
    const progress = UnifiedAIGenerator.getLoadingProgress();
    console.log('✓ PASS: Loading progress retrieved:', progress, '\n');
    passedTests++;
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 7: Get Available Models
  console.log('Test 7: Get Available Models');
  try {
    const models = UnifiedAIGenerator.getAvailableModels();
    console.log('✓ PASS: Available models retrieved:', models.length, 'models\n');
    passedTests++;
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 8: Should Use AI
  console.log('Test 8: Should Use AI');
  try {
    const shouldUseAI = UnifiedAIGenerator.shouldUseAI(1, 'body');
    console.log('✓ PASS: Should use AI check completed:', shouldUseAI, '\n');
    passedTests++;
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 9: Get Statistics
  console.log('Test 9: Get Statistics');
  try {
    const stats = UnifiedAIGenerator.getStats();
    if (stats) {
      console.log('✓ PASS: Statistics retrieved\n');
      passedTests++;
    } else {
      console.log('✗ FAIL: No statistics retrieved\n');
      failedTests++;
    }
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 10: Get Configuration
  console.log('Test 10: Get Configuration');
  try {
    const config = UnifiedAIGenerator.getConfig();
    if (config) {
      console.log('✓ PASS: Configuration retrieved\n');
      passedTests++;
    } else {
      console.log('✗ FAIL: No configuration retrieved\n');
      failedTests++;
    }
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 11: Set AI Percentage
  console.log('Test 11: Set AI Percentage');
  try {
    UnifiedAIGenerator.setAIPercentage(50);
    const percentage = UnifiedAIGenerator.getAIPercentage();
    if (percentage === 50) {
      console.log('✓ PASS: AI percentage set successfully\n');
      passedTests++;
    } else {
      console.log('✗ FAIL: AI percentage not set correctly\n');
      failedTests++;
    }
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 12: Set AI Enabled
  console.log('Test 12: Set AI Enabled');
  try {
    UnifiedAIGenerator.setAIEnabled(true);
    const isEnabled = UnifiedAIGenerator.isAIEnabled();
    console.log('✓ PASS: AI enabled check completed:', isEnabled, '\n');
    passedTests++;
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 13: Update Configuration
  console.log('Test 13: Update Configuration');
  try {
    UnifiedAIGenerator.updateConfig({ maxTokens: 250 });
    const config = UnifiedAIGenerator.getConfig();
    if (config.maxTokens === 250) {
      console.log('✓ PASS: Configuration updated successfully\n');
      passedTests++;
    } else {
      console.log('✗ FAIL: Configuration not updated correctly\n');
      failedTests++;
    }
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 14: Reset Statistics
  console.log('Test 14: Reset Statistics');
  try {
    UnifiedAIGenerator.resetStats();
    console.log('✓ PASS: Statistics reset successfully\n');
    passedTests++;
  } catch (error) {
    console.log('✗ FAIL:', error.message, '\n');
    failedTests++;
  }
  
  // Test 15: Clear Cache
  console.log('Test 15: Clear Cache');
  try {
    UnifiedAIGenerator.clearCache();
    console.log('✓ PASS: Cache cleared successfully\n');
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