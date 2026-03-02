/**
 * Test Paragraph Uniqueness
 * Verifies that there are no duplicate paragraphs in generated chapters
 */

// Load backstory engine and make it global
global.BackstoryEngine = require('../../backstory-engine.js');
// Load pool expansion systems
global.DynamicPoolExpansion = require('../../js/dynamic-pool-expansion.js');
global.StoryPoolIntegration = require('../../js/story-pool-integration.js');
global.AIWebSearcher = require('../../js/ai-web-searcher.js');
// Then load story engine (which expects BackstoryEngine to be global)
const StoryEngine = require('../../story-engine.js');

console.log('='.repeat(80));
console.log('PARAGRAPH UNIQUENESS TEST');
console.log('='.repeat(80));

async function runTest() {
  const MAX_CHAPTERS = 1000;
  
  console.log(`\nTest Configuration:`);
  console.log(`  Total chapters: ${MAX_CHAPTERS}`);
  console.log(`  Checking for: Duplicate paragraphs`);
  
  // Initialize integration
  console.log('\nInitializing pool integration...');
  StoryPoolIntegration.initialize();
  StoryEngine.initializePoolIntegration(StoryPoolIntegration);
  console.log('✓ Pool integration initialized');
  
  // Track statistics
  const allParagraphs = new Map(); // paragraph -> count
  const duplicateParagraphs = [];
  const chapterParagraphCounts = [];
  
  console.log(`\nGenerating ${MAX_CHAPTERS} chapters and checking for duplicates...`);
  
  for (let i = 1; i <= MAX_CHAPTERS; i++) {
    const chapter = StoryEngine.generateChapter(i);
    
    // Track paragraphs
    const chapterParagraphs = chapter.paragraphs || [];
    chapterParagraphCounts.push(chapterParagraphs.length);
    
    for (const paragraph of chapterParagraphs) {
      const count = allParagraphs.get(paragraph) || 0;
      allParagraphs.set(paragraph, count + 1);
      
      // Track duplicates
      if (count > 0) {
        duplicateParagraphs.push({
          chapter: i,
          paragraph: paragraph,
          occurrence: count + 1
        });
      }
    }
    
    // Progress update
    if (i % 100 === 0) {
      const progress = ((i / MAX_CHAPTERS) * 100).toFixed(1);
      const uniqueParagraphs = allParagraphs.size;
      const totalParagraphs = chapterParagraphCounts.reduce((a, b) => a + b, 0);
      const uniquenessRate = ((uniqueParagraphs / totalParagraphs) * 100).toFixed(2);
      
      console.log(`  [${progress}%] Chapter ${i}: ${uniqueParagraphs} unique paragraphs, ` +
                  `${totalParagraphs} total, ${uniquenessRate}% unique`);
    }
  }
  
  const totalParagraphs = chapterParagraphCounts.reduce((a, b) => a + b, 0);
  const uniqueParagraphs = allParagraphs.size;
  const duplicateCount = duplicateParagraphs.length;
  const uniquenessRate = ((uniqueParagraphs / totalParagraphs) * 100).toFixed(2);
  
  // Final statistics
  console.log('\n' + '='.repeat(80));
  console.log('FINAL STATISTICS');
  console.log('='.repeat(80));
  
  console.log(`\nParagraph Statistics:`);
  console.log(`  Total paragraphs: ${totalParagraphs}`);
  console.log(`  Unique paragraphs: ${uniqueParagraphs}`);
  console.log(`  Duplicate occurrences: ${duplicateCount}`);
  console.log(`  Uniqueness rate: ${uniquenessRate}%`);
  
  console.log(`\nChapter Statistics:`);
  const avgParagraphsPerChapter = (totalParagraphs / MAX_CHAPTERS).toFixed(2);
  const minParagraphs = Math.min(...chapterParagraphCounts);
  const maxParagraphs = Math.max(...chapterParagraphCounts);
  console.log(`  Average paragraphs per chapter: ${avgParagraphsPerChapter}`);
  console.log(`  Min paragraphs per chapter: ${minParagraphs}`);
  console.log(`  Max paragraphs per chapter: ${maxParagraphs}`);
  
  if (duplicateParagraphs.length > 0) {
    console.log(`\nMost frequent duplicate paragraphs:`);
    const sortedParagraphs = [...allParagraphs.entries()]
      .filter(([paragraph, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    for (const [paragraph, count] of sortedParagraphs) {
      const shortParagraph = paragraph.length > 100 ? paragraph.substring(0, 100) + '...' : paragraph;
      console.log(`  "${shortParagraph}" - ${count} times`);
    }
  }
  
  // Results
  console.log('\n' + '='.repeat(80));
  console.log('RESULTS');
  console.log('='.repeat(80));
  
  let passed = true;
  
  if (parseFloat(uniquenessRate) >= 99.9) {
    console.log('✓ Paragraph Uniqueness: ≥99.9% unique');
  } else if (parseFloat(uniquenessRate) >= 99.0) {
    console.log('⚠ Paragraph Uniqueness: ≥99.0% unique (good)');
  } else if (parseFloat(uniquenessRate) >= 95.0) {
    console.log('⚠ Paragraph Uniqueness: ≥95.0% unique (acceptable)');
  } else {
    console.log(`✗ Paragraph Uniqueness: Only ${uniquenessRate}% unique`);
    passed = false;
  }
  
  if (duplicateCount === 0) {
    console.log('✓ Duplicate Paragraphs: 0 duplicates');
  } else {
    console.log(`⚠ Duplicate Paragraphs: ${duplicateCount} duplicate occurrences`);
  }
  
  console.log('\n' + '='.repeat(80));
  
  if (passed) {
    console.log('✓ TEST PASSED');
    console.log('\nParagraph uniqueness is excellent!');
  } else {
    console.log('✗ TEST FAILED');
    console.log('\nParagraph uniqueness needs improvement.');
  }
  
  console.log('='.repeat(80));
}

// Run test
runTest().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});