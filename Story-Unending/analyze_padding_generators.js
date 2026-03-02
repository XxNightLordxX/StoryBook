const fs = require('fs');
const content = fs.readFileSync('story-engine.js', 'utf8');

const generators = [
  { name: 'generateExplorationParagraphs', start: 'function generateExplorationParagraphs', end: 'function generateCombatParagraphs' },
  { name: 'generateCombatParagraphs', start: 'function generateCombatParagraphs', end: 'function generateIntrospectionParagraphs' },
  { name: 'generateIntrospectionParagraphs', start: 'function generateIntrospectionParagraphs', end: 'function generateSisterMomentParagraphs' },
  { name: 'generateSisterMomentParagraphs', start: 'function generateSisterMomentParagraphs', end: 'function generateExtractionParagraphs' },
  { name: 'generateExtractionParagraphs', start: 'function generateExtractionParagraphs', end: 'function generateVampirePowerParagraphs' },
  { name: 'generateVampirePowerParagraphs', start: 'function generateVampirePowerParagraphs', end: 'function generateLoreDiscoveryParagraphs' },
  { name: 'generateLoreDiscoveryParagraphs', start: 'function generateLoreDiscoveryParagraphs', end: 'function generateFlashbackParagraphs' },
  { name: 'generateFlashbackParagraphs', start: 'function generateFlashbackParagraphs', end: 'function generateSocialParagraphs' },
  { name: 'generateSocialParagraphs', start: 'function generateSocialParagraphs', end: 'function generateWorldEventParagraphs' },
  { name: 'generateWorldEventParagraphs', start: 'function generateWorldEventParagraphs', end: 'function generateGenericParagraphs' }
];

console.log('Padding Generator Analysis\n');
console.log('='.repeat(80));

let totalTemplates = 0;

generators.forEach(gen => {
  const startIdx = content.indexOf(gen.start);
  const endIdx = content.indexOf(gen.end, startIdx);
  
  if (startIdx === -1 || endIdx === -1) {
    console.log(`\n${gen.name}: NOT FOUND`);
    return;
  }
  
  const funcBody = content.substring(startIdx, endIdx);
  
  // Count all array assignments
  const arrayMatches = funcBody.matchAll(/const (\w+)\s*=\s*\[([\s\S]*?)\];/g);
  let arrays = [];
  
  for (const match of arrayMatches) {
    const arrayName = match[1];
    const arrayContent = match[2];
    const count = arrayContent.split(',').filter(s => s.trim() && s.trim() !== '' && !s.trim().startsWith('//')).length;
    if (count > 0) {
      arrays.push({ name: arrayName, count });
    }
  }
  
  // Calculate total combinations
  let combinations = 1;
  arrays.forEach(arr => {
    combinations *= arr.count;
  });
  
  totalTemplates += combinations;
  
  console.log(`\n${gen.name}:`);
  arrays.forEach(arr => {
    console.log(`  ${arr.name}: ${arr.count} templates`);
  });
  console.log(`  Total combinations: ${combinations}`);
});

console.log('\n' + '='.repeat(80));
console.log(`Total unique paragraphs across all generators: ${totalTemplates}`);
console.log(`Target for 5000 chapters (15 per chapter): 75,000`);
console.log(`Shortfall: ${75000 - totalTemplates}`);