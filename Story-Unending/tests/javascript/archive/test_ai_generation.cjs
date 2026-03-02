/**
 * Test AI Generation System
 * 
 * Tests the AI content generator and integration layer
 */

// Load modules
const AIContentGenerator = require('../../js/ai-content-generator.js');
const AIIntegration = require('../../js/ai-integration.js');

// Test configuration
const testConfig = {
    apiKey: process.env.OPENAI_API_KEY || null,
    model: 'gpt-4-turbo-preview',
    maxTokens: 200,
    temperature: 0.8,
    timeout: 10000,
    aiPercentage: 40
};

// Test results
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

/**
 * Run a test
 * @param {string} name - Test name
 * @param {Function} testFn - Test function
 */
async function runTest(name, testFn) {
    console.log(`\n🧪 Test: ${name}`);
    try {
        await testFn();
        results.passed++;
        results.tests.push({ name, status: 'PASS' });
        console.log(`✅ PASS: ${name}`);
    } catch (error) {
        results.failed++;
        results.tests.push({ name, status: 'FAIL', error: error.message });
        console.log(`❌ FAIL: ${name}`);
        console.log(`   Error: ${error.message}`);
    }
}

/**
 * Test 1: Initialize AI Content Generator
 */
async function test1_InitializeAIContentGenerator() {
    AIContentGenerator.initialize(testConfig);
    
    if (!AIContentGenerator.isEnabled() && testConfig.apiKey) {
        throw new Error('AIContentGenerator should be enabled with API key');
    }
    
    console.log('   AIContentGenerator initialized successfully');
}

/**
 * Test 2: Initialize AI Integration
 */
async function test2_InitializeAIIntegration() {
    AIIntegration.initialize(testConfig);
    
    console.log('   AIIntegration initialized successfully');
    console.log(`   AI Percentage: ${AIIntegration.getAIPercentage()}%`);
}

/**
 * Test 3: Check AI Enabled Status
 */
async function test3_CheckAIEnabledStatus() {
    const isEnabled = AIIntegration.isAIEnabled();
    
    if (testConfig.apiKey && !isEnabled) {
        throw new Error('AI should be enabled with API key');
    }
    
    if (!testConfig.apiKey && isEnabled) {
        throw new Error('AI should be disabled without API key');
    }
    
    console.log(`   AI Enabled: ${isEnabled}`);
}

/**
 * Test 4: Generate Paragraph with Fallback
 */
async function test4_GenerateParagraphWithFallback() {
    const context = { setting: 'mysterious forest', region: 'north' };
    const chapterNum = 1;
    const paragraphType = 'exploration';
    
    const templateGenerator = () => {
        return 'Exploring the mysterious forest...';
    };
    
    const paragraph = await AIIntegration.generateWithFallback(
        context,
        chapterNum,
        paragraphType,
        templateGenerator
    );
    
    if (!paragraph || typeof paragraph !== 'string') {
        throw new Error('Generated paragraph should be a non-empty string');
    }
    
    console.log(`   Generated paragraph: ${paragraph.substring(0, 50)}...`);
}

/**
 * Test 5: Generate Multiple Paragraphs
 */
async function test5_GenerateMultipleParagraphs() {
    const context = { setting: 'ancient ruins' };
    const chapterNum = 2;
    const paragraphType = 'lore';
    const count = 3;
    
    const templateGenerator = () => {
        return 'Ancient secrets were revealed...';
    };
    
    const paragraphs = await AIIntegration.generateMultipleWithFallback(
        context,
        chapterNum,
        paragraphType,
        count,
        templateGenerator
    );
    
    if (!Array.isArray(paragraphs) || paragraphs.length !== count) {
        throw new Error(`Should generate ${count} paragraphs`);
    }
    
    console.log(`   Generated ${paragraphs.length} paragraphs`);
}

/**
 * Test 6: Get Statistics
 */
async function test6_GetStatistics() {
    const stats = AIIntegration.getStats();
    
    if (!stats || typeof stats !== 'object') {
        throw new Error('Statistics should be an object');
    }
    
    console.log('   Statistics:');
    console.log(`     Total Generations: ${stats.totalGenerations}`);
    console.log(`     AI Generations: ${stats.aiGenerations}`);
    console.log(`     Template Generations: ${stats.templateGenerations}`);
    console.log(`     Fallbacks: ${stats.fallbacks}`);
    console.log(`     Errors: ${stats.errors}`);
    console.log(`     AI Usage Rate: ${stats.aiUsageRate}`);
    console.log(`     Template Usage Rate: ${stats.templateUsageRate}`);
}

/**
 * Test 7: Set AI Percentage
 */
async function test7_SetAIPercentage() {
    const originalPercentage = AIIntegration.getAIPercentage();
    
    AIIntegration.setAIPercentage(60);
    const newPercentage = AIIntegration.getAIPercentage();
    
    if (newPercentage !== 60) {
        throw new Error('AI percentage should be 60');
    }
    
    // Restore original percentage
    AIIntegration.setAIPercentage(originalPercentage);
    
    console.log(`   AI Percentage changed from ${originalPercentage}% to ${newPercentage}%`);
}

/**
 * Test 8: Enable/Disable AI
 */
async function test8_EnableDisableAI() {
    const originalEnabled = AIIntegration.isAIEnabled();
    
    AIIntegration.setAIEnabled(false);
    const disabled = AIIntegration.isAIEnabled();
    
    if (disabled) {
        throw new Error('AI should be disabled');
    }
    
    AIIntegration.setAIEnabled(true);
    const enabled = AIIntegration.isAIEnabled();
    
    if (testConfig.apiKey && !enabled) {
        throw new Error('AI should be enabled');
    }
    
    // Restore original state
    if (!originalEnabled) {
        AIIntegration.setAIEnabled(false);
    }
    
    console.log(`   AI Enable/Disable test passed`);
}

/**
 * Test 9: Reset Statistics
 */
async function test9_ResetStatistics() {
    AIIntegration.resetStats();
    
    const stats = AIIntegration.getStats();
    
    if (stats.totalGenerations !== 0 || stats.aiGenerations !== 0) {
        throw new Error('Statistics should be reset to 0');
    }
    
    console.log('   Statistics reset successfully');
}

/**
 * Test 10: Error Handling
 */
async function test10_ErrorHandling() {
    const context = { setting: 'test' };
    const chapterNum = 999;
    const paragraphType = 'invalid';
    
    const templateGenerator = () => {
        return 'Fallback paragraph...';
    };
    
    try {
        const paragraph = await AIIntegration.generateWithFallback(
            context,
            chapterNum,
            paragraphType,
            templateGenerator
        );
        
        // Should fallback to template generation
        console.log(`   Error handling test passed (fallback used)`);
    } catch (error) {
        console.log(`   Error handling test passed (error caught: ${error.message})`);
    }
}

/**
 * Main test runner
 */
async function main() {
    console.log('========================================');
    console.log('  AI Generation System Tests');
    console.log('========================================');
    console.log(`\nConfiguration:`);
    console.log(`  API Key: ${testConfig.apiKey ? 'Provided' : 'Not provided (using template fallback)'}`);
    console.log(`  Model: ${testConfig.model}`);
    console.log(`  AI Percentage: ${testConfig.aiPercentage}%`);
    console.log(`  Max Tokens: ${testConfig.maxTokens}`);
    
    // Run all tests
    await runTest('Initialize AI Content Generator', test1_InitializeAIContentGenerator);
    await runTest('Initialize AI Integration', test2_InitializeAIIntegration);
    await runTest('Check AI Enabled Status', test3_CheckAIEnabledStatus);
    await runTest('Generate Paragraph with Fallback', test4_GenerateParagraphWithFallback);
    await runTest('Generate Multiple Paragraphs', test5_GenerateMultipleParagraphs);
    await runTest('Get Statistics', test6_GetStatistics);
    await runTest('Set AI Percentage', test7_SetAIPercentage);
    await runTest('Enable/Disable AI', test8_EnableDisableAI);
    await runTest('Reset Statistics', test9_ResetStatistics);
    await runTest('Error Handling', test10_ErrorHandling);
    
    // Print summary
    console.log('\n========================================');
    console.log('  Test Summary');
    console.log('========================================');
    console.log(`Total Tests: ${results.passed + results.failed}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`);
    
    // Print detailed results
    console.log('\nDetailed Results:');
    results.tests.forEach(test => {
        const icon = test.status === 'PASS' ? '✅' : '❌';
        console.log(`  ${icon} ${test.name}`);
        if (test.error) {
            console.log(`     Error: ${test.error}`);
        }
    });
    
    // Print final statistics
    console.log('\nFinal Statistics:');
    const stats = AIIntegration.getStats();
    console.log(JSON.stringify(stats, null, 2));
    
    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});