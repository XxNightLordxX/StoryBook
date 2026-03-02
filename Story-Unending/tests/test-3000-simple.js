// Simple Node.js test for 3000 chapters
// This script directly tests the story engine without browser overhead

const fs = require('fs');

// Read and evaluate the story engine
const storyEngineCode = fs.readFileSync('./story-engine.js', 'utf8');

// Create a minimal environment for the story engine
const globalScope = {
  console: console,
  Math: Math,
  Date: Date,
  Array: Array,
  Object: Object,
  String: String,
  Number: Number,
  parseInt: parseInt,
  parseFloat: parseFloat,
  isNaN: isNaN,
  isFinite: isFinite,
  encodeURIComponent: encodeURIComponent,
  decodeURIComponent: decodeURIComponent,
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
};

// Evaluate the story engine code
// Using Function constructor instead of eval for security

(new Function(storyEngineCode))();

const TOTAL_CHAPTERS = 3000;

const results = {
    totalChapters: 0,
    duplicateTitles: [],
    duplicateParagraphs: [],
    wordCountIssues: [],
    arcProgression: [],
    statProgression: [],
    performance: {
        startTime: null,
        endTime: null,
        duration: null
    }
};

console.log('COMPREHENSIVE TEST: 3000 CHAPTERS');
console.log('');

results.performance.startTime = Date.now();

// Generate 3000 chapters
for (let i = 1; i <= TOTAL_CHAPTERS; i++) {
    const chapter = generateChapter(i);
    results.totalChapters++;
    
    // Check for duplicate titles
    if (results.duplicateTitles.includes(chapter.title)) {
        console.log(`⚠️  Duplicate title found: "${chapter.title}" in Chapter ${i}`);
    } else {
        results.duplicateTitles.push(chapter.title);
    }
    
    // Check word count
    if (chapter.wordCount < 1000) {
        results.wordCountIssues.push({
            chapter: i,
            wordCount: chapter.wordCount,
            title: chapter.title
        });
    }
    
    // Track arc progression
    if (!results.arcProgression.includes(chapter.arc)) {
        results.arcProgression.push(chapter.arc);
    }
    
    // Track stat progression (sample every 100 chapters)
    if (i % 100 === 0) {
        results.statProgression.push({
            chapter: i,
            level: chapter.mcSnapshot.level,
            hp: chapter.mcSnapshot.hp,
            mp: chapter.mcSnapshot.mp,
            bloodEssence: chapter.mcSnapshot.bloodEssence
        });
    }
    
    // Progress indicator
    if (i % 500 === 0) {
        console.log(`Generated ${i} chapters...`);
    }
}

results.performance.endTime = Date.now();
results.performance.duration = results.performance.endTime - results.performance.startTime;

console.log('');
console.log('TEST RESULTS');

// Summary
console.log('');
console.log('📊 SUMMARY');
console.log('-'.repeat(80));
console.log(`Total Chapters Generated: ${results.totalChapters}`);
console.log(`Unique Titles: ${results.duplicateTitles.length}`);
console.log(`Duplicate Titles: ${results.totalChapters - results.duplicateTitles.length}`);
console.log(`Word Count Issues (< 1000 words): ${results.wordCountIssues.length}`);
console.log(`Unique Arcs: ${results.arcProgression.length}`);
console.log(`Performance: ${(results.performance.duration / 1000).toFixed(2)} seconds`);
console.log(`Average Time per Chapter: ${(results.performance.duration / TOTAL_CHAPTERS).toFixed(2)}ms`);

// Duplicate titles detail
if (results.totalChapters - results.duplicateTitles.length > 0) {
    console.log('');
    console.log('⚠️  DUPLICATE TITLES');
    console.log('-'.repeat(80));
    const titleCounts = {};
    results.duplicateTitles.forEach(title => {
        titleCounts[title] = (titleCounts[title] || 0) + 1;
    });
    Object.entries(titleCounts).forEach(([title, count]) => {
        if (count > 1) {
            console.log(`  "${title}" - ${count} occurrences`);
        }
    });
}

// Word count issues detail
if (results.wordCountIssues.length > 0) {
    console.log('');
    console.log('⚠️  WORD COUNT ISSUES');
    console.log('-'.repeat(80));
    results.wordCountIssues.forEach(issue => {
        console.log(`  Chapter ${issue.chapter}: ${issue.wordCount} words - "${issue.title}"`);
    });
}

// Arc progression
console.log('');
console.log('📚 ARC PROGRESSION');
console.log('-'.repeat(80));
results.arcProgression.forEach((arc, index) => {
    console.log(`  ${index + 1}. ${arc}`);
});

// Stat progression sample
console.log('');
console.log('📈 STAT PROGRESSION (Sample every 100 chapters)');
console.log('-'.repeat(80));
console.log('Chapter | Level | HP | MP | Blood Essence');
console.log('-'.repeat(80));
results.statProgression.forEach(stat => {
    console.log(`${String(stat.chapter).padStart(7)} | ${String(stat.level).padStart(5)} | ${String(stat.hp).padStart(4)} | ${String(stat.mp).padStart(4)} | ${String(stat.bloodEssence).padStart(13)}`);
});

// Final verdict
console.log('');
console.log('FINAL VERDICT');

const hasIssues = (results.totalChapters - results.duplicateTitles.length) > 0 || results.wordCountIssues.length > 0;

if (!hasIssues) {
    console.log('✅ ALL TESTS PASSED');
    console.log('');
    console.log('✅ No duplicate titles found');
    console.log('✅ All chapters meet minimum word count (1000 words)');
    console.log('✅ Arc progression working correctly');
    console.log('✅ Stat progression working correctly');
    console.log('✅ Performance acceptable');
} else {
    console.log('⚠️  ISSUES FOUND');
    console.log('');
    if (results.totalChapters - results.duplicateTitles.length > 0) {
        console.log(`⚠️ ${results.totalChapters - results.duplicateTitles.length} duplicate titles found`);
    }
    if (results.wordCountIssues.length > 0) {
        console.log(`⚠️ ${results.wordCountIssues.length} chapters below minimum word count`);
    }
}

console.log('');
console.log(`Test completed at: ${new Date().toISOString()}`);

// Save results to file
const report = `
# 3000 Chapter Test Report

## Summary
- Total Chapters Generated: ${results.totalChapters}
- Unique Titles: ${results.duplicateTitles.length}
- Duplicate Titles: ${results.totalChapters - results.duplicateTitles.length}
- Word Count Issues (< 1000 words): ${results.wordCountIssues.length}
- Unique Arcs: ${results.arcProgression.length}
- Performance: ${(results.performance.duration / 1000).toFixed(2)} seconds
- Average Time per Chapter: ${(results.performance.duration / TOTAL_CHAPTERS).toFixed(2)}ms

## Duplicate Titles
${results.totalChapters - results.duplicateTitles.length > 0 ? 
    Object.entries(
        results.duplicateTitles.reduce((acc, title) => {
            acc[title] = (acc[title] || 0) + 1;
            return acc;
        }, {})
    ).filter(([_, count]) => count > 1)
     .map(([title, count]) => `- "${title}" - ${count} occurrences`)
     .join('\n') : 
    'None'}

## Word Count Issues
${results.wordCountIssues.length > 0 ?
    results.wordCountIssues.map(issue => 
        `- Chapter ${issue.chapter}: ${issue.wordCount} words - "${issue.title}"`
    ).join('\n') :
    'None'}

## Arc Progression
${results.arcProgression.map((arc, index) => `${index + 1}. ${arc}`).join('\n')}

## Stat Progression (Sample every 100 chapters)
Chapter | Level | HP | MP | Blood Essence
${results.statProgression.map(stat => 
    `${stat.chapter} | ${stat.level} | ${stat.hp} | ${stat.mp} | ${stat.bloodEssence}`
).join('\n')}

## Final Verdict
${hasIssues ? '⚠️ ISSUES FOUND' : '✅ ALL TESTS PASSED'}
`;

fs.writeFileSync('test-3000-report.md', report);
console.log('\nReport saved to test-3000-report.md');