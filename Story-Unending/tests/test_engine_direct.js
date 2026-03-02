// Direct test of story engine without browser

const fs = require('fs');

// Load and execute the backstory engine
const backstoryCode = fs.readFileSync('backstory-engine.js', 'utf8');
// Using Function constructor instead of eval for security

(new Function(backstoryCode))();

// Load and execute the story engine
const storyCode = fs.readFileSync('story-engine.js', 'utf8');
// Using Function constructor instead of eval for security

(new Function(storyCode))();

console.log('=== STORY ENGINE DIRECT TEST ===\n');

// Test 1: Reset Function
try {
  StoryEngine.reset();
  const mc = StoryEngine.getMcState();
  const tracker = StoryEngine.getStoryTracker();
  
  if (mc.level === 1 && mc.hp === 100) {
    console.log('✓ MC state reset correctly');
  } else {
    console.log('✗ MC state NOT reset correctly - Level:', mc.level, 'HP:', mc.hp);
  }
  
  if (tracker.chaptersGenerated === 0 && tracker.usedBackstoryParagraphs.length === 0) {
    console.log('✓ Story tracker reset correctly');
  } else {
    console.log('✗ Story tracker NOT reset correctly');
    console.log('  chaptersGenerated:', tracker.chaptersGenerated);
    console.log('  usedBackstoryParagraphs:', tracker.usedBackstoryParagraphs.length);
  }
  
  if (tracker.usedVRParagraphs && tracker.usedVRParagraphs.length === 0) {
    console.log('✓ usedVRParagraphs reset correctly');
  } else {
    console.log('✗ usedVRParagraphs NOT reset correctly');
  }
} catch (e) {
  console.log('✗ Error testing reset:', e.message);
}

console.log('\n');

// Test 2: Generate chapters and check for duplicates
try {
  const chapters = [];
  const allParagraphs = [];
  
  // Generate 30 chapters
  for (let i = 1; i <= 30; i++) {
    const chapter = StoryEngine.generateChapter();
    chapters.push(chapter);
    allParagraphs.push(...chapter.paragraphs);
  }
  
  // Check for duplicate titles
  const uniqueTitles = new Set(chapters.map(c => c.title));
  if (uniqueTitles.size === chapters.length) {
    console.log('✓ No duplicate chapter titles');
  } else {
    console.log('✗ DUPLICATE CHAPTER TITLES FOUND!');
    const duplicates = chapters.map(c => c.title).filter((title, index) => chapters.map(c => c.title).indexOf(title) !== index);
    console.log('  Duplicates:', [...new Set(duplicates)]);
  }
  
  // Check for duplicate paragraphs within chapters
  let hasIntraChapterDuplicates = false;
  chapters.forEach((ch, idx) => {
    const uniqueParas = new Set(ch.paragraphs);
    if (uniqueParas.size !== ch.paragraphs.length) {
      console.log(`✗ Chapter ${idx + 1} has duplicate paragraphs within itself`);
      hasIntraChapterDuplicates = true;
    }
  });
  if (!hasIntraChapterDuplicates) {
    console.log('✓ No duplicate paragraphs within chapters');
  }
  
  // Check for duplicate paragraphs across chapters
  const uniqueAllParas = new Set(allParagraphs);
  if (uniqueAllParas.size === allParagraphs.length) {
    console.log('✓ No duplicate paragraphs across chapters');
  } else {
    console.log('✗ DUPLICATE PARAGRAPHS ACROSS CHAPTERS!');
    console.log(`  Total paragraphs: ${allParagraphs.length}`);
    console.log(`  Unique paragraphs: ${uniqueAllParas.size}`);
    console.log(`  Duplicates: ${allParagraphs.length - uniqueAllParas.size}`);
    
    // Find which chapters have duplicates
    const seen = new Map();
    allParagraphs.forEach((p, idx) => {
      if (seen.has(p)) {
        console.log(`  Duplicate found: "${p.substring(0, 80)}..."`);
      }
      seen.set(p, true);
    });
  }
  
} catch (e) {
  console.log('✗ Error testing chapter generation:', e.message);
  console.log(e.stack);
}

console.log('\n');

// Test 3: Check word counts
try {
  StoryEngine.reset();
  const chapters = [];
  
  // Generate 30 chapters
  for (let i = 1; i <= 30; i++) {
    const chapter = StoryEngine.generateChapter();
    chapters.push(chapter);
  }
  
  let below1000 = 0;
  let below950 = 0;
  let below900 = 0;
  let minWords = Infinity;
  let maxWords = 0;
  let totalWords = 0;
  
  chapters.forEach((ch, idx) => {
    const wordCount = ch.wordCount;
    if (wordCount < 1000) below1000++;
    if (wordCount < 950) below950++;
    if (wordCount < 900) below900++;
    minWords = Math.min(minWords, wordCount);
    maxWords = Math.max(maxWords, wordCount);
    totalWords += wordCount;
    
    if (idx < 10) { // Show first 10
      console.log(`  Chapter ${idx + 1}: ${wordCount} words`);
    }
  });
  
  const avgWords = Math.round(totalWords / chapters.length);
  
  console.log(`\n  Total chapters: ${chapters.length}`);
  console.log(`  Min words: ${minWords}`);
  console.log(`  Max words: ${maxWords}`);
  console.log(`  Avg words: ${avgWords}`);
  console.log(`  Below 1000 words: ${below1000}`);
  console.log(`  Below 950 words: ${below950}`);
  console.log(`  Below 900 words: ${below900}`);
  
  if (below1000 === 0) {
    console.log('✓ All chapters meet 1000 word minimum');
  } else {
    console.log('✗ Some chapters are below 1000 words');
  }
  
} catch (e) {
  console.log('✗ Error testing word counts:', e.message);
  console.log(e.stack);
}

console.log('\n=== TEST COMPLETE ===');