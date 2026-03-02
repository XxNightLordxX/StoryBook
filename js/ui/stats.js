/**
 * Statistics and badge updates
 * Extracted from index.html
 */


(function() {
  
  const updateBadge = () => {
    DOMHelpers.safeGetElement('badgeCount').textContent = AppState.totalGenerated;
  };

  // ============================================
  // STATS BAR
  // ============================================
  const getChapterStats = (chapterNum) => {
    // Get MC state snapshot from the specific chapter
    const chapter = AppState.chapters[chapterNum - 1];
    if (chapter && chapter.mcSnapshot) {
      return { mc: chapter.mcSnapshot, tracker: chapter.trackerSnapshot };
    }
    // Fallback to current state
    return { mc: StoryEngine.getMcState(), tracker: StoryEngine.getStoryTracker() };
  };

  const updateStatsBar = () => {
    // Stats bar removed from top — all stats now in dropdown menu
    updateDropdownStats();
  };

  // Create namespace object
  const UIStats = {
    updateBadge: updateBadge,
    getChapterStats: getChapterStats,
    updateStatsBar: updateStatsBar
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.UIStats = UIStats;
    window.updateBadge = updateBadge;
    window.getChapterStats = getChapterStats;
    window.updateStatsBar = updateStatsBar;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIStats;
  }
})();