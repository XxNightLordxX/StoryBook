const fs = require('fs');
const vm = require('vm');

// Load the engines
const storyEngineCode = fs.readFileSync('story-engine.js', 'utf8');
const backstoryEngineCode = fs.readFileSync('backstory-engine.js', 'utf8');

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
    // Don't define module - this will trigger the browser export path
});

try {
    // Execute backstory engine first
    vm.runInContext(backstoryEngineCode, context);
    console.log("BackstoryEngine:", context.BackstoryEngine ? "Found" : "Not found");
    console.log("window.BackstoryEngine:", context.window.BackstoryEngine ? "Found" : "Not found");
    
    // Then story engine
    vm.runInContext(storyEngineCode, context);
    console.log("StoryEngine:", context.StoryEngine ? "Found" : "Not found");
    console.log("window.StoryEngine:", context.window.StoryEngine ? "Found" : "Not found");
    
    // Try to generate a chapter
    const StoryEngine = context.window.StoryEngine || context.StoryEngine;
    if (StoryEngine) {
        const chapter = StoryEngine.generateChapter();
        console.log("Generated chapter:", chapter.title);
    } else {
        console.error("StoryEngine not found in context");
        console.log("Available keys:", Object.keys(context).filter(k => !['console', 'Math', 'Date', 'JSON', 'Set', 'Map', 'Array', 'Object', 'String', 'Number', 'parseInt', 'parseFloat', 'isNaN', 'Error', 'RegExp', 'Promise', 'setTimeout', 'clearTimeout', 'window', 'document'].includes(k)));
    }
} catch (e) {
    console.error('Fatal error:', e.message);
    console.error(e.stack);
}