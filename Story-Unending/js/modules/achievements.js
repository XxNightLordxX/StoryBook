/**
 * Achievements Module
 * Manages user achievements and badges
 * 
 * @namespace Achievements
 */
(function() {
    'use strict';

    // Private variables
    let userAchievements = {};
    let achievementDefinitions = {};

    /**
     * Initialize achievements module
     */
    const init = () => {
        loadAchievements();
        loadAchievementDefinitions();
    }

    /**
     * Load user achievements from localStorage
     */
    const loadAchievements = () => {
        try {
            const stored = Storage.getItem('story_user_achievements');
            if (stored) {
                userAchievements = JSON.parse(stored);
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to load user achievements', error);
        }
    }

    /**
     * Save user achievements to localStorage
     */
    const saveAchievements = () => {
        try {
            Storage.setItem('story_user_achievements', JSON.stringify(userAchievements));
        } catch (error) {
            ErrorHandler.handleError('Failed to save user achievements', error);
        }
    }

    /**
     * Load achievement definitions
     */
    const loadAchievementDefinitions = () => {
        achievementDefinitions = {
            // Reading achievements
            'first_chapter': {
                id: 'first_chapter',
                name: 'First Steps',
                description: 'Read your first chapter',
                icon: '📖',
                category: 'reading',
                rarity: 'common',
                points: 10
            },
            'chapter_10': {
                id: 'chapter_10',
                name: 'Dedicated Reader',
                description: 'Read 10 chapters',
                icon: '📚',
                category: 'reading',
                rarity: 'common',
                points: 50
            },
            'chapter_50': {
                id: 'chapter_50',
                name: 'Bookworm',
                description: 'Read 50 chapters',
                icon: '📕',
                category: 'reading',
                rarity: 'uncommon',
                points: 200
            },
            'chapter_100': {
                id: 'chapter_100',
                name: 'Master Reader',
                description: 'Read 100 chapters',
                icon: '📗',
                category: 'reading',
                rarity: 'rare',
                points: 500
            },
            
            // Time achievements
            'hour_1': {
                id: 'hour_1',
                name: 'Getting Started',
                description: 'Read for 1 hour',
                icon: '⏰',
                category: 'time',
                rarity: 'common',
                points: 25
            },
            'hour_10': {
                id: 'hour_10',
                name: 'Time Traveler',
                description: 'Read for 10 hours',
                icon: '⌛',
                category: 'time',
                rarity: 'uncommon',
                points: 100
            },
            'hour_50': {
                id: 'hour_50',
                name: 'Chronomancer',
                description: 'Read for 50 hours',
                icon: '🕰️',
                category: 'time',
                rarity: 'rare',
                points: 500
            },
            
            // Bookmark achievements
            'first_bookmark': {
                id: 'first_bookmark',
                name: 'Bookmark Keeper',
                description: 'Create your first bookmark',
                icon: '🔖',
                category: 'bookmark',
                rarity: 'common',
                points: 15
            },
            'bookmark_10': {
                id: 'bookmark_10',
                name: 'Collector',
                description: 'Create 10 bookmarks',
                icon: '📑',
                category: 'bookmark',
                rarity: 'uncommon',
                points: 75
            },
            
            // Save achievements
            'first_save': {
                id: 'first_save',
                name: 'Safe Keeper',
                description: 'Save your progress for the first time',
                icon: '💾',
                category: 'save',
                rarity: 'common',
                points: 20
            },
            'save_10': {
                id: 'save_10',
                name: 'Archivist',
                description: 'Save your progress 10 times',
                icon: '🗄️',
                category: 'save',
                rarity: 'uncommon',
                points: 80
            },
            
            // Streak achievements
            'streak_3': {
                id: 'streak_3',
                name: 'Consistent Reader',
                description: 'Read for 3 consecutive days',
                icon: '🔥',
                category: 'streak',
                rarity: 'common',
                points: 30
            },
            'streak_7': {
                id: 'streak_7',
                name: 'Week Warrior',
                description: 'Read for 7 consecutive days',
                icon: '⚡',
                category: 'streak',
                rarity: 'uncommon',
                points: 100
            },
            'streak_30': {
                id: 'streak_30',
                name: 'Monthly Master',
                description: 'Read for 30 consecutive days',
                icon: '🌟',
                category: 'streak',
                rarity: 'rare',
                points: 500
            },
            
            // Special achievements
            'explorer': {
                id: 'explorer',
                name: 'Explorer',
                description: 'Use all features of the app',
                icon: '🗺️',
                category: 'special',
                rarity: 'rare',
                points: 300
            },
            'speed_reader': {
                id: 'speed_reader',
                name: 'Speed Reader',
                description: 'Read a chapter in under 5 minutes',
                icon: '🚀',
                category: 'special',
                rarity: 'rare',
                points: 200
            }
        };
    }

    /**
     * Unlock achievement for user
     * @param {string} username - Username
     * @param {string} achievementId - Achievement ID
     * @returns {object} Unlocked achievement
     */
    const unlockAchievement = (username, achievementId) => {
        if (!achievementDefinitions[achievementId]) {
            throw new Error('Achievement not found');
        }

        if (!userAchievements[username]) {
            userAchievements[username] = [];
        }

        // Check if already unlocked
        if (userAchievements[username].includes(achievementId)) {
            return null;
        }

        // Unlock achievement
        const achievement = achievementDefinitions[achievementId];
        const unlockedAchievement = {
            ...achievement,
            unlockedAt: new Date().toISOString()
        };

        userAchievements[username].push(achievementId);
        saveAchievements();

        // Update user profile stats
        try {
            UserProfiles.updateStats(username, { achievements: 1 });
        } catch (error) {
            // Profile might not exist yet
        }

        return unlockedAchievement;
    }

    /**
     * Get user achievements
     * @param {string} username - Username
     * @returns {array} Array of unlocked achievements
     */
    const getUserAchievements = (username) => {
        if (!userAchievements[username]) {
            return [];
        }

        return userAchievements[username].map(id => ({
            ...achievementDefinitions[id],
            unlockedAt: null // Would need to store timestamps separately
        }));
    }

    /**
     * Get all achievement definitions
     * @returns {object} All achievement definitions
     */
    const getAllAchievements = () => {
        return achievementDefinitions;
    }

    /**
     * Get achievement by ID
     * @param {string} achievementId - Achievement ID
     * @returns {object|null} Achievement definition or null
     */
    const getAchievement = (achievementId) => {
        return achievementDefinitions[achievementId] || null;
    }

    /**
     * Check if user has achievement
     * @param {string} username - Username
     * @param {string} achievementId - Achievement ID
     * @returns {boolean} True if user has achievement
     */
    const hasAchievement = (username, achievementId) => {
        if (!userAchievements[username]) {
            return false;
        }
        return userAchievements[username].includes(achievementId);
    }

    /**
     * Get achievement progress
     * @param {string} username - Username
     * @returns {object} Achievement progress
     */
    const getAchievementProgress = (username) => {
        const unlocked = getUserAchievements(username);
        const total = Object.keys(achievementDefinitions).length;
        const points = unlocked.reduce((sum, a) => sum + a.points, 0);

        return {
            unlocked: unlocked.length,
            total: total,
            percentage: Math.round((unlocked.length / total) * 100),
            points: points,
            byCategory: groupByCategory(unlocked)
        };
    }

    /**
     * Group achievements by category
     * @param {array} achievements - Array of achievements
     * @returns {object} Grouped achievements
     */
    const groupByCategory = (achievements) => {
        const grouped = {};
        achievements.forEach(achievement => {
            if (!grouped[achievement.category]) {
                grouped[achievement.category] = [];
            }
            grouped[achievement.category].push(achievement);
        });
        return grouped;
    }

    /**
     * Check and unlock achievements based on stats
     * @param {string} username - Username
     * @param {object} stats - User statistics
     * @returns {array} Newly unlocked achievements
     */
    const checkAchievements = (username, stats) => {
        const newlyUnlocked = [];

        // Reading achievements
        if (stats.chaptersRead >= 1) {
            const unlocked = unlockAchievement(username, 'first_chapter');
            if (unlocked) newlyUnlocked.push(unlocked);
        }
        if (stats.chaptersRead >= 10) {
            const unlocked = unlockAchievement(username, 'chapter_10');
            if (unlocked) newlyUnlocked.push(unlocked);
        }
        if (stats.chaptersRead >= 50) {
            const unlocked = unlockAchievement(username, 'chapter_50');
            if (unlocked) newlyUnlocked.push(unlocked);
        }
        if (stats.chaptersRead >= 100) {
            const unlocked = unlockAchievement(username, 'chapter_100');
            if (unlocked) newlyUnlocked.push(unlocked);
        }

        // Time achievements (convert to hours)
        const hoursRead = Math.floor(stats.totalReadingTime / (1000 * 60 * 60));
        if (hoursRead >= 1) {
            const unlocked = unlockAchievement(username, 'hour_1');
            if (unlocked) newlyUnlocked.push(unlocked);
        }
        if (hoursRead >= 10) {
            const unlocked = unlockAchievement(username, 'hour_10');
            if (unlocked) newlyUnlocked.push(unlocked);
        }
        if (hoursRead >= 50) {
            const unlocked = unlockAchievement(username, 'hour_50');
            if (unlocked) newlyUnlocked.push(unlocked);
        }

        // Bookmark achievements
        if (stats.bookmarks >= 1) {
            const unlocked = unlockAchievement(username, 'first_bookmark');
            if (unlocked) newlyUnlocked.push(unlocked);
        }
        if (stats.bookmarks >= 10) {
            const unlocked = unlockAchievement(username, 'bookmark_10');
            if (unlocked) newlyUnlocked.push(unlocked);
        }

        // Streak achievements
        if (stats.streak >= 3) {
            const unlocked = unlockAchievement(username, 'streak_3');
            if (unlocked) newlyUnlocked.push(unlocked);
        }
        if (stats.streak >= 7) {
            const unlocked = unlockAchievement(username, 'streak_7');
            if (unlocked) newlyUnlocked.push(unlocked);
        }
        if (stats.streak >= 30) {
            const unlocked = unlockAchievement(username, 'streak_30');
            if (unlocked) newlyUnlocked.push(unlocked);
        }

        return newlyUnlocked;
    }

    /**
     * Export achievements
     * @param {string} format - Export format ('json')
     * @returns {string} Exported data
     */
    const exportAchievements = (format = 'json') => {
        if (format !== 'json') {
            throw new Error('Only JSON export is supported');
        }

        const data = {
            userAchievements: userAchievements,
            achievementDefinitions: achievementDefinitions,
            exportedAt: new Date().toISOString()
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Import achievements
     * @param {string} data - Achievement data to import
     * @param {string} format - Import format ('json')
     */
    const importAchievements = (data, format = 'json') => {
        if (format !== 'json') {
            throw new Error('Only JSON import is supported');
        }

        try {
            const imported = JSON.parse(data);

            // Merge user achievements
            Object.assign(userAchievements, imported.userAchievements || {});

            saveAchievements();

        } catch (error) {
            ErrorHandler.handleError('Failed to import achievements', error);
            throw error;
        }
    }

    /**
     * Clear all achievements
     */
    const clearAllAchievements = () => {
        userAchievements = {};
        saveAchievements();
    }

    // Export public API
    window.Achievements = {
        init: init,
        unlockAchievement: unlockAchievement,
        getUserAchievements: getUserAchievements,
        getAllAchievements: getAllAchievements,
        getAchievement: getAchievement,
        hasAchievement: hasAchievement,
        getAchievementProgress: getAchievementProgress,
        checkAchievements: checkAchievements,
        exportAchievements: exportAchievements,
        importAchievements: importAchievements,
        clearAllAchievements: clearAllAchievements
    };

})();