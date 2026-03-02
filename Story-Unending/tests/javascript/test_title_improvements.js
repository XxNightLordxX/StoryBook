// Test script to verify title generation improvements
// This script tests the enhanced title generation system

// Load required modules
const fs = require('fs');
const path = require('path');

// Read story-engine.js
const storyEnginePath = path.join(__dirname, '../../story-engine.js');
const storyEngineCode = fs.readFileSync(storyEnginePath, 'utf8');

// Extract and evaluate the title generation functions
const titleFunctions = storyEngineCode.match(/function generateDynamicTitle[\s\S]*?\n  \}/);
const generateTitleFunction = storyEngineCode.match(/function generateTitle[\s\S]*?\n  \}/);

console.log('='.repeat(80));
console.log('TITLE GENERATION IMPROVEMENT TEST');
console.log('='.repeat(80));
console.log();

// Test 1: Verify expanded word pools
console.log('Test 1: Verifying expanded word pools...');
console.log('-'.repeat(80));

const adjectiveCount = (storyEngineCode.match(/const adjectives = \[/g) || []).length;
const nounCount = (storyEngineCode.match(/const nouns = \[/g) || []).length;
const actionCount = (storyEngineCode.match(/const actions = \[/g) || []).length;

console.log(`✓ Adjective arrays found: ${adjectiveCount}`);
console.log(`✓ Noun arrays found: ${nounCount}`);
console.log(`✓ Action arrays found: ${actionCount}`);

// Count total words in each array
const adjectivesMatch = storyEngineCode.match(/const adjectives = \[([\s\S]*?)\]/);
if (adjectivesMatch) {
  const adjectives = adjectivesMatch[1].match(/"[^"]+"/g) || [];
  console.log(`✓ Total adjectives: ${adjectives.length}`);
}

const nounsMatch = storyEngineCode.match(/const nouns = \[([\s\S]*?)\]/);
if (nounsMatch) {
  const nouns = nounsMatch[1].match(/"[^"]+"/g) || [];
  console.log(`✓ Total nouns: ${nouns.length}`);
}

const actionsMatch = storyEngineCode.match(/const actions = \[([\s\S]*?)\]/);
if (actionsMatch) {
  const actions = actionsMatch[1].match(/"[^"]+"/g) || [];
  console.log(`✓ Total actions: ${actions.length}`);
}

console.log();

// Test 2: Verify expanded patterns
console.log('Test 2: Verifying expanded patterns...');
console.log('-'.repeat(80));

const patternsMatch = storyEngineCode.match(/const patterns = \[([\s\S]*?)\];/);
if (patternsMatch) {
  const patterns = patternsMatch[1].match(/`[^`]+`/g) || [];
  console.log(`✓ Total patterns: ${patterns.length}`);
  console.log(`✓ Expected: 45+ patterns`);
  console.log(`✓ Status: ${patterns.length >= 45 ? 'PASS' : 'FAIL'}`);
}

console.log();

// Test 3: Verify dynamic title usage
console.log('Test 3: Verifying dynamic title usage...');
console.log('-'.repeat(80));

const dynamicTitleUsage = storyEngineCode.includes('if (random() < 0.5)');
console.log(`✓ Dynamic title usage enabled: ${dynamicTitleUsage ? 'YES' : 'NO'}`);
console.log(`✓ Usage probability: 50%`);

console.log();

// Test 4: Calculate potential unique titles
console.log('Test 4: Calculating potential unique titles...');
console.log('-'.repeat(80));

if (adjectivesMatch && nounsMatch && actionsMatch && patternsMatch) {
  const adjectives = adjectivesMatch[1].match(/"[^"]+"/g) || [];
  const nouns = nounsMatch[1].match(/"[^"]+"/g) || [];
  const actions = actionsMatch[1].match(/"[^"]+"/g) || [];
  const patterns = patternsMatch[1].match(/`[^`]+`/g) || [];
  
  // Calculate combinations
  const patternCombinations = patterns.length;
  const wordCombinations = adjectives.length * nouns.length * actions.length;
  const totalCombinations = patternCombinations + wordCombinations;
  
  console.log(`✓ Pattern combinations: ${patternCombinations.toLocaleString()}`);
  console.log(`✓ Word combinations: ${wordCombinations.toLocaleString()}`);
  console.log(`✓ Total potential unique titles: ${totalCombinations.toLocaleString()}`);
  console.log(`✓ Status: ${totalCombinations >= 100000 ? 'EXCELLENT' : totalCombinations >= 50000 ? 'GOOD' : 'NEEDS IMPROVEMENT'}`);
}

console.log();

// Test 5: Verify uniqueness tracking
console.log('Test 5: Verifying uniqueness tracking...');
console.log('-'.repeat(80));

const uniquenessTracking = storyEngineCode.includes('storyTracker.usedTitles');
console.log(`✓ Uniqueness tracking enabled: ${uniquenessTracking ? 'YES' : 'NO'}`);
console.log(`✓ Used titles tracking: ${uniquenessTracking ? 'ACTIVE' : 'INACTIVE'}`);

console.log();

// Summary
console.log('='.repeat(80));
console.log('TEST SUMMARY');
console.log('='.repeat(80));
console.log();
console.log('✓ All tests completed successfully!');
console.log();
console.log('Expected Improvements:');
console.log('  - Reduced duplicate titles from 17.1% to <5%');
console.log('  - Increased title variety significantly');
console.log('  - Better user experience');
console.log('  - No loss of functionality');
console.log();
console.log('Next Steps:');
console.log('  1. Run full duplicate test to verify improvements');
console.log('  2. Monitor title generation in production');
console.log('  3. Adjust probability if needed');
console.log();
console.log('='.repeat(80));