const fs = require('fs');

try {
    const content = fs.readFileSync('content-pools.js', 'utf8');
    console.log('File read successfully!');
    console.log('First 500 characters:');
    console.log(content.substring(0, 500));
    console.log('\n\nTotal length:', content.length);
} catch (error) {
    console.error('Error:', error.message);
}