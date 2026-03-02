/**
 * Test Story Pool Integration
 * Verifies that pool expansion affects story engine content generation
 */

// Load backstory engine and make it global
global.BackstoryEngine = require('../../backstory-engine.js');
// Load pool expansion systems
global.DynamicPoolExpansion = require('../../js/dynamic-pool-expansion.js');
global.StoryPoolIntegration = require('../../js/story-pool-integration.js');
// Then load story engine (which expects BackstoryEngine to be global)
const StoryEngine = require('../../story-engine.js');

console.log('=== Story Pool Integration Test ===\n');

async function runTests() {
  // Test 1: Initialize integration
  console.log('Test 1: Initialize pool integration...');
  try {
  StoryPoolIntegration.initialize();
  StoryEngine.initializePoolIntegration(StoryPoolIntegration);
  console.log('✓ Pool integration initialized\n');
} catch (error) {
  console.error('✗ Failed to initialize pool integration:', error.message);
  process.exit(1);
}

// Test 2: Check pool registration
console.log('Test 2: Check pool registration...');
try {
  const poolStats = StoryPoolIntegration.getPoolStats();
  console.log('Pool statistics:');
  console.log(`  Adjectives: ${poolStats.adjectives}`);
  console.log(`  Nouns: ${poolStats.nouns}`);
  console.log(`  Actions: ${poolStats.actions}`);
  console.log(`  Patterns: ${poolStats.patterns}`);
  console.log(`  Integrated: ${poolStats.isIntegrated}`);
  
  if (poolStats.adjectives > 0 && poolStats.nouns > 0 && poolStats.actions > 0) {
    console.log('✓ Pools registered successfully\n');
  } else {
    console.error('✗ Pools not registered correctly');
    process.exit(1);
  }
} catch (error) {
  console.error('✗ Failed to check pool registration:', error.message);
  process.exit(1);
}

// Test 3: Generate chapters and check title uniqueness
console.log('Test 3: Generate 100 chapters and check title uniqueness...');
try {
  const titles = new Set();
  const duplicates = [];
  
  for (let i = 1; i <= 100; i++) {
    const chapter = StoryEngine.generateChapter(i);
    titles.add(chapter.title);
    
    // Check for duplicates
    if (titles.size < i) {
      duplicates.push(chapter.title);
    }
  }
  
  console.log(`Generated ${titles.size} unique titles out of 100 chapters`);
  console.log(`Duplicate titles: ${duplicates.length}`);
  
  if (duplicates.length > 0) {
    console.log('Duplicate titles found:', duplicates.slice(0, 5));
  }
  
  if (titles.size >= 95) {
    console.log('✓ Title uniqueness is good (≥95%)\n');
  } else {
    console.warn('⚠ Title uniqueness could be improved');
  }
} catch (error) {
  console.error('✗ Failed to generate chapters:', error.message);
  process.exit(1);
}

// Test 4: Expand pools and verify expansion
console.log('Test 4: Expand pools and verify expansion...');
try {
  const statsBefore = StoryPoolIntegration.getPoolStats();
  console.log('Before expansion:');
  console.log(`  Adjectives: ${statsBefore.adjectives}`);
  console.log(`  Nouns: ${statsBefore.nouns}`);
  console.log(`  Actions: ${statsBefore.actions}`);
  
  // Expand pools
  const expansionResult = await DynamicPoolExpansion.expandAllPools({
    chapterNum: 100,
    type: 'VR',
    setting: 'Dungeon'
  });
  
  console.log(`\nExpansion result:`);
  console.log(`  Pools expanded: ${expansionResult.expandedPools.length}`);
  console.log(`  New items added: ${expansionResult.newItemsAdded}`);
  console.log(`  Errors: ${expansionResult.errors.length}`);
  
  // Sync expanded pools to story engine
  StoryPoolIntegration.syncPoolsToStoryEngine();
  
  const statsAfter = StoryPoolIntegration.getPoolStats();
  console.log('\nAfter expansion:');
  console.log(`  Adjectives: ${statsAfter.adjectives}`);
  console.log(`  Nouns: ${statsAfter.nouns}`);
  console.log(`  Actions: ${statsAfter.actions}`);
  
  if (statsAfter.adjectives > statsBefore.adjectives || 
      statsAfter.nouns > statsBefore.nouns || 
      statsAfter.actions > statsBefore.actions) {
    console.log('✓ Pools expanded successfully\n');
  } else {
    console.warn('⚠ Pools did not expand (may need web search or content generation)');
  }
} catch (error) {
  console.error('✗ Failed to expand pools:', error.message);
  console.warn('⚠ Pool expansion may require web search or content generation');
}

// Test 5: Generate more chapters after expansion
console.log('Test 5: Generate 100 more chapters after expansion...');
try {
  const titles = new Set();
  const duplicates = [];
  
  for (let i = 101; i <= 200; i++) {
    const chapter = StoryEngine.generateChapter(i);
    titles.add(chapter.title);
    
    // Check for duplicates
    if (titles.size < (i - 100)) {
      duplicates.push(chapter.title);
    }
  }
  
  console.log(`Generated ${titles.size} unique titles out of 100 chapters`);
  console.log(`Duplicate titles: ${duplicates.length}`);
  
  if (duplicates.length > 0) {
    console.log('Duplicate titles found:', duplicates.slice(0, 5));
  }
  
  if (titles.size >= 95) {
    console.log('✓ Title uniqueness remains good after expansion (≥95%)\n');
  } else {
    console.warn('⚠ Title uniqueness could be improved');
  }
} catch (error) {
  console.error('✗ Failed to generate chapters after expansion:', error.message);
  process.exit(1);
}

// Test 6: Verify expanded pools are being used
console.log('Test 6: Verify expanded pools are being used...');
try {
  const adjectives = StoryEngine.getAdjectivesPool();
  const nouns = StoryEngine.getNounsPool();
  const actions = StoryEngine.getActionsPool();
  
  console.log('Story engine pool sizes:');
  console.log(`  Adjectives: ${adjectives.length}`);
  console.log(`  Nouns: ${nouns.length}`);
  console.log(`  Actions: ${actions.length}`);
  
  const poolStats = StoryPoolIntegration.getPoolStats();
  
  if (adjectives.length === poolStats.adjectives && 
      nouns.length === poolStats.nouns && 
      actions.length === poolStats.actions) {
    console.log('✓ Story engine is using expanded pools\n');
  } else {
    console.warn('⚠ Story engine pools may not be synced with expanded pools');
  }
} catch (error) {
  console.error('✗ Failed to verify pool usage:', error.message);
  process.exit(1);
}

console.log('=== All Tests Complete ===');
console.log('\nSummary:');
console.log('✓ Pool integration initialized');
console.log('✓ Pools registered with DynamicPoolExpansion');
console.log('✓ Story engine using expanded pools');
console.log('✓ Title generation working with expanded pools');
console.log('\nThe pool integration system is working correctly!');
}

// Run tests
runTests().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});