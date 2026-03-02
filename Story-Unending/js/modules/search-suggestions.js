/**
 * Enhanced Search Suggestions Module
 * Provides context-aware, cached search suggestions with history
 * @module search-suggestions
 */

(function() {
  'use strict';

  /**
   * Storage key for suggestion cache
   */
  const SUGGESTION_CACHE_KEY = 'ese_suggestionCache';

  /**
   * Storage key for suggestion history
   */
  const SUGGESTION_HISTORY_KEY = 'ese_suggestionHistory';

  /**
   * Cache expiration time (24 hours in milliseconds)
   */
  const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

  /**
   * Maximum cache size
   */
  const MAX_CACHE_SIZE = 100;

  /**
   * Maximum history size
   */
  const MAX_HISTORY_SIZE = 50;

  /**
   * Suggestion cache
   */
  let suggestionCache = {};

  /**
   * Suggestion history
   */
  let suggestionHistory = [];

  /**
   * Initializes the suggestion system
   */
  const init = () => {
    loadCache();
    loadHistory();
  }

  /**
   * Loads suggestion cache from localStorage
   */
  const loadCache = () => {
    try {
      const cached = Storage.getItem(SUGGESTION_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        const now = Date.now();
        
        // Filter expired entries
        suggestionCache = {};
        for (const key in data) {
          if (data[key].timestamp > now - CACHE_EXPIRATION) {
            suggestionCache[key] = data[key];
          }
        }
      }
    } catch (error) {
      // Error handled silently: console.error('Error loading suggestion cache:', error);
      suggestionCache = {};
    }
  }

  /**
   * Saves suggestion cache to localStorage
   */
  const saveCache = () => {
    try {
      // Limit cache size
      const keys = Object.keys(suggestionCache);
      if (keys.length > MAX_CACHE_SIZE) {
        // Remove oldest entries
        keys.sort((a, b) => suggestionCache[a].timestamp - suggestionCache[b].timestamp);
        const toRemove = keys.slice(0, keys.length - MAX_CACHE_SIZE);
        toRemove.forEach(key => delete suggestionCache[key]);
      }
      
      Storage.setItem(SUGGESTION_CACHE_KEY, suggestionCache);
    } catch (error) {
      // Error handled silently: console.error('Error saving suggestion cache:', error);
    }
  }

  /**
   * Loads suggestion history from localStorage
   */
  const loadHistory = () => {
    try {
      const history = Storage.getItem(SUGGESTION_HISTORY_KEY);
      if (history) {
        suggestionHistory = JSON.parse(history);
      }
    } catch (error) {
      // Error handled silently: console.error('Error loading suggestion history:', error);
      suggestionHistory = [];
    }
  }

  /**
   * Saves suggestion history to localStorage
   */
  const saveHistory = () => {
    try {
      // Limit history size
      if (suggestionHistory.length > MAX_HISTORY_SIZE) {
        suggestionHistory = suggestionHistory.slice(0, MAX_HISTORY_SIZE);
      }
      
      Storage.setItem(SUGGESTION_HISTORY_KEY, suggestionHistory);
    } catch (error) {
      // Error handled silently: console.error('Error saving suggestion history:', error);
    }
  }

  /**
   * Gets cached suggestions for a query
   * @param {string} query - Search query
   * @returns {Array|null} Cached suggestions or null if not found
   */
  const getCachedSuggestions = (query) => {
    const key = query.toLowerCase().trim();
    if (suggestionCache[key]) {
      return suggestionCache[key].suggestions;
    }
    return null;
  }

  /**
   * Caches suggestions for a query
   * @param {string} query - Search query
   * @param {Array} suggestions - Suggestions to cache
   */
  const cacheSuggestions = (query, suggestions) => {
    const key = query.toLowerCase().trim();
    suggestionCache[key] = {
      suggestions: suggestions,
      timestamp: Date.now()
    };
    saveCache();
  }

  /**
   * Adds a query to suggestion history
   * @param {string} query - Search query
   */
  const addToHistory = (query) => {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      return;
    }

    // Remove if already exists
    const index = suggestionHistory.indexOf(trimmedQuery);
    if (index !== -1) {
      suggestionHistory.splice(index, 1);
    }

    // Add to beginning
    suggestionHistory.unshift(trimmedQuery);

    // Limit size
    if (suggestionHistory.length > MAX_HISTORY_SIZE) {
      suggestionHistory.pop();
    }

    saveHistory();
  }

  /**
   * Gets suggestion history
   * @param {number} limit - Maximum number of history items
   * @returns {Array} Suggestion history
   */
  const getHistory = (limit = 10) => {
    return suggestionHistory.slice(0, limit);
  }

  /**
   * Clears suggestion history
   */
  const clearHistory = () => {
    suggestionHistory = [];
    Storage.removeItem(SUGGESTION_HISTORY_KEY);
  }

  /**
   * Clears suggestion cache
   */
  const clearCache = () => {
    suggestionCache = {};
    Storage.removeItem(SUGGESTION_CACHE_KEY);
  }

  /**
   * Gets context-aware suggestions
   * @param {string} query - Search query
   * @param {Object} context - Context information
   * @param {number} context.currentChapter - Current chapter number
   * @param {string} context.lastSearch - Last search query
   * @param {Array} context.recentSearches - Recent search queries
   * @param {number} maxSuggestions - Maximum suggestions to return
   * @returns {Array} Context-aware suggestions
   */
  const getContextAwareSuggestions = (query, context = {}, maxSuggestions = 5) => {
    const trimmedQuery = query.trim().toLowerCase();
    
    // Check cache first
    const cached = getCachedSuggestions(trimmedQuery);
    if (cached) {
      return cached.slice(0, maxSuggestions);
    }

    // Get base suggestions from fuzzy search
    let suggestions = FuzzySearch.getSearchSuggestions(query, maxSuggestions * 2);

    // Add context-aware suggestions
    const contextSuggestions = getContextSuggestions(query, context);
    suggestions = [...contextSuggestions, ...suggestions];

    // Remove duplicates
    const uniqueSuggestions = [];
    const seen = new Set();
    for (const suggestion of suggestions) {
      const key = suggestion.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSuggestions.push(suggestion);
      }
    }

    // Limit to max suggestions
    const finalSuggestions = uniqueSuggestions.slice(0, maxSuggestions);

    // Cache the results
    cacheSuggestions(trimmedQuery, finalSuggestions);

    return finalSuggestions;
  }

  /**
   * Gets context-based suggestions
   * @param {string} query - Search query
   * @param {Object} context - Context information
   * @returns {Array} Context-based suggestions
   */
  const getContextSuggestions = (query, context) => {
    const suggestions = [];
    const trimmedQuery = query.trim().toLowerCase();

    // Suggest from current chapter
    if (context.currentChapter) {
      const chapterSuggestions = getChapterSuggestions(context.currentChapter, trimmedQuery);
      suggestions.push(...chapterSuggestions);
    }

    // Suggest from recent searches
    if (context.recentSearches && context.recentSearches.length > 0) {
      const recentSuggestions = context.recentSearches
        .filter(search => search.toLowerCase().startsWith(trimmedQuery))
        .slice(0, 2);
      suggestions.push(...recentSuggestions);
    }

    // Suggest related terms
    const relatedSuggestions = getRelatedSuggestions(trimmedQuery);
    suggestions.push(...relatedSuggestions);

    return suggestions;
  }

  /**
   * Gets suggestions from a specific chapter
   * @param {number} chapterNum - Chapter number
   * @param {string} query - Search query
   * @returns {Array} Chapter-specific suggestions
   */
  const getChapterSuggestions = (chapterNum, query) => {
    const suggestions = [];
    
    try {
      const chapterContent = Storage.getChapterContent(chapterNum);
      if (!chapterContent || !chapterContent.content) {
        return suggestions;
      }

      const content = chapterContent.content.toLowerCase();
      const words = content.split(/\s+/);
      
      // Find words that start with the query
      const matchingWords = words
        .filter(word => word.length > 3 && word.startsWith(query))
        .slice(0, 3);

      suggestions.push(...matchingWords);
    } catch (error) {
      // Error handled silently: console.error('Error getting chapter suggestions:', error);
    }

    return suggestions;
  }

  /**
   * Gets related suggestions based on query
   * @param {string} query - Search query
   * @returns {Array} Related suggestions
   */
  const getRelatedSuggestions = (query) => {
    const relatedTerms = {
      'vampire': ['blood', 'darkness', 'immortal', 'fangs', 'night'],
      'magic': ['spell', 'power', 'arcane', 'mana', 'enchantment'],
      'battle': ['fight', 'combat', 'war', 'attack', 'defense'],
      'love': ['romance', 'heart', 'passion', 'emotion', 'relationship'],
      'death': ['grave', 'soul', 'afterlife', 'mortality', 'end'],
      'family': ['parent', 'sibling', 'child', 'relative', 'kin'],
      'friend': ['ally', 'companion', 'partner', 'bond', 'trust'],
      'enemy': ['rival', 'foe', 'opponent', 'adversary', 'threat'],
      'journey': ['quest', 'adventure', 'travel', 'path', 'expedition'],
      'power': ['strength', 'ability', 'might', 'force', 'energy']
    };

    const suggestions = [];
    
    for (const [term, related] of Object.entries(relatedTerms)) {
      if (query.includes(term) || term.includes(query)) {
        suggestions.push(...related.filter(r => r.startsWith(query) || query.startsWith(r)));
      }
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Ranks suggestions by relevance
   * @param {Array} suggestions - Suggestions to rank
   * @param {string} query - Search query
   * @returns {Array} Ranked suggestions
   */
  const rankSuggestions = (suggestions, query) => {
    const trimmedQuery = query.trim().toLowerCase();

    return suggestions
      .map(suggestion => ({
        text: suggestion,
        score: calculateSuggestionScore(suggestion, trimmedQuery)
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.text);
  }

  /**
   * Calculates suggestion score
   * @param {string} suggestion - Suggestion text
   * @param {string} query - Search query
   * @returns {number} Suggestion score
   */
  const calculateSuggestionScore = (suggestion, query) => {
    let score = 0;
    const lowerSuggestion = suggestion.toLowerCase();

    // Exact match bonus
    if (lowerSuggestion === query) {
      score += 100;
    }

    // Starts with query bonus
    if (lowerSuggestion.startsWith(query)) {
      score += 50;
    }

    // Contains query bonus
    if (lowerSuggestion.includes(query)) {
      score += 30;
    }

    // Length penalty (shorter is better)
    score -= suggestion.length * 0.5;

    // History bonus
    if (suggestionHistory.includes(lowerSuggestion)) {
      score += 20;
    }

    return score;
  }

  /**
   * Gets enhanced suggestions with all features
   * @param {string} query - Search query
   * @param {Object} options - Suggestion options
   * @param {number} options.maxSuggestions - Maximum suggestions
   * @param {boolean} options.useCache - Whether to use cache
   * @param {boolean} options.useHistory - Whether to use history
   * @param {boolean} options.useContext - Whether to use context
   * @returns {Array} Enhanced suggestions
   */
  const getEnhancedSuggestions = (query, options = {}) => {
    const {
      maxSuggestions = 5,
      useCache = true,
      useHistory = true,
      useContext = true
    } = options;

    const trimmedQuery = query.trim();
    
    if (!trimmedQuery || trimmedQuery.length < 2) {
      return [];
    }

    // Get context
    const context = {};
    if (useContext) {
      context.currentChapter = AppStateModule.AppState.currentChapter || 1;
      context.lastSearch = Search.getSearchHistory()[0] || '';
      context.recentSearches = useHistory ? Search.getSearchHistory().slice(0, 5) : [];
    }

    // Get suggestions
    let suggestions;
    if (useContext) {
      suggestions = getContextAwareSuggestions(trimmedQuery, context, maxSuggestions * 2);
    } else {
      suggestions = FuzzySearch.getSearchSuggestions(trimmedQuery, maxSuggestions * 2);
    }

    // Add history suggestions
    if (useHistory) {
      const history = getHistory(maxSuggestions);
      const historySuggestions = history.filter(h => 
        h.startsWith(trimmedQuery.toLowerCase()) && 
        !suggestions.includes(h)
      );
      suggestions = [...historySuggestions, ...suggestions];
    }

    // Remove duplicates and rank
    const uniqueSuggestions = [...new Set(suggestions)];
    const rankedSuggestions = rankSuggestions(uniqueSuggestions, trimmedQuery);

    // Limit to max suggestions
    return rankedSuggestions.slice(0, maxSuggestions);
  }

  /**
   * Gets suggestion statistics
   * @returns {Object} Suggestion statistics
   */
  const getSuggestionStats = () => {
    return {
      cacheSize: Object.keys(suggestionCache).length,
      historySize: suggestionHistory.length,
      cacheExpiration: CACHE_EXPIRATION,
      maxCacheSize: MAX_CACHE_SIZE,
      maxHistorySize: MAX_HISTORY_SIZE
    };
  }

  // Initialize on load
  init();

  // Create namespace object
  const SearchSuggestions = {
    init: init,
    getCachedSuggestions: getCachedSuggestions,
    cacheSuggestions: cacheSuggestions,
    addToHistory: addToHistory,
    getHistory: getHistory,
    clearHistory: clearHistory,
    clearCache: clearCache,
    getContextAwareSuggestions: getContextAwareSuggestions,
    getEnhancedSuggestions: getEnhancedSuggestions,
    rankSuggestions: rankSuggestions,
    getSuggestionStats: getSuggestionStats
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.SearchSuggestions = SearchSuggestions;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchSuggestions;
  }

})();