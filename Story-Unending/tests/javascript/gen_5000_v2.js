const fs = require('fs');
const vm = require('vm');

// Load the engines
const storyEngineCode = fs.readFileSync('/workspace/story-engine.js', 'utf8');
const backstoryEngineCode = fs.readFileSync('/workspace/backstory-engine.js', 'utf8');

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
    document: { addEventListener: () => {} },
    module: { exports: {} }
});

try {
    // Execute backstory engine first
    vm.runInContext(backstoryEngineCode, context);
    // Then story engine
    vm.runInContext(storyEngineCode, context);
    
    const StoryEngine = context.StoryEngine;
    
    if (!StoryEngine) {
        console.error('StoryEngine not found in context');
        process.exit(1);
    }

const chapters = [];
const errors = [];

for (let i = 1; i <= 5000; i++) {
    try {
        const chapter = StoryEngine.generateChapter();
        chapters.push({
            number: chapter.number,
            title: chapter.title,
            type: chapter.type,
            setting: chapter.setting,
            arc: chapter.arc,
            wordCount: chapter.wordCount,
            paragraphCount: chapter.paragraphs ? chapter.paragraphs.length : 0,
            paragraphs: chapter.paragraphs || [],
            location: chapter.location
        });
        
        if (i % 500 === 0) {
            process.stderr.write('Generated ' + i + '/5000 chapters\n');
        }
    } catch (e) {
        errors.push({
            chapter: i,
            error: e.message,
            stack: e.stack ? e.stack.substring(0, 200) : ''
        });
    }
}

// Output results
const output = {
    totalChapters: chapters.length,
    totalErrors: errors.length,
    errors: errors,
    chapters: chapters
};

// Write to file (too large for stdout)
fs.writeFileSync('/workspace/outputs/chapter_test_results.json', JSON.stringify(output));
console.log(JSON.stringify({
    totalChapters: chapters.length,
    totalErrors: errors.length,
    errorSummary: errors.slice(0, 10)
}));

} catch (e) {
    console.error('Fatal error:', e.message);
    console.error(e.stack);
    process.exit(1);
}