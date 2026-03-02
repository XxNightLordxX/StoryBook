
const fs = require('fs');
const vm = require('vm');

// Load the engines
const storyEngineCode = fs.readFileSync('story-engine.js', 'utf8');
const backstoryEngineCode = fs.readFileSync('backstory-engine.js', 'utf8');
const webContentCode = fs.readFileSync('js/web-content-discovery.js', 'utf8');
const poolExpansionCode = fs.readFileSync('js/dynamic-pool-expansion.js', 'utf8');
const uniquenessCode = fs.readFileSync('js/uniqueness-tracker.js', 'utf8');
const integrationCode = fs.readFileSync('js/ever-expanding-integration.js', 'utf8');

// Execute in a sandboxed context
const context = vm.createContext({
    console: console,
    Math: Math,
    Date: Date,
    JSON: JSON,
    Set: Set,
    Map: Map,
    Array: Array,
    Object: Object,
    String: String,
    Number: Number,
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    Error: Error,
    RegExp: RegExp,
    Promise: Promise,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    window: {},
    document: { addEventListener: () => {} }
});

try {
    // Execute modules in order
    vm.runInContext(backstoryEngineCode, context);
    vm.runInContext(storyEngineCode, context);
    vm.runInContext(webContentCode, context);
    vm.runInContext(poolExpansionCode, context);
    vm.runInContext(uniquenessCode, context);
    vm.runInContext(integrationCode, context);
    
    const StoryEngine = context.window.StoryEngine;
    const EverExpandingIntegration = context.window.EverExpandingIntegration;
    
    if (!StoryEngine) {
        console.error('StoryEngine not found');
        process.exit(1);
    }
    
    // Initialize the integration
    EverExpandingIntegration.initialize(StoryEngine, {
        enableWebSearch: false, // Disable for testing
        enablePoolExpansion: true,
        enableUniquenessTracking: true,
        expansionCount: 10, // Smaller for testing
        autoExpand: true
    });
    
    console.log('✅ Integration initialized');
    
    // Generate test chapters
    const chapters = [];
    const errors = [];
    
    for (let i = 1; i <= 10; i++) {
        try {
            const chapter = StoryEngine.generateChapter();
            chapters.push({
                number: chapter.number,
                title: chapter.title,
                type: chapter.type,
                wordCount: chapter.wordCount,
                paragraphCount: chapter.paragraphs ? chapter.paragraphs.length : 0
            });
            
            console.log(`Generated chapter ${i}: ${chapter.title}`);
        } catch (e) {
            errors.push({
                chapter: i,
                error: e.message
            });
            console.error(`Error generating chapter ${i}:`, e.message);
        }
    }
    
    // Get statistics
    const stats = EverExpandingIntegration.getStats();
    
    console.log('\n' + '='*60);
    console.log('TEST RESULTS');
    console.log('='*60);
    console.log(`Chapters generated: ${chapters.length}`);
    console.log(`Errors: ${errors.length}`);
    console.log(`\nUniqueness stats:`);
    console.log(`  Total content tracked: ${stats.uniqueness?.totalContent || 0}`);
    console.log(`  Total usage: ${stats.uniqueness?.totalUsage || 0}`);
    console.log(`\nPool stats:`);
    console.log(`  Pools registered: ${Object.keys(stats.pools || {}).length}`);
    
    // Check for duplicates
    const titles = chapters.map(c => c.title);
    const uniqueTitles = new Set(titles);
    const duplicateTitles = titles.length - uniqueTitles.size;
    
    console.log(`\nDuplicate analysis:`);
    console.log(`  Duplicate titles: ${duplicateTitles}`);
    console.log(`  Unique titles: ${uniqueTitles.size}`);
    
    const result = {
        success: true,
        chaptersGenerated: chapters.length,
        errors: errors.length,
        duplicateTitles: duplicateTitles,
        uniqueTitles: uniqueTitles.size,
        stats: stats
    };
    
    console.log('\n' + JSON.stringify(result, null, 2));
    
} catch (e) {
    console.error('Fatal error:', e.message);
    console.error(e.stack);
    process.exit(1);
}
