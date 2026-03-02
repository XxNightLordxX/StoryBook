/**
 * Search System Module
 * Provides search functionality across chapters and content
 * @module search
 */

(function() {
  'use strict';

  /**
   * Search result structure
   * @typedef {Object} SearchResult
   * @property {number} chapterNum - Chapter number
   * @property {string} chapterTitle - Chapter title
   * @property {string} content - Matching content snippet
   * @property {number} matchCount - Number of matches in this chapter
   * @property {Array<number>} positions - Positions of matches in content
   */

  /**
   * Maximum number of search results to return
   */
  const MAX_RESULTS = 50;

  /**
   * Maximum snippet length for search results
   */
  const SNIPPET_LENGTH = 200;

  /**
   * Storage key for search history
   */
  const SEARCH_HISTORY_KEY = 'ese_searchHistory';

  /**
   * Searches for text within a specific chapter
   * @param {number} chapterNum - Chapter number to search
   * @param {string} query - Search query
   * @param {boolean} caseSensitive - Whether search is case sensitive
   * @returns {SearchResult|null} Search result or null if no matches
   */
  const searchChapter = (chapterNum, query, caseSensitive = false) => {
    try {
      const chapterContent = Storage.getChapterContent(chapterNum);
      if (!chapterContent || !chapterContent.content) {
        return null;
      }

      const content = chapterContent.content;
      const searchContent = caseSensitive ? content : content.toLowerCase();
      const searchQuery = caseSensitive ? query : query.toLowerCase();

      // Find all matches
      const positions = [];
      let position = searchContent.indexOf(searchQuery);
      
      while (position !== -1) {
        positions.push(position);
        position = searchContent.indexOf(searchQuery, position + 1);
      }

      if (positions.length === 0) {
        return null;
      }

      // Create snippet from first match
      const firstMatch = positions[0];
      const snippetStart = Math.max(0, firstMatch - 50);
      const snippetEnd = Math.min(content.length, firstMatch + query.length + 50);
      const snippet = content.substring(snippetStart, snippetEnd);

      return {
        chapterNum: chapterNum,
        chapterTitle: chapterContent.title || `Chapter ${chapterNum}`,
        content: snippet,
        matchCount: positions.length,
        positions: positions
      };
    } catch (error) {
      // Error handled silently: console.error('Error searching chapter:', error);
      return null;
    }
  }

  /**
   * Searches across all chapters
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @param {boolean} options.caseSensitive - Case sensitive search
   * @param {number} options.maxResults - Maximum results to return
   * @param {number} options.startChapter - Start chapter number
   * @param {number} options.endChapter - End chapter number
   * @returns {Array<SearchResult>} Array of search results
   */
  const searchAllChapters = (query, options = {}) => {
    const {
      caseSensitive = false,
      maxResults = MAX_RESULTS,
      startChapter = 1,
      endChapter = AppStateModule.AppState.totalGenerated || 100
    } = options;

    if (!query || query.trim().length === 0) {
      return [];
    }

    const results = [];
    const searchQuery = query.trim();

    // Search each chapter
    for (let chapterNum = startChapter; chapterNum <= endChapter; chapterNum++) {
      if (results.length >= maxResults) {
        break;
      }

      const result = searchChapter(chapterNum, searchQuery, caseSensitive);
      if (result) {
        results.push(result);
      }
    }

    // Sort by match count (most matches first)
    results.sort((a, b) => b.matchCount - a.matchCount);

    return results;
  }

  /**
   * Highlights search terms in text
   * @param {string} text - Text to highlight
   * @param {string} query - Search query to highlight
   * @param {boolean} caseSensitive - Whether highlighting is case sensitive
   * @returns {string} Text with highlighted terms
   */
  const highlightMatches = (text, query, caseSensitive = false) => {
    if (!query || query.trim().length === 0) {
      return text;
    }

    const searchQuery = query.trim();
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(escapeRegex(searchQuery), flags);

    return text.replace(regex, '<mark class="search-highlight">$&</mark>');
  }

  /**
   * Escapes special regex characters
   * @param {string} string - String to escape
   * @returns {string} Escaped string
   */
  const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Gets search history
   * @returns {Array<string>} Array of search queries
   */
  const getSearchHistory = () => {
    return ErrorHandler.safeExecute(() => {
      const history = Storage.getSearchHistory();
      return history.slice(0, 10); // Keep last 10 searches
    }, 'Loading search history', []);
  }

  /**
   * Saves search query to history
   * @param {string} query - Search query to save
   */
  const saveSearchHistory = (query) => {
    if (!query || query.trim().length === 0) {
      return;
    }

    const trimmedQuery = query.trim();
    const history = getSearchHistory();

    // Remove if already exists
    const index = history.indexOf(trimmedQuery);
    if (index !== -1) {
      history.splice(index, 1);
    }

    // Add to beginning
    history.unshift(trimmedQuery);

    // Keep only last 10
    if (history.length > 10) {
      history.pop();
    }

    ErrorHandler.safeExecute(() => {
      Storage.setSearchHistory(history);
    }, 'Saving search history');
  }

  /**
   * Clears search history
   */
  const clearSearchHistory = () => {
    ErrorHandler.safeExecute(() => {
      Storage.clearSearchHistory();
    }, 'Clearing search history');
  }

  /**
   * Advanced search with filters
   * @param {string} query - Search query
   * @param {Object} filters - Search filters
   * @param {boolean} filters.caseSensitive - Case sensitive
   * @param {boolean} filters.wholeWord - Whole word only
   * @param {boolean} filters.regex - Use regex pattern
   * @param {number} filters.minMatches - Minimum matches required
   * @returns {Array<SearchResult>} Filtered search results
   */
  const advancedSearch = (query, filters = {}) => {
    const {
      caseSensitive = false,
      wholeWord = false,
      regex = false,
      minMatches = 1
    } = filters;

    if (!query || query.trim().length === 0) {
      return [];
    }

    let results = [];

    if (regex) {
      // Regex search
      try {
        const flags = caseSensitive ? 'g' : 'gi';
        const pattern = new RegExp(query, flags);
        results = regexSearch(pattern, caseSensitive);
      } catch (error) {
        // Error handled silently: console.error('Invalid regex pattern:', error);
        return [];
      }
    } else {
      // Standard search
      results = searchAllChapters(query, { caseSensitive });
    }

    // Apply whole word filter
    if (wholeWord) {
      results = results.filter(result => {
        const wordRegex = new RegExp(`\\b${escapeRegex(query)}\\b`, caseSensitive ? 'g' : 'gi');
        return wordRegex.test(result.content);
      });
    }

    // Apply minimum matches filter
    if (minMatches > 1) {
      results = results.filter(result => result.matchCount >= minMatches);
    }

    return results;
  }

  /**
   * Performs regex search across chapters
   * @param {RegExp} pattern - Regex pattern to search
   * @param {boolean} caseSensitive - Whether search is case sensitive
   * @returns {Array<SearchResult>} Search results
   */
  const regexSearch = (pattern, caseSensitive) => {
    const results = [];
    const endChapter = AppStateModule.AppState.totalGenerated || 100;

    for (let chapterNum = 1; chapterNum <= endChapter; chapterNum++) {
      try {
        const chapterContent = Storage.getChapterContent(chapterNum);
        if (!chapterContent || !chapterContent.content) {
          continue;
        }

        const content = chapterContent.content;
        const matches = content.match(pattern);

        if (matches && matches.length > 0) {
          results.push({
            chapterNum: chapterNum,
            chapterTitle: chapterContent.title || `Chapter ${chapterNum}`,
            content: content.substring(0, SNIPPET_LENGTH),
            matchCount: matches.length,
            positions: []
          });
        }
      } catch (error) {
        // Error handled silently: console.error('Error in regex search:', error);
      }
    }

    return results;
  }

  /**
   * Gets search statistics
   * @param {string} query - Search query
   * @returns {Object} Search statistics
   */
  const getSearchStats = (query) => {
    const results = searchAllChapters(query);
    const totalMatches = results.reduce((sum, result) => sum + result.matchCount, 0);
    const chaptersWithMatches = results.length;

    return {
      query: query,
      totalResults: results.length,
      totalMatches: totalMatches,
      chaptersWithMatches: chaptersWithMatches,
      averageMatches: chaptersWithMatches > 0 ? Math.round(totalMatches / chaptersWithMatches) : 0
    };
  }

  // Create namespace object
  const Search = {
    searchChapter: searchChapter,
    searchAllChapters: searchAllChapters,
    highlightMatches: highlightMatches,
    getSearchHistory: getSearchHistory,
    saveSearchHistory: saveSearchHistory,
    clearSearchHistory: clearSearchHistory,
    advancedSearch: advancedSearch,
    getSearchStats: getSearchStats,
    MAX_RESULTS: MAX_RESULTS,
    SNIPPET_LENGTH: SNIPPET_LENGTH
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.Search = Search;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Search;
  }

})();