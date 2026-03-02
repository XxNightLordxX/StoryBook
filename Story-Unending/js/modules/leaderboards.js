/**
 * Achievement Leaderboards Module
 * 
 * Provides comprehensive leaderboard functionality for tracking and displaying
 * user achievements across multiple categories and time periods.
 * 
 * @namespace Leaderboards
 */
(function() {
    'use strict';

    // ============================================================================
    // CONSTANTS
    // ============================================================================
    
    const STORAGE_KEY = 'leaderboards';
    const MAX_LEADERBOARD_ENTRIES = 100;
    const MAX_HISTORY_ENTRIES = 50;
    
    const LEADERBOARD_TYPES = {
        GLOBAL: 'global',
        WEEKLY: 'weekly',
        MONTHLY: 'monthly',
        ALL_TIME: 'all_time'
    };
    
    const SORT_METHODS = {
        TOTAL_ACHIEVEMENTS: 'total_achievements',
        TOTAL_POINTS: 'total_points',
        STREAK: 'streak',
        CHAPTERS_READ: 'chapters_read',
        READING_TIME: 'reading_time'
    };
    
    const TIME_PERIODS = {
        WEEK: 7 * 24 * 60 * 60 * 1000,    // 7 days
        MONTH: 30 * 24 * 60 * 60 * 1000,  // 30 days
        ALL_TIME: Infinity
    };

    // ============================================================================
    // STATE
    // ============================================================================
    
    let leaderboards = {
        global: [],
        weekly: [],
        monthly: [],
        all_time: []
    };
    
    let currentUser = null;
    let leaderboardHistory = [];

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================
    
    /**
     * Generate a unique leaderboard entry ID
     * @returns {string} Unique ID
     */
    const generateEntryId = () => {
        return 'lb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Calculate time period for leaderboard type
     * @param {string} type - Leaderboard type
     * @returns {number} Timestamp for period start
     */
    const getPeriodStart = (type) => {
        const now = Date.now();
        switch (type) {
            case LEADERBOARD_TYPES.WEEKLY:
                return now - TIME_PERIODS.WEEK;
            case LEADERBOARD_TYPES.MONTHLY:
                return now - TIME_PERIODS.MONTH;
            case LEADERBOARD_TYPES.ALL_TIME:
                return 0;
            default:
                return now - TIME_PERIODS.WEEK;
        }
    }
    
    /**
     * Calculate user score based on achievements
     * @param {Object} achievements - User achievements
     * @returns {number} Total score
     */
    const calculateScore = (achievements) => {
        let score = 0;
        if (!achievements || !Array.isArray(achievements)) return score;
        
        achievements.forEach(achievement => {
            if (achievement.unlocked) {
                score += achievement.points || 10;
            }
        });
        
        return score;
    }
    
    /**
     * Get user statistics for leaderboard
     * @param {string} username - Username
     * @returns {Object} User statistics
     */
    const getUserStats = (username) => {
        // Get user data from various sources
        const userData = Storage.getUserData(username) || {};
        const achievements = userData.achievements || [];
        const readingHistory = Storage.getReadingStats();
        
        return {
            username: username,
            totalAchievements: achievements.filter(a => a.unlocked).length,
            totalPoints: calculateScore(achievements),
            streak: readingHistory.readingStreak || 0,
            chaptersRead: readingHistory.totalChaptersRead || 0,
            readingTime: readingHistory.totalReadingTime || 0,
            lastUpdated: Date.now()
        };
    }

    // ============================================================================
    // LEADERBOARD MANAGEMENT
    // ============================================================================
    
    /**
     * Initialize leaderboards from storage
     */
    const init = () => {
        try {
            const stored = Storage.getItem(STORAGE_KEY);
            if (stored) {
                const data = stored;
                leaderboards = data.leaderboards || leaderboards;
                leaderboardHistory = data.history || [];
            }
            
            // Get current user
            const currentUserObj = Storage.getCurrentUser();
            currentUser = currentUserObj ? currentUserObj.username : null;
            
            // Clean up old entries
            cleanupOldEntries();
            
            // Update current user's stats
            if (currentUser) {
                updateUserStats(currentUser);
            }
            
        } catch (error) {
            // Error handled silently: console.error('Failed to initialize leaderboards:', error);
        }
    }
    
    /**
     * Save leaderboards to storage
     */
    const save = () => {
        try {
            const data = {
                leaderboards: leaderboards,
                history: leaderboardHistory
            };
            Storage.setItem(STORAGE_KEY, data);
        } catch (error) {
            // Error handled silently: console.error('Failed to save leaderboards:', error);
        }
    }
    
    /**
     * Clean up old entries from leaderboards
     */
    const cleanupOldEntries = () => {
        const now = Date.now();
        
        // Clean weekly leaderboard
        const weekStart = getPeriodStart(LEADERBOARD_TYPES.WEEKLY);
        leaderboards.weekly = leaderboards.weekly.filter(entry => entry.lastUpdated >= weekStart);
        
        // Clean monthly leaderboard
        const monthStart = getPeriodStart(LEADERBOARD_TYPES.MONTHLY);
        leaderboards.monthly = leaderboards.monthly.filter(entry => entry.lastUpdated >= monthStart);
        
        // Limit entries
        Object.keys(leaderboards).forEach(type => {
            if (leaderboards[type].length > MAX_LEADERBOARD_ENTRIES) {
                leaderboards[type] = leaderboards[type].slice(0, MAX_LEADERBOARD_ENTRIES);
            }
        });
        
        save();
    }
    
    /**
     * Update user statistics in all leaderboards
     * @param {string} username - Username to update
     */
    const updateUserStats = (username) => {
        const stats = getUserStats(username);
        const entryId = generateEntryId();
        
        // Update all leaderboards
        Object.keys(LEADERBOARD_TYPES).forEach(key => {
            const type = LEADERBOARD_TYPES[key];
            const existingIndex = leaderboards[type].findIndex(e => e.username === username);
            
            const entry = {
                id: entryId,
                ...stats,
                rank: 0
            };
            
            if (existingIndex >= 0) {
                leaderboards[type][existingIndex] = entry;
            } else {
                leaderboards[type].push(entry);
            }
        });
        
        // Sort and assign ranks
        sortLeaderboards();
        
        // Add to history
        addToHistory(username, stats);
        
        save();
    }
    
    /**
     * Sort leaderboards and assign ranks
     * @param {string} sortMethod - Sort method to use
     */
    const sortLeaderboards = (sortMethod = SORT_METHODS.TOTAL_POINTS) => {
        Object.keys(leaderboards).forEach(type => {
            leaderboards[type].sort((a, b) => {
                const aValue = a[sortMethod] || 0;
                const bValue = b[sortMethod] || 0;
                return bValue - aValue; // Descending order
            });
            
            // Assign ranks
            leaderboards[type].forEach((entry, index) => {
                entry.rank = index + 1;
            });
        });
        
        save();
    }
    
    /**
     * Add entry to leaderboard history
     * @param {string} username - Username
     * @param {Object} stats - User statistics
     */
    const addToHistory = (username, stats) => {
        const historyEntry = {
            username: username,
            stats: stats,
            timestamp: Date.now()
        };
        
        leaderboardHistory.push(historyEntry);
        
        // Limit history
        if (leaderboardHistory.length > MAX_HISTORY_ENTRIES) {
            leaderboardHistory = leaderboardHistory.slice(-MAX_HISTORY_ENTRIES);
        }
    }
    
    /**
     * Get leaderboard by type
     * @param {string} type - Leaderboard type
     * @param {number} limit - Maximum entries to return
     * @returns {Array} Leaderboard entries
     */
    const getLeaderboard = (type = LEADERBOARD_TYPES.GLOBAL, limit = 50) => {
        return leaderboards[type] ? leaderboards[type].slice(0, limit) : [];
    }
    
    /**
     * Get user's rank in leaderboard
     * @param {string} username - Username
     * @param {string} type - Leaderboard type
     * @returns {Object|null} User's entry with rank
     */
    const getUserRank = (username, type = LEADERBOARD_TYPES.GLOBAL) => {
        const leaderboard = leaderboards[type];
        if (!leaderboard) return null;
        
        return leaderboard.find(entry => entry.username === username) || null;
    }
    
    /**
     * Get leaderboard history for user
     * @param {string} username - Username
     * @param {number} limit - Maximum entries to return
     * @returns {Array} History entries
     */
    const getUserHistory = (username, limit = 20) => {
        return leaderboardHistory
            .filter(entry => entry.username === username)
            .slice(-limit)
            .reverse();
    }
    
    /**
     * Get leaderboard statistics
     * @returns {Object} Statistics
     */
    const getStatistics = () => {
        const stats = {
            totalUsers: new Set(),
            totalAchievementsUnlocked: 0,
            totalPoints: 0,
            averageStreak: 0,
            averageChaptersRead: 0,
            averageReadingTime: 0
        };
        
        // Use all-time leaderboard for statistics
        const allTime = leaderboards.all_time || [];
        
        allTime.forEach(entry => {
            stats.totalUsers.add(entry.username);
            stats.totalAchievementsUnlocked += entry.totalAchievements;
            stats.totalPoints += entry.totalPoints;
            stats.averageStreak += entry.streak;
            stats.averageChaptersRead += entry.chaptersRead;
            stats.averageReadingTime += entry.readingTime;
        });
        
        const count = allTime.length || 1;
        stats.totalUsers = stats.totalUsers.size;
        stats.averageStreak = Math.round(stats.averageStreak / count);
        stats.averageChaptersRead = Math.round(stats.averageChaptersRead / count);
        stats.averageReadingTime = Math.round(stats.averageReadingTime / count);
        
        return stats;
    }
    
    /**
     * Get top users by category
     * @param {string} category - Category to sort by
     * @param {number} limit - Maximum entries
     * @returns {Array} Top users
     */
    const getTopUsers = (category = SORT_METHODS.TOTAL_POINTS, limit = 10) => {
        const allTime = [...(leaderboards.all_time || [])];
        
        allTime.sort((a, b) => {
            const aValue = a[category] || 0;
            const bValue = b[category] || 0;
            return bValue - aValue;
        });
        
        return allTime.slice(0, limit);
    }
    
    /**
     * Search leaderboard by username
     * @param {string} query - Search query
     * @param {string} type - Leaderboard type
     * @returns {Array} Matching entries
     */
    const searchLeaderboard = (query, type = LEADERBOARD_TYPES.GLOBAL) => {
        const leaderboard = leaderboards[type] || [];
        const lowerQuery = query.toLowerCase();
        
        return leaderboard.filter(entry => 
            entry.username.toLowerCase().includes(lowerQuery)
        );
    }
    
    /**
     * Export leaderboard data
     * @param {string} type - Leaderboard type
     * @returns {Object} Export data
     */
    const exportLeaderboard = (type = LEADERBOARD_TYPES.GLOBAL) => {
        return {
            type: type,
            entries: leaderboards[type] || [],
            exportedAt: Date.now(),
            statistics: getStatistics()
        };
    }
    
    /**
     * Import leaderboard data
     * @param {Object} data - Import data
     * @returns {boolean} Success status
     */
    const importLeaderboard = (data) => {
        try {
            if (!data || !data.entries || !Array.isArray(data.entries)) {
                return false;
            }
            
            const type = data.type || LEADERBOARD_TYPES.GLOBAL;
            
            // Merge entries
            data.entries.forEach(importedEntry => {
                const existingIndex = leaderboards[type].findIndex(
                    e => e.username === importedEntry.username
                );
                
                if (existingIndex >= 0) {
                    // Keep the most recent entry
                    if (importedEntry.lastUpdated > leaderboards[type][existingIndex].lastUpdated) {
                    leaderboards[type][existingIndex] = importedEntry;
                    }
                } else {
                    leaderboards[type].push(importedEntry);
                }
            });
            
            // Sort and assign ranks
            sortLeaderboards();
            
            save();
            return true;
            
        } catch (error) {
            // Error handled silently: console.error('Failed to import leaderboard:', error);
            return false;
        }
    }
    
    /**
     * Reset leaderboard
     * @param {string} type - Leaderboard type to reset
     */
    const resetLeaderboard = (type = LEADERBOARD_TYPES.GLOBAL) => {
        if (leaderboards[type]) {
            leaderboards[type] = [];
            save();
        }
    }
    
    /**
     * Get leaderboard comparison between users
     * @param {Array} usernames - Array of usernames
     * @returns {Object} Comparison data
     */
    const compareUsers = (usernames) => {
        const comparison = {
            users: [],
            categories: {}
        };
        
        usernames.forEach(username => {
            const stats = getUserStats(username);
            comparison.users.push(stats);
        });
        
        // Compare by category
        Object.values(SORT_METHODS).forEach(method => {
            comparison.categories[method] = comparison.users
                .map(user => ({
                    username: user.username,
                    value: user[method] || 0
                }))
                .sort((a, b) => b.value - a.value);
        });
        
        return comparison;
    }

    // ============================================================================
    // PUBLIC API
    // ============================================================================
    
    window.Leaderboards = {
        // Constants
        TYPES: LEADERBOARD_TYPES,
        SORT_METHODS: SORT_METHODS,
        
        // Initialization
        init: init,
        
        // Leaderboard Management
        updateUserStats: updateUserStats,
        getLeaderboard: getLeaderboard,
        getUserRank: getUserRank,
        getUserHistory: getUserHistory,
        getStatistics: getStatistics,
        getTopUsers: getTopUsers,
        searchLeaderboard: searchLeaderboard,
        
        // Data Management
        exportLeaderboard: exportLeaderboard,
        importLeaderboard: importLeaderboard,
        resetLeaderboard: resetLeaderboard,
        
        // Utilities
        sortLeaderboards: sortLeaderboards,
        compareUsers: compareUsers,
        getUserStats: getUserStats
    };
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', Leaderboards.init);
    } else {
        Leaderboards.init();
    }
    
})();