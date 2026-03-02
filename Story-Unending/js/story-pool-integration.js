/**
 * Story Pool Integration
 * Integrates story engine's internal pools with UnifiedPoolManager system
 * Ensures pool expansion affects content generation
 */

const StoryPoolIntegration = (() => {
  // Reference to story engine's pools
  let storyEnginePools = null;
  
  // Internal pool storage (used by story engine)
  const internalPools = {
    adjectives: null,
    nouns: null,
    actions: null,
    patterns: null
  };
  
  // Integration status
  let isIntegrated = false;
  
  /**
   * Initialize integration with story engine
   * @param {Object} pools - Story engine's pool references
   */
  function initialize(pools = null) {
    if (pools) {
      storyEnginePools = pools;
    }
    
    // Register story engine pools with UnifiedPoolManager
    registerStoryPools();
    
    isIntegrated = true;
  }
  
  /**
   * Register story engine pools with UnifiedPoolManager
   */
  function registerStoryPools() {
    if (typeof UnifiedPoolManager === 'undefined') {
      console.warn('[StoryPoolIntegration] UnifiedPoolManager not available');
      return;
    }
    
    // Register title generation pools
    UnifiedPoolManager.registerPool('titleAdjectives', {
      items: getAdjectives(),
      type: 'array',
      category: 'title',
      metadata: {
        description: 'Adjectives for dynamic title generation',
        source: 'story-engine'
      }
    });
    
    UnifiedPoolManager.registerPool('titleNouns', {
      items: getNouns(),
      type: 'array',
      category: 'title',
      metadata: {
        description: 'Nouns for dynamic title generation',
        source: 'story-engine'
      }
    });
    
    UnifiedPoolManager.registerPool('titleActions', {
      items: getActions(),
      type: 'array',
      category: 'title',
      metadata: {
        description: 'Actions for dynamic title generation',
        source: 'story-engine'
      }
    });
    
    UnifiedPoolManager.registerPool('titlePatterns', {
      items: getPatterns(),
      type: 'array',
      category: 'title',
      metadata: {
        description: 'Title patterns for dynamic title generation',
        source: 'story-engine'
      }
    });
  }
  
  /**
   * Get expanded adjectives from UnifiedPoolManager
   * @returns {Array} - Expanded adjectives array
   */
  function getAdjectives() {
    // Return internal pool if available (synced from UnifiedPoolManager)
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
   * Get expanded nouns from UnifiedPoolManager
   * @returns {Array} - Expanded nouns array
   */
  function getNouns() {
    // Return internal pool if available (synced from UnifiedPoolManager)
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
   * Get expanded actions from UnifiedPoolManager
   * @returns {Array} - Expanded actions array
   */
  function getActions() {
    // Return internal pool if available (synced from UnifiedPoolManager)
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
   * Get expanded patterns from UnifiedPoolManager
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
    // These will be filled in by the story engine's generateDynamicTitle function
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
   * Sync expanded pools back to story engine
   * Call this after pool expansion to update story engine's pools
   */
  function syncPoolsToStoryEngine() {
    if (typeof UnifiedPoolManager === 'undefined') {
      console.warn('[StoryPoolIntegration] UnifiedPoolManager not available');
      return;
    }
    
    // Get expanded pools from UnifiedPoolManager
    const adjectivesPool = UnifiedPoolManager.getPool('titleAdjectives');
    const nounsPool = UnifiedPoolManager.getPool('titleNouns');
    const actionsPool = UnifiedPoolManager.getPool('titleActions');
    const patternsPool = UnifiedPoolManager.getPool('titlePatterns');
    
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
  }
  
  /**
   * Get pool statistics
   * @returns {Object} - Pool statistics
   */
  function getPoolStats() {
    if (typeof UnifiedPoolManager === 'undefined') {
      return { error: 'UnifiedPoolManager not available' };
    }
    
    return {
      adjectives: UnifiedPoolManager.getPool('titleAdjectives')?.items?.length || 0,
      nouns: UnifiedPoolManager.getPool('titleNouns')?.items?.length || 0,
      actions: UnifiedPoolManager.getPool('titleActions')?.items?.length || 0,
      patterns: UnifiedPoolManager.getPool('titlePatterns')?.items?.length || 0,
      isIntegrated: isIntegrated
    };
  }
  
  // Public API
  return {
    initialize,
    registerStoryPools,
    getAdjectives,
    getNouns,
    getActions,
    getPatterns,
    syncPoolsToStoryEngine,
    getPoolStats,
    isIntegrated: () => isIntegrated
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StoryPoolIntegration;
}