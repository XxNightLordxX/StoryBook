// Comprehensive test script that actually generates chapters

const fs = require('fs');

console.log('=== COMPREHENSIVE STORY ENGINE TEST ===\n');

// Create a test HTML file that will run in browser
const testHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Story Engine Test</title>
</head>
<body>
  <script src="backstory-engine.js"></script>
  <script src="story-engine.js"></script>
  <script>
    const results = {
      resetTest: false,
      duplicateParagraphs: [],
      wordCounts: [],
      chapterTitles: []
    };

    // Test 1: Reset Function
    try {
      StoryEngine.reset();
      const mc = StoryEngine.getMcState();
      const tracker = StoryEngine.getStoryTracker();
      
      if (mc.level === 1 && mc.hp === 100) {
        console.log('✓ MC state reset correctly');
        results.resetTest = true;
      } else {
        console.log('✗ MC state NOT reset correctly');
      }
      
      if (tracker.chaptersGenerated === 0 && tracker.usedBackstoryParagraphs.length === 0 && tracker.usedVRParagraphs.length === 0) {
        console.log('✓ Story tracker reset correctly');
      } else {
        console.log('✗ Story tracker NOT reset correctly');
      }
    } catch (e) {
      console.log('✗ Error testing reset:', e.message);
    }

    console.log('\\n');

    // Test 2: Generate chapters and check for duplicates
    try {
      const chapters = [];
      const allParagraphs = [];
      
      // Generate 30 chapters (mix of backstory and VR)
      for (let i = 1; i <= 30; i++) {
        const chapter = StoryEngine.generateChapter();
        chapters.push(chapter);
        results.chapterTitles.push(chapter.title);
        allParagraphs.push(...chapter.paragraphs);
      }
      
      // Check for duplicate titles
      const uniqueTitles = new Set(results.chapterTitles);
      if (uniqueTitles.size === results.chapterTitles.length) {
        console.log('✓ No duplicate chapter titles');
      } else {
        console.log('✗ DUPLICATE CHAPTER TITLES FOUND!');
      }
      
      // Check for duplicate paragraphs within chapters
      let hasIntraChapterDuplicates = false;
      chapters.forEach((ch, idx) => {
        const uniqueParas = new Set(ch.paragraphs);
        if (uniqueParas.size !== ch.paragraphs.length) {
          console.log(\`✗ Chapter \${idx + 1} has duplicate paragraphs within itself\`);
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
        console.log(\`  Total paragraphs: \${allParagraphs.length}\`);
        console.log(\`  Unique paragraphs: \${uniqueAllParas.size}\`);
        console.log(\`  Duplicates: \${allParagraphs.length - uniqueAllParas.size}\`);
        
        // Find duplicates
        const seen = new Set();
        allParagraphs.forEach(p => {
          if (seen.has(p)) {
            results.duplicateParagraphs.push(p.substring(0, 100) + '...');
          }
          seen.add(p);
        });
      }
      
    } catch (e) {
      console.log('✗ Error testing chapter generation:', e.message);
    }

    console.log('\\n');

    // Test 3: Check word counts
    try {
      StoryEngine.reset();
      const chapters = [];
      
      // Generate 30 chapters
      for (let i = 1; i <= 30; i++) {
        const chapter = StoryEngine.generateChapter();
        chapters.push(chapter);
        results.wordCounts.push(chapter.wordCount);
      }
      
      let below1000 = 0;
      let below950 = 0;
      let below900 = 0;
      
      chapters.forEach((ch, idx) => {
        const wordCount = ch.wordCount;
        if (wordCount < 1000) below1000++;
        if (wordCount < 950) below950++;
        if (wordCount < 900) below900++;
        
        if (idx < 10) { // Show first 10
          console.log(\`  Chapter \${idx + 1}: \${wordCount} words\`);
        }
      });
      
      console.log(\`\\n  Total chapters: \${chapters.length}\`);
      console.log(\`  Below 1000 words: \${below1000}\`);
      console.log(\`  Below 950 words: \${below950}\`);
      console.log(\`  Below 900 words: \${below900}\`);
      
      if (below1000 === 0) {
        console.log('✓ All chapters meet 1000 word minimum');
      } else {
        console.log('✗ Some chapters are below 1000 words');
      }
      
    } catch (e) {
      console.log('✗ Error testing word counts:', e.message);
    }

    console.log('\\n=== TEST COMPLETE ===');
    
    // Output results for parsing
    console.log('\\n---RESULTS---');
    console.log(JSON.stringify(results, null, 2));
  </script>
</body>
</html>
`;

fs.writeFileSync('test.html', testHtml);
console.log('Test HTML file created: test.html');
console.log('To run the test, open test.html in a browser and check the console.');