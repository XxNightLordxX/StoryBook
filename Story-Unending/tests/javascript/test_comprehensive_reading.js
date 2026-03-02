/**
 * Comprehensive test of reading functions with proper module loading order
 */

// Mock browser environment
global.localStorage = {
  getItem: (key) => null,
  setItem: (key, value) => {},
  removeItem: (key) => {},
  clear: () => {}
};

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

global.window = {
  currentTextSize: 16,
  localStorage: global.localStorage,
  document: global.document
};

console.log('='.repeat(80));
console.log('COMPREHENSIVE READING FUNCTIONS TEST');
console.log('='.repeat(80));

// Load modules in correct order (same as index.html)
console.log('\nLoading modules...');

// 1. Load backstory engine
console.log('  1. Loading backstory-engine.js...');
global.BackstoryEngine = require('./backstory-engine.js');

// 2. Load story engine
console.log('  2. Loading story-engine.js...');
const StoryEngine = require('./story-engine.js');

// 3. Load app-state module
console.log('  3. Loading js/modules/app-state.js...');
const appStateCode = require('fs').readFileSync('./js/modules/app-state.js', 'utf8');
eval(appStateCode);

// 4. Load navigation module
console.log('  4. Loading js/modules/navigation.js...');
const navigationCode = require('fs').readFileSync('./js/modules/navigation.js', 'utf8');
eval(navigationCode);

// 5. Load misc module (contains showChapter and other reading functions)
console.log('  5. Loading js/modules/misc.js...');
const miscCode = require('fs').readFileSync('./js/modules/misc.js', 'utf8');
eval(miscCode);

// 6. Load sidebar module (contains jumpToChapter)
console.log('  6. Loading js/ui/sidebar.js...');
const sidebarCode = require('fs').readFileSync('./js/ui/sidebar.js', 'utf8');
eval(sidebarCode);

console.log('  ✓ All modules loaded successfully\n');

// Test 1: Generate some chapters
console.log('Test 1: Generating chapters...');
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
    console.log('  Testing nextChapter()...');
    window.nextChapter();
    console.log(`  ✓ nextChapter() called - Current chapter: ${window.AppState.currentChapter}`);
  }
  
  if (typeof window.prevChapter === 'function') {
    console.log('  Testing prevChapter()...');
    window.prevChapter();
    console.log(`  ✓ prevChapter() called - Current chapter: ${window.AppState.currentChapter}`);
  }
  
  if (typeof window.jumpToLatestChapter === 'function') {
    console.log('  Testing jumpToLatestChapter()...');
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
    if (stats) {
      console.log(`    - MC state: ${stats.mc ? 'present' : 'missing'}`);
      console.log(`    - Tracker: ${stats.tracker ? 'present' : 'missing'}`);
    }
  }
} catch (error) {
  console.log(`  ✗ Error: ${error.message}`);
}

// Test 6: Test jumpToChapter
console.log('\nTest 6: Testing jumpToChapter...');
try {
  if (typeof window.jumpToChapter === 'function') {
    console.log('  Testing jumpToChapter(3)...');
    window.jumpToChapter(3);
    console.log(`  ✓ jumpToChapter(3) called successfully - Current chapter: ${window.AppState.currentChapter}`);
  }
} catch (error) {
  console.log(`  ✗ Error: ${error.message}`);
}

console.log('\n' + '='.repeat(80));
console.log('COMPREHENSIVE READING FUNCTIONS TEST COMPLETE');
console.log('='.repeat(80));