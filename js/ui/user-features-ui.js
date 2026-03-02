/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * User Features UI Module
 * Provides user interface for user profiles, preferences, achievements, social features, and messaging
 * 
 * @namespace UserFeaturesUI
 */
(function() {
    'use strict';

    // Private variables
    let userFeaturesModal = null;
    let currentTab = 'profile';

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Initialize user features UI
     */
    const init = () => {
        createUserFeaturesModal();
        setupEventListeners();
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create user features modal
     */
    const createUserFeaturesModal = () => {
        const modalHTML = `
  <div id="user-features-modal" class="modal">
      <div class="modal-content user-features-modal">
          <div class="modal-header">
              <h2>👤 User Features</h2>
              <button class="close-btn" onclick="UserFeaturesUI.closeModal()">&times;</button>
          </div>

          <div class="modal-body">
              <!-- Tab Navigation -->
              <div class="user-features-tabs">
                  <button class="tab-btn active" data-tab="profile" onclick="UserFeaturesUI.switchTab('profile')">
                      👤 Profile
                  </button>
                  <button class="tab-btn" data-tab="preferences" onclick="UserFeaturesUI.switchTab('preferences')">
                      ⚙️ Preferences
                  </button>
                  <button class="tab-btn" data-tab="achievements" onclick="UserFeaturesUI.switchTab('achievements')">
                      💬 Social
                  </button>
                  <button class="tab-btn" data-tab="messages" onclick="UserFeaturesUI.switchTab('messages')">
                      ✉️ Messages
                  </button>
              </div>

              <!-- Tab Content -->
              <div class="user-features-content">
                  <div id="tab-profile" class="tab-content active">
                      ${createProfileContent()}
                  </div>
                  <div id="tab-preferences" class="tab-content">
                      ${createPreferencesContent()}
                  </div>
                  <div id="tab-achievements" class="tab-content">
                      ${createSocialContent()}
                  </div>
                  <div id="tab-messages" class="tab-content">
                      ${createMessagesContent()}
                  </div>
              </div>
          </div>

          <div class="modal-footer">
              <button class="btn btn-secondary" onclick="UserFeaturesUI.exportUserData()">
                  📥 Export Data
              </button>
              <button class="btn btn-secondary" onclick="UserFeaturesUI.importUserData()">
                  📤 Import Data
              </button>
          </div>
      </div>
  </div>
`;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        userFeaturesModal = DOMHelpers.safeGetElement('user-features-modal');
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create profile tab content
     */
    const createProfileContent = () => {
        return `
  <div class="user-profile">
      <div class="profile-header">
          <div class="avatar-section">
              <div class="avatar-preview" id="avatar-preview">
                  <span class="avatar-placeholder">👤</span>
              </div>
              <div class="avatar-actions">
                  <button class="btn btn-sm btn-primary" onclick="UserFeaturesUI.uploadAvatar()">
                      📷 Upload
                  </button>
                  <button class="btn btn-sm btn-danger" onclick="UserFeaturesUI.removeAvatar()">
                      🗑️ Remove
                  </button>
              </div>
          </div>
          <div class="profile-info">
              <h3 id="profile-display-name">Display Name</h3>
              <p id="profile-username">@username</p>
              <p id="profile-joined">Joined: January 1, 2024</p>
          </div>
      </div>

      <div class="profile-form">
          <div class="form-group">
              <label for="display-name">Display Name</label>
              <input type="text" id="display-name" placeholder="Enter display name...">
          </div>
          <div class="form-group">
              <label for="profile-bio">Bio</label>
              <textarea id="profile-bio" rows="3" placeholder="Tell us about yourself..."></textarea>
          </div>
          <div class="form-group">
              <label for="profile-location">Location</label>
              <input type="text" id="profile-location" placeholder="Enter location...">
          </div>
          <div class="form-group">
              <label for="profile-website">Website</label>
              <input type="text" id="profile-website" placeholder="Enter website URL...">
          </div>
          <button class="btn btn-primary" onclick="UserFeaturesUI.saveProfile()">
              💾 Save Profile
          </button>
      </div>

      <div class="profile-stats">
          <h3>📊 Statistics</h3>
          <div class="stats-grid">
              <div class="stat-item">
                  <span class="stat-value" id="stat-chapters-read">0</span>
                  <span class="stat-label">Chapters Read</span>
              </div>
              <div class="stat-item">
                  <span class="stat-value" id="stat-reading-time">0h</span>
                  <span class="stat-label">Reading Time</span>
              </div>
              <div class="stat-item">
                  <span class="stat-value" id="stat-bookmarks">0</span>
                  <span class="stat-label">Bookmarks</span>
              </div>
              <div class="stat-item">
      </div>
  </div>
`;
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create preferences tab content
     */
    const createPreferencesContent = () => {
        return `
      <div class="user-preferences">
          <div class="preferences-section">
              <h3>🎨 Appearance</h3>
              <div class="preference-item">
                  <label for="theme-select">Theme</label>
                  <select id="theme-select" onchange="UserFeaturesUI.updatePreference('theme', this.value)">
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                  </select>
              </div>
              <div class="preference-item">
                  <label for="text-size-select">Text Size</label>
                  <select id="text-size-select" onchange="UserFeaturesUI.updatePreference('textSize', this.value)">
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="xlarge">Extra Large</option>
                  </select>
              </div>
              <div class="preference-item">
                  <label>
                      <input type="checkbox" id="enable-animations" onchange="UserFeaturesUI.updatePreference('enableAnimations', this.checked)">
                      Enable Animations
                  </label>
              </div>
          </div>

          <div class="preferences-section">
              <h3>🔔 Notifications</h3>
              <div class="preference-item">
                  <label>
                      <input type="checkbox" id="notifications" onchange="UserFeaturesUI.updatePreference('notifications', this.checked)">
                      Enable Notifications
                  </label>
              </div>
              <div class="preference-item">
                  <label>
                      <input type="checkbox" id="email-updates" onchange="UserFeaturesUI.updatePreference('emailUpdates', this.checked)">
                      Email Updates
                  </label>
              </div>
          </div>

          <div class="preferences-section">
              <h3>⚙️ General</h3>
              <div class="preference-item">
                  <label>
                      <input type="checkbox" id="auto-save" onchange="UserFeaturesUI.updatePreference('autoSave', this.checked)">
                      Auto Save
                  </label>
              </div>
              <div class="preference-item">
                  <label>
                      <input type="checkbox" id="show-reading-progress" onchange="UserFeaturesUI.updatePreference('showReadingProgress', this.checked)">
                      Show Reading Progress
                  </label>
              </div>
              <div class="preference-item">
                  <label>
                      <input type="checkbox" id="show-online-status" onchange="UserFeaturesUI.updatePreference('showOnlineStatus', this.checked)">
                      Show Online Status
                  </label>
              </div>
          </div>

          <div class="preferences-actions">
              <button class="btn btn-secondary" onclick="UserFeaturesUI.resetPreferences()">
                  🔄 Reset to Defaults
              </button>
          </div>
      </div>
  `;
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create achievements tab content
     */
     */
    const createSocialContent = () => {
        return `
  <div class="user-social">
      <div class="social-stats">
          <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-value" id="social-followers">0</div>
              <div class="stat-label">Followers</div>
          </div>
          <div class="stat-card">
              <div class="stat-icon">➕</div>
              <div class="stat-value" id="social-following">0</div>
              <div class="stat-label">Following</div>
          </div>
          <div class="stat-card">
              <div class="stat-icon">💬</div>
              <div class="stat-value" id="social-comments">0</div>
              <div class="stat-label">Comments</div>
          </div>
          <div class="stat-card">
              <div class="stat-icon">📤</div>
              <div class="stat-value" id="social-shares">0</div>
              <div class="stat-label">Shares</div>
          </div>
      </div>

      <div class="social-section">
          <h3>👥 Find Users</h3>
          <div class="search-users">
              <input type="text" id="search-users-input" placeholder="Search users..."
                     onkeypress="if(event.key === 'Enter') UserFeaturesUI.searchUsers()">
              <button class="btn btn-primary" onclick="UserFeaturesUI.searchUsers()">
                  🔍 Search
              </button>
          </div>
          <div class="users-list" id="users-list">
              <p class="no-data">Search for users to follow</p>
          </div>
      </div>

      <div class="social-section">
          <h3>📝 Recent Comments</h3>
          <div class="comments-list" id="comments-list">
              <p class="no-data">No comments yet</p>
          </div>
      </div>
  </div>
`;
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create messages tab content
     */
    const createMessagesContent = () => {
        return `
  <div class="user-messages">
      <div class="messages-header">
          <h3>✉️ Messages</h3>
          <div class="messages-stats">
              <span id="messages-unread">0</span> unread
          </div>
      </div>

      <div class="messages-layout">
          <div class="messages-sidebar">
              <div class="new-message">
                  <button class="btn btn-primary" onclick="UserFeaturesUI.startNewConversation()">
                      ➕ New Message
                  </button>
              </div>
              <div class="conversations-list" id="conversations-list">
                  <p class="no-data">No conversations yet</p>
              </div>
          </div>

          <div class="messages-main">
              <div class="messages-view" id="messages-view">
                  <p class="no-data">Select a conversation to view messages</p>
              </div>
              <div class="message-input" id="message-input" style="display: none;">
                  <textarea id="message-content" rows="3" placeholder="Type your message..."></textarea>
                  <button class="btn btn-primary" onclick="UserFeaturesUI.sendMessage()">
                      📤 Send
                  </button>
              </div>
          </div>
      </div>
  </div>
`;
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Open user features modal
     */
    const openModal = () => {
        if (userFeaturesModal) {
            userFeaturesModal.style.display = 'block';
            loadUserProfile();
            loadPreferences();
            loadSocialStats();
            loadMessages();
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Close user features modal
     */
    const closeModal = () => {
        if (userFeaturesModal) {
            userFeaturesModal.style.display = 'none';
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Switch between tabs
     * @param {string} tabName - Tab name
     */
    const switchTab = (tabName) => {
        currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.user-features-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.user-features-content .tab-content').forEach(content => {
            content.classList.remove('active');
        });
        DOMHelpers.safeGetElement('tab-' + tabName).classList.add('active');

        // Load content for specific tabs
        if (tabName === 'profile') {
            loadUserProfile();
        } else if (tabName === 'preferences') {
            loadPreferences();
        } else if (tabName === 'achievements') {
        } else if (tabName === 'messages') {
            loadMessages();
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Load user profile
     */
    const loadUserProfile = () => {
        const username = UserProfiles.getCurrentUser();
        if (!username) {
            UINotifications.showNotification('Please log in first', 'warning');
            return;
        }

        const profile = UserProfiles.getProfile(username);
        if (!profile) {
            UINotifications.showNotification('Profile not found', 'error');
            return;
        }

        // Update profile display
        DOMHelpers.safeSetText('profile-display-name', profile.displayName);
        DOMHelpers.safeSetText('profile-username', '@' + profile.username);
        DOMHelpers.safeSetText('profile-joined', 'Joined: ' + formatDate(profile.joinedAt));

        // Update form fields
        DOMHelpers.safeGetElement('display-name').value = profile.displayName;
        DOMHelpers.safeGetElement('profile-bio').value = profile.bio;
        DOMHelpers.safeGetElement('profile-location').value = profile.location;
        DOMHelpers.safeGetElement('profile-website').value = profile.website;

        // Update avatar
        if (profile.avatar) {
            DOMHelpers.safeGetElement('avatar-preview').innerHTML = `<img src="${profile.avatar}" alt="Avatar" class="avatar-image">`;
        } else {
            DOMHelpers.safeGetElement('avatar-preview').innerHTML = '<span class="avatar-placeholder">👤</span>';
        }

        // Update statistics
        DOMHelpers.safeSetText('stat-chapters-read', profile.stats.chaptersRead);
        DOMHelpers.safeSetText('stat-reading-time', formatReadingTime(profile.stats.totalReadingTime));
        DOMHelpers.safeSetText('stat-bookmarks', profile.stats.bookmarks);
        DOMHelpers.safeSetText('stat-achievements', profile.stats.achievements);
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Save profile
     */
    const saveProfile = () => {
        const username = UserProfiles.getCurrentUser();
        if (!username) {
            UINotifications.showNotification('Please log in first', 'warning');
            return;
        }

        try {
            const updates = {
                displayName: DOMHelpers.safeGetElement('display-name').value,
                bio: DOMHelpers.safeGetElement('profile-bio').value,
                location: DOMHelpers.safeGetElement('profile-location').value,
                website: DOMHelpers.safeGetElement('profile-website').value
            };

            UserProfiles.updateProfile(username, updates);
            UINotifications.showNotification('Profile saved successfully', 'success');
            loadUserProfile();
        } catch (error) {
            ErrorHandler.handleError('Failed to save profile', error);
            UINotifications.showNotification('Failed to save profile', 'error');
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Upload avatar
     */
    const uploadAvatar = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const username = UserProfiles.getCurrentUser();
                if (!username) {
                    UINotifications.showNotification('Please log in first', 'warning');
                    return;
                }

                try {
                    UserProfiles.setAvatar(username, e.target.result);
                    UINotifications.showNotification('Avatar uploaded successfully', 'success');
                    loadUserProfile();
                } catch (error) {
                    ErrorHandler.handleError('Failed to upload avatar', error);
                    UINotifications.showNotification('Failed to upload avatar', 'error');
                }
            };
            reader.readAsDataURL(file);
        };

        input.click();
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Remove avatar
     */
    const removeAvatar = () => {
        const username = UserProfiles.getCurrentUser();
        if (!username) {
            UINotifications.showNotification('Please log in first', 'warning');
            return;
        }

        try {
            UserProfiles.removeAvatar(username);
            UINotifications.showNotification('Avatar removed', 'success');
            loadUserProfile();
        } catch (error) {
            ErrorHandler.handleError('Failed to remove avatar', error);
            UINotifications.showNotification('Failed to remove avatar', 'error');
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Load preferences
     */
    const loadPreferences = () => {
        const username = UserProfiles.getCurrentUser();
        if (!username) {
            return;
        }

        const prefs = UserPreferences.getPreferences(username);

        DOMHelpers.safeGetElement('theme-select').value = prefs.theme;
        DOMHelpers.safeGetElement('text-size-select').value = prefs.textSize;
        DOMHelpers.safeGetElement('enable-animations').checked = prefs.enableAnimations;
        DOMHelpers.safeGetElement('notifications').checked = prefs.notifications;
        DOMHelpers.safeGetElement('email-updates').checked = prefs.emailUpdates;
        DOMHelpers.safeGetElement('auto-save').checked = prefs.autoSave;
        DOMHelpers.safeGetElement('show-reading-progress').checked = prefs.showReadingProgress;
        DOMHelpers.safeGetElement('show-online-status').checked = prefs.showOnlineStatus;
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Update preference
     * @param {string} key - Preference key
     * @param {any} value - Preference value
     */
    const updatePreference = (key, value) => {
        const username = UserProfiles.getCurrentUser();
        if (!username) {
            UINotifications.showNotification('Please log in first', 'warning');
            return;
        }

        try {
            UserPreferences.setPreference(username, key, value);
            UINotifications.showNotification('Preference updated', 'success');
        } catch (error) {
            ErrorHandler.handleError('Failed to update preference', error);
            UINotifications.showNotification('Failed to update preference', 'error');
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Reset preferences
     */
    const resetPreferences = () => {
        const username = UserProfiles.getCurrentUser();
        if (!username) {
            UINotifications.showNotification('Please log in first', 'warning');
            return;
        }

        if (confirm('Are you sure you want to reset all preferences to defaults?')) {
            try {
                UserPreferences.resetPreferences(username);
                UINotifications.showNotification('Preferences reset', 'success');
                loadPreferences();
            } catch (error) {
                ErrorHandler.handleError('Failed to reset preferences', error);
                UINotifications.showNotification('Failed to reset preferences', 'error');
            }
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
 */
/**
     * Load social stats
     */
    const loadSocialStats = () => {
        const username = UserProfiles.getCurrentUser();
        if (!username) {
            return;
        }

        const stats = SocialFeatures.getSocialStats(username);

        DOMHelpers.safeSetText('social-followers', stats.followers);
        DOMHelpers.safeSetText('social-following', stats.following);
        DOMHelpers.safeSetText('social-comments', stats.comments);
        DOMHelpers.safeSetText('social-shares', stats.shares);
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Search users
     */
    const searchUsers = () => {
        const query = DOMHelpers.safeGetElement('search-users-input').value.trim();
        const usersList = DOMHelpers.safeGetElement('users-list');

        if (!query) {
            usersList.innerHTML = '<p class="no-data">Enter a search query</p>';
            return;
        }

        try {
            const results = UserProfiles.searchProfiles(query);
            const username = UserProfiles.getCurrentUser();

            if (results.length === 0) {
                usersList.innerHTML = '<p class="no-data">No users found</p>';
                return;
            }

            usersList.innerHTML = results.map(profile => {
                const isFollowing = SocialFeatures.isFollowing(username, profile.username);
                const isSelf = profile.username === username;

                return `
                  <div class="user-card">
                      <div class="user-avatar">
                      ${profile.avatar ? `<img src="${profile.avatar}" alt="Avatar">` : '<span>👤</span>'}
          </div>
          <div class="user-info">
              <div class="user-name">${sanitizeHTML(profile.displayName)}</div>
              <div class="user-username">@${profile.username}</div>
              <div class="user-bio">${sanitizeHTML(profile.bio)}</div>
          </div>
          <div class="user-actions">
              ${isSelf ? '<span class="badge">You</span>' :
                  isFollowing ?
                  `<button class="btn btn-sm btn-secondary" onclick="UserFeaturesUI.unfollowUser('${profile.username}')">Unfollow</button>` :
                    `<button class="btn btn-sm btn-primary" onclick="UserFeaturesUI.followUser('${profile.username}')">Follow</button>`
                }
            </div>
        </div>
    `;
            }).join('');
        } catch (error) {
            ErrorHandler.handleError('Failed to search users', error);
            usersList.innerHTML = '<p class="no-data">Failed to search users</p>';
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Follow user
     * @param {string} username - Username to follow
     */
    const followUser = (username) => {
        const currentUser = UserProfiles.getCurrentUser();
        if (!currentUser) {
            UINotifications.showNotification('Please log in first', 'warning');
            return;
        }

        try {
            SocialFeatures.followUser(currentUser, username);
            UINotifications.showNotification('Now following ' + username, 'success');
            searchUsers();
            loadSocialStats();
        } catch (error) {
            ErrorHandler.handleError('Failed to follow user', error);
            UINotifications.showNotification('Failed to follow user', 'error');
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Unfollow user
     * @param {string} username - Username to unfollow
     */
    const unfollowUser = (username) => {
        const currentUser = UserProfiles.getCurrentUser();
        if (!currentUser) {
            UINotifications.showNotification('Please log in first', 'warning');
            return;
        }

        try {
            SocialFeatures.unfollowUser(currentUser, username);
            UINotifications.showNotification('Unfollowed ' + username, 'success');
            searchUsers();
            loadSocialStats();
        } catch (error) {
            ErrorHandler.handleError('Failed to unfollow user', error);
            UINotifications.showNotification('Failed to unfollow user', 'error');
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Load messages
     */
    const loadMessages = () => {
        const username = UserProfiles.getCurrentUser();
        if (!username) {
            return;
        }

        const conversations = Messaging.getUserConversations(username);
        const unreadCount = Messaging.getUnreadCount(username);

        DOMHelpers.safeSetText('messages-unread', unreadCount);

        if (conversations.length === 0) {
            DOMHelpers.safeGetElement('conversations-list').innerHTML = '<p class="no-data">No conversations yet</p>';
            return;
        }

        DOMHelpers.safeGetElement('conversations-list').innerHTML = conversations.map(conv => {
            const otherUser = conv.participants.find(p => p !== username);
            const profile = UserProfiles.getProfile(otherUser);
            const displayName = profile ? profile.displayName : otherUser;
            const unread = conv.unread[username] || 0;

            return `
              <div class="conversation-item ${unread > 0 ? 'unread' : ''}" onclick="UserFeaturesUI.selectConversation('${conv.id}')">
                  <div class="conversation-avatar">
                      ${profile && profile.avatar ? `<img src="${profile.avatar}" alt="Avatar">` : '<span>👤</span>'}
                  </div>
                  <div class="conversation-info">
                      <div class="conversation-name">${sanitizeHTML(displayName)}</div>
                      <div class="conversation-time">${formatDateTime(conv.lastMessageAt || conv.createdAt)}</div>
                  </div>
                  ${unread > 0 ? `<div class="conversation-badge">${unread}</div>` : ''}
              </div>
          `;
        }).join('');
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Select conversation
     * @param {string} conversationId - Conversation ID
     */
    const selectConversation = (conversationId) => {
        const username = UserProfiles.getCurrentUser();
        if (!username) {
            return;
        }

        const messages = Messaging.getMessages(conversationId);
        const conversation = conversations[conversationId];
        const otherUser = conversation.participants.find(p => p !== username);
        const profile = UserProfiles.getProfile(otherUser);
        const displayName = profile ? profile.displayName : otherUser;

        // Mark as read
        Messaging.markConversationAsRead(conversationId, username);

        // Update messages view
        DOMHelpers.safeGetElement('messages-view').innerHTML = `
      <div class="messages-header">
          <h4>${sanitizeHTML(displayName)}</h4>
      </div>
      <div class="messages-list">
          ${messages.map(msg => {
              const isOwn = msg.from === username;
              return `
                <div class="message ${isOwn ? 'own' : 'other'}">
                    <div class="message-content">${sanitizeHTML(msg.content)}</div>
                    <div class="message-time">${formatTime(msg.sentAt)}</div>
                </div>
              `;
          }).join('')}
      </div>
  `;

        // Show message input
        DOMHelpers.safeGetElement('message-input').style.display = 'block';
        DOMHelpers.safeGetElement('message-content').value = '';

        // Update unread count
        loadMessages();
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Start new conversation
     */
    const startNewConversation = async () => {
        const username = await PromptModal.show('Enter username to message:', '', 'Input');
        if (!username) {
            return;
        }

        const currentUser = UserProfiles.getCurrentUser();
        if (!currentUser) {
            UINotifications.showNotification('Please log in first', 'warning');
            return;
        }

        try {
            const conversationId = Messaging.createConversation(currentUser, username);
            selectConversation(conversationId);
            loadMessages();
        } catch (error) {
            ErrorHandler.handleError('Failed to start conversation', error);
            UINotifications.showNotification('Failed to start conversation', 'error');
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Send message
     */
    const sendMessage = () => {
        const username = UserProfiles.getCurrentUser();
        if (!username) {
            UINotifications.showNotification('Please log in first', 'warning');
            return;
        }

        const content = DOMHelpers.safeGetElement('message-content').value.trim();
        if (!content) {
            UINotifications.showNotification('Please enter a message', 'warning');
            return;
        }

        // Get current conversation ID from selected conversation
        const selectedConversation = document.querySelector('.conversation-item.selected');
        if (!selectedConversation) {
            UINotifications.showNotification('Please select a conversation', 'warning');
            return;
        }

        const conversationId = selectedConversation.dataset.conversationId;
        const conversation = conversations[conversationId];
        const otherUser = conversation.participants.find(p => p !== username);

        try {
            Messaging.sendMessage(username, otherUser, content);
            UINotifications.showNotification('Message sent', 'success');
            selectConversation(conversationId);
            loadMessages();
        } catch (error) {
            ErrorHandler.handleError('Failed to send message', error);
            UINotifications.showNotification('Failed to send message', 'error');
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Export user data
     */
    const exportUserData = () => {
        const username = UserProfiles.getCurrentUser();
        if (!username) {
            UINotifications.showNotification('Please log in first', 'warning');
            return;
        }

        try {
            const data = {
                profile: UserProfiles.getProfile(username),
                preferences: UserPreferences.getPreferences(username),
                social: SocialFeatures.getSocialStats(username),
                exportedAt: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `user_data_${username}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            UINotifications.showNotification('Data exported successfully', 'success');
        } catch (error) {
            ErrorHandler.handleError('Failed to export data', error);
            UINotifications.showNotification('Failed to export data', 'error');
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Import user data
     */
    const importUserData = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    UINotifications.showNotification('Data imported successfully', 'success');
                    // Reload current tab
                    switchTab(currentTab);
                } catch (error) {
                    ErrorHandler.handleError('Failed to import data', error);
                    UINotifications.showNotification('Failed to import data', 'error');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Format date for display
     * @param {string} dateString - Date string
     * @returns {string} Formatted date
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Format date and time for display
     * @param {string} dateString - Date string
     * @returns {string} Formatted date and time
     */
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Format time for display
     * @param {string} dateString - Date string
     * @returns {string} Formatted time
     */
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Format reading time for display
     * @param {number} milliseconds - Reading time in milliseconds
     * @returns {string} Formatted reading time
     */
    const formatReadingTime = (milliseconds) => {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        return hours + 'h';
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Setup event listeners
     */
    const setupEventListeners = () => {
        // Close modal on outside click
        if (userFeaturesModal) {
            userFeaturesModal.addEventListener('click', function(e) {
                if (e.target === userFeaturesModal) {
                    closeModal();
                }
            });
        }
    }

    // Export public API
    window.UserFeaturesUI = {
        init: init,
        openModal: openModal,
        closeModal: closeModal,
        switchTab: switchTab,
        loadUserProfile: loadUserProfile,
        saveProfile: saveProfile,
        uploadAvatar: uploadAvatar,
        removeAvatar: removeAvatar,
        loadPreferences: loadPreferences,
        updatePreference: updatePreference,
        resetPreferences: resetPreferences,
        followUser: followUser,
        unfollowUser: unfollowUser,
        loadMessages: loadMessages,
        selectConversation: selectConversation,
        startNewConversation: startNewConversation,
        sendMessage: sendMessage,
        exportUserData: exportUserData,
        importUserData: importUserData
    };

})();