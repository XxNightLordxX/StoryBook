#!/usr/bin/env node

/**
 * Phase 1 - TEST 1.11: Verify Duplicate Prevention Mechanism
 * 
 * This test verifies that the duplicate prevention mechanism is working correctly
 * by attempting to generate duplicate content and verifying it's properly rejected.
 */

const fs = require('fs');
const path = require('path');

// Load the UniquenessTracker module
const UniquenessTracker = require('./js/uniqueness-tracker.js');

// Mock StoryEngine for testing
class MockStoryEngine {
    constructor() {
        this.chapterCount = 0;
    }

    async generateChapter() {
        this.chapterCount++;
        
        // Generate unique content for each chapter
        const chapterNum = this.chapterCount;
        const title = `Chapter ${chapterNum}: ${this.generateRandomTitle()}`;
        const paragraphs = [];
        
        // Generate 10-15 paragraphs per chapter
        const numParagraphs = 10 + Math.floor(Math.random() * 6);
        for (let i = 0; i < numParagraphs; i++) {
            paragraphs.push(this.generateRandomParagraph(chapterNum, i));
        }
        
        const chapter = {
            title: title,
            content: paragraphs.join('\n\n'),
            paragraphs: paragraphs,
            chapterNumber: chapterNum
        };
        
        return chapter;
    }

    generateRandomTitle() {
        const titles = [
            'The Awakening', 'Dark Secrets', 'Hidden Truths', 'Eternal Night',
            'Blood Moon', 'Shadow Falls', 'Whispers in the Dark', 'The Hunt',
            'Ancient Power', 'Forgotten Lore', 'The Covenant', 'Rising Storm',
            'Broken Chains', 'The Prophecy', 'Final Stand', 'New Dawn',
            'Lost Legacy', 'The Reckoning', 'Silent Witness', 'The Beginning',
            'The Journey', 'Dark Destiny', 'Eternal Flame', 'Shadow Realm',
            'The Quest', 'Ancient Curse', 'Blood Legacy', 'The Fall',
            'Rising Darkness', 'The Alliance', 'Broken Vows', 'The Return',
            'The Vision', 'Dark Prophecy', 'Eternal War', 'Shadow King',
            'The Sacrifice', 'Ancient Blood', 'The Awakening', 'Dark Lord',
            'The Conquest', 'Eternal Night', 'Shadow Empire', 'The End',
            'The Beginning', 'Dark Horizon', 'Eternal Hope', 'Shadow Light',
            'The Promise', 'Ancient Wisdom', 'The Legacy', 'Dark Dawn',
            'The Revelation', 'Dark Mystery', 'Eternal Quest', 'Shadow Path',
            'The Destiny', 'Ancient Power', 'The Awakening', 'Dark Force'
        ];
        return titles[Math.floor(Math.random() * titles.length)];
    }

    generateRandomParagraph(chapterNum, paraNum) {
        const sentences = [];
        const numSentences = 3 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < numSentences; i++) {
            sentences.push(this.generateRandomSentence(chapterNum, paraNum, i));
        }
        
        return sentences.join(' ');
    }

    generateRandomSentence(chapterNum, paraNum, sentNum) {
        const subjects = ['The vampire', 'She', 'He', 'The ancient one', 'The hunter', 'The darkness', 'The light', 'The prophecy', 'The warrior', 'The guardian', 'The sorcerer', 'The beast', 'The spirit', 'The shadow', 'The flame', 'The mystic', 'The guardian', 'The sentinel', 'The watcher', 'The keeper'];
        const verbs = ['walked', 'ran', 'fought', 'whispered', 'screamed', 'disappeared', 'appeared', 'transformed', 'ascended', 'descended', 'summoned', 'unleashed', 'embraced', 'rejected', 'conquered', 'defied', 'challenged', 'surpassed', 'transcended', 'mastered'];
        const objects = ['into the night', 'through the shadows', 'across the battlefield', 'beyond the veil', 'into the light', 'through the mist', 'across the centuries', 'beyond time', 'through the void', 'across dimensions', 'into the abyss', 'beyond reality', 'through eternity', 'across existence', 'into destiny', 'beyond comprehension', 'through infinity', 'across the cosmos', 'into the unknown', 'beyond imagination'];
        
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const verb = verbs[Math.floor(Math.random() * verbs.length)];
        const object = objects[Math.floor(Math.random() * objects.length)];
        
        // Add unique identifiers to ensure uniqueness
        const uniqueId = `C${chapterNum}P${paraNum}S${sentNum}`;
        
        return `${subject} ${verb} ${object} as the ancient power surged through them, marking the moment ${uniqueId} in the eternal struggle.`;
    }
}

// Test configuration
const TEST_NAME = 'TEST 1.11: Verify Duplicate Prevention Mechanism';

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

// Main test function
async function runTest() {
    log(`Starting ${TEST_NAME}`);
    log('Initializing...');
    
    // Clear tracker
    UniquenessTracker.clearAll();
    
    // Create mock story engine
    const storyEngine = new MockStoryEngine();
    
    const startTime = Date.now();
    
    try {
        // TEST 1: Generate a chapter and track it
        log('\nTEST 1: Generate a chapter and track it');
        const chapter1 = await storyEngine.generateChapter();
        UniquenessTracker.addTitle(chapter1.title);
        UniquenessTracker.addChapter(chapter1.content);
        chapter1.paragraphs.forEach(para => UniquenessTracker.addParagraph(para));
        
        const paragraphs1 = UniquenessTracker.getTrackedParagraphs();
        const titles1 = UniquenessTracker.getTrackedTitles();
        const chapters1 = UniquenessTracker.getTrackedChapters();
        
        testResults.results.push({
            test: 'TEST 1: Generate a chapter and track it',
            status: paragraphs1.length > 0 && titles1.length > 0 && chapters1.length > 0 ? 'PASS' : 'FAIL',
            details: {
                paragraphsTracked: paragraphs1.length,
                titlesTracked: titles1.length,
                chaptersTracked: chapters1.length
            }
        });
        
        if (paragraphs1.length > 0 && titles1.length > 0 && chapters1.length > 0) {
            testResults.passedTests++;
            log('✅ PASS: Chapter tracked successfully');
        } else {
            testResults.failedTests++;
            log('❌ FAIL: Chapter tracking failed');
        }
        
        // TEST 2: Attempt to add the same paragraph again
        log('\nTEST 2: Attempt to add the same paragraph again');
        const isParaDup1 = UniquenessTracker.isParagraphDuplicate(chapter1.paragraphs[0]);
        UniquenessTracker.addParagraph(chapter1.paragraphs[0]);
        const paragraphs2 = UniquenessTracker.getTrackedParagraphs();
        
        testResults.results.push({
            test: 'TEST 2: Attempt to add the same paragraph again',
            status: paragraphs2.length === paragraphs1.length ? 'PASS' : 'FAIL',
            details: {
                originalCount: paragraphs1.length,
                afterDuplicate: paragraphs2.length,
                isDuplicateDetected: isParaDup1
            }
        });
        
        if (paragraphs2.length === paragraphs1.length && isParaDup1) {
            testResults.passedTests++;
            log('✅ PASS: Duplicate paragraph detected and rejected');
        } else {
            testResults.failedTests++;
            log('❌ FAIL: Duplicate paragraph not detected');
        }
        
        // TEST 3: Attempt to add the same title again
        log('\nTEST 3: Attempt to add the same title again');
        const isTitleDup1 = UniquenessTracker.isTitleDuplicate(chapter1.title);
        UniquenessTracker.addTitle(chapter1.title);
        const titles2 = UniquenessTracker.getTrackedTitles();
        
        testResults.results.push({
            test: 'TEST 3: Attempt to add the same title again',
            status: titles2.length === titles1.length && isTitleDup1 ? 'PASS' : 'FAIL',
            details: {
                originalCount: titles1.length,
                afterDuplicate: titles2.length,
                isDuplicateDetected: isTitleDup1
            }
        });
        
        if (titles2.length === titles1.length && isTitleDup1) {
            testResults.passedTests++;
            log('✅ PASS: Duplicate title detected and rejected');
        } else {
            testResults.failedTests++;
            log('❌ FAIL: Duplicate title not detected');
        }
        
        // TEST 4: Attempt to add the same chapter again
        log('\nTEST 4: Attempt to add the same chapter again');
        const isChapterDup1 = UniquenessTracker.isChapterDuplicate(chapter1.content);
        UniquenessTracker.addChapter(chapter1.content);
        const chapters2 = UniquenessTracker.getTrackedChapters();
        
        testResults.results.push({
            test: 'TEST 4: Attempt to add the same chapter again',
            status: chapters2.length === chapters1.length && isChapterDup1 ? 'PASS' : 'FAIL',
            details: {
                originalCount: chapters1.length,
                afterDuplicate: chapters2.length,
                isDuplicateDetected: isChapterDup1
            }
        });
        
        if (chapters2.length === chapters1.length && isChapterDup1) {
            testResults.passedTests++;
            log('✅ PASS: Duplicate chapter detected and rejected');
        } else {
            testResults.failedTests++;
            log('❌ FAIL: Duplicate chapter not detected');
        }
        
        // TEST 5: Generate a new chapter and verify it's not a duplicate
        log('\nTEST 5: Generate a new chapter and verify it\'s not a duplicate');
        const chapter2 = await storyEngine.generateChapter();
        const isParaDup2 = UniquenessTracker.isParagraphDuplicate(chapter2.paragraphs[0]);
        const isTitleDup2 = UniquenessTracker.isTitleDuplicate(chapter2.title);
        const isChapterDup2 = UniquenessTracker.isChapterDuplicate(chapter2.content);
        
        UniquenessTracker.addTitle(chapter2.title);
        UniquenessTracker.addChapter(chapter2.content);
        chapter2.paragraphs.forEach(para => UniquenessTracker.addParagraph(para));
        
        const paragraphs3 = UniquenessTracker.getTrackedParagraphs();
        const titles3 = UniquenessTracker.getTrackedTitles();
        const chapters3 = UniquenessTracker.getTrackedChapters();
        
        testResults.results.push({
            test: 'TEST 5: Generate a new chapter and verify it\'s not a duplicate',
            status: !isParaDup2 && !isTitleDup2 && !isChapterDup2 ? 'PASS' : 'FAIL',
            details: {
                isParagraphDuplicate: isParaDup2,
                isTitleDuplicate: isTitleDup2,
                isChapterDuplicate: isChapterDup2
            }
        });
        
        if (!isParaDup2 && !isTitleDup2 && !isChapterDup2) {
            testResults.passedTests++;
            log('✅ PASS: New chapter is not a duplicate');
        } else {
            testResults.failedTests++;
            log('❌ FAIL: New chapter detected as duplicate');
        }
        
        // TEST 6: Verify duplicate detection methods return correct results
        log('\nTEST 6: Verify duplicate detection methods return correct results');
        const paragraphs = UniquenessTracker.getTrackedParagraphs();
        const titles = UniquenessTracker.getTrackedTitles();
        const chapters = UniquenessTracker.getTrackedChapters();
        
        const duplicateParagraphs = paragraphs.length - new Set(paragraphs).size;
        const duplicateTitles = titles.length - new Set(titles).size;
        const duplicateChapters = chapters.length - new Set(chapters).size;
        
        testResults.results.push({
            test: 'TEST 6: Verify duplicate detection methods return correct results',
            status: duplicateParagraphs === 0 && duplicateTitles === 0 && duplicateChapters === 0 ? 'PASS' : 'FAIL',
            details: {
                duplicateParagraphs: duplicateParagraphs,
                duplicateTitles: duplicateTitles,
                duplicateChapters: duplicateChapters
            }
        });
        
        if (duplicateParagraphs === 0 && duplicateTitles === 0 && duplicateChapters === 0) {
            testResults.passedTests++;
            log('✅ PASS: No duplicates detected in tracked content');
        } else {
            testResults.failedTests++;
            log('❌ FAIL: Duplicates found in tracked content');
        }
        
        // TEST 7: Verify clearAll() clears all tracking arrays
        log('\nTEST 7: Verify clearAll() clears all tracking arrays');
        UniquenessTracker.clearAll();
        
        const paragraphs4 = UniquenessTracker.getTrackedParagraphs();
        const titles4 = UniquenessTracker.getTrackedTitles();
        const chapters4 = UniquenessTracker.getTrackedChapters();
        
        testResults.results.push({
            test: 'TEST 7: Verify clearAll() clears all tracking arrays',
            status: paragraphs4.length === 0 && titles4.length === 0 && chapters4.length === 0 ? 'PASS' : 'FAIL',
            details: {
                paragraphsAfterClear: paragraphs4.length,
                titlesAfterClear: titles4.length,
                chaptersAfterClear: chapters4.length
            }
        });
        
        if (paragraphs4.length === 0 && titles4.length === 0 && chapters4.length === 0) {
            testResults.passedTests++;
            log('✅ PASS: All tracking arrays cleared');
        } else {
            testResults.failedTests++;
            log('❌ FAIL: Tracking arrays not cleared');
        }
        
        // TEST 8: Verify tracking after clearAll()
        log('\nTEST 8: Verify tracking after clearAll()');
        const chapter3 = await storyEngine.generateChapter();
        UniquenessTracker.addTitle(chapter3.title);
        UniquenessTracker.addChapter(chapter3.content);
        chapter3.paragraphs.forEach(para => UniquenessTracker.addParagraph(para));
        
        const paragraphs5 = UniquenessTracker.getTrackedParagraphs();
        const titles5 = UniquenessTracker.getTrackedTitles();
        const chapters5 = UniquenessTracker.getTrackedChapters();
        
        testResults.results.push({
            test: 'TEST 8: Verify tracking after clearAll()',
            status: paragraphs5.length > 0 && titles5.length > 0 && chapters5.length > 0 ? 'PASS' : 'FAIL',
            details: {
                paragraphsAfterClear: paragraphs5.length,
                titlesAfterClear: titles5.length,
                chaptersAfterClear: chapters5.length
            }
        });
        
        if (paragraphs5.length > 0 && titles5.length > 0 && chapters5.length > 0) {
            testResults.passedTests++;
            log('✅ PASS: Tracking works after clearAll()');
        } else {
            testResults.failedTests++;
            log('❌ FAIL: Tracking broken after clearAll()');
        }
        
        // TEST 9: Verify duplicate detection with multiple identical attempts
        log('\nTEST 9: Verify duplicate detection with multiple identical attempts');
        const testParagraph = 'This is a test paragraph for duplicate detection.';
        
        // Count successful additions and prevented duplicates
        let successfulAdds = 0;
        let preventedDuplicates = 0;
        
        // Add the same paragraph 10 times
        for (let i = 0; i < 10; i++) {
            const result = UniquenessTracker.addParagraph(testParagraph);
            if (result === true) {
                successfulAdds++;
            } else {
                preventedDuplicates++;
            }
        }
        
        const paragraphs6 = UniquenessTracker.getTrackedParagraphs();
        
        testResults.results.push({
            test: 'TEST 9: Verify duplicate detection with multiple identical attempts',
            status: successfulAdds === 1 && preventedDuplicates === 9 ? 'PASS' : 'FAIL',
            details: {
                attempts: 10,
                successfulAdds: successfulAdds,
                preventedDuplicates: preventedDuplicates,
                trackedCount: paragraphs6.length
            }
        });
        
        if (successfulAdds === 1 && preventedDuplicates === 9) {
            testResults.passedTests++;
            log('✅ PASS: 1 successful add, 9 duplicates prevented out of 10 attempts');
        } else {
            testResults.failedTests++;
            log(`❌ FAIL: Expected 1 add and 9 prevented, got ${successfulAdds} adds and ${preventedDuplicates} prevented`);
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
            log('Duplicate prevention mechanism is working correctly.');
        } else {
            log('\n❌ SOME TESTS FAILED');
            log('Duplicate prevention mechanism has issues.');
        }
        
        // Save results to file
        const resultsPath = path.join(__dirname, 'test-phase1-test11-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
        log(`\nResults saved to: ${resultsPath}`);
        
        // Exit with appropriate code
        process.exit(testResults.passed ? 0 : 1);
        
    } catch (error) {
        log(`\n❌ TEST ERROR: ${error.message}`);
        testResults.errors.push(error.message);
        
        const resultsPath = path.join(__dirname, 'test-phase1-test11-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
        
        process.exit(1);
    }
}

// Run the test
runTest();