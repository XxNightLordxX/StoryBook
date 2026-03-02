/**
 * Web Content Discovery Module
 * Discovers and processes content from the web to expand story pools
 */

const WebContentDiscovery = (() => {
  // Content cache to avoid duplicate searches
  const contentCache = new Map();
  
  // Search history to track what we've already searched for
  const searchHistory = new Set();
  
  // Content categories for different pool types
  const contentCategories = {
    social: ['character interactions', 'dialogue', 'relationships', 'friendship', 'trust', 'betrayal'],
    generic: ['introspection', 'observation', 'atmosphere', 'sensory details', 'philosophy'],
    combat: ['fighting techniques', 'battle descriptions', 'combat tactics', 'weapon descriptions'],
    exploration: ['environment descriptions', 'landscape details', 'atmospheric settings', 'world building'],
    lore: ['mythology', 'ancient secrets', 'hidden knowledge', 'mysterious artifacts'],
    emotional: ['feelings', 'emotions', 'inner thoughts', 'psychological states'],
    action: ['movement', 'physical actions', 'dynamic scenes', 'fast-paced moments'],
    dialogue: ['conversations', 'speech patterns', 'character voice', 'natural dialogue'],
    description: ['visual details', 'descriptive language', 'imagery', 'metaphors']
  };
  
  /**
   * Search the web for content related to a specific category
   * @param {string} category - Content category to search for
   * @param {number} count - Number of results to fetch
   * @returns {Promise<Array>} - Array of discovered content
   */
  async function searchWebContent(category, count = 50) {
    const searchTerms = contentCategories[category] || [category];
    const discoveredContent = [];
    
    for (const term of searchTerms) {
      const searchKey = `${category}:${term}`;
      
      // Skip if we've already searched this term recently
      if (searchHistory.has(searchKey)) {
        continue;
      }
      
      searchHistory.add(searchKey);
      
      try {
        // Use web search to find relevant content
        const searchResults = await performWebSearch(term, Math.ceil(count / searchTerms.length));
        
        // Process and filter the results
        const processedContent = processSearchResults(searchResults, category);
        discoveredContent.push(...processedContent);
        
        // Cache the results
        contentCache.set(searchKey, processedContent);
        
      } catch (error) {
        console.warn(`Failed to search for "${term}":`, error.message);
      }
    }
    
    return discoveredContent.slice(0, count);
  }
  
  /**
   * Perform web search using the available search tool
   * @param {string} query - Search query
   * @param {number} numResults - Number of results
   * @returns {Promise<Array>} - Search results
   */
  async function performWebSearch(query, numResults) {
    const results = [];
    
    try {
      // Try Wikipedia API first (free, no API key needed)
      const wikiResults = await searchWikipedia(query, Math.ceil(numResults / 3));
      results.push(...wikiResults);
      
      // Try Open Library API (free, no API key needed)
      const libraryResults = await searchOpenLibrary(query, Math.ceil(numResults / 3));
      results.push(...libraryResults);
      
      // Try Project Gutenberg API (free, no API key needed)
      const gutenbergResults = await searchProjectGutenberg(query, Math.ceil(numResults / 3));
      results.push(...gutenbergResults);
      
    } catch (error) {
      console.warn(`Web search failed for "${query}":`, error.message);
      // Fallback to content generation
      const fallbackResults = await generateFallbackContent(query, numResults);
      results.push(...fallbackResults);
    }
    
    return results.slice(0, numResults);
  }
  
  /**
   * Search Wikipedia API
   * @param {string} query - Search query
   * @param {number} numResults - Number of results
   * @returns {Promise<Array>} - Wikipedia results
   */
  async function searchWikipedia(query, numResults) {
    const results = [];
    
    try {
      // Get random Wikipedia articles
      const response = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
      const data = await response.json();
      
      results.push({
        title: data.title || 'Wikipedia Article',
        snippet: data.extract || '',
        description: data.extract || '',
        url: data.content_urls?.desktop?.page || 'https://en.wikipedia.org',
        timestamp: Date.now(),
        source: 'wikipedia',
        relevance: 0.8
      });
      
    } catch (error) {
      console.warn('Wikipedia search failed:', error.message);
    }
    
    return results;
  }
  
  /**
   * Search Open Library API
   * @param {string} query - Search query
   * @param {number} numResults - Number of results
   * @returns {Promise<Array>} - Open Library results
   */
  async function searchOpenLibrary(query, numResults) {
    const results = [];
    
    try {
      // Search for books
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${numResults}`);
      const data = await response.json();
      
      if (data.docs && data.docs.length > 0) {
        for (const doc of data.docs.slice(0, numResults)) {
          results.push({
            title: doc.title || 'Unknown Title',
            snippet: doc.first_sentence?.[0] || '',
            description: doc.description || '',
            url: `https://openlibrary.org${doc.key}`,
            timestamp: Date.now(),
            source: 'openlibrary',
            relevance: 0.7
          });
        }
      }
      
    } catch (error) {
      console.warn('Open Library search failed:', error.message);
    }
    
    return results;
  }
  
  /**
   * Search Project Gutenberg API
   * @param {string} query - Search query
   * @param {number} numResults - Number of results
   * @returns {Promise<Array>} - Project Gutenberg results
   */
  async function searchProjectGutenberg(query, numResults) {
    const results = [];
    
    try {
      // Get random books from Project Gutenberg
      const response = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(query)}&limit=${numResults}`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        for (const book of data.results.slice(0, numResults)) {
          results.push({
            title: book.title || 'Unknown Title',
            snippet: book.description || '',
            description: book.description || '',
            url: `https://www.gutenberg.org/ebooks/${book.id}`,
            timestamp: Date.now(),
            source: 'gutenberg',
            relevance: 0.75
          });
        }
      }
      
    } catch (error) {
      console.warn('Project Gutenberg search failed:', error.message);
    }
    
    return results;
  }
  
  /**
   * Generate fallback content when web search fails
   * @param {string} query - Search query
   * @param {number} numResults - Number of results
   * @returns {Promise<Array>} - Fallback results
   */
  async function generateFallbackContent(query, numResults) {
    const results = [];
    const contentTemplates = generateContentTemplates(query);

    for (let i = 0; i < numResults; i++) {
      const template = contentTemplates[i % contentTemplates.length];
      const content = generateUniqueContent(template, i, query);

      results.push({
        title: content.title,
        snippet: content.snippet,
        description: content.description,
        url: `generated://${query.replace(/\s+/g, '-')}/${i}`,
        timestamp: Date.now(),
        source: 'fallback_generation',
        relevance: 0.5
      });
    }

    return results;
  }
  
  /**
   * Generate content templates based on query
   * @param {string} query - Search query
   * @returns {Array} - Content templates
   */
  function generateContentTemplates(query) {
    const templates = [];
    const words = query.split(/\s+/);
    
    // Generate various sentence structures
    const structures = [
      (w) => `The ${w[0]} of ${w[1] || 'existence'} reveals ${w[2] || 'truth'}`,
      (w) => `${w[0] || 'In'} the realm of ${w[1] || 'possibility'}, ${w[2] || 'discovery'} awaits`,
      (w) => `A ${w[0] || 'profound'} understanding of ${w[1] || 'nature'} emerges`,
      (w) => `The ${w[0] || 'essence'} of ${w[1] || 'being'} transforms through ${w[2] || 'experience'}`,
      (w) => `${w[0] || 'Beyond'} the ${w[1] || 'horizon'} lies ${w[2] || 'destiny'}`,
      (w) => `In the ${w[0] || 'depths'} of ${w[1] || 'consciousness'}, ${w[2] || 'meaning'} unfolds`,
      (w) => `The ${w[0] || 'journey'} through ${w[1] || 'time'} reveals ${w[2] || 'purpose'}`,
      (w) => `${w[0] || 'Amidst'} the ${w[1] || 'chaos'} of ${w[2] || 'change'}, ${w[3] || 'hope'} persists`,
      (w) => `A ${w[0] || 'new'} perspective on ${w[1] || 'reality'} emerges from ${w[2] || 'contemplation'}`,
      (w) => `The ${w[0] || 'interconnection'} of ${w[1] || 'all things'} becomes ${w[2] || 'apparent'}`
    ];
    
    for (const structure of structures) {
      templates.push({
        structure: structure,
        words: words,
        variations: generateWordVariations(words)
      });
    }
    
    return templates;
  }
  
  /**
   * Generate word variations for content diversity
   * @param {Array} words - Original words
   * @returns {Array} - Word variations
   */
  function generateWordVariations(words) {
    const variations = [];
    
    // Synonyms and related words
    const synonymMap = {
      'character': ['person', 'individual', 'being', 'soul', 'entity'],
      'story': ['tale', 'narrative', 'account', 'chronicle', 'legend'],
      'world': ['realm', 'universe', 'domain', 'existence', 'reality'],
      'time': ['moment', 'era', 'age', 'epoch', 'duration'],
      'power': ['strength', 'force', 'energy', 'might', 'influence'],
      'love': ['affection', 'devotion', 'passion', 'care', 'adoration'],
      'fear': ['terror', 'dread', 'anxiety', 'apprehension', 'alarm'],
      'hope': ['optimism', 'faith', 'confidence', 'trust', 'belief'],
      'truth': ['reality', 'fact', 'verity', 'authenticity', 'genuineness'],
      'life': ['existence', 'being', 'living', 'vitality', 'animation']
    };
    
    for (const word of words) {
      const lowerWord = word.toLowerCase();
      if (synonymMap[lowerWord]) {
        variations.push(synonymMap[lowerWord]);
      } else {
        variations.push([word]);
      }
    }
    
    return variations;
  }
  
  /**
   * Generate unique content from template
   * @param {Object} template - Content template
   * @param {number} index - Content index
   * @param {string} query - Original query
   * @returns {Object} - Generated content
   */
  function generateUniqueContent(template, index, query) {
    const { structure, words, variations } = template;
    
    // Select words based on index to ensure uniqueness
    const selectedWords = words.map((word, i) => {
      if (variations[i] && variations[i].length > 0) {
        const variationIndex = (index + i) % variations[i].length;
        return variations[i][variationIndex];
      }
      return word;
    });
    
    // Generate content using structure
    const contentText = structure(selectedWords);
    
    // Add uniqueness modifiers
    const modifiers = [
      'profoundly', 'deeply', 'truly', 'genuinely', 'authentically',
      'remarkably', 'extraordinarily', 'incredibly', 'amazingly', 'surprisingly'
    ];
    
    const modifier = modifiers[index % modifiers.length];
    const enhancedText = `${modifier} ${contentText}`;
    
    return {
      title: generateTitle(enhancedText, index),
      snippet: enhancedText.substring(0, 150) + '...',
      description: enhancedText
    };
  }
  
  /**
   * Generate a title from content
   * @param {string} text - Content text
   * @param {number} index - Content index
   * @returns {string} - Generated title
   */
  function generateTitle(text, index) {
    const words = text.split(/\s+/);
    const titleWords = words.slice(0, 6).join(' ');
    
    // Capitalize title
    return titleWords
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  /**
   * Process search results and extract relevant content
   * @param {Object} searchResults - Raw search results
   * @param {string} category - Content category
   * @returns {Array} - Processed content
   */
  function processSearchResults(searchResults, category) {
    const processed = [];
    
    if (!searchResults.results || !Array.isArray(searchResults.results)) {
      return processed;
    }
    
    for (const result of searchResults.results) {
      try {
        const content = extractContentFromResult(result, category);
        if (content && isContentUnique(content, processed)) {
          processed.push(content);
        }
      } catch (error) {
        console.warn('Failed to process result:', error.message);
      }
    }
    
    return processed;
  }
  
  /**
   * Extract content from a search result
   * @param {Object} result - Search result
   * @param {string} category - Content category
   * @returns {Object|null} - Extracted content
   */
  function extractContentFromResult(result, category) {
    // Extract text content from the result
    const text = result.snippet || result.description || result.title || '';
    
    if (!text || text.length < 50) {
      return null;
    }
    
    // Create content object based on category
    return {
      type: category,
      text: text,
      source: result.url || 'web',
      timestamp: Date.now(),
      relevance: calculateRelevance(text, category)
    };
  }
  
  /**
   * Calculate relevance score for content
   * @param {string} text - Content text
   * @param {string} category - Content category
   * @returns {number} - Relevance score (0-1)
   */
  function calculateRelevance(text, category) {
    // Simple relevance calculation based on keyword matching
    const keywords = contentCategories[category] || [category];
    let matches = 0;
    
    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'gi');
      matches += (text.match(regex) || []).length;
    }
    
    return Math.min(matches / 10, 1);
  }
  
  /**
   * Check if content is unique compared to existing content
   * @param {Object} content - Content to check
   * @param {Array} existingContent - Existing content array
   * @returns {boolean} - True if unique
   */
  function isContentUnique(content, existingContent) {
    const fingerprint = generateContentFingerprint(content);
    
    for (const existing of existingContent) {
      const existingFingerprint = generateContentFingerprint(existing);
      if (fingerprint === existingFingerprint) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Generate a unique fingerprint for content
   * @param {Object} content - Content object
   * @returns {string} - Content fingerprint
   */
  function generateContentFingerprint(content) {
    // Create a hash based on normalized text
    const normalizedText = content.text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < normalizedText.length; i++) {
      const char = normalizedText.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash.toString(36);
  }
  
  /**
   * Discover content for multiple categories
   * @param {Array<string>} categories - Categories to search
   * @param {number} countPerCategory - Items per category
   * @returns {Promise<Object>} - Discovered content by category
   */
  async function discoverMultipleCategories(categories, countPerCategory = 50) {
    const results = {};
    
    for (const category of categories) {
      try {
        results[category] = await searchWebContent(category, countPerCategory);
      } catch (error) {
        console.warn(`Failed to discover content for category "${category}":`, error.message);
        results[category] = [];
      }
    }
    
    return results;
  }
  
  /**
   * Clear the content cache
   */
  function clearCache() {
    contentCache.clear();
    searchHistory.clear();
  }
  
  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  function getCacheStats() {
    return {
      cachedItems: contentCache.size,
      searchHistorySize: searchHistory.size,
      totalCachedContent: Array.from(contentCache.values()).reduce((sum, arr) => sum + arr.length, 0)
    };
  }
  
  // Public API
  return {
    searchWebContent,
    discoverMultipleCategories,
    clearCache,
    getCacheStats,
    contentCategories
  };
})();

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebContentDiscovery;
} else {
  window.WebContentDiscovery = WebContentDiscovery;
}