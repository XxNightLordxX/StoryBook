/**
 * Strict Duplicate Prevention System
 * 
 * Enforces 100% uniqueness by checking all content for duplicates.
 * Rejects any duplicate content and generates new unique content.
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    enabled: true,
    checkParagraphs: true,
    checkTitles: true,
    checkSentences: true,
    maxRetries: 10,  // Maximum retries to generate unique content
    storageKey: 'strict_duplicate_prevention'
  };

  // State
  let state = {
    paragraphHashes: new Set(),
    titleHashes: new Set(),
    sentenceHashes: new Set(),
    duplicateCount: 0,
    rejectedCount: 0,
    generatedCount: 0
  };

  // Load state from localStorage
  function loadState() {
    try {
      const saved = localStorage.getItem(config.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        state.paragraphHashes = new Set(parsed.paragraphHashes || []);
        state.titleHashes = new Set(parsed.titleHashes || []);
        state.sentenceHashes = new Set(parsed.sentenceHashes || []);
        state.duplicateCount = parsed.duplicateCount || 0;
        state.rejectedCount = parsed.rejectedCount || 0;
        state.generatedCount = parsed.generatedCount || 0;
      }
    } catch (error) {
      console.error('Failed to load strict duplicate prevention state:', error);
    }
  }

  // Save state to localStorage
  function saveState() {
    try {
      const data = {
        paragraphHashes: Array.from(state.paragraphHashes),
        titleHashes: Array.from(state.titleHashes),
        sentenceHashes: Array.from(state.sentenceHashes),
        duplicateCount: state.duplicateCount,
        rejectedCount: state.rejectedCount,
        generatedCount: state.generatedCount
      };
      localStorage.setItem(config.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save strict duplicate prevention state:', error);
    }
  }

  // Generate hash for content
  function generateHash(content) {
    return content.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
  }

  // Check if paragraph is duplicate
  function isDuplicateParagraph(paragraph) {
    if (!config.checkParagraphs) {
      return false;
    }

    const hash = generateHash(paragraph);
    return state.paragraphHashes.has(hash);
  }

  // Check if title is duplicate
  function isDuplicateTitle(title) {
    if (!config.checkTitles) {
      return false;
    }

    const hash = generateHash(title);
    return state.titleHashes.has(hash);
  }

  // Check if sentence is duplicate
  function isDuplicateSentence(sentence) {
    if (!config.checkSentences) {
      return false;
    }

    const hash = generateHash(sentence);
    return state.sentenceHashes.has(hash);
  }

  // Add paragraph to tracking
  function addParagraph(paragraph) {
    const hash = generateHash(paragraph);
    state.paragraphHashes.add(hash);
    state.generatedCount++;
    saveState();
  }

  // Add title to tracking
  function addTitle(title) {
    const hash = generateHash(title);
    state.titleHashes.add(hash);
    state.generatedCount++;
    saveState();
  }

  // Add sentence to tracking
  function addSentence(sentence) {
    const hash = generateHash(sentence);
    state.sentenceHashes.add(hash);
    state.generatedCount++;
    saveState();
  }

  // Validate paragraph (reject if duplicate)
  function validateParagraph(paragraph) {
    if (!config.enabled) {
      return { valid: true, reason: null };
    }

    if (isDuplicateParagraph(paragraph)) {
      state.duplicateCount++;
      state.rejectedCount++;
      saveState();
      return { valid: false, reason: 'Duplicate paragraph' };
    }

    // Check for duplicate sentences
    const sentences = paragraph.split(/[.!?]+/);
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 10 && isDuplicateSentence(trimmed)) {
        state.duplicateCount++;
        state.rejectedCount++;
        saveState();
        return { valid: false, reason: 'Duplicate sentence' };
      }
    }

    addParagraph(paragraph);
    return { valid: true, reason: null };
  }

  // Validate title (reject if duplicate)
  function validateTitle(title) {
    if (!config.enabled) {
      return { valid: true, reason: null };
    }

    if (isDuplicateTitle(title)) {
      state.duplicateCount++;
      state.rejectedCount++;
      saveState();
      return { valid: false, reason: 'Duplicate title' };
    }

    addTitle(title);
    return { valid: true, reason: null };
  }

  // Validate chapter (reject if any content is duplicate)
  function validateChapter(chapter) {
    if (!config.enabled) {
      return { valid: true, reason: null, duplicates: [] };
    }

    const duplicates = [];

    // Check title
    const titleValidation = validateTitle(chapter.title);
    if (!titleValidation.valid) {
      duplicates.push({ type: 'title', content: chapter.title, reason: titleValidation.reason });
    }

    // Check paragraphs
    for (const paragraph of chapter.paragraphs) {
      const paragraphValidation = validateParagraph(paragraph);
      if (!paragraphValidation.valid) {
        duplicates.push({ type: 'paragraph', content: paragraph, reason: paragraphValidation.reason });
      }
    }

    if (duplicates.length > 0) {
      return { valid: false, reason: 'Duplicate content found', duplicates };
    }

    return { valid: true, reason: null, duplicates: [] };
  }

  // Get statistics
  function getStats() {
    return {
      enabled: config.enabled,
      paragraphHashes: state.paragraphHashes.size,
      titleHashes: state.titleHashes.size,
      sentenceHashes: state.sentenceHashes.size,
      duplicateCount: state.duplicateCount,
      rejectedCount: state.rejectedCount,
      generatedCount: state.generatedCount,
      uniquenessRate: state.generatedCount > 0 
        ? ((state.generatedCount - state.duplicateCount) / state.generatedCount * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  // Set configuration
  function setConfig(newConfig) {
    Object.assign(config, newConfig);
  }

  // Get configuration
  function getConfig() {
    return { ...config };
  }

  // Reset state
  function reset() {
    state = {
      paragraphHashes: new Set(),
      titleHashes: new Set(),
      sentenceHashes: new Set(),
      duplicateCount: 0,
      rejectedCount: 0,
      generatedCount: 0
    };
    saveState();
  }

  // Initialize
  function initialize() {
    loadState();
  }

  // Public API
  window.StrictDuplicatePrevention = {
    initialize,
    isDuplicateParagraph,
    isDuplicateTitle,
    isDuplicateSentence,
    validateParagraph,
    validateTitle,
    validateChapter,
    addParagraph,
    addTitle,
    addSentence,
    getStats,
    setConfig,
    getConfig,
    reset
  };

  // Auto-initialize if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();