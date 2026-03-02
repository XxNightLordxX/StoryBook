/**
 * Sentry Error Tracking Module
 * Provides error tracking and performance monitoring
 */

const Sentry = (function() {
    'use strict';
    
    // Sentry configuration
    let sentryInitialized = false;
    let sentryInstance = null;
    
    /**
     * Initialize Sentry
     * @param {Object} config - Sentry configuration
     * @returns {void}
     */
    const init = (config) => {
        if (sentryInitialized) {
            return;
        }
        
        try {
            // Check if Sentry SDK is available
            if (typeof window.Sentry === 'undefined') {
                // Error logged: console.error('Sentry SDK not loaded');
                return;
            }
            
            // Initialize Sentry
            window.Sentry.init({
                dsn: config.dsn || '',
                environment: config.environment || 'production',
                release: config.release || '1.0.0',
                tracesSampleRate: config.tracesSampleRate || 0.1,
                replaysSessionSampleRate: config.replaysSessionSampleRate || 0.1,
                replaysOnErrorSampleRate: config.replaysOnErrorSampleRate || 1.0,
                beforeSend: beforeSend,
                beforeBreadcrumb: beforeBreadcrumb,
                integrations: [
                    new window.Sentry.BrowserTracing(),
                    new window.Sentry.Replay({
                    maskAllText: true,
                    blockAllMedia: true,
                    }),
                ],
            });
            
            sentryInitialized = true;
            sentryInstance = window.Sentry;
            
            // Sentry initialized successfully
            
        } catch (error) {
            // Error handled silently: console.error('Failed to initialize Sentry:', error);
        }
    }
    
    /**
     * Before send callback - filter errors
     * @param {Object} event - Sentry event
     * @param {Object} hint - Sentry hint
     * @returns {Object|null}
     */
    const beforeSend = (event, hint) => {
        // Filter out specific errors
        if (event.exception) {
            const error = hint.originalException;
            
            // Ignore network errors
            if (error instanceof TypeError && error.message.includes('NetworkError')) {
                return null;
            }
            
            // Ignore aborted requests
            if (error instanceof DOMException && error.name === 'AbortError') {
                return null;
            }
        }
        
        // Add custom context
        event.contexts = event.contexts || {};
        event.contexts.app = {
            name: 'Story-Unending',
            version: '1.0.0',
            url: window.location.href,
            userAgent: navigator.userAgent,
        };
        
        return event;
    }
    
    /**
     * Before breadcrumb callback - filter breadcrumbs
     * @param {Object} breadcrumb - Sentry breadcrumb
     * @param {Object} hint - Sentry hint
     * @returns {Object|null}
     */
    const beforeBreadcrumb = (breadcrumb, hint) => {
        // Filter out specific breadcrumbs
        if (breadcrumb.category === 'xhr') {
            // Filter out sensitive URLs
            const url = breadcrumb.data && breadcrumb.data.url;
            if (url && (url.includes('password') || url.includes('token'))) {
                return null;
            }
        }
        
        return breadcrumb;
    }
    
    /**
     * Capture an exception
     * @param {Error} error - Error to capture
     * @param {Object} context - Additional context
     * @returns {string} Event ID
     */
    const captureException = (error, context = {}) => {
        if (!sentryInitialized) {
            // Error logged: console.error('Sentry not initialized');
            return null;
        }
        
        try {
            return sentryInstance.captureException(error, {
                extra: context,
            });
        } catch (e) {
            // Error handled silently: console.error('Failed to capture exception:', e);
            return null;
        }
    }
    
    /**
     * Capture a message
     * @param {string} message - Message to capture
     * @param {string} level - Log level (error, warning, info)
     * @param {Object} context - Additional context
     * @returns {string} Event ID
     */
    const captureMessage = (message, level = 'info', context = {}) => {
        if (!sentryInitialized) {
            // Error logged: console.error('Sentry not initialized');
            return null;
        }
        
        try {
            return sentryInstance.captureMessage(message, level, {
                extra: context,
            });
        } catch (e) {
            // Error handled silently: console.error('Failed to capture message:', e);
            return null;
        }
    }
    
    /**
     * Set user context
     * @param {Object} user - User information
     * @returns {void}
     */
    const setUser = (user) => {
        if (!sentryInitialized) {
            // Error logged: console.error('Sentry not initialized');
            return;
        }
        
        try {
            sentryInstance.setUser(user);
        } catch (e) {
            // Error handled silently: console.error('Failed to set user:', e);
        }
    }
    
    /**
     * Set tag
     * @param {string} key - Tag key
     * @param {string} value - Tag value
     * @returns {void}
     */
    const setTag = (key, value) => {
        if (!sentryInitialized) {
            // Error logged: console.error('Sentry not initialized');
            return;
        }
        
        try {
            sentryInstance.setTag(key, value);
        } catch (e) {
            // Error handled silently: console.error('Failed to set tag:', e);
        }
    }
    
    /**
     * Set context
     * @param {string} key - Context key
     * @param {Object} value - Context value
     * @returns {void}
     */
    const setContext = (key, value) => {
        if (!sentryInitialized) {
            // Error logged: console.error('Sentry not initialized');
            return;
        }
        
        try {
            sentryInstance.setContext(key, value);
        } catch (e) {
            // Error handled silently: console.error('Failed to set context:', e);
        }
    }
    
    /**
     * Add breadcrumb
     * @param {Object} breadcrumb - Breadcrumb data
     * @returns {void}
     */
    const addBreadcrumb = (breadcrumb) => {
        if (!sentryInitialized) {
            // Error logged: console.error('Sentry not initialized');
            return;
        }
        
        try {
            sentryInstance.addBreadcrumb(breadcrumb);
        } catch (e) {
            // Error handled silently: console.error('Failed to add breadcrumb:', e);
        }
    }
    
    /**
     * Start a performance transaction
     * @param {string} name - Transaction name
     * @param {string} op - Operation type
     * @returns {Object} Transaction
     */
    const startTransaction = (name, op = 'navigation') => {
        if (!sentryInitialized) {
            // Error logged: console.error('Sentry not initialized');
            return null;
        }
        
        try {
            return sentryInstance.startTransaction({
                name: name,
                op: op,
            });
        } catch (e) {
            // Error handled silently: console.error('Failed to start transaction:', e);
            return null;
        }
    }
    
    /**
     * Check if Sentry is initialized
     * @returns {boolean}
     */
    const isInitialized = () => {
        return sentryInitialized;
    }
    
    // Public API
    return {
        init,
        captureException,
        captureMessage,
        setUser,
        setTag,
        setContext,
        addBreadcrumb,
        startTransaction,
        isInitialized,
    };
})();

// Export to global scope
window.SentryModule = Sentry;