// ============================================
// CONTENT DATABASE - Global Content Tracking System
// ============================================

const ContentDatabase = (() => {
  // SHA-256 Hash Function
  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  // Content Database
  const contentDB = {
    paragraphs: new Map(), // hash -> { content, type, usedAt, similarityHash }
    titles: new Map(), // hash -> { title, usedAt }
    characters: new Map(), // id -> character data
    locations: new Map(), // id -> location data
    events: new Map(), // id -> event data
    relationships: new Map(), // id -> relationship data
    worldState: new Map(), // key -> world state data
    plotPoints: new Map(), // id -> plot point data
    arcs: new Map(), // id -> arc data
    themes: new Map(), // id -> theme data
    motifs: new Map(), // id -> motif data
    callbacks: new Map(), // id -> callback data
    foreshadowing: new Map(), // id -> foreshadowing data
    consequences: new Map(), // id -> consequence data
    timeline: new Map(), // chapter -> events
    chapterStats: new Map() // chapter -> stats
  };

  // Similarity Hash (for near-duplicate detection)
  function createSimilarityHash(content) {
    // Remove common words and normalize
    const normalized = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(word => word.length > 3)
      .sort()
      .join(' ');
    return normalized.substring(0, 200); // First 200 chars of normalized content
  }

  // Check if content is duplicate
  async function isDuplicate(content, type) {
    const hash = await sha256(content);
    return contentDB.paragraphs.has(hash);
  }

  // Check if content is near-duplicate
  async function isNearDuplicate(content, type) {
    const similarityHash = createSimilarityHash(content);
    
    for (const [hash, data] of contentDB.paragraphs.entries()) {
      if (data.type === type && data.similarityHash === similarityHash) {
        return true;
      }
    }
    return false;
  }

  // Add content to database
  async function addContent(content, type, chapterNum) {
    const hash = await sha256(content);
    const similarityHash = createSimilarityHash(content);
    
    contentDB.paragraphs.set(hash, {
      content,
      type,
      usedAt: chapterNum,
      similarityHash,
      firstUsed: chapterNum
    });
    
    return hash;
  }

  // Get unique content from pool
  async function getUniqueContent(pool, type, chapterNum) {
    const available = [];
    
    for (const content of pool) {
      const isDup = await isDuplicate(content, type);
      const isNearDup = await isNearDuplicate(content, type);
      
      if (!isDup && !isNearDup) {
        available.push(content);
      }
    }
    
    if (available.length === 0) {
      // If no unique content available, generate dynamic content
      return generateDynamicContent(type, chapterNum);
    }
    
    const selected = available[Math.floor(Math.random() * available.length)];
    await addContent(selected, type, chapterNum);
    
    return selected;
  }

  // Generate dynamic content when pool is exhausted
  function generateDynamicContent(type, chapterNum) {
    // This will be implemented with procedural generation
    return `Dynamic content for ${type} at chapter ${chapterNum}`;
  }

  // Add title to database
  async function addTitle(title, chapterNum) {
    const hash = await sha256(title);
    
    contentDB.titles.set(hash, {
      title,
      usedAt: chapterNum,
      firstUsed: chapterNum
    });
    
    return hash;
  }

  // Get unique title from pool
  async function getUniqueTitle(pool, chapterNum) {
    const available = [];
    
    for (const title of pool) {
      const hash = await sha256(title);
      if (!contentDB.titles.has(hash)) {
        available.push(title);
      }
    }
    
    if (available.length === 0) {
      // Generate dynamic title
      return generateDynamicTitle(chapterNum);
    }
    
    const selected = available[Math.floor(Math.random() * available.length)];
    await addTitle(selected, chapterNum);
    
    return selected;
  }

  // Generate dynamic title
  function generateDynamicTitle(chapterNum) {
    const adjectives = [
      "Silent", "Dark", "Hidden", "Lost", "Forgotten", "Eternal", "Broken", "Shattered",
      "Whispering", "Burning", "Frozen", "Ancient", "Sacred", "Cursed", "Blessed", "Empty",
      "Full", "Bright", "Dim", "Sharp", "Soft", "Hard", "Cold", "Warm", "Fast", "Slow",
      "Deep", "High", "Low", "Near", "Far", "Old", "New", "Strange", "Familiar", "Unknown",
      "Known", "Secret", "Open", "Closed", "Free", "Bound", "Light", "Heavy", "Quick", "Slow"
    ];
    
    const nouns = [
      "Path", "Road", "Way", "Journey", "Quest", "Mission", "Duty", "Burden", "Gift", "Curse",
      "Memory", "Dream", "Nightmare", "Vision", "Truth", "Lie", "Secret", "Mystery", "Puzzle",
      "Answer", "Question", "Hope", "Fear", "Love", "Hate", "Life", "Death", "Birth", "End",
      "Beginning", "Middle", "Conclusion", "Start", "Finish", "Rise", "Fall", "Create", "Destroy",
      "Build", "Break", "Find", "Lose", "Win", "Fail", "Succeed", "Try", "Do", "Be"
    ];
    
    const actions = [
      "Falls", "Rises", "Breaks", "Heals", "Burns", "Freezes", "Whispers", "Screams",
      "Silences", "Awakens", "Sleeps", "Dreams", "Remembers", "Forgets", "Loves", "Hates",
      "Fears", "Hopes", "Believes", "Doubts", "Knows", "Understands", "Sees", "Hears", "Feels",
      "Touches", "Tastes", "Smells", "Moves", "Stays", "Goes", "Comes", "Leaves", "Arrives", "Departs"
    ];
    
    const patterns = [
      `The ${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`,
      `${nouns[Math.floor(Math.random() * nouns.length)]}'s ${actions[Math.floor(Math.random() * actions.length)]}`,
      `When ${nouns[Math.floor(Math.random() * nouns.length)]}s ${actions[Math.floor(Math.random() * actions.length)].toLowerCase()}`,
      `The ${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]} ${actions[Math.floor(Math.random() * actions.length)].toLowerCase()}s`,
      `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}s`,
      `The ${actions[Math.floor(Math.random() * actions.length)]} of ${nouns[Math.floor(Math.random() * nouns.length)]}s`,
      `${nouns[Math.floor(Math.random() * nouns.length)]} in ${adjectives[Math.floor(Math.random() * adjectives.length)]} Light`,
      `The ${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]} Remains`,
      `Where ${nouns[Math.floor(Math.random() * nouns.length)]}s ${actions[Math.floor(Math.random() * actions.length)].toLowerCase()}`,
      `The ${nouns[Math.floor(Math.random() * nouns.length)]} That ${actions[Math.floor(Math.random() * actions.length)].toLowerCase()}ed`
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  // Get database statistics
  function getStats() {
    return {
      totalParagraphs: contentDB.paragraphs.size,
      totalTitles: contentDB.titles.size,
      totalCharacters: contentDB.characters.size,
      totalLocations: contentDB.locations.size,
      totalEvents: contentDB.events.size,
      totalRelationships: contentDB.relationships.size,
      totalArcs: contentDB.arcs.size,
      totalThemes: contentDB.themes.size,
      totalMotifs: contentDB.motifs.size,
      totalCallbacks: contentDB.callbacks.size,
      totalForeshadowing: contentDB.foreshadowing.size,
      totalConsequences: contentDB.consequences.size
    };
  }

  // Export database
  function exportDatabase() {
    const exportData = {
      paragraphs: Array.from(contentDB.paragraphs.entries()),
      titles: Array.from(contentDB.titles.entries()),
      characters: Array.from(contentDB.characters.entries()),
      locations: Array.from(contentDB.locations.entries()),
      events: Array.from(contentDB.events.entries()),
      relationships: Array.from(contentDB.relationships.entries()),
      worldState: Array.from(contentDB.worldState.entries()),
      plotPoints: Array.from(contentDB.plotPoints.entries()),
      arcs: Array.from(contentDB.arcs.entries()),
      themes: Array.from(contentDB.themes.entries()),
      motifs: Array.from(contentDB.motifs.entries()),
      callbacks: Array.from(contentDB.callbacks.entries()),
      foreshadowing: Array.from(contentDB.foreshadowing.entries()),
      consequences: Array.from(contentDB.consequences.entries()),
      timeline: Array.from(contentDB.timeline.entries()),
      chapterStats: Array.from(contentDB.chapterStats.entries())
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Import database
  function importDatabase(data) {
    const parsed = JSON.parse(data);
    
    contentDB.paragraphs = new Map(parsed.paragraphs);
    contentDB.titles = new Map(parsed.titles);
    contentDB.characters = new Map(parsed.characters);
    contentDB.locations = new Map(parsed.locations);
    contentDB.events = new Map(parsed.events);
    contentDB.relationships = new Map(parsed.relationships);
    contentDB.worldState = new Map(parsed.worldState);
    contentDB.plotPoints = new Map(parsed.plotPoints);
    contentDB.arcs = new Map(parsed.arcs);
    contentDB.themes = new Map(parsed.themes);
    contentDB.motifs = new Map(parsed.motifs);
    contentDB.callbacks = new Map(parsed.callbacks);
    contentDB.foreshadowing = new Map(parsed.foreshadowing);
    contentDB.consequences = new Map(parsed.consequences);
    contentDB.timeline = new Map(parsed.timeline);
    contentDB.chapterStats = new Map(parsed.chapterStats);
  }

  // Public API
  return {
    isDuplicate,
    isNearDuplicate,
    addContent,
    getUniqueContent,
    addTitle,
    getUniqueTitle,
    generateDynamicTitle,
    getStats,
    exportDatabase,
    importDatabase,
    contentDB
  };
})();

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentDatabase;
} else {
  window.ContentDatabase = ContentDatabase;
}