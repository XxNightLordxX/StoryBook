/**
 * Helper functions for calculations and utilities
 * Extracted from index.html
 */

(function() {
  const getTotalChaptersShouldExist = () => {
    const elapsed = Date.now() - STORY_START;
    if (elapsed <= 0) return 1;
    return Math.min(MAX_CHAPTERS, Math.max(1, Math.floor(elapsed / CHAPTER_INTERVAL_MS)));
  };

  // Create namespace object
  const Helpers = {
    getTotalChaptersShouldExist: getTotalChaptersShouldExist
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.Helpers = Helpers;
    window.getTotalChaptersShouldExist = getTotalChaptersShouldExist;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Helpers;
  }
})();