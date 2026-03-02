/**
 * Chapter navigation and rendering
 * Extracted from index.html
 */


(function() {
  
  const nextChapter = () => {
    if (AppState.currentChapter < AppState.totalGenerated) {
      showChapter(AppState.currentChapter + 1);
    }
  };

  const prevChapter = () => {
    if (AppState.currentChapter > 1) {
      showChapter(AppState.currentChapter - 1);
    }
  };

  // Create namespace object
  const Navigation = {
    nextChapter: nextChapter,
    prevChapter: prevChapter
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.Navigation = Navigation;
    window.nextChapter = nextChapter;
    window.prevChapter = prevChapter;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
  }
})();