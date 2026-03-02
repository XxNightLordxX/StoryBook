/**
 * Unified Pool Manager
 * Combines all pool expansion systems into a single, unified system
 * Features from DynamicPoolExpansion, OptimizedPoolManager, and StoryPoolIntegration
 */

const UnifiedPoolManager = (() => {
  // Pool registry
  const poolRegistry = new Map();
  
  // Track used content to prevent duplicates
  const usedContentRegistry = new Map();
  
  // Track new pools created dynamically
  const dynamicPools = new Map();
  
  // Story engine pool references
  let storyEnginePools = null;
  
  // Internal pool storage (used by story engine)
  const internalPools = {
    adjectives: null,
    nouns: null,
    actions: null,
    patterns: null
  };
  
  // Tracking
  let chapterCount = 0;
  let lastExpansionChapter = 0;
  let expansionInProgress = false;
  let isIntegrated = false;
  
  // Configuration
  const config = {
    // Expansion settings
    expansionCount: 40, // Number of items to add per pool per expansion
    expansionInterval: 10, // Expand every N chapters (periodic expansion)
    proactiveThreshold: 0.20, // Expand when pool is 20% full
    
    // Pool size limits
    minPoolSize: 100, // Minimum pool size before expansion
    maxPoolSize: 10000, // Maximum pool size to prevent memory issues
    
    // Feature flags
    enableWebSearch: true, // Enable web search for new content
    enableDynamicPoolCreation: true, // Enable automatic pool creation
    enablePeriodicExpansion: true, // Enable periodic expansion
    enableProactiveExpansion: true, // Enable proactive expansion
    enablePredictiveDetection: true, // Enable predictive duplicate detection
    
    // Storage
    persistenceEnabled: true, // Enable persistence of expanded pools
    persistenceKey: 'unifiedPoolManager_data',
    
    // Uniqueness
    uniquenessThreshold: 0.95, // Similarity threshold for duplicate detection

    // Logging
    enableLogging: false, // Enable operational logging (disable in production)
  };

  /**
   * Internal logging helper - only logs when enableLogging is true
   * @param {string} message - Message to log
   */
  function log(message) {
    if (config.enableLogging) {
    }
  }
  
  /**
   * Initialize the unified pool manager
   * @param {Object} initialPools - Initial pool configuration
   * @param {Object} options - Configuration options
   */
  function initialize(initialPools = {}, options = {}) {
    Object.assign(config, options);
    
    // Register initial pools
    for (const [poolName, poolData] of Object.entries(initialPools)) {
      registerPool(poolName, poolData);
    }
    
    // Load persisted data if available
    if (config.persistenceEnabled) {
      loadPersistedData();
    }
    
    // Register story engine pools
    registerStoryPools();
    
    isIntegrated = true;
    
    log('[UnifiedPoolManager] Initialized');
    log(`  Expansion Interval: ${config.expansionInterval} chapters`);
    log(`  Proactive Threshold: ${(config.proactiveThreshold * 100).toFixed(0)}%`);
    log(`  Items to Add: ${config.expansionCount} per pool`);
    log(`  Web Search: ${config.enableWebSearch ? 'Enabled' : 'Disabled'}`);
    log(`  Periodic Expansion: ${config.enablePeriodicExpansion ? 'Enabled' : 'Disabled'}`);
    log(`  Proactive Expansion: ${config.enableProactiveExpansion ? 'Enabled' : 'Disabled'}`);
  }
  
  /**
   * Register a pool for expansion
   * @param {string} poolName - Name of the pool
   * @param {Object} poolData - Pool data structure
   */
  function registerPool(poolName, poolData) {
    poolRegistry.set(poolName, {
      name: poolName,
      items: poolData.items || [],
      type: poolData.type || 'generic',
      category: poolData.category || 'default',
      usedItems: new Set(),
      expansionHistory: [],
      lastExpanded: null,
      expansionCount: 0,
      metadata: poolData.metadata || {}
    });
    
    // Initialize used content tracking for this pool
    if (!usedContentRegistry.has(poolName)) {
      usedContentRegistry.set(poolName, new Set());
    }
  }
  
  /**
   * Register story engine pools with the unified pool manager
   */
  function registerStoryPools() {
    // Register title generation pools
    registerPool('titleAdjectives', {
      items: getAdjectives(),
      type: 'array',
      category: 'title',
      metadata: {
        description: 'Adjectives for dynamic title generation',
        source: 'story-engine'
      }
    });
    
    registerPool('titleNouns', {
      items: getNouns(),
      type: 'array',
      category: 'title',
      metadata: {
        description: 'Nouns for dynamic title generation',
        source: 'story-engine'
      }
    });
    
    registerPool('titleActions', {
      items: getActions(),
      type: 'array',
      category: 'title',
      metadata: {
        description: 'Actions for dynamic title generation',
        source: 'story-engine'
      }
    });
    
    registerPool('titlePatterns', {
      items: getPatterns(),
      type: 'array',
      category: 'title',
      metadata: {
        description: 'Title patterns for dynamic title generation',
        source: 'story-engine'
      }
    });
    
    log('[UnifiedPoolManager] Registered 4 story engine pools');
  }
  
  /**
   * Get pool data
   * @param {string} poolName - Name of the pool
   * @returns {Object|null} - Pool data or null if not found
   */
  function getPool(poolName) {
    return poolRegistry.get(poolName) || null;
  }
  
  /**
   * Get pool statistics
   * @param {string} poolName - Name of the pool (optional)
   * @returns {Object} - Pool statistics
   */
  function getPoolStats(poolName = null) {
    if (poolName) {
      const pool = poolRegistry.get(poolName);
      if (!pool) {
        return { error: `Pool "${poolName}" not found` };
      }
      
      return {
        name: poolName,
        totalItems: pool.items.length,
        usedItems: pool.usedItems.size,
        availableItems: pool.items.length - pool.usedItems.size,
        expansionCount: pool.expansionCount,
        lastExpanded: pool.lastExpanded,
        type: pool.type,
        category: pool.category
      };
    }
    
    // Return stats for all pools
    const stats = {};
    for (const [name, pool] of poolRegistry.entries()) {
      stats[name] = {
        totalItems: pool.items.length,
        usedItems: pool.usedItems.size,
        availableItems: pool.items.length - pool.usedItems.size,
        expansionCount: pool.expansionCount,
        lastExpanded: pool.lastExpanded,
        type: pool.type,
        category: pool.category
      };
    }
    
    return stats;
  }
  
  /**
   * Check if a pool needs expansion
   * @param {string} poolName - Name of the pool
   * @returns {boolean} - True if expansion is needed
   */
  function needsExpansion(poolName) {
    const pool = poolRegistry.get(poolName);
    
    if (!pool) {
      return false;
    }
    
    const availableItems = pool.items.length - pool.usedItems.size;
    const totalItems = pool.items.length;
    const availableRatio = availableItems / totalItems;
    
    // Expand if available items are below threshold
    return availableRatio < config.proactiveThreshold;
  }
  
  /**
   * Check all pools for expansion needs
   * @returns {Array} - List of pools that need expansion
   */
  function checkAllPoolsForExpansion() {
    const poolsNeedingExpansion = [];
    
    for (const [poolName, pool] of poolRegistry.entries()) {
      if (needsExpansion(poolName)) {
        poolsNeedingExpansion.push(poolName);
      }
    }
    
    return poolsNeedingExpansion;
  }
  
  /**
   * Expand a specific pool
   * @param {string} poolName - Name of the pool to expand
   * @param {Object} context - Story context for relevance
   * @returns {Promise<Object>} - Expansion result
   */
  async function expandPool(poolName, context = {}) {
    const pool = poolRegistry.get(poolName);
    
    if (!pool) {
      throw new Error(`Pool "${poolName}" not found`);
    }
    
    // Check if pool is at max size
    if (pool.items.length >= config.maxPoolSize) {
      return { itemsAdded: 0, reason: 'max_size_reached' };
    }
    
    const itemsToAdd = [];
    const sources = [];
    
    // Generate new content from web search
    if (config.enableWebSearch && typeof WebContentDiscovery !== 'undefined') {
      try {
        const webContent = await WebContentDiscovery.searchWebContent(
          pool.category,
          config.expansionCount
        );
        
        for (const content of webContent) {
          const processedItem = processContentForPool(content, pool);
          if (processedItem && isContentUniqueForPool(processedItem, poolName)) {
            itemsToAdd.push(processedItem);
            sources.push('web');
          }
        }
      } catch (error) {
        console.warn(`[UnifiedPoolManager] Web search failed for pool "${poolName}":`, error.message);
      }
    }
    
    // Generate procedural content if needed
    const proceduralItems = generateProceduralContent(
      pool,
      config.expansionCount - itemsToAdd.length,
      context
    );
    
    for (const item of proceduralItems) {
      if (isContentUniqueForPool(item, poolName)) {
        itemsToAdd.push(item);
        sources.push('procedural');
      }
    }
    
    // Add unique items to the pool
    for (const item of itemsToAdd.slice(0, config.expansionCount)) {
      pool.items.push(item);
    }
    
    // Update pool metadata
    pool.lastExpanded = Date.now();
    pool.expansionCount++;
    pool.expansionHistory.push({
      timestamp: Date.now(),
      itemsAdded: itemsToAdd.length,
      sources: sources
    });
    
    return {
      itemsAdded: itemsToAdd.length,
      poolSize: pool.items.length,
      availableItems: pool.items.length - pool.usedItems.size,
      sources: sources
    };
  }
  
  /**
   * Expand all pools with new unique content
   * @param {Object} context - Current story context for relevance
   * @returns {Promise<Object>} - Expansion results
   */
  async function expandAllPools(context = {}) {
    const results = {
      expandedPools: [],
      newItemsAdded: 0,
      newPoolsCreated: [],
      errors: []
    };
    
    // Expand each registered pool
    for (const [poolName, pool] of poolRegistry.entries()) {
      try {
        const expansionResult = await expandPool(poolName, context);
        
        if (expansionResult.itemsAdded > 0) {
          results.expandedPools.push({
            name: poolName,
            itemsAdded: expansionResult.itemsAdded,
            sources: expansionResult.sources
          });
          results.newItemsAdded += expansionResult.itemsAdded;
        }
        
      } catch (error) {
        results.errors.push({
          pool: poolName,
          error: error.message
        });
      }
    }
    
    // Create new dynamic pools based on discovered themes
    if (config.enableDynamicPoolCreation) {
      const newPools = await createDynamicPools(context);
      results.newPoolsCreated = newPools;
    }
    
    // Persist the expanded pools
    if (config.persistenceEnabled) {
      savePersistedData();
    }
    
    return results;
  }
  
  /**
   * Expand pools proactively when needed
   * @param {Object} context - Story context
   * @returns {Promise<Object>} - Expansion results
   */
  async function expandPoolsProactively(context = {}) {
    if (expansionInProgress) {
      log('[UnifiedPoolManager] Expansion already in progress, skipping');
      return { skipped: true, reason: 'expansion_in_progress' };
    }
    
    expansionInProgress = true;
    
    try {
      const poolsNeedingExpansion = checkAllPoolsForExpansion();
      
      if (poolsNeedingExpansion.length === 0) {
        return { expanded: 0, reason: 'no_pools_need_expansion' };
      }
      
      log(`[UnifiedPoolManager] Proactively expanding ${poolsNeedingExpansion.length} pools...`);
      
      const results = {
        expandedPools: [],
        totalItemsAdded: 0
      };
      
      for (const poolName of poolsNeedingExpansion) {
        try {
          const result = await expandPool(poolName, context);
          
          if (result.itemsAdded > 0) {
            results.expandedPools.push({
              name: poolName,
              itemsAdded: result.itemsAdded,
              sources: result.sources
            });
            results.totalItemsAdded += result.itemsAdded;
          }
        } catch (error) {
          console.error(`[UnifiedPoolManager] Failed to expand pool "${poolName}":`, error.message);
        }
      }
      
      log(`[UnifiedPoolManager] Proactive expansion complete: ${results.totalItemsAdded} items added to ${results.expandedPools.length} pools`);
      
      return results;
    } finally {
      expansionInProgress = false;
    }
  }
  
  /**
   * Periodic expansion check (called every N chapters)
   * @param {number} chapterNum - Current chapter number
   * @param {Object} context - Story context
   * @returns {Promise<Object>} - Expansion results
   */
  async function periodicExpansionCheck(chapterNum, context = {}) {
    if (!config.enablePeriodicExpansion) {
      return { skipped: true, reason: 'periodic_expansion_disabled' };
    }
    
    chapterCount = chapterNum;
    
    // Check if it's time for periodic expansion
    if (chapterNum - lastExpansionChapter < config.expansionInterval) {
      return { skipped: true, reason: 'not_time_yet', nextExpansion: lastExpansionChapter + config.expansionInterval };
    }
    
    log(`[UnifiedPoolManager] Periodic expansion check at chapter ${chapterNum}`);
    
    // Expand all pools
    const results = await expandAllPools(context);
    
    lastExpansionChapter = chapterNum;
    
    return results;
  }
  
  /**
   * Get a unique item from a pool
   * @param {string} poolName - Name of the pool
   * @returns {*} - Unique item or null if pool is exhausted
   */
  function getUniqueItem(poolName) {
    const pool = poolRegistry.get(poolName);
    
    if (!pool) {
      return null;
    }
    
    // Find an unused item
    for (let i = 0; i < pool.items.length; i++) {
      const item = pool.items[i];
      const itemKey = generateContentFingerprint(item);
      
      if (!pool.usedItems.has(itemKey)) {
        pool.usedItems.add(itemKey);
        return item;
      }
    }
    
    // Pool is exhausted
    return null;
  }
  
  /**
   * Process content for a pool
   * @param {*} content - Content to process
   * @param {Object} pool - Pool object
   * @returns {*} - Processed content
   */
  function processContentForPool(content, pool) {
    switch (pool.type) {
      case 'paragraph':
        return transformToParagraph(content, pool.metadata);
      case 'title':
        return transformToTitle(content, pool.metadata);
      case 'dialogue':
        return transformToDialogue(content, pool.metadata);
      case 'description':
        return transformToDescription(content, pool.metadata);
      case 'array':
      default:
        return content;
    }
  }
  
  /**
   * Transform content to paragraph
   * @param {*} text - Text to transform
   * @param {Object} metadata - Metadata
   * @returns {string} - Transformed paragraph
   */
  function transformToParagraph(text, metadata) {
    if (typeof text === 'string') {
      return text;
    }
    return String(text);
  }
  
  /**
   * Transform content to title
   * @param {*} text - Text to transform
   * @param {Object} metadata - Metadata
   * @returns {string} - Transformed title
   */
  function transformToTitle(text, metadata) {
    if (typeof text === 'string') {
      return text;
    }
    return String(text);
  }
  
  /**
   * Transform content to dialogue
   * @param {*} text - Text to transform
   * @param {Object} metadata - Metadata
   * @returns {string} - Transformed dialogue
   */
  function transformToDialogue(text, metadata) {
    if (typeof text === 'string') {
      return text;
    }
    return String(text);
  }
  
  /**
   * Transform content to description
   * @param {*} text - Text to transform
   * @param {Object} metadata - Metadata
   * @returns {string} - Transformed description
   */
  function transformToDescription(text, metadata) {
    if (typeof text === 'string') {
      return text;
    }
    return String(text);
  }
  
  /**
   * Generate procedural content for a pool
   * @param {Object} pool - Pool object
   * @param {number} count - Number of items to generate
   * @param {Object} context - Story context
   * @returns {Array} - Generated items
   */
  function generateProceduralContent(pool, count, context) {
    const items = [];
    
    for (let i = 0; i < count; i++) {
      const item = generateProceduralItem(pool, context);
      if (item) {
        items.push(item);
      }
    }
    
    return items;
  }
  
  /**
   * Generate a single procedural item
   * @param {Object} pool - Pool object
   * @param {Object} context - Story context
   * @returns {*} - Generated item
   */
  function generateProceduralItem(pool, context) {
    // Simple procedural generation based on pool type
    switch (pool.type) {
      case 'title':
        return generateTitleWord(pool.name);
      default:
        return null;
    }
  }
  
  /**
   * Generate a title word
   * @param {string} poolName - Name of the pool
   * @returns {string} - Generated title word
   */
  function generateTitleWord(poolName) {
    const adjectives = [
      'Silent', 'Dark', 'Hidden', 'Lost', 'Forgotten', 'Eternal', 'Broken', 'Shattered',
      'Whispering', 'Burning', 'Frozen', 'Ancient', 'Sacred', 'Cursed', 'Blessed'
    ];
    const nouns = [
      'Path', 'Road', 'Way', 'Journey', 'Quest', 'Mission', 'Duty', 'Burden',
      'Memory', 'Dream', 'Nightmare', 'Vision', 'Truth', 'Lie', 'Secret'
    ];
    
    if (poolName.includes('Adjective')) {
      return adjectives[Math.floor(Math.random() * adjectives.length)];
    } else if (poolName.includes('Noun')) {
      return nouns[Math.floor(Math.random() * nouns.length)];
    }
    
    return null;
  }
  
  /**
   * Create dynamic pools based on discovered themes
   * @param {Object} context - Story context
   * @returns {Promise<Array>} - Created pools
   */
  async function createDynamicPools(context) {
    const newPools = [];
    
    // Analyze themes from context
    const themes = analyzeThemes(context);
    
    // Create pools for discovered themes
    for (const theme of themes) {
      const poolName = `dynamic_${theme.name}`;
      
      if (!poolRegistry.has(poolName)) {
        registerPool(poolName, {
          items: [],
          type: 'generic',
          category: theme.category,
          metadata: {
            description: `Dynamically created pool for ${theme.name}`,
            source: 'dynamic',
            theme: theme.name
          }
        });
        
        dynamicPools.set(poolName, {
          createdAt: Date.now(),
          theme: theme.name
        });
        
        newPools.push(poolName);
      }
    }
    
    return newPools;
  }
  
  /**
   * Analyze themes from context
   * @param {Object} context - Story context
   * @returns {Array} - Discovered themes
   */
  function analyzeThemes(context) {
    const themes = [];
    
    if (context.recentChapters && context.recentChapters.length > 0) {
      const chapterTypes = context.recentChapters.map(c => c.type);
      const uniqueTypes = [...new Set(chapterTypes)];
      
      for (const type of uniqueTypes) {
        themes.push({
          name: type,
          category: 'chapter_type',
          confidence: chapterTypes.filter(t => t === type).length / chapterTypes.length
        });
      }
    }
    
    return themes;
  }
  
  /**
   * Check if content is unique for a pool
   * @param {*} content - Content to check
   * @param {string} poolName - Name of the pool
   * @returns {boolean} - True if content is unique
   */
  function isContentUniqueForPool(content, poolName) {
    const usedContent = usedContentRegistry.get(poolName);
    if (!usedContent) {
      return true;
    }
    
    const fingerprint = generateContentFingerprint(content);
    return !usedContent.has(fingerprint);
  }
  
  /**
   * Mark content as used for a pool
   * @param {string} poolName - Name of the pool
   * @param {*} content - Content to mark as used
   */
  function markContentAsUsed(poolName, content) {
    const usedContent = usedContentRegistry.get(poolName);
    if (!usedContent) {
      return;
    }
    
    const fingerprint = generateContentFingerprint(content);
    usedContent.add(fingerprint);
  }
  
  /**
   * Generate content fingerprint
   * @param {*} content - Content to fingerprint
   * @returns {string} - Fingerprint
   */
  function generateContentFingerprint(content) {
    if (typeof content === 'string') {
      return content.toLowerCase().trim();
    }
    return JSON.stringify(content);
  }
  
  /**
   * Sync expanded pools back to story engine
   * Call this after pool expansion to update story engine's pools
   */
  function syncPoolsToStoryEngine() {
    // Get expanded pools
    const adjectivesPool = getPool('titleAdjectives');
    const nounsPool = getPool('titleNouns');
    const actionsPool = getPool('titleActions');
    const patternsPool = getPool('titlePatterns');
    
    // Update internal pool references
    if (adjectivesPool && adjectivesPool.items) {
      internalPools.adjectives = adjectivesPool.items;
    }
    if (nounsPool && nounsPool.items) {
      internalPools.nouns = nounsPool.items;
    }
    if (actionsPool && actionsPool.items) {
      internalPools.actions = actionsPool.items;
    }
    if (patternsPool && patternsPool.items) {
      internalPools.patterns = patternsPool.items;
    }
    
    log('[UnifiedPoolManager] Synced expanded pools to story engine');
  }
  
  /**
   * Get expanded adjectives
   * @returns {Array} - Expanded adjectives array
   */
  function getAdjectives() {
    // Return internal pool if available (synced from unified pool manager)
    if (internalPools.adjectives) {
      return internalPools.adjectives;
    }
    
    // Return story engine pools if available
    if (storyEnginePools && storyEnginePools.adjectives) {
      return storyEnginePools.adjectives;
    }
    
    // Default adjectives pool
    return [
      "Silent", "Dark", "Hidden", "Lost", "Forgotten", "Eternal", "Broken", "Shattered", "Whispering", "Burning",
      "Frozen", "Ancient", "Sacred", "Cursed", "Blessed", "Empty", "Full", "Bright", "Dim", "Sharp",
      "Golden", "Silver", "Crimson", "Azure", "Emerald", "Obsidian", "Ivory", "Amber", "Violet", "Scarlet",
      "Mystic", "Divine", "Infernal", "Celestial", "Abyssal", "Radiant", "Shadowed", "Luminous", "Phantom", "Spectral",
      "Trembling", "Rising", "Falling", "Soaring", "Diving", "Wandering", "Seeking", "Finding", "Losing", "Gaining",
      "Weeping", "Laughing", "Singing", "Dancing", "Fighting", "Loving", "Hating", "Fearing", "Hoping", "Dreaming",
      "Bitter", "Sweet", "Sour", "Spicy", "Salty", "Tangy", "Sharp", "Dull", "Bright", "Dark",
      "Heavy", "Light", "Soft", "Hard", "Rough", "Smooth", "Cold", "Hot", "Warm", "Cool",
      "Swift", "Slow", "Fast", "Steady", "Quick", "Rapid", "Gradual", "Sudden", "Instant", "Eternal"
    ];
  }
  
  /**
   * Get expanded nouns
   * @returns {Array} - Expanded nouns array
   */
  function getNouns() {
    // Return internal pool if available (synced from unified pool manager)
    if (internalPools.nouns) {
      return internalPools.nouns;
    }
    
    // Return story engine pools if available
    if (storyEnginePools && storyEnginePools.nouns) {
      return storyEnginePools.nouns;
    }
    
    // Default nouns pool
    return [
      "Path", "Road", "Way", "Journey", "Quest", "Mission", "Duty", "Burden", "Gift", "Curse",
      "Memory", "Dream", "Nightmare", "Vision", "Truth", "Lie", "Secret", "Mystery", "Puzzle", "Answer",
      "Destiny", "Fate", "Fortune", "Luck", "Chance", "Choice", "Decision", "Action", "Reaction", "Consequence",
      "Heart", "Soul", "Spirit", "Mind", "Body", "Blood", "Bone", "Flesh", "Breath", "Voice",
      "Sword", "Shield", "Armor", "Weapon", "Tool", "Instrument", "Device", "Machine", "Engine", "Gear",
      "Kingdom", "Empire", "Realm", "Domain", "Territory", "Land", "World", "Universe", "Cosmos", "Void",
      "Hero", "Villain", "Warrior", "Mage", "Thief", "Priest", "Paladin", "Ranger", "Monk", "Necromancer",
      "Dragon", "Demon", "Angel", "Spirit", "Ghost", "Phantom", "Specter", "Wraith", "Shade", "Shadow",
      "Fire", "Ice", "Lightning", "Earth", "Wind", "Water", "Nature", "Magic", "Power", "Energy",
      "Dawn", "Dusk", "Day", "Night", "Morning", "Evening", "Noon", "Midnight", "Sunrise", "Sunset",
      "Mountain", "Valley", "Forest", "Desert", "Ocean", "River", "Lake", "Sky", "Cloud", "Star",
      "Castle", "Tower", "Fortress", "Dungeon", "Cave", "Temple", "Shrine", "Palace", "Throne", "Altar"
    ];
  }
  
  /**
   * Get expanded actions
   * @returns {Array} - Expanded actions array
   */
  function getActions() {
    // Return internal pool if available (synced from unified pool manager)
    if (internalPools.actions) {
      return internalPools.actions;
    }
    
    // Return story engine pools if available
    if (storyEnginePools && storyEnginePools.actions) {
      return storyEnginePools.actions;
    }
    
    // Default actions pool
    return [
      "Falls", "Rises", "Breaks", "Heals", "Burns", "Freezes", "Whispers", "Screams", "Silences", "Awakens",
      "Sleeps", "Dreams", "Remembers", "Forgets", "Loves", "Hates", "Fears", "Hopes", "Believes", "Doubts",
      "Fights", "Flies", "Swims", "Runs", "Walks", "Crawls", "Climbs", "Dives", "Soars", "Descends",
      "Creates", "Destroys", "Builds", "Demolishes", "Forms", "Shapes", "Molds", "Casts", "Forges", "Crafts",
      "Speaks", "Listens", "Hears", "Sees", "Watches", "Observes", "Notices", "Discovers", "Finds", "Loses",
      "Gives", "Takes", "Receives", "Offers", "Accepts", "Rejects", "Refuses", "Denies", "Admits", "Confesses",
      "Begins", "Ends", "Starts", "Stops", "Pauses", "Continues", "Proceeds", "Advances", "Retreats", "Withdraws",
      "Wins", "Loses", "Victory", "Defeat", "Conquers", "Surrenders", "Captures", "Escapes", "Frees", "Imprisons",
      "Lives", "Dies", "Survives", "Thrives", "Withers", "Blooms", "Grows", "Shrinks", "Expands", "Contracts",
      "Shines", "Glows", "Fades", "Darkens", "Brightens", "Dims", "Illuminates", "Obscures", "Reveals", "Conceals"
    ];
  }
  
  /**
   * Get expanded patterns
   * @returns {Array} - Expanded patterns array
   */
  function getPatterns() {
    if (internalPools.patterns) {
      return internalPools.patterns;
    }
    
    if (storyEnginePools && storyEnginePools.patterns) {
      return storyEnginePools.patterns;
    }
    
    // Default patterns pool (template patterns, not actual titles)
    return [
      'The {adj} {noun}',
      '{noun} {action}',
      'When the {noun} {action}',
      'The {adj} {noun} {action}',
      '{adj} {noun}s',
      'The {action} of the {noun}',
      '{noun} in {adj} Light',
      'The {adj} {noun} Remains',
      'Where the {noun} {action}',
      'The {noun} That Remains',
      '{adj} {action}',
      'Beyond the {adj} {noun}',
      'The Last {noun}',
      '{noun} and {noun2}',
      'The {adj} {action}',
      'The {noun}\'s {noun2}',
      '{action} the {noun}',
      'The {adj} {noun} of {noun2}',
      'Where {adj} {noun}s {action}',
      'The {noun} That {action}s',
      '{adj} {noun}s {action}',
      'The {action} of {adj} {noun}s',
      '{noun} of {adj} {noun2}',
      'The {adj} {noun} {action}s',
      'When {adj} {noun}s Meet',
      'The {noun} That {adj} {action}s',
      '{adj} {noun}s in the {noun2}',
      'The {action} of the {adj} {noun}',
      '{noun} Without {noun2}',
      'The {adj} {noun} of {action}',
      'Where {noun}s {action} Forever',
      'The {noun} That {action}ed',
      '{adj} {noun}s of {noun2}',
      'The {noun}\'s {adj} {noun2}',
      '{action}ing the {adj} {noun}',
      'The {noun} That {action}ed {noun2}',
      '{adj} {noun}s {action}ing',
      'The {action} of {noun} and {noun2}',
      '{noun} of {adj} {action}',
      'The {adj} {noun} That {action}s',
      '{noun}s {action} in {adj} {noun2}',
      'The {noun}\'s {adj} {action}',
      '{action}ing {adj} {noun}s',
      'The {noun} of {adj} {noun2}s',
      '{adj} {noun}s {action} the {noun2}'
    ];
  }
  
  /**
   * Save persisted data to localStorage
   */
  function savePersistedData() {
    try {
      const data = {
        pools: {},
        dynamicPools: Array.from(dynamicPools.entries()),
        timestamp: Date.now()
      };
      
      for (const [poolName, pool] of poolRegistry.entries()) {
        data.pools[poolName] = {
          items: pool.items,
          expansionHistory: pool.expansionHistory,
          lastExpanded: pool.lastExpanded,
          expansionCount: pool.expansionCount
        };
      }
      
      localStorage.setItem(config.persistenceKey, JSON.stringify(data));
    } catch (error) {
      console.error('[UnifiedPoolManager] Failed to save persisted data:', error);
    }
  }
  
  /**
   * Load persisted data from localStorage
   */
  function loadPersistedData() {
    try {
      const data = JSON.parse(localStorage.getItem(config.persistenceKey));
      
      if (!data) {
        return;
      }
      
      // Restore pools
      for (const [poolName, poolData] of Object.entries(data.pools)) {
        const pool = poolRegistry.get(poolName);
        if (pool) {
          pool.items = poolData.items || [];
          pool.expansionHistory = poolData.expansionHistory || [];
          pool.lastExpanded = poolData.lastExpanded;
          pool.expansionCount = poolData.expansionCount || 0;
        }
      }
      
      // Restore dynamic pools
      for (const [poolName, poolData] of data.dynamicPools) {
        dynamicPools.set(poolName, poolData);
      }
      
      log('[UnifiedPoolManager] Loaded persisted data');
    } catch (error) {
      console.error('[UnifiedPoolManager] Failed to load persisted data:', error);
    }
  }
  
  /**
   * Clear persisted data
   */
  function clearPersistedData() {
    try {
      localStorage.removeItem(config.persistenceKey);
      log('[UnifiedPoolManager] Cleared persisted data');
    } catch (error) {
      console.error('[UnifiedPoolManager] Failed to clear persisted data:', error);
    }
  }
  
  /**
   * Update configuration
   * @param {Object} newConfig - New configuration options
   */
  function updateConfig(newConfig) {
    Object.assign(config, newConfig);
    log('[UnifiedPoolManager] Configuration updated');
  }
  
  /**
   * Get configuration
   * @returns {Object} - Current configuration
   */
  function getConfig() {
    return { ...config };
  }
  
  /**
   * Get statistics
   * @returns {Object} - Statistics
   */
  function getStats() {
    return {
      totalPools: poolRegistry.size,
      totalItems: Array.from(poolRegistry.values()).reduce((sum, pool) => sum + pool.items.length, 0),
      totalUsedItems: Array.from(poolRegistry.values()).reduce((sum, pool) => sum + pool.usedItems.size, 0),
      dynamicPools: dynamicPools.size,
      chapterCount: chapterCount,
      lastExpansionChapter: lastExpansionChapter,
      isIntegrated: isIntegrated,
      config: getConfig()
    };
  }
  
  /**
   * Reset statistics
   */
  function resetStats() {
    chapterCount = 0;
    lastExpansionChapter = 0;
    log('[UnifiedPoolManager] Statistics reset');
  }
  
  // Public API
  return {
    // Core Functions
    initialize,
    registerPool,
    getPool,
    getPoolStats,
    
    // Expansion Functions
    expandPool,
    expandAllPools,
    expandPoolsProactively,
    periodicExpansionCheck,
    needsExpansion,
    checkAllPoolsForExpansion,
    
    // Content Functions
    getUniqueItem,
    processContentForPool,
    transformToParagraph,
    transformToTitle,
    transformToDialogue,
    transformToDescription,
    generateProceduralContent,
    generateProceduralItem,
    generateTitleWord,
    
    // Story Engine Integration
    registerStoryPools,
    syncPoolsToStoryEngine,
    getAdjectives,
    getNouns,
    getActions,
    getPatterns,
    
    // Storage Functions
    savePersistedData,
    loadPersistedData,
    clearPersistedData,
    
    // Configuration Functions
    updateConfig,
    getConfig,
    
    // Statistics Functions
    getStats,
    resetStats,
    
    // Utility Functions
    isContentUniqueForPool,
    markContentAsUsed,
    generateContentFingerprint,
    createDynamicPools,
    analyzeThemes,
    
    // Status
    isIntegrated: () => isIntegrated
  };
})();

// Export to global scope
if (typeof window !== 'undefined') {
  window.UnifiedPoolManager = UnifiedPoolManager;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UnifiedPoolManager;
}