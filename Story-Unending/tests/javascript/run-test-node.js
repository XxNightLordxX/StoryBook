// Node.js version of the comprehensive test
const fs = require('fs');

// Load backstory engine first and make it global
global.BackstoryEngine = require('./backstory-engine.js');

// Load story engine
const storyEngine = require('./story-engine.js');

// Initialize results
const results = {
    totalChapters: 5000,
    duplicateTitles: [],
    consecutiveDuplicates: [],
    duplicateParagraphs: [],
    lowWordCount: [],
    chapterTypes: {},
    settings: {},
    arcProgression: [],
    statProgression: [],
    startTime: Date.now()
};

// Track seen titles and paragraphs
const seenTitles = new Set();
const seenParagraphs = new Set();
let lastTitle = '';

console.log('🚀 Starting Comprehensive 5000 Chapter Test...');
console.log('⏳ Generating and testing 5000 chapters...\n');

for (let i = 1; i <= 5000; i++) {
    // Generate chapter
    const chapter = storyEngine.generateChapter(i);
    
    // Build content from paragraphs
    const content = chapter.paragraphs ? chapter.paragraphs.join('\n\n') : '';
    
    // Check for duplicate titles
    if (seenTitles.has(chapter.title)) {
        results.duplicateTitles.push({
            chapter: i,
            title: chapter.title,
            firstSeen: Array.from(seenTitles).indexOf(chapter.title) + 1
        });
    }
    seenTitles.add(chapter.title);
    
    // Check for consecutive duplicates
    if (chapter.title === lastTitle) {
        results.consecutiveDuplicates.push({
            chapter: i,
            title: chapter.title
        });
    }
    lastTitle = chapter.title;
    
    // Check for duplicate paragraphs
    const paragraphs = content.split('\n\n');
    paragraphs.forEach((para, idx) => {
        if (para.length > 50 && seenParagraphs.has(para)) {
            results.duplicateParagraphs.push({
                chapter: i,
                paragraph: idx + 1,
                text: para.substring(0, 100) + '...'
            });
        }
        seenParagraphs.add(para);
    });
    
    // Check word count
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 1000) {
        results.lowWordCount.push({
            chapter: i,
            wordCount: wordCount,
            title: chapter.title
        });
    }
    
    // Track chapter types
    results.chapterTypes[chapter.type] = (results.chapterTypes[chapter.type] || 0) + 1;
    
    // Track settings
    results.settings[chapter.setting] = (results.settings[chapter.setting] || 0) + 1;
    
    // Track arc progression
    results.arcProgression.push({
        chapter: i,
        arc: chapter.arc
    });
    
    // Track stat progression
    results.statProgression.push({
        chapter: i,
        stats: { ...chapter.stats }
    });
    
    // Progress update every 100 chapters
    if (i % 100 === 0) {
        console.log(`✅ Progress: ${i}/5000 chapters tested`);
    }
}

results.endTime = Date.now();
results.duration = (results.endTime - results.startTime) / 1000;

// Generate report
console.log('\n📊 COMPREHENSIVE TEST RESULTS');
console.log('='.repeat(60));
console.log(`Total Chapters Tested: ${results.totalChapters}`);
console.log(`Duration: ${results.duration.toFixed(2)} seconds`);
console.log(`\n🔍 DUPLICATE TITLES: ${results.duplicateTitles.length}`);
if (results.duplicateTitles.length > 0) {
    console.log('First 10 duplicates:', results.duplicateTitles.slice(0, 10));
}
console.log(`\n🔍 CONSECUTIVE DUPLICATES: ${results.consecutiveDuplicates.length}`);
if (results.consecutiveDuplicates.length > 0) {
    console.log('First 10 consecutive:', results.consecutiveDuplicates.slice(0, 10));
}
console.log(`\n🔍 DUPLICATE PARAGRAPHS: ${results.duplicateParagraphs.length}`);
if (results.duplicateParagraphs.length > 0) {
    console.log('First 10 duplicate paragraphs:', results.duplicateParagraphs.slice(0, 10));
}
console.log(`\n🔍 LOW WORD COUNT (<1000): ${results.lowWordCount.length}`);
if (results.lowWordCount.length > 0) {
    console.log('First 10 low word count:', results.lowWordCount.slice(0, 10));
}
console.log(`\n📈 CHAPTER TYPE DISTRIBUTION:`);
console.table(results.chapterTypes);
console.log(`\n🌍 SETTING DISTRIBUTION:`);
console.table(results.settings);

// Save results to file
fs.writeFileSync('comprehensive-test-results.json', JSON.stringify(results, null, 2));
console.log('\n💾 Results saved to: comprehensive-test-results.json');
console.log('\n✅ Test completed successfully!');