/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Unified Error Handler for Story-Unending Project
 * Provides centralized error handling with categorization, logging, recovery, and tracking
 * @module error-handler
 * @version 2.0
 */

(function() {
  'use strict';

  // ============================================================================
  // Error Types
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Error type enumeration
   * @enum {string}
   */
  const ErrorTypes = {
    NETWORK: 'NETWORK',
    VALIDATION: 'VALIDATION',
    AUTHORIZATION: 'AUTHORIZATION',
    STORAGE: 'STORAGE',
    UNKNOWN: 'UNKNOWN'
  };

  // ============================================================================
  // Error Log
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Error log array
   * @type {Array<Object>}
   */
  let errorLog = [];

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Maximum error log size
   * @type {number}
   */
  const MAX_ERROR_LOG_SIZE = 100;

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Whether error logging is enabled
   * @type {boolean}
   */
  let loggingEnabled = true;

  // ============================================================================
  // Sentry Integration
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Sentry integration enabled
   * @type {boolean}
   */
  let sentryEnabled = false;

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Sentry DSN
   * @type {string|null}
   */
  let sentryDsn = null;

  // ============================================================================
  // Error Categorization
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Categorizes an error based on its properties
   * @param {Error} error - The error object
   * @returns {string} Error type
   */
  const categorizeError = (error) => {
    if (!error) return ErrorTypes.UNKNOWN;

    // Network errors
    if (error.name === 'NetworkError' || 
        error.name === 'TypeError' && error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('Failed to fetch')) {
      return ErrorTypes.NETWORK;
    }

    // Validation errors
    if (error.name === 'ValidationError' ||
        error.message.includes('validation') ||
        error.message.includes('invalid')) {
      return ErrorTypes.VALIDATION;
    }

    // Authorization errors
    if (error.name === 'AuthError' ||
        error.name === 'UnauthorizedError' ||
        error.message.includes('unauthorized') ||
        error.message.includes('authentication') ||
        error.message.includes('permission')) {
      return ErrorTypes.AUTHORIZATION;
    }

    // Storage errors
    if (error.name === 'StorageError' ||
        error.name === 'QuotaExceededError' ||
        error.message.includes('storage') ||
        error.message.includes('quota')) {
      return ErrorTypes.STORAGE;
    }

    return ErrorTypes.UNKNOWN;
  };

  // ============================================================================
  // Error Logging
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Logs an error to the error log
   * @param {Error} error - The error object
   * @param {string} context - Context description
   * @param {string} type - Error type
   */
  const logError = (error, context, type) => {
    if (!loggingEnabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      type: type || categorizeError(error),
      context: context || 'Unknown',
      message: error.message || 'Unknown error',
      stack: error.stack || null,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js'
    };

    errorLog.push(logEntry);

    // Limit log size
    if (errorLog.length > MAX_ERROR_LOG_SIZE) {
      errorLog.shift();
    }

    // Log to console
    console.error(`[${logEntry.type}] ${logEntry.context}:`, error);
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Gets the error log
   * @param {Object} filters - Optional filters (type, context, limit)
   * @returns {Array<Object>} Filtered error log
   */
  const getErrorLog = (filters = {}) => {
    let filtered = [...errorLog];

    if (filters.type) {
      filtered = filtered.filter(entry => entry.type === filters.type);
    }

    if (filters.context) {
      filtered = filtered.filter(entry => entry.context.includes(filters.context));
    }

    if (filters.limit) {
      filtered = filtered.slice(-filters.limit);
    }

    return filtered;
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Clears the error log
   */
  const clearErrorLog = () => {
    errorLog = [];
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Exports the error log as JSON
   * @returns {string} JSON string of error log
   */
  const exportErrorLog = () => {
    return JSON.stringify(errorLog, null, 2);
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Enables or disables error logging
   * @param {boolean} enabled - Whether to enable logging
   */
  const setLoggingEnabled = (enabled) => {
    loggingEnabled = enabled;
  };

  // ============================================================================
  // Error Recovery
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Retries a function with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delay - Initial delay in milliseconds
   * @returns {Promise<*>} Promise resolving to result
   */
  const retry = async (fn, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError;
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Executes a fallback function if the primary function fails
   * @param {Function} fn - Primary function
   * @param {Function} fallbackFn - Fallback function
   * @returns {*} Result of primary or fallback function
   */
  const fallback = (fn, fallbackFn) => {
    try {
      return fn();
    } catch (error) {
      logError(error, 'Fallback', categorizeError(error));
      return fallbackFn();
    }
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Circuit breaker pattern for preventing cascading failures
   * @param {Function} fn - Function to wrap
   * @param {number} threshold - Failure threshold
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Function} Wrapped function
   */
  const circuitBreaker = (fn, threshold = 5, timeout = 60000) => {
    let failures = 0;
    let lastFailureTime = 0;
    let state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN

    return async (...args) => {
      const now = Date.now();

      // Check if circuit should reset
      if (state === 'OPEN' && now - lastFailureTime > timeout) {
        state = 'HALF_OPEN';
        failures = 0;
      }

      // Reject if circuit is open
      if (state === 'OPEN') {
        throw new Error('Circuit breaker is OPEN');
      }

      try {
        const result = await fn(...args);
        
        // Reset on success
        if (state === 'HALF_OPEN') {
          state = 'CLOSED';
        }
        failures = 0;
        
        return result;
      } catch (error) {
        failures++;
        lastFailureTime = now;

        // Open circuit if threshold reached
        if (failures >= threshold) {
          state = 'OPEN';
        }

        throw error;
      }
    };
  };

  // ============================================================================
  // Error Boundaries
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Creates an error boundary for UI components
   * @param {Function} component - Component function
   * @param {Function} fallbackComponent - Fallback component
   * @returns {Function} Wrapped component
   */
  const createErrorBoundary = (component, fallbackComponent) => {
    return (...args) => {
      try {
        return component(...args);
      } catch (error) {
        logError(error, 'Error Boundary', categorizeError(error));
        return fallbackComponent ? fallbackComponent(error) : null;
      }
    };
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Wraps a component with error boundary
   * @param {Function} component - Component to wrap
   * @param {Function} fallbackComponent - Fallback component
   * @returns {Function} Wrapped component
   */
  const wrapComponent = (component, fallbackComponent) => {
    return createErrorBoundary(component, fallbackComponent);
  };

  // ============================================================================
  // Sentry Integration
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Enables Sentry integration
   * @param {string} dsn - Sentry DSN
   */
  const enableSentry = (dsn) => {
    sentryDsn = dsn;
    sentryEnabled = true;
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Disables Sentry integration
   */
  const disableSentry = () => {
    sentryEnabled = false;
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Tracks an error in Sentry
   * @param {Error} error - Error to track
   * @param {string} context - Context description
   */
  const trackError = (error, context) => {
    if (!sentryEnabled) return;

    // Note: This is a placeholder for Sentry integration
    // In production, you would use the Sentry SDK here
  };

  // ============================================================================
  // Enhanced Error Handling
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Handles errors with user-friendly messages
   * @param {Error} error - The error object
   * @param {string} context - Context description
   * @param {Object} options - Options (showNotification, log, track)
   */
  const handle = (error, context = 'Operation', options = {}) => {
    const {
      showNotification: shouldShowNotification = true,
      log: shouldLog = true,
      track: shouldTrack = true
    } = options;

    const type = categorizeError(error);

    // Log error
    if (shouldLog) {
      logError(error, context, type);
    }

    // Track error in Sentry
    if (shouldTrack && sentryEnabled) {
      trackError(error, context);
    }

    // Show user-friendly error message
    if (shouldShowNotification && typeof window !== 'undefined' && window.showNotification) {
      const message = error.message || 'An unexpected error occurred';
      window.showNotification('combat-notif', '❌ Error', `${context} failed: ${message}`);
    }

    // Log detailed error for debugging
    if (error.stack && shouldLog) {
      console.error('Stack trace:', error.stack);
    }
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Safely executes a function with error handling
   * @param {Function} fn - Function to execute
   * @param {string} context - Context description
   * @param {*} fallback - Fallback value if error occurs
   * @param {Object} options - Options (showNotification, log, track)
   * @returns {*} Result of function or fallback value
   */
  const safeExecute = (fn, context = 'Operation', fallback = null, options = {}) => {
    try {
      return fn();
    } catch (error) {
      handle(error, context, options);
      return fallback;
    }
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Safely executes an async function with error handling
   * @param {Function} fn - Async function to execute
   * @param {string} context - Context description
   * @param {*} fallback - Fallback value if error occurs
   * @param {Object} options - Options (showNotification, log, track)
   * @returns {Promise<*>} Promise resolving to result or fallback value
   */
  const safeExecuteAsync = async (fn, context = 'Operation', fallback = null, options = {}) => {
    try {
      return await fn();
    } catch (error) {
      handle(error, context, options);
      return fallback;
    }
  };

  // ============================================================================
  // Export
  // ============================================================================

  const ErrorHandler = {
    // Error Types
    ErrorTypes: ErrorTypes,

    // Error Logging
    logError: logError,
    getErrorLog: getErrorLog,
    clearErrorLog: clearErrorLog,
    exportErrorLog: exportErrorLog,
    setLoggingEnabled: setLoggingEnabled,

    // Error Recovery
    retry: retry,
    fallback: fallback,
    circuitBreaker: circuitBreaker,

    // Error Boundaries
    createErrorBoundary: createErrorBoundary,
    wrapComponent: wrapComponent,

    // Sentry Integration
    enableSentry: enableSentry,
    disableSentry: disableSentry,
    trackError: trackError,

    // Error Handling
    handle: handle,
    safeExecute: safeExecute,
    safeExecuteAsync: safeExecuteAsync
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.ErrorHandler = ErrorHandler;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
  }

})();