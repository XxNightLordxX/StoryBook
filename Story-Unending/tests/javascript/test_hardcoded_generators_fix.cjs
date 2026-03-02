// Test hardcoded generators fix
// This test verifies that the hardcoded generators now use unique paragraph generation
// by generating chapters and checking paragraph uniqueness

const fs = require('fs');
const path = require('path');

// Load backstory engine
const BackstoryEngine = require(path.join(__dirname, '../../backstory-engine.js'));
global.BackstoryEngine = BackstoryEngine;

// Load story engine
const StoryEngine = require(path.join(__dirname, '../../story-engine.js'));
global.StoryEngine = StoryEngine;

// Test functions
async function testHardcodedGenerators() {
  console.log('Testing Hardcoded Paragraph Generators Fix...\n');
  console.log('This test generates chapters and verifies paragraph uniqueness.\n');
  
  const testResults = {
    passed: 0,
    failed: 0,
    errors: []
  };
  
  // Test 1: Generate 100 chapters and check paragraph uniqueness
  console.log('Test 1: Generate 100 chapters and check paragraph uniqueness');
  try {
    const startTime = Date.now();
    const allParagraphs = [];
    
    for (let i = 1; i <= 100; i++) {
      const chapter = StoryEngine.generateChapter(i);
      allParagraphs.push(...chapter.paragraphs);
      
      if (i % 20 === 0) {
        console.log(`  Generated ${i} chapters...`);
      }
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    const chaptersPerSec = (100 / duration).toFixed(2);
    
    // Check for duplicates
    const uniqueParagraphs = new Set(allParagraphs);
    const duplicateCount = allParagraphs.length - uniqueParagraphs.size;
    const uniquenessRate = ((uniqueParagraphs.size / allParagraphs.length) * 100).toFixed(2);
    
    console.log(`✓ Generated 100 chapters in ${duration.toFixed(2)}s (${chaptersPerSec} chapters/sec)`);
    console.log(`✓ Total paragraphs: ${allParagraphs.length}`);
    console.log(`✓ Unique paragraphs: ${uniqueParagraphs.size}`);
    console.log(`✓ Duplicate paragraphs: ${duplicateCount}`);
    console.log(`✓ Uniqueness rate: ${uniquenessRate}%`);
    
    if (parseFloat(uniquenessRate) >= 99.9) {
      console.log('✓ Uniqueness rate meets target (≥99.9%)!');
      testResults.passed++;
    } else {
      console.log(`⚠ Uniqueness rate below target (99.9%)`);
      testResults.failed++;
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    testResults.failed++;
    testResults.errors.push({ test: 'Generate 100 chapters', error: error.message });
  }
  console.log('');
  
  // Test 2: Generate 1000 chapters and check paragraph uniqueness
  console.log('Test 2: Generate 1000 chapters and check paragraph uniqueness');
  try {
    const startTime = Date.now();
    const allParagraphs = [];
    
    for (let i = 1; i <= 1000; i++) {
      const chapter = StoryEngine.generateChapter(i);
      allParagraphs.push(...chapter.paragraphs);
      
      if (i % 200 === 0) {
        console.log(`  Generated ${i} chapters...`);
      }
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    const chaptersPerSec = (1000 / duration).toFixed(2);
    
    // Check for duplicates
    const uniqueParagraphs = new Set(allParagraphs);
    const duplicateCount = allParagraphs.length - uniqueParagraphs.size;
    const uniquenessRate = ((uniqueParagraphs.size / allParagraphs.length) * 100).toFixed(2);
    
    console.log(`✓ Generated 1000 chapters in ${duration.toFixed(2)}s (${chaptersPerSec} chapters/sec)`);
    console.log(`✓ Total paragraphs: ${allParagraphs.length}`);
    console.log(`✓ Unique paragraphs: ${uniqueParagraphs.size}`);
    console.log(`✓ Duplicate paragraphs: ${duplicateCount}`);
    console.log(`✓ Uniqueness rate: ${uniquenessRate}%`);
    
    if (parseFloat(uniquenessRate) >= 99.9) {
      console.log('✓ Uniqueness rate meets target (≥99.9%)!');
      testResults.passed++;
    } else {
      console.log(`⚠ Uniqueness rate below target (99.9%)`);
      testResults.failed++;
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    testResults.failed++;
    testResults.errors.push({ test: 'Generate 1000 chapters', error: error.message });
  }
  console.log('');
  
  // Print summary
  console.log('='.repeat(50));
  console.log('Test Summary:');
  console.log(`  Passed: ${testResults.passed}`);
  console.log(`  Failed: ${testResults.failed}`);
  console.log(`  Total: ${testResults.passed + testResults.failed}`);
  console.log('='.repeat(50));
  
  if (testResults.errors.length > 0) {
    console.log('\nErrors:');
    testResults.errors.forEach(err => {
      console.log(`  ${err.test}: ${err.error}`);
    });
  }
  
  return testResults;
}

// Run tests
testHardcodedGenerators()
  .then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });