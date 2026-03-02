const fs = require('fs');
const code = fs.readFileSync('backstory-engine.js', 'utf8');

// Count paragraphs (strings in quotes)
const paragraphs = code.match(/"[^"]{100,}"/g);
console.log(`Total paragraphs in backstory-engine.js: ${paragraphs ? paragraphs.length : 0}`);