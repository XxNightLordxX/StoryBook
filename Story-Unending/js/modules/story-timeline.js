/**
 * Story timeline and chapter generation settings
 * Extracted from index.html
 */


(function() {
  
  // STORY TIMELINE
  // ============================================
  const STORY_START = Date.now() - 60000; // 1 minute ago
  let CHAPTER_INTERVAL_MS = parseInt(Storage.getItem('ese_chapterInterval', 30000)) || 30000;
  // Ensure valid value (min 1s, max 1 hour)
  if (isNaN(CHAPTER_INTERVAL_MS) || CHAPTER_INTERVAL_MS < 1000) CHAPTER_INTERVAL_MS = 30000;
  if (CHAPTER_INTERVAL_MS > 3600000) CHAPTER_INTERVAL_MS = 30000;
  const MAX_CHAPTERS = 10000;

  const getTotalChaptersShouldExist = () => {
    const now = Date.now();
    const elapsed = now - STORY_START;
    if (elapsed <= 0) {
      return 1;
    }
    const result = Math.min(MAX_CHAPTERS, Math.max(1, Math.floor(elapsed / CHAPTER_INTERVAL_MS)));
    return result;
  };

  // Create namespace object
  const StoryTimeline = {
    getTotalChaptersShouldExist: getTotalChaptersShouldExist,
    STORY_START: STORY_START,
    MAX_CHAPTERS: MAX_CHAPTERS,
    CHAPTER_INTERVAL_MS: CHAPTER_INTERVAL_MS
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.StoryTimeline = StoryTimeline;
    window.getTotalChaptersShouldExist = getTotalChaptersShouldExist;
    window.STORY_START = STORY_START;
    window.MAX_CHAPTERS = MAX_CHAPTERS;
    window.CHAPTER_INTERVAL_MS = CHAPTER_INTERVAL_MS;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoryTimeline;
  }
})();