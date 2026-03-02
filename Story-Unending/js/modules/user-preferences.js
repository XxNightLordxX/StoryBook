/**
 * User Preferences Module
 * Manages user preferences and settings
 * 
 * @namespace UserPreferences
 */
(function() {
    'use strict';

    // Private variables
    let preferences = {};
    let defaultPreferences = {
        theme: 'light',
        textSize: 'medium',
        notifications: true,
        emailUpdates: false,
        autoSave: true,
        showReadingProgress: true,
        enableAnimations: true,
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        privacyMode: false,
        showOnlineStatus: true
    };

    /**
     * Initialize user preferences module
     */
    const init = () => {
        loadPreferences();
    }

    /**
     * Load preferences from localStorage
     */
    const loadPreferences = () => {
        try {
            const stored = Storage.getItem('story_user_preferences');
            if (stored) {
                preferences = JSON.parse(stored);
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to load user preferences', error);
        }
    }

    /**
     * Save preferences to localStorage
     */
    const savePreferences = () => {
        try {
            Storage.setItem('story_user_preferences', JSON.stringify(preferences));
        } catch (error) {
            ErrorHandler.handleError('Failed to save user preferences', error);
        }
    }

    /**
     * Get user preferences
     * @param {string} username - Username
     * @returns {object} User preferences
     */
    const getPreferences = (username) => {
        if (!preferences[username]) {
            preferences[username] = { ...defaultPreferences };
            savePreferences();
        }
        return { ...defaultPreferences, ...preferences[username] };
    }

    /**
     * Set user preference
     * @param {string} username - Username
     * @param {string} key - Preference key
     * @param {any} value - Preference value
     */
    const setPreference = (username, key, value) => {
        if (!preferences[username]) {
            preferences[username] = { ...defaultPreferences };
        }

        preferences[username][key] = value;
        savePreferences();

        // Apply preference if applicable
        applyPreference(key, value);
    }

    /**
     * Set multiple preferences
     * @param {string} username - Username
     * @param {object} prefs - Preferences object
     */
    const setPreferences = (username, prefs) => {
        if (!preferences[username]) {
            preferences[username] = { ...defaultPreferences };
        }

        Object.assign(preferences[username], prefs);
        savePreferences();

        // Apply preferences
        Object.keys(prefs).forEach(key => {
            applyPreference(key, prefs[key]);
        });
    }

    /**
     * Apply preference to UI
     * @param {string} key - Preference key
     * @param {any} value - Preference value
     */
    const applyPreference = (key, value) => {
        switch (key) {
            case 'theme':
                applyTheme(value);
                break;
            case 'textSize':
                applyTextSize(value);
                break;
            case 'enableAnimations':
                applyAnimations(value);
                break;
        }
    }

    /**
     * Apply theme
     * @param {string} theme - Theme name
     */
    const applyTheme = (theme) => {
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add('theme-' + theme);
    }

    /**
     * Apply text size
     * @param {string} size - Text size
     */
    const applyTextSize = (size) => {
        const sizes = {
            'small': '14px',
            'medium': '16px',
            'large': '18px',
            'xlarge': '20px'
        };
        document.documentElement.style.fontSize = sizes[size] || '16px';
    }

    /**
     * Apply animations
     * @param {boolean} enabled - Enable animations
     */
    const applyAnimations = (enabled) => {
        if (enabled) {
            document.body.classList.remove('no-animations');
        } else {
            document.body.classList.add('no-animations');
        }
    }

    /**
     * Reset preferences to defaults
     * @param {string} username - Username
     */
    const resetPreferences = (username) => {
        preferences[username] = { ...defaultPreferences };
        savePreferences();

        // Apply default preferences
        Object.keys(defaultPreferences).forEach(key => {
            applyPreference(key, defaultPreferences[key]);
        });
    }

    /**
     * Get default preferences
     * @returns {object} Default preferences
     */
    const getDefaultPreferences = () => {
        return { ...defaultPreferences };
    }

    /**
     * Export preferences
     * @param {string} format - Export format ('json')
     * @returns {string} Exported data
     */
    const exportPreferences = (format = 'json') => {
        if (format !== 'json') {
            throw new Error('Only JSON export is supported');
        }

        const data = {
            preferences: preferences,
            defaultPreferences: defaultPreferences,
            exportedAt: new Date().toISOString()
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Import preferences
     * @param {string} data - Preference data to import
     * @param {string} format - Import format ('json')
     */
    const importPreferences = (data, format = 'json') => {
        if (format !== 'json') {
            throw new Error('Only JSON import is supported');
        }

        try {
            const imported = JSON.parse(data);

            // Merge preferences
            Object.assign(preferences, imported.preferences || {});

            savePreferences();

        } catch (error) {
            ErrorHandler.handleError('Failed to import preferences', error);
            throw error;
        }
    }

    /**
     * Clear all preferences
     */
    const clearAllPreferences = () => {
        preferences = {};
        savePreferences();
    }

    // Export public API
    window.UserPreferences = {
        init: init,
        getPreferences: getPreferences,
        setPreference: setPreference,
        setPreferences: setPreferences,
        resetPreferences: resetPreferences,
        getDefaultPreferences: getDefaultPreferences,
        exportPreferences: exportPreferences,
        importPreferences: importPreferences,
        clearAllPreferences: clearAllPreferences
    };

})();