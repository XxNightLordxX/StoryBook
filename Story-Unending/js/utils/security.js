/**
 * Security utilities including sanitization, rate limiting, validation, and error handling
 * Extracted from index.html
 * @module security
 */

(function() {
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
const sanitizeHTML = (str) => {
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
const sanitizeAttribute = (str) => {
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
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
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
 * ErrorHandler is now imported from error-handler.js
 * This section is kept for backward compatibility
 * @namespace ErrorHandler
 */
const ErrorHandler = typeof window !== 'undefined' && window.ErrorHandler ? window.ErrorHandler : {
  handle: (error, context = 'Operation') => {
    console.error(`[${context}] Error:`, error);
  },
  safeExecute: (fn, context = 'Operation', fallback = null) => {
    try {
      return fn();
    } catch (error) {
      console.error(`[${context}] Error:`, error);
      return fallback;
    }
  },
  safeExecuteAsync: async (fn, context = 'Operation', fallback = null) => {
    try {
      return await fn();
    } catch (error) {
      console.error(`[${context}] Error:`, error);
      return fallback;
    }
  }
};

  // Create namespace object
  const Security = {
    sanitizeHTML: sanitizeHTML,
    sanitizeAttribute: sanitizeAttribute,
    RateLimiter: RateLimiter,
    Validator: Validator,
    ErrorHandler: ErrorHandler
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.Security = Security;
    window.sanitizeHTML = sanitizeHTML;
    window.sanitizeAttribute = sanitizeAttribute;
    window.RateLimiter = RateLimiter;
    window.Validator = Validator;
    window.ErrorHandler = ErrorHandler;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Security;
  }
})();