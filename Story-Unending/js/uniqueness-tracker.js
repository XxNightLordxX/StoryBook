/**
 * Uniqueness Tracking System
 * Ensures absolute uniqueness across all story content
 */

const UniquenessTracker = (() => {
  // Global content registry
  const globalContentRegistry = new Map();
  
  // Content fingerprints for fast lookup
  const fingerprintIndex = new Map();
  
  // Content usage tracking
  const usageTracker = new Map();
  
  // Similarity index for near-duplicate detection
  const similarityIndex = new Map();
  
  // Configuration
  const config = {
    similarityThreshold: 0.85, // Threshold for considering content similar
    minContentLength: 10, // Minimum content length to track
    maxHistorySize: 100000, // Maximum items in history
    enableSimilarityCheck: true,
    enableExactMatchCheck: true,
    enableSemanticCheck: true
  };
  
  /**
   * Initialize the uniqueness tracker
   * @param {Object} options - Configuration options
   */
  function initialize(options = {}) {
    Object.assign(config, options);
    
    // Load persisted data if available
    loadPersistedData();
  }
  
  /**
   * Check if content is unique
   * @param {string} content - Content to check
   * @param {Object} metadata - Content metadata
   * @returns {Object} - Uniqueness check result
   */
  function checkUniqueness(content, metadata = {}) {
    const result = {
      isUnique: true,
      exactMatch: false,
      similarContent: [],
      semanticMatch: false,
      confidence: 1.0,
      details: {}
    };
    
    // Skip short content
    if (content.length < config.minContentLength) {
      result.isUnique = true;
      result.details.reason = 'content_too_short';
      return result;
    }
    
    // Generate fingerprint
    const fingerprint = generateFingerprint(content);
    
    // Check for exact matches
    if (config.enableExactMatchCheck) {
      const exactMatch = checkExactMatch(fingerprint);
      if (exactMatch) {
        result.isUnique = false;
        result.exactMatch = true;
        result.details.exactMatch = exactMatch;
        return result;
      }
    }
    
    // Check for similar content
    if (config.enableSimilarityCheck) {
      const similar = findSimilarContent(content, fingerprint);
      if (similar.length > 0) {
        result.similarContent = similar;
        result.confidence = 1.0 - Math.max(...similar.map(s => s.similarity));
        
        if (result.confidence < (1.0 - config.similarityThreshold)) {
          result.isUnique = false;
          result.details.similarContent = similar;
          return result;
        }
      }
    }
    
    // Check for semantic similarity
    if (config.enableSemanticCheck) {
      const semanticMatch = checkSemanticSimilarity(content, metadata);
      if (semanticMatch) {
        result.semanticMatch = true;
        result.details.semanticMatch = semanticMatch;
        result.confidence *= 0.9;
      }
    }
    
    return result;
  }
  
  /**
   * Register content as used
   * @param {string} content - Content to register
   * @param {Object} metadata - Content metadata
   * @returns {Object} - Registration result
   */
  function registerContent(content, metadata = {}) {
    const result = {
      registered: false,
      reason: '',
      fingerprint: null
    };
    
    // Check uniqueness first
    const uniquenessCheck = checkUniqueness(content, metadata);
    
    if (!uniquenessCheck.isUnique) {
      result.registered = false;
      result.reason = 'not_unique';
      result.details = uniquenessCheck.details;
      return result;
    }
    
    // Generate fingerprint
    const fingerprint = generateFingerprint(content);
    
    // Register content
    const contentEntry = {
      content: content,
      fingerprint: fingerprint,
      timestamp: Date.now(),
      metadata: metadata,
      usageCount: 0
    };
    
    globalContentRegistry.set(fingerprint, contentEntry);
    fingerprintIndex.set(fingerprint, contentEntry);
    
    // Add to similarity index
    if (config.enableSimilarityCheck) {
      addToSimilarityIndex(content, fingerprint, metadata);
    }
    
    // Track usage
    trackUsage(fingerprint, metadata);
    
    result.registered = true;
    result.fingerprint = fingerprint;
    
    // Persist if needed
    if (globalContentRegistry.size % 100 === 0) {
      savePersistedData();
    }
    
    return result;
  }
  
  /**
   * Generate a unique fingerprint for content
   * @param {string} content - Content to fingerprint
   * @returns {string} - Content fingerprint
   */
  function generateFingerprint(content) {
    // Normalize content
    const normalized = normalizeContent(content);
    
    // Generate hash
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    // Add length and word count for better uniqueness
    const wordCount = normalized.split(/\s+/).length;
    const extendedHash = `${hash.toString(36)}_${normalized.length}_${wordCount}`;
    
    return extendedHash;
  }
  
  /**
   * Normalize content for comparison
   * @param {string} content - Content to normalize
   * @returns {string} - Normalized content
   */
  function normalizeContent(content) {
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Check for exact match
   * @param {string} fingerprint - Content fingerprint
   * @returns {Object|null} - Matched content or null
   */
  function checkExactMatch(fingerprint) {
    return fingerprintIndex.get(fingerprint) || null;
  }
  
  /**
   * Find similar content
   * @param {string} content - Content to compare
   * @param {string} fingerprint - Content fingerprint
   * @returns {Array} - Similar content items
   */
  function findSimilarContent(content, fingerprint) {
    const similar = [];
    const normalized = normalizeContent(content);
    const words = normalized.split(/\s+/);
    
    // Check similarity index
    for (const [key, entries] of similarityIndex.entries()) {
      for (const entry of entries) {
        if (entry.fingerprint === fingerprint) {
          continue; // Skip self
        }
        
        const similarity = calculateSimilarity(normalized, entry.normalized);
        
        if (similarity >= config.similarityThreshold) {
          similar.push({
            fingerprint: entry.fingerprint,
            similarity: similarity,
            content: entry.content
          });
        }
      }
    }
    
    // Sort by similarity (highest first)
    similar.sort((a, b) => b.similarity - a.similarity);
    
    return similar.slice(0, 10); // Return top 10 matches
  }
  
  /**
   * Calculate similarity between two content strings
   * @param {string} content1 - First content
   * @param {string} content2 - Second content
   * @returns {number} - Similarity score (0-1)
   */
  function calculateSimilarity(content1, content2) {
    // Jaccard similarity for word sets
    const words1 = new Set(content1.split(/\s+/));
    const words2 = new Set(content2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    const jaccard = intersection.size / union.size;
    
    // Levenshtein distance for character similarity
    const levenshtein = calculateLevenshtein(content1, content2);
    const maxLength = Math.max(content1.length, content2.length);
    const levenshteinSimilarity = 1 - (levenshtein / maxLength);
    
    // Combine both metrics
    return (jaccard * 0.6) + (levenshteinSimilarity * 0.4);
  }
  
  /**
   * Calculate Levenshtein distance
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} - Levenshtein distance
   */
  function calculateLevenshtein(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  /**
   * Check semantic similarity
   * @param {string} content - Content to check
   * @param {Object} metadata - Content metadata
   * @returns {Object|null} - Semantic match or null
   */
  function checkSemanticSimilarity(content, metadata) {
    // Extract key terms and concepts
    const terms = extractKeyTerms(content);
    
    // Check if similar terms exist in registry
    for (const [fingerprint, entry] of globalContentRegistry.entries()) {
      const entryTerms = extractKeyTerms(entry.content);
      
      // Calculate term overlap
      const overlap = calculateTermOverlap(terms, entryTerms);
      
      if (overlap > 0.7) {
        return {
          fingerprint: fingerprint,
          overlap: overlap,
          terms: terms,
          entryTerms: entryTerms
        };
      }
    }
    
    return null;
  }
  
  /**
   * Extract key terms from content
   * @param {string} content - Content to analyze
   * @returns {Set} - Set of key terms
   */
  function extractKeyTerms(content) {
    const words = content.toLowerCase().split(/\s+/);
    const terms = new Set();
    
    // Extract meaningful words (length > 3)
    for (const word of words) {
      if (word.length > 3 && !isStopWord(word)) {
        terms.add(word);
      }
    }
    
    return terms;
  }
  
  /**
   * Check if word is a stop word
   * @param {string} word - Word to check
   * @returns {boolean} - True if stop word
   */
  function isStopWord(word) {
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
      'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been', 'this', 'that',
      'with', 'they', 'from', 'what', 'when', 'which', 'will', 'more', 'some',
      'like', 'than', 'into', 'just', 'over', 'such', 'your', 'about', 'would',
      'after', 'being', 'before', 'their', 'were', 'said', 'each', 'does'
    ]);
    
    return stopWords.has(word);
  }
  
  /**
   * Calculate term overlap between two term sets
   * @param {Set} terms1 - First term set
   * @param {Set} terms2 - Second term set
   * @returns {number} - Overlap ratio (0-1)
   */
  function calculateTermOverlap(terms1, terms2) {
    const intersection = new Set([...terms1].filter(x => terms2.has(x)));
    const union = new Set([...terms1, ...terms2]);
    
    return intersection.size / union.size;
  }
  
  /**
   * Add content to similarity index
   * @param {string} content - Content to add
   * @param {string} fingerprint - Content fingerprint
   * @param {Object} metadata - Content metadata
   */
  function addToSimilarityIndex(content, fingerprint, metadata) {
    const normalized = normalizeContent(content);
    const words = normalized.split(/\s+/);
    
    // Index by first few words for faster lookup
    const key = words.slice(0, 3).join('_');
    
    if (!similarityIndex.has(key)) {
      similarityIndex.set(key, []);
    }
    
    similarityIndex.get(key).push({
      fingerprint: fingerprint,
      normalized: normalized,
      content: content,
      metadata: metadata
    });
  }
  
  /**
   * Track content usage
   * @param {string} fingerprint - Content fingerprint
   * @param {Object} metadata - Usage metadata
   */
  function trackUsage(fingerprint, metadata) {
    if (!usageTracker.has(fingerprint)) {
      usageTracker.set(fingerprint, []);
    }
    
    usageTracker.get(fingerprint).push({
      timestamp: Date.now(),
      metadata: metadata
    });
    
    // Update usage count in registry
    const entry = globalContentRegistry.get(fingerprint);
    if (entry) {
      entry.usageCount++;
    }
  }
  
  /**
   * Get content usage statistics
   * @param {string} fingerprint - Content fingerprint (optional)
   * @returns {Object} - Usage statistics
   */
  function getUsageStats(fingerprint = null) {
    if (fingerprint) {
      const usage = usageTracker.get(fingerprint);
      const entry = globalContentRegistry.get(fingerprint);
      
      return {
        fingerprint: fingerprint,
        usageCount: usage ? usage.length : 0,
        lastUsed: usage ? usage[usage.length - 1]?.timestamp : null,
        entry: entry
      };
    }
    
    // Return global stats
    const totalUsage = Array.from(usageTracker.values())
      .reduce((sum, arr) => sum + arr.length, 0);
    
    return {
      totalContent: globalContentRegistry.size,
      totalUsage: totalUsage,
      averageUsage: totalUsage / globalContentRegistry.size,
      mostUsed: getMostUsedContent(10)
    };
  }
  
  /**
   * Get most used content
   * @param {number} limit - Number of items to return
   * @returns {Array} - Most used content items
   */
  function getMostUsedContent(limit = 10) {
    const sorted = Array.from(globalContentRegistry.entries())
      .sort((a, b) => b[1].usageCount - a[1].usageCount)
      .slice(0, limit);
    
    return sorted.map(([fingerprint, entry]) => ({
      fingerprint: fingerprint,
      content: entry.content,
      usageCount: entry.usageCount,
      lastUsed: entry.timestamp
    }));
  }
  
  /**
   * Get global statistics
   * @returns {Object} - Global statistics
   */
  function getGlobalStats() {
    return {
      totalContent: globalContentRegistry.size,
      totalUsage: Array.from(usageTracker.values())
        .reduce((sum, arr) => sum + arr.length, 0),
      similarityIndexSize: similarityIndex.size,
      fingerprintIndexSize: fingerprintIndex.size,
      config: { ...config }
    };
  }
  
  /**
   * Save persisted data to localStorage
   */
  function savePersistedData() {
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      // Save only essential data to avoid size limits
      const dataToSave = {
        fingerprints: Array.from(fingerprintIndex.keys()),
        timestamp: Date.now()
      };
      
      localStorage.setItem('uniquenessTracker', JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Failed to save uniqueness tracker data:', error.message);
    }
  }
  
  /**
   * Load persisted data from localStorage
   */
  function loadPersistedData() {
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const savedData = localStorage.getItem('uniquenessTracker');
      
      if (savedData) {
        const data = JSON.parse(savedData);
        // Fingerprints are loaded, but content needs to be regenerated
        // This is a simplified approach - in production, you'd want full persistence
      }
    } catch (error) {
      console.warn('Failed to load uniqueness tracker data:', error.message);
    }
  }
  
  /**
   * Clear all tracked data
   */
  function clearAll() {
    globalContentRegistry.clear();
    fingerprintIndex.clear();
    usageTracker.clear();
    similarityIndex.clear();
    
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('uniquenessTracker');
    }
  }
  
  /**
   * Update configuration
   * @param {Object} newConfig - New configuration values
   */
  function updateConfig(newConfig) {
    Object.assign(config, newConfig);
  }
  
  /**
   * Get current configuration
   * @returns {Object} - Current configuration
   */
  function getConfig() {
    return { ...config };
  }
  
  // Public API
  return {
    initialize,
    checkUniqueness,
    registerContent,
    getUsageStats,
    getGlobalStats,
    getMostUsedContent,
    savePersistedData,
    loadPersistedData,
    clearAll,
    updateConfig,
    getConfig
  };
})();

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UniquenessTracker;
} else {
  window.UniquenessTracker = UniquenessTracker;
}