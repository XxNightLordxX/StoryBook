/**
 * Performance Optimization Module
 * Handles lazy loading, caching, and performance monitoring
 * @module performance
 */

(function() {
  'use strict';

  /**
   * Cache storage for frequently accessed data
   */
  const cache = new Map();

  /**
   * Cache configuration
   */
  const CACHE_CONFIG = {
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxSize: 100 // Maximum cache entries
  };

  /**
   * Performance metrics
   */
  const metrics = {
    pageLoadTime: 0,
    chapterLoadTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    lazyLoadedItems: 0
  };

  /**
   * Caches a value with expiration
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  const setCache = (key, value, ttl = CACHE_CONFIG.maxAge) => {
    // Remove oldest entry if cache is full
    if (cache.size >= CACHE_CONFIG.maxSize) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    
    cache.set(key, {
      value: value,
      expires: Date.now() + ttl,
      timestamp: Date.now()
    });
  }

  /**
   * Gets a value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or null if not found/expired
   */
  const getCache = (key) => {
    const entry = cache.get(key);
    
    if (!entry) {
      metrics.cacheMisses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expires) {
      cache.delete(key);
      metrics.cacheMisses++;
      return null;
    }
    
    metrics.cacheHits++;
    return entry.value;
  }

  /**
   * Clears the cache
   */
  const clearCache = () => {
    cache.clear();
  }

  /**
   * Gets cache statistics
   * @returns {Object} Cache statistics
   */
  const getCacheStats = () => {
    const totalRequests = metrics.cacheHits + metrics.cacheMisses;
    const hitRate = totalRequests > 0 ? (metrics.cacheHits / totalRequests * 100).toFixed(2) : 0;
    
    return {
      size: cache.size,
      maxSize: CACHE_CONFIG.maxSize,
      hits: metrics.cacheHits,
      misses: metrics.cacheMisses,
      hitRate: `${hitRate}%`
    };
  }

  /**
   * Lazy loads an element
   * @param {string} selector - Element selector
   * @param {Function} callback - Callback when element is visible
   */
  const lazyLoadElement = (selector, callback) => {
    const element = document.querySelector(selector);
    if (!element) return;
    
    // Check if already visible
    if (isElementInViewport(element)) {
      callback();
      metrics.lazyLoadedItems++;
      return;
    }
    
    // Set up intersection observer (with feature detection for older browsers)
    if (typeof IntersectionObserver === 'undefined') {
      callback();
      metrics.lazyLoadedItems++;
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
          metrics.lazyLoadedItems++;
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    observer.observe(element);
  }

  /**
   * Checks if element is in viewport
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} True if in viewport
   */
  const isElementInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Debounces a function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  const debounce = (func, wait = 300) => {
    let timeout;
    return (...args) => {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttles a function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  const throttle = (func, limit = 300) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Measures performance of a function
   * @param {Function} func - Function to measure
   * @param {string} label - Performance label
   * @returns {*} Function result
   */
  const measurePerformance = (func, label = 'Function') => {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    const duration = end - start;
    
    // Performance: ${label} took ${duration.toFixed(2)}ms
    return result;
  }

  /**
   * Optimizes DOM updates by batching
   * @param {Function} updateFn - Update function
   */
  const batchDOMUpdates = (updateFn) => {
    // Use requestAnimationFrame for optimal timing
    requestAnimationFrame(() => {
      updateFn();
    });
  }

  /**
   * Preloads a resource
   * @param {string} url - Resource URL
   * @param {string} type - Resource type ('image', 'script', 'style')
   */
  const preloadResource = (url, type = 'image') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'image':
        link.as = 'image';
        break;
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
      default:
        link.as = type;
    }
    
    document.head.appendChild(link);
  }

  /**
   * Gets performance metrics
   * @returns {Object} Performance metrics
   */
  const getPerformanceMetrics = () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    
    return {
      pageLoadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
      firstPaint: (performance.getEntriesByName('first-paint')[0] && performance.getEntriesByName('first-paint')[0].startTime) || 0,
      firstContentfulPaint: (performance.getEntriesByName('first-contentful-paint')[0] && performance.getEntriesByName('first-contentful-paint')[0].startTime) || 0,
      cacheStats: getCacheStats(),
      lazyLoadedItems: metrics.lazyLoadedItems
    };
  }

  /**
   * Initializes performance monitoring
   */
  const initializePerformanceMonitoring = () => {
    // Record page load time
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      }
    });
    
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Long task detected - silently tracked
        });
      });
      
      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task monitoring not supported
      }
    }
  }

  /**
   * Optimizes chapter loading with caching
   * @param {number} chapterNum - Chapter number
   * @returns {Object|null} Chapter content
   */
  const loadChapterOptimized = (chapterNum) => {
    const cacheKey = `chapter_${chapterNum}`;
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Load from storage
    const start = performance.now();
    const chapter = Storage.getChapterContent(chapterNum);
    const end = performance.now();
    
    metrics.chapterLoadTime = end - start;
    
    // Cache the result
    if (chapter) {
      setCache(cacheKey, chapter);
    }
    
    return chapter;
  }

  /**
   * Clears old cache entries
   */
  const cleanupCache = () => {
    const now = Date.now();
    const keysToDelete = [];
    
    cache.forEach((entry, key) => {
      if (now > entry.expires) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => cache.delete(key));
  }

  /**
   * Sets up periodic cache cleanup
   */
  const setupCacheCleanup = () => {
    // Clean up every 10 minutes
    const cacheCleanupInterval = setInterval(cleanupCache, 10 * 60 * 1000);
  }

  // Create namespace object
  const Performance = {
    setCache: setCache,
    getCache: getCache,
    clearCache: clearCache,
    getCacheStats: getCacheStats,
    lazyLoadElement: lazyLoadElement,
    isElementInViewport: isElementInViewport,
    debounce: debounce,
    throttle: throttle,
    measurePerformance: measurePerformance,
    batchDOMUpdates: batchDOMUpdates,
    preloadResource: preloadResource,
    getPerformanceMetrics: getPerformanceMetrics,
    initializePerformanceMonitoring: initializePerformanceMonitoring,
    loadChapterOptimized: loadChapterOptimized,
    cleanupCache: cleanupCache,
    setupCacheCleanup: setupCacheCleanup
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.Performance = Performance;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Performance;
  }

})();