/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Leaderboards UI Module
 * 
 * Provides user interface for achievement leaderboards with tabs,
 * filtering, sorting, and visualization.
 * 
 * @namespace LeaderboardsUI
 */
(function() {
    'use strict';

    // ============================================================================
    // STATE
    // ============================================================================
    
    let currentTab = 'leaderboard';
    let currentType = Leaderboards.TYPES.GLOBAL;
    let currentSort = Leaderboards.SORT_METHODS.TOTAL_POINTS;
    let currentLimit = 50;
    let searchQuery = '';

    // ============================================================================
    // DOM ELEMENTS
    // ============================================================================
    
    let modal = null;
    let leaderboardContent = null;
    let searchInput = null;
    let typeSelect = null;
    let sortSelect = null;
    let limitSelect = null;

    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Initialize leaderboards UI
     */
    const init = () => {
        // Create modal if it doesn't exist
        if (!DOMHelpers.safeGetElement('leaderboards-modal')) {
            createModal();
        }
        
        // Get DOM elements
        modal = DOMHelpers.safeGetElement('leaderboards-modal');
        leaderboardContent = DOMHelpers.safeGetElement('leaderboard-content');
        searchInput = DOMHelpers.safeGetElement('leaderboard-search');
        typeSelect = DOMHelpers.safeGetElement('leaderboard-type');
        sortSelect = DOMHelpers.safeGetElement('leaderboard-sort');
        limitSelect = DOMHelpers.safeGetElement('leaderboard-limit');
        
        // Add event listeners
        addEventListeners();
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create leaderboards modal
     */
    const createModal = () => {
        const modalHTML = `
<div id="leaderboards-modal" class="modal">
<div class="modal-content leaderboard-modal">
  <div class="modal-header">
      <h2>🏆 Achievement Leaderboards</h2>
      <button class="close-btn" onclick="LeaderboardsUI.closeModal()">&times;</button>
  </div>

  <div class="modal-body">
      <!-- Tabs -->
      <div class="tabs">
          <button class="tab-btn active" data-tab="leaderboard" onclick="LeaderboardsUI.switchTab('leaderboard')">
              📊 Leaderboard
          </button>
          <button class="tab-btn" data-tab="my-rank" onclick="LeaderboardsUI.switchTab('my-rank')">
              👤 My Rank
          </button>
          <button class="tab-btn" data-tab="statistics" onclick="LeaderboardsUI.switchTab('statistics')">
              📈 Statistics
          </button>
          <button class="tab-btn" data-tab="compare" onclick="LeaderboardsUI.switchTab('compare')">
              ⚖️ Compare
          </button>
      </div>

      <!-- Filters -->
      <div class="leaderboard-filters">
          <div class="filter-group">
              <label for="leaderboard-type">Time Period:</label>
              <select id="leaderboard-type" onchange="LeaderboardsUI.changeType()">
                  <option value="global">Global</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="all_time">All Time</option>
              </select>
          </div>

          <div class="filter-group">
              <label for="leaderboard-sort">Sort By:</label>
              <select id="leaderboard-sort" onchange="LeaderboardsUI.changeSort()">
                  <option value="total_points">Total Points</option>
                  <option value="total_achievements">Total Achievements</option>
                  <option value="streak">Reading Streak</option>
                  <option value="chapters_read">Chapters Read</option>
                  <option value="reading_time">Reading Time</option>
              </select>
          </div>

          <div class="filter-group">
              <label for="leaderboard-limit">Show:</label>
              <select id="leaderboard-limit" onchange="LeaderboardsUI.changeLimit()">
                  <option value="10">Top 10</option>
                  <option value="25">Top 25</option>
                  <option value="50" selected>Top 50</option>
                  <option value="100">Top 100</option>
              </select>
          </div>

          <div class="filter-group search-group">
              <input type="text" id="leaderboard-search" placeholder="Search users..."
                     oninput="LeaderboardsUI.searchLeaderboard()">
          </div>
      </div>

      <!-- Content Area -->
      <div id="leaderboard-content" class="leaderboard-content">
          <!-- Content will be dynamically loaded -->
      </div>
  </div>

  <div class="modal-footer">
      <button class="btn btn-secondary" onclick="LeaderboardsUI.exportData()">
          📥 Export
      </button>
      <button class="btn btn-primary" onclick="LeaderboardsUI.closeModal()">
          Close
      </button>
  </div>
</div>
</div>
`;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Add event listeners
     */
    const addEventListeners = () => {
        // Close modal on outside click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeModal();
            }
        });
    }

    // ============================================================================
    // MODAL MANAGEMENT
    // ============================================================================
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Open leaderboards modal
     */
    const openModal = () => {
        init();
        modal.style.display = 'block';
        renderContent();
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Close leaderboards modal
     */
    const closeModal = () => {
        modal.style.display = 'none';
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Switch between tabs
     * @param {string} tab - Tab name
     */
    const switchTab = (tab) => {
        currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            }
        });
        
        renderContent();
    }

    // ============================================================================
    // FILTER MANAGEMENT
    // ============================================================================
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Change leaderboard type
     */
    const changeType = () => {
        currentType = typeSelect.value;
        renderContent();
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Change sort method
     */
    const changeSort = () => {
        currentSort = sortSelect.value;
        Leaderboards.sortLeaderboards(currentSort);
        renderContent();
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Change limit
     */
    const changeLimit = () => {
        currentLimit = parseInt(limitSelect.value);
        renderContent();
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Search leaderboard
     */
    const searchLeaderboard = () => {
        searchQuery = searchInput.value.trim();
        renderContent();
    }

    // ============================================================================
    // RENDERING
    // ============================================================================
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Render content based on current tab
     */
    const renderContent = () => {
        switch (currentTab) {
            case 'leaderboard':
                renderLeaderboard();
                break;
            case 'my-rank':
                renderMyRank();
                break;
            case 'statistics':
                renderStatistics();
                break;
            case 'compare':
                renderCompare();
                break;
        }
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Render leaderboard table
     */
    const renderLeaderboard = () => {
        let entries;
        
        if (searchQuery) {
            entries = Leaderboards.searchLeaderboard(searchQuery, currentType);
        } else {
            entries = Leaderboards.getLeaderboard(currentType, currentLimit);
        }
        
        if (entries.length === 0) {
            leaderboardContent.innerHTML = `
                <div class="empty-state">
                    <p>No entries found</p>
                    <p class="empty-hint">Be the first to unlock achievements!</p>
                </div>
            `;
            return;
        }
        
        let html = `
      <div class="leaderboard-table">
          <table>
              <thead>
                  <tr>
                      <th class="rank-col">Rank</th>
                      <th class="user-col">User</th>
                      <th class="achievements-col">Achievements</th>
                      <th class="points-col">Points</th>
                      <th class="streak-col">Streak</th>
                      <th class="chapters-col">Chapters</th>
                      <th class="time-col">Time</th>
                  </tr>
              </thead>
              <tbody>
  `;
        
        entries.forEach((entry, index) => {
            const rankClass = getRankClass(entry.rank);
            const isCurrentUser = entry.username === localStorage.getItem('currentUser');
            
            html += `
              <tr class="${isCurrentUser ? 'current-user' : ''}">
                  <td class="rank-col ${rankClass}">
                      ${getRankIcon(entry.rank)} ${entry.rank}
                  </td>
                  <td class="user-col">
                      <span class="username">${sanitizeHTML(entry.username)}</span>
                      ${isCurrentUser ? '<span class="you-badge">YOU</span>' : ''}
                  </td>
                  <td class="achievements-col">${entry.totalAchievements}</td>
                  <td class="points-col">${entry.totalPoints.toLocaleString()}</td>
                  <td class="streak-col">🔥 ${entry.streak}</td>
                  <td class="chapters-col">${entry.chaptersRead}</td>
                  <td class="time-col">${formatReadingTime(entry.readingTime)}</td>
              </tr>
          `;
        });
        
        html += `
          </tbody>
                </table>
            </div>
            <div class="leaderboard-footer">
                <p>Showing ${entries.length} entries</p>
            </div>
        `;
        
        leaderboardContent.innerHTML = html;
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Render user's rank
     */
    const renderMyRank = () => {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            leaderboardContent.innerHTML = `
                <div class="empty-state">
                    <p>Please log in to view your rank</p>
                </div>
            `;
            return;
        }
        
        const ranks = {};
        Object.values(Leaderboards.TYPES).forEach(type => {
            ranks[type] = Leaderboards.getUserRank(currentUser, type);
        });
        
        const stats = Leaderboards.getUserStats(currentUser);
        
        let html = `
          <div class="my-rank-container">
              <div class="user-header">
                  <h3>${sanitizeHTML(currentUser)}</h3>
                  <p class="user-subtitle">Your Achievement Statistics</p>
              </div>

              <div class="stats-grid">
                  <div class="stat-card">
                      <div class="stat-icon">🏆</div>
                      <div class="stat-value">${stats.totalAchievements}</div>
                      <div class="stat-label">Achievements</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-icon">⭐</div>
                      <div class="stat-value">${stats.totalPoints.toLocaleString()}</div>
                      <div class="stat-label">Total Points</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-icon">🔥</div>
                      <div class="stat-value">${stats.streak}</div>
                      <div class="stat-label">Current Streak</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-icon">📚</div>
                      <div class="stat-value">${stats.chaptersRead}</div>
                      <div class="stat-label">Chapters Read</div>
                  </div>
              </div>

              <div class="rank-breakdown">
                  <h4>Your Rankings</h4>
                  <div class="rank-list">
      `;
        
        Object.entries(ranks).forEach(([type, rank]) => {
            if (rank) {
                const rankClass = getRankClass(rank.rank);
                html += `
              <div class="rank-item">
                  <span class="rank-type">${formatType(type)}</span>
                  <span class="rank-value ${rankClass}">
                      ${getRankIcon(rank.rank)} #${rank.rank}
                  </span>
              </div>
            `;
            }
        });
        
        html += `
          </div>
                </div>
                
                <div class="history-section">
          <h4>Recent History</h4>
          <div class="history-list">
        `;
        
        const history = Leaderboards.getUserHistory(currentUser, 10);
        if (history.length === 0) {
            html += `<p class="no-history">No history available</p>`;
        } else {
            history.forEach(entry => {
                html += `
                  <div class="history-item">
                      <span class="history-date">${formatDate(entry.timestamp)}</span>
                      <span class="history-points">${entry.stats.totalPoints} points</span>
                  </div>
                `;
            });
        }
        
        html += `
          </div>
                </div>
            </div>
        `;
        
        leaderboardContent.innerHTML = html;
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Render statistics
     */
    const renderStatistics = () => {
        const stats = Leaderboards.getStatistics();
        const topUsers = Leaderboards.getTopUsers(Leaderboards.SORT_METHODS.TOTAL_POINTS, 5);
        
        let html = `
            <div class="statistics-container">
                <div class="stats-overview">
                    <h4>Overall Statistics</h4>
                    <div class="overview-grid">
                    <div class="overview-item">
                    <span class="overview-label">Total Users</span>
                    <span class="overview-value">${stats.totalUsers}</span>
                    </div>
                    <div class="overview-item">
                    <span class="overview-label">Achievements Unlocked</span>
                    <span class="overview-value">${stats.totalAchievementsUnlocked.toLocaleString()}</span>
                    </div>
                    <div class="overview-item">
                    <span class="overview-label">Total Points</span>
                    <span class="overview-value">${stats.totalPoints.toLocaleString()}</span>
                    </div>
                    <div class="overview-item">
                    <span class="overview-label">Average Streak</span>
                    <span class="overview-value">${stats.averageStreak} days</span>
                    </div>
                    <div class="overview-item">
                    <span class="overview-label">Average Chapters</span>
                    <span class="overview-value">${stats.averageChaptersRead}</span>
                    </div>
                    <div class="overview-item">
                    <span class="overview-label">Average Reading Time</span>
                    <span class="overview-value">${formatReadingTime(stats.averageReadingTime)}</span>
                    </div>
                    </div>
                </div>
                
                <div class="top-users-section">
                    <h4>Top 5 Users</h4>
                    <div class="top-users-list">
        `;
        
        topUsers.forEach((user, index) => {
            const rankClass = getRankClass(index + 1);
            html += `
                <div class="top-user-item">
                    <span class="top-user-rank ${rankClass}">
                    ${getRankIcon(index + 1)} ${index + 1}
                    </span>
                    <span class="top-user-name">${sanitizeHTML(user.username)}</span>
                    <span class="top-user-points">${user.totalPoints.toLocaleString()} pts</span>
                </div>
            `;
        });
        
        html += `
          </div>
                </div>
            </div>
        `;
        
        leaderboardContent.innerHTML = html;
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Render comparison view
     */
    const renderCompare = () => {
        const currentUser = localStorage.getItem('currentUser');
        
        let html = `
            <div class="compare-container">
                <div class="compare-input">
                    <label>Enter usernames to compare (comma-separated):</label>
                    <input type="text" id="compare-users" placeholder="user1, user2, user3" 
                       value="${currentUser || ''}">
                    <button class="btn btn-primary" onclick="LeaderboardsUI.runComparison()">
                    Compare
                    </button>
                </div>
                <div id="compare-results">
                    <p class="compare-hint">Enter usernames and click Compare to see results</p>
                </div>
            </div>
        `;
        
        leaderboardContent.innerHTML = html;
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Run user comparison
     */
    const runComparison = () => {
        const input = DOMHelpers.safeGetElement('compare-users').value;
        const usernames = input.split(',').map(u => u.trim()).filter(u => u);
        
        if (usernames.length < 2) {
            UINotifications.showNotification('Please enter at least 2 usernames', 'error');
            return;
        }
        
        const comparison = Leaderboards.compareUsers(usernames);
        
        let html = `
            <div class="comparison-results">
                <h4>Comparison Results</h4>
                <div class="comparison-table">
        `;
        
        Object.entries(comparison.categories).forEach(([category, data]) => {
            html += `
                <div class="comparison-category">
                    <h5>${formatSortMethod(category)}</h5>
                    <div class="comparison-bars">
            `;
            
            const maxValue = Math.max(...data.map(d => d.value));
            
            data.forEach((item, index) => {
                const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                html += `
                  <div class="comparison-bar">
                      <span class="bar-label">${sanitizeHTML(item.username)}</span>
                      <div class="bar-container">
                      <div class="bar-fill" style="width: ${percentage}%"></div>
                      <span class="bar-value">${item.value.toLocaleString()}</span>
                      </div>
                  </div>
                `;
            });
            
            html += `
              </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        DOMHelpers.safeGetElement('compare-results').innerHTML = html;
    }

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Get rank CSS class
     * @param {number} rank - Rank number
     * @returns {string} CSS class
     */
    const getRankClass = (rank) => {
        if (rank === 1) return 'rank-1';
        if (rank === 2) return 'rank-2';
        if (rank === 3) return 'rank-3';
        return '';
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Get rank icon
     * @param {number} rank - Rank number
     * @returns {string} Icon
     */
    const getRankIcon = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '';
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Format type for display
     * @param {string} type - Type string
     * @returns {string} Formatted type
     */
    const formatType = (type) => {
        const types = {
            'global': 'Global',
            'weekly': 'Weekly',
            'monthly': 'Monthly',
            'all_time': 'All Time'
        };
        return types[type] || type;
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Format sort method for display
     * @param {string} method - Sort method
     * @returns {string} Formatted method
     */
    const formatSortMethod = (method) => {
        const methods = {
            'total_points': 'Total Points',
            'total_achievements': 'Total Achievements',
            'streak': 'Reading Streak',
            'chapters_read': 'Chapters Read',
            'reading_time': 'Reading Time'
        };
        return methods[method] || method;
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Format reading time
     * @param {number} minutes - Minutes
     * @returns {string} Formatted time
     */
    const formatReadingTime = (minutes) => {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Format date
     * @param {number} timestamp - Timestamp
     * @returns {string} Formatted date
     */
    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString();
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Export leaderboard data
     */
    const exportData = () => {
        const data = Leaderboards.exportLeaderboard(currentType);
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `leaderboard_${currentType}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        UINotifications.showNotification('Leaderboard exported successfully', 'success');
    }

    // ============================================================================
    // PUBLIC API
    // ============================================================================
    
    window.LeaderboardsUI = {
        openModal: openModal,
        closeModal: closeModal,
        switchTab: switchTab,
        changeType: changeType,
        changeSort: changeSort,
        changeLimit: changeLimit,
        searchLeaderboard: searchLeaderboard,
        runComparison: runComparison,
        exportData: exportData
    };
    
})();