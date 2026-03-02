const fs = require('fs');
const content = fs.readFileSync('story-engine.js', 'utf8');

const generators = [
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

let modifiedContent = content;
let seedOffset = 1000;

generators.forEach(gen => {
  const regex = new RegExp(`function ${gen}\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\n  \\}`, 's');
  const match = modifiedContent.match(regex);
  
  if (match) {
    let funcBody = match[1];
    const originalBody = funcBody;
    
    // Replace randomFrom calls with randomFromSeeded
    let callCount = 0;
    funcBody = funcBody.replace(/randomFrom\(([^)]+)\)/g, (match, args) => {
      callCount++;
      return `randomFromSeeded(${args}, chapterNum * 1000 + ${seedOffset + callCount})`;
    });
    
    if (funcBody !== originalBody) {
      modifiedContent = modifiedContent.replace(regex, `function ${gen}(chapterNum${gen === 'generateExplorationParagraphs' ? ', setting, region' : gen === 'generateCombatParagraphs' ? ', setting' : gen === 'generateGenericParagraphs' ? ', type, setting' : ''}) {\n${funcBody}\n  }`);
      console.log(`Updated ${gen}: ${callCount} randomFrom calls`);
    }
  }
});

fs.writeFileSync('story-engine.js', modifiedContent);
console.log('\nAll generators updated successfully!');