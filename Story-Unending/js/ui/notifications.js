/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Unified Notification System for Story-Unending Project
 * Provides centralized notification management with queue, persistence, preferences, and actions
 * @module notifications
 * @version 2.0
 */

(function() {
  'use strict';

  // ============================================================================
  // Notification Types
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Notification type enumeration
   * @enum {string}
   */
  const NotificationTypes = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    COMBAT: 'combat-notif',
    LEVEL: 'level-notif',
    BOOKMARK: 'bookmark-notif',
    CHAPTER: 'chapter-notif',
    ACHIEVEMENT: 'achievement-notif',
    SOCIAL: 'social-notif'
  };

  // ============================================================================
  // Notification Queue
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Notification queue array
   * @type {Array<Object>}
   */
  let notificationQueue = [];

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Maximum queue size
   * @type {number}
   */
  const MAX_QUEUE_SIZE = 50;

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Queue processing interval in milliseconds
   * @type {number}
   */
  const QUEUE_PROCESSING_INTERVAL = 500;

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Whether queue processing is enabled
   * @type {boolean}
   */
  let queueProcessingEnabled = true;

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Queue processing timer
   * @type {number|null}
   */
  let queueProcessingTimer = null;

  // ============================================================================
  // Notification History
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Notification history array
   * @type {Array<Object>}
   */
  let notificationHistory = [];

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Maximum history size
   * @type {number}
   */
  const MAX_HISTORY_SIZE = 100;

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * History storage key
   * @type {string}
   */
  const HISTORY_STORAGE_KEY = 'ese_notificationHistory';

  // ============================================================================
  // Notification Preferences
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Default notification preferences
   * @type {Object}
   */
  const DEFAULT_PREFERENCES = {
    enabled: true,
    soundEnabled: false,
    duration: 5000,
    maxVisible: 5,
    position: 'top-right',
    queueEnabled: true,
    persistenceEnabled: true,
    types: {
      success: true,
      error: true,
      warning: true,
      info: true,
      'combat-notif': true,
      'level-notif': true,
      'bookmark-notif': true,
      'chapter-notif': true,
      'achievement-notif': true,
      'social-notif': true
    }
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Current notification preferences
   * @type {Object}
   */
  let preferences = { ...DEFAULT_PREFERENCES };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Preferences storage key
   * @type {string}
   */
  const PREFERENCES_STORAGE_KEY = 'ese_notificationPreferences';

  // ============================================================================
  // Notification Counter
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Notification ID counter
   * @type {number}
   */
  let notificationIdCounter = 0;

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Generates a unique notification ID
   * @returns {string} Unique notification ID
   */
  const generateNotificationId = () => {
    return `notif_${Date.now()}_${notificationIdCounter++}`;
  };

  // ============================================================================
  // Notification Queue Management
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Queues a notification
   * @param {Object} notification - Notification object
   * @returns {string} Notification ID
   */
  const queueNotification = (notification) => {
    if (!preferences.queueEnabled) {
      showNotificationImmediate(notification);
      return notification.id;
    }

    notificationQueue.push(notification);

    // Limit queue size
    if (notificationQueue.length > MAX_QUEUE_SIZE) {
      notificationQueue.shift();
    }

    return notification.id;
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Processes the notification queue
   */
  const processQueue = () => {
    if (!queueProcessingEnabled || notificationQueue.length === 0) {
      return;
    }

    const notification = notificationQueue.shift();
    showNotificationImmediate(notification);
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Starts queue processing
   */
  const startQueueProcessing = () => {
    if (queueProcessingTimer) {
      return;
    }

    queueProcessingTimer = setInterval(processQueue, QUEUE_PROCESSING_INTERVAL);
    queueProcessingEnabled = true;
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Stops queue processing
   */
  const stopQueueProcessing = () => {
    if (queueProcessingTimer) {
      clearInterval(queueProcessingTimer);
      queueProcessingTimer = null;
    }
    queueProcessingEnabled = false;
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Clears the notification queue
   */
  const clearQueue = () => {
    notificationQueue = [];
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Gets the queue size
   * @returns {number} Queue size
   */
  const getQueueSize = () => {
    return notificationQueue.length;
  };

  // ============================================================================
  // Notification Persistence
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Saves a notification to history
   * @param {Object} notification - Notification object
   */
  const saveNotification = (notification) => {
    if (!preferences.persistenceEnabled) {
      return;
    }

    notificationHistory.push(notification);

    // Limit history size
    if (notificationHistory.length > MAX_HISTORY_SIZE) {
      notificationHistory.shift();
    }

    // Save to storage
    if (typeof Storage !== 'undefined' && Storage.setItem) {
      Storage.setItem(HISTORY_STORAGE_KEY, notificationHistory);
    }
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Loads notification history from storage
   */
  const loadNotificationHistory = () => {
    if (typeof Storage !== 'undefined' && Storage.getItem) {
      const history = Storage.getItem(HISTORY_STORAGE_KEY, []);
      if (Array.isArray(history)) {
        notificationHistory = history;
      }
    }
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Gets notification history
   * @param {Object} filters - Optional filters (type, limit)
   * @returns {Array<Object>} Filtered notification history
   */
  const getNotificationHistory = (filters = {}) => {
    let filtered = [...notificationHistory];

    if (filters.type) {
      filtered = filtered.filter(notif => notif.type === filters.type);
    }

    if (filters.limit) {
      filtered = filtered.slice(-filters.limit);
    }

    return filtered;
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Clears notification history
   */
  const clearNotificationHistory = () => {
    notificationHistory = [];
    if (typeof Storage !== 'undefined' && Storage.removeItem) {
      Storage.removeItem(HISTORY_STORAGE_KEY);
    }
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Exports notification history as JSON
   * @returns {string} JSON string of notification history
   */
  const exportNotificationHistory = () => {
    return JSON.stringify(notificationHistory, null, 2);
  };

  // ============================================================================
  // Notification Preferences
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Gets notification preferences
   * @returns {Object} Notification preferences
   */
  const getPreferences = () => {
    return { ...preferences };
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Sets notification preferences
   * @param {Object} newPreferences - New preferences
   */
  const setPreferences = (newPreferences) => {
    preferences = { ...preferences, ...newPreferences };
    
    // Save to storage
    if (typeof Storage !== 'undefined' && Storage.setItem) {
      Storage.setItem(PREFERENCES_STORAGE_KEY, preferences);
    }
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Updates a single preference
   * @param {string} key - Preference key
   * @param {*} value - Preference value
   */
  const updatePreference = (key, value) => {
    preferences[key] = value;
    
    // Save to storage
    if (typeof Storage !== 'undefined' && Storage.setItem) {
      Storage.setItem(PREFERENCES_STORAGE_KEY, preferences);
    }
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Resets preferences to defaults
   */
  const resetPreferences = () => {
    preferences = { ...DEFAULT_PREFERENCES };
    
    // Save to storage
    if (typeof Storage !== 'undefined' && Storage.setItem) {
      Storage.setItem(PREFERENCES_STORAGE_KEY, preferences);
    }
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Loads preferences from storage
   */
  const loadPreferences = () => {
    if (typeof Storage !== 'undefined' && Storage.getItem) {
      const saved = Storage.getItem(PREFERENCES_STORAGE_KEY);
      if (saved && typeof saved === 'object') {
        preferences = { ...DEFAULT_PREFERENCES, ...saved };
      }
    }
  };

  // ============================================================================
  // Enhanced Notification API
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Shows a notification immediately
   * @param {Object} notification - Notification object
   */
  const showNotificationImmediate = (notification) => {
    if (!preferences.enabled) {
      return;
    }

    // Check if notification type is enabled
    if (preferences.types && preferences.types[notification.type] === false) {
      return;
    }

    const container = DOMHelpers.safeGetElement('notificationContainer');
    if (!container) {
      return;
    }

    const notif = document.createElement('div');
    notif.className = `notification ${notification.type}`;
    notif.id = notification.id;
    notif.innerHTML = `
      <div class="notification-title">${sanitizeHTML(notification.title)}</div>
      <div class="notification-body">${sanitizeHTML(notification.body)}</div>
      <div class="notification-timer"></div>
    `;

    // Add actions if present
    if (notification.actions && notification.actions.length > 0) {
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'notification-actions';
      
      notification.actions.forEach(action => {
        const actionButton = document.createElement('button');
        actionButton.className = 'notification-action';
        actionButton.textContent = action.label;
        actionButton.onclick = () => {
          if (action.handler) {
            action.handler(notification);
          }
        };
        actionsContainer.appendChild(actionButton);
      });
      
      notif.appendChild(actionsContainer);
    }

    container.appendChild(notif);

    // Auto-dismiss after duration
    const duration = notification.duration || preferences.duration;
    setTimeout(() => {
      dismissNotification(notification.id);
    }, duration);

    // Limit visible notifications
    while (container.children.length > preferences.maxVisible) {
      container.removeChild(container.firstChild);
    }

    // Save to history
    saveNotification(notification);
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Shows a notification
   * @param {string} type - Notification type
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {Object} options - Options (duration, actions, queue, persist)
   * @returns {string} Notification ID
   */
  const showNotification = (type, title, body, options = {}) => {
    const {
      duration = null,
      actions = [],
      queue = preferences.queueEnabled,
      persist = preferences.persistenceEnabled
    } = options;

    const notification = {
      id: generateNotificationId(),
      type: type,
      title: title,
      body: body,
      duration: duration,
      actions: actions,
      timestamp: new Date().toISOString(),
      persist: persist
    };

    if (queue) {
      return queueNotification(notification);
    } else {
      showNotificationImmediate(notification);
      return notification.id;
    }
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Dismisses a notification
   * @param {string} id - Notification ID
   */
  const dismissNotification = (id) => {
    const notif = DOMHelpers.safeGetElement(id);
    if (notif) {
      notif.style.opacity = '0';
      notif.style.transform = 'translateX(100px)';
      notif.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (notif.parentNode) {
          notif.parentNode.removeChild(notif);
        }
      }, 300);
    }
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Dismisses all notifications
   */
  const dismissAll = () => {
    const container = DOMHelpers.safeGetElement('notificationContainer');
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Snoozes a notification
   * @param {string} id - Notification ID
   * @param {number} duration - Snooze duration in milliseconds
   */
  const snoozeNotification = (id, duration = 60000) => {
    const notif = DOMHelpers.safeGetElement(id);
    if (notif) {
      dismissNotification(id);
      
      // Find notification in history and re-queue
      const historyNotif = notificationHistory.find(n => n.id === id);
      if (historyNotif) {
        setTimeout(() => {
          showNotificationImmediate(historyNotif);
        }, duration);
      }
    }
  };

  // ============================================================================
  // Notification Actions
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Adds an action to a notification
   * @param {Object} notification - Notification object
   * @param {Object} action - Action object (id, label, handler)
   */
  const addAction = (notification, action) => {
    if (!notification.actions) {
      notification.actions = [];
    }
    notification.actions.push(action);
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Removes an action from a notification
   * @param {Object} notification - Notification object
   * @param {string} actionId - Action ID
   */
  const removeAction = (notification, actionId) => {
    if (notification.actions) {
      notification.actions = notification.actions.filter(a => a.id !== actionId);
    }
  };

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Executes a notification action
   * @param {Object} notification - Notification object
   * @param {string} actionId - Action ID
   */
  const executeAction = (notification, actionId) => {
    if (notification.actions) {
      const action = notification.actions.find(a => a.id === actionId);
      if (action && action.handler) {
        action.handler(notification);
      }
    }
  };

  // ============================================================================
  // Utility Functions
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Sanitizes HTML content
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  const sanitizeHTML = (str) => {
    if (typeof str !== 'string') return str;
    if (typeof window !== 'undefined' && window.sanitizeHTML) {
      return window.sanitizeHTML(str);
    }
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  };

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Initializes the notification system
   */
  const init = () => {
    // Load preferences
    loadPreferences();
    
    // Load notification history
    loadNotificationHistory();
    
    // Start queue processing
    if (preferences.queueEnabled) {
      startQueueProcessing();
    }
  };

  // ============================================================================
  // Export
  // ============================================================================

  const UINotifications = {
    // Notification Types
    NotificationTypes: NotificationTypes,

    // Queue Management
    queueNotification: queueNotification,
    processQueue: processQueue,
    startQueueProcessing: startQueueProcessing,
    stopQueueProcessing: stopQueueProcessing,
    clearQueue: clearQueue,
    getQueueSize: getQueueSize,

    // Persistence
    saveNotification: saveNotification,
    getNotificationHistory: getNotificationHistory,
    clearNotificationHistory: clearNotificationHistory,
    exportNotificationHistory: exportNotificationHistory,

    // Preferences
    getPreferences: getPreferences,
    setPreferences: setPreferences,
    updatePreference: updatePreference,
    resetPreferences: resetPreferences,

    // Notification API
    showNotification: showNotification,
    dismissNotification: dismissNotification,
    dismissAll: dismissAll,
    snoozeNotification: snoozeNotification,

    // Actions
    addAction: addAction,
    removeAction: removeAction,
    executeAction: executeAction,

    // Initialization
    init: init
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.UINotifications = UINotifications;
    window.showNotification = showNotification;
    
    // Initialize on load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = UINotifications;
  }

})();