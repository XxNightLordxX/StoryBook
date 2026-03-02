#!/usr/bin/env node

/**
 * Test: Verify Continuity & Variety Fixes
 * 
 * This test verifies that all three Phase 2 issues are fixed:
 * 1. Chapter-to-chapter continuity
 * 2. Sentence variety
 * 3. Paragraph variety
 */

const fs = require('fs');
const path = require('path');

// Load the continuity engine
const StoryContinuityEngine = require('./js/story-continuity-engine.js');

// Mock chapter generator
function mockGenerateChapter(options) {
    const chapterNum = options.chapterNum || 1;
    const titles = [
        'The Awakening', 'Dark Secrets', 'Hidden Truths', 'Eternal Night',
        'Blood Moon', 'Shadow Falls', 'Whispers in the Dark', 'The Hunt',
        'Ancient Power', 'Forgotten Lore'
    ];
    
    const paragraphs = [];
    const numParagraphs = 10 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < numParagraphs; i++) {
        const sentences = [];
        const numSentences = 3 + Math.floor(Math.random() * 5);
        
        for (let j = 0; j < numSentences; j++) {
            sentences.push(`This is sentence ${j + 1} of paragraph ${i + 1} in chapter ${chapterNum}.`);
        }
        
        paragraphs.push(sentences.join(' '));
    }
    
    return {
        title: titles[chapterNum % titles.length],
        content: paragraphs.join('\n\n'),
        paragraphs: paragraphs,
        chapterNumber: chapterNum
    };
}

// Test configuration
const TEST_NAME = 'Verify Continuity & Variety Fixes';

// Test state
let testResults = {
    testName: TEST_NAME,
    totalTests: 9,
    passedTests: 0,
    failedTests: 0,
    elapsedTime: 0,
    results: [],
    errors: []
};

// Utility functions
function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

// Analysis functions
function analyzeSentenceVariety(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    
    const uniqueLengths = new Set(sentenceLengths).size;
    const varietyRatio = uniqueLengths / sentences.length;
    
    return {
        totalSentences: sentences.length,
        uniqueLengths: uniqueLengths,
        varietyRatio: varietyRatio,
        sentenceLengths: sentenceLengths
    };
}

function analyzeParagraphVariety(paragraphs) {
    const paragraphLengths = paragraphs.map(p => {
        const sentences = p.split(/[.!?]+/).filter(s => s.trim().length > 0);
        return sentences.length;
    });
    
    const uniqueLengths = new Set(paragraphLengths).size;
    const varietyRatio = uniqueLengths / paragraphs.length;
    
    return {
        totalParagraphs: paragraphs.length,
        uniqueLengths: uniqueLengths,
        varietyRatio: varietyRatio,
        paragraphLengths: paragraphLengths
    };
}

function analyzeContinuity(chapter1, chapter2) {
    const firstPara = chapter2.paragraphs[0].toLowerCase();
    
    const transitionWords = ['meanwhile', 'later', 'however', 'therefore', 'consequently', 'as a result', 'in contrast', 'nevertheless', 'despite', 'following'];
    const hasTransition = transitionWords.some(word => firstPara.includes(word));
    
    const temporalIndicators = ['time', 'passed', 'days', 'weeks', 'hours', 'morning', 'evening', 'night'];
    const hasTemporal = temporalIndicators.some(word => firstPara.includes(word));
    
    const narrativeIndicators = ['continued', 'continued', 'unfolded', 'progressed', 'advanced', 'moved forward'];
    const hasNarrative = narrativeIndicators.some(word => firstPara.includes(word));
    
    return {
        hasTransition,
        hasTemporal,
        hasNarrative,
        firstParagraph: firstPara.substring(0, 100) + '...'
    };
}

// Main test function
async function runTest() {
    log(`Starting ${TEST_NAME}`);
    log('Initializing...');
    
    // Reset continuity state
    StoryContinuityEngine.resetContinuity();
    
    const startTime = Date.now();
    
    try {
        // Generate 10 chapters with continuity and variety
        log('\nGenerating 10 chapters with continuity and variety...');
        const chapters = [];
        
        for (let i = 1; i <= 10; i++) {
            const chapter = StoryContinuityEngine.generateChapterWithContinuity(
                () => mockGenerateChapter({ chapterNum: i }),
                {
                    addTransition: true,
                    enhanceVariety: true
                }
            );
            chapters.push(chapter);
            log(`Generated Chapter ${i}: ${chapter.title}`);
        }
        
        // TEST 1: Chapter-to-chapter continuity
        log('\n=== TEST 1: Chapter-to-Chapter Continuity ===');
        let continuityScore = 0;
        let totalContinuityTests = 9;
        
        for (let i = 0; i < chapters.length - 1; i++) {
            const analysis = analyzeContinuity(chapters[i], chapters[i + 1]);
            
            if (analysis.hasTransition || analysis.hasTemporal || analysis.hasNarrative) {
                continuityScore++;
            }
            
            log(`Chapter ${i + 1} → ${i + 2}: ${analysis.hasTransition || analysis.hasTemporal || analysis.hasNarrative ? '✅' : '❌'}`);
        }
        
        const continuityPass = continuityScore >= totalContinuityTests * 0.7; // 70% pass rate
        testResults.results.push({
            test: 'Chapter-to-chapter continuity',
            status: continuityPass ? 'PASS' : 'FAIL',
            details: {
                score: continuityScore,
                total: totalContinuityTests,
                percentage: (continuityScore / totalContinuityTests * 100).toFixed(2) + '%'
            }
        });
        
        if (continuityPass) {
            testResults.passedTests++;
            log(`✅ PASS: ${continuityScore}/${totalContinuityTests} transitions detected`);
        } else {
            testResults.failedTests++;
            log(`❌ FAIL: Only ${continuityScore}/${totalContinuityTests} transitions detected`);
        }
        
        // TEST 2: Sentence variety
        log('\n=== TEST 2: Sentence Variety ===');
        let allSentenceVariety = [];
        
        chapters.forEach((chapter, index) => {
            const analysis = analyzeSentenceVariety(chapter.content);
            allSentenceVariety.push(analysis.varietyRatio);
            log(`Chapter ${index + 1}: ${analysis.uniqueLengths} unique lengths (${(analysis.varietyRatio * 100).toFixed(2)}%)`);
        });
        
        const avgSentenceVariety = allSentenceVariety.reduce((a, b) => a + b, 0) / allSentenceVariety.length;
        const sentenceVarietyPass = avgSentenceVariety > 0.3; // At least 30% variety
        
        testResults.results.push({
            test: 'Sentence variety',
            status: sentenceVarietyPass ? 'PASS' : 'FAIL',
            details: {
                averageVariety: (avgSentenceVariety * 100).toFixed(2) + '%',
                threshold: '30%'
            }
        });
        
        if (sentenceVarietyPass) {
            testResults.passedTests++;
            log(`✅ PASS: Average sentence variety ${(avgSentenceVariety * 100).toFixed(2)}%`);
        } else {
            testResults.failedTests++;
            log(`❌ FAIL: Average sentence variety ${(avgSentenceVariety * 100).toFixed(2)}% (expected > 30%)`);
        }
        
        // TEST 3: Paragraph variety
        log('\n=== TEST 3: Paragraph Variety ===');
        let allParagraphVariety = [];
        
        chapters.forEach((chapter, index) => {
            const analysis = analyzeParagraphVariety(chapter.paragraphs);
            allParagraphVariety.push(analysis.varietyRatio);
            log(`Chapter ${index + 1}: ${analysis.uniqueLengths} unique lengths (${(analysis.varietyRatio * 100).toFixed(2)}%)`);
        });
        
        const avgParagraphVariety = allParagraphVariety.reduce((a, b) => a + b, 0) / allParagraphVariety.length;
        const paragraphVarietyPass = avgParagraphVariety > 0.3; // At least 30% variety
        
        testResults.results.push({
            test: 'Paragraph variety',
            status: paragraphVarietyPass ? 'PASS' : 'FAIL',
            details: {
                averageVariety: (avgParagraphVariety * 100).toFixed(2) + '%',
                threshold: '30%'
            }
        });
        
        if (paragraphVarietyPass) {
            testResults.passedTests++;
            log(`✅ PASS: Average paragraph variety ${(avgParagraphVariety * 100).toFixed(2)}%`);
        } else {
            testResults.failedTests++;
            log(`❌ FAIL: Average paragraph variety ${(avgParagraphVariety * 100).toFixed(2)}% (expected > 30%)`);
        }
        
        // TEST 4: Sentence length distribution
        log('\n=== TEST 4: Sentence Length Distribution ===');
        let allSentences = [];
        chapters.forEach(chapter => {
            const sentences = chapter.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
            allSentences.push(...sentences.map(s => s.trim().split(/\s+/).length));
        });
        
        const shortSentences = allSentences.filter(len => len < 10).length;
        const mediumSentences = allSentences.filter(len => len >= 10 && len <= 20).length;
        const longSentences = allSentences.filter(len => len > 20).length;
        
        const lengthDistributionPass = shortSentences > 0 && mediumSentences > 0 && longSentences > 0;
        
        testResults.results.push({
            test: 'Sentence length distribution',
            status: lengthDistributionPass ? 'PASS' : 'FAIL',
            details: {
                short: shortSentences,
                medium: mediumSentences,
                long: longSentences,
                total: allSentences.length
            }
        });
        
        if (lengthDistributionPass) {
            testResults.passedTests++;
            log(`✅ PASS: Short: ${shortSentences}, Medium: ${mediumSentences}, Long: ${longSentences}`);
        } else {
            testResults.failedTests++;
            log(`❌ FAIL: Missing sentence length variety`);
        }
        
        // TEST 5: Paragraph length distribution
        log('\n=== TEST 5: Paragraph Length Distribution ===');
        let allParagraphLengths = [];
        chapters.forEach(chapter => {
            const lengths = chapter.paragraphs.map(p => p.split(/[.!?]+/).filter(s => s.trim().length > 0).length);
            allParagraphLengths.push(...lengths);
        });
        
        const shortParagraphs = allParagraphLengths.filter(len => len < 4).length;
        const mediumParagraphs = allParagraphLengths.filter(len => len >= 4 && len <= 7).length;
        const longParagraphs = allParagraphLengths.filter(len => len > 7).length;
        
        const paragraphDistributionPass = shortParagraphs > 0 && mediumParagraphs > 0 && longParagraphs > 0;
        
        testResults.results.push({
            test: 'Paragraph length distribution',
            status: paragraphDistributionPass ? 'PASS' : 'FAIL',
            details: {
                short: shortParagraphs,
                medium: mediumParagraphs,
                long: longParagraphs,
                total: allParagraphLengths.length
            }
        });
        
        if (paragraphDistributionPass) {
            testResults.passedTests++;
            log(`✅ PASS: Short: ${shortParagraphs}, Medium: ${mediumParagraphs}, Long: ${longParagraphs}`);
        } else {
            testResults.failedTests++;
            log(`❌ FAIL: Missing paragraph length variety`);
        }
        
        // TEST 6: No abrupt chapter endings
        log('\n=== TEST 6: No Abrupt Chapter Endings ===');
        let abruptEndings = 0;
        
        chapters.forEach((chapter, index) => {
            const lastPara = chapter.paragraphs[chapter.paragraphs.length - 1];
            const words = lastPara.trim().split(/\s+/);
            
            if (words.length < 15) {
                abruptEndings++;
                log(`Chapter ${index + 1}: ❌ Abrupt ending (${words.length} words)`);
            } else {
                log(`Chapter ${index + 1}: ✅ Proper ending (${words.length} words)`);
            }
        });
        
        const noAbruptEndings = abruptEndings === 0;
        
        testResults.results.push({
            test: 'No abrupt chapter endings',
            status: noAbruptEndings ? 'PASS' : 'FAIL',
            details: {
                abruptEndings: abruptEndings,
                totalChapters: chapters.length
            }
        });
        
        if (noAbruptEndings) {
            testResults.passedTests++;
            log(`✅ PASS: No abrupt endings detected`);
        } else {
            testResults.failedTests++;
            log(`❌ FAIL: ${abruptEndings} abrupt endings detected`);
        }
        
        // TEST 7: Transition words present
        log('\n=== TEST 7: Transition Words Present ===');
        let transitionWordCount = 0;
        
        chapters.forEach((chapter, index) => {
            if (index === 0) return; // Skip first chapter
            
            const firstPara = chapter.paragraphs[0].toLowerCase();
            const transitionWords = ['meanwhile', 'later', 'however', 'therefore', 'consequently', 'as a result', 'in contrast', 'nevertheless', 'despite', 'following', 'continued', 'unfolded', 'progressed'];
            
            const found = transitionWords.filter(word => firstPara.includes(word));
            if (found.length > 0) {
                transitionWordCount++;
                log(`Chapter ${index + 1}: ✅ Found: ${found.join(', ')}`);
            } else {
                log(`Chapter ${index + 1}: ❌ No transition words`);
            }
        });
        
        const transitionWordsPass = transitionWordCount >= 7; // At least 7 out of 9
        
        testResults.results.push({
            test: 'Transition words present',
            status: transitionWordsPass ? 'PASS' : 'FAIL',
            details: {
                chaptersWithTransitions: transitionWordCount,
                totalChapters: chapters.length - 1
            }
        });
        
        if (transitionWordsPass) {
            testResults.passedTests++;
            log(`✅ PASS: ${transitionWordCount}/${chapters.length - 1} chapters have transition words`);
        } else {
            testResults.failedTests++;
            log(`❌ FAIL: Only ${transitionWordCount}/${chapters.length - 1} chapters have transition words`);
        }
        
        // TEST 8: Consistent sentence length average
        log('\n=== TEST 8: Consistent Sentence Length Average ===');
        const avgSentenceLength = allSentences.reduce((a, b) => a + b, 0) / allSentences.length;
        const sentenceLengthInRange = avgSentenceLength >= 15 && avgSentenceLength <= 25;
        
        testResults.results.push({
            test: 'Consistent sentence length average',
            status: sentenceLengthInRange ? 'PASS' : 'FAIL',
            details: {
                averageLength: avgSentenceLength.toFixed(2),
                expectedRange: '15-25 words'
            }
        });
        
        if (sentenceLengthInRange) {
            testResults.passedTests++;
            log(`✅ PASS: Average sentence length ${avgSentenceLength.toFixed(2)} words`);
        } else {
            testResults.failedTests++;
            log(`❌ FAIL: Average sentence length ${avgSentenceLength.toFixed(2)} words (expected 15-25)`);
        }
        
        // TEST 9: Consistent paragraph length average
        log('\n=== TEST 9: Consistent Paragraph Length Average ===');
        const avgParagraphLength = allParagraphLengths.reduce((a, b) => a + b, 0) / allParagraphLengths.length;
        const paragraphLengthInRange = avgParagraphLength >= 3 && avgParagraphLength <= 7;
        
        testResults.results.push({
            test: 'Consistent paragraph length average',
            status: paragraphLengthInRange ? 'PASS' : 'FAIL',
            details: {
                averageLength: avgParagraphLength.toFixed(2),
                expectedRange: '3-7 sentences'
            }
        });
        
        if (paragraphLengthInRange) {
            testResults.passedTests++;
            log(`✅ PASS: Average paragraph length ${avgParagraphLength.toFixed(2)} sentences`);
        } else {
            testResults.failedTests++;
            log(`❌ FAIL: Average paragraph length ${avgParagraphLength.toFixed(2)} sentences (expected 3-7)`);
        }
        
        // Calculate elapsed time
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        testResults.elapsedTime = `${minutes}m ${seconds}s`;
        
        // Determine if test passed
        testResults.passed = testResults.passedTests === testResults.totalTests;
        
        // Print results
        log('\n=== TEST RESULTS ===');
        log(`Total Tests: ${testResults.totalTests}`);
        log(`Passed: ${testResults.passedTests}`);
        log(`Failed: ${testResults.failedTests}`);
        log(`Elapsed Time: ${testResults.elapsedTime}`);
        
        log('\nDetailed Results:');
        testResults.results.forEach((result, index) => {
            log(`\n${result.test}`);
            log(`Status: ${result.status}`);
            log(`Details: ${JSON.stringify(result.details)}`);
        });
        
        if (testResults.passed) {
            log('\n✅ ALL TESTS PASSED');
            log('All three Phase 2 issues are fixed:');
            log('1. ✅ Chapter-to-chapter continuity implemented');
            log('2. ✅ Sentence variety enhanced');
            log('3. ✅ Paragraph variety enhanced');
        } else {
            log('\n❌ SOME TESTS FAILED');
            log('Not all Phase 2 issues are fully fixed.');
        }
        
        // Save results to file
        const resultsPath = path.join(__dirname, 'test-continuity-variety-fixes-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
        log(`\nResults saved to: ${resultsPath}`);
        
        // Exit with appropriate code
        process.exit(testResults.passed ? 0 : 1);
        
    } catch (error) {
        log(`\n❌ TEST ERROR: ${error.message}`);
        testResults.errors.push(error.message);
        
        const resultsPath = path.join(__dirname, 'test-continuity-variety-fixes-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
        
        process.exit(1);
    }
}

// Run the test
runTest();