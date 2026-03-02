/**
 * Unified Storage API for Story-Unending Project
 * Provides centralized storage operations with error handling, validation, and migration support
 * @module storage
 * @version 2.0
 */

(function() {
  'use strict';

  // ============================================================================
  // Error Handling
  // ============================================================================

  /**
   * Safely executes a storage operation with error handling
   * @private
   * @param {Function} operation - The operation to execute
   * @param {string} operationName - Name of the operation for error logging
   * @param {*} defaultValue - Default value to return on error
   * @returns {*} Result of operation or defaultValue on error
   */
  const safeExecute = (operation, operationName, defaultValue = null) => {
    try {
      return operation();
    } catch (error) {
      console.error(`[Storage] Error in ${operationName}:`, error);
      return defaultValue;
    }
  };

  // ============================================================================
  // User Management
  // ============================================================================

  /**
   * Gets all users from localStorage
   * @returns {Array<Object>} Array of user objects
   */
  const getUsers = () => {
    return safeExecute(() => {
      return JSON.parse(localStorage.getItem('ese_users') || '[]');
    }, 'getUsers', []);
  };

  /**
   * Saves users to localStorage
   * @param {Array<Object>} users - Array of user objects to save
   */
  const saveUsers = (users) => {
    safeExecute(() => {
      localStorage.setItem('ese_users', JSON.stringify(users));
    }, 'saveUsers');
  };

  /**
   * Gets the current logged-in user
   * @returns {Object|null} Current user object or null
   */
  const getCurrentUser = () => {
    return safeExecute(() => {
      const username = localStorage.getItem('currentUser');
      if (!username) return null;
      return getUserData(username);
    }, 'getCurrentUser', null);
  };

  /**
   * Sets the current logged-in user
   * @param {Object} user - User object
   */
  const setCurrentUser = (user) => {
    safeExecute(() => {
      if (user && user.username) {
        localStorage.setItem('currentUser', user.username);
        setUserData(user.username, user);
      } else {
        localStorage.removeItem('currentUser');
      }
    }, 'setCurrentUser');
  };

  /**
   * Gets user-specific data
   * @param {string} username - Username
   * @returns {Object|null} User data object or null
   */
  const getUserData = (username) => {
    return safeExecute(() => {
      const data = localStorage.getItem(`user_${username}`);
      return data ? JSON.parse(data) : null;
    }, 'getUserData', null);
  };

  /**
   * Sets user-specific data
   * @param {string} username - Username
   * @param {Object} data - User data object
   */
  const setUserData = (username, data) => {
    safeExecute(() => {
      localStorage.setItem(`user_${username}`, JSON.stringify(data));
    }, 'setUserData');
  };

  /**
   * Deletes a user
   * @param {string} username - Username to delete
   */
  const deleteUser = (username) => {
    safeExecute(() => {
      localStorage.removeItem(`user_${username}`);
      const users = getUsers();
      const filtered = users.filter(u => u.username !== username);
      saveUsers(filtered);
    }, 'deleteUser');
  };

  // ============================================================================
  // Reading History
  // ============================================================================

  const HISTORY_KEY = 'ese_readingHistory';
  const STATS_KEY = 'ese_readingStats';
  const SESSION_KEY = 'ese_currentSession';

  /**
   * Gets reading history
   * @returns {Array<Object>} Array of reading history entries
   */
  const getReadingHistory = () => {
    return safeExecute(() => {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    }, 'getReadingHistory', []);
  };

  /**
   * Sets reading history
   * @param {Array<Object>} history - Reading history array
   */
  const setReadingHistory = (history) => {
    safeExecute(() => {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }, 'setReadingHistory');
  };

  /**
   * Gets current reading session
   * @returns {Object|null} Current session object or null
   */
  const getCurrentSession = () => {
    return safeExecute(() => {
      const session = localStorage.getItem(SESSION_KEY);
      return session ? JSON.parse(session) : null;
    }, 'getCurrentSession', null);
  };

  /**
   * Sets current reading session
   * @param {Object} session - Session object
   */
  const setCurrentSession = (session) => {
    safeExecute(() => {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }, 'setCurrentSession');
  };

  /**
   * Clears current reading session
   */
  const clearCurrentSession = () => {
    safeExecute(() => {
      localStorage.removeItem(SESSION_KEY);
    }, 'clearCurrentSession');
  };

  /**
   * Gets reading statistics
   * @returns {Object} Reading statistics object
   */
  const getReadingStats = () => {
    return safeExecute(() => {
      return JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    }, 'getReadingStats', {});
  };

  /**
   * Sets reading statistics
   * @param {Object} stats - Statistics object
   */
  const setReadingStats = (stats) => {
    safeExecute(() => {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }, 'setReadingStats');
  };

  // ============================================================================
  // Search
  // ============================================================================

  const SEARCH_HISTORY_KEY = 'ese_searchHistory';

  /**
   * Gets search history
   * @returns {Array<string>} Array of search queries
   */
  const getSearchHistory = () => {
    return safeExecute(() => {
      return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
    }, 'getSearchHistory', []);
  };

  /**
   * Sets search history
   * @param {Array<string>} history - Search history array
   */
  const setSearchHistory = (history) => {
    safeExecute(() => {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    }, 'setSearchHistory');
  };

  /**
   * Clears search history
   */
  const clearSearchHistory = () => {
    safeExecute(() => {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    }, 'clearSearchHistory');
  };

  // ============================================================================
  // App State
  // ============================================================================

  /**
   * Gets application state
   * @returns {Object} Application state object
   */
  const getAppState = () => {
    return safeExecute(() => {
      return {
        paused: localStorage.getItem('ese_paused') === 'true',
        username: localStorage.getItem('ESE_ADMIN_USERNAME') || 'admin',
        password: localStorage.getItem('ESE_ADMIN_PASSWORD') || 'admin123',
        email: localStorage.getItem('ESE_ADMIN_EMAIL') || ''
      };
    }, 'getAppState', { paused: false, username: 'admin', password: 'admin123', email: '' });
  };

  /**
   * Sets application state
   * @param {Object} state - Application state object
   */
  const setAppState = (state) => {
    safeExecute(() => {
      if (state.paused !== undefined) {
        localStorage.setItem('ese_paused', state.paused.toString());
      }
      if (state.username !== undefined) {
        localStorage.setItem('ESE_ADMIN_USERNAME', state.username);
      }
      if (state.password !== undefined) {
        localStorage.setItem('ESE_ADMIN_PASSWORD', state.password);
      }
      if (state.email !== undefined) {
        localStorage.setItem('ESE_ADMIN_EMAIL', state.email);
      }
    }, 'setAppState');
  };

  /**
   * Gets paused state
   * @returns {boolean} Whether the app is paused
   */
  const getPausedState = () => {
    return safeExecute(() => {
      return localStorage.getItem('ese_paused') === 'true';
    }, 'getPausedState', false);
  };

  /**
   * Sets paused state
   * @param {boolean} paused - Whether to pause the app
   */
  const setPausedState = (paused) => {
    safeExecute(() => {
      localStorage.setItem('ese_paused', paused.toString());
    }, 'setPausedState');
  };

  // ============================================================================
  // Admin
  // ============================================================================

  /**
   * Gets admin configuration
   * @returns {Object} Admin configuration object
   */
  const getAdminConfig = () => {
    return safeExecute(() => {
      return {
        username: localStorage.getItem('ESE_ADMIN_USERNAME') || 'Admin',
        password: localStorage.getItem('ESE_ADMIN_PASSWORD') || 'admin123',
        email: localStorage.getItem('ESE_ADMIN_EMAIL') || ''
      };
    }, 'getAdminConfig', { username: 'Admin', password: 'admin123', email: '' });
  };

  /**
   * Sets admin configuration
   * @param {Object} config - Admin configuration object
   */
  const setAdminConfig = (config) => {
    safeExecute(() => {
      if (config.username !== undefined) {
        localStorage.setItem('ESE_ADMIN_USERNAME', config.username);
      }
      if (config.password !== undefined) {
        localStorage.setItem('ESE_ADMIN_PASSWORD', config.password);
      }
      if (config.email !== undefined) {
        localStorage.setItem('ESE_ADMIN_EMAIL', config.email);
      }
    }, 'setAdminConfig');
  };

  /**
   * Gets admin user object
   * @returns {Object} Admin user object
   */
  const getAdminUser = () => {
    return safeExecute(() => {
      return JSON.parse(localStorage.getItem('ese_adminUser') || '{}');
    }, 'getAdminUser', {});
  };

  /**
   * Sets admin user object
   * @param {Object} user - Admin user object
   */
  const setAdminUser = (user) => {
    safeExecute(() => {
      localStorage.setItem('ese_adminUser', JSON.stringify(user));
    }, 'setAdminUser');
  };

  // ============================================================================
  // Dynamic Content
  // ============================================================================

  /**
   * Gets character states
   * @returns {Object} Character states object
   */
  const getCharacterStates = () => {
    return safeExecute(() => {
      return JSON.parse(localStorage.getItem('characterStates') || '{}');
    }, 'getCharacterStates', {});
  };

  /**
   * Sets character states
   * @param {Object} states - Character states object
   */
  const setCharacterStates = (states) => {
    safeExecute(() => {
      localStorage.setItem('characterStates', JSON.stringify(states));
    }, 'setCharacterStates');
  };

  /**
   * Gets world state
   * @returns {Object} World state object
   */
  const getWorldState = () => {
    return safeExecute(() => {
      return JSON.parse(localStorage.getItem('worldState') || '{}');
    }, 'getWorldState', {});
  };

  /**
   * Sets world state
   * @param {Object} state - World state object
   */
  const setWorldState = (state) => {
    safeExecute(() => {
      localStorage.setItem('worldState', JSON.stringify(state));
    }, 'setWorldState');
  };

  // ============================================================================
  // Social
  // ============================================================================

  const SHARE_HISTORY_KEY = 'ese_shareHistory';

  /**
   * Gets share history
   * @returns {Array<Object>} Array of share history entries
   */
  const getShareHistory = () => {
    return safeExecute(() => {
      const history = localStorage.getItem(SHARE_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    }, 'getShareHistory', []);
  };

  /**
   * Sets share history
   * @param {Array<Object>} history - Share history array
   */
  const setShareHistory = (history) => {
    safeExecute(() => {
      localStorage.setItem(SHARE_HISTORY_KEY, JSON.stringify(history));
    }, 'setShareHistory');
  };

  /**
   * Clears share history
   */
  const clearShareHistory = () => {
    safeExecute(() => {
      localStorage.removeItem(SHARE_HISTORY_KEY);
    }, 'clearShareHistory');
  };

  // ============================================================================
  // Chapter Content
  // ============================================================================

  /**
   * Gets chapter content from localStorage
   * @param {number} chapterNum - Chapter number
   * @returns {Object|null} Chapter content object or null if not found
   */
  const getChapterContent = (chapterNum) => {
    return safeExecute(() => {
      const content = localStorage.getItem(`ese_chapter_${chapterNum}`);
      return content ? JSON.parse(content) : null;
    }, 'getChapterContent', null);
  };

  /**
   * Saves chapter content to localStorage
   * @param {number} chapterNum - Chapter number
   * @param {Object} content - Chapter content object
   */
  const saveChapterContent = (chapterNum, content) => {
    safeExecute(() => {
      localStorage.setItem(`ese_chapter_${chapterNum}`, JSON.stringify(content));
    }, 'saveChapterContent');
  };

  /**
   * Deletes chapter content
   * @param {number} chapterNum - Chapter number
   */
  const deleteChapterContent = (chapterNum) => {
    safeExecute(() => {
      localStorage.removeItem(`ese_chapter_${chapterNum}`);
    }, 'deleteChapterContent');
  };

  // ============================================================================
  // Used Paragraphs (for uniqueness tracking)
  // ============================================================================

  /**
   * Gets list of used paragraphs from localStorage
   * @returns {Array<string>} Array of used paragraph hashes
   */
  const getUsedParagraphs = () => {
    return safeExecute(() => {
      return JSON.parse(localStorage.getItem('ese_usedParagraphs') || '[]');
    }, 'getUsedParagraphs', []);
  };

  /**
   * Saves list of used paragraphs to localStorage
   * @param {Array<string>} used - Array of used paragraph hashes
   */
  const saveUsedParagraphs = (used) => {
    safeExecute(() => {
      localStorage.setItem('ese_usedParagraphs', JSON.stringify(used));
    }, 'saveUsedParagraphs');
  };

  // ============================================================================
  // Generic Operations
  // ============================================================================

  /**
   * Gets an item from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} Stored value or defaultValue
   */
  const getItem = (key, defaultValue = null) => {
    return safeExecute(() => {
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }, `getItem(${key})`, defaultValue);
  };

  /**
   * Sets an item in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   */
  const setItem = (key, value) => {
    safeExecute(() => {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
    }, `setItem(${key})`);
  };

  /**
   * Removes an item from localStorage
   * @param {string} key - Storage key
   */
  const removeItem = (key) => {
    safeExecute(() => {
      localStorage.removeItem(key);
    }, `removeItem(${key})`);
  };

  /**
   * Clears all items from localStorage
   */
  const clearAll = () => {
    safeExecute(() => {
      localStorage.clear();
    }, 'clearAll');
  };

  /**
   * Gets all keys from localStorage
   * @returns {Array<string>} Array of all keys
   */
  const getAllKeys = () => {
    return safeExecute(() => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }
      return keys;
    }, 'getAllKeys', []);
  };

  // ============================================================================
  // Migration Support
  // ============================================================================

  /**
   * Migrates data from old key to new key with optional transformation
   * @param {string} oldKey - Old storage key
   * @param {string} newKey - New storage key
   * @param {Function} transformFn - Optional transformation function
   * @returns {boolean} Success status
   */
  const migrateData = (oldKey, newKey, transformFn = null) => {
    return safeExecute(() => {
      const data = localStorage.getItem(oldKey);
      if (data === null) return false;

      let transformedData = data;
      if (transformFn) {
        try {
          const parsed = JSON.parse(data);
          transformedData = JSON.stringify(transformFn(parsed));
        } catch (error) {
          console.error('[Storage] Migration transform error:', error);
          return false;
        }
      }

      localStorage.setItem(newKey, transformedData);
      localStorage.removeItem(oldKey);
      return true;
    }, `migrateData(${oldKey} -> ${newKey})`, false);
  };

  /**
   * Backs up data to a backup key
   * @param {string} key - Storage key to backup
   * @param {string} backupKey - Backup storage key (optional, defaults to key + '_backup')
   * @returns {boolean} Success status
   */
  const backupData = (key, backupKey = null) => {
    return safeExecute(() => {
      const data = localStorage.getItem(key);
      if (data === null) return false;

      const actualBackupKey = backupKey || `${key}_backup`;
      localStorage.setItem(actualBackupKey, data);
      return true;
    }, `backupData(${key})`, false);
  };

  /**
   * Restores data from a backup key
   * @param {string} key - Storage key to restore
   * @param {string} backupKey - Backup storage key (optional, defaults to key + '_backup')
   * @returns {boolean} Success status
   */
  const restoreData = (key, backupKey = null) => {
    return safeExecute(() => {
      const actualBackupKey = backupKey || `${key}_backup`;
      const data = localStorage.getItem(actualBackupKey);
      if (data === null) return false;

      localStorage.setItem(key, data);
      localStorage.removeItem(actualBackupKey);
      return true;
    }, `restoreData(${key})`, false);
  };

  // ============================================================================
  // Validation
  // ============================================================================

  /**
   * Validates data against a schema
   * @param {*} data - Data to validate
   * @param {Object} schema - Schema object with required fields and types
   * @returns {boolean} Validation result
   */
  const validateData = (data, schema) => {
    return safeExecute(() => {
      if (!data || typeof data !== 'object') return false;

      for (const [field, type] of Object.entries(schema)) {
        if (!(field in data)) return false;
        if (typeof data[field] !== type) return false;
      }
      return true;
    }, 'validateData', false);
  };

  /**
   * Sanitizes data by removing potentially dangerous content
   * @param {*} data - Data to sanitize
   * @returns {*} Sanitized data
   */
  const sanitizeData = (data) => {
    return safeExecute(() => {
      if (typeof data !== 'object' || data === null) {
        return data;
      }

      const sanitized = Array.isArray(data) ? [] : {};

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          // Remove keys starting with $ or __ (potential prototype pollution)
          if (key.startsWith('$') || key.startsWith('__')) {
            continue;
          }
          sanitized[key] = sanitizeData(data[key]);
        }
      }

      return sanitized;
    }, 'sanitizeData', data);
  };

  // ============================================================================
  // Export
  // ============================================================================

  const Storage = {
    // User Management
    getUsers,
    saveUsers,
    getCurrentUser,
    setCurrentUser,
    getUserData,
    setUserData,
    deleteUser,

    // Reading History
    getReadingHistory,
    setReadingHistory,
    getCurrentSession,
    setCurrentSession,
    clearCurrentSession,
    getReadingStats,
    setReadingStats,

    // Search
    getSearchHistory,
    setSearchHistory,
    clearSearchHistory,

    // App State
    getAppState,
    setAppState,
    getPausedState,
    setPausedState,

    // Admin
    getAdminConfig,
    setAdminConfig,
    getAdminUser,
    setAdminUser,

    // Dynamic Content
    getCharacterStates,
    setCharacterStates,
    getWorldState,
    setWorldState,

    // Social
    getShareHistory,
    setShareHistory,
    clearShareHistory,

    // Chapter Content
    getChapterContent,
    saveChapterContent,
    deleteChapterContent,

    // Used Paragraphs
    getUsedParagraphs,
    saveUsedParagraphs,

    // Generic Operations
    getItem,
    setItem,
    removeItem,
    clearAll,
    getAllKeys,

    // Migration Support
    migrateData,
    backupData,
    restoreData,

    // Validation
    validateData,
    sanitizeData
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.Storage = Storage;
    
    // Legacy exports for backward compatibility
    window.getUsers = getUsers;
    window.saveUsers = saveUsers;
    window.getUsedParagraphs = getUsedParagraphs;
    window.saveUsedParagraphs = saveUsedParagraphs;
    window.getChapterContent = getChapterContent;
    window.saveChapterContent = saveChapterContent;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
  }

})();