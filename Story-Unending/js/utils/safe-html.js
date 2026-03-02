/**
 * Safe HTML utility - Provides XSS-safe innerHTML operations.
 * Wraps innerHTML assignments with DOMPurify-style sanitization.
 * @module SafeHTML
 */
(function() {
  'use strict';

  /**
   * Sanitize HTML string to prevent XSS attacks.
   * Removes dangerous tags and attributes while preserving safe HTML.
   * @param {string} html - Raw HTML string
   * @returns {string} Sanitized HTML string
   */
  const sanitize = (html) => {
    if (typeof html !== 'string') return '';
    
    // Remove script tags and their content
    let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove event handlers (onclick, onerror, onload, etc.)
    clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    
    // Remove javascript: URLs
    clean = clean.replace(/\bhref\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'href="#"');
    clean = clean.replace(/\bsrc\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'src=""');
    
    // Remove data: URLs in src (potential XSS vector)
    clean = clean.replace(/\bsrc\s*=\s*(?:"data:text\/html[^"]*"|'data:text\/html[^']*')/gi, 'src=""');
    
    // Remove iframe, object, embed, form tags
    clean = clean.replace(/<\/?(?:iframe|object|embed|form|base|meta|link)\b[^>]*>/gi, '');
    
    // Remove style expressions (IE-specific XSS)
    clean = clean.replace(/style\s*=\s*(?:"[^"]*expression\s*\([^"]*"|'[^']*expression\s*\([^']*')/gi, '');
    
    return clean;
  };

  /**
   * Safely set innerHTML on an element with sanitization.
   * @param {HTMLElement} element - Target DOM element
   * @param {string} html - HTML string to set
   */
  const setHTML = (element, html) => {
    if (!element) return;
    element.innerHTML = sanitize(html);
  };

  /**
   * Create a document fragment from sanitized HTML.
   * @param {string} html - HTML string
   * @returns {DocumentFragment} Safe document fragment
   */
  const createFragment = (html) => {
    const template = document.createElement('template');
    template.innerHTML = sanitize(html);
    return template.content.cloneNode(true);
  };

  /**
   * Escape HTML entities in a string (for displaying user input as text).
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  const escapeHTML = (str) => {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  // Export to global scope
  window.SafeHTML = {
    sanitize,
    setHTML,
    createFragment,
    escapeHTML,
  };
})();
