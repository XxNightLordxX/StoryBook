/**
 * Admin Reading Progress Tracker
 * 
 * Tracks admin reading progress and controls chapter generation based on admin reading.
 * Chapters are only generated up to admin reading progress + buffer.
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    bufferChapters: 10,  // Generate buffer chapters ahead of admin reading
    autoGenerate: true,  // Automatically generate chapters when admin reads
    storageKey: 'admin_reading_progress'
  };

  // State
  let state = {
    lastChapterRead: 0,
    lastChapterGenerated: 0,
    generationHistory: []
  };

  // Load state from localStorage
  function loadState() {
    try {
      const saved = localStorage.getItem(config.storageKey);
      if (saved) {
        state = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load admin reading state:', error);
    }
  }

  // Save state to localStorage
  function saveState() {
    try {
      localStorage.setItem(config.storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save admin reading state:', error);
    }
  }

  // Update admin reading progress
  function updateReadingProgress(chapterNum) {
    if (chapterNum > state.lastChapterRead) {
      state.lastChapterRead = chapterNum;
      saveState();
      
      // Auto-generate chapters if enabled
      if (config.autoGenerate) {
        generateChaptersUpToBuffer();
      }
    }
  }

  // Generate chapters up to buffer
  async function generateChaptersUpToBuffer() {
    const targetChapter = state.lastChapterRead + config.bufferChapters;
    
    if (targetChapter <= state.lastChapterGenerated) {
      return;  // Already generated enough chapters
    }

    try {
      for (let i = state.lastChapterGenerated + 1; i <= targetChapter; i++) {
        // Check if chapter already exists
        if (typeof StoryEngine !== 'undefined') {
          const chapter = StoryEngine.generateChapter();
          state.lastChapterGenerated = chapter.id;
          state.generationHistory.push({
            chapterNum: chapter.id,
            timestamp: new Date().toISOString()
          });
          saveState();
        }
      }
    } catch (error) {
      console.error('Failed to generate chapters:', error);
    }
  }

  // Check if chapter can be generated
  function canGenerateChapter(chapterNum) {
    const maxAllowed = state.lastChapterRead + config.bufferChapters;
    return chapterNum <= maxAllowed;
  }

  // Get admin reading progress
  function getReadingProgress() {
    return {
      lastChapterRead: state.lastChapterRead,
      lastChapterGenerated: state.lastChapterGenerated,
      bufferChapters: config.bufferChapters,
      maxAllowedChapter: state.lastChapterRead + config.bufferChapters,
      generationHistory: [...state.generationHistory]
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
      lastChapterRead: 0,
      lastChapterGenerated: 0,
      generationHistory: []
    };
    saveState();
  }

  // Initialize
  function initialize() {
    loadState();
  }

  // Public API
  window.AdminReadingTracker = {
    initialize,
    updateReadingProgress,
    generateChaptersUpToBuffer,
    canGenerateChapter,
    getReadingProgress,
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