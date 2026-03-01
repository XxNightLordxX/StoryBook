/**
 * Text size control functionality
 * Extracted from index.html
 * @module text-size
 */


(function() {
  
// ============================================
// TEXT SIZE CONTROL
// ============================================

/** @type {number} Current text size in pixels */
let currentTextSize = parseInt(localStorage.getItem('ese_textSize')) || 16;

/**
 * Sets the text size for chapter content
 * @param {number|string} size - Text size in pixels
 * @example
 * setTextSize(18); // Sets text size to 18px
 */
const setTextSize = (size) => {
  currentTextSize = parseInt(size);
  if (currentTextSize < 10) currentTextSize = 10;
  if (currentTextSize > 32) currentTextSize = 32;
  localStorage.setItem('ese_textSize', currentTextSize);
  applyTextSize();
  updateTextSizeInput();
}

/**
 * Applies the current text size to chapter content
 * @example
 * applyTextSize(); // Applies current text size
 */
const applyTextSize = () => {
  const chapterBody = document.querySelector('.chapter-body');
  if (chapterBody) {
    chapterBody.style.fontSize = currentTextSize + 'px';
    chapterBody.style.lineHeight = (currentTextSize * 1.7 / 16) + 'em';
  }
}

/**
 * Updates the text size input field with current value
 * @example
 * updateTextSizeInput(); // Updates input field
 */
const updateTextSizeInput = () => {
  const input = DOMHelpers.safeGetElement('textSizeInput');
  if (input) {
    input.value = currentTextSize;
  }
}

/**
 * Increases the text size by 2 pixels
 * @example
 * increaseTextSize(); // Increases text size
 */
const increaseTextSize = () => {
  setTextSize(currentTextSize + 2);
}

/**
 * Decreases the text size by 2 pixels
 * @example
 * decreaseTextSize(); // Decreases text size
 */
const decreaseTextSize = () => {
  setTextSize(currentTextSize - 2);
}

/**
 * Resets the text size to default (16px)
 * @example
 * resetTextSize(); // Resets to default
 */
const resetTextSize = () => {
  setTextSize(16);
}

  // Create namespace object
  const UITextSize = {
    setTextSize: setTextSize,
    applyTextSize: applyTextSize,
    updateTextSizeInput: updateTextSizeInput,
    increaseTextSize: increaseTextSize,
    decreaseTextSize: decreaseTextSize,
    resetTextSize: resetTextSize
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.UITextSize = UITextSize;
    window.setTextSize = setTextSize;
    window.applyTextSize = applyTextSize;
    window.updateTextSizeInput = updateTextSizeInput;
    window.increaseTextSize = increaseTextSize;
    window.decreaseTextSize = decreaseTextSize;
    window.resetTextSize = resetTextSize;
    window.currentTextSize = currentTextSize;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = UITextSize;
  }
})();