/**
 * Bookmarking System Module
 * Manages chapter bookmarks and notes
 * @module bookmarks
 */

(function() {
  'use strict';

  /**
   * Bookmark structure
   * @typedef {Object} Bookmark
   * @property {string} id - Unique bookmark identifier
   * @property {number} chapterNum - Chapter number
   * @property {string} chapterTitle - Chapter title
   * @property {string} note - User's note about the bookmark
   * @property {Date} createdAt - When the bookmark was created
   * @property {string} excerpt - Short excerpt from chapter (optional)
   */

  /**
   * Storage key for bookmarks
   */
  const BOOKMARKS_KEY = 'ese_bookmarks';

  /**
   * Gets all bookmarks from localStorage
   * @returns {Array<Bookmark>} Array of bookmarks
   */
  const getBookmarks = () => {
    return ErrorHandler.safeExecute(() => {
      const bookmarks = JSON.parse(Storage.getItem(BOOKMARKS_KEY, []) || '[]');
      return bookmarks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, 'Loading bookmarks', []);
  }

  /**
   * Saves bookmarks to localStorage
   * @param {Array<Bookmark>} bookmarks - Array of bookmarks
   */
  const saveBookmarks = (bookmarks) => {
    ErrorHandler.safeExecute(() => {
      Storage.setItem(BOOKMARKS_KEY, bookmarks);
    }, 'Saving bookmarks');
  }

  /**
   * Creates a new bookmark
   * @param {number} chapterNum - Chapter number to bookmark
   * @param {string} note - Optional note for the bookmark
   * @returns {Bookmark|null} Created bookmark or null if failed
   */
  const createBookmark = (chapterNum, note = '') => {
    try {
      // Check if bookmark already exists for this chapter
      const bookmarks = getBookmarks();
      const existingIndex = bookmarks.findIndex(b => b.chapterNum === chapterNum);
      
      // Get chapter content
      const chapterContent = Storage.getChapterContent(chapterNum);
      const chapterTitle = chapterContent ? chapterContent.title : `Chapter ${chapterNum}`;
      
      // Create excerpt (first 200 characters)
      const excerpt = chapterContent && chapterContent.content 
        ? chapterContent.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
        : '';
      
      const bookmark = {
        id: generateBookmarkId(),
        chapterNum: chapterNum,
        chapterTitle: chapterTitle,
        note: sanitizeHTML(note),
        createdAt: new Date().toISOString(),
        excerpt: excerpt
      };
      
      if (existingIndex !== -1) {
        // Update existing bookmark
        bookmarks[existingIndex] = bookmark;
      } else {
        // Add new bookmark
        bookmarks.push(bookmark);
      }
      
      saveBookmarks(bookmarks);
      return bookmark;
    } catch (error) {
      // Error handled silently: console.error('Error creating bookmark:', error);
      return null;
    }
  }

  /**
   * Generates a unique bookmark ID
   * @returns {string} Unique ID
   */
  const generateBookmarkId = () => {
    return 'bookmark_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Gets a specific bookmark by ID
   * @param {string} bookmarkId - Bookmark ID
   * @returns {Bookmark|null} Bookmark or null if not found
   */
  const getBookmark = (bookmarkId) => {
    const bookmarks = getBookmarks();
    return bookmarks.find(b => b.id === bookmarkId) || null;
  }

  /**
   * Gets a bookmark by chapter number
   * @param {number} chapterNum - Chapter number
   * @returns {Bookmark|null} Bookmark or null if not found
   */
  const getBookmarkByChapter = (chapterNum) => {
    const bookmarks = getBookmarks();
    return bookmarks.find(b => b.chapterNum === chapterNum) || null;
  }

  /**
   * Updates a bookmark's note
   * @param {string} bookmarkId - Bookmark ID
   * @param {string} note - New note content
   * @returns {boolean} True if successful
   */
  const updateBookmarkNote = (bookmarkId, note) => {
    try {
      const bookmarks = getBookmarks();
      const bookmark = bookmarks.find(b => b.id === bookmarkId);
      
      if (!bookmark) {
        // Error logged: console.error(`Bookmark ${bookmarkId} not found`);
        return false;
      }
      
      bookmark.note = sanitizeHTML(note);
      saveBookmarks(bookmarks);
      return true;
    } catch (error) {
      // Error handled silently: console.error('Error updating bookmark note:', error);
      return false;
    }
  }

  /**
   * Deletes a bookmark
   * @param {string} bookmarkId - Bookmark ID
   * @returns {boolean} True if successful
   */
  const deleteBookmark = (bookmarkId) => {
    try {
      const bookmarks = getBookmarks();
      const filteredBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
      
      if (filteredBookmarks.length === bookmarks.length) {
        // Error logged: console.error(`Bookmark ${bookmarkId} not found`);
        return false;
      }
      
      saveBookmarks(filteredBookmarks);
      return true;
    } catch (error) {
      // Error handled silently: console.error('Error deleting bookmark:', error);
      return false;
    }
  }

  /**
   * Checks if a chapter is bookmarked
   * @param {number} chapterNum - Chapter number
   * @returns {boolean} True if bookmarked
   */
  const isChapterBookmarked = (chapterNum) => {
    return getBookmarkByChapter(chapterNum) !== null;
  }

  /**
   * Gets the total number of bookmarks
   * @returns {number} Number of bookmarks
   */
  const getBookmarkCount = () => {
    return getBookmarks().length;
  }

  /**
   * Clears all bookmarks
   * @returns {boolean} True if successful
   */
  const clearAllBookmarks = () => {
    try {
      Storage.removeItem(BOOKMARKS_KEY);
      return true;
    } catch (error) {
      // Error handled silently: console.error('Error clearing bookmarks:', error);
      return false;
    }
  }

  /**
   * Exports bookmarks as JSON
   * @returns {string|null} JSON string or null if failed
   */
  const exportBookmarks = () => {
    try {
      const bookmarks = getBookmarks();
      return JSON.stringify(bookmarks, null, 2);
    } catch (error) {
      // Error handled silently: console.error('Error exporting bookmarks:', error);
      return null;
    }
  }

  /**
   * Imports bookmarks from JSON
   * @param {string} jsonData - JSON string to import
   * @returns {boolean} True if successful
   */
  const importBookmarks = (jsonData) => {
    try {
      const importedBookmarks = JSON.parse(jsonData);
      
      // Validate bookmark structure
      if (!Array.isArray(importedBookmarks)) {
        throw new Error('Invalid bookmark data format');
      }
      
      // Merge with existing bookmarks
      const existingBookmarks = getBookmarks();
      const mergedBookmarks = [...existingBookmarks];
      
      importedBookmarks.forEach(imported => {
        // Check if bookmark already exists
        const existingIndex = mergedBookmarks.findIndex(b => b.chapterNum === imported.chapterNum);
        
        if (existingIndex !== -1) {
          // Update existing
          mergedBookmarks[existingIndex] = imported;
        } else {
          // Add new
          mergedBookmarks.push(imported);
        }
      });
      
      saveBookmarks(mergedBookmarks);
      return true;
    } catch (error) {
      // Error handled silently: console.error('Error importing bookmarks:', error);
      return false;
    }
  }

  /**
   * Searches bookmarks by text
   * @param {string} query - Search query
   * @returns {Array<Bookmark>} Matching bookmarks
   */
  const searchBookmarks = (query) => {
    const bookmarks = getBookmarks();
    const lowerQuery = query.toLowerCase();
    
    return bookmarks.filter(b => 
      b.chapterTitle.toLowerCase().includes(lowerQuery) ||
      b.note.toLowerCase().includes(lowerQuery) ||
      b.excerpt.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Gets bookmarks sorted by chapter number
   * @returns {Array<Bookmark>} Sorted bookmarks
   */
  const getBookmarksByChapter = () => {
    const bookmarks = getBookmarks();
    return bookmarks.sort((a, b) => a.chapterNum - b.chapterNum);
  }

  // Create namespace object
  const Bookmarks = {
    getBookmarks: getBookmarks,
    createBookmark: createBookmark,
    getBookmark: getBookmark,
    getBookmarkByChapter: getBookmarkByChapter,
    updateBookmarkNote: updateBookmarkNote,
    deleteBookmark: deleteBookmark,
    isChapterBookmarked: isChapterBookmarked,
    getBookmarkCount: getBookmarkCount,
    clearAllBookmarks: clearAllBookmarks,
    exportBookmarks: exportBookmarks,
    importBookmarks: importBookmarks,
    searchBookmarks: searchBookmarks,
    getBookmarksByChapter: getBookmarksByChapter
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.Bookmarks = Bookmarks;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Bookmarks;
  }

})();