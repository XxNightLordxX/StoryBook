/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Search UI Module
 * Manages the search interface
 * @module search-ui
 */

(function() {
  'use strict';

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Opens the search modal
   */
  const openSearchModal = () => {
    const modal = DOMHelpers.safeGetElement('search-modal');
    if (!modal) {
      createSearchModal();
    }
    
    loadSearchHistory();
    DOMHelpers.safeToggleClass('search-modal', 'active', true);
    
    // Focus on search input
    setTimeout(() => {
      DOMHelpers.safeGetElement('search-input')?.focus();
    }, 100);
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Closes the search modal
   */
  const closeSearchModal = () => {
    const modal = DOMHelpers.safeGetElement('search-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Creates the search modal HTML structure
   */
  const createSearchModal = () => {
    const modalHTML = `
      <div id="search-modal" class="modal">
        <div class="modal-content search-content">
          <div class="modal-header">
            <h2>🔍 Search</h2>
            <button class="close-btn" onclick="SearchUI.closeModal()">&times;</button>
          </div>
          
          <div class="search-input-section">
            <div class="search-input-wrapper">
              <input type="text" id="search-input" placeholder="Search chapters..." 
                     onkeypress="SearchUI.handleKeyPress(event)">
              <button class="search-btn" onclick="SearchUI.performSearch()">Search</button>
            </div>
            
            <div class="search-options-toggle" onclick="SearchUI.toggleAdvancedOptions()">
              <span>Advanced Options</span>
              <span class="toggle-icon">▼</span>
            </div>
            
            <div class="search-advanced-options" id="search-advanced-options" style="display:none;">
              <div class="option-row">
                <label class="checkbox-label">
                  <input type="checkbox" id="case-sensitive">
                  <span>Case Sensitive</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" id="whole-word">
                  <span>Whole Word Only</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" id="regex-mode">
                  <span>Regex Mode</span>
                </label>
              </div>
              <div class="option-row">
                <label>
                  <span>Min Matches:</span>
                  <input type="number" id="min-matches" value="1" min="1" max="100">
                </label>
              </div>
            </div>
          </div>
          
          <div class="search-history-section" id="search-history-section">
            <div class="history-header">
              <span>Recent Searches</span>
              <button class="clear-history-btn" onclick="SearchUI.clearHistory()">Clear</button>
            </div>
            <div class="search-history-list" id="search-history-list">
              <!-- Search history will be rendered here -->
            </div>
          </div>
          
          <div class="search-results-section" id="search-results-section" style="display:none;">
            <div class="results-header">
              <span id="results-count">0 results found</span>
              <button class="clear-results-btn" onclick="SearchUI.clearResults()">Clear</button>
            </div>
            <div class="search-results-list" id="search-results-list">
              <!-- Search results will be rendered here -->
            </div>
          </div>
          
          <div class="search-empty" id="search-empty" style="display:none;">
            <div class="empty-icon">🔍</div>
            <p>No results found</p>
            <p class="empty-hint">Try different keywords or adjust search options</p>
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
   * Toggles advanced options visibility
   */
  const toggleAdvancedOptions = () => {
    const options = DOMHelpers.safeGetElement('search-advanced-options');
    const toggle = document.querySelector('.search-options-toggle .toggle-icon');
    
    if (options.style.display === 'none') {
      options.style.display = 'block';
      toggle.textContent = '▲';
    } else {
      options.style.display = 'none';
      toggle.textContent = '▼';
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Handles key press in search input
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      performSearch();
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Performs the search
   */
  const performSearch = () => {
    const query = DOMHelpers.safeGetElement('search-input').value.trim();
    
    if (!query) {
      UINotifications.showNotification('Please enter a search query', 'warning');
      return;
    }

    // Save to history
    Search.saveSearchHistory(query);

    // Get search options
    const caseSensitive = DOMHelpers.safeGetElement('case-sensitive').checked;
    const wholeWord = DOMHelpers.safeGetElement('whole-word').checked;
    const regexMode = DOMHelpers.safeGetElement('regex-mode').checked;
    const minMatches = parseInt(DOMHelpers.safeGetElement('min-matches').value) || 1;

    // Perform search
    let results;
    if (regexMode) {
      results = Search.advancedSearch(query, {
        caseSensitive,
        wholeWord,
        regex: true,
        minMatches
      });
    } else {
      results = Search.advancedSearch(query, {
        caseSensitive,
        wholeWord,
        regex: false,
        minMatches
      });
    }

    // Display results
    displaySearchResults(results, query, caseSensitive);
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Displays search results
   * @param {Array} results - Search results
   * @param {string} query - Search query
   * @param {boolean} caseSensitive - Whether search was case sensitive
   */
  const displaySearchResults = (results, query, caseSensitive) => {
    const historySection = DOMHelpers.safeGetElement('search-history-section');
    const resultsSection = DOMHelpers.safeGetElement('search-results-section');
    const emptySection = DOMHelpers.safeGetElement('search-empty');
    const resultsList = DOMHelpers.safeGetElement('search-results-list');
    const resultsCount = DOMHelpers.safeGetElement('results-count');

    // Hide history section
    historySection.style.display = 'none';

    if (results.length === 0) {
      // Show empty state
      resultsSection.style.display = 'none';
      emptySection.style.display = 'block';
      return;
    }

    // Show results
    emptySection.style.display = 'none';
    resultsSection.style.display = 'block';

    // Update count
    const totalMatches = results.reduce((sum, r) => sum + r.matchCount, 0);
    resultsCount.textContent = `${results.length} chapters, ${totalMatches} matches`;

    // Render results
    let html = '';
    results.forEach(result => {
      html += renderSearchResult(result, query, caseSensitive);
    });

    resultsList.innerHTML = html;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Renders a single search result
   * @param {Object} result - Search result
   * @param {string} query - Search query
   * @param {boolean} caseSensitive - Whether search was case sensitive
   * @returns {string} HTML string
   */
  const renderSearchResult = (result, query, caseSensitive) => {
    const highlightedContent = Search.highlightMatches(result.content, query, caseSensitive);
    
    return `
      <div class="search-result-item" data-chapter="${result.chapterNum}">
        <div class="result-header">
          <div class="result-chapter">
            <span class="chapter-number">Chapter ${result.chapterNum}</span>
            <span class="chapter-title">${sanitizeHTML(result.chapterTitle)}</span>
          </div>
          <div class="result-matches">${result.matchCount} match${result.matchCount > 1 ? 'es' : ''}</div>
        </div>
        <div class="result-content">
          ${highlightedContent}...
        </div>
        <div class="result-actions">
          <button class="btn btn-primary btn-sm" onclick="SearchUI.goToChapter(${result.chapterNum})">
            📖 Read Chapter
          </button>
        </div>
      </div>
    `;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Loads and displays search history
   */
  const loadSearchHistory = () => {
    const history = Search.getSearchHistory();
    const historyList = DOMHelpers.safeGetElement('search-history-list');
    
    if (!historyList) return;

    if (history.length === 0) {
      historyList.innerHTML = '<p class="no-history">No recent searches</p>';
      return;
    }

    let html = '';
    history.forEach(query => {
      html += `
        <div class="history-item" onclick="SearchUI.searchFromHistory('${sanitizeHTML(query)}')">
          <span class="history-query">${sanitizeHTML(query)}</span>
          <span class="history-icon">🔍</span>
        </div>
      `;
    });

    historyList.innerHTML = html;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Searches from history
   * @param {string} query - Search query from history
   */
  const searchFromHistory = (query) => {
    DOMHelpers.safeGetElement('search-input').value = query;
    performSearch();
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Clears search history
   */
  const clearHistory = () => {
    if (confirm('Are you sure you want to clear search history?')) {
      Search.clearSearchHistory();
      loadSearchHistory();
      UINotifications.showNotification('Search history cleared', 'success');
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Clears search results
   */
  const clearResults = () => {
    const historySection = DOMHelpers.safeGetElement('search-history-section');
    const resultsSection = DOMHelpers.safeGetElement('search-results-section');
    const emptySection = DOMHelpers.safeGetElement('search-empty');
    const searchInput = DOMHelpers.safeGetElement('search-input');

    searchInput.value = '';
    historySection.style.display = 'block';
    resultsSection.style.display = 'none';
    emptySection.style.display = 'none';
    
    loadSearchHistory();
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Goes to a specific chapter
   * @param {number} chapterNum - Chapter number
   */
  const goToChapter = (chapterNum) => {
    closeSearchModal();
    Navigation.goToChapter(chapterNum);
  }

  // Create namespace object
  const SearchUI = {
    openModal: openSearchModal,
    closeModal: closeSearchModal,
    toggleAdvancedOptions: toggleAdvancedOptions,
    handleKeyPress: handleKeyPress,
    performSearch: performSearch,
    displaySearchResults: displaySearchResults,
    loadSearchHistory: loadSearchHistory,
    searchFromHistory: searchFromHistory,
    clearHistory: clearHistory,
    clearResults: clearResults,
    goToChapter: goToChapter
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.SearchUI = SearchUI;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchUI;
  }

})();