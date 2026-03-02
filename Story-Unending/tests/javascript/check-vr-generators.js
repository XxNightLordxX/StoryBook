const fs = require('fs');
const code = fs.readFileSync('story-engine.js', 'utf8');

// Extract generator functions
const generators = [
  'generateExplorationParagraphs',
  'generateCombatParagraphs',
  'generateIntrospectionParagraphs',
  'generateSisterMomentParagraphs',
  'generateExtractionParagraphs',
  'generateVampirePowerParagraphs',
  'generateLoreDiscoveryParagraphs',
  'generateFlashbackParagraphs',
  'generateSocialParagraphs',
  'generateWorldEventParagraphs',
  'generateGenericParagraphs'
];

console.log('VR Paragraph Generator Analysis:\n');

for (const gen of generators) {
  const match = code.match(new RegExp(`function ${gen}\\([^)]*\\)\\s*\\{([^}]+\\{[^}]*\\}[^}]*)\\}`, 's'));
  if (match) {
    const body = match[1];
    const paras = body.match(/"[^"]{100,}"/g);
    if (paras) {
      console.log(`${gen}: ${paras.length} paragraphs`);
    }
  }
}