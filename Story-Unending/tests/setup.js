// Jest setup file - simplified without jsdom
// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] !== undefined ? store[key] : null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i) => Object.keys(store)[i] || null
  };
})();

global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] !== undefined ? store[key] : null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i) => Object.keys(store)[i] || null
  };
})();

global.sessionStorage = sessionStorageMock;

// Mock window and document
global.window = {
  localStorage: localStorageMock,
  sessionStorage: sessionStorageMock
};

global.document = {
  createElement: jest.fn(() => ({
    textContent: '',
    innerHTML: '',
    get textContent() { return this._textContent || ''; },
    set textContent(value) { this._textContent = value; },
    get innerHTML() { return this._innerHTML || ''; },
    set innerHTML(value) { this._innerHTML = value; }
  }))
};

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.clear();
  sessionStorageMock.clear();
});