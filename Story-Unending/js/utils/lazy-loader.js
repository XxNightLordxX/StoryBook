/**
 * Lazy Loader Module
 * Dynamically loads non-critical modules on demand
 */
const LazyLoader = (function() {
    'use strict';
    
    // Cache for loaded modules
    const loadedModules = new Set();
    
    // Module definitions
    const modules = {
        admin: {
            files: ['js/modules/admin.js', 'js/ui/admin-ui.js'],
            css: ['css/admin.css']
        },
        analytics: {
            files: ['js/modules/analytics.js', 'js/ui/analytics-ui.js'],
            css: ['css/analytics.css']
        },
        bookmarks: {
            files: ['js/modules/bookmarks.js', 'js/ui/bookmarks-ui.js'],
            css: ['css/bookmarks.css']
        },
        search: {
            files: ['js/modules/search.js', 'js/ui/search-ui.js'],
            css: ['css/search.css']
        },
        'save-load': {
            files: ['js/modules/save-load.js', 'js/ui/save-load-ui.js'],
            css: ['css/save-load.css']
        },
        'reading-history': {
            files: ['js/modules/reading-history.js', 'js/ui/reading-history-ui.js'],
            css: ['css/reading-history.css']
        },
        performance: {
            files: ['js/modules/performance.js', 'js/ui/performance-ui.js'],
            css: ['css/performance.css']
        },
        'content-management': {
            files: ['js/modules/content-management.js', 'js/ui/content-management-ui.js'],
            css: ['css/content-management.css']
        },
        'user-features': {
            files: [
                'js/modules/user-profiles.js',
                'js/modules/user-preferences.js',
                'js/modules/achievements.js',
                'js/modules/social-features.js',
                'js/modules/messaging.js',
                'js/ui/user-features-ui.js'
            ],
            css: ['css/user-features.css']
        },
        notifications: {
            files: ['js/modules/notifications.js', 'js/ui/notifications-ui.js'],
            css: ['css/notifications.css']
        },
        api: {
            files: ['js/modules/api.js'],
            css: []
        },
        branching: {
            files: ['js/modules/branching-narrative.js'],
            css: []
        },
        'dynamic-content': {
            files: ['js/modules/dynamic-content.js'],
            css: []
        }
    };
    
    /**
     * Load a CSS file
     * @param {string} href - CSS file path
     * @returns {Promise<void>}
     */
    const loadCSS = (href) => {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (document.querySelector(`link[href="${href}"]`)) {
                resolve();
                return;
            }
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }
    
    /**
     * Load a JavaScript file
     * @param {string} src - JavaScript file path
     * @returns {Promise<void>}
     */
    const loadJS = (src) => {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (loadedModules.has(src)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => {
                loadedModules.add(src);
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    /**
     * Load a module and its dependencies
     * @param {string} moduleName - Name of the module to load
     * @returns {Promise<void>}
     */
    const loadModule = async (moduleName) => {
        if (!modules[moduleName]) {
            throw new Error(`Unknown module: ${moduleName}`);
        }
        
        const module = modules[moduleName];
        
        // Load CSS files first
        for (const cssFile of module.css) {
            try {
                await loadCSS(cssFile);
            } catch (error) {
                // Error handled silently: console.error(`Failed to load CSS: ${cssFile}`, error);
            }
        }
        
        // Load JavaScript files
        for (const jsFile of module.files) {
            try {
                await loadJS(jsFile);
            } catch (error) {
                // Error handled silently: console.error(`Failed to load JS: ${jsFile}`, error);
                throw error;
            }
        }
    }
    
    /**
     * Preload a module (load in background)
     * @param {string} moduleName - Name of the module to preload
     * @returns {Promise<void>}
     */
    const preloadModule = async (moduleName) => {
        try {
            await loadModule(moduleName);
        } catch (error) {
            }
    }
    
    /**
     * Check if a module is loaded
     * @param {string} moduleName - Name of the module to check
     * @returns {boolean}
     */
    const isModuleLoaded = (moduleName) => {
        if (!modules[moduleName]) {
            return false;
        }
        
        return modules[moduleName].files.every(file => loadedModules.has(file));
    }
    
    /**
     * Get list of available modules
     * @returns {string[]}
     */
    const getAvailableModules = () => {
        return Object.keys(modules);
    }
    
    // Public API
    return {
        loadModule,
        preloadModule,
        isModuleLoaded,
        getAvailableModules
    };
})();

// Export to global scope
window.LazyLoader = LazyLoader;
