/**
 * Social Sharing Module
 * Provides social media sharing functionality using Web Share API
 * @module social-sharing
 */

(function() {
  'use strict';

  /**
   * Storage key for share history
   */
  const SHARE_HISTORY_KEY = 'ese_shareHistory';

  /**
   * Maximum history size
   */
  const MAX_HISTORY_SIZE = 50;

  /**
   * Share history
   */
  let shareHistory = [];

  /**
   * Initializes the sharing system
   */
  const init = () => {
    loadHistory();
  }

  /**
   * Loads share history from localStorage
   */
  const loadHistory = () => {
    try {
      const history = Storage.getShareHistory();
      if (history && history.length > 0) {
        shareHistory = history;
      }
    } catch (error) {
      // Error handled silently: console.error('Error loading share history:', error);
      shareHistory = [];
    }
  }

  /**
   * Saves share history to localStorage
   */
  const saveHistory = () => {
    try {
      // Limit history size
      if (shareHistory.length > MAX_HISTORY_SIZE) {
        shareHistory = shareHistory.slice(0, MAX_HISTORY_SIZE);
      }
      
      Storage.setShareHistory(shareHistory);
    } catch (error) {
      // Error handled silently: console.error('Error saving share history:', error);
    }
  }

  /**
   * Checks if Web Share API is supported
   * @returns {boolean} True if supported
   */
  const isSupported = () => {
    return typeof navigator !== 'undefined' && navigator.share !== undefined;
  }

  /**
   * Checks if sharing specific data is supported
   * @param {Object} data - Data to share
   * @returns {boolean} True if supported
   */
  const canShare = (data) => {
    if (!isSupported()) {
      return false;
    }
    
    if (typeof navigator.canShare !== 'undefined') {
      return navigator.canShare(data);
    }
    
    return true;
  }

  /**
   * Shares text content
   * @param {string} text - Text to share
   * @param {string} title - Share title
   * @returns {Promise<boolean>} True if shared successfully
   */
  const shareText = async (text, title = 'Share Text') => {
    if (!isSupported()) {
      throw new Error('Web Share API not supported');
    }

    const shareData = {
      title: title,
      text: text
    };

    if (!canShare(shareData)) {
      throw new Error('Cannot share this data');
    }

    try {
      await navigator.share(shareData);
      addToHistory('text', { text, title });
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Error handled silently: console.error('Error sharing text:', error);
        throw error;
      }
      return false;
    }
  }

  /**
   * Shares a link
   * @param {string} url - URL to share
   * @param {string} title - Share title
   * @param {string} text - Share text
   * @returns {Promise<boolean>} True if shared successfully
   */
  const shareLink = async (url, title = 'Share Link', text = '') => {
    if (!isSupported()) {
      throw new Error('Web Share API not supported');
    }

    const shareData = {
      title: title,
      url: url
    };

    if (text) {
      shareData.text = text;
    }

    if (!canShare(shareData)) {
      throw new Error('Cannot share this data');
    }

    try {
      await navigator.share(shareData);
      addToHistory('link', { url, title, text });
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Error handled silently: console.error('Error sharing link:', error);
        throw error;
      }
      return false;
    }
  }

  /**
   * Shares a chapter
   * @param {number} chapterNum - Chapter number
   * @param {string} chapterTitle - Chapter title
   * @returns {Promise<boolean>} True if shared successfully
   */
  const shareChapter = async (chapterNum, chapterTitle = '') => {
    const url = window.location.href.split('#')[0] + `#chapter-${chapterNum}`;
    const title = chapterTitle || `Chapter ${chapterNum}`;
    const text = `Check out Chapter ${chapterNum} of Story-Unending!`;

    return await shareLink(url, title, text);
  }

  /**
   * Shares an achievement
   * @param {string} achievementName - Achievement name
   * @param {string} description - Achievement description
   * @returns {Promise<boolean>} True if shared successfully
   */
  const shareAchievement = async (achievementName, description = '') => {
    const text = `I just unlocked the "${achievementName}" achievement in Story-Unending! ${description}`;
    const title = 'Achievement Unlocked!';

    return await shareText(text, title);
  }

  /**
   * Shares a save state
   * @param {string} saveName - Save name
   * @param {number} chapterNum - Current chapter
   * @returns {Promise<boolean>} True if shared successfully
   */
  const shareSave = async (saveName, chapterNum) => {
    const text = `I'm reading Story-Unending and reached Chapter ${chapterNum}! Save: ${saveName}`;
    const title = 'My Progress';

    return await shareText(text, title);
  }

  /**
   * Shares with custom data
   * @param {Object} data - Share data
   * @param {string} data.title - Share title
   * @param {string} data.text - Share text
   * @param {string} data.url - Share URL
   * @returns {Promise<boolean>} True if shared successfully
   */
  const shareCustom = async (data) => {
    if (!isSupported()) {
      throw new Error('Web Share API not supported');
    }

    if (!canShare(data)) {
      throw new Error('Cannot share this data');
    }

    try {
      await navigator.share(data);
      addToHistory('custom', data);
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Error handled silently: console.error('Error sharing custom data:', error);
        throw error;
      }
      return false;
    }
  }

  /**
   * Shares to a specific platform (fallback for unsupported browsers)
   * @param {string} platform - Platform name (twitter, facebook, linkedin, email)
   * @param {Object} data - Share data
   * @returns {boolean} True if opened successfully
   */
  const shareToPlatform = (platform, data) => {
    const { title, text, url } = data;
    const encodedTitle = encodeURIComponent(title);
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url || window.location.href);

    let shareUrl;

    switch (platform.toLowerCase()) {
      case 'twitter':
      case 'x':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%0A${encodedUrl}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    addToHistory('platform', { platform, data });
    return true;
  }

  /**
   * Copies link to clipboard
   * @param {string} url - URL to copy
   * @returns {Promise<boolean>} True if copied successfully
   */
  const copyLink = async (url = window.location.href) => {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      // Error handled silently: console.error('Error copying link:', error);
      throw error;
    }
  }

  /**
   * Adds share to history
   * @param {string} type - Share type
   * @param {Object} data - Share data
   */
  const addToHistory = (type, data) => {
    shareHistory.unshift({
      type: type,
      data: data,
      timestamp: Date.now()
    });

    // Limit history size
    if (shareHistory.length > MAX_HISTORY_SIZE) {
      shareHistory = shareHistory.slice(0, MAX_HISTORY_SIZE);
    }

    saveHistory();
  }

  /**
   * Gets share history
   * @param {number} limit - Maximum number of history items
   * @returns {Array} Share history
   */
  const getHistory = (limit = 10) => {
    return shareHistory.slice(0, limit);
  }

  /**
   * Clears share history
   */
  const clearHistory = () => {
    shareHistory = [];
    Storage.clearShareHistory();
  }

  /**
   * Gets share statistics
   * @returns {Object} Share statistics
   */
  const getShareStats = () => {
    const stats = {
      totalShares: shareHistory.length,
      byType: {},
      byPlatform: {}
    };

    shareHistory.forEach(share => {
      // Count by type
      stats.byType[share.type] = (stats.byType[share.type] || 0) + 1;

      // Count by platform
      if (share.data.platform) {
        stats.byPlatform[share.data.platform] = (stats.byPlatform[share.data.platform] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Generates share text for current chapter
   * @returns {string} Share text
   */
  const generateChapterShareText = () => {
    const chapterNum = AppStateModule.AppState.currentChapter || 1;
    const chapterContent = Storage.getChapterContent(chapterNum);
    const title = chapterContent ? chapterContent.title : `Chapter ${chapterNum}`;
    
    return `I'm reading "${title}" in Story-Unending! Check it out: ${window.location.href}#chapter-${chapterNum}`;
  }

  /**
   * Generates share text for achievement
   * @param {string} achievementName - Achievement name
   * @returns {string} Share text
   */
  const generateAchievementShareText = (achievementName) => {
    return `🏆 Achievement Unlocked: "${achievementName}" in Story-Unending! Can you unlock them all?`;
  }

  // Initialize on load
  init();

  // Create namespace object
  const SocialSharing = {
    init: init,
    isSupported: isSupported,
    canShare: canShare,
    shareText: shareText,
    shareLink: shareLink,
    shareChapter: shareChapter,
    shareAchievement: shareAchievement,
    shareSave: shareSave,
    shareCustom: shareCustom,
    shareToPlatform: shareToPlatform,
    copyLink: copyLink,
    getHistory: getHistory,
    clearHistory: clearHistory,
    getShareStats: getShareStats,
    generateChapterShareText: generateChapterShareText,
    generateAchievementShareText: generateAchievementShareText
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.SocialSharing = SocialSharing;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SocialSharing;
  }

})();