/**
 * Analytics Module
 * Tracks user behavior, reading patterns, and engagement metrics
 * 
 * @namespace Analytics
 */
(function() {
    'use strict';

    // Private variables
    let metrics = {
        sessions: [],
        chapterViews: [],
        readingTimes: {},
        userActions: [],
        dailyStats: {}
    };

    let currentSession = null;
    let sessionStartTime = null;
    let chapterStartTime = null;

    /**
     * Initialize analytics module
     */
    const init = () => {
        loadMetrics();
        startSession();
        setupEventListeners();
        cleanupOldData();
    }

    /**
     * Load metrics from localStorage
     */
    const loadMetrics = () => {
        try {
            const stored = Storage.getItem('story_analytics_metrics');
            if (stored) {
                metrics = JSON.parse(stored);
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to load analytics metrics', error);
        }
    }

    /**
     * Save metrics to localStorage
     */
    const saveMetrics = () => {
        try {
            Storage.setItem('story_analytics_metrics', JSON.stringify(metrics));
        } catch (error) {
            ErrorHandler.handleError('Failed to save analytics metrics', error);
        }
    }

    /**
     * Start a new analytics session
     */
    const startSession = () => {
        sessionStartTime = Date.now();
        currentSession = {
            id: generateSessionId(),
            startTime: sessionStartTime,
            endTime: null,
            chaptersRead: [],
            actions: [],
            duration: 0
        };
        metrics.sessions.push(currentSession);
        saveMetrics();
    }

    /**
     * End current session
     */
    const endSession = () => {
        if (currentSession) {
            currentSession.endTime = Date.now();
            currentSession.duration = currentSession.endTime - currentSession.startTime;
            saveMetrics();
        }
    }

    /**
     * Generate unique session ID
     */
    const generateSessionId = () => {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Track chapter view
     * @param {number} chapterNumber - Chapter number
     * @param {string} chapterTitle - Chapter title
     */
    const trackChapterView = (chapterNumber, chapterTitle) => {
        const timestamp = Date.now();
        
        // Record chapter view
        const chapterView = {
            chapterNumber: chapterNumber,
            chapterTitle: chapterTitle,
            timestamp: timestamp,
            sessionId: currentSession ? currentSession.id : null
        };
        metrics.chapterViews.push(chapterView);

        // Track in current session
        if (currentSession) {
            currentSession.chaptersRead.push(chapterNumber);
        }

        // Start tracking reading time for this chapter
        chapterStartTime = timestamp;

        // Update daily stats
        updateDailyStats('chapterViews', 1);

        saveMetrics();
    }

    /**
     * Track reading time for current chapter
     */
    const trackReadingTime = () => {
        if (!chapterStartTime) return;

        const currentTime = Date.now();
        const readingTime = currentTime - chapterStartTime;
        const chapterNumber = AppStateModule.getCurrentChapter();

        if (chapterNumber) {
            if (!metrics.readingTimes[chapterNumber]) {
                metrics.readingTimes[chapterNumber] = {
                    totalTime: 0,
                    viewCount: 0,
                    averageTime: 0
                };
            }

            metrics.readingTimes[chapterNumber].totalTime += readingTime;
            metrics.readingTimes[chapterNumber].viewCount += 1;
            metrics.readingTimes[chapterNumber].averageTime = 
                metrics.readingTimes[chapterNumber].totalTime / 
                metrics.readingTimes[chapterNumber].viewCount;

            saveMetrics();
        }

        chapterStartTime = currentTime;
    }

    /**
     * Track user action
     * @param {string} actionType - Type of action (e.g., 'save', 'bookmark', 'search')
     * @param {object} details - Additional details about the action
     */
    const trackAction = (actionType, details = {}) => {
        const action = {
            type: actionType,
            timestamp: Date.now(),
            details: details,
            sessionId: currentSession ? currentSession.id : null
        };

        metrics.userActions.push(action);

        if (currentSession) {
            currentSession.actions.push(action);
        }

        updateDailyStats(actionType, 1);
        saveMetrics();
    }

    /**
     * Update daily statistics
     * @param {string} key - Statistic key
     * @param {number} value - Value to add
     */
    const updateDailyStats = (key, value) => {
        const today = new Date().toISOString().split('T')[0];
        
        if (!metrics.dailyStats[today]) {
            metrics.dailyStats[today] = {
                chapterViews: 0,
                saves: 0,
                bookmarks: 0,
                searches: 0,
                totalReadingTime: 0
            };
        }

        if (metrics.dailyStats[today][key] !== undefined) {
            metrics.dailyStats[today][key] += value;
        }

        saveMetrics();
    }

    /**
     * Get session statistics
     * @returns {object} Session statistics
     */
    const getSessionStats = () => {
        const totalSessions = metrics.sessions.length;
        const totalDuration = metrics.sessions.reduce((sum, session) => sum + session.duration, 0);
        const avgDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
        const totalChaptersRead = metrics.sessions.reduce((sum, session) => sum + session.chaptersRead.length, 0);

        return {
            totalSessions: totalSessions,
            totalDuration: totalDuration,
            averageDuration: avgDuration,
            totalChaptersRead: totalChaptersRead,
            avgChaptersPerSession: totalSessions > 0 ? totalChaptersRead / totalSessions : 0
        };
    }

    /**
     * Get chapter statistics
     * @returns {object} Chapter statistics
     */
    const getChapterStats = () => {
        const chapterViews = {};
        
        metrics.chapterViews.forEach(view => {
            if (!chapterViews[view.chapterNumber]) {
                chapterViews[view.chapterNumber] = {
                    count: 0,
                    title: view.chapterTitle
                };
            }
            chapterViews[view.chapterNumber].count++;
        });

        return {
            totalViews: metrics.chapterViews.length,
            chapterViews: chapterViews,
            readingTimes: metrics.readingTimes
        };
    }

    /**
     * Get daily statistics
     * @param {number} days - Number of days to retrieve
     * @returns {array} Daily statistics
     */
    const getDailyStats = (days = 30) => {
        const stats = [];
        const dates = Object.keys(metrics.dailyStats).sort().reverse().slice(0, days);

        dates.forEach(date => {
            stats.push({
                date: date,
                ...metrics.dailyStats[date]
            });
        });

        return stats;
    }

    /**
     * Get action statistics
     * @returns {object} Action statistics
     */
    const getActionStats = () => {
        const actionCounts = {};
        
        metrics.userActions.forEach(action => {
            if (!actionCounts[action.type]) {
                actionCounts[action.type] = 0;
            }
            actionCounts[action.type]++;
        });

        return {
            totalActions: metrics.userActions.length,
            actionCounts: actionCounts
        };
    }

    /**
     * Get overall analytics summary
     * @returns {object} Complete analytics summary
     */
    const getSummary = () => {
        return {
            sessionStats: getSessionStats(),
            chapterStats: getChapterStats(),
            dailyStats: getDailyStats(30),
            actionStats: getActionStats(),
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * Export analytics data
     * @param {string} format - Export format ('json' or 'csv')
     * @returns {string} Exported data
     */
    const exportData = (format = 'json') => {
        const data = getSummary();

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            return convertToCSV(data);
        }

        throw new Error('Unsupported export format: ' + format);
    }

    /**
     * Convert analytics data to CSV format
     * @param {object} data - Analytics data
     * @returns {string} CSV formatted data
     */
    const convertToCSV = (data) => {
        let csv = 'Date,Chapter Views,Saves,Bookmarks,Searches,Reading Time (ms)\n';

        data.dailyStats.forEach(stat => {
            csv += `${stat.date},${stat.chapterViews},${stat.saves},${stat.bookmarks},${stat.searches},${stat.totalReadingTime}\n`;
        });

        return csv;
    }

    /**
     * Clear all analytics data
     */
    const clearData = () => {
        metrics = {
            sessions: [],
            chapterViews: [],
            readingTimes: {},
            userActions: [],
            dailyStats: {}
        };
        saveMetrics();
    }

    /**
     * Clean up old data (older than 90 days)
     */
    const cleanupOldData = () => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);

        // Clean up daily stats
        Object.keys(metrics.dailyStats).forEach(date => {
            const statDate = new Date(date);
            if (statDate < cutoffDate) {
                delete metrics.dailyStats[date];
            }
        });

        // Clean up old sessions
        metrics.sessions = metrics.sessions.filter(session => {
            return new Date(session.startTime) > cutoffDate;
        });

        // Clean up old chapter views
        metrics.chapterViews = metrics.chapterViews.filter(view => {
            return new Date(view.timestamp) > cutoffDate;
        });

        // Clean up old user actions
        metrics.userActions = metrics.userActions.filter(action => {
            return new Date(action.timestamp) > cutoffDate;
        });

        saveMetrics();
    }

    /**
     * Setup event listeners for automatic tracking
     */
    const setupEventListeners = () => {
        // Track page visibility changes
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                trackReadingTime();
            } else {
                chapterStartTime = Date.now();
            }
        });

        // Track before page unload
        window.addEventListener('beforeunload', function() {
            trackReadingTime();
            endSession();
        });
    }

    // Export public API
    window.Analytics = {
        init: init,
        trackChapterView: trackChapterView,
        trackReadingTime: trackReadingTime,
        trackAction: trackAction,
        getSessionStats: getSessionStats,
        getChapterStats: getChapterStats,
        getDailyStats: getDailyStats,
        getActionStats: getActionStats,
        getSummary: getSummary,
        exportData: exportData,
        clearData: clearData
    };

})();