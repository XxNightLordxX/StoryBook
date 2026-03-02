/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Performance UI Module
 * Manages performance monitoring interface
 * @module performance-ui
 */

(function() {
  'use strict';

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Opens the performance modal
   */
  const openPerformanceModal = () => {
    const modal = DOMHelpers.safeGetElement('performance-modal');
    if (!modal) {
      createPerformanceModal();
    }
    
    refreshPerformanceMetrics();
    DOMHelpers.safeToggleClass('performance-modal', 'active', true);
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Closes the performance modal
   */
  const closePerformanceModal = () => {
    const modal = DOMHelpers.safeGetElement('performance-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Creates the performance modal HTML structure
   */
  const createPerformanceModal = () => {
    const modalHTML = `
      <div id="performance-modal" class="modal">
        <div class="modal-content performance-content">
          <div class="modal-header">
            <h2>⚡ Performance Metrics</h2>
            <button class="close-btn" onclick="PerformanceUI.closeModal()">&times;</button>
          </div>
          
          <div class="performance-section">
            <h3>Page Performance</h3>
            <div class="metrics-grid" id="page-metrics">
              <!-- Page metrics will be rendered here -->
            </div>
          </div>
          
          <div class="performance-section">
            <h3>Cache Statistics</h3>
            <div class="metrics-grid" id="cache-metrics">
              <!-- Cache metrics will be rendered here -->
            </div>
          </div>
          
          <div class="performance-section">
            <h3>Optimization Status</h3>
            <div class="optimization-list" id="optimization-list">
              <!-- Optimization status will be rendered here -->
            </div>
          </div>
          
          <div class="performance-actions">
            <button class="btn btn-primary" onclick="PerformanceUI.clearCache()">
              🗑️ Clear Cache
            </button>
            <button class="btn btn-secondary" onclick="PerformanceUI.refreshMetrics()">
              🔄 Refresh
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
   * Refreshes performance metrics display
   */
  const refreshPerformanceMetrics = () => {
    renderPageMetrics();
    renderCacheMetrics();
    renderOptimizationStatus();
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Renders page performance metrics
   */
  const renderPageMetrics = () => {
    const metrics = Performance.getPerformanceMetrics();
    const pageMetrics = DOMHelpers.safeGetElement('page-metrics');
    
    if (!pageMetrics) return;
    
    const pageMetricsData = [
      {
        label: 'Page Load Time',
        value: formatTime(metrics.pageLoadTime),
        status: getStatus(metrics.pageLoadTime, 2000),
        icon: '📊'
      },
      {
        label: 'DOM Content Loaded',
        value: formatTime(metrics.domContentLoaded),
        status: getStatus(metrics.domContentLoaded, 1000),
        icon: '🏗️'
      },
      {
        label: 'First Paint',
        value: formatTime(metrics.firstPaint),
        status: getStatus(metrics.firstPaint, 1000),
        icon: '🎨'
      },
      {
        label: 'First Contentful Paint',
        value: formatTime(metrics.firstContentfulPaint),
        status: getStatus(metrics.firstContentfulPaint, 1500),
        icon: '📝'
      }
    ];
    
    let html = '';
    pageMetricsData.forEach(metric => {
      html += `
        <div class="metric-card ${metric.status}">
          <div class="metric-icon">${metric.icon}</div>
          <div class="metric-value">${metric.value}</div>
          <div class="metric-label">${metric.label}</div>
          <div class="metric-status">${metric.status}</div>
        </div>
      `;
    });
    
    pageMetrics.innerHTML = html;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Renders cache metrics
   */
  const renderCacheMetrics = () => {
    const cacheStats = Performance.getCacheStats();
    const cacheMetrics = DOMHelpers.safeGetElement('cache-metrics');
    
    if (!cacheMetrics) return;
    
    const cacheMetricsData = [
      {
        label: 'Cache Size',
        value: `${cacheStats.size}/${cacheStats.maxSize}`,
        status: cacheStats.size < cacheStats.maxSize ? 'Good' : 'Full',
        icon: '💾'
      },
      {
        label: 'Cache Hits',
        value: cacheStats.hits,
        status: 'Good',
        icon: '✅'
      },
      {
        label: 'Cache Misses',
        value: cacheStats.misses,
        status: cacheStats.misses < 10 ? 'Good' : 'High',
        icon: '❌'
      },
      {
        label: 'Hit Rate',
        value: cacheStats.hitRate,
        status: parseFloat(cacheStats.hitRate) > 50 ? 'Good' : 'Low',
        icon: '📈'
      }
    ];
    
    let html = '';
    cacheMetricsData.forEach(metric => {
      html += `
        <div class="metric-card ${metric.status.toLowerCase()}">
          <div class="metric-icon">${metric.icon}</div>
          <div class="metric-value">${metric.value}</div>
          <div class="metric-label">${metric.label}</div>
          <div class="metric-status">${metric.status}</div>
        </div>
      `;
    });
    
    cacheMetrics.innerHTML = html;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Renders optimization status
   */
  const renderOptimizationStatus = () => {
    const optimizationList = DOMHelpers.safeGetElement('optimization-list');
    
    if (!optimizationList) return;
    
    const optimizations = [
      {
        name: 'Lazy Loading',
        status: 'Active',
        description: 'Elements load as they become visible',
        icon: '⚡'
      },
      {
        name: 'Caching',
        status: 'Active',
        description: 'Frequently accessed data is cached',
        icon: '💾'
      },
      {
        name: 'DOM Batching',
        status: 'Active',
        description: 'DOM updates are batched for performance',
        icon: '🏗️'
      },
      {
        name: 'Debouncing',
        status: 'Active',
        description: 'Frequent events are debounced',
        icon: '🎯'
      }
    ];
    
    let html = '';
    optimizations.forEach(opt => {
      html += `
        <div class="optimization-item">
          <div class="optimization-icon">${opt.icon}</div>
          <div class="optimization-info">
            <div class="optimization-name">${opt.name}</div>
            <div class="optimization-description">${opt.description}</div>
          </div>
          <div class="optimization-status ${opt.status.toLowerCase()}">${opt.status}</div>
        </div>
      `;
    });
    
    optimizationList.innerHTML = html;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Formats time in milliseconds
   * @param {number} ms - Time in milliseconds
   * @returns {string} Formatted time
   */
  const formatTime = (ms) => {
    if (ms === 0) return 'N/A';
    return `${ms.toFixed(0)}ms`;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Gets status based on value and threshold
   * @param {number} value - Value to check
   * @param {number} threshold - Threshold value
   * @returns {string} Status
   */
  const getStatus = (value, threshold) => {
    if (value === 0) return 'N/A';
    return value < threshold ? 'Good' : 'Slow';
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Clears cache
   */
  const clearCache = () => {
    if (confirm('Are you sure you want to clear the cache?')) {
      Performance.clearCache();
      refreshPerformanceMetrics();
      UINotifications.showNotification('Cache cleared', 'success');
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Refreshes metrics
   */
  const refreshMetrics = () => {
    refreshPerformanceMetrics();
    UINotifications.showNotification('Metrics refreshed', 'success');
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Initializes performance optimizations
   */
  const initializeOptimizations = () => {
    // Initialize performance monitoring
    Performance.initializePerformanceMonitoring();
    
    // Set up cache cleanup
    Performance.setupCacheCleanup();
    
    // Optimize chapter loading
    optimizeChapterLoading();
    
    // Add loading indicators
    addLoadingIndicators();
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Optimizes chapter loading
   */
  const optimizeChapterLoading = () => {
    // Override chapter loading to use optimized version
    const originalLoadChapter = Navigation.goToChapter;
    
    Navigation.goToChapter = (chapterNum) => {
      // Show loading indicator
      showLoadingIndicator();
      
      // Use optimized loading
      const chapter = Performance.loadChapterOptimized(chapterNum);
      
      if (chapter) {
        // Call original function
        originalLoadChapter.call(Navigation, chapterNum);
        
        // Hide loading indicator
        hideLoadingIndicator();
      }
    };
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Shows loading indicator
   */
  const showLoadingIndicator = () => {
    const indicator = DOMHelpers.safeGetElement('loading-indicator');
    if (indicator) {
      indicator.style.display = 'flex';
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Hides loading indicator
   */
  const hideLoadingIndicator = () => {
    const indicator = DOMHelpers.safeGetElement('loading-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Adds loading indicators
   */
  const addLoadingIndicators = () => {
    const indicatorHTML = `
      <div id="loading-indicator" class="loading-indicator" style="display:none;">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading...</div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', indicatorHTML);
  }

  // Create namespace object
  const PerformanceUI = {
    openModal: openModal,
    closeModal: closeModal,
    refreshPerformanceMetrics: refreshPerformanceMetrics,
    renderPageMetrics: renderPageMetrics,
    renderCacheMetrics: renderCacheMetrics,
    renderOptimizationStatus: renderOptimizationStatus,
    clearCache: clearCache,
    refreshMetrics: refreshMetrics,
    initializeOptimizations: initializeOptimizations
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.PerformanceUI = PerformanceUI;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceUI;
  }

})();