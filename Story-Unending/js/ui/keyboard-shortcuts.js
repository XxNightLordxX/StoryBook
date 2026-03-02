/**
 * Keyboard shortcuts
 * Extracted from index.html
 */


(function() {
  
  // KEYBOARD SHORTCUTS
  // ============================================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { 
      document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active')); 
      if (typeof closeDropdown === 'function') closeDropdown(); 
    }
    if (e.target.matches('input, textarea')) return;
    if (e.key === 's' && typeof toggleSidebar === 'function') toggleSidebar();
    if (e.key === 'm' && typeof toggleDropdown === 'function') toggleDropdown();
    if ((e.key === 'ArrowRight' || e.key === 'n') && typeof nextChapter === 'function') nextChapter();
    if ((e.key === 'ArrowLeft' || e.key === 'p') && typeof prevChapter === 'function') prevChapter();
  });

  // Create namespace object
  const UIKeyboardShortcuts = {
    // Keyboard shortcuts module - runs on load
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.UIKeyboardShortcuts = UIKeyboardShortcuts;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIKeyboardShortcuts;
  }
})();