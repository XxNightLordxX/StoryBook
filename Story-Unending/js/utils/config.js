/**
 * Configuration Management Module
 * Centralizes all configuration values for the application
 */
const Config = (function() {
    'use strict';
    
    // Default configuration
    const defaults = {
        // Admin Configuration
        admin: {
            username: 'Admin',
            password: 'admin123',
            sessionTimeout: 3600000, // 1 hour in milliseconds
            maxLoginAttempts: 5,
            lockoutDuration: 300000 // 5 minutes
        },
        
        // Story Configuration
        story: {
            defaultChapterLength: 1000,
            maxChapterLength: 5000,
            minChapterLength: 500,
            generationTimeout: 60000, // 60 seconds
            autoSaveInterval: 30000, // 30 seconds
            maxHistorySize: 100
        },
        
        // UI Configuration
        ui: {
            notificationDuration: 5000, // 5 seconds
            modalAnimationDuration: 300,
            sidebarWidth: 300,
            maxNotifications: 5,
            autoScrollSpeed: 500
        },
        
        // Storage Configuration
        storage: {
            prefix: 'ese_',
            maxStorageSize: 5242880, // 5MB
            compressionEnabled: false
        },
        
        // API Configuration
        api: {
            timeout: 30000, // 30 seconds
            retryAttempts: 3,
            retryDelay: 1000
        },
        
        // Performance Configuration
        performance: {
            debounceDelay: 300,
            throttleDelay: 100,
            maxCacheSize: 1000,
            cacheExpiration: 3600000 // 1 hour
        },
        
        // Security Configuration
        security: {
            maxInputLength: 10000,
            allowedTags: ['p', 'br', 'strong', 'em', 'u', 'i', 'b', 'a', 'ul', 'ol', 'li'],
            sanitizeHTML: true,
            enableXSSProtection: true
        },
        
        // Reading Tracker Configuration
        readingTracker: {
            bufferChapters: 10,
            updateInterval: 5000, // 5 seconds
            autoGenerate: true
        },
        
        // Lazy Loading Configuration
        lazyLoad: {
            enabled: true,
            preloadDelay: 2000,
            preloadModules: ['notifications', 'content-management']
        }
    };
    
    // Current configuration (starts with defaults)
    let config = { ...defaults };
    
    /**
     * Get a configuration value
     * @param {string} path - Dot notation path (e.g., 'admin.username')
     * @returns {*} Configuration value
     */
    const get = (path) => {
        const keys = path.split('.');
        let value = config;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }
        
        return value;
    };
    
    /**
     * Set a configuration value
     * @param {string} path - Dot notation path (e.g., 'admin.username')
     * @param {*} value - New value
     */
    const set = (path, value) => {
        const keys = path.split('.');
        let obj = config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in obj) || typeof obj[key] !== 'object') {
                obj[key] = {};
            }
            obj = obj[key];
        }
        
        obj[keys[keys.length - 1]] = value;
    };
    
    /**
     * Reset configuration to defaults
     */
    const reset = () => {
        config = { ...defaults };
    };
    
    /**
     * Get all configuration
     * @returns {Object} Complete configuration object
     */
    const getAll = () => {
        return { ...config };
    };
    
    /**
     * Load configuration from storage
     */
    const loadFromStorage = () => {
        try {
            const stored = localStorage.getItem('ese_config');
            if (stored) {
                const parsed = JSON.parse(stored);
                config = { ...defaults, ...parsed };
            }
        } catch (error) {
            console.error('[Config] Failed to load configuration from storage:', error);
        }
    };
    
    /**
     * Save configuration to storage
     */
    const saveToStorage = () => {
        try {
            localStorage.setItem('ese_config', JSON.stringify(config));
        } catch (error) {
            console.error('[Config] Failed to save configuration to storage:', error);
        }
    };
    
    /**
     * Validate configuration
     * @returns {Object} - { valid: boolean, errors: string[] }
     */
    const validate = () => {
        const errors = [];
        
        // Validate admin credentials
        if (!config.admin.username || config.admin.username.length < 3) {
            errors.push('Admin username must be at least 3 characters');
        }
        
        if (!config.admin.password || config.admin.password.length < 6) {
            errors.push('Admin password must be at least 6 characters');
        }
        
        // Validate story configuration
        if (config.story.minChapterLength > config.story.maxChapterLength) {
            errors.push('Min chapter length cannot be greater than max chapter length');
        }
        
        // Validate storage configuration
        if (config.storage.maxStorageSize < 1024) {
            errors.push('Max storage size must be at least 1KB');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    };
    
    /**
     * Get configuration as JSON string
     * @returns {string}
     */
    const toJSON = () => {
        return JSON.stringify(config, null, 2);
    };
    
    // Load configuration from storage on initialization
    loadFromStorage();
    
    // Public API
    return {
        get,
        set,
        reset,
        getAll,
        loadFromStorage,
        saveToStorage,
        validate,
        toJSON
    };
})();

// Export to global scope
window.Config = Config;