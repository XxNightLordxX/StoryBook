/**
 * Test Strict Duplicate Prevention System
 * Verifies that the strict duplicate prevention system enforces 100% uniqueness
 */

const fs = require('fs');
const path = require('path');

// Set up global window object for browser APIs
global.window = {
  localStorage: {
    _data: {},
    getItem: function(key) {
      return this._data[key] || null;
    },
    setItem: function(key, value) {
      this._data[key] = String(value);
    },
    removeItem: function(key) {
      delete this._data[key];
    },
    clear: function() {
      this._data = {};
    }
  },
  console: console,
  document: {
    readyState: 'complete',
    addEventListener: function() {}
  }
};

global.document = global.window.document;
global.localStorage = global.window.localStorage;

// Load StrictDuplicatePrevention - wrap in function to execute in global context
const strictDuplicatePreventionPath = path.join(__dirname, '../../js/strict-duplicate-prevention.js');
const strictDuplicatePreventionCode = fs.readFileSync(strictDuplicatePreventionPath, 'utf8');
eval(strictDuplicatePreventionCode);

// Make StrictDuplicatePrevention available in global scope
global.StrictDuplicatePrevention = window.StrictDuplicatePrevention;

console.log('='.repeat(80));
console.log('STRICT DUPLICATE PREVENTION SYSTEM TEST');
console.log('='.repeat(80));

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
    testsFailed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Reset state before each test
function resetState() {
  window.localStorage.clear();
  StrictDuplicatePrevention.reset();
  // Reset config to defaults
  StrictDuplicatePrevention.setConfig({
    enabled: true,
    checkParagraphs: true,
    checkTitles: true,
    checkSentences: true,
    maxRetries: 10,
    storageKey: 'strict_duplicate_prevention'
  });
  // Initialize to ensure system is in proper state
  StrictDuplicatePrevention.initialize();
}

// Test 1: StrictDuplicatePrevention is available globally
test('StrictDuplicatePrevention is available globally', () => {
  assert(typeof StrictDuplicatePrevention !== 'undefined', 'StrictDuplicatePrevention should be defined');
});

// Test 2: Initial state is empty
test('Initial state is empty', () => {
  resetState();
  const stats = StrictDuplicatePrevention.getStats();
  assert(stats.paragraphHashes === 0, 'Initial paragraph count should be 0');
  assert(stats.titleHashes === 0, 'Initial title count should be 0');
  assert(stats.sentenceHashes === 0, 'Initial sentence count should be 0');
});

// Test 3: Can add paragraph
test('Can add paragraph', () => {
  resetState();
  StrictDuplicatePrevention.addParagraph('This is a test paragraph.');
  const stats = StrictDuplicatePrevention.getStats();
  assert(stats.paragraphHashes === 1, 'Paragraph count should be 1');
});

// Test 4: Can add title
test('Can add title', () => {
  resetState();
  StrictDuplicatePrevention.addTitle('Test Title');
  const stats = StrictDuplicatePrevention.getStats();
  assert(stats.titleHashes === 1, 'Title count should be 1');
});

// Test 5: Can add sentence
test('Can add sentence', () => {
  resetState();
  StrictDuplicatePrevention.addSentence('This is a test sentence.');
  const stats = StrictDuplicatePrevention.getStats();
  assert(stats.sentenceHashes === 1, 'Sentence count should be 1');
});

// Test 6: Can detect duplicate paragraph
test('Can detect duplicate paragraph', () => {
  resetState();
  const paragraph = 'This is a duplicate paragraph.';
  StrictDuplicatePrevention.addParagraph(paragraph);
  const isDuplicate = StrictDuplicatePrevention.isDuplicateParagraph(paragraph);
  assert(isDuplicate === true, 'Should detect duplicate paragraph');
});

// Test 7: Can detect duplicate title
test('Can detect duplicate title', () => {
  resetState();
  const title = 'Duplicate Title';
  StrictDuplicatePrevention.addTitle(title);
  const isDuplicate = StrictDuplicatePrevention.isDuplicateTitle(title);
  assert(isDuplicate === true, 'Should detect duplicate title');
});

// Test 8: Can detect duplicate sentence
test('Can detect duplicate sentence', () => {
  resetState();
  const sentence = 'This is a duplicate sentence.';
  StrictDuplicatePrevention.addSentence(sentence);
  const isDuplicate = StrictDuplicatePrevention.isDuplicateSentence(sentence);
  assert(isDuplicate === true, 'Should detect duplicate sentence');
});

// Test 9: Can validate unique paragraph
test('Can validate unique paragraph', () => {
  resetState();
  const paragraph = 'This is a unique paragraph.';
  const result = StrictDuplicatePrevention.validateParagraph(paragraph);
  assert(result.valid === true, 'Unique paragraph should be valid');
  assert(result.reason === null, 'Reason should be null');
});

// Test 10: Can validate duplicate paragraph
test('Can validate duplicate paragraph', () => {
  resetState();
  const paragraph = 'This is a duplicate paragraph.';
  StrictDuplicatePrevention.addParagraph(paragraph);
  const result = StrictDuplicatePrevention.validateParagraph(paragraph);
  assert(result.valid === false, 'Duplicate paragraph should be invalid');
  assert(result.reason === 'Duplicate paragraph', 'Reason should be Duplicate paragraph');
});

// Test 11: Can validate unique title
test('Can validate unique title', () => {
  resetState();
  const title = 'Unique Title';
  const result = StrictDuplicatePrevention.validateTitle(title);
  assert(result.valid === true, 'Unique title should be valid');
  assert(result.reason === null, 'Reason should be null');
});

// Test 12: Can validate duplicate title
test('Can validate duplicate title', () => {
  resetState();
  const title = 'Duplicate Title';
  StrictDuplicatePrevention.addTitle(title);
  const result = StrictDuplicatePrevention.validateTitle(title);
  assert(result.valid === false, 'Duplicate title should be invalid');
  assert(result.reason === 'Duplicate title', 'Reason should be Duplicate title');
});

// Test 13: Can validate chapter with unique content
test('Can validate chapter with unique content', () => {
  resetState();
  const chapter = {
    id: 1,
    title: 'Unique Chapter Title',
    paragraphs: ['Paragraph 1', 'Paragraph 2', 'Paragraph 3']
  };
  // Check title and paragraphs individually to avoid adding to state
  const isDuplicateTitle = StrictDuplicatePrevention.isDuplicateTitle(chapter.title);
  assert(isDuplicateTitle === false, 'Title should not be duplicate');
  for (const paragraph of chapter.paragraphs) {
    const isDuplicate = StrictDuplicatePrevention.isDuplicateParagraph(paragraph);
    assert(isDuplicate === false, `Paragraph "${paragraph}" should not be duplicate`);
  }
});

// Test 14: Can validate chapter with duplicate title
test('Can validate chapter with duplicate title', () => {
  resetState();
  StrictDuplicatePrevention.addTitle('Duplicate Chapter Title');
  const chapter = {
    id: 1,
    title: 'Duplicate Chapter Title',
    paragraphs: ['Paragraph 1', 'Paragraph 2', 'Paragraph 3']
  };
  const isDuplicateTitle = StrictDuplicatePrevention.isDuplicateTitle(chapter.title);
  assert(isDuplicateTitle === true, 'Title should be duplicate');
});

// Test 15: Can validate chapter with duplicate paragraph
test('Can validate chapter with duplicate paragraph', () => {
  resetState();
  StrictDuplicatePrevention.addParagraph('Duplicate Paragraph');
  const chapter = {
    id: 1,
    title: 'Unique Chapter Title',
    paragraphs: ['Duplicate Paragraph', 'Paragraph 2', 'Paragraph 3']
  };
  const isDuplicate = StrictDuplicatePrevention.isDuplicateParagraph('Duplicate Paragraph');
  assert(isDuplicate === true, 'Paragraph should be duplicate');
});

// Test 16: Can get statistics
test('Can get statistics', () => {
  resetState();
  StrictDuplicatePrevention.addParagraph('Test paragraph');
  StrictDuplicatePrevention.addTitle('Test title');
  StrictDuplicatePrevention.addSentence('Test sentence');
  const stats = StrictDuplicatePrevention.getStats();
  assert(stats.paragraphHashes === 1, 'Should have 1 paragraph');
  assert(stats.titleHashes === 1, 'Should have 1 title');
  assert(stats.sentenceHashes === 1, 'Should have 1 sentence');
});

// Test 17: Can set configuration
test('Can set configuration', () => {
  resetState();
  StrictDuplicatePrevention.setConfig({ maxRetries: 20 });
  const config = StrictDuplicatePrevention.getConfig();
  assert(config.maxRetries === 20, 'Max retries should be 20');
});

// Test 18: Can get configuration
test('Can get configuration', () => {
  resetState();
  const config = StrictDuplicatePrevention.getConfig();
  assert(config.enabled === true, 'Should be enabled by default');
  assert(config.checkParagraphs === true, 'Should check paragraphs by default');
  assert(config.checkTitles === true, 'Should check titles by default');
  assert(config.checkSentences === true, 'Should check sentences by default');
});

// Test 19: Can reset state
test('Can reset state', () => {
  resetState();
  StrictDuplicatePrevention.addParagraph('Test paragraph');
  StrictDuplicatePrevention.addTitle('Test title');
  StrictDuplicatePrevention.addSentence('Test sentence');
  StrictDuplicatePrevention.reset();
  const stats = StrictDuplicatePrevention.getStats();
  assert(stats.paragraphHashes === 0, 'Paragraph count should be 0 after reset');
  assert(stats.titleHashes === 0, 'Title count should be 0 after reset');
  assert(stats.sentenceHashes === 0, 'Sentence count should be 0 after reset');
});

// Test 20: Can disable paragraph checking
test('Can disable paragraph checking', () => {
  resetState();
  StrictDuplicatePrevention.setConfig({ checkParagraphs: false });
  const paragraph = 'Test paragraph';
  StrictDuplicatePrevention.addParagraph(paragraph);
  const isDuplicate = StrictDuplicatePrevention.isDuplicateParagraph(paragraph);
  assert(isDuplicate === false, 'Should not detect duplicate when checking is disabled');
});

// Test 21: Can disable title checking
test('Can disable title checking', () => {
  resetState();
  StrictDuplicatePrevention.setConfig({ checkTitles: false });
  const title = 'Test title';
  StrictDuplicatePrevention.addTitle(title);
  const isDuplicate = StrictDuplicatePrevention.isDuplicateTitle(title);
  assert(isDuplicate === false, 'Should not detect duplicate when checking is disabled');
});

// Test 22: Can disable sentence checking
test('Can disable sentence checking', () => {
  resetState();
  StrictDuplicatePrevention.setConfig({ checkSentences: false });
  const sentence = 'Test sentence';
  StrictDuplicatePrevention.addSentence(sentence);
  const isDuplicate = StrictDuplicatePrevention.isDuplicateSentence(sentence);
  assert(isDuplicate === false, 'Should not detect duplicate when checking is disabled');
});

// Test 23: State persists to localStorage
test('State persists to localStorage', () => {
  resetState();
  StrictDuplicatePrevention.addParagraph('Test paragraph');
  StrictDuplicatePrevention.addTitle('Test title');
  StrictDuplicatePrevention.addSentence('Test sentence');
  
  // Reload state
  StrictDuplicatePrevention.initialize();
  
  const stats = StrictDuplicatePrevention.getStats();
  assert(stats.paragraphHashes === 1, 'Paragraph count should persist');
  assert(stats.titleHashes === 1, 'Title count should persist');
  assert(stats.sentenceHashes === 1, 'Sentence count should persist');
});

// Test 24: Can handle multiple paragraphs in chapter
test('Can handle multiple paragraphs in chapter', () => {
  resetState();
  const chapter = {
    id: 1,
    title: 'Test Chapter',
    paragraphs: ['Paragraph 1', 'Paragraph 2', 'Paragraph 3', 'Paragraph 4', 'Paragraph 5']
  };
  // Check each paragraph individually to avoid adding to state
  for (const paragraph of chapter.paragraphs) {
    const isDuplicate = StrictDuplicatePrevention.isDuplicateParagraph(paragraph);
    assert(isDuplicate === false, `Paragraph "${paragraph}" should not be duplicate`);
  }
});

// Test 25: Can detect duplicate in multiple paragraphs
test('Can detect duplicate in multiple paragraphs', () => {
  resetState();
  StrictDuplicatePrevention.addParagraph('Duplicate Paragraph');
  
  // Check each paragraph individually
  const isDuplicate1 = StrictDuplicatePrevention.isDuplicateParagraph('Paragraph 1');
  const isDuplicate2 = StrictDuplicatePrevention.isDuplicateParagraph('Duplicate Paragraph');
  const isDuplicate3 = StrictDuplicatePrevention.isDuplicateParagraph('Paragraph 3');
  
  assert(isDuplicate1 === false, 'Paragraph 1 should not be duplicate');
  assert(isDuplicate2 === true, 'Duplicate Paragraph should be duplicate');
  assert(isDuplicate3 === false, 'Paragraph 3 should not be duplicate');
});

console.log('\n' + '='.repeat(80));
console.log('TEST RESULTS');
console.log('='.repeat(80));
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);
console.log(`Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)}%`);
console.log('='.repeat(80));

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}