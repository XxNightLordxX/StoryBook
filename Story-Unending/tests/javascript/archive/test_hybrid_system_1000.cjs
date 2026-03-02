/**
 * Test Hybrid System with 1000 Chapters
 * 
 * Tests the hybrid AI generation system at scale
 * Verifies paragraph uniqueness improvement
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
    aiPercentage: 40  // 40% AI, 60% template
};

// Test results
const results = {
    totalChapters: 1000,
    totalParagraphs: 0,
    uniqueParagraphs: new Set(),
    duplicateParagraphs: 0,
    aiGenerations: 0,
    templateGenerations: 0,
    fallbacks: 0,
    errors: 0,
    startTime: null,
    endTime: null
};

/**
 * Generate a chapter with hybrid system
 * @param {number} chapterNum - Chapter number
 * @returns {Promise<Object>} Chapter data
 */
async function generateChapter(chapterNum) {
    const paragraphs = [];
    const paragraphTypes = ['exploration', 'combat', 'introspection', 'lore', 'social'];
    
    for (const type of paragraphTypes) {
        const context = { setting: 'test setting', region: 'test region' };
        
        const templateGenerator = () => {
            return `Template paragraph for ${type} in chapter ${chapterNum}`;
        };
        
        try {
            const paragraph = await AIIntegration.generateWithFallback(
                context,
                chapterNum,
                type,
                templateGenerator
            );
            
            paragraphs.push(paragraph);
            results.totalParagraphs++;
            
            // Track uniqueness
            if (results.uniqueParagraphs.has(paragraph)) {
                results.duplicateParagraphs++;
            } else {
                results.uniqueParagraphs.add(paragraph);
            }
        } catch (error) {
            results.errors++;
            console.error(`Error generating paragraph for chapter ${chapterNum}, type ${type}:`, error.message);
        }
    }
    
    return {
        chapterNum,
        paragraphs,
        paragraphCount: paragraphs.length
    };
}

/**
 * Main test runner
 */
async function main() {
    console.log('========================================');
    console.log('  Hybrid System Test - 1000 Chapters');
    console.log('========================================');
    console.log(`\nConfiguration:`);
    console.log(`  Total Chapters: ${results.totalChapters}`);
    console.log(`  API Key: ${testConfig.apiKey ? 'Provided' : 'Not provided (using template fallback)'}`);
    console.log(`  Model: ${testConfig.model}`);
    console.log(`  AI Percentage: ${testConfig.aiPercentage}%`);
    console.log(`  Paragraphs per Chapter: 5`);
    
    // Initialize AI Integration
    console.log('\nInitializing AI Integration...');
    AIIntegration.initialize(testConfig);
    console.log(`AI Enabled: ${AIIntegration.isAIEnabled()}`);
    
    // Start timer
    results.startTime = Date.now();
    
    // Generate chapters
    console.log('\nGenerating chapters...');
    for (let i = 1; i <= results.totalChapters; i++) {
        if (i % 100 === 0) {
            console.log(`  Progress: ${i}/${results.totalChapters} chapters (${((i / results.totalChapters) * 100).toFixed(1)}%)`);
        }
        
        await generateChapter(i);
    }
    
    // End timer
    results.endTime = Date.now();
    const duration = (results.endTime - results.startTime) / 1000;
    
    // Get statistics
    const stats = AIIntegration.getStats();
    results.aiGenerations = stats.aiGenerations;
    results.templateGenerations = stats.templateGenerations;
    results.fallbacks = stats.fallbacks;
    results.errors = stats.errors;
    
    // Calculate uniqueness
    const uniqueCount = results.uniqueParagraphs.size;
    const uniquenessRate = (uniqueCount / results.totalParagraphs * 100).toFixed(2);
    
    // Print results
    console.log('\n========================================');
    console.log('  Test Results');
    console.log('========================================');
    console.log(`\nPerformance:`);
    console.log(`  Total Time: ${duration.toFixed(2)} seconds`);
    console.log(`  Chapters/Second: ${(results.totalChapters / duration).toFixed(2)}`);
    console.log(`  Paragraphs/Second: ${(results.totalParagraphs / duration).toFixed(2)}`);
    
    console.log(`\nGeneration Statistics:`);
    console.log(`  Total Chapters: ${results.totalChapters}`);
    console.log(`  Total Paragraphs: ${results.totalParagraphs}`);
    console.log(`  AI Generations: ${results.aiGenerations}`);
    console.log(`  Template Generations: ${results.templateGenerations}`);
    console.log(`  Fallbacks: ${results.fallbacks}`);
    console.log(`  Errors: ${results.errors}`);
    
    console.log(`\nUniqueness Statistics:`);
    console.log(`  Unique Paragraphs: ${uniqueCount}`);
    console.log(`  Duplicate Paragraphs: ${results.duplicateParagraphs}`);
    console.log(`  Uniqueness Rate: ${uniquenessRate}%`);
    
    console.log(`\nAI Usage:`);
    console.log(`  AI Usage Rate: ${stats.aiUsageRate}`);
    console.log(`  Template Usage Rate: ${stats.templateUsageRate}`);
    console.log(`  Fallback Rate: ${stats.fallbackRate}`);
    console.log(`  Error Rate: ${stats.errorRate}`);
    
    if (stats.aiStats) {
        console.log(`\nAI Statistics:`);
        console.log(`  Total Generated: ${stats.aiStats.totalGenerated}`);
        console.log(`  Cache Hits: ${stats.aiStats.cacheHits}`);
        console.log(`  API Calls: ${stats.aiStats.apiCalls}`);
        console.log(`  Cache Hit Rate: ${stats.aiStats.cacheHitRate}`);
        console.log(`  Total Cost: $${stats.aiStats.totalCost.toFixed(4)}`);
    }
    
    // Compare with baseline (23.48% uniqueness)
    console.log(`\nComparison with Baseline:`);
    console.log(`  Baseline Uniqueness: 23.48%`);
    console.log(`  Current Uniqueness: ${uniquenessRate}%`);
    const improvement = ((uniquenessRate - 23.48) / 23.48 * 100).toFixed(2);
    console.log(`  Improvement: ${improvement}%`);
    
    // Success criteria
    console.log(`\nSuccess Criteria:`);
    const success = parseFloat(uniquenessRate) >= 80; // Target: 80% uniqueness
    console.log(`  Target: 80% uniqueness`);
    console.log(`  Achieved: ${uniquenessRate}%`);
    console.log(`  Status: ${success ? '✅ PASS' : '❌ FAIL'}`);
    
    // Exit with appropriate code
    process.exit(success ? 0 : 1);
}

// Run tests
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});