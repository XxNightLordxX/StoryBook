#!/usr/bin/env python3
"""
Add JSDoc comments to JavaScript modules
"""

import os
import re

print("=" * 60)
print("Adding JSDoc Comments")
print("=" * 60)

# Add JSDoc to security.js
print("\n[1/5] Adding JSDoc to js/utils/security.js...")
security_jsdoc = '''/**
 * Security utilities including sanitization, rate limiting, validation, and error handling
 * Extracted from index.html
 * @module security
 */

// ============================================
// SECURITY - INPUT SANITIZATION
// ============================================

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} str - The string to sanitize
 * @returns {string} The sanitized HTML string
 * @example
 * sanitizeHTML('<script>alert("xss")</script>') // returns '&lt;script&gt;alert("xss")&lt;/script&gt;'
 */
function sanitizeHTML(str) {
  if (typeof str !== 'string') return str;
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

/**
 * Sanitizes attribute values to prevent XSS attacks
 * @param {string} str - The string to sanitize
 * @returns {string} The sanitized attribute value
 * @example
 * sanitizeAttribute('"><script>alert("xss")</script>') // returns '&quot;&gt;&lt;script&gt;alert("xss")&lt;/script&gt;'
 */
function sanitizeAttribute(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================
// SECURITY - RATE LIMITING
// ============================================

/**
 * Rate limiter for preventing abuse
 * @namespace RateLimiter
 * @property {Object} attempts - Object tracking attempts per key
 * @property {number} maxAttempts - Maximum allowed attempts per window
 * @property {number} windowMs - Time window in milliseconds
 */
const RateLimiter = {
  attempts: {},
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  
  /**
   * Checks if an action is allowed based on rate limit
   * @param {string} key - Unique identifier for the action (e.g., username)
   * @returns {boolean} True if action is allowed, false if rate limited
   * @example
   * if (RateLimiter.check('user123')) {
   *   // Allow action
   * } else {
   *   // Rate limited
   * }
   */
  check(key) {
    const now = Date.now();
    if (!this.attempts[key]) {
      this.attempts[key] = { count: 0, resetTime: now + this.windowMs };
    }
    
    const record = this.attempts[key];
    
    // Reset if window expired
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + this.windowMs;
    }
    
    record.count++;
    return record.count <= this.maxAttempts;
  },
  
  /**
   * Gets the number of remaining attempts for a key
   * @param {string} key - Unique identifier for the action
   * @returns {number} Number of remaining attempts
   */
  getRemainingAttempts(key) {
    const record = this.attempts[key];
    if (!record) return this.maxAttempts;
    const now = Date.now();
    if (now > record.resetTime) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - record.count);
  },
  
  /**
   * Gets the timestamp when the rate limit will reset
   * @param {string} key - Unique identifier for the action
   * @returns {number} Reset timestamp in milliseconds
   */
  getResetTime(key) {
    const record = this.attempts[key];
    if (!record) return 0;
    return record.resetTime;
  },
  
  /**
   * Resets the rate limit for a key
   * @param {string} key - Unique identifier for the action
   */
  reset(key) {
    delete this.attempts[key];
  }
};

// ============================================
// SECURITY - INPUT VALIDATION
// ============================================

/**
 * Input validator for various data types
 * @namespace Validator
 * @property {Object} patterns - Regex patterns for validation
 */
const Validator = {
  patterns: {
    username: /^[a-zA-Z0-9_]{3,20}$/,
    email: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
    password: /^.{6,100}$/,
    chapterTitle: /^.{1,100}$/,
    text: /^.{1,10000}$/
  },
  
  /**
   * Validates input against a pattern
   * @param {string} type - Type of validation (username, email, password, etc.)
   * @param {string} value - Value to validate
   * @returns {Object} Validation result with valid and error properties
   * @returns {boolean} returns.valid - True if valid, false otherwise
   * @returns {string|null} returns.error - Error message if invalid, null otherwise
   * @example
   * const result = Validator.validate('email', 'user@example.com');
   * if (result.valid) {
   *   // Email is valid
   * } else {
   *   console.log(result.error);
   * }
   */
  validate(type, value) {
    const pattern = this.patterns[type];
    if (!pattern) return { valid: true, error: null };
    
    if (!value || value.trim() === '') {
      return { valid: false, error: `${type} cannot be empty` };
    }
    
    if (!pattern.test(value)) {
      const messages = {
        username: 'Username must be 3-20 characters (letters, numbers, underscores only)',
        email: 'Please enter a valid email address',
        password: 'Password must be at least 6 characters',
        chapterTitle: 'Title must be 1-100 characters',
        text: 'Text must be 1-10000 characters'
      };
      return { valid: false, error: messages[type] || 'Invalid input' };
    }
    
    return { valid: true, error: null };
  },
  
  /**
   * Sanitizes and validates input
   * @param {string} type - Type of validation
   * @param {string} value - Value to sanitize and validate
   * @returns {Object} Result with sanitized, valid, and error properties
   */
  sanitizeAndValidate(type, value) {
    const sanitized = sanitizeHTML(value.trim());
    const validation = this.validate(type, sanitized);
    return {
      sanitized,
      valid: validation.valid,
      error: validation.error
    };
  }
};

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Centralized error handler
 * @namespace ErrorHandler
 */
const ErrorHandler = {
  /**
   * Handles errors with user-friendly messages
   * @param {Error} error - The error object
   * @param {string} context - Context description for the error
   * @example
   * try {
   *   riskyOperation();
   * } catch (error) {
   *   ErrorHandler.handle(error, 'Data Loading');
   * }
   */
  handle(error, context = 'Operation') {
    console.error(`[${context}] Error:`, error);
    
    // Show user-friendly error message
    const message = error.message || 'An unexpected error occurred';
    showNotification('combat-notif', '❌ Error', `${context} failed: ${message}`);
    
    // Log detailed error for debugging
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  },
  
  /**
   * Safely executes a function with error handling
   * @param {Function} fn - Function to execute
   * @param {string} context - Context description
   * @param {*} fallback - Fallback value if error occurs
   * @returns {*} Result of function or fallback value
   * @example
   * const result = ErrorHandler.safeExecute(() => {
   *   return JSON.parse(data);
   * }, 'JSON Parsing', {});
   */
  safeExecute(fn, context = 'Operation', fallback = null) {
    try {
      return fn();
    } catch (error) {
      this.handle(error, context);
      return fallback;
    }
  },
  
  /**
   * Safely executes an async function with error handling
   * @param {Function} fn - Async function to execute
   * @param {string} context - Context description
   * @param {*} fallback - Fallback value if error occurs
   * @returns {Promise<*>} Promise resolving to result or fallback value
   */
  async safeExecuteAsync(fn, context = 'Operation', fallback = null) {
    try {
      return await fn();
    } catch (error) {
      this.handle(error, context);
      return fallback;
    }
  }
};
'''

with open('js/utils/security.js', 'w') as f:
    f.write(security_jsdoc)
print("✅ JSDoc added to security.js")

# Add JSDoc to storage.js
print("\n[2/5] Adding JSDoc to js/utils/storage.js...")
storage_content = '''/**
 * LocalStorage operations for users, chapters, and content
 * Extracted from index.html
 * @module storage
 */

/**
 * Gets all users from localStorage
 * @returns {Array<Object>} Array of user objects
 * @example
 * const users = getUsers();
 * console.log(users.length);
 */
function getUsers() {
  return ErrorHandler.safeExecute(() => {
    return JSON.parse(localStorage.getItem('ese_users') || '[]');
  }, 'Loading users', []);
}

/**
 * Saves users to localStorage
 * @param {Array<Object>} users - Array of user objects to save
 * @example
 * saveUsers([{ username: 'user1', email: 'user1@example.com' }]);
 */
function saveUsers(users) {
  ErrorHandler.safeExecute(() => {
    localStorage.setItem('ese_users', JSON.stringify(users));
  }, 'Saving users');
}

/**
 * Gets list of used paragraphs from localStorage
 * @returns {Array<string>} Array of used paragraph hashes
 */
function getUsedParagraphs() {
  return ErrorHandler.safeExecute(() => {
    return JSON.parse(localStorage.getItem('ese_usedParagraphs') || '[]');
  }, 'Loading used paragraphs', []);
}

/**
 * Saves list of used paragraphs to localStorage
 * @param {Array<string>} used - Array of used paragraph hashes
 */
function saveUsedParagraphs(used) {
  ErrorHandler.safeExecute(() => {
    localStorage.setItem('ese_usedParagraphs', JSON.stringify(used));
  }, 'Saving used paragraphs');
}

/**
 * Gets chapter content from localStorage
 * @param {number} chapterNum - Chapter number
 * @returns {Object|null} Chapter content object or null if not found
 */
function getChapterContent(chapterNum) {
  return ErrorHandler.safeExecute(() => {
    const content = localStorage.getItem(`ese_chapter_${chapterNum}`);
    return content ? JSON.parse(content) : null;
  }, 'Loading chapter content', null);
}

/**
 * Saves chapter content to localStorage
 * @param {number} chapterNum - Chapter number
 * @param {Object} content - Chapter content object
 */
function saveChapterContent(chapterNum, content) {
  ErrorHandler.safeExecute(() => {
    localStorage.setItem(`ese_chapter_${chapterNum}`, JSON.stringify(content));
  }, 'Saving chapter content');
}
'''

with open('js/utils/storage.js', 'w') as f:
    f.write(storage_content)
print("✅ JSDoc added to storage.js")

# Add JSDoc to dropdown.js
print("\n[3/5] Adding JSDoc to js/ui/dropdown.js...")
dropdown_jsdoc = '''/**
 * Dropdown menu functionality
 * Extracted from index.html
 * @module dropdown
 */

// ============================================
// DROPDOWN
// ============================================

/**
 * Toggles the dropdown menu open/closed
 * @example
 * toggleDropdown(); // Opens or closes dropdown
 */
function toggleDropdown() {
  AppState.dropdownOpen = !AppState.dropdownOpen;
  document.getElementById('dropdownMenu').classList.toggle('open', AppState.dropdownOpen);
}

/**
 * Closes the dropdown menu
 * @example
 * closeDropdown(); // Closes dropdown
 */
function closeDropdown() {
  AppState.dropdownOpen = false;
  document.getElementById('dropdownMenu').classList.remove('open');
}

/**
 * Initializes click-outside-to-close functionality for dropdown
 * @example
 * initDropdownClose(); // Setup click-outside listener
 */
function initDropdownClose() {
  document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.dropdown-wrapper');
    if (wrapper && !wrapper.contains(e.target)) closeDropdown();
  });
}
'''

with open('js/ui/dropdown.js', 'w') as f:
    f.write(dropdown_jsdoc)
print("✅ JSDoc added to dropdown.js")

# Add JSDoc to text-size.js
print("\n[4/5] Adding JSDoc to js/ui/text-size.js...")
textsize_jsdoc = '''/**
 * Text size control functionality
 * Extracted from index.html
 * @module text-size
 */

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
function setTextSize(size) {
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
function applyTextSize() {
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
function updateTextSizeInput() {
  const input = document.getElementById('textSizeInput');
  if (input) {
    input.value = currentTextSize;
  }
}

/**
 * Increases the text size by 2 pixels
 * @example
 * increaseTextSize(); // Increases text size
 */
function increaseTextSize() {
  setTextSize(currentTextSize + 2);
}

/**
 * Decreases the text size by 2 pixels
 * @example
 * decreaseTextSize(); // Decreases text size
 */
function decreaseTextSize() {
  setTextSize(currentTextSize - 2);
}

/**
 * Resets the text size to default (16px)
 * @example
 * resetTextSize(); // Resets to default
 */
function resetTextSize() {
  setTextSize(16);
}
'''

with open('js/ui/text-size.js', 'w') as f:
    f.write(textsize_jsdoc)
print("✅ JSDoc added to text-size.js")

# Add JSDoc to modals.js
print("\n[5/5] Adding JSDoc to js/ui/modals.js...")
modals_content = '''/**
 * Modal management
 * Extracted from index.html
 * @module modals
 */

/**
 * Opens a modal by ID
 * @param {string} id - Modal element ID
 * @example
 * openModal('loginOverlay'); // Opens login modal
 */
function openModal(id) { 
  document.getElementById(id).classList.add('active'); 
}

/**
 * Closes a modal by ID
 * @param {string} id - Modal element ID
 * @example
 * closeModal('loginOverlay'); // Closes login modal
 */
function closeModal(id) { 
  document.getElementById(id).classList.remove('active'); 
}

/**
 * Closes all open modals
 * @example
 * closeAllModals(); // Closes all modals
 */
function closeAllModals() {
  document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
}
'''

with open('js/ui/modals.js', 'w') as f:
    f.write(modals_content)
print("✅ JSDoc added to modals.js")

print("\n" + "=" * 60)
print("✅ JSDoc Comments Added")
print("=" * 60)
print("\nSummary:")
print("- Added JSDoc to security.js (5 functions, 3 classes)")
print("- Added JSDoc to storage.js (6 functions)")
print("- Added JSDoc to dropdown.js (3 functions)")
print("- Added JSDoc to text-size.js (6 functions)")
print("- Added JSDoc to modals.js (3 functions)")
print("\nTotal: 23 functions documented with JSDoc")
print("\nBenefits:")
print("- Better code documentation")
print("- Improved IDE autocomplete")
print("- Easier code understanding")
print("- Better developer experience")