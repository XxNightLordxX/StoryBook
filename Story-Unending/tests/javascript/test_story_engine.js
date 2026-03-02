// Test if StoryEngine is working
const StoryEngine = require('../story-engine.js');

console.log('Testing StoryEngine...');

try {
  const chapter = StoryEngine.generateChapter();
  console.log('Chapter generated successfully!');
  console.log('Title:', chapter.title);
  console.log('Number:', chapter.number);
  console.log('Paragraphs:', chapter.paragraphs.length);
  console.log('MC Level:', chapter.mcSnapshot.level);
} catch (error) {
  console.error('Error generating chapter:', error.message);
  console.error(error.stack);
}