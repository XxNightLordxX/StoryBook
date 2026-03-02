/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Dropdown menu functionality
 * Extracted from index.html
 * @module dropdown
 */


(function() {
  
// ============================================
// DROPDOWN
// ============================================

/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Toggles the dropdown menu open/closed
 * @example
 * toggleDropdown(); // Opens or closes dropdown
 */
const toggleDropdown = () => {
  AppState.dropdownOpen = !AppState.dropdownOpen;
  DOMHelpers.safeGetElement('dropdownMenu').classList.toggle('open', AppState.dropdownOpen);
}

/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Closes the dropdown menu
 * @example
 * closeDropdown(); // Closes dropdown
 */
const closeDropdown = () => {
  AppState.dropdownOpen = false;
  DOMHelpers.safeToggleClass('dropdownMenu', 'open', false);
}

/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Initializes click-outside-to-close functionality for dropdown
 * @example
 * initDropdownClose(); // Setup click-outside listener
 */
const initDropdownClose = () => {
  document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.dropdown-wrapper');
    if (wrapper && !wrapper.contains(e.target)) closeDropdown();
  });
}

  // Create namespace object
  const UIDropdown = {
    toggleDropdown: toggleDropdown,
    closeDropdown: closeDropdown,
    initDropdownClose: initDropdownClose
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.UIDropdown = UIDropdown;
    window.toggleDropdown = toggleDropdown;
    window.closeDropdown = closeDropdown;
    window.initDropdownClose = initDropdownClose;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIDropdown;
  }
})();