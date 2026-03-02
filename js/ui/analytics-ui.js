/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Analytics UI Module
 * Provides user interface for analytics dashboard
 * 
 * @namespace AnalyticsUI
 */
(function() {
    'use strict';

    // Private variables
    let analyticsModal = null;
    let currentTab = 'overview';

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Initialize analytics UI
     */
    const init = () => {
        createAnalyticsModal();
        setupEventListeners();
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create analytics modal
     */
    const createAnalyticsModal = () => {
        const modalHTML = `
  <div id="analytics-modal" class="modal">
      <div class="modal-content analytics-modal">
          <div class="modal-header">
              <h2>📊 Analytics Dashboard</h2>
              <button class="close-btn" onclick="AnalyticsUI.closeModal()">&times;</button>
          </div>

          <div class="modal-body">
              <!-- Tab Navigation -->
              <div class="analytics-tabs">
                  <button class="tab-btn active" data-tab="overview" onclick="AnalyticsUI.switchTab('overview')">
                      📈 Overview
                  </button>
                  <button class="tab-btn" data-tab="sessions" onclick="AnalyticsUI.switchTab('sessions')">
                      ⏱️ Sessions
                  </button>
                  <button class="tab-btn" data-tab="chapters" onclick="AnalyticsUI.switchTab('chapters')">
                      📚 Chapters
                  </button>
                  <button class="tab-btn" data-tab="daily" onclick="AnalyticsUI.switchTab('daily')">
                      📅 Daily Stats
                  </button>
                  <button class="tab-btn" data-tab="actions" onclick="AnalyticsUI.switchTab('actions')">
                      🎯 Actions
                  </button>
              </div>

              <!-- Tab Content -->
              <div class="analytics-content">
                  <div id="tab-overview" class="tab-content active">
                      ${createOverviewContent()}
                  </div>
                  <div id="tab-sessions" class="tab-content">
                      ${createSessionsContent()}
                  </div>
                  <div id="tab-chapters" class="tab-content">
                      ${createChaptersContent()}
                  </div>
                  <div id="tab-daily" class="tab-content">
                      ${createDailyContent()}
                  </div>
                  <div id="tab-actions" class="tab-content">
                      ${createActionsContent()}
                  </div>
              </div>
          </div>

          <div class="modal-footer">
              <button class="btn btn-secondary" onclick="AnalyticsUI.exportData('json')">
                  📥 Export JSON
              </button>
              <button class="btn btn-secondary" onclick="AnalyticsUI.exportData('csv')">
                  📥 Export CSV
              </button>
              <button class="btn btn-danger" onclick="AnalyticsUI.clearData()">
                  🗑️ Clear Data
              </button>
          </div>
      </div>
  </div>
`;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        analyticsModal = DOMHelpers.safeGetElement('analytics-modal');
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create overview tab content
     */
    const createOverviewContent = () => {
        return `
          <div class="analytics-overview">
              <div class="stats-grid">
                  <div class="stat-card">
                      <div class="stat-icon">📖</div>
                      <div class="stat-value" id="stat-total-sessions">0</div>
                      <div class="stat-label">Total Sessions</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-icon">⏰</div>
                      <div class="stat-value" id="stat-total-time">0h</div>
                      <div class="stat-label">Total Reading Time</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-icon">📚</div>
                      <div class="stat-value" id="stat-chapters-read">0</div>
                      <div class="stat-label">Chapters Read</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-icon">🎯</div>
                      <div class="stat-value" id="stat-total-actions">0</div>
                      <div class="stat-label">Total Actions</div>
                  </div>
              </div>

              <div class="chart-container">
                  <h3>📊 Daily Activity (Last 30 Days)</h3>
                  <canvas id="daily-chart"></canvas>
              </div>
          </div>
      `;
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create sessions tab content
     */
    const createSessionsContent = () => {
        return `
          <div class="analytics-sessions">
              <div class="stats-grid">
                  <div class="stat-card">
                      <div class="stat-icon">📊</div>
                      <div class="stat-value" id="stat-avg-session-duration">0m</div>
                      <div class="stat-label">Avg Session Duration</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-icon">📖</div>
                      <div class="stat-value" id="stat-avg-chapters-per-session">0</div>
                      <div class="stat-label">Avg Chapters/Session</div>
                  </div>
              </div>

              <div class="chart-container">
                  <h3>⏱️ Session Duration Distribution</h3>
                  <canvas id="session-chart"></canvas>
              </div>

              <div class="recent-sessions">
                  <h3>📋 Recent Sessions</h3>
                  <div id="recent-sessions-list" class="sessions-list">
                      <p class="no-data">No session data available</p>
                  </div>
              </div>
          </div>
      `;
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create chapters tab content
     */
    const createChaptersContent = () => {
        return `
          <div class="analytics-chapters">
              <div class="stats-grid">
                  <div class="stat-card">
                      <div class="stat-icon">👁️</div>
                      <div class="stat-value" id="stat-total-views">0</div>
                      <div class="stat-label">Total Chapter Views</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-icon">⏱️</div>
                      <div class="stat-value" id="stat-avg-reading-time">0m</div>
                      <div class="stat-label">Avg Reading Time</div>
                  </div>
              </div>

              <div class="chart-container">
                  <h3>📚 Chapter Popularity</h3>
                  <canvas id="chapter-chart"></canvas>
              </div>

              <div class="chapter-details">
                  <h3>📋 Chapter Details</h3>
                  <div id="chapter-details-list" class="chapter-list">
                      <p class="no-data">No chapter data available</p>
                  </div>
              </div>
          </div>
      `;
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create daily stats tab content
     */
    const createDailyContent = () => {
        return `
  <div class="analytics-daily">
      <div class="chart-container">
          <h3>📅 Daily Reading Time (Last 30 Days)</h3>
          <canvas id="daily-time-chart"></canvas>
      </div>

      <div class="daily-table-container">
          <h3>📊 Daily Statistics</h3>
          <table class="analytics-table">
              <thead>
                  <tr>
                      <th>Date</th>
                      <th>Chapter Views</th>
                      <th>Saves</th>
                      <th>Bookmarks</th>
                      <th>Searches</th>
                      <th>Reading Time</th>
                  </tr>
              </thead>
              <tbody id="daily-table-body">
                  <tr><td colspan="6" class="no-data">No daily data available</td></tr>
              </tbody>
          </table>
      </div>
  </div>
`;
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create actions tab content
     */
    const createActionsContent = () => {
        return `
          <div class="analytics-actions">
              <div class="stats-grid">
                  <div class="stat-card">
                      <div class="stat-icon">💾</div>
                      <div class="stat-value" id="stat-saves">0</div>
                      <div class="stat-label">Total Saves</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-icon">🔖</div>
                      <div class="stat-value" id="stat-bookmarks">0</div>
                      <div class="stat-label">Total Bookmarks</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-icon">🔍</div>
                      <div class="stat-value" id="stat-searches">0</div>
                      <div class="stat-label">Total Searches</div>
                  </div>
              </div>

              <div class="chart-container">
                  <h3>🎯 Action Distribution</h3>
                  <canvas id="action-chart"></canvas>
              </div>

              <div class="recent-actions">
                  <h3>📋 Recent Actions</h3>
                  <div id="recent-actions-list" class="actions-list">
                      <p class="no-data">No action data available</p>
                  </div>
              </div>
          </div>
      `;
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Open analytics modal
     */
    const openModal = () => {
        if (analyticsModal) {
            analyticsModal.style.display = 'block';
            updateDashboard();
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Close analytics modal
     */
    const closeModal = () => {
        if (analyticsModal) {
            analyticsModal.style.display = 'none';
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
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        DOMHelpers.safeGetElement('tab-' + tabName).classList.add('active');

        // Update charts for the active tab
        updateCharts(tabName);
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Update dashboard with current data
     */
    const updateDashboard = () => {
        try {
            const summary = Analytics.getSummary();
            
            // Update overview stats
            updateOverviewStats(summary);
            
            // Update session stats
            updateSessionStats(summary);
            
            // Update chapter stats
            updateChapterStats(summary);
            
            // Update daily stats
            updateDailyStats(summary);
            
            // Update action stats
            updateActionStats(summary);
            
            // Update charts
            updateCharts(currentTab);
            
        } catch (error) {
            ErrorHandler.handleError('Failed to update analytics dashboard', error);
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Update overview statistics
     * @param {object} summary - Analytics summary
     */
    const updateOverviewStats = (summary) => {
        DOMHelpers.safeSetText('stat-total-sessions', summary.sessionStats.totalSessions);
        
        const totalHours = Math.round(summary.sessionStats.totalDuration / (1000 * 60 * 60) * 10) / 10;
        DOMHelpers.safeSetText('stat-total-time', totalHours + 'h');
        
        DOMHelpers.safeSetText('stat-chapters-read', summary.sessionStats.totalChaptersRead);
        
        DOMHelpers.safeSetText('stat-total-actions', summary.actionStats.totalActions);
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Update session statistics
     * @param {object} summary - Analytics summary
     */
    const updateSessionStats = (summary) => {
        const avgMinutes = Math.round(summary.sessionStats.averageDuration / (1000 * 60));
        DOMHelpers.safeSetText('stat-avg-session-duration', avgMinutes + 'm');
        
        DOMHelpers.safeSetText('stat-avg-chapters-per-session', Math.round(summary.sessionStats.avgChaptersPerSession * 10) / 10);
        
        // Update recent sessions list
        updateRecentSessionsList();
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Update chapter statistics
     * @param {object} summary - Analytics summary
     */
    const updateChapterStats = (summary) => {
        DOMHelpers.safeSetText('stat-total-views', summary.chapterStats.totalViews);
        
        // Calculate average reading time
        let totalTime = 0;
        let count = 0;
        Object.values(summary.chapterStats.readingTimes).forEach(chapter => {
            totalTime += chapter.averageTime;
            count++;
        });
        const avgMinutes = count > 0 ? Math.round(totalTime / count / (1000 * 60)) : 0;
        DOMHelpers.safeSetText('stat-avg-reading-time', avgMinutes + 'm');
        
        // Update chapter details list
        updateChapterDetailsList(summary);
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Update daily statistics
     * @param {object} summary - Analytics summary
     */
    const updateDailyStats = (summary) => {
        // Update daily table
        const tableBody = DOMHelpers.safeGetElement('daily-table-body');
        
        if (summary.dailyStats.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="no-data">No daily data available</td></tr>';
            return;
        }

        tableBody.innerHTML = summary.dailyStats.map(stat => `
            <tr>
                <td>${formatDate(stat.date)}</td>
                <td>${stat.chapterViews}</td>
                <td>${stat.saves}</td>
                <td>${stat.bookmarks}</td>
                <td>${stat.searches}</td>
                <td>${formatDuration(stat.totalReadingTime)}</td>
            </tr>
        `).join('');
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Update action statistics
     * @param {object} summary - Analytics summary
     */
    const updateActionStats = (summary) => {
        DOMHelpers.safeSetText('stat-saves', summary.actionStats.actionCounts['save'] || 0);
        
        DOMHelpers.safeSetText('stat-bookmarks', summary.actionStats.actionCounts['bookmark'] || 0);
        
        DOMHelpers.safeSetText('stat-searches', summary.actionStats.actionCounts['search'] || 0);
        
        // Update recent actions list
        updateRecentActionsList();
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Update charts for specific tab
     * @param {string} tabName - Tab name
     */
    const updateCharts = (tabName) => {
        // Note: This is a placeholder for chart implementation
        // In a real implementation, you would use a charting library like Chart.js
        // For now, we'll create simple visual representations
        
        switch(tabName) {
            case 'overview':
                createDailyActivityChart();
                break;
            case 'sessions':
                createSessionDurationChart();
                break;
            case 'chapters':
                createChapterPopularityChart();
                break;
            case 'daily':
                createDailyTimeChart();
                break;
            case 'actions':
                createActionDistributionChart();
                break;
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create daily activity chart
     */
    const createDailyActivityChart = () => {
        const canvas = DOMHelpers.safeGetElement('daily-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const summary = Analytics.getSummary();
        
        // Simple bar chart implementation
        const data = summary.dailyStats.slice(0, 30).reverse();
        const maxValue = Math.max(...data.map(d => d.chapterViews), 1);
        
        canvas.width = canvas.offsetWidth;
        canvas.height = 200;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width - 40) / data.length;
        const chartHeight = canvas.height - 40;
        
        data.forEach((stat, index) => {
            const barHeight = (stat.chapterViews / maxValue) * chartHeight;
            const x = 20 + index * barWidth;
            const y = chartHeight - barHeight + 20;
            
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(x, y, barWidth - 2, barHeight);
        });
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Chapter Views per Day', 10, 15);
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create session duration chart
     */
    const createSessionDurationChart = () => {
        const canvas = DOMHelpers.safeGetElement('session-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = 200;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Session Duration Distribution', 10, 15);
        ctx.fillText('(Chart implementation pending)', 10, 40);
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create chapter popularity chart
     */
    const createChapterPopularityChart = () => {
        const canvas = DOMHelpers.safeGetElement('chapter-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = 200;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Chapter Popularity', 10, 15);
        ctx.fillText('(Chart implementation pending)', 10, 40);
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create daily time chart
     */
    const createDailyTimeChart = () => {
        const canvas = DOMHelpers.safeGetElement('daily-time-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = 200;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Daily Reading Time', 10, 15);
        ctx.fillText('(Chart implementation pending)', 10, 40);
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create action distribution chart
     */
    const createActionDistributionChart = () => {
        const canvas = DOMHelpers.safeGetElement('action-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = 200;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Action Distribution', 10, 15);
        ctx.fillText('(Chart implementation pending)', 10, 40);
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Update recent sessions list
     */
    const updateRecentSessionsList = () => {
        const listContainer = DOMHelpers.safeGetElement('recent-sessions-list');
        if (!listContainer) return;
        
        const summary = Analytics.getSummary();
        const sessions = Analytics.getMetrics().sessions.slice(-10).reverse();
        
        if (sessions.length === 0) {
            listContainer.innerHTML = '<p class="no-data">No session data available</p>';
            return;
        }
        
        listContainer.innerHTML = sessions.map(session => `
            <div class="session-item">
                <div class="session-info">
                    <span class="session-date">${formatDateTime(session.startTime)}</span>
                    <span class="session-duration">${formatDuration(session.duration)}</span>
                </div>
                <div class="session-chapters">
                    Chapters: ${session.chaptersRead.join(', ') || 'None'}
                </div>
            </div>
        `).join('');
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Update chapter details list
     * @param {object} summary - Analytics summary
     */
    const updateChapterDetailsList = (summary) => {
        const listContainer = DOMHelpers.safeGetElement('chapter-details-list');
        if (!listContainer) return;
        
        const chapters = Object.entries(summary.chapterStats.chapterViews)
            .sort((a, b) => b[1].count - a[1].count);
        
        if (chapters.length === 0) {
            listContainer.innerHTML = '<p class="no-data">No chapter data available</p>';
            return;
        }
        
        listContainer.innerHTML = chapters.map(([chapterNum, data]) => {
            const readingTime = summary.chapterStats.readingTimes[chapterNum];
            const avgTime = readingTime ? formatDuration(readingTime.averageTime) : 'N/A';
            
            return `
              <div class="chapter-item">
                  <div class="chapter-info">
                      <span class="chapter-number">Chapter ${chapterNum}</span>
                      <span class="chapter-title">${sanitizeHTML(data.title)}</span>
                  </div>
                  <div class="chapter-stats">
                      <span class="chapter-views">👁️ ${data.count} views</span>
                      <span class="chapter-time">⏱️ ${avgTime}</span>
                  </div>
              </div>
          `;
        }).join('');
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Update recent actions list
     */
    const updateRecentActionsList = () => {
        const listContainer = DOMHelpers.safeGetElement('recent-actions-list');
        if (!listContainer) return;
        
        const actions = Analytics.getMetrics().userActions.slice(-10).reverse();
        
        if (actions.length === 0) {
            listContainer.innerHTML = '<p class="no-data">No action data available</p>';
            return;
        }
        
        listContainer.innerHTML = actions.map(action => `
            <div class="action-item">
                <div class="action-info">
                    <span class="action-type">${getActionIcon(action.type)} ${action.type}</span>
                    <span class="action-time">${formatDateTime(action.timestamp)}</span>
                </div>
                <div class="action-details">
                    ${JSON.stringify(action.details)}
                </div>
            </div>
        `).join('');
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Get icon for action type
     * @param {string} actionType - Action type
     * @returns {string} Icon emoji
     */
    const getActionIcon = (actionType) => {
        const icons = {
            'save': '💾',
            'bookmark': '🔖',
            'search': '🔍',
            'load': '📂',
            'export': '📥',
            'import': '📤'
        };
        return icons[actionType] || '🎯';
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Export analytics data
     * @param {string} format - Export format
     */
    const exportData = (format) => {
        try {
            const data = Analytics.exportData(format);
            const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            UINotifications.showNotification(`Data exported as ${format.toUpperCase()}`, 'success');
        } catch (error) {
            ErrorHandler.handleError('Failed to export analytics data', error);
            UINotifications.showNotification('Failed to export data', 'error');
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Clear analytics data
     */
    const clearData = () => {
        if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
            Analytics.clearData();
            updateDashboard();
            UINotifications.showNotification('Analytics data cleared', 'success');
        }
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
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Format date and time for display
     * @param {number} timestamp - Timestamp
     * @returns {string} Formatted date and time
     */
    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
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
     * Format duration for display
     * @param {number} milliseconds - Duration in milliseconds
     * @returns {string} Formatted duration
     */
    const formatDuration = (milliseconds) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Setup event listeners
     */
    const setupEventListeners = () => {
        // Close modal on outside click
        if (analyticsModal) {
            analyticsModal.addEventListener('click', function(e) {
                if (e.target === analyticsModal) {
                    closeModal();
                }
            });
        }
    }

    // Export public API
    window.AnalyticsUI = {
        init: init,
        openModal: openModal,
        closeModal: closeModal,
        switchTab: switchTab,
        updateDashboard: updateDashboard,
        exportData: exportData,
        clearData: clearData
    };

})();