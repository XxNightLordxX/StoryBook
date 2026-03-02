const fs = require('fs');

// Read content-pools.js
try {
    const content = fs.readFileSync('content-pools.js', 'utf8');
    const lines = content.split('\n');
    
    console.log(`Total lines in content-pools.js: ${lines.length}`);
    console.log('\nFirst 100 lines:');
    for (let i = 0; i < Math.min(100, lines.length); i++) {
        console.log(`${i+1}: ${lines[i].substring(0, 150)}`);
    }
    
    // Find all const declarations
    console.log('\n\nAll const declarations:');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('const ')) {
            console.log(`Line ${i+1}: ${lines[i].trim()}`);
        }
    }
    
    // Count paragraphs in each section
    console.log('\n\nParagraph counts:');
    let currentSection = null;
    let paragraphCount = 0;
    for (const line of lines) {
        if (line.trim().startsWith('const ')) {
            if (currentSection) {
                console.log(`${currentSection}: ${paragraphCount} paragraphs`);
            }
            currentSection = line.trim().split('=')[0].replace('const ', '');
            paragraphCount = 0;
        } else if (line.trim().startsWith('"') && line.trim().endsWith('",')) {
            paragraphCount++;
        }
    }
    if (currentSection) {
        console.log(`${currentSection}: ${paragraphCount} paragraphs`);
    }
} catch (error) {
    console.error('Error reading file:', error.message);
}