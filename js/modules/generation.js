/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Chapter generation and session management
 * Extracted from index.html
 */


(function() {
  
  const initSessionTimer = () => {
    AppState.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - AppState.sessionStart) / 1000);
      const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      const full = `${h}:${m}:${s}`;
      DOMHelpers.safeSetText('ddTimer', full);
    }, 1000);
  };

  // Create namespace object
  const Generation = {
    initSessionTimer: initSessionTimer
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.Generation = Generation;
    window.initSessionTimer = initSessionTimer;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Generation;
  }
})();