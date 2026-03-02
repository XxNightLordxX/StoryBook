/**
 * Notification System Module
 * 
 * Core functionality for managing notifications including:
 * - Notification preferences
 * - Email notifications
 * - Notification history
 * - Notification scheduling
 * - Notification templates
 * 
 * @namespace Notifications
 */
(function() {
    'use strict';

    // ==================== CONSTANTS ====================
    
    const STORAGE_KEYS = {
        PREFERENCES: 'notification_preferences',
        HISTORY: 'notification_history',
        SCHEDULED: 'scheduled_notifications',
        TEMPLATES: 'notification_templates'
    };

    const NOTIFICATION_TYPES = {
        CHAPTER_UPDATE: 'chapter_update',
        BOOKMARK_REMINDER: 'bookmark_reminder',
        ACHIEVEMENT: 'achievement',
        SOCIAL: 'social',
        SYSTEM: 'system',
        EMAIL: 'email'
    };

    const DEFAULT_PREFERENCES = {
        enabled: true,
        types: {
            chapter_update: true,
            bookmark_reminder: true,
            achievement: true,
            social: true,
            system: true,
            email: false
        },
        email: {
            enabled: false,
            address: '',
            frequency: 'immediate',
            digestTime: '09:00'
        },
        display: {
            position: 'top-right',
            duration: 5000,
            sound: true,
            desktop: true
        }
    };

    const DEFAULT_TEMPLATES = {
        chapter_update: {
            title: 'New Chapter Available',
            message: 'Chapter {chapterNumber} is now available to read!'
        },
        bookmark_reminder: {
            title: 'Bookmark Reminder',
            message: 'You have {count} bookmarked chapters waiting for you.'
        },
        achievement: {
            title: 'Achievement Unlocked!',
            message: 'Congratulations! You earned the "{achievementName}" achievement.'
        },
        social: {
            title: 'New Social Activity',
            message: '{action} from {username}'
        },
        system: {
            title: 'System Notification',
            message: '{message}'
        },
        email: {
            subject: 'Story-Unending Notification',
            body: 'You have a new notification from Story-Unending.'
        }
    };

    // ==================== STATE ====================
    
    let preferences = null;
    let history = [];
    let scheduled = [];
    let templates = null;

    // ==================== INITIALIZATION ====================
    
    /**
     * Initialize the notification system
     * @returns {void}
     */
    const initialize = () => {
        try {
            loadPreferences();
            loadHistory();
            loadScheduled();
            loadTemplates();
            startScheduler();
            // Notification system initialized
        } catch (error) {
            ErrorHandler.handleError('Failed to initialize notification system', error);
        }
    }

    /**
     * Load notification preferences from storage
     * @returns {void}
     */
    const loadPreferences = () => {
        try {
            const stored = Storage.getItem(STORAGE_KEYS.PREFERENCES);
            preferences = stored ? JSON.parse(stored) : { ...DEFAULT_PREFERENCES };
        } catch (error) {
            ErrorHandler.handleError('Failed to load notification preferences', error);
            preferences = { ...DEFAULT_PREFERENCES };
        }
    }

    /**
     * Load notification history from storage
     * @returns {void}
     */
    const loadHistory = () => {
        try {
            const stored = Storage.getItem(STORAGE_KEYS.HISTORY);
            history = stored ? JSON.parse(stored) : [];
        } catch (error) {
            ErrorHandler.handleError('Failed to load notification history', error);
            history = [];
        }
    }

    /**
     * Load scheduled notifications from storage
     * @returns {void}
     */
    const loadScheduled = () => {
        try {
            const stored = Storage.getItem(STORAGE_KEYS.SCHEDULED);
            scheduled = stored ? JSON.parse(stored) : [];
        } catch (error) {
            ErrorHandler.handleError('Failed to load scheduled notifications', error);
            scheduled = [];
        }
    }

    /**
     * Load notification templates from storage
     * @returns {void}
     */
    const loadTemplates = () => {
        try {
            const stored = Storage.getItem(STORAGE_KEYS.TEMPLATES);
            templates = stored ? JSON.parse(stored) : { ...DEFAULT_TEMPLATES };
        } catch (error) {
            ErrorHandler.handleError('Failed to load notification templates', error);
            templates = { ...DEFAULT_TEMPLATES };
        }
    }

    // ==================== NOTIFICATION PREFERENCES ====================
    
    /**
     * Get notification preferences
     * @returns {Object} Notification preferences
     */
    const getPreferences = () => {
        return { ...preferences };
    }

    /**
     * Update notification preferences
     * @param {Object} newPreferences - New preferences to update
     * @returns {boolean} Success status
     */
    const updatePreferences = (newPreferences) => {
        try {
            preferences = { ...preferences, ...newPreferences };
            Storage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
            return true;
        } catch (error) {
            ErrorHandler.handleError('Failed to update notification preferences', error);
            return false;
        }
    }

    /**
     * Reset preferences to defaults
     * @returns {boolean} Success status
     */
    const resetPreferences = () => {
        try {
            preferences = { ...DEFAULT_PREFERENCES };
            Storage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
            return true;
        } catch (error) {
            ErrorHandler.handleError('Failed to reset notification preferences', error);
            return false;
        }
    }

    /**
     * Check if a notification type is enabled
     * @param {string} type - Notification type
     * @returns {boolean} Enabled status
     */
    const isTypeEnabled = (type) => {
        return preferences.enabled && preferences.types[type] !== false;
    }

    // ==================== NOTIFICATION CREATION ====================
    
    /**
     * Create a new notification
     * @param {Object} notification - Notification data
     * @returns {string} Notification ID
     */
    const createNotification = (notification) => {
        try {
            const id = generateId();
            const timestamp = Date.now();
            
            const newNotification = {
                id,
                type: notification.type || NOTIFICATION_TYPES.SYSTEM,
                title: notification.title || 'Notification',
                message: notification.message || '',
                data: notification.data || {},
                read: false,
                timestamp,
                dismissed: false
            };

            history.unshift(newNotification);
            
            if (history.length > 1000) {
                history = history.slice(0, 1000);
            }

            Storage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

            if (isTypeEnabled(newNotification.type)) {
                displayNotification(newNotification);
            }

            if (preferences.email.enabled && preferences.types.email) {
                sendEmailNotification(newNotification);
            }

            return id;
        } catch (error) {
            ErrorHandler.handleError('Failed to create notification', error);
            return null;
        }
    }

    /**
     * Create notification from template
     * @param {string} type - Notification type
     * @param {Object} data - Data to substitute in template
     * @returns {string} Notification ID
     */
    const createFromTemplate = (type, data) => {
        try {
            const template = templates[type];
            if (!template) {
                // Error logged: console.error(`Template not found for type: ${type}`);
                return null;
            }

            const title = substituteVariables(template.title, data);
            const message = substituteVariables(template.message, data);

            return createNotification({
                type,
                title,
                message,
                data
            });
        } catch (error) {
            ErrorHandler.handleError('Failed to create notification from template', error);
            return null;
        }
    }

    /**
     * Substitute variables in template string
     * @param {string} template - Template string
     * @param {Object} data - Data to substitute
     * @returns {string} Substituted string
     */
    const substituteVariables = (template, data) => {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : match;
        });
    }

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    const generateId = () => {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ==================== NOTIFICATION DISPLAY ====================
    
    /**
     * Display notification to user
     * @param {Object} notification - Notification to display
     * @returns {void}
     */
    const displayNotification = (notification) => {
        try {
            if (preferences.display.desktop && 'Notification' in window) {
                if (Notification.permission === 'granted') {
                    new Notification(notification.title, {
                    body: notification.message,
                    icon: '/favicon.ico'
                    });
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission();
                }
            }

            if (preferences.display.sound) {
                playNotificationSound();
            }

            UINotifications.showNotification(notification.title, notification.message, 'info');
        } catch (error) {
            ErrorHandler.handleError('Failed to display notification', error);
        }
    }

    /**
     * Play notification sound
     * @returns {void}
     */
    const playNotificationSound = () => {
        try {
            const audio = new Audio('/sounds/notification.mp3');
            audio.play().catch(() => {
                // Could not play notification sound
            });
        } catch (error) {
            // Notification sound not available
        }
    }

    // ==================== EMAIL NOTIFICATIONS ====================
    
    /**
     * Send email notification
     * @param {Object} notification - Notification to send
     * @returns {boolean} Success status
     */
    const sendEmailNotification = (notification) => {
        try {
            if (!preferences.email.address) {
                // No email address configured
                return false;
            }

            // Email notification would be sent here
            // In production, this would integrate with an email service
            // NOTE: Email notifications are disabled pending backend integration
            // To enable: Uncomment the code below and configure email service
            // {
            //     to: preferences.email.address,
            //     subject: notification.title,
            //     body: notification.message
            // };

            Analytics.trackEvent('email_notification_sent', {
                type: notification.type
            });

            return true;
        } catch (error) {
            ErrorHandler.handleError('Failed to send email notification', error);
            return false;
        }
    }

    /**
     * Update email settings
     * @param {Object} settings - Email settings
     * @returns {boolean} Success status
     */
    const updateEmailSettings = (settings) => {
        try {
            preferences.email = { ...preferences.email, ...settings };
            Storage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
            return true;
        } catch (error) {
            ErrorHandler.handleError('Failed to update email settings', error);
            return false;
        }
    }

    // ==================== NOTIFICATION HISTORY ====================
    
    /**
     * Get notification history
     * @param {Object} filters - Optional filters
     * @returns {Array} Filtered notification history
     */
    const getHistory = (filters = {}) => {
        try {
            let filtered = [...history];

            if (filters.type) {
                filtered = filtered.filter(n => n.type === filters.type);
            }

            if (filters.read !== undefined) {
                filtered = filtered.filter(n => n.read === filters.read);
            }

            if (filters.dismissed !== undefined) {
                filtered = filtered.filter(n => n.dismissed === filters.dismissed);
            }

            if (filters.startDate) {
                filtered = filtered.filter(n => n.timestamp >= filters.startDate);
            }
            if (filters.endDate) {
                filtered = filtered.filter(n => n.timestamp <= filters.endDate);
            }

            if (filters.limit) {
                filtered = filtered.slice(0, filters.limit);
            }

            return filtered;
        } catch (error) {
            ErrorHandler.handleError('Failed to get notification history', error);
            return [];
        }
    }

    /**
     * Mark notification as read
     * @param {string} id - Notification ID
     * @returns {boolean} Success status
     */
    const markAsRead = (id) => {
        try {
            const notification = history.find(n => n.id === id);
            if (notification) {
                notification.read = true;
                Storage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
                return true;
            }
            return false;
        } catch (error) {
            ErrorHandler.handleError('Failed to mark notification as read', error);
            return false;
        }
    }

    /**
     * Mark all notifications as read
     * @returns {boolean} Success status
     */
    const markAllAsRead = () => {
        try {
            history.forEach(n => n.read = true);
            Storage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
            return true;
        } catch (error) {
            ErrorHandler.handleError('Failed to mark all notifications as read', error);
            return false;
        }
    }

    /**
     * Dismiss notification
     * @param {string} id - Notification ID
     * @returns {boolean} Success status
     */
    const dismissNotification = (id) => {
        try {
            const notification = history.find(n => n.id === id);
            if (notification) {
                notification.dismissed = true;
                Storage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
                return true;
            }
            return false;
        } catch (error) {
            ErrorHandler.handleError('Failed to dismiss notification', error);
            return false;
        }
    }

    /**
     * Delete notification
     * @param {string} id - Notification ID
     * @returns {boolean} Success status
     */
    const deleteNotification = (id) => {
        try {
            const index = history.findIndex(n => n.id === id);
            if (index !== -1) {
                history.splice(index, 1);
                Storage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
                return true;
            }
            return false;
        } catch (error) {
            ErrorHandler.handleError('Failed to delete notification', error);
            return false;
        }
    }

    /**
     * Clear notification history
     * @returns {boolean} Success status
     */
    const clearHistory = () => {
        try {
            history = [];
            Storage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
            return true;
        } catch (error) {
            ErrorHandler.handleError('Failed to clear notification history', error);
            return false;
        }
    }

    /**
     * Get unread notification count
     * @returns {number} Unread count
     */
    const getUnreadCount = () => {
        return history.filter(n => !n.read && !n.dismissed).length;
    }

    // ==================== NOTIFICATION SCHEDULING ====================
    
    /**
     * Schedule a notification
     * @param {Object} notification - Notification data
     * @param {Date} scheduledTime - When to send the notification
     * @returns {string} Scheduled notification ID
     */
    const scheduleNotification = (notification, scheduledTime) => {
        try {
            const id = generateId();
            
            const scheduledNotification = {
                id,
                notification,
                scheduledTime: scheduledTime.getTime(),
                created: Date.now(),
                status: 'pending'
            };

            scheduled.push(scheduledNotification);
            Storage.setItem(STORAGE_KEYS.SCHEDULED, JSON.stringify(scheduled));

            return id;
        } catch (error) {
            ErrorHandler.handleError('Failed to schedule notification', error);
            return null;
        }
    }

    /**
     * Cancel scheduled notification
     * @param {string} id - Scheduled notification ID
     * @returns {boolean} Success status
     */
    const cancelScheduledNotification = (id) => {
        try {
            const index = scheduled.findIndex(s => s.id === id);
            if (index !== -1) {
                scheduled.splice(index, 1);
                Storage.setItem(STORAGE_KEYS.SCHEDULED, JSON.stringify(scheduled));
                return true;
            }
            return false;
        } catch (error) {
            ErrorHandler.handleError('Failed to cancel scheduled notification', error);
            return false;
        }
    }

    /**
     * Get scheduled notifications
     * @returns {Array} Scheduled notifications
     */
    const getScheduledNotifications = () => {
        return [...scheduled];
    }

    /**
     * Start notification scheduler
     * @returns {void}
     */
    const startScheduler = () => {
        const schedulerInterval = setInterval(() => {
            const now = Date.now();
            const toSend = scheduled.filter(s => 
                s.status === 'pending' && s.scheduledTime <= now
            );

            toSend.forEach(s => {
                createNotification(s.notification);
                s.status = 'sent';
                s.sentTime = now;
            });

            scheduled = scheduled.filter(s => 
                s.status !== 'sent' || (now - s.sentTime) < 86400000
            );

            Storage.setItem(STORAGE_KEYS.SCHEDULED, JSON.stringify(scheduled));
        }, 60000);
    }

    // ==================== NOTIFICATION TEMPLATES ====================
    
    /**
     * Get notification templates
     * @returns {Object} Notification templates
     */
    const getTemplates = () => {
        return { ...templates };
    }

    /**
     * Update notification template
     * @param {string} type - Template type
     * @param {Object} template - Template data
     * @returns {boolean} Success status
     */
    const updateTemplate = (type, template) => {
        try {
            templates[type] = { ...templates[type], ...template };
            Storage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
            return true;
        } catch (error) {
            ErrorHandler.handleError('Failed to update notification template', error);
            return false;
        }
    }

    /**
     * Reset template to default
     * @param {string} type - Template type
     * @returns {boolean} Success status
     */
    const resetTemplate = (type) => {
        try {
            if (DEFAULT_TEMPLATES[type]) {
                templates[type] = { ...DEFAULT_TEMPLATES[type] };
                Storage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
                return true;
            }
            return false;
        } catch (error) {
            ErrorHandler.handleError('Failed to reset notification template', error);
            return false;
        }
    }

    // ==================== EXPORT ====================
    
    window.Notifications = {
        NOTIFICATION_TYPES,
        initialize,
        getPreferences,
        updatePreferences,
        resetPreferences,
        isTypeEnabled,
        createNotification,
        createFromTemplate,
        updateEmailSettings,
        getHistory,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        deleteNotification,
        clearHistory,
        getUnreadCount,
        scheduleNotification,
        cancelScheduledNotification,
        getScheduledNotifications,
        getTemplates,
        updateTemplate,
        resetTemplate
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();