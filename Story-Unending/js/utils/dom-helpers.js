/**
 * DOM Helper Utilities - Null Safety
 * Following UZF-MSR v1.0 Rule 18: Zero-Tolerance Error Policy
 */

(function() {
  /**
   * Safely get element by ID with null check
   * @param {string} id - Element ID
   * @returns {HTMLElement|null} Element or null if not found
   */
  const safeGetElement = (id) => {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`[DOM Helpers] Element not found: ${id}`);
    }
    return element;
  };

  /**
   * Safely set element text content
   * @param {string} id - Element ID
   * @param {string} text - Text content
   */
  const safeSetText = (id, text) => {
    const element = safeGetElement(id);
    if (element) {
      element.textContent = text;
    }
  };

  /**
   * Safely set element display style
   * @param {string} id - Element ID
   * @param {string} display - Display value (block, none, flex, etc.)
   */
  const safeSetDisplay = (id, display) => {
    const element = safeGetElement(id);
    if (element) {
      element.style.display = display;
    }
  };

  /**
   * Safely add/remove CSS class
   * @param {string} id - Element ID
   * @param {string} className - Class name
   * @param {boolean} add - True to add, false to remove
   */
  const safeToggleClass = (id, className, add) => {
    const element = safeGetElement(id);
    if (element) {
      if (add) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
      }
    }
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.DOMHelpers = {
      safeGetElement: safeGetElement,
      safeSetText: safeSetText,
      safeSetDisplay: safeSetDisplay,
      safeToggleClass: safeToggleClass
    };
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      safeGetElement: safeGetElement,
      safeSetText: safeSetText,
      safeSetDisplay: safeSetDisplay,
      safeToggleClass: safeToggleClass
    };
  }
})();
