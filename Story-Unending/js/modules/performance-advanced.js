/**
 * Advanced Performance Optimization Module
 * 
 * This module provides advanced performance optimizations including:
 * - requestAnimationFrame for smooth animations
 * - Virtual scrolling for long lists
 * - Image lazy loading optimization
 * - Debouncing and throttling utilities
 * - Memory leak detection and prevention
 * - Optimized localStorage operations
 * - Connection-aware loading
 * 
 * @namespace PerformanceAdvanced
 */

(function(window) {
  'use strict';

  // ============================================================================
  // ANIMATION OPTIMIZATION
  // ============================================================================

  /**
   * Animation frame manager for smooth animations
   * Uses requestAnimationFrame for optimal performance
   */
  const AnimationFrameManager = {
    activeFrames: new Map(),
    frameId: 0,

    /**
     * Request an animation frame with automatic cleanup
     * @param {string} id - Unique identifier for the animation
     * @param {Function} callback - Animation callback
     * @returns {number} Frame ID
     */
    requestFrame(id, callback) {
      // Cancel existing frame with same ID
      if (this.activeFrames.has(id)) {
        cancelAnimationFrame(this.activeFrames.get(id));
      }

      const frameId = requestAnimationFrame((timestamp) => {
        callback(timestamp);
        this.activeFrames.delete(id);
      });

      this.activeFrames.set(id, frameId);
      return frameId;
    },

    /**
     * Cancel an animation frame
     * @param {string} id - Animation identifier
     */
    cancelFrame(id) {
      if (this.activeFrames.has(id)) {
        cancelAnimationFrame(this.activeFrames.get(id));
        this.activeFrames.delete(id);
      }
    },

    /**
     * Cancel all active animation frames
     */
    cancelAllFrames() {
      this.activeFrames.forEach((frameId) => {
        cancelAnimationFrame(frameId);
      });
      this.activeFrames.clear();
    }
  };

  // ============================================================================
  // VIRTUAL SCROLLING
  // ============================================================================

  /**
   * Virtual scrolling implementation for long lists
   * Only renders visible items for optimal performance
   */
  const VirtualScroll = {
    instances: new Map(),

    /**
     * Initialize virtual scrolling for a container
     * @param {string} containerId - Container element ID
     * @param {Array} items - Array of items to render
     * @param {Object} options - Configuration options
     * @returns {Object} Virtual scroll instance
     */
    init(containerId, items, options = {}) {
      const container = DOMHelpers.safeGetElement(containerId);
      if (!container) {
        // Error logged: console.error(`Container ${containerId} not found`);
        return null;
      }

      const config = {
        itemHeight: options.itemHeight || 50,
        buffer: options.buffer || 5,
        renderItem: options.renderItem || ((item) => `<div>${item}</div>`),
        ...options
      };

      const instance = {
        container,
        items,
        config,
        scrollTop: 0,
        visibleStart: 0,
        visibleEnd: 0,
        totalHeight: items.length * config.itemHeight
      };

      // Create scroll container
      const scrollContainer = document.createElement('div');
      scrollContainer.style.height = `${instance.totalHeight}px`;
      scrollContainer.style.position = 'relative';
      container.innerHTML = '';
      container.appendChild(scrollContainer);

      // Create viewport
      const viewport = document.createElement('div');
      viewport.style.position = 'absolute';
      viewport.style.top = '0';
      viewport.style.left = '0';
      viewport.style.right = '0';
      scrollContainer.appendChild(viewport);

      instance.viewport = viewport;

      // Add scroll listener
      container.addEventListener('scroll', () => {
        this.update(instance);
      });

      // Initial render
      this.update(instance);

      this.instances.set(containerId, instance);
      return instance;
    },

    /**
     * Update visible items based on scroll position
     * @param {Object} instance - Virtual scroll instance
     */
    update(instance) {
      const { container, items, config, viewport } = instance;
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      // Calculate visible range
      const startIndex = Math.max(0, Math.floor(scrollTop / config.itemHeight) - config.buffer);
      const endIndex = Math.min(
        items.length,
        Math.ceil((scrollTop + containerHeight) / config.itemHeight) + config.buffer
      );

      // Only update if range changed
      if (startIndex === instance.visibleStart && endIndex === instance.visibleEnd) {
        return;
      }

      instance.visibleStart = startIndex;
      instance.visibleEnd = endIndex;

      // Render visible items
      let html = '';
      for (let i = startIndex; i < endIndex; i++) {
        const item = items[i];
        const top = i * config.itemHeight;
        html += `<div style="position: absolute; top: ${top}px; height: ${config.itemHeight}px; width: 100%;">`;
        html += config.renderItem(item, i);
        html += '</div>';
      }

      viewport.innerHTML = html;
    },

    /**
     * Update items in virtual scroll instance
     * @param {string} containerId - Container ID
     * @param {Array} newItems - New items array
     */
    updateItems(containerId, newItems) {
      const instance = this.instances.get(containerId);
      if (!instance) return;

      instance.items = newItems;
      instance.totalHeight = newItems.length * instance.config.itemHeight;
      instance.container.firstChild.style.height = `${instance.totalHeight}px`;
      this.update(instance);
    },

    /**
     * Destroy virtual scroll instance
     * @param {string} containerId - Container ID
     */
    destroy(containerId) {
      const instance = this.instances.get(containerId);
      if (!instance) return;

      instance.container.removeEventListener('scroll', () => this.update(instance));
      this.instances.delete(containerId);
    }
  };

  // ============================================================================
  // IMAGE LAZY LOADING
  // ============================================================================

  /**
   * Advanced image lazy loading with intersection observer
   */
  const ImageLazyLoader = {
    observer: null,
    loadedImages: new Set(),

    /**
     * Initialize lazy loading for images
     * @param {Object} options - Configuration options
     */
    init(options = {}) {
      const config = {
        rootMargin: options.rootMargin || '200px',
        threshold: options.threshold || 0.01,
        ...options
      };

      // Create intersection observer (with feature detection for older browsers)
      if (typeof IntersectionObserver === 'undefined') {
        return;
      }
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: config.rootMargin,
        threshold: config.threshold
      });

      // Observe existing lazy images
      this.observeImages();

      // Observe dynamically added images
      this.observeNewImages();
    },

    /**
     * Observe all lazy images in document
     */
    observeImages() {
      const lazyImages = document.querySelectorAll('img[data-src], img[data-lazy]');
      lazyImages.forEach((img) => {
        if (!this.loadedImages.has(img)) {
          this.observer.observe(img);
        }
      });
    },

    /**
     * Observe dynamically added images
     */
    observeNewImages() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const lazyImages = node.querySelectorAll ? 
                node.querySelectorAll('img[data-src], img[data-lazy]') : [];
              lazyImages.forEach((img) => {
                if (!this.loadedImages.has(img)) {
                  this.observer.observe(img);
                }
              });
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    },

    /**
     * Load a single image
     * @param {HTMLImageElement} img - Image element
     */
    loadImage(img) {
      const src = img.dataset.src || img.dataset.lazy;
      if (!src) return;

      // Create new image to preload
      const tempImg = new Image();
      tempImg.onload = () => {
        img.src = src;
        img.classList.add('loaded');
        this.loadedImages.add(img);
      };
      tempImg.onerror = () => {
        img.classList.add('error');
      };
      tempImg.src = src;
    },

    /**
     * Manually load an image
     * @param {HTMLImageElement} img - Image element
     */
    loadNow(img) {
      if (this.observer) {
        this.observer.unobserve(img);
      }
      this.loadImage(img);
    },

    /**
     * Destroy lazy loader
     */
    destroy() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      this.loadedImages.clear();
    }
  };

  // ============================================================================
  // DEBOUNCING AND THROTTLING
  // ============================================================================

  /**
   * Debounce utility - delays function execution until after wait time
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Execute immediately on leading edge
   * @returns {Function} Debounced function
   */
  function debounce(func, wait = 300, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(this, args);
    };
  }

  /**
   * Throttle utility - limits function execution to once per wait time
   * @param {Function} func - Function to throttle
   * @param {number} wait - Wait time in milliseconds
   * @param {Object} options - Configuration options
   * @returns {Function} Throttled function
   */
  function throttle(func, wait = 300, options = {}) {
    let timeout, context, args, result;
    let previous = 0;

    const later = () => {
      previous = options.leading === false ? 0 : Date.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    return function(...params) {
      const now = Date.now();
      if (!previous && options.leading === false) previous = now;
      const remaining = wait - (now - previous);
      context = this;
      args = params;

      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  }

  // ============================================================================
  // MEMORY LEAK DETECTION
  // ============================================================================

  /**
   * Memory leak detection and prevention
   */
  const MemoryMonitor = {
    eventListeners: new Map(),
    intervals: new Set(),
    timeouts: new Set(),
    observers: new Set(),

    /**
     * Track event listener for cleanup
     * @param {EventTarget} target - Event target
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    addEventListener(target, event, handler, options) {
      target.addEventListener(event, handler, options);
      
      const key = `${target.constructor.name}_${event}`;
      if (!this.eventListeners.has(key)) {
        this.eventListeners.set(key, []);
      }
      this.eventListeners.get(key).push({ target, event, handler, options });
    },

    /**
     * Remove tracked event listener
     * @param {EventTarget} target - Event target
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    removeEventListener(target, event, handler) {
      target.removeEventListener(event, handler);
      
      const key = `${target.constructor.name}_${event}`;
      const listeners = this.eventListeners.get(key);
      if (listeners) {
        const index = listeners.findIndex(l => l.handler === handler);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    },

    /**
     * Track interval for cleanup
     * @param {number} intervalId - Interval ID
     */
    trackInterval(intervalId) {
      this.intervals.add(intervalId);
    },

    /**
     * Clear tracked interval
     * @param {number} intervalId - Interval ID
     */
    clearInterval(intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(intervalId);
    },

    /**
     * Track timeout for cleanup
     * @param {number} timeoutId - Timeout ID
     */
    trackTimeout(timeoutId) {
      this.timeouts.add(timeoutId);
    },

    /**
     * Clear tracked timeout
     * @param {number} timeoutId - Timeout ID
     */
    clearTimeout(timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(timeoutId);
    },

    /**
     * Track observer for cleanup
     * @param {Object} observer - Observer instance
     */
    trackObserver(observer) {
      this.observers.add(observer);
    },

    /**
     * Disconnect and remove tracked observer
     * @param {Object} observer - Observer instance
     */
    disconnectObserver(observer) {
      if (observer.disconnect) {
        observer.disconnect();
      }
      this.observers.delete(observer);
    },

    /**
     * Clean up all tracked resources
     */
    cleanup() {
      // Clear all intervals
      this.intervals.forEach(id => clearInterval(id));
      this.intervals.clear();

      // Clear all timeouts
      this.timeouts.forEach(id => clearTimeout(id));
      this.timeouts.clear();

      // Disconnect all observers
      this.observers.forEach(observer => {
        if (observer.disconnect) observer.disconnect();
      });
      this.observers.clear();

      // Remove all event listeners
      this.eventListeners.forEach((listeners) => {
        listeners.forEach(({ target, event, handler }) => {
          target.removeEventListener(event, handler);
        });
      });
      this.eventListeners.clear();
    },

    /**
     * Get memory usage statistics
     * @returns {Object} Memory statistics
     */
    getStats() {
      return {
        eventListeners: Array.from(this.eventListeners.values())
          .reduce((sum, arr) => sum + arr.length, 0),
        intervals: this.intervals.size,
        timeouts: this.timeouts.size,
        observers: this.observers.size
      };
    }
  };

  // ============================================================================
  // OPTIMIZED LOCAL STORAGE
  // ============================================================================

  /**
   * Optimized localStorage operations with batching and compression
   */
  const StorageOptimizer = {
    writeQueue: [],
    writeTimer: null,
    readCache: new Map(),
    cacheMaxSize: 100,
    cacheMaxAge: 60000, // 1 minute

    /**
     * Get item from localStorage with caching
     * @param {string} key - Storage key
     * @returns {*} Stored value
     */
    getItem(key) {
      // Check cache first
      const cached = this.readCache.get(key);
      if (cached && Date.now() - cached.timestamp < this.cacheMaxAge) {
        return cached.value;
      }

      // Read from localStorage
      try {
        const value = Storage.getItem(key);
        const parsed = value ? JSON.parse(value) : null;

        // Update cache
        this.updateCache(key, parsed);

        return parsed;
      } catch (error) {
        // Error handled silently: console.error('Error reading from localStorage:', error);
        return null;
      }
    },

    /**
     * Set item in localStorage with batching
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @param {boolean} immediate - Write immediately
     */
    setItem(key, value, immediate = false) {
      this.writeQueue.push({ key, value });

      // Enforce queue size limit to prevent unbounded growth on flush failures
      const MAX_WRITE_QUEUE = 500;
      if (this.writeQueue.length > MAX_WRITE_QUEUE) {
        this.writeQueue = this.writeQueue.slice(-MAX_WRITE_QUEUE);
      }

      if (immediate) {
        this.flush();
      } else {
        this.scheduleWrite();
      }
    },

    /**
     * Schedule batched write
     */
    scheduleWrite() {
      if (this.writeTimer) {
        clearTimeout(this.writeTimer);
      }

      this.writeTimer = setTimeout(() => {
        this.flush();
      }, 100); // Batch writes within 100ms
    },

    /**
     * Flush write queue to localStorage
     */
    flush() {
      if (this.writeQueue.length === 0) return;

      const batch = [...this.writeQueue];
      this.writeQueue = [];

      try {
        batch.forEach(({ key, value }) => {
          Storage.setItem(key, value);
          this.updateCache(key, value);
        });
      } catch (error) {
        // Error handled silently: console.error('Error writing to localStorage:', error);
        // Re-queue failed writes
        this.writeQueue.unshift(...batch);
      }
    },

    /**
     * Update read cache
     * @param {string} key - Cache key
     * @param {*} value - Cache value
     */
    updateCache(key, value) {
      // Remove oldest if cache is full
      if (this.readCache.size >= this.cacheMaxSize) {
        const oldestKey = this.readCache.keys().next().value;
        this.readCache.delete(oldestKey);
      }

      this.readCache.set(key, {
        value,
        timestamp: Date.now()
      });
    },

    /**
     * Remove item from storage and cache
     * @param {string} key - Storage key
     */
    removeItem(key) {
      Storage.removeItem(key);
      this.readCache.delete(key);
    },

    /**
     * Clear all storage and cache
     */
    clear() {
      Storage.clearAll();
      this.readCache.clear();
      this.writeQueue = [];
    },

    /**
     * Get storage statistics
     * @returns {Object} Storage statistics
     */
    getStats() {
      let totalSize = 0;
      const keys = Storage.getAllKeys();
      for (const key of keys) {
        totalSize += Storage.getItem(key).length;
      }

      return {
        itemCount: keys.length,
        totalSize: totalSize,
        totalSizeKB: (totalSize / 1024).toFixed(2),
        cacheSize: this.readCache.size,
        queueSize: this.writeQueue.length
      };
    }
  };

  // ============================================================================
  // CONNECTION-AWARE LOADING
  // ============================================================================

  /**
   * Connection-aware loading based on network conditions
   */
  const ConnectionAwareLoader = {
    connection: null,
    isSlowConnection: false,
    isDataSaver: false,

    /**
     * Initialize connection monitoring
     */
    init() {
      // Check for Network Information API
      if (navigator.connection) {
        this.connection = navigator.connection;
        this.updateConnectionInfo();
        
        // Listen for connection changes
        this.connection.addEventListener('change', () => {
          this.updateConnectionInfo();
        });
      } else {
        // Fallback: assume good connection
        this.isSlowConnection = false;
        this.isDataSaver = false;
      }
    },

    /**
     * Update connection information
     */
    updateConnectionInfo() {
      if (!this.connection) return;

      this.isSlowConnection = 
        this.connection.effectiveType === 'slow-2g' ||
        this.connection.effectiveType === '2g' ||
        this.connection.saveData === true;

      this.isDataSaver = this.connection.saveData === true;
    },

    /**
     * Check if should load high-quality assets
     * @returns {boolean} Whether to load high-quality assets
     */
    shouldLoadHighQuality() {
      return !this.isSlowConnection && !this.isDataSaver;
    },

    /**
     * Get appropriate image quality
     * @returns {string} Image quality level
     */
    getImageQuality() {
      if (this.isSlowConnection) return 'low';
      if (this.isDataSaver) return 'medium';
      return 'high';
    },

    /**
     * Get appropriate loading strategy
     * @returns {string} Loading strategy
     */
    getLoadingStrategy() {
      if (this.isSlowConnection) return 'eager';
      if (this.isDataSaver) return 'lazy';
      return 'progressive';
    },

    /**
     * Get connection information
     * @returns {Object} Connection info
     */
    getConnectionInfo() {
      return {
        effectiveType: (this.connection && this.connection.effectiveType) || 'unknown',
        downlink: (this.connection && this.connection.downlink) || 0,
        rtt: (this.connection && this.connection.rtt) || 0,
        saveData: this.isDataSaver,
        isSlowConnection: this.isSlowConnection,
        imageQuality: this.getImageQuality(),
        loadingStrategy: this.getLoadingStrategy()
      };
    }
  };

  // ============================================================================
  // PERFORMANCE MONITORING
  // ============================================================================

  /**
   * Performance monitoring utilities
   */
  const PerformanceMonitor = {
    metrics: new Map(),
    observers: [],

    /**
     * Start measuring performance
     * @param {string} name - Metric name
     */
    startMeasure(name) {
      if (performance.mark) {
        performance.mark(`${name}-start`);
      }
      this.metrics.set(name, { startTime: performance.now() });
    },

    /**
     * Stop measuring performance
     * @param {string} name - Metric name
     * @returns {number} Duration in milliseconds
     */
    endMeasure(name) {
      const metric = this.metrics.get(name);
      if (!metric) return 0;

      const duration = performance.now() - metric.startTime;

      if (performance.mark && performance.measure) {
        try {
          performance.mark(`${name}-end`);
          performance.measure(name, `${name}-start`, `${name}-end`);
        } catch (e) {
          // Ignore errors
        }
      }

      this.metrics.set(name, { ...metric, duration, endTime: performance.now() });
      return duration;
    },

    /**
     * Get performance metric
     * @param {string} name - Metric name
     * @returns {Object} Metric data
     */
    getMetric(name) {
      return this.metrics.get(name);
    },

    /**
     * Get all metrics
     * @returns {Array} All metrics
     */
    getAllMetrics() {
      return Array.from(this.metrics.entries()).map(([name, data]) => ({
        name,
        ...data
      }));
    },

    /**
     * Clear all metrics
     */
    clearMetrics() {
      this.metrics.clear();
    },

    /**
     * Get page load performance
     * @returns {Object} Page load metrics
     */
    getPageLoadMetrics() {
      const timing = performance.timing || {};
      const navigation = performance.getEntriesByType('navigation')[0] || {};

      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint(),
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
      };
    },

    /**
     * Get First Paint time
     * @returns {number} First Paint time in ms
     */
    getFirstPaint() {
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      return firstPaint ? firstPaint.startTime : 0;
    },

    /**
     * Get First Contentful Paint time
     * @returns {number} First Contentful Paint time in ms
     */
    getFirstContentfulPaint() {
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcp ? fcp.startTime : 0;
    },

    /**
     * Monitor long tasks
     * @param {Function} callback - Callback for long tasks
     */
    observeLongTasks(callback) {
      if (!window.PerformanceObserver) return;

      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            callback(entry);
          });
        });
        observer.observe({ entryTypes: ['longtask'] });
        this.observers.push(observer);
      } catch (e) {
        }
    },

    /**
     * Disconnect all observers
     */
    disconnectObservers() {
      this.observers.forEach(observer => observer.disconnect());
      this.observers = [];
    }
  };

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize all performance optimizations
   */
  const init = () => {
    // Initialize connection-aware loading
    ConnectionAwareLoader.init();

    // Initialize image lazy loading
    ImageLazyLoader.init();

    // Monitor long tasks
    PerformanceMonitor.observeLongTasks((entry) => {
      });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      AnimationFrameManager.cancelAllFrames();
      MemoryMonitor.cleanup();
      PerformanceMonitor.disconnectObservers();
      ImageLazyLoader.destroy();
    });
  }

  // Export to global scope
  window.PerformanceAdvanced = {
    // Animation
    AnimationFrameManager,
    
    // Virtual Scrolling
    VirtualScroll,
    
    // Image Loading
    ImageLazyLoader,
    
    // Utilities
    debounce,
    throttle,
    
    // Memory Management
    MemoryMonitor,
    
    // Storage
    StorageOptimizer,
    
    // Connection
    ConnectionAwareLoader,
    
    // Monitoring
    PerformanceMonitor,
    
    // Initialization
    init
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window);