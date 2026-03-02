/**
 * Test reading functions with proper browser environment mocking
 */

// Mock localStorage
global.localStorage = {
  getItem: (key) => null,
  setItem: (key, value) => {},
  removeItem: (key) => {},
  clear: () => {}
};

// Mock document
global.document = {
  getElementById: (id) => null,
  querySelector: (selector) => null,
  querySelectorAll: (selector) => [],
  createElement: (tag) => ({
    style: {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    appendChild: () => {},
    innerHTML: '',
    textContent: ''
  })
};

// Mock window
global.window = {
  currentTextSize: 16,
  AppState: {
    currentChapter: 1,
    totalGenerated: 0,
    chapters: []
  },
  localStorage: global.localStorage,
  document: global.document
};

// Load engines
global.BackstoryEngine = require('./backstory-engine.js');
const StoryEngine = require('./story-engine.js');

// Load navigation module
const navigationCode = require('fs').readFileSync('./js/modules/navigation.js', 'utf8');
eval(navigationCode);

// Load misc module (contains showChapter)
const miscCode = require('fs').readFileSync('./js/modules/misc.js', 'utf8');
eval(miscCode);

console.log('='.repeat(80));
console.log('READING FUNCTIONS TEST (WITH MOCKED BROWSER ENVIRONMENT)');
console.log('='.repeat(80));

// Test 1: Generate some chapters
console.log('\nTest 1: Generating chapters...');
for (let i = 1; i <= 10; i++) {
  const chapter = StoryEngine.generateChapter();
  window.AppState.chapters.push(chapter);
  window.AppState.totalGenerated = i;
  console.log(`  Generated chapter ${i}: "${chapter.title}" (ID: ${chapter.id})`);
}

// Test 2: Check if functions exist
console.log('\nTest 2: Checking reading functions...');
const functionsToCheck = [
  'showChapter',
  'nextChapter',
  'prevChapter',
  'jumpToChapter',
  'jumpToLatestChapter',
  'setChapterSpeed',
  'getChapterStats'
];

functionsToCheck.forEach(funcName => {
  const exists = typeof window[funcName] === 'function';
  console.log(`  ${funcName}: ${exists ? '✓ Available' : '✗ Not Available'}`);
});

// Test 3: Test navigation
console.log('\nTest 3: Testing navigation functions...');
try {
  if (typeof window.nextChapter === 'function') {
    console.log('  Testing nextChapter...');
    window.nextChapter();
    console.log(`  ✓ nextChapter() called - Current chapter: ${window.AppState.currentChapter}`);
  }
  
  if (typeof window.prevChapter === 'function') {
    console.log('  Testing prevChapter...');
    window.prevChapter();
    console.log(`  ✓ prevChapter() called - Current chapter: ${window.AppState.currentChapter}`);
  }
  
  if (typeof window.jumpToLatestChapter === 'function') {
    console.log('  Testing jumpToLatestChapter...');
    window.jumpToLatestChapter();
    console.log(`  ✓ jumpToLatestChapter() called - Current chapter: ${window.AppState.currentChapter}`);
  }
} catch (error) {
  console.log(`  ✗ Error: ${error.message}`);
}

// Test 4: Test showChapter
console.log('\nTest 4: Testing showChapter...');
try {
  if (typeof window.showChapter === 'function') {
    console.log('  Testing showChapter(5)...');
    window.showChapter(5);
    console.log(`  ✓ showChapter(5) called successfully - Current chapter: ${window.AppState.currentChapter}`);
  }
} catch (error) {
  console.log(`  ✗ Error: ${error.message}`);
}

// Test 5: Test getChapterStats
console.log('\nTest 5: Testing getChapterStats...');
try {
  if (typeof window.getChapterStats === 'function') {
    console.log('  Testing getChapterStats(5)...');
    const stats = window.getChapterStats(5);
    console.log(`  ✓ getChapterStats(5) returned:`, stats ? 'stats object' : 'null/undefined');
  }
} catch (error) {
  console.log(`  ✗ Error: ${error.message}`);
}

console.log('\n' + '='.repeat(80));
console.log('READING FUNCTIONS TEST COMPLETE');
console.log('='.repeat(80));