const fs = require('fs');
const backstoryEngineCode = fs.readFileSync('backstory-engine.js', 'utf8');

const mockWindow = {
  localStorage: {
    getItem: (key) => null,
    setItem: (key, value) => {},
    removeItem: (key) => {}
  }
};

const evalBackstoryEngine = new Function('window', backstoryEngineCode + '\nreturn BackstoryEngine;');
const BackstoryEngine = evalBackstoryEngine(mockWindow);

// Call all generators multiple times to see if they return overlapping paragraphs
const allParas = [];
const generators = [
  'generateBackstoryLifeParagraphs',
  'generateBackstorySisterParagraphs',
  'generateBackstoryParentsParagraphs',
  'generateBackstoryStruggleParagraphs',
  'generateBackstoryVRHypeParagraphs',
  'generateBackstoryHeadsetParagraphs'
];

for (const genName of generators) {
  for (let i = 0; i < 10; i++) {
    const paras = BackstoryEngine[genName](() => Math.random(), () => Math.floor(Math.random() * 10));
    allParas.push(...paras);
  }
}

console.log(`Total paragraphs generated: ${allParas.length}`);
console.log(`Unique paragraphs: ${new Set(allParas).size}`);

// Find duplicates
const seen = new Map();
const duplicates = [];
for (const para of allParas) {
  if (seen.has(para)) {
    duplicates.push({ para, count: seen.get(para) + 1 });
    seen.set(para, seen.get(para) + 1);
  } else {
    seen.set(para, 1);
  }
}

console.log(`\nDuplicate paragraphs found: ${duplicates.length}`);
duplicates.slice(0, 5).forEach(({ para, count }) => {
  console.log(`  (${count}x) ${para.substring(0, 60)}...`);
});