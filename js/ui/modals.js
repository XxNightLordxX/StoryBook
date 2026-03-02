/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Modal management
 * Extracted from index.html
 * @module modals
 */


(function() {
  
/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Opens a modal by ID
 * @param {string} id - Modal element ID
 * @example
 * openModal('loginOverlay'); // Opens login modal
 */
const openModal = (id) => { 
  DOMHelpers.safeGetElement(id).classList.add('active'); 
}

/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Closes a modal by ID
 * @param {string} id - Modal element ID
 * @example
 * closeModal('loginOverlay'); // Closes login modal
 */
const closeModal = (id) => { 
  DOMHelpers.safeGetElement(id).classList.remove('active'); 
}

/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Closes all open modals
 * @example
 * closeAllModals(); // Closes all modals
 */
const closeAllModals = () => {
  document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
}

  // Create namespace object
  const UIModals = {
    openModal: openModal,
    closeModal: closeModal,
    closeAllModals: closeAllModals
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.UIModals = UIModals;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.closeAllModals = closeAllModals;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIModals;
  }
})();