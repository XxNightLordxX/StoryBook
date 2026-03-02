/**
 * Fuzzy Search Module
 * Integrates Fuse.js for fuzzy search functionality
 * @module fuzzy-search
 */

(function() {
  'use strict';

  // Fuse.js will be loaded from CDN
  let Fuse = null;

  /**
   * Initializes Fuse.js library
   */
  const initFuse = () => {
    if (typeof Fuse !== 'undefined') {
      return true;
    }
    
    // Check if Fuse is available from CDN
    if (window.Fuse) {
      Fuse = window.Fuse;
      return true;
    }
    
    return false;
  }

  /**
   * Prepares chapter data for fuzzy search
   * @param {number} startChapter - Start chapter number
   * @param {number} endChapter - End chapter number
   * @returns {Array} Array of chapter objects for fuzzy search
   */
  const prepareChapterData = (startChapter = 1, endChapter = 100) => {
    const chapters = [];
    const totalChapters = AppStateModule.AppState.totalGenerated || endChapter;
    
    for (let chapterNum = startChapter; chapterNum <= totalChapters; chapterNum++) {
      try {
        const chapterContent = Storage.getChapterContent(chapterNum);
        if (chapterContent && chapterContent.content) {
          chapters.push({
            chapterNum: chapterNum,
            title: chapterContent.title || `Chapter ${chapterNum}`,
            content: chapterContent.content,
            fullText: `${chapterContent.title || ''} ${chapterContent.content}`
          });
        }
      } catch (error) {
        // Error handled silently: console.error(`Error preparing chapter ${chapterNum}:`, error);
      }
    }
    
    return chapters;
  }

  /**
   * Performs fuzzy search across chapters
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @param {number} options.threshold - Match threshold (0.0-1.0, lower is stricter)
   * @param {number} options.distance - Maximum distance for fuzzy match
   * @param {number} options.minMatchCharLength - Minimum character length for match
   * @param {boolean} options.caseSensitive - Case sensitive search
   * @param {number} options.maxResults - Maximum results to return
   * @param {number} options.startChapter - Start chapter number
   * @param {number} options.endChapter - End chapter number
   * @returns {Array} Array of fuzzy search results with scores
   */
  const fuzzySearch = (query, options = {}) => {
    if (!query || query.trim().length === 0) {
      return [];
    }

    // Initialize Fuse.js
    if (!initFuse()) {
      // Error logged: console.error('Fuse.js not loaded');
      return [];
    }

    const {
      threshold = 0.4, // 0.0 = exact match, 1.0 = match anything
      distance = 100,
      minMatchCharLength = 1,
      caseSensitive = false,
      maxResults = 50,
      startChapter = 1,
      endChapter = AppStateModule.AppState.totalGenerated || 100
    } = options;

    // Prepare chapter data
    const chapters = prepareChapterData(startChapter, endChapter);
    
    if (chapters.length === 0) {
      return [];
    }

    // Configure Fuse.js
    const fuseOptions = {
      keys: [
        {
          name: 'title',
          weight: 0.3
        },
        {
          name: 'content',
          weight: 0.7
        },
        {
          name: 'fullText',
          weight: 1.0
        }
      ],
      threshold: threshold,
      distance: distance,
      minMatchCharLength: minMatchCharLength,
      caseSensitive: caseSensitive,
      includeScore: true,
      includeMatches: true,
      shouldSort: true,
      findAllMatches: false,
      ignoreLocation: false,
      ignoreFieldNorm: false,
      fieldNormWeight: 0.5
    };

    // Create Fuse instance
    const fuse = new Fuse(chapters, fuseOptions);

    // Perform search
    const results = fuse.search(query, { limit: maxResults });

    // Transform results to match existing search format
    return results.map(result => {
      const item = result.item;
      const matches = result.matches || [];
      
      // Calculate match count from Fuse matches
      let matchCount = 0;
      let snippet = '';
      
      if (matches.length > 0) {
        // Count total matches
        matches.forEach(match => {
          if (match.indices) {
            matchCount += match.indices.length;
          }
        });
        
        // Create snippet from first match
        const firstMatch = matches[0];
        if (firstMatch.indices && firstMatch.indices.length > 0) {
          const [start, end] = firstMatch.indices[0];
          const content = item.content;
          const snippetStart = Math.max(0, start - 50);
          const snippetEnd = Math.min(content.length, end + 50);
          snippet = content.substring(snippetStart, snippetEnd);
        } else {
          snippet = item.content.substring(0, 200);
        }
      } else {
        snippet = item.content.substring(0, 200);
      }

      return {
        chapterNum: item.chapterNum,
        chapterTitle: item.title,
        content: snippet,
        matchCount: matchCount,
        positions: [], // Fuse doesn't provide exact positions
        score: result.score, // Fuse similarity score (0 = perfect match, 1 = no match)
        fuzzyMatch: true
      };
    });
  }

  /**
   * Performs hybrid search (fuzzy + exact)
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Combined search results
   */
  const hybridSearch = (query, options = {}) => {
    const {
      fuzzyThreshold = 0.4,
      prioritizeExact = true,
      ...searchOptions
    } = options;

    // Perform fuzzy search
    const fuzzyResults = fuzzySearch(query, {
      ...searchOptions,
      threshold: fuzzyThreshold
    });

    // Perform exact search (using existing Search module)
    const exactResults = Search.searchAllChapters(query, {
      caseSensitive: searchOptions.caseSensitive || false,
      maxResults: searchOptions.maxResults || 50,
      startChapter: searchOptions.startChapter || 1,
      endChapter: searchOptions.endChapter || 100
    });

    // Combine and deduplicate results
    const combinedResults = [];
    const seenChapters = new Set();

    // Add exact results first if prioritized
    if (prioritizeExact) {
      exactResults.forEach(result => {
        if (!seenChapters.has(result.chapterNum)) {
          seenChapters.add(result.chapterNum);
          combinedResults.push({
            ...result,
            score: 0, // Perfect score for exact matches
            fuzzyMatch: false
          });
        }
      });
    }

    // Add fuzzy results
    fuzzyResults.forEach(result => {
      if (!seenChapters.has(result.chapterNum)) {
        seenChapters.add(result.chapterNum);
        combinedResults.push(result);
      }
    });

    // Sort by score (lower is better)
    combinedResults.sort((a, b) => {
      if (a.score === 0 && b.score !== 0) return -1;
      if (b.score === 0 && a.score !== 0) return 1;
      return a.score - b.score;
    });

    return combinedResults.slice(0, searchOptions.maxResults || 50);
  }

  /**
   * Gets fuzzy search suggestions
   * @param {string} query - Partial query
   * @param {number} maxSuggestions - Maximum suggestions to return
   * @returns {Array} Array of suggestion strings
   */
  const getSearchSuggestions = (query, maxSuggestions = 5) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    if (!initFuse()) {
      return [];
    }

    // Prepare chapter data
    const chapters = prepareChapterData(1, 100);
    
    if (chapters.length === 0) {
      return [];
    }

    // Extract unique words from titles and content
    const words = new Set();
    chapters.forEach(chapter => {
      // Extract words from title
      const titleWords = chapter.title.split(/\s+/).filter(word => word.length > 3);
      titleWords.forEach(word => words.add(word.toLowerCase()));
      
      // Extract words from content (sample first 500 chars)
      const contentSample = chapter.content.substring(0, 500);
      const contentWords = contentSample.split(/\s+/).filter(word => word.length > 4);
      contentWords.forEach(word => words.add(word.toLowerCase()));
    });

    // Create word array for Fuse
    const wordArray = Array.from(words).map(word => ({ word }));

    // Configure Fuse for suggestions
    const fuseOptions = {
      keys: ['word'],
      threshold: 0.3, // Stricter matching for suggestions
      minMatchCharLength: 2,
      includeScore: true
    };

    const fuse = new Fuse(wordArray, fuseOptions);
    const results = fuse.search(query, { limit: maxSuggestions });

    return results.map(result => result.item.word);
  }

  /**
   * Calculates search relevance score
   * @param {Object} result - Search result
   * @param {string} query - Search query
   * @returns {number} Relevance score (0-100)
   */
  const calculateRelevanceScore = (result, query) => {
    let score = 100;

    // Adjust based on Fuse score (if available)
    if (result.score !== undefined) {
      score = Math.round((1 - result.score) * 100);
    }

    // Boost for exact matches
    if (!result.fuzzyMatch) {
      score = Math.min(100, score + 20);
    }

    // Boost for multiple matches
    if (result.matchCount > 1) {
      score = Math.min(100, score + Math.min(20, result.matchCount * 2));
    }

    // Boost for title matches
    if (result.chapterTitle && result.chapterTitle.toLowerCase().includes(query.toLowerCase())) {
      score = Math.min(100, score + 15);
    }

    return score;
  }

  /**
   * Highlights fuzzy matches in text
   * @param {string} text - Text to highlight
   * @param {string} query - Search query
   * @param {Object} matches - Fuse.js match objects
   * @returns {string} Text with highlighted matches
   */
  const highlightFuzzyMatches = (text, query, matches = []) => {
    if (!matches || matches.length === 0) {
      return Search.highlightMatches(text, query, false);
    }

    // Sort matches by position (descending) to avoid offset issues
    const sortedMatches = [...matches].sort((a, b) => {
      const aStart = a.indices[0][0];
      const bStart = b.indices[0][0];
      return bStart - aStart;
    });

    // Apply highlights
    let highlightedText = text;
    sortedMatches.forEach(match => {
      const [start, end] = match.indices[0];
      const before = highlightedText.substring(0, start);
      const matchText = highlightedText.substring(start, end + 1);
      const after = highlightedText.substring(end + 1);
      highlightedText = `${before}<mark class="search-highlight">${matchText}</mark>${after}`;
    });

    return highlightedText;
  }

  // Create namespace object
  const FuzzySearch = {
    initFuse: initFuse,
    prepareChapterData: prepareChapterData,
    fuzzySearch: fuzzySearch,
    hybridSearch: hybridSearch,
    getSearchSuggestions: getSearchSuggestions,
    calculateRelevanceScore: calculateRelevanceScore,
    highlightFuzzyMatches: highlightFuzzyMatches
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.FuzzySearch = FuzzySearch;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FuzzySearch;
  }

})();