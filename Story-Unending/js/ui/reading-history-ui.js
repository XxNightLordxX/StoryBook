/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Reading History UI Module
 * Manages the reading history interface
 * @module reading-history-ui
 */

(function() {
  'use strict';

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Opens the reading history modal
   */
  const openReadingHistoryModal = () => {
    const modal = DOMHelpers.safeGetElement('reading-history-modal');
    if (!modal) {
      createReadingHistoryModal();
    }
    
    refreshReadingHistory();
    DOMHelpers.safeToggleClass('reading-history-modal', 'active', true);
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Closes the reading history modal
   */
  const closeReadingHistoryModal = () => {
    const modal = DOMHelpers.safeGetElement('reading-history-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Creates the reading history modal HTML structure
   */
  const createReadingHistoryModal = () => {
    const modalHTML = `
      <div id="reading-history-modal" class="modal">
        <div class="modal-content reading-history-content">
          <div class="modal-header">
            <h2>📊 Reading History</h2>
            <button class="close-btn" onclick="ReadingHistoryUI.closeModal()">&times;</button>
          </div>
          
          <div class="reading-stats-section">
            <h3>Reading Statistics</h3>
            <div class="stats-grid" id="stats-grid">
              <!-- Stats will be rendered here -->
            </div>
          </div>
          
          <div class="reading-history-section">
            <div class="history-header">
              <h3>Recent Reading Sessions</h3>
              <button class="clear-history-btn" onclick="ReadingHistoryUI.clearHistory()">Clear History</button>
            </div>
            <div class="reading-history-list" id="reading-history-list">
              <!-- History will be rendered here -->
            </div>
          </div>
          
          <div class="reading-history-empty" id="reading-history-empty" style="display:none;">
            <div class="empty-icon">📚</div>
            <p>No reading history yet</p>
            <p class="empty-hint">Start reading to track your progress</p>
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
   * Refreshes the reading history display
   */
  const refreshReadingHistory = () => {
    renderStatistics();
    renderReadingHistory();
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Renders reading statistics
   */
  const renderStatistics = () => {
    const stats = ReadingHistory.getReadingStatistics();
    const statsGrid = DOMHelpers.safeGetElement('stats-grid');
    
    if (!statsGrid) return;
    
    const statsData = [
      {
        icon: '📖',
        label: 'Chapters Read',
        value: stats.totalChaptersRead || 0,
        color: '#4a9eff'
      },
      {
        icon: '⏱️',
        label: 'Total Reading Time',
        value: ReadingHistory.formatDuration(stats.totalReadingTime || 0),
        color: '#5cb85c'
      },
      {
        icon: '📝',
        label: 'Words Read',
        value: formatNumber(stats.totalWordsRead || 0),
        color: '#f0ad4e'
      },
      {
        icon: '🔥',
        label: 'Reading Streak',
        value: `${stats.readingStreak || 0} days`,
        color: '#d9534f'
      },
      {
        icon: '⏰',
        label: 'Avg. Session',
        value: ReadingHistory.formatDuration(stats.averageSessionDuration || 0),
        color: '#5bc0de'
      },
      {
        icon: '🏆',
        label: 'Longest Session',
        value: ReadingHistory.formatDuration(stats.longestSession || 0),
        color: '#9b59b6'
      }
    ];
    
    let html = '';
    statsData.forEach(stat => {
      html += `
        <div class="stat-card" style="border-color: ${stat.color}">
          <div class="stat-icon">${stat.icon}</div>
          <div class="stat-value">${stat.value}</div>
          <div class="stat-label">${stat.label}</div>
        </div>
      `;
    });
    
    statsGrid.innerHTML = html;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Renders reading history list
   */
  const renderReadingHistory = () => {
    const history = ReadingHistory.getReadingHistory();
    const historyList = DOMHelpers.safeGetElement('reading-history-list');
    const emptySection = DOMHelpers.safeGetElement('reading-history-empty');
    
    if (!historyList) return;
    
    if (history.length === 0) {
      historyList.style.display = 'none';
      emptySection.style.display = 'block';
      return;
    }
    
    historyList.style.display = 'block';
    emptySection.style.display = 'none';
    
    let html = '';
    history.forEach(session => {
      html += renderHistoryItem(session);
    });
    
    historyList.innerHTML = html;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Renders a single history item
   * @param {Object} session - Reading session
   * @returns {string} HTML string
   */
  const renderHistoryItem = (session) => {
    const date = new Date(session.startTime);
    const formattedDate = formatDate(date);
    const formattedTime = formatTime(date);
    const duration = ReadingHistory.formatDuration(session.duration);
    
    return `
      <div class="history-item" data-session-id="${session.id}">
        <div class="history-header">
          <div class="history-chapter">
            <span class="chapter-number">Chapter ${session.chapterNum}</span>
            <span class="chapter-title">${sanitizeHTML(session.chapterTitle)}</span>
          </div>
          <div class="history-duration">${duration}</div>
        </div>
        <div class="history-details">
          <span class="history-date">${formattedDate}</span>
          <span class="history-time">${formattedTime}</span>
          <span class="history-words">${formatNumber(session.wordsRead)} words</span>
        </div>
        <div class="history-actions">
          <button class="btn btn-primary btn-sm" onclick="ReadingHistoryUI.goToChapter(${session.chapterNum})">
            📖 Read Again
          </button>
        </div>
      </div>
    `;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Formats a date for display
   * @param {Date} date - Date to format
   * @returns {string} Formatted date
   */
  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    
    if (dateOnly.getTime() === today.getTime()) {
      return 'Today';
    } else if (dateOnly.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Formats a time for display
   * @param {Date} date - Date to format
   * @returns {string} Formatted time
   */
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Formats a number with commas
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Clears reading history
   */
  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all reading history? This cannot be undone.')) {
      ReadingHistory.clearReadingHistory();
      refreshReadingHistory();
      UINotifications.showNotification('Reading history cleared', 'success');
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Goes to a specific chapter
   * @param {number} chapterNum - Chapter number
   */
  const goToChapter = (chapterNum) => {
    closeReadingHistoryModal();
    Navigation.goToChapter(chapterNum);
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Adds "Continue Reading" button if applicable
   */
  const addContinueReadingButton = () => {
    const lastRead = ReadingHistory.getLastReadChapter();
    if (!lastRead) {
      return;
    }
    
    const chapterContent = DOMHelpers.safeGetElement('chapter-content');
    if (!chapterContent) return;
    
    // Check if button already exists
    if (DOMHelpers.safeGetElement('continue-reading-btn')) return;
    
    const buttonHTML = `
      <button id="continue-reading-btn" class="continue-reading-btn" onclick="ReadingHistoryUI.continueReading()">
        📖 Continue Reading: Chapter ${lastRead.chapterNum}
      </button>
    `;
    
    chapterContent.insertAdjacentHTML('beforebegin', buttonHTML);
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Continues reading from last chapter
   */
  const continueReading = () => {
    const lastRead = ReadingHistory.getLastReadChapter();
    if (lastRead) {
      Navigation.goToChapter(lastRead.chapterNum);
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Initializes reading history tracking
   */
  const initializeTracking = () => {
    // Start tracking when chapter changes
    const currentChapter = AppStateModule.AppState.currentChapter;
    ReadingHistory.startReadingSession(currentChapter);
    
    // End tracking when page unloads
    window.addEventListener('beforeunload', () => {
      ReadingHistory.endReadingSession();
    });
    
    // Add continue reading button
    addContinueReadingButton();
  }

  // Create namespace object
  const ReadingHistoryUI = {
    openModal: openModal,
    closeModal: closeModal,
    refreshReadingHistory: refreshReadingHistory,
    renderStatistics: renderStatistics,
    renderReadingHistory: renderReadingHistory,
    clearHistory: clearHistory,
    goToChapter: goToChapter,
    addContinueReadingButton: addContinueReadingButton,
    continueReading: continueReading,
    initializeTracking: initializeTracking
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.ReadingHistoryUI = ReadingHistoryUI;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReadingHistoryUI;
  }

})();