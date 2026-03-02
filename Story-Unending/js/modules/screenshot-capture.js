/**
 * Screenshot Capture Module
 * Captures screenshots of the application for save previews
 * @module screenshot-capture
 */

(function() {
  'use strict';

  // html2canvas will be loaded from CDN
  let html2canvas = null;

  /**
   * Storage key for screenshot cache
   */
  const SCREENSHOT_CACHE_KEY = 'ese_screenshotCache';

  /**
   * Maximum cache size
   */
  const MAX_CACHE_SIZE = 20;

  /**
   * Screenshot cache
   */
  let screenshotCache = {};

  /**
   * Initializes html2canvas library
   */
  const initHtml2Canvas = () => {
    if (typeof html2canvas !== 'undefined') {
      return true;
    }
    
    // Check if html2canvas is available from CDN
    if (window.html2canvas) {
      html2canvas = window.html2canvas;
      return true;
    }
    
    return false;
  }

  /**
   * Loads screenshot cache from localStorage
   */
  const loadCache = () => {
    try {
      const cached = Storage.getItem(SCREENSHOT_CACHE_KEY);
      if (cached) {
        screenshotCache = JSON.parse(cached);
      }
    } catch (error) {
      // Error handled silently: console.error('Error loading screenshot cache:', error);
      screenshotCache = {};
    }
  }

  /**
   * Saves screenshot cache to localStorage
   */
  const saveCache = () => {
    try {
      // Limit cache size
      const keys = Object.keys(screenshotCache);
      if (keys.length > MAX_CACHE_SIZE) {
        // Remove oldest entries
        keys.sort((a, b) => screenshotCache[a].timestamp - screenshotCache[b].timestamp);
        const toRemove = keys.slice(0, keys.length - MAX_CACHE_SIZE);
        toRemove.forEach(key => delete screenshotCache[key]);
      }
      
      Storage.setItem(SCREENSHOT_CACHE_KEY, screenshotCache);
    } catch (error) {
      // Error handled silently: console.error('Error saving screenshot cache:', error);
    }
  }

  /**
   * Captures a screenshot of an element
   * @param {string|HTMLElement} element - Element or selector to capture
   * @param {Object} options - Capture options
   * @param {number} options.scale - Scale factor (default: 1)
   * @param {boolean} options.useCORS - Use CORS for cross-origin images
   * @param {boolean} options.allowTaint - Allow tainted canvas
   * @param {number} options.backgroundColor - Background color
   * @returns {Promise<string>} Base64 encoded screenshot
   */
  const captureScreenshot = async (element, options = {}) => {
    if (!initHtml2Canvas()) {
      throw new Error('html2canvas not loaded');
    }

    const {
      scale = 1,
      useCORS = true,
      allowTaint = false,
      backgroundColor = '#ffffff'
    } = options;

    // Get element
    let targetElement;
    if (typeof element === 'string') {
      targetElement = document.querySelector(element);
    } else {
      targetElement = element;
    }

    if (!targetElement) {
      throw new Error('Element not found');
    }

    try {
      // Capture screenshot
      const canvas = await html2canvas(targetElement, {
        scale: scale,
        useCORS: useCORS,
        allowTaint: allowTaint,
        backgroundColor: backgroundColor,
        logging: false,
        removeContainer: true
      });

      // Convert to base64
      const dataUrl = canvas.toDataURL('image/png');
      
      return dataUrl;
    } catch (error) {
      // Error handled silently: console.error('Error capturing screenshot:', error);
      throw error;
    }
  }

  /**
   * Captures a screenshot of the current chapter
   * @param {number} chapterNum - Chapter number
   * @param {Object} options - Capture options
   * @returns {Promise<string>} Base64 encoded screenshot
   */
  const captureChapterScreenshot = async (chapterNum, options = {}) => {
    const chapterElement = document.querySelector('.chapter-content');
    
    if (!chapterElement) {
      throw new Error('Chapter content element not found');
    }

    const screenshot = await captureScreenshot(chapterElement, options);
    
    // Cache the screenshot
    cacheScreenshot(chapterNum, screenshot);
    
    return screenshot;
  }

  /**
   * Captures a screenshot of the entire page
   * @param {Object} options - Capture options
   * @returns {Promise<string>} Base64 encoded screenshot
   */
  const capturePageScreenshot = async (options = {}) => {
    const bodyElement = document.body;
    
    if (!bodyElement) {
      throw new Error('Body element not found');
    }

    return await captureScreenshot(bodyElement, options);
  }

  /**
   * Captures a screenshot of a specific region
   * @param {string|HTMLElement} element - Element or selector
   * @param {Object} region - Region to capture
   * @param {number} region.x - X coordinate
   * @param {number} region.y - Y coordinate
   * @param {number} region.width - Width
   * @param {number} region.height - Height
   * @param {Object} options - Capture options
   * @returns {Promise<string>} Base64 encoded screenshot
   */
  const captureRegionScreenshot = async (element, region, options = {}) => {
    const fullScreenshot = await captureScreenshot(element, options);
    
    // Create image from full screenshot
    const img = new Image();
    img.src = fullScreenshot;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    
    // Create canvas for region
    const canvas = document.createElement('canvas');
    canvas.width = region.width;
    canvas.height = region.height;
    const ctx = canvas.getContext('2d');
    
    // Draw region
    ctx.drawImage(
      img,
      region.x, region.y, region.width, region.height,
      0, 0, region.width, region.height
    );
    
    return canvas.toDataURL('image/png');
  }

  /**
   * Caches a screenshot
   * @param {string} key - Cache key
   * @param {string} screenshot - Base64 encoded screenshot
   */
  const cacheScreenshot = (key, screenshot) => {
    screenshotCache[key] = {
      data: screenshot,
      timestamp: Date.now()
    };
    saveCache();
  }

  /**
   * Gets a cached screenshot
   * @param {string} key - Cache key
   * @returns {string|null} Cached screenshot or null
   */
  const getCachedScreenshot = (key) => {
    if (screenshotCache[key]) {
      return screenshotCache[key].data;
    }
    return null;
  }

  /**
   * Removes a cached screenshot
   * @param {string} key - Cache key
   */
  const removeCachedScreenshot = (key) => {
    delete screenshotCache[key];
    saveCache();
  }

  /**
   * Clears all cached screenshots
   */
  const clearCache = () => {
    screenshotCache = {};
    Storage.removeItem(SCREENSHOT_CACHE_KEY);
  }

  /**
   * Downloads a screenshot
   * @param {string} dataUrl - Base64 encoded screenshot
   * @param {string} filename - Filename for download
   */
  const downloadScreenshot = (dataUrl, filename = 'screenshot.png') => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }

  /**
   * Creates a thumbnail from a screenshot
   * @param {string} dataUrl - Base64 encoded screenshot
   * @param {number} maxWidth - Maximum width
   * @param {number} maxHeight - Maximum height
   * @returns {Promise<string>} Base64 encoded thumbnail
   */
  const createThumbnail = async (dataUrl, maxWidth = 200, maxHeight = 200) => {
    const img = new Image();
    img.src = dataUrl;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    
    // Calculate dimensions
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth) {
      height = (maxWidth / width) * height;
      width = maxWidth;
    }
    
    if (height > maxHeight) {
      width = (maxHeight / height) * width;
      height = maxHeight;
    }
    
    // Create canvas for thumbnail
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Draw thumbnail
    ctx.drawImage(img, 0, 0, width, height);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }

  /**
   * Gets screenshot statistics
   * @returns {Object} Screenshot statistics
   */
  const getScreenshotStats = () => {
    return {
      cacheSize: Object.keys(screenshotCache).length,
      maxCacheSize: MAX_CACHE_SIZE,
      totalSize: calculateTotalCacheSize()
    };
  }

  /**
   * Calculates total cache size in bytes
   * @returns {number} Total cache size
   */
  const calculateTotalCacheSize = () => {
    let totalSize = 0;
    for (const key in screenshotCache) {
      totalSize += screenshotCache[key].data.length;
    }
    return totalSize;
  }

  /**
   * Optimizes screenshot cache by removing old entries
   */
  const optimizeCache = () => {
    const keys = Object.keys(screenshotCache);
    if (keys.length > MAX_CACHE_SIZE) {
      keys.sort((a, b) => screenshotCache[a].timestamp - screenshotCache[b].timestamp);
      const toRemove = keys.slice(0, keys.length - MAX_CACHE_SIZE);
      toRemove.forEach(key => delete screenshotCache[key]);
      saveCache();
    }
  }

  /**
   * Captures a screenshot with preview
   * @param {string|HTMLElement} element - Element or selector
   * @param {Object} options - Capture options
   * @returns {Promise<Object>} Screenshot with preview
   */
  const captureWithPreview = async (element, options = {}) => {
    const screenshot = await captureScreenshot(element, options);
    const thumbnail = await createThumbnail(screenshot);
    
    return {
      screenshot: screenshot,
      thumbnail: thumbnail,
      timestamp: Date.now()
    };
  }

  // Initialize on load
  loadCache();

  // Create namespace object
  const ScreenshotCapture = {
    initHtml2Canvas: initHtml2Canvas,
    captureScreenshot: captureScreenshot,
    captureChapterScreenshot: captureChapterScreenshot,
    capturePageScreenshot: capturePageScreenshot,
    captureRegionScreenshot: captureRegionScreenshot,
    cacheScreenshot: cacheScreenshot,
    getCachedScreenshot: getCachedScreenshot,
    removeCachedScreenshot: removeCachedScreenshot,
    clearCache: clearCache,
    downloadScreenshot: downloadScreenshot,
    createThumbnail: createThumbnail,
    getScreenshotStats: getScreenshotStats,
    optimizeCache: optimizeCache,
    captureWithPreview: captureWithPreview
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.ScreenshotCapture = ScreenshotCapture;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScreenshotCapture;
  }

})();