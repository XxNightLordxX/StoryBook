/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Screenshot UI Module
 * Manages the screenshot capture interface
 * @module screenshot-ui
 */

(function() {
  'use strict';

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Opens the screenshot modal
   */
  const openScreenshotModal = () => {
    const modal = DOMHelpers.safeGetElement('screenshot-modal');
    if (!modal) {
      createScreenshotModal();
    }
    
    DOMHelpers.safeToggleClass('screenshot-modal', 'active', true);
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Closes the screenshot modal
   */
  const closeScreenshotModal = () => {
    const modal = DOMHelpers.safeGetElement('screenshot-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Creates the screenshot modal HTML structure
   */
  const createScreenshotModal = () => {
    const modalHTML = `
      <div id="screenshot-modal" class="modal">
        <div class="modal-content screenshot-content">
          <div class="modal-header">
            <h2>&#128247; Screenshot Capture</h2>
            <button class="close-btn" onclick="ScreenshotUI.closeModal()">&times;</button>
          </div>
          
          <div class="screenshot-options">
            <div class="option-group">
              <label>Capture Type:</label>
              <select id="screenshot-type">
                <option value="chapter">Current Chapter</option>
                <option value="page">Full Page</option>
                <option value="custom">Custom Region</option>
              </select>
            </div>
            
            <div class="option-group">
              <label>Scale:</label>
              <select id="screenshot-scale">
                <option value="0.5">0.5x (Low Quality)</option>
                <option value="1" selected>1x (Standard)</option>
                <option value="2">2x (High Quality)</option>
                <option value="3">3x (Ultra Quality)</option>
              </select>
            </div>
            
            <div class="option-group">
              <label>Background:</label>
              <input type="color" id="screenshot-bg" value="#ffffff">
            </div>
            
            <div class="option-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="screenshot-cors" checked>
                <span>Use CORS</span>
              </label>
            </div>
          </div>
          
          <div class="screenshot-actions">
            <button class="btn btn-primary" onclick="ScreenshotUI.captureScreenshot()">
              &#128247; Capture Screenshot
            </button>
            <button class="btn btn-secondary" onclick="ScreenshotUI.closeModal()">
              Cancel
            </button>
          </div>
          
          <div class="screenshot-preview" id="screenshot-preview" style="display:none;">
            <h3>Preview</h3>
            <div class="preview-container">
              <img id="screenshot-image" src="" alt="Screenshot Preview">
            </div>
            <div class="preview-actions">
              <button class="btn btn-success" onclick="ScreenshotUI.downloadScreenshot()">
                &#128190; Download
              </button>
              <button class="btn btn-info" onclick="ScreenshotUI.copyToClipboard()">
                &#128203; Copy to Clipboard
              </button>
              <button class="btn btn-warning" onclick="ScreenshotUI.attachToSave()">
                &#128190; Attach to Save
              </button>
              <button class="btn btn-danger" onclick="ScreenshotUI.clearPreview()">
                &#128465; Clear
              </button>
            </div>
          </div>
          
          <div class="screenshot-stats" id="screenshot-stats">
            <h3>Cache Statistics</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Cached Screenshots:</span>
                <span class="stat-value" id="cache-count">0</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Size:</span>
                <span class="stat-value" id="cache-size">0 KB</span>
              </div>
            </div>
            <button class="btn btn-sm btn-danger" onclick="ScreenshotUI.clearCache()">
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    updateStats();
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Captures a screenshot
   */
  const captureScreenshot = async () => {
    const type = DOMHelpers.safeGetElement('screenshot-type').value;
    const scale = parseFloat(DOMHelpers.safeGetElement('screenshot-scale').value);
    const backgroundColor = DOMHelpers.safeGetElement('screenshot-bg').value;
    const useCORS = DOMHelpers.safeGetElement('screenshot-cors').checked;

    const options = {
      scale: scale,
      backgroundColor: backgroundColor,
      useCORS: useCORS
    };

    try {
      UINotifications.showNotification('Capturing screenshot...', 'info');

      let screenshot;
      switch (type) {
        case 'chapter':
          const chapterNum = AppStateModule.AppState.currentChapter || 1;
          screenshot = await ScreenshotCapture.captureChapterScreenshot(chapterNum, options);
          break;
        case 'page':
          screenshot = await ScreenshotCapture.capturePageScreenshot(options);
          break;
        case 'custom':
          screenshot = await ScreenshotCapture.capturePageScreenshot(options);
          break;
        default:
          throw new Error('Invalid capture type');
      }

      // Display preview
      displayPreview(screenshot);
      
      UINotifications.showNotification('Screenshot captured successfully!', 'success');
    } catch (error) {
      // Error handled silently: console.error('Error capturing screenshot:', error);
      UINotifications.showNotification('Failed to capture screenshot: ' + error.message, 'error');
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Displays screenshot preview
   * @param {string} dataUrl - Base64 encoded screenshot
   */
  const displayPreview = (dataUrl) => {
    const previewSection = DOMHelpers.safeGetElement('screenshot-preview');
    const imageElement = DOMHelpers.safeGetElement('screenshot-image');
    
    imageElement.src = dataUrl;
    previewSection.style.display = 'block';
    
    // Store current screenshot for actions
    window.currentScreenshot = dataUrl;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Downloads the current screenshot
   */
  const downloadScreenshot = () => {
    if (!window.currentScreenshot) {
      UINotifications.showNotification('No screenshot to download', 'warning');
      return;
    }

    const chapterNum = AppStateModule.AppState.currentChapter || 1;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `story-unending-chapter-${chapterNum}-${timestamp}.png`;

    ScreenshotCapture.downloadScreenshot(window.currentScreenshot, filename);
    UINotifications.showNotification('Screenshot downloaded!', 'success');
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Copies screenshot to clipboard
   */
  const copyToClipboard = async () => {
    if (!window.currentScreenshot) {
      UINotifications.showNotification('No screenshot to copy', 'warning');
      return;
    }

    try {
      // Convert base64 to blob
      const response = await fetch(window.currentScreenshot);
      const blob = await response.blob();
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      UINotifications.showNotification('Screenshot copied to clipboard!', 'success');
    } catch (error) {
      // Error handled silently: console.error('Error copying to clipboard:', error);
      UINotifications.showNotification('Failed to copy to clipboard', 'error');
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Attaches screenshot to save
   */
  const attachToSave = () => {
    if (!window.currentScreenshot) {
      UINotifications.showNotification('No screenshot to attach', 'warning');
      return;
    }

    // Store screenshot for save system
    const chapterNum = AppStateModule.AppState.currentChapter || 1;
    const saveKey = `screenshot_chapter_${chapterNum}`;
    
    try {
      localStorage.setItem(saveKey, window.currentScreenshot);
      UINotifications.showNotification('Screenshot attached to save!', 'success');
    } catch (error) {
      // Error handled silently: console.error('Error attaching screenshot:', error);
      UINotifications.showNotification('Failed to attach screenshot', 'error');
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Clears the preview
   */
  const clearPreview = () => {
    const previewSection = DOMHelpers.safeGetElement('screenshot-preview');
    const imageElement = DOMHelpers.safeGetElement('screenshot-image');
    
    imageElement.src = '';
    previewSection.style.display = 'none';
    window.currentScreenshot = null;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Updates cache statistics
   */
  const updateStats = () => {
    const stats = ScreenshotCapture.getScreenshotStats();
    
    const countElement = DOMHelpers.safeGetElement('cache-count');
    const sizeElement = DOMHelpers.safeGetElement('cache-size');
    
    if (countElement) {
      countElement.textContent = stats.cacheSize;
    }
    
    if (sizeElement) {
      const sizeKB = (stats.totalSize / 1024).toFixed(2);
      sizeElement.textContent = `${sizeKB} KB`;
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Clears screenshot cache
   */
  const clearCache = () => {
    if (confirm('Are you sure you want to clear all cached screenshots?')) {
      ScreenshotCapture.clearCache();
      updateStats();
      UINotifications.showNotification('Screenshot cache cleared', 'success');
    }
  }

  // Create namespace object
  const ScreenshotUI = {
    openModal: openScreenshotModal,
    closeModal: closeScreenshotModal,
    captureScreenshot: captureScreenshot,
    displayPreview: displayPreview,
    downloadScreenshot: downloadScreenshot,
    copyToClipboard: copyToClipboard,
    attachToSave: attachToSave,
    clearPreview: clearPreview,
    updateStats: updateStats,
    clearCache: clearCache
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.ScreenshotUI = ScreenshotUI;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScreenshotUI;
  }

})();