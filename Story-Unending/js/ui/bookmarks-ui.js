/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Bookmarks UI Module
 * Manages the bookmarks interface
 * @module bookmarks-ui
 */

(function() {
  'use strict';

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Opens the bookmarks modal
   */
  const openBookmarksModal = () => {
    const modal = DOMHelpers.safeGetElement('bookmarks-modal');
    if (!modal) {
      createBookmarksModal();
    }
    
    refreshBookmarksList();
    DOMHelpers.safeToggleClass('bookmarks-modal', 'active', true);
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Closes the bookmarks modal
   */
  const closeBookmarksModal = () => {
    const modal = DOMHelpers.safeGetElement('bookmarks-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Creates the bookmarks modal HTML structure
   */
  const createBookmarksModal = () => {
    const modalHTML = `
      <div id="bookmarks-modal" class="modal">
        <div class="modal-content bookmarks-content">
          <div class="modal-header">
            <h2>📚 Bookmarks</h2>
            <button class="close-btn" onclick="BookmarksUI.closeModal()">&times;</button>
          </div>
          
          <div class="bookmarks-toolbar">
            <div class="search-box">
              <input type="text" id="bookmark-search" placeholder="Search bookmarks..." 
                     oninput="BookmarksUI.searchBookmarks(this.value)">
              <span class="search-icon">🔍</span>
            </div>
            <div class="sort-options">
              <select id="bookmark-sort" onchange="BookmarksUI.sortBookmarks(this.value)">
                <option value="date">Sort by Date</option>
                <option value="chapter">Sort by Chapter</option>
              </select>
            </div>
            <div class="bookmark-actions">
              <button class="btn btn-secondary" onclick="BookmarksUI.exportBookmarks()">Export</button>
              <button class="btn btn-danger" onclick="BookmarksUI.clearAllBookmarks()">Clear All</button>
            </div>
          </div>
          
          <div class="bookmarks-list" id="bookmarks-list">
            <!-- Bookmarks will be rendered here -->
          </div>
          
          <div class="bookmarks-empty" id="bookmarks-empty" style="display:none;">
            <div class="empty-icon">📚</div>
            <p>No bookmarks yet</p>
            <p class="empty-hint">Click the bookmark icon on any chapter to save it</p>
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
   * Refreshes the bookmarks list display
   */
  const refreshBookmarksList = () => {
    const bookmarks = Bookmarks.getBookmarks();
    const listContainer = DOMHelpers.safeGetElement('bookmarks-list');
    const emptyContainer = DOMHelpers.safeGetElement('bookmarks-empty');
    
    if (!listContainer) return;
    
    if (bookmarks.length === 0) {
      listContainer.style.display = 'none';
      emptyContainer.style.display = 'block';
      return;
    }
    
    listContainer.style.display = 'block';
    emptyContainer.style.display = 'none';
    
    let html = '';
    bookmarks.forEach(bookmark => {
      html += renderBookmarkItem(bookmark);
    });
    
    listContainer.innerHTML = html;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Renders a single bookmark item
   * @param {Object} bookmark - Bookmark object
   * @returns {string} HTML string
   */
  const renderBookmarkItem = (bookmark) => {
    const isBookmarked = Bookmarks.isChapterBookmarked(bookmark.chapterNum);
    const date = formatDate(bookmark.createdAt);
    
    return `
      <div class="bookmark-item" data-bookmark-id="${bookmark.id}">
        <div class="bookmark-header">
          <div class="bookmark-chapter">
            <span class="chapter-number">Chapter ${bookmark.chapterNum}</span>
            <span class="chapter-title">${sanitizeHTML(bookmark.chapterTitle)}</span>
          </div>
          <div class="bookmark-date">${date}</div>
        </div>
        
        ${bookmark.excerpt ? `
          <div class="bookmark-excerpt">
            "${sanitizeHTML(bookmark.excerpt)}"
          </div>
        ` : ''}
        
        ${bookmark.note ? `
          <div class="bookmark-note">
            <strong>Note:</strong> ${sanitizeHTML(bookmark.note)}
          </div>
        ` : `
          <div class="bookmark-note-placeholder" onclick="BookmarksUI.editNote('${bookmark.id}')">
            <span class="add-note-icon">✏️</span> Add a note...
          </div>
        `}
        
        <div class="bookmark-actions">
          <button class="btn btn-primary btn-sm" onclick="BookmarksUI.goToChapter(${bookmark.chapterNum})">
            📖 Read
          </button>
          <button class="btn btn-secondary btn-sm" onclick="BookmarksUI.editNote('${bookmark.id}')">
            ✏️ Edit Note
          </button>
          <button class="btn btn-danger btn-sm" onclick="BookmarksUI.deleteBookmark('${bookmark.id}')">
            🗑️ Delete
          </button>
        </div>
      </div>
    `;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Formats a date string for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    
    // Less than 1 day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    
    // Less than 1 week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
    
    // Otherwise show full date
    return date.toLocaleDateString();
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Toggles bookmark for current chapter
   */
  const toggleBookmark = async () => {
    const currentChapter = AppStateModule.AppState.currentChapter;
    const isBookmarked = Bookmarks.isChapterBookmarked(currentChapter);
    
    if (isBookmarked) {
      // Remove bookmark
      const bookmark = Bookmarks.getBookmarkByChapter(currentChapter);
      if (bookmark) {
        Bookmarks.deleteBookmark(bookmark.id);
        UINotifications.showNotification('Bookmark removed', 'success');
      }
    } else {
      // Add bookmark
      const note = await PromptModal.show('Add a note for this bookmark (optional):', '', 'Input');
      if (note !== null) {
        const bookmark = Bookmarks.createBookmark(currentChapter, note);
        if (bookmark) {
          UINotifications.showNotification('Bookmark added', 'success');
        } else {
          UINotifications.showNotification('Failed to add bookmark', 'error');
        }
      }
    }
    
    updateBookmarkButton();
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Updates the bookmark button state
   */
  const updateBookmarkButton = () => {
    const button = DOMHelpers.safeGetElement('bookmark-btn');
    if (!button) return;
    
    const currentChapter = AppStateModule.AppState.currentChapter;
    const isBookmarked = Bookmarks.isChapterBookmarked(currentChapter);
    
    if (isBookmarked) {
      button.classList.add('bookmarked');
      button.innerHTML = '🔖 Bookmarked';
    } else {
      button.classList.remove('bookmarked');
      button.innerHTML = '🔖 Bookmark';
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
    closeBookmarksModal();
    Navigation.goToChapter(chapterNum);
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Edits a bookmark's note
   * @param {string} bookmarkId - Bookmark ID
   */
  const editNote = async (bookmarkId) => {
    const bookmark = Bookmarks.getBookmark(bookmarkId);
    if (!bookmark) return;
    
    const newNote = await PromptModal.show('Edit your note:', bookmark.note, 'Edit Note');
    if (newNote !== null) {
      const success = Bookmarks.updateBookmarkNote(bookmarkId, newNote);
      if (success) {
        UINotifications.showNotification('Note updated', 'success');
        refreshBookmarksList();
      } else {
        UINotifications.showNotification('Failed to update note', 'error');
      }
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Deletes a bookmark
   * @param {string} bookmarkId - Bookmark ID
   */
  const deleteBookmark = (bookmarkId) => {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      const success = Bookmarks.deleteBookmark(bookmarkId);
      if (success) {
        UINotifications.showNotification('Bookmark deleted', 'success');
        refreshBookmarksList();
        updateBookmarkButton();
      } else {
        UINotifications.showNotification('Failed to delete bookmark', 'error');
      }
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Searches bookmarks
   * @param {string} query - Search query
   */
  const searchBookmarks = (query) => {
    const listContainer = DOMHelpers.safeGetElement('bookmarks-list');
    const emptyContainer = DOMHelpers.safeGetElement('bookmarks-empty');
    
    if (!query.trim()) {
      refreshBookmarksList();
      return;
    }
    
    const results = Bookmarks.searchBookmarks(query);
    
    if (results.length === 0) {
      listContainer.style.display = 'none';
      emptyContainer.style.display = 'block';
      emptyContainer.querySelector('p').textContent = 'No bookmarks found';
      emptyContainer.querySelector('.empty-hint').textContent = 'Try a different search term';
      return;
    }
    
    listContainer.style.display = 'block';
    emptyContainer.style.display = 'none';
    
    let html = '';
    results.forEach(bookmark => {
      html += renderBookmarkItem(bookmark);
    });
    
    listContainer.innerHTML = html;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Sorts bookmarks
   * @param {string} sortBy - Sort method ('date' or 'chapter')
   */
  const sortBookmarks = (sortBy) => {
    const listContainer = DOMHelpers.safeGetElement('bookmarks-list');
    if (!listContainer) return;
    
    let bookmarks;
    if (sortBy === 'chapter') {
      bookmarks = Bookmarks.getBookmarksByChapter();
    } else {
      bookmarks = Bookmarks.getBookmarks();
    }
    
    let html = '';
    bookmarks.forEach(bookmark => {
      html += renderBookmarkItem(bookmark);
    });
    
    listContainer.innerHTML = html;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Exports bookmarks
   */
  const exportBookmarks = () => {
    const jsonData = Bookmarks.exportBookmarks();
    
    if (!jsonData) {
      UINotifications.showNotification('Failed to export bookmarks', 'error');
      return;
    }
    
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-unending-bookmarks-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    UINotifications.showNotification('Bookmarks exported', 'success');
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Clears all bookmarks
   */
  const clearAllBookmarks = () => {
    if (confirm('Are you sure you want to delete ALL bookmarks? This cannot be undone.')) {
      const success = Bookmarks.clearAllBookmarks();
      if (success) {
        UINotifications.showNotification('All bookmarks cleared', 'success');
        refreshBookmarksList();
        updateBookmarkButton();
      } else {
        UINotifications.showNotification('Failed to clear bookmarks', 'error');
      }
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Adds bookmark button to chapter view
   */
  const addBookmarkButton = () => {
    const chapterContent = DOMHelpers.safeGetElement('chapter-content');
    if (!chapterContent) return;
    
    // Check if button already exists
    if (DOMHelpers.safeGetElement('bookmark-btn')) return;
    
    const buttonHTML = `
      <button id="bookmark-btn" class="bookmark-btn" onclick="BookmarksUI.toggleBookmark()">
        🔖 Bookmark
      </button>
    `;
    
    chapterContent.insertAdjacentHTML('beforebegin', buttonHTML);
    updateBookmarkButton();
  }

  // Create namespace object
  const BookmarksUI = {
    openModal: openBookmarksModal,
    closeModal: closeBookmarksModal,
    toggleBookmark: toggleBookmark,
    updateBookmarkButton: updateBookmarkButton,
    goToChapter: goToChapter,
    editNote: editNote,
    deleteBookmark: deleteBookmark,
    searchBookmarks: searchBookmarks,
    sortBookmarks: sortBookmarks,
    exportBookmarks: exportBookmarks,
    clearAllBookmarks: clearAllBookmarks,
    addBookmarkButton: addBookmarkButton
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.BookmarksUI = BookmarksUI;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BookmarksUI;
  }

})();