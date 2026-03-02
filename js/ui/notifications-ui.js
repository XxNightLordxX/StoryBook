/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Notification System UI Module
 * 
 * User interface for managing notifications including:
 * - Notification preferences interface
 * - Notification history view
 * - Notification scheduling UI
 * - Notification management features
 * 
 * @namespace NotificationsUI
 */
(function() {
    'use strict';

    const MODAL_ID = 'notifications-modal';
    const TABS = {
        PREFERENCES: 'preferences',
        HISTORY: 'history',
        SCHEDULED: 'scheduled',
        TEMPLATES: 'templates'
    };

    let currentTab = TABS.PREFERENCES;
    let historyFilter = {
        type: '',
        read: undefined,
        dismissed: undefined
    };

    const initialize = () => {
        try {
            createModal();
            setupEventListeners();
            // Notification UI initialized
        } catch (error) {
            ErrorHandler.handleError('Failed to initialize notification UI', error);
        }
    }

    const createModal = () => {
        const modalHTML = `
  <div id="${MODAL_ID}" class="modal notifications-modal">
      <div class="modal-content notifications-modal-content">
          <div class="modal-header">
              <h2>Notifications</h2>
              <button class="close-btn" onclick="NotificationsUI.closeModal()">&times;</button>
          </div>

          <div class="modal-body">
              <div class="tabs">
                  <button class="tab-btn active" data-tab="${TABS.PREFERENCES}" onclick="NotificationsUI.switchTab('${TABS.PREFERENCES}')">
                      Preferences
                  </button>
                  <button class="tab-btn" data-tab="${TABS.HISTORY}" onclick="NotificationsUI.switchTab('${TABS.HISTORY}')">
                      History <span class="badge" id="unread-badge">0</span>
                  </button>
                  <button class="tab-btn" data-tab="${TABS.SCHEDULED}" onclick="NotificationsUI.switchTab('${TABS.SCHEDULED}')">
                      Scheduled
                  </button>
                  <button class="tab-btn" data-tab="${TABS.TEMPLATES}" onclick="NotificationsUI.switchTab('${TABS.TEMPLATES}')">
                      Templates
                  </button>
              </div>

              <div class="tab-content">
                  <div id="${TABS.PREFERENCES}-tab" class="tab-pane active">
                      ${getPreferencesContent()}
                  </div>
                  <div id="${TABS.HISTORY}-tab" class="tab-pane">
                      ${getHistoryContent()}
                  </div>
                  <div id="${TABS.SCHEDULED}-tab" class="tab-pane">
                      ${getScheduledContent()}
                  </div>
                  <div id="${TABS.TEMPLATES}-tab" class="tab-pane">
                      ${getTemplatesContent()}
                  </div>
              </div>
          </div>
      </div>
  </div>
`;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const setupEventListeners = () => {
        DOMHelpers.safeGetElement(MODAL_ID).addEventListener('click', (e) => {
            if (e.target.id === MODAL_ID) {
                closeModal();
            }
        });

        const unreadBadgeInterval = setInterval(updateUnreadBadge, 30000);
    }

    const openModal = () => {
        try {
            const modal = DOMHelpers.safeGetElement(MODAL_ID);
            modal.style.display = 'block';
            refreshCurrentTab();
            updateUnreadBadge();
        } catch (error) {
            ErrorHandler.handleError('Failed to open notification modal', error);
        }
    }

    const closeModal = () => {
        try {
            const modal = DOMHelpers.safeGetElement(MODAL_ID);
            modal.style.display = 'none';
        } catch (error) {
            ErrorHandler.handleError('Failed to close notification modal', error);
        }
    }

    const switchTab = (tabName) => {
        try {
            currentTab = tabName;
            
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.tab === tabName) {
                    btn.classList.add('active');
                }
            });
            
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            DOMHelpers.safeGetElement(`${tabName}-tab`).classList.add('active');
            
            refreshCurrentTab();
        } catch (error) {
            ErrorHandler.handleError('Failed to switch tab', error);
        }
    }

    const refreshCurrentTab = () => {
        switch (currentTab) {
            case TABS.PREFERENCES:
                refreshPreferences();
                break;
            case TABS.HISTORY:
                refreshHistory();
                break;
            case TABS.SCHEDULED:
                refreshScheduled();
                break;
            case TABS.TEMPLATES:
                refreshTemplates();
                break;
        }
    }

    const getPreferencesContent = () => {
        const prefs = Notifications.getPreferences();
        
        return `
            <div class="preferences-section">
                <h3>General Settings</h3>
                <div class="form-group">
                    <label>
                    <input type="checkbox" id="pref-enabled" ${prefs.enabled ? 'checked' : ''}>
                    Enable Notifications
                    </label>
                </div>
                
                <h3>Notification Types</h3>
                <div class="form-group">
                    <label>
                    <input type="checkbox" id="pref-chapter" ${prefs.types.chapter_update ? 'checked' : ''}>
                    Chapter Updates
                    </label>
                </div>
                <div class="form-group">
                    <label>
                    <input type="checkbox" id="pref-bookmark" ${prefs.types.bookmark_reminder ? 'checked' : ''}>
                    Bookmark Reminders
                    </label>
                </div>
                <div class="form-group">
                    </label>
                </div>
                <div class="form-group">
                    <label>
                    <input type="checkbox" id="pref-social" ${prefs.types.social ? 'checked' : ''}>
                    Social Activity
                    </label>
                </div>
                <div class="form-group">
                    <label>
                    <input type="checkbox" id="pref-system" ${prefs.types.system ? 'checked' : ''}>
                    System Notifications
                    </label>
                </div>
                
                <h3>Email Notifications</h3>
                <div class="form-group">
                    <label>
                    <input type="checkbox" id="pref-email-enabled" ${prefs.email.enabled ? 'checked' : ''}>
                    Enable Email Notifications
                    </label>
                </div>
                <div class="form-group">
                    <label for="pref-email-address">Email Address:</label>
                    <input type="email" id="pref-email-address" value="${sanitizeHTML(prefs.email.address)}" placeholder="your@email.com">
                </div>
                <div class="form-group">
                    <label for="pref-email-frequency">Frequency:</label>
                    <select id="pref-email-frequency">
                    <option value="immediate" ${prefs.email.frequency === 'immediate' ? 'selected' : ''}>Immediate</option>
                    <option value="daily" ${prefs.email.frequency === 'daily' ? 'selected' : ''}>Daily Digest</option>
                    <option value="weekly" ${prefs.email.frequency === 'weekly' ? 'selected' : ''}>Weekly Digest</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="pref-email-time">Digest Time:</label>
                    <input type="time" id="pref-email-time" value="${prefs.email.digestTime}">
                </div>
                
                <h3>Display Settings</h3>
                <div class="form-group">
                    <label for="pref-position">Position:</label>
                    <select id="pref-position">
                    <option value="top-right" ${prefs.display.position === 'top-right' ? 'selected' : ''}>Top Right</option>
                    <option value="top-left" ${prefs.display.position === 'top-left' ? 'selected' : ''}>Top Left</option>
                    <option value="bottom-right" ${prefs.display.position === 'bottom-right' ? 'selected' : ''}>Bottom Right</option>
                    <option value="bottom-left" ${prefs.display.position === 'bottom-left' ? 'selected' : ''}>Bottom Left</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="pref-duration">Duration (ms):</label>
                    <input type="number" id="pref-duration" value="${prefs.display.duration}" min="1000" max="30000" step="1000">
                </div>
                <div class="form-group">
                    <label>
                    <input type="checkbox" id="pref-sound" ${prefs.display.sound ? 'checked' : ''}>
                    Play Sound
                    </label>
                </div>
                <div class="form-group">
                    <label>
                    <input type="checkbox" id="pref-desktop" ${prefs.display.desktop ? 'checked' : ''}>
                    Desktop Notifications
                    </label>
                </div>
                
                <div class="button-group">
                    <button class="btn btn-primary" onclick="NotificationsUI.savePreferences()">Save Preferences</button>
                    <button class="btn btn-secondary" onclick="NotificationsUI.resetPreferences()">Reset to Defaults</button>
                </div>
            </div>
        `;
    }

    const refreshPreferences = () => {
        const tabContent = DOMHelpers.safeGetElement(`${TABS.PREFERENCES}-tab`);
        tabContent.innerHTML = getPreferencesContent();
    }

    const savePreferences = () => {
        try {
            const newPreferences = {
                enabled: DOMHelpers.safeGetElement('pref-enabled').checked,
                types: {
                    chapter_update: DOMHelpers.safeGetElement('pref-chapter').checked,
                    bookmark_reminder: DOMHelpers.safeGetElement('pref-bookmark').checked,
                    achievement: DOMHelpers.safeGetElement('pref-achievement').checked,
                    social: DOMHelpers.safeGetElement('pref-social').checked,
                    system: DOMHelpers.safeGetElement('pref-system').checked,
                    email: DOMHelpers.safeGetElement('pref-email-enabled').checked
                },
                email: {
                    enabled: DOMHelpers.safeGetElement('pref-email-enabled').checked,
                    address: DOMHelpers.safeGetElement('pref-email-address').value,
                    frequency: DOMHelpers.safeGetElement('pref-email-frequency').value,
                    digestTime: DOMHelpers.safeGetElement('pref-email-time').value
                },
                display: {
                    position: DOMHelpers.safeGetElement('pref-position').value,
                    duration: parseInt(DOMHelpers.safeGetElement('pref-duration').value),
                    sound: DOMHelpers.safeGetElement('pref-sound').checked,
                    desktop: DOMHelpers.safeGetElement('pref-desktop').checked
                }
            };

            if (Notifications.updatePreferences(newPreferences)) {
                UINotifications.showNotification('Success', 'Preferences saved successfully', 'success');
            } else {
                UINotifications.showNotification('Error', 'Failed to save preferences', 'error');
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to save preferences', error);
        }
    }

    const resetPreferences = () => {
        if (confirm('Are you sure you want to reset all preferences to defaults?')) {
            if (Notifications.resetPreferences()) {
                refreshPreferences();
                UINotifications.showNotification('Success', 'Preferences reset to defaults', 'success');
            } else {
                UINotifications.showNotification('Error', 'Failed to reset preferences', 'error');
            }
        }
    }

    const getHistoryContent = () => {
        const history = Notifications.getHistory(historyFilter);
        const unreadCount = Notifications.getUnreadCount();
        
        let historyHTML = `
      <div class="history-section">
          <div class="history-controls">
              <div class="filter-group">
                  <label for="filter-type">Type:</label>
                  <select id="filter-type" onchange="NotificationsUI.applyHistoryFilter()">
                      <option value="">All Types</option>
                      <option value="chapter_update" ${historyFilter.type === 'chapter_update' ? 'selected' : ''}>Chapter Updates</option>
                      <option value="bookmark_reminder" ${historyFilter.type === 'bookmark_reminder' ? 'selected' : ''}>Bookmark Reminders</option>
                      <option value="achievement" ${historyFilter.type === 'achievement' ? 'selected' : ''}>Achievements</option>
                      <option value="system" ${historyFilter.type === 'system' ? 'selected' : ''}>System</option>
                  </select>
              </div>
              <div class="filter-group">
                  <label for="filter-read">Status:</label>
                  <select id="filter-read" onchange="NotificationsUI.applyHistoryFilter()">
                      <option value="">All</option>
                      <option value="unread" ${historyFilter.read === false ? 'selected' : ''}>Unread</option>
                      <option value="read" ${historyFilter.read === true ? 'selected' : ''}>Read</option>
                  </select>
              </div>
              <div class="button-group">
                  <button class="btn btn-primary" onclick="NotificationsUI.markAllAsRead()">Mark All Read</button>
                  <button class="btn btn-danger" onclick="NotificationsUI.clearHistory()">Clear History</button>
              </div>
          </div>

          <div class="history-stats">
              <span>Total: ${history.length}</span>
              <span>Unread: ${unreadCount}</span>
          </div>

          <div class="history-list">
  `;
        
        if (history.length === 0) {
            historyHTML += `
                <div class="empty-state">
                    <p>No notifications found</p>
                </div>
            `;
        } else {
            history.forEach(notification => {
                historyHTML += `
              <div class="notification-card ${notification.read ? 'read' : 'unread'} ${notification.dismissed ? 'dismissed' : ''}" data-id="${notification.id}">
                  <div class="notification-header">
                      <span class="notification-type">${notification.type}</span>
                      <span class="notification-time">${formatDate(notification.timestamp)}</span>
                  </div>
                  <div class="notification-title">${sanitizeHTML(notification.title)}</div>
                  <div class="notification-message">${sanitizeHTML(notification.message)}</div>
                  <div class="notification-actions">
                      ${!notification.read ? `<button class="btn btn-small" onclick="NotificationsUI.markAsRead('${notification.id}')">Mark Read</button>` : ''}
                      <button class="btn btn-small" onclick="NotificationsUI.dismissNotification('${notification.id}')">Dismiss</button>
                      <button class="btn btn-small btn-danger" onclick="NotificationsUI.deleteNotification('${notification.id}')">Delete</button>
                  </div>
              </div>
            `;
            });
        }
        
        historyHTML += `
                </div>
            </div>
        `;
        
        return historyHTML;
    }

    const refreshHistory = () => {
        const tabContent = DOMHelpers.safeGetElement(`${TABS.HISTORY}-tab`);
        tabContent.innerHTML = getHistoryContent();
    }

    const applyHistoryFilter = () => {
        historyFilter.type = DOMHelpers.safeGetElement('filter-type').value;
        const readFilter = DOMHelpers.safeGetElement('filter-read').value;
        
        if (readFilter === 'unread') {
            historyFilter.read = false;
        } else if (readFilter === 'read') {
            historyFilter.read = true;
        } else {
            historyFilter.read = undefined;
        }
        
        refreshHistory();
    }

    const markAsRead = (id) => {
        if (Notifications.markAsRead(id)) {
            refreshHistory();
            updateUnreadBadge();
        }
    }

    const markAllAsRead = () => {
        if (Notifications.markAllAsRead()) {
            refreshHistory();
            updateUnreadBadge();
            UINotifications.showNotification('Success', 'All notifications marked as read', 'success');
        }
    }

    const dismissNotification = (id) => {
        if (Notifications.dismissNotification(id)) {
            refreshHistory();
            updateUnreadBadge();
        }
    }

    const deleteNotification = (id) => {
        if (confirm('Are you sure you want to delete this notification?')) {
            if (Notifications.deleteNotification(id)) {
                refreshHistory();
                updateUnreadBadge();
            }
        }
    }

    const clearHistory = () => {
        if (confirm('Are you sure you want to clear all notification history? This cannot be undone.')) {
            if (Notifications.clearHistory()) {
                refreshHistory();
                updateUnreadBadge();
                UINotifications.showNotification('Success', 'Notification history cleared', 'success');
            }
        }
    }

    const getScheduledContent = () => {
        const scheduled = Notifications.getScheduledNotifications();
        
        let scheduledHTML = `
            <div class="scheduled-section">
                <div class="scheduled-controls">
                    <button class="btn btn-primary" onclick="NotificationsUI.showScheduleForm()">Schedule Notification</button>
                </div>
                
                <div class="scheduled-list">
        `;
        
        if (scheduled.length === 0) {
            scheduledHTML += `
                <div class="empty-state">
                    <p>No scheduled notifications</p>
                </div>
            `;
        } else {
            scheduled.forEach(item => {
                scheduledHTML += `
                  <div class="scheduled-card" data-id="${item.id}">
                      <div class="scheduled-header">
                      <span class="scheduled-status ${item.status}">${item.status}</span>
                      <span class="scheduled-time">${formatDate(item.scheduledTime)}</span>
                      </div>
                      <div class="scheduled-title">${sanitizeHTML(item.notification.title)}</div>
                      <div class="scheduled-message">${sanitizeHTML(item.notification.message)}</div>
                      <div class="scheduled-actions">
                      ${item.status === 'pending' ? `<button class="btn btn-small btn-danger" onclick="NotificationsUI.cancelScheduled('${item.id}')">Cancel</button>` : ''}
                      </div>
                  </div>
                `;
            });
        }
        
        scheduledHTML += `
                </div>
            </div>
        `;
        
        return scheduledHTML;
    }

    const refreshScheduled = () => {
        const tabContent = DOMHelpers.safeGetElement(`${TABS.SCHEDULED}-tab`);
        tabContent.innerHTML = getScheduledContent();
    }

    const showScheduleForm = () => {
        const formHTML = `
            <div id="schedule-form" class="schedule-form">
                <h3>Schedule Notification</h3>
                <div class="form-group">
                    <label for="schedule-title">Title:</label>
                    <input type="text" id="schedule-title" placeholder="Notification title">
                </div>
                <div class="form-group">
                    <label for="schedule-message">Message:</label>
                    <textarea id="schedule-message" rows="3" placeholder="Notification message"></textarea>
                </div>
                <div class="form-group">
                    <label for="schedule-type">Type:</label>
                    <select id="schedule-type">
                    <option value="system">System</option>
                    <option value="chapter_update">Chapter Update</option>
                    <option value="achievement">Achievement</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="schedule-time">Schedule Time:</label>
                    <input type="datetime-local" id="schedule-time">
                </div>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="NotificationsUI.submitSchedule()">Schedule</button>
                    <button class="btn btn-secondary" onclick="NotificationsUI.hideScheduleForm()">Cancel</button>
                </div>
            </div>
        `;
        
        const tabContent = DOMHelpers.safeGetElement(`${TABS.SCHEDULED}-tab`);
        const controls = tabContent.querySelector('.scheduled-controls');
        controls.insertAdjacentHTML('afterend', formHTML);
    }

    const hideScheduleForm = () => {
        const form = DOMHelpers.safeGetElement('schedule-form');
        if (form) {
            form.remove();
        }
    }

    const submitSchedule = () => {
        try {
            const title = DOMHelpers.safeGetElement('schedule-title').value.trim();
            const message = DOMHelpers.safeGetElement('schedule-message').value.trim();
            const type = DOMHelpers.safeGetElement('schedule-type').value;
            const time = DOMHelpers.safeGetElement('schedule-time').value;
            
            if (!title || !message || !time) {
                UINotifications.showNotification('Error', 'Please fill in all fields', 'error');
                return;
            }
            
            const scheduledTime = new Date(time);
            if (scheduledTime <= new Date()) {
                UINotifications.showNotification('Error', 'Scheduled time must be in the future', 'error');
                return;
            }
            
            const notification = {
                type,
                title,
                message
            };
            
            if (Notifications.scheduleNotification(notification, scheduledTime)) {
                hideScheduleForm();
                refreshScheduled();
                UINotifications.showNotification('Success', 'Notification scheduled successfully', 'success');
            } else {
                UINotifications.showNotification('Error', 'Failed to schedule notification', 'error');
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to submit schedule', error);
        }
    }

    const cancelScheduled = (id) => {
        if (confirm('Are you sure you want to cancel this scheduled notification?')) {
            if (Notifications.cancelScheduledNotification(id)) {
                refreshScheduled();
                UINotifications.showNotification('Success', 'Scheduled notification cancelled', 'success');
            }
        }
    }

    const getTemplatesContent = () => {
        const templates = Notifications.getTemplates();
        
        let templatesHTML = `
            <div class="templates-section">
                <div class="templates-list">
        `;
        
        Object.keys(templates).forEach(type => {
            const template = templates[type];
            templatesHTML += `
          <div class="template-card" data-type="${type}">
              <div class="template-header">
                  <span class="template-type">${type}</span>
                  <div class="template-actions">
                      <button class="btn btn-small" onclick="NotificationsUI.editTemplate('${type}')">Edit</button>
                      <button class="btn btn-small btn-secondary" onclick="NotificationsUI.resetTemplate('${type}')">Reset</button>
                  </div>
              </div>
              <div class="template-field">
                  <label>Title:</label>
                  <div class="template-value">${sanitizeHTML(template.title)}</div>
              </div>
              <div class="template-field">
                  <label>Message:</label>
                  <div class="template-value">${sanitizeHTML(template.message)}</div>
              </div>
          </div>
      `;
        });
        
        templatesHTML += `
                </div>
            </div>
        `;
        
        return templatesHTML;
    }

    const refreshTemplates = () => {
        const tabContent = DOMHelpers.safeGetElement(`${TABS.TEMPLATES}-tab`);
        tabContent.innerHTML = getTemplatesContent();
    }

    const editTemplate = (type) => {
        const templates = Notifications.getTemplates();
        const template = templates[type];
        
        const formHTML = `
            <div id="template-form" class="template-form">
                <h3>Edit Template: ${type}</h3>
                <div class="form-group">
                    <label for="template-title">Title:</label>
                    <input type="text" id="template-title" value="${sanitizeHTML(template.title)}">
                </div>
                <div class="form-group">
                    <label for="template-message">Message:</label>
                    <textarea id="template-message" rows="3">${sanitizeHTML(template.message)}</textarea>
                </div>
                <div class="form-group">
                    <label>Available Variables:</label>
                    <div class="variables-list">
                    ${getVariablesForType(type)}
                    </div>
                </div>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="NotificationsUI.saveTemplate('${type}')">Save</button>
                    <button class="btn btn-secondary" onclick="NotificationsUI.hideTemplateForm()">Cancel</button>
                </div>
            </div>
        `;
        
        const tabContent = DOMHelpers.safeGetElement(`${TABS.TEMPLATES}-tab`);
        tabContent.innerHTML = formHTML;
    }

    const getVariablesForType = (type) => {
        const variables = {
            chapter_update: ['{chapterNumber}'],
            bookmark_reminder: ['{count}'],
            achievement: ['{achievementName}'],
            social: ['{action}', '{username}'],
            system: ['{message}'],
            email: []
        };
        
        const vars = variables[type] || [];
        return vars.map(v => `<code>${v}</code>`).join(', ');
    }

    const hideTemplateForm = () => {
        refreshTemplates();
    }

    const saveTemplate = (type) => {
        try {
            const title = DOMHelpers.safeGetElement('template-title').value.trim();
            const message = DOMHelpers.safeGetElement('template-message').value.trim();
            
            if (!title || !message) {
                UINotifications.showNotification('Error', 'Please fill in all fields', 'error');
                return;
            }
            
            const template = { title, message };
            
            if (Notifications.updateTemplate(type, template)) {
                refreshTemplates();
                UINotifications.showNotification('Success', 'Template updated successfully', 'success');
            } else {
                UINotifications.showNotification('Error', 'Failed to update template', 'error');
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to save template', error);
        }
    }

    const resetTemplate = (type) => {
        if (confirm('Are you sure you want to reset this template to default?')) {
            if (Notifications.resetTemplate(type)) {
                refreshTemplates();
                UINotifications.showNotification('Success', 'Template reset to default', 'success');
            }
        }
    }

    const updateUnreadBadge = () => {
        const badge = DOMHelpers.safeGetElement('unread-badge');
        if (badge) {
            const count = Notifications.getUnreadCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) {
            return 'Just now';
        }
        
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        }
        
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        }
        
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days}d ago`;
        }
        
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    window.NotificationsUI = {
        openModal,
        closeModal,
        switchTab,
        savePreferences,
        resetPreferences,
        applyHistoryFilter,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        deleteNotification,
        clearHistory,
        showScheduleForm,
        hideScheduleForm,
        submitSchedule,
        cancelScheduled,
        editTemplate,
        hideTemplateForm,
        saveTemplate,
        resetTemplate
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();