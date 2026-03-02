/**
 * Reading History Module
 * Tracks reading progress and statistics
 * @module reading-history
 */

(function() {
  'use strict';

  /**
   * Reading session structure
   * @typedef {Object} ReadingSession
   * @property {string} id - Unique session identifier
   * @property {number} chapterNum - Chapter number read
   * @property {string} chapterTitle - Chapter title
   * @property {Date} startTime - When reading started
   * @property {Date} endTime - When reading ended
   * @property {number} duration - Reading duration in seconds
   * @property {number} wordsRead - Estimated words read
   */

  /**
   * Storage key for reading history
   */
  const HISTORY_KEY = 'ese_readingHistory';

  /**
   * Storage key for reading statistics
   */
  const STATS_KEY = 'ese_readingStats';

  /**
   * Current reading session
   */
  let currentSession = null;

  /**
   * Starts a new reading session
   * @param {number} chapterNum - Chapter number being read
   */
  const startReadingSession = (chapterNum) => {
    try {
      const chapterContent = Storage.getChapterContent(chapterNum);
      const chapterTitle = chapterContent ? chapterContent.title : `Chapter ${chapterNum}`;
      
      currentSession = {
        id: generateSessionId(),
        chapterNum: chapterNum,
        chapterTitle: chapterTitle,
        startTime: new Date().toISOString(),
        endTime: null,
        duration: 0,
        wordsRead: 0
      };
      
      // Save to localStorage for persistence across page reloads
      Storage.setCurrentSession(currentSession);
    } catch (error) {
      // Error handled silently: console.error('Error starting reading session:', error);
    }
  }

  /**
   * Ends the current reading session
   */
  const endReadingSession = () => {
    if (!currentSession) {
      return;
    }
    
    try {
      const endTime = new Date();
      const startTime = new Date(currentSession.startTime);
      const duration = Math.floor((endTime - startTime) / 1000); // Duration in seconds
      
      currentSession.endTime = endTime.toISOString();
      currentSession.duration = duration;
      
      // Estimate words read (average 200 words per minute)
      const minutesRead = duration / 60;
      currentSession.wordsRead = Math.round(minutesRead * 200);
      
      // Save session to history
      saveSessionToHistory(currentSession);
      
      // Update statistics
      updateStatistics(currentSession);
      
      // Clear current session
      currentSession = null;
      Storage.clearCurrentSession();
    } catch (error) {
      // Error handled silently: console.error('Error ending reading session:', error);
    }
  }

  /**
   * Generates a unique session ID
   * @returns {string} Unique ID
   */
  const generateSessionId = () => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Saves a session to reading history
   * @param {ReadingSession} session - Session to save
   */
  const saveSessionToHistory = (session) => {
    try {
      const history = getReadingHistory();
      history.push(session);
      
      // Keep only last 100 sessions
      if (history.length > 100) {
        history.shift();
      }
      
      Storage.setReadingHistory(history);
    } catch (error) {
      // Error handled silently: console.error('Error saving session to history:', error);
    }
  }

  /**
   * Gets reading history
   * @returns {Array<ReadingSession>} Array of reading sessions
   */
  const getReadingHistory = () => {
    return ErrorHandler.safeExecute(() => {
      const history = Storage.getReadingHistory();
      return history.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    }, 'Loading reading history', []);
  }

  /**
   * Gets reading statistics
   * @returns {Object} Reading statistics
   */
  const getReadingStatistics = () => {
    return ErrorHandler.safeExecute(() => {
      const stats = Storage.getReadingStats();
      return stats;
    }, 'Loading reading statistics', {
      totalSessions: 0,
      totalChaptersRead: 0,
      totalReadingTime: 0,
      totalWordsRead: 0,
      longestSession: 0,
      averageSessionDuration: 0,
      lastReadDate: null,
      readingStreak: 0,
      uniqueChaptersRead: []
    });
  }

  /**
   * Updates reading statistics
   * @param {ReadingSession} session - Session to add to statistics
   */
  const updateStatistics = (session) => {
    try {
      const stats = getReadingStatistics();
      
      // Update basic stats
      stats.totalSessions = (stats.totalSessions || 0) + 1;
      stats.totalReadingTime = (stats.totalReadingTime || 0) + session.duration;
      stats.totalWordsRead = (stats.totalWordsRead || 0) + session.wordsRead;
      stats.lastReadDate = session.startTime;
      
      // Update longest session
      if (!stats.longestSession || session.duration > stats.longestSession) {
        stats.longestSession = session.duration;
      }
      
      // Update average session duration
      stats.averageSessionDuration = Math.round(stats.totalReadingTime / stats.totalSessions);
      
      // Update unique chapters read
      if (!stats.uniqueChaptersRead) {
        stats.uniqueChaptersRead = [];
      }
      if (!stats.uniqueChaptersRead.includes(session.chapterNum)) {
        stats.uniqueChaptersRead.push(session.chapterNum);
        stats.totalChaptersRead = stats.uniqueChaptersRead.length;
      }
      
      // Update reading streak
      stats.readingStreak = calculateReadingStreak();
      
      Storage.setReadingStats(stats);
    } catch (error) {
      // Error handled silently: console.error('Error updating statistics:', error);
    }
  }

  /**
   * Calculates reading streak (consecutive days)
   * @returns {number} Current reading streak
   */
  const calculateReadingStreak = () => {
    const history = getReadingHistory();
    if (history.length === 0) {
      return 0;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Get unique reading dates
    const readingDates = new Set();
    history.forEach(session => {
      const date = new Date(session.startTime);
      date.setHours(0, 0, 0, 0);
      readingDates.add(date.getTime());
    });
    
    const sortedDates = Array.from(readingDates).sort((a, b) => b - a);
    
    // Check if read today or yesterday
    if (sortedDates.length === 0) {
      return 0;
    }
    
    const mostRecentDate = new Date(sortedDates[0]);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    // If not read today or yesterday, streak is broken
    if (mostRecentDate.getTime() !== today.getTime() && 
        mostRecentDate.getTime() !== yesterday.getTime()) {
      return 0;
    }
    
    // Calculate streak
    let streak = 1;
    let currentDate = mostRecentDate;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() - 1);
      
      if (sortedDates[i] === nextDate.getTime()) {
        streak++;
        currentDate = nextDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  /**
   * Gets reading history for a specific date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array<ReadingSession>} Sessions in date range
   */
  const getHistoryByDateRange = (startDate, endDate) => {
    const history = getReadingHistory();
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);
    
    return history.filter(session => {
      const sessionDate = new Date(session.startTime).getTime();
      return sessionDate >= start && sessionDate <= end;
    });
  }

  /**
   * Gets reading history for a specific chapter
   * @param {number} chapterNum - Chapter number
   * @returns {Array<ReadingSession>} Sessions for chapter
   */
  const getHistoryByChapter = (chapterNum) => {
    const history = getReadingHistory();
    return history.filter(session => session.chapterNum === chapterNum);
  }

  /**
   * Clears reading history
   */
  const clearReadingHistory = () => {
    try {
      Storage.removeItem(HISTORY_KEY);
      Storage.removeItem(STATS_KEY);
    } catch (error) {
      // Error handled silently: console.error('Error clearing reading history:', error);
    }
  }

  /**
   * Gets the last read chapter
   * @returns {Object|null} Last read chapter info
   */
  const getLastReadChapter = () => {
    const history = getReadingHistory();
    if (history.length === 0) {
      return null;
    }
    
    const lastSession = history[0];
    return {
      chapterNum: lastSession.chapterNum,
      chapterTitle: lastSession.chapterTitle,
      lastReadDate: lastSession.startTime
    };
  }

  /**
   * Gets reading progress summary
   * @returns {Object} Progress summary
   */
  const getProgressSummary = () => {
    const stats = getReadingStatistics();
    const lastRead = getLastReadChapter();
    
    return {
      totalChaptersRead: stats.totalChaptersRead || 0,
      totalReadingTime: stats.totalReadingTime || 0,
      totalWordsRead: stats.totalWordsRead || 0,
      readingStreak: stats.readingStreak || 0,
      lastReadChapter: lastRead,
      averageSessionDuration: stats.averageSessionDuration || 0,
      longestSession: stats.longestSession || 0
    };
  }

  /**
   * Formats duration in human-readable format
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  const formatDuration = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Gets reading history grouped by date
   * @returns {Object} History grouped by date
   */
  const getHistoryGroupedByDate = () => {
    const history = getReadingHistory();
    const grouped = {};
    
    history.forEach(session => {
      const date = new Date(session.startTime);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          sessions: [],
          totalDuration: 0,
          totalWordsRead: 0
        };
      }
      
      grouped[dateKey].sessions.push(session);
      grouped[dateKey].totalDuration += session.duration;
      grouped[dateKey].totalWordsRead += session.wordsRead;
    });
    
    return grouped;
  }

  // Create namespace object
  const ReadingHistory = {
    startReadingSession: startReadingSession,
    endReadingSession: endReadingSession,
    getReadingHistory: getReadingHistory,
    getReadingStatistics: getReadingStatistics,
    getHistoryByDateRange: getHistoryByDateRange,
    getHistoryByChapter: getHistoryByChapter,
    clearReadingHistory: clearReadingHistory,
    getLastReadChapter: getLastReadChapter,
    getProgressSummary: getProgressSummary,
    formatDuration: formatDuration,
    getHistoryGroupedByDate: getHistoryGroupedByDate
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.ReadingHistory = ReadingHistory;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReadingHistory;
  }

})();