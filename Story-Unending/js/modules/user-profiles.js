/**
 * User Profiles Module
 * Manages user profiles, avatars, and user information
 * 
 * @namespace UserProfiles
 */
(function() {
    'use strict';

    // Private variables
    let profiles = {};
    let currentUser = null;

    /**
     * Initialize user profiles module
     */
    const init = () => {
        loadProfiles();
        loadCurrentUser();
    }

    /**
     * Load profiles from localStorage
     */
    const loadProfiles = () => {
        try {
            const stored = Storage.getItem('story_user_profiles');
            if (stored) {
                profiles = JSON.parse(stored);
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to load user profiles', error);
        }
    }

    /**
     * Save profiles to localStorage
     */
    const saveProfiles = () => {
        try {
            Storage.setItem('story_user_profiles', JSON.stringify(profiles));
        } catch (error) {
            ErrorHandler.handleError('Failed to save user profiles', error);
        }
    }

    /**
     * Load current user
     */
    const loadCurrentUser = () => {
        try {
            const stored = Storage.getItem('story_current_user');
            if (stored) {
                currentUser = JSON.parse(stored);
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to load current user', error);
        }
    }

    /**
     * Save current user
     */
    const saveCurrentUser = () => {
        try {
            Storage.setItem('story_current_user', JSON.stringify(currentUser));
        } catch (error) {
            ErrorHandler.handleError('Failed to save current user', error);
        }
    }

    /**
     * Create a new user profile
     * @param {string} username - Username
     * @param {string} email - Email address
     * @param {object} profileData - Profile data
     * @returns {object} Created profile
     */
    const createProfile = (username, email, profileData = {}) => {
        if (profiles[username]) {
            throw new Error('Username already exists');
        }

        const profile = {
            username: username,
            email: email,
            displayName: profileData.displayName || username,
            avatar: profileData.avatar || null,
            bio: profileData.bio || '',
            location: profileData.location || '',
            website: profileData.website || '',
            joinedAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            stats: {
                chaptersRead: 0,
                totalReadingTime: 0,
                bookmarks: 0,
                achievements: 0
            },
            preferences: {
                theme: 'light',
                textSize: 'medium',
                notifications: true,
                emailUpdates: false
            },
            achievements: [],
            social: {
                followers: [],
                following: []
            }
        };

        profiles[username] = profile;
        saveProfiles();

        return profile;
    }

    /**
     * Get user profile
     * @param {string} username - Username
     * @returns {object|null} User profile or null
     */
    const getProfile = (username) => {
        return profiles[username] || null;
    }

    /**
     * Update user profile
     * @param {string} username - Username
     * @param {object} updates - Profile updates
     * @returns {object} Updated profile
     */
    const updateProfile = (username, updates) => {
        const profile = getProfile(username);
        if (!profile) {
            throw new Error('Profile not found');
        }

        // Update allowed fields
        const allowedFields = ['displayName', 'avatar', 'bio', 'location', 'website'];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                profile[field] = updates[field];
            }
        });

        profile.lastActive = new Date().toISOString();
        saveProfiles();

        return profile;
    }

    /**
     * Delete user profile
     * @param {string} username - Username
     */
    const deleteProfile = (username) => {
        if (!profiles[username]) {
            throw new Error('Profile not found');
        }

        delete profiles[username];
        saveProfiles();
    }

    /**
     * Set user avatar
     * @param {string} username - Username
     * @param {string} avatarData - Base64 avatar data
     */
    const setAvatar = (username, avatarData) => {
        const profile = getProfile(username);
        if (!profile) {
            throw new Error('Profile not found');
        }

        profile.avatar = avatarData;
        profile.lastActive = new Date().toISOString();
        saveProfiles();
    }

    /**
     * Remove user avatar
     * @param {string} username - Username
     */
    const removeAvatar = (username) => {
        const profile = getProfile(username);
        if (!profile) {
            throw new Error('Profile not found');
        }

        profile.avatar = null;
        profile.lastActive = new Date().toISOString();
        saveProfiles();
    }

    /**
     * Update user statistics
     * @param {string} username - Username
     * @param {object} stats - Statistics updates
     */
    const updateStats = (username, stats) => {
        const profile = getProfile(username);
        if (!profile) {
            throw new Error('Profile not found');
        }

        Object.keys(stats).forEach(key => {
            if (profile.stats[key] !== undefined) {
                profile.stats[key] += stats[key];
            }
        });

        profile.lastActive = new Date().toISOString();
        saveProfiles();
    }

    /**
     * Get all profiles
     * @returns {array} Array of all profiles
     */
    const getAllProfiles = () => {
        return Object.values(profiles);
    }

    /**
     * Search profiles
     * @param {string} query - Search query
     * @returns {array} Array of matching profiles
     */
    const searchProfiles = (query) => {
        const lowerQuery = query.toLowerCase();
        return Object.values(profiles).filter(profile => {
            return profile.username.toLowerCase().includes(lowerQuery) ||
                   profile.displayName.toLowerCase().includes(lowerQuery) ||
                   profile.bio.toLowerCase().includes(lowerQuery);
        });
    }

    /**
     * Set current user
     * @param {string} username - Username
     */
    const setCurrentUser = (username) => {
        const profile = getProfile(username);
        if (!profile) {
            throw new Error('Profile not found');
        }

        currentUser = username;
        saveCurrentUser();
    }

    /**
     * Get current user
     * @returns {string|null} Current username or null
     */
    const getCurrentUser = () => {
        return currentUser;
    }

    /**
     * Get current user profile
     * @returns {object|null} Current user profile or null
     */
    const getCurrentUserProfile = () => {
        if (!currentUser) {
            return null;
        }
        return getProfile(currentUser);
    }

    /**
     * Update last active time
     * @param {string} username - Username
     */
    const updateLastActive = (username) => {
        const profile = getProfile(username);
        if (profile) {
            profile.lastActive = new Date().toISOString();
            saveProfiles();
        }
    }

    /**
     * Get profile statistics
     * @param {string} username - Username
     * @returns {object} Profile statistics
     */
    const getProfileStats = (username) => {
        const profile = getProfile(username);
        if (!profile) {
            return null;
        }

        return {
            username: profile.username,
            displayName: profile.displayName,
            stats: profile.stats,
            social: {
                followers: profile.social.followers.length,
                following: profile.social.following.length
            },
            joinedAt: profile.joinedAt,
            lastActive: profile.lastActive
        };
    }

    /**
     * Export profiles
     * @param {string} format - Export format ('json')
     * @returns {string} Exported data
     */
    const exportProfiles = (format = 'json') => {
        if (format !== 'json') {
            throw new Error('Only JSON export is supported');
        }

        const data = {
            profiles: profiles,
            currentUser: currentUser,
            exportedAt: new Date().toISOString()
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Import profiles
     * @param {string} data - Profile data to import
     * @param {string} format - Import format ('json')
     */
    const importProfiles = (data, format = 'json') => {
        if (format !== 'json') {
            throw new Error('Only JSON import is supported');
        }

        try {
            const imported = JSON.parse(data);

            // Merge profiles
            Object.assign(profiles, imported.profiles || {});

            // Set current user if provided
            if (imported.currentUser) {
                currentUser = imported.currentUser;
                saveCurrentUser();
            }

            saveProfiles();

        } catch (error) {
            ErrorHandler.handleError('Failed to import profiles', error);
            throw error;
        }
    }

    /**
     * Clear all profiles
     */
    const clearAllProfiles = () => {
        profiles = {};
        currentUser = null;
        saveProfiles();
        saveCurrentUser();
    }

    // Export public API
    window.UserProfiles = {
        init: init,
        createProfile: createProfile,
        getProfile: getProfile,
        updateProfile: updateProfile,
        deleteProfile: deleteProfile,
        setAvatar: setAvatar,
        removeAvatar: removeAvatar,
        updateStats: updateStats,
        getAllProfiles: getAllProfiles,
        searchProfiles: searchProfiles,
        setCurrentUser: setCurrentUser,
        getCurrentUser: getCurrentUser,
        getCurrentUserProfile: getCurrentUserProfile,
        updateLastActive: updateLastActive,
        getProfileStats: getProfileStats,
        exportProfiles: exportProfiles,
        importProfiles: importProfiles,
        clearAllProfiles: clearAllProfiles
    };

})();