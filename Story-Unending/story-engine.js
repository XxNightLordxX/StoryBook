/* ============================================
   ENDLESS STORY ENGINE — CHAPTER GENERATOR
   Complete Story Bible + Non-Repetitive Generation
   ============================================ */

const StoryEngine = (() => {
  // ============================================
  // STORY POOL INTEGRATION
  // Integrates with UnifiedPoolManager for expanded content pools
  // ============================================
  let poolIntegration = null;
  let useExpandedPools = false;
  
  // ============================================
  // SEEDED PRNG — Ensures same story for ALL users
  // Uses mulberry32 algorithm with fixed seed
  // ============================================
  const STORY_SEED = 314159265; // Fixed seed — same for everyone
  let _rngState = STORY_SEED;

  function seededRandom() {
    _rngState |= 0;
    _rngState = (_rngState + 0x6D2B79F5) | 0;
    let t = Math.imul(_rngState ^ (_rngState >>> 15), 1 | _rngState);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Override Math.random within this scope
  const random = seededRandom;
  // ============================================
  // MC STATE — All 23 stats tracked
  // ============================================
  let mcState = {
    name: "Kael",
    class: "Vampire Progenitor",
    level: 1,
    xp: 0,
    xpToNext: 100,
    // Core Stats
    hp: 500, maxHp: 500,
    sp: 300, maxSp: 300,
    mp: 400, maxMp: 400,
    bloodEssence: 100, maxBloodEssence: 100,
    // Primary Attributes
    strength: 12,
    agility: 15,
    intelligence: 18,
    vitality: 14,
    endurance: 13,
    luck: 10,
    // Vampire Stats
    bloodlust: 0,
    darkAffinity: 15,
    regeneration: 5,
    domination: 8,
    // Combat Stats
    attackPower: 25,
    defense: 18,
    criticalRate: 8,
    evasion: 12,
    attackSpeed: 14,
    // Hidden Stats
    karma: 50,
    instinct: 10,
    willpower: 16,
    presence: 12,
    // Economy
    gold: 0,
    // Tracking
    extractionCount: 0,
    killCount: 0,
    bossesDefeated: 0,
    dungeonsCleared: 0,
    titlesEarned: [],
    currentTitle: "Newcomer",
    currentLocation: "Real World",
    vampireEvolution: "Base Progenitor",
    skills: [],
    abilities: [],
    items: [],
    extractedItems: []
  };

  // ============================================
  // WORLD STATE
  // ============================================
  let worldState = {
    regionsDiscovered: ["Ashenveil Ruins"],
    currentRegion: "Ashenveil Ruins",
    dayNightCycle: "day",
    weather: "clear",
    worldEvents: [],
    loreFragments: [],
    hiddenRealmsFound: [],
    gameVersion: "1.0.0",
    gameUpdates: []
  };

  // ============================================
  // CHARACTER REGISTRY
  // ============================================
  let characters = {
    allies: [],
    rivals: [],
    enemies: [],
    mentors: [],
    romanceInterests: [],
    friends: [],
    clanMembers: [],
    guildMembers: []
  };

  // ============================================
  // STORY TRACKING — Prevents Repetition
  // ============================================
  let storyTracker = {
    chaptersGenerated: 0,
    totalWords: 0,
    usedOpenings: [],
    usedThemes: [],
    usedLocations: [],
    usedCombatStyles: [],
    usedPlotPoints: [],
    usedBackstoryParagraphs: [],
    usedVRParagraphs: [],
    usedPaddingParagraphs: [],
    usedTitles: [],
    titleHashes: new Set(),
    currentArc: 0,
    currentArcName: "Before the Headset",
    arcChapterCount: 0,
    recentEvents: [],
    pendingDirectives: [],
    incorporatedDirectives: [],
    sisterMentioned: false,
    parentsRevealed: false,
    lastChapterType: "",
    lastSetting: "",
    consecutiveVR: 0,
    consecutiveReal: 0
  };

  // ============================================
  // STORY BIBLE — MASSIVE CONTENT POOLS
  // ============================================

  // --- ARC DEFINITIONS (Backstory first, then VR game) ---
  const storyArcs = [
    // === BACKSTORY ARCS (Pre-VR Game) ===
    { name: "Before the Headset", theme: "backstory_life", chapters: 12, desc: "Kael's daily life, his job, his apartment, the quiet routine of a young man carrying invisible weight", preVR: true },
    { name: "The Accident", theme: "backstory_sister", chapters: 10, desc: "The story of Yuna's accident and how it shattered Kael's world, the hospital vigils, the grief", preVR: true },
    { name: "Ghosts of Parents", theme: "backstory_parents", chapters: 10, desc: "Memories of Mom and Dad, the day they disappeared, what Kael was told, what he believed", preVR: true },
    { name: "Surviving Alone", theme: "backstory_struggle", chapters: 10, desc: "Kael learning to live alone, working to pay hospital bills, the weight of responsibility", preVR: true },
    { name: "The Announcement", theme: "backstory_vr_hype", chapters: 8, desc: "The VR game Eclipsis Online is announced, the world goes crazy, Kael watches from the sidelines", preVR: true },
    { name: "The Headset Arrives", theme: "backstory_headset", chapters: 8, desc: "Kael gets the VR headset, unboxes it, hesitates, and finally puts it on for the first time", preVR: true },

    // === VR GAME ARCS ===
    { name: "First Login", theme: "discovery", chapters: 12, desc: "Kael enters Eclipsis Online for the first time, character creation, the Vampire Progenitor class chooses him" },
    { name: "Blood Inheritance", theme: "power", chapters: 12, desc: "Discovering the Vampire Progenitor class and its true nature" },
    { name: "First Extraction", theme: "wonder", chapters: 10, desc: "Kael realizes he can bring items from the game into reality" },
    { name: "Shadows of Ashenveil", theme: "exploration", chapters: 14, desc: "Exploring the first major region and its dark secrets" },
    { name: "The Crimson Court", theme: "politics", chapters: 12, desc: "Encountering vampire NPCs and the politics of the undead" },
    { name: "Sister's Lullaby", theme: "emotion", chapters: 10, desc: "Kael searches for a way to heal his comatose sister" },
    { name: "Dungeon of Echoes", theme: "challenge", chapters: 12, desc: "The first major dungeon crawl with deadly bosses" },
    { name: "Rivals Emerge", theme: "conflict", chapters: 14, desc: "Other players notice Kael's unusual abilities" },
    { name: "The Night Market", theme: "economy", chapters: 10, desc: "Discovering the underground player economy" },
    { name: "Evolution Threshold", theme: "transformation", chapters: 12, desc: "Kael's vampire class begins to evolve" },
    { name: "Fractured Memories", theme: "mystery", chapters: 10, desc: "Flashbacks hint at Kael's parents being alive" },
    { name: "Guild Wars", theme: "war", chapters: 15, desc: "Large-scale conflict between major guilds" },
    { name: "Hidden Realm: Abyssal Depths", theme: "discovery", chapters: 12, desc: "A hidden layer of the VR world is discovered" },
    { name: "The Real World Shifts", theme: "consequence", chapters: 10, desc: "Kael's growing power begins changing reality" },
    { name: "Bloodline Awakening", theme: "heritage", chapters: 14, desc: "The truth about the Progenitor bloodline" },
    { name: "World Event: The Crimson Eclipse", theme: "catastrophe", chapters: 12, desc: "A massive world event changes everything" },
    { name: "Bonds Tested", theme: "relationships", chapters: 10, desc: "Friendships, rivalries, and romance are tested" },
    { name: "The Auction of Legends", theme: "economy", chapters: 10, desc: "Rare items and secrets go up for auction" },
    { name: "Progenitor's Domain", theme: "power", chapters: 14, desc: "Kael establishes his own territory" },
    { name: "Whispers of the Parents", theme: "revelation", chapters: 12, desc: "Clues about Kael's parents surface" }
  ];

  // --- CHAPTER TYPES (ensures variety) ---
  const chapterTypes = [
    "exploration", "combat", "dialogue", "introspection", "training",
    "extraction", "real_world", "social", "lore_discovery", "dungeon",
    "boss_fight", "crafting", "economy", "relationship", "flashback",
    "world_event", "skill_evolution", "vampire_power", "stealth",
    "investigation", "clan_guild", "pvp", "quest", "travel",
    "rest_recovery", "nightmare_vision", "sister_moment", "mentor_lesson",
    "rival_encounter", "romance_scene"
  ];

  // --- OPENING STYLES (never repeat consecutively) ---
  const openingStyles = [
    "sensory", "dialogue", "action", "thought", "memory",
    "environmental", "time_skip", "contrast", "question",
    "visceral", "quiet", "dramatic", "mysterious", "humorous"
  ];

  // --- VR REGIONS ---
  const vrRegions = [
    { name: "Ashenveil Ruins", type: "starter", level: "1-10", desc: "crumbling stone corridors draped in luminescent moss, where the air tasted of ancient dust and forgotten magic" },
    { name: "Thornwood Expanse", type: "forest", level: "5-15", desc: "a vast forest of black-barked trees whose thorned branches clawed at a perpetually twilight sky" },
    { name: "Crimson Hollows", type: "vampire", level: "10-20", desc: "underground caverns pulsing with veins of red crystal, the heartbeat of something ancient echoing through the stone" },
    { name: "Stormbreak Plateau", type: "mountain", level: "15-25", desc: "wind-blasted peaks where lightning struck the same spots every thirteen seconds, leaving glass craters in the rock" },
    { name: "Drowned Market", type: "city", level: "10-20", desc: "a half-submerged trading city where merchants poled gondolas between crumbling towers and haggled over waterlogged goods" },
    { name: "The Pale Wastes", type: "desert", level: "20-30", desc: "an endless white desert where the sand was actually crushed bone, and mirages showed memories instead of water" },
    { name: "Nightbloom Gardens", type: "mystical", level: "15-25", desc: "impossible gardens where flowers bloomed only in darkness, each petal containing a fragment of stolen starlight" },
    { name: "Iron Citadel", type: "dungeon", level: "20-30", desc: "a fortress built by a mad king, its walls shifting and rearranging every hour, trapping the unwary in endless corridors" },
    { name: "Abyssal Depths", type: "hidden", level: "25-35", desc: "a realm beneath the ocean floor where pressure crushed sound itself, and creatures communicated through bioluminescent pulses" },
    { name: "Veilstorm Frontier", type: "endgame", level: "30+", desc: "the edge of the mapped world where reality glitched and fragmented, revealing the raw code of creation beneath" }
  ];

  // --- REAL WORLD LOCATIONS ---
  const realWorldLocations = [
    { name: "Kael's Apartment", desc: "the small apartment felt different now—shadows moved with purpose, and his reflection sometimes lagged behind his movements" },
    { name: "City Hospital", desc: "the sterile white corridors of the hospital where his sister lay, machines breathing for her in a rhythm that haunted his dreams" },
    { name: "Downtown Streets", desc: "the city hummed with ordinary life, people rushing past with coffee cups and complaints, oblivious to the impossible things in his backpack" },
    { name: "The Rooftop", desc: "thirty stories up, the wind carried the sounds of traffic and distant sirens, and the city lights below looked like a circuit board" },
    { name: "University Campus", desc: "students moved in clusters between brutalist buildings, their laughter and arguments a strange contrast to the silence of dungeon corridors" },
    { name: "Underground Gym", desc: "a converted basement where the heavy bags hung like sleeping bats, and the fluorescent lights buzzed with the same frequency as mana crystals" },
    { name: "Late-Night Convenience Store", desc: "the 24-hour store's fluorescent glow was a beacon in the dark street, its shelves stocked with mundane miracles he'd once taken for granted" },
    { name: "Sister's Hospital Room", desc: "the room smelled of antiseptic and wilting flowers, monitors painting green lines across black screens, her face peaceful in a sleep that wouldn't end" }
  ];

  // --- NPC / CHARACTER TEMPLATES ---
  const characterTemplates = {
    allies: [
      { name: "Mira", role: "fellow player", personality: "energetic and reckless, with a laugh that echoed through dungeons", class: "Storm Mage", quirk: "always ate snacks during boss fights" },
      { name: "Dex", role: "information broker", personality: "quiet and calculating, spoke in half-truths and knowing smiles", class: "Shadow Thief", quirk: "never showed his real face, always wore masks" },
      { name: "Yuki", role: "healer", personality: "gentle but stubborn, refused to let anyone die on her watch", class: "Celestial Priest", quirk: "hummed lullabies during combat" },
      { name: "Rook", role: "tank", personality: "loud, loyal, and terrible at reading the room", class: "Iron Guardian", quirk: "named all his shields after ex-girlfriends" }
    ],
    rivals: [
      { name: "Soren", role: "top-ranked player", personality: "cold, efficient, and obsessed with being first", class: "Blade Saint", quirk: "never spoke in dungeons, only typed" },
      { name: "Nyx", role: "guild leader", personality: "charismatic and manipulative, collected people like trophies", class: "Void Walker", quirk: "always knew more than she should" },
      { name: "Graves", role: "bounty hunter", personality: "professional and detached, treated PvP like a job", class: "Reaper", quirk: "kept a list of every player he'd killed" }
    ],
    enemies: [
      { name: "The Hollow King", role: "dungeon boss", personality: "ancient and mad, spoke in riddles that sometimes came true" },
      { name: "Crimson Mother", role: "vampire elder NPC", personality: "beautiful and terrifying, her voice was silk wrapped around a blade" },
      { name: "System Anomaly", role: "glitch entity", personality: "shouldn't exist, spoke in fragmented code and broken promises" }
    ],
    mentors: [
      { name: "Old Man Chen", role: "real world mentor", personality: "the hospital janitor who noticed things nobody else did, spoke in proverbs" },
      { name: "Vladris", role: "vampire NPC mentor", personality: "ancient vampire who remembered when the game world was real, tired and wise" },
      { name: "The Archivist", role: "lore keeper NPC", personality: "existed in every library simultaneously, obsessed with cataloging everything" }
    ],
    romanceInterests: [
      { name: "Sera", role: "mysterious player", personality: "appeared at strange moments, knew things about the game that weren't in any guide, smiled like she was keeping the best secret", class: "Moonlight Assassin" },
      { name: "Lin", role: "real world connection", personality: "worked at the hospital, sharp-eyed and warm-hearted, noticed the changes in Kael before anyone else" }
    ]
  };

  // --- SKILLS & ABILITIES ---
  const vampireSkills = [
    { name: "Blood Drain", level: 1, desc: "drains life force from enemies, converting it to health and blood essence", type: "active" },
    { name: "Shadow Step", level: 1, desc: "teleport through shadows within a short range", type: "active" },
    { name: "Night Vision", level: 1, desc: "perfect sight in complete darkness", type: "passive" },
    { name: "Crimson Aura", level: 1, desc: "an oppressive presence that weakens nearby enemies", type: "passive" },
    { name: "Blood Lance", level: 1, desc: "crystallize blood into a piercing projectile", type: "active" },
    { name: "Regenerative Blood", level: 1, desc: "passive health regeneration that scales with blood essence", type: "passive" },
    { name: "Dominator's Gaze", level: 1, desc: "briefly stun or influence weak-willed targets", type: "active" },
    { name: "Predator's Instinct", level: 1, desc: "sense nearby enemies and hidden threats", type: "passive" },
    { name: "Bat Swarm", level: 1, desc: "dissolve into a swarm of bats for evasion", type: "active" },
    { name: "Bloodforge", level: 1, desc: "shape blood into temporary weapons or tools", type: "active" }
  ];

  const skillEvolutions = {
    "Blood Drain": ["Sanguine Feast", "Soul Siphon", "Progenitor's Hunger"],
    "Shadow Step": ["Void Walk", "Dimensional Shift", "Shadow Realm Gate"],
    "Blood Lance": ["Crimson Barrage", "Blood Nova", "Progenitor's Wrath"],
    "Dominator's Gaze": ["Mass Domination", "Mind Shatter", "Progenitor's Will"],
    "Bat Swarm": ["Night Terror", "Swarm Colossus", "Progenitor's Wings"],
    "Bloodforge": ["Crimson Arsenal", "Blood Golem", "Progenitor's Creation"]
  };

  // --- ITEMS ---
  const itemPool = [
    { name: "Fang of the First Night", rank: "Legendary", type: "weapon", desc: "a dagger that grew sharper with each kill" },
    { name: "Cloak of Woven Shadows", rank: "Epic", type: "armor", desc: "made from actual darkness, it moved like liquid" },
    { name: "Blood Crystal Vial", rank: "Rare", type: "consumable", desc: "concentrated blood essence in crystalline form" },
    { name: "Moonstone Ring", rank: "Uncommon", type: "accessory", desc: "glowed faintly in darkness, boosted mana regeneration" },
    { name: "Ashenveil Map Fragment", rank: "Common", type: "quest", desc: "a torn piece of an ancient map, edges still warm" },
    { name: "Crimson Core", rank: "Legendary", type: "material", desc: "the heart of a vampire lord, pulsing with dark energy" },
    { name: "Nightbloom Petal", rank: "Rare", type: "material", desc: "a flower petal that absorbed light and radiated cold" },
    { name: "Iron King's Signet", rank: "Epic", type: "accessory", desc: "a ring that granted authority over constructs" },
    { name: "Vial of Liquid Starlight", rank: "Legendary", type: "consumable", desc: "bottled starlight that could heal any wound once" },
    { name: "Bone Dust Pouch", rank: "Common", type: "material", desc: "ground bones from the Pale Wastes, used in dark crafting" }
  ];

  // --- LORE FRAGMENTS ---
  const lorePool = [
    "The Vampire Progenitor class wasn't supposed to exist. It was a remnant of an abandoned expansion, buried in the code like a fossil in digital stone.",
    "Before the game launched, there were rumors of a developer who coded an entire civilization into a hidden realm, then deleted the access points. Almost all of them.",
    "The extraction ability had no tooltip, no description, no official documentation. It existed in the space between intended features and impossible bugs.",
    "In the earliest days of the game, players reported hearing whispers in empty dungeons. The developers called it an audio glitch. The whispers called it a warning.",
    "The Crimson Court was modeled after a real medieval court that vanished overnight in 1347. The developer who researched it refused to talk about what he found.",
    "Blood Essence wasn't just a resource. At the molecular level of the game's code, it was the same data structure used for player consciousness.",
    "The first player to reach level 100 reported that the sky changed color for exactly one second. No one believed them. The developers quietly patched something that night.",
    "Somewhere in the Abyssal Depths, there's a door that requires a key made of real-world data. No one knows what that means yet."
  ];

  // --- SENSORY DETAIL POOLS ---
  const sensoryDetails = {
    sight: [
      "light fractured through crystal formations, painting the walls in shifting patterns of crimson and violet",
      "shadows pooled in corners like living things, retreating from his gaze only to creep back when he looked away",
      "the interface flickered at the edges of his vision, translucent numbers and icons floating like digital ghosts",
      "dust motes hung suspended in shafts of pale light, each one catching fire as it drifted through a sunbeam",
      "the horizon stretched impossibly far, the curvature of this world subtly wrong in ways that tickled the back of his brain"
    ],
    sound: [
      "the distant echo of something massive shifting in the darkness, stone grinding against stone in a rhythm like breathing",
      "wind carried fragments of music—a melody that didn't belong to any instrument he could name",
      "the silence was so complete it had texture, pressing against his eardrums like deep water",
      "his footsteps echoed three times: once for the step, once for the shadow, once for something following",
      "the ambient hum of the game world was different here—lower, older, like a machine that had been running since before time"
    ],
    touch: [
      "the air had weight here, pressing against his skin like invisible hands testing his resolve",
      "cold radiated from the stone walls, not the cold of winter but the cold of absence—of heat that had been deliberately removed",
      "his fingers tingled where they'd touched the artifact, a sensation that persisted even after he logged out",
      "the blood essence flowing through his veins felt like liquid electricity, warm and alive and hungry",
      "the VR haptics couldn't fully replicate it, but his body filled in the gaps—the roughness of stone, the slickness of blood"
    ],
    smell: [
      "the air smelled of ozone and old libraries, a combination that shouldn't exist but felt perfectly natural here",
      "copper and roses—the signature scent of blood magic, sweet and metallic in equal measure",
      "petrichor drifted through the cavern, impossible underground, as if the stone itself remembered rain",
      "the antiseptic smell of the hospital clung to his memory even in the game, a ghost of the real world he couldn't shake",
      "something ancient and mineral, like caves that hadn't been opened in centuries, air that had never been breathed"
    ],
    taste: [
      "the blood essence tasted like lightning and iron, a flavor that existed somewhere between pain and ecstasy",
      "the potion went down like liquid smoke, coating his throat with warmth that spread to his fingertips",
      "adrenaline left a copper taste on his tongue, sharp and real despite the digital nature of the danger",
      "the air was so thick with mana he could taste it—electric and sweet, like biting into a battery wrapped in honey",
      "fear had a taste here, metallic and cold, coating the back of his throat like a warning"
    ]
  };

  // --- INTERNAL THOUGHT PATTERNS ---
  const thoughtPatterns = [
    "The thought surfaced unbidden, sharp as a blade: {thought}",
    "He turned the idea over in his mind like a stone in his palm. {thought}",
    "Something clicked into place behind his eyes—not quite understanding, but the shape of it. {thought}",
    "The realization didn't hit him. It seeped in, slow and cold, like water through cracks. {thought}",
    "He caught himself thinking it before he could stop: {thought}",
    "It was the kind of thought that changed the temperature of a room. {thought}",
    "His mind worked through it the way his body worked through combat—instinct first, logic second. {thought}",
    "The question hung in the space between heartbeats. {thought}"
  ];

  const mcThoughts = [
    "If I can bring a healing potion into the real world... what else is possible?",
    "She's been asleep for two years. Two years of machines breathing for her. There has to be something in this game.",
    "Every time I extract something, the line between the game and reality gets thinner. I can feel it.",
    "I'm getting stronger. Not just in the game. My hands don't shake anymore. My eyes see things in the dark they shouldn't.",
    "The other players grind for loot and rankings. I grind because my sister's life depends on it.",
    "This class wasn't meant for anyone. It was buried, hidden, forgotten. So why did I get it?",
    "I can feel the blood essence even when I'm logged out. It pulses in time with my heartbeat.",
    "Mom. Dad. They told me you were gone. But nothing in my life has been what they told me it was.",
    "The game is changing me. I can see it in the mirror—the way my eyes catch light differently now.",
    "Power isn't the goal. It never was. But I'd be lying if I said it didn't feel like coming home.",
    "Trust is a luxury I can't afford. But loneliness is a weight I can't carry much longer.",
    "Every extraction is a gamble. Every gamble is a step closer to saving her. Or losing myself.",
    "The NPCs look at me differently than they look at other players. Like they recognize something in my code.",
    "I wonder if she dreams. If somewhere in that coma, she's living a life I can't see.",
    "The Progenitor class isn't just a set of abilities. It's a bloodline. And bloodlines have histories."
  ];

  // --- CHAPTER GENERATION ENGINE ---

  // Select without recent repetition
  function selectUnique(pool, usedList, count = 5) {
    const available = pool.filter(item => !usedList.slice(-count).includes(item));
    if (available.length === 0) return pool[Math.floor(random() * pool.length)];
    const selected = available[Math.floor(random() * available.length)];
    usedList.push(selected);
    return selected;
  }

  // Generate dynamic title by combining elements
  function generateDynamicTitle(type, setting) {
    // Use expanded pools if available
    const adjectives = getAdjectivesPool();
    const nouns = getNounsPool();
    const actions = getActionsPool();
    
    const adj = randomFrom(adjectives);
    const noun = randomFrom(nouns);
    const action = randomFrom(actions);
    const noun2 = randomFrom(nouns);
    
    const patterns = [
      `The ${adj} ${noun}`,
      `${noun} ${action}`,
      `When the ${noun} ${action}`,
      `The ${adj} ${noun} ${action}`,
      `${adj} ${noun}s`,
      `The ${action} of the ${noun}`,
      `${noun} in ${adj} Light`,
      `The ${adj} ${noun} Remains`,
      `Where the ${noun} ${action}`,
      `The ${noun} That Remains`,
      `${adj} ${action}`,
      `Beyond the ${adj} ${noun}`,
      `The Last ${noun}`,
      `${noun} and ${noun2}`,
      `The ${adj} ${action}`,
      `The ${noun}'s ${noun2}`,
      `${action} the ${noun}`,
      `The ${adj} ${noun} of ${noun2}`,
      `Where ${adj} ${noun}s ${action}`,
      `The ${noun} That ${action}s`,
      `${adj} ${noun}s ${action}`,
      `The ${action} of ${adj} ${noun}s`,
      `${noun} of ${adj} ${noun2}`,
      `The ${adj} ${noun} ${action}s`,
      `When ${adj} ${noun}s Meet`,
      `The ${noun} That ${adj} ${action}s`,
      `${adj} ${noun}s in the ${noun2}`,
      `The ${action} of the ${adj} ${noun}`,
      `${noun} Without ${noun2}`,
      `The ${adj} ${noun} of ${action}`,
      `Where ${noun}s ${action} Forever`,
      `The ${noun} That ${action}ed`,
      `${adj} ${noun}s of ${noun2}`,
      `The ${noun}'s ${adj} ${noun2}`,
      `${action}ing the ${adj} ${noun}`,
      `The ${noun} That ${action}ed ${noun2}`,
      `${adj} ${noun}s ${action}ing`,
      `The ${action} of ${noun} and ${noun2}`,
      `${noun} of ${adj} ${action}`,
      `The ${adj} ${noun} That ${action}s`,
      `${noun}s ${action} in ${adj} ${noun2}`,
      `The ${noun}'s ${adj} ${action}`,
      `${action}ing ${adj} ${noun}s`,
      `The ${noun} of ${adj} ${noun2}s`,
      `${adj} ${noun}s ${action} the ${noun2}`
    ];
    
    return randomFrom(patterns);
  }

  function randomFrom(arr) {
    return arr[Math.floor(random() * arr.length)];
  }

  function randomInt(min, max) {
    return Math.floor(random() * (max - min + 1)) + min;
  }

  function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // ============================================
  // POOL INTEGRATION FUNCTIONS
  // ============================================
  
  /**
   * Initialize pool integration with UnifiedPoolManager
   * @param {Object} integration - StoryPoolIntegration instance
   */
  function initializePoolIntegration(integration) {
    if (integration) {
      poolIntegration = integration;
      useExpandedPools = true;
    }
  }
  
  /**
   * Get expanded adjectives pool
   * @returns {Array} - Adjectives array
   */
  function getAdjectivesPool() {
    if (useExpandedPools && poolIntegration) {
      return poolIntegration.getAdjectives();
    }
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
   * Get expanded nouns pool
   * @returns {Array} - Nouns array
   */
  function getNounsPool() {
    if (useExpandedPools && poolIntegration) {
      return poolIntegration.getNouns();
    }
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
   * Get expanded actions pool
   * @returns {Array} - Actions array
   */
  function getActionsPool() {
    if (useExpandedPools && poolIntegration) {
      return poolIntegration.getActions();
    }
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

  // Determine chapter setting (balance VR and real world)
  function getChapterSetting() {
    if (storyTracker.consecutiveVR >= 4) {
      storyTracker.consecutiveVR = 0;
      storyTracker.consecutiveReal++;
      return "real_world";
    }
    if (storyTracker.consecutiveReal >= 2) {
      storyTracker.consecutiveReal = 0;
      storyTracker.consecutiveVR++;
      return "vr_world";
    }
    const roll = random();
    if (roll < 0.65) {
      storyTracker.consecutiveVR++;
      storyTracker.consecutiveReal = 0;
      return "vr_world";
    } else {
      storyTracker.consecutiveReal++;
      storyTracker.consecutiveVR = 0;
      return "real_world";
    }
  }

  // Select chapter type (never repeat last type)
  function getChapterType() {
    let type;
    const arcName = storyArcs[storyTracker.currentArc % storyArcs.length].name;
    // Weight certain types based on arc
    const weights = {};
    chapterTypes.forEach(t => weights[t] = 1);

    if (arcName.includes("Dungeon") || arcName.includes("Echoes")) {
      weights["combat"] = 3; weights["boss_fight"] = 2; weights["exploration"] = 2;
    } else if (arcName.includes("Sister") || arcName.includes("Bonds")) {
      weights["relationship"] = 3; weights["sister_moment"] = 3; weights["introspection"] = 2;
    } else if (arcName.includes("Market") || arcName.includes("Auction")) {
      weights["economy"] = 3; weights["crafting"] = 2; weights["social"] = 2;
    } else if (arcName.includes("Guild") || arcName.includes("Rivals")) {
      weights["pvp"] = 2; weights["rival_encounter"] = 3; weights["clan_guild"] = 2;
    } else if (arcName.includes("Evolution") || arcName.includes("Bloodline")) {
      weights["vampire_power"] = 3; weights["skill_evolution"] = 3; weights["training"] = 2;
    } else if (arcName.includes("Memory") || arcName.includes("Whispers")) {
      weights["flashback"] = 3; weights["lore_discovery"] = 3; weights["investigation"] = 2;
    }

    const weighted = [];
    for (const [t, w] of Object.entries(weights)) {
      for (let i = 0; i < w; i++) weighted.push(t);
    }

    do {
      type = randomFrom(weighted);
    } while (type === storyTracker.lastChapterType);

    storyTracker.lastChapterType = type;
    return type;
  }

  // Generate chapter title
  function generateTitle(chapterNum, type, setting) {
    const vrTitles = {
      exploration: [
        "Uncharted Corridors", "Beyond the Map's Edge", "Where Light Fears to Reach", "The Path Not Coded", "Echoes of Forgotten Rooms",
        "The Silent Corridor", "Shadows in the Code", "Digital Horizons", "The Unmapped Zone", "Where Data Dreams",
        "The Algorithm's Edge", "Binary Wilderness", "The Glitch in Reality", "Virtual Frontiers", "The System's Secret",
        "Beyond the Render Distance", "The Hidden Sector", "Where the Map Ends", "The Unseen Path", "Digital Echoes",
        "The Void Between Zones", "The Forgotten Layer", "Where Servers Sleep", "The Architecture of Mystery", "The Unwritten Code"
      ],
      combat: [
        "Steel and Shadow", "The Dance of Blades", "Blood on Digital Stone", "When Monsters Breathe", "The Weight of Violence",
        "The First Strike", "Clash of Code", "The Battle Algorithm", "When HP Drops Low", "The Combat Rhythm",
        "Death in the Digital", "The Fight Protocol", "When Skills Collide", "The Damage Numbers Rise", "The Last Stand",
        "Victory's Cost", "The Arena's Echo", "When Monsters Fall", "The Combat Log", "The Strike That Matters",
        "The Warrior's Code", "When Blood Flows", "The Battle's End", "The Damage Dealt", "The Combat Zone"
      ],
      boss_fight: [
        "The Throne Room Trembles", "A Name Written in Damage Numbers", "The Thing That Waited", "Crown of the Conquered", "What Doesn't Die Easily",
        "The Final Boss", "When the Raid Begins", "The Titan's Fall", "The Boss's Last Breath", "The Raid's Climax",
        "When Legends Fall", "The Ultimate Challenge", "The Boss's Domain", "The Raid Commander", "The Final Phase",
        "When the Boss Enrages", "The Titan's Rage", "The Raid's End", "The Boss's Defeat", "The Victory Screen",
        "The Loot Drop", "The Boss's Legacy", "When the Raid Succeeds", "The Final Blow", "The Champion's Reward"
      ],
      dialogue: [
        "Words Between Worlds", "The Things We Say in Dungeons", "Conversations at the Edge", "Trust is a Traded Currency", "What the NPC Knew",
        "The Dialogue Tree", "When Players Talk", "The NPC's Secret", "The Conversation That Changed Everything", "Words in the Void",
        "The Truth Spoken", "When Silence Breaks", "The Dialogue Choice", "The NPC's Story", "The Words That Matter",
        "The Conversation's End", "When Secrets Are Shared", "The Dialogue Branch", "The NPC's Warning", "The Words Left Unsaid",
        "The Truth Revealed", "When Players Listen", "The Dialogue Path", "The NPC's Request", "The Words That Bind"
      ],
      training: [
        "The Grind Behind Closed Doors", "Repetition as Religion", "Muscle Memory in a Digital Body", "The Quiet Work of Getting Stronger", "Practice Bleeds Into Instinct",
        "The Training Ground", "When Skills Improve", "The XP Grind", "The Level Up", "The Skill Point",
        "The Training Session", "When Stats Rise", "The Practice Makes Perfect", "The Training Dummy", "The Skill Mastery",
        "The Grind Continues", "When Power Grows", "The Training Regimen", "The Skill Tree", "The Level Cap",
        "The Training Complete", "When Mastery Comes", "The Skill Evolution", "The Training Hall", "The Power Gained"
      ],
      lore_discovery: [
        "Written in Older Code", "The Archive Speaks", "Fragments of a Deleted World", "What the Developers Buried", "History Has Teeth",
        "The Ancient Text", "When Lore Unfolds", "The Hidden Story", "The Archive's Secret", "The Lost History",
        "The Lore Revealed", "When Secrets Surface", "The Ancient Mystery", "The Archive's Truth", "The Forgotten Tale",
        "The Lore Discovered", "When History Speaks", "The Ancient Prophecy", "The Archive's Wisdom", "The Lost Knowledge",
        "The Lore Unlocked", "When Truth Emerges", "The Ancient Legend", "The Archive's Power", "The Hidden Truth"
      ],
      dungeon: [
        "Deeper Than the Map Shows", "The Walls Remember", "Corridors of Consequence", "What Lives Below", "The Dungeon's Heartbeat",
        "The Dungeon Gate", "When Darkness Falls", "The Dungeon's Depths", "The Monster's Lair", "The Treasure Room",
        "The Dungeon's Secret", "When Traps Trigger", "The Dungeon's Maze", "The Boss Chamber", "The Loot Found",
        "The Dungeon's End", "When Light Returns", "The Dungeon's Reward", "The Escape Route", "The Dungeon Cleared",
        "The Dungeon's Legacy", "When Monsters Die", "The Dungeon's Mystery", "The Hidden Treasure", "The Dungeon Master"
      ],
      skill_evolution: [
        "The Skill Remembers", "Evolution's Edge", "When Power Outgrows Its Name", "The Next Form", "Transcendence in Small Steps",
        "The Skill Awakens", "When Evolution Begins", "The Skill's Power", "The Evolution Complete", "The Skill Transformed",
        "The Skill Evolves", "When Power Changes", "The Skill's Growth", "The Evolution's Path", "The Skill Ascends",
        "The Skill's Peak", "When Mastery Comes", "The Skill's Ultimate Form", "The Evolution's End", "The Skill Perfected",
        "The Skill's Legacy", "When Evolution Succeeds", "The Skill's New Power", "The Evolution's Gift", "The Skill's Destiny"
      ],
      vampire_power: [
        "The Blood Answers", "Progenitor's Pulse", "What the Darkness Gave", "Crimson Evolution", "The Hunger Refines Itself",
        "The Blood's Power", "When Darkness Calls", "The Vampire's Strength", "The Blood's Gift", "The Hunger Grows",
        "The Blood Awakens", "When Power Rises", "The Vampire's Might", "The Blood's Curse", "The Hunger Takes Over",
        "The Blood's Peak", "When Darkness Reigns", "The Vampire's Dominion", "The Blood's Legacy", "The Hunger Satisfied",
        "The Blood's Destiny", "When Power Completes", "The Vampire's Evolution", "The Blood's Truth", "The Hunger's End"
      ],
      crafting: [
        "Forge and Fragment", "The Art of Making", "Materials Have Memory", "Creation from Chaos", "The Crafter's Meditation",
        "The Crafting Table", "When Items Form", "The Material's Power", "The Crafted Item", "The Recipe Revealed",
        "The Crafting Process", "When Creation Begins", "The Material's Secret", "The Crafted Weapon", "The Recipe Mastered",
        "The Crafting Complete", "When Items Shine", "The Material's Legacy", "The Crafted Armor", "The Recipe's End",
        "The Crafting's Art", "When Creation Succeeds", "The Material's Gift", "The Crafted Treasure", "The Recipe's Reward"
      ],
      economy: [
        "Gold Flows Downhill", "The Market's Invisible Hand", "Trading in Shadows", "Supply, Demand, and Deception", "The Price of Everything",
        "The Market Place", "When Gold Changes Hands", "The Trade Route", "The Merchant's Secret", "The Price Negotiated",
        "The Economy Shifts", "When Wealth Grows", "The Trade Deal", "The Merchant's Offer", "The Price Settled",
        "The Market's End", "When Gold Flows", "The Trade Complete", "The Merchant's Profit", "The Price Paid",
        "The Economy's Truth", "When Wealth Matters", "The Trade's Value", "The Merchant's Legacy", "The Price's Worth"
      ],
      social: [
        "Guilds and Grudges", "The Politics of Parties", "Alliances Written in Sand", "When Players Become People", "The Social Layer",
        "The Guild Hall", "When Alliances Form", "The Party Gathers", "The Social Network", "The Guild's Purpose",
        "The Social Event", "When Friends Meet", "The Party's Mission", "The Social Bond", "The Guild's Power",
        "The Social's End", "When Alliances Break", "The Party's Dissolution", "The Social Conflict", "The Guild's Fall",
        "The Social's Truth", "When Friends Part", "The Party's Legacy", "The Social's Impact", "The Guild's Memory"
      ],
      pvp: [
        "Player Versus Player Versus Self", "The Arena Doesn't Lie", "Ranked in Blood", "When Friends Fight", "The Leaderboard's Shadow",
        "The Arena Gate", "When Combat Begins", "The Ranked Match", "The PvP Battle", "The Leaderboard Rises",
        "The Arena Fight", "When Players Clash", "The Ranked Victory", "The PvP Defeat", "The Leaderboard Falls",
        "The Arena's End", "When Combat Ends", "The Ranked Season", "The PvP Champion", "The Leaderboard's Peak",
        "The Arena's Truth", "When Players Prove", "The Ranked Glory", "The PvP Legend", "The Leaderboard's Legacy"
      ],
      quest: [
        "The Quest Log Grows", "Objectives and Obsessions", "Following the Breadcrumbs", "What the Quest Didn't Mention", "The Reward Isn't the Point",
        "The Quest Board", "When Adventure Calls", "The Objective Set", "The Quest's Path", "The Reward Promised",
        "The Quest Begins", "When Heroes Rise", "The Objective Complete", "The Quest's End", "The Reward Claimed",
        "The Quest's Truth", "When Legends Form", "The Objective's Meaning", "The Quest's Legacy", "The Reward's Worth",
        "The Quest's End", "When Stories End", "The Objective's Purpose", "The Quest's Memory", "The Reward's Gift"
      ],
      world_event: [
        "The Sky Changed Color", "When the Server Trembled", "An Event Without Precedent", "The World Holds Its Breath", "Patch Notes Written in Fire",
        "The Event Begins", "When Worlds Change", "The Server Update", "The Event's Impact", "The World Reacts",
        "The Event Unfolds", "When History Happens", "The Server's Change", "The Event's Effect", "The World Transforms",
        "The Event's End", "When Normal Returns", "The Server's New State", "The Event's Legacy", "The World Remembers",
        "The Event's Truth", "When Change Stays", "The Server's Evolution", "The Event's Memory", "The World's Future"
      ],
      stealth: [
        "The Shadow's Patience", "Unseen and Unheard", "Moving Between Heartbeats", "The Art of Not Being There", "Silence as a Weapon",
        "The Stealth Approach", "When Shadows Hide", "The Silent Step", "The Stealth Mission", "The Unseen Path",
        "The Stealth Move", "When Darkness Cloaks", "The Silent Strike", "The Stealth Success", "The Unseen Victory",
        "The Stealth's End", "When Light Finds", "The Silent Escape", "The Stealth's Reward", "The Unseen Legacy",
        "The Stealth's Truth", "When Shadows Serve", "The Silent Art", "The Stealth's Mastery", "The Unseen Power"
      ],
      investigation: [
        "Clues in the Code", "The Trail Goes Cold Then Hot", "Connecting Invisible Dots", "What Doesn't Add Up", "The Detective's Instinct",
        "The Investigation Begins", "When Clues Appear", "The Trail Forms", "The Mystery Deepens", "The Detective Works",
        "The Investigation Progresses", "When Truth Emerges", "The Trail Leads", "The Mystery Unfolds", "The Detective Discovers",
        "The Investigation's End", "When Truth Reveals", "The Trail Ends", "The Mystery Solved", "The Detective Succeeds",
        "The Investigation's Truth", "When Justice Comes", "The Trail's Purpose", "The Mystery's Meaning", "The Detective's Legacy"
      ]
    };

    const realTitles = {
      real_world: [
        "The Weight of Two Worlds", "Ordinary Feels Different Now", "Between Logins", "The Real World Doesn't Have a Pause Button", "Gravity Hits Different",
        "The Morning After", "When Reality Returns", "The Real World's Call", "The Login Ends", "The Physical World",
        "The Day Begins", "When Sleep Ends", "The Real World's Routine", "The Logout Complete", "The Physical Reality",
        "The Day's End", "When Night Falls", "The Real World's Peace", "The Sleep Comes", "The Physical Rest",
        "The Day's Truth", "When Reality Matters", "The Real World's Meaning", "The Sleep's Purpose", "The Physical Life"
      ],
      introspection: [
        "The Mirror Shows More Than It Should", "Thoughts at 3 AM", "The Space Between Breaths", "What I'm Becoming", "Questions Without Interfaces",
        "The Inner Voice", "When Thoughts Wander", "The Mind's Eye", "The Self Reflects", "The Questions Arise",
        "The Inner Journey", "When Thoughts Deepen", "The Mind's Path", "The Self Questions", "The Answers Come",
        "The Inner Truth", "When Thoughts Clear", "The Mind's Peace", "The Self Accepts", "The Questions End",
        "The Inner Peace", "When Thoughts Settle", "The Mind's Clarity", "The Self Understands", "The Answers Found"
      ],
      extraction: [
        "Bringing It Back", "The Line Between Real and Digital", "What Shouldn't Exist Here", "Extraction Protocol", "The Impossible Made Tangible",
        "The Extraction Begins", "When Worlds Merge", "The Digital Becomes Real", "The Extraction Process", "The Impossible Happens",
        "The Extraction Continues", "When Boundaries Blur", "The Digital Manifests", "The Extraction Progress", "The Impossible Takes Form",
        "The Extraction Complete", "When Worlds Separate", "The Digital Returns", "The Extraction Ends", "The Impossible Remains",
        "The Extraction's Truth", "When Reality Shifts", "The Digital's Gift", "The Extraction's Legacy", "The Impossible's Memory"
      ],
      sister_moment: [
        "Room 414", "The Sound of Machines Breathing", "Her Hand Was Still Warm", "Promises Made to Sleeping Ears", "The Vigil Continues",
        "The Hospital Room", "When Silence Speaks", "Her Face in Sleep", "The Promise Made", "The Vigil Holds",
        "The Hospital Visit", "When Memories Return", "Her Voice in Dreams", "The Promise Kept", "The Vigil Endures",
        "The Hospital's End", "When Hope Fades", "Her Memory Lives", "The Promise Remembered", "The Vigil's Purpose",
        "The Hospital's Truth", "When Love Remains", "Her Spirit Stays", "The Promise's Meaning", "The Vigil's Legacy"
      ],
      flashback: [
        "Before the Headset", "Memory Has Sharp Edges", "The Past Isn't Past", "What I Thought I Knew", "Fragments of Before",
        "The Memory Returns", "When Past Resurfaces", "The Old Days", "The Memory's Pain", "The Past's Echo",
        "The Memory Deepens", "When Truth Emerges", "The Old Life", "The Memory's Lesson", "The Past's Wisdom",
        "The Memory's End", "When Healing Comes", "The Old Self", "The Memory's Peace", "The Past's Release",
        "The Memory's Truth", "When Acceptance Arrives", "The Old Ways", "The Memory's Gift", "The Past's Meaning"
      ],
      relationship: [
        "The Distance Between People", "What We Don't Say", "Connection in the Static", "People Are Not NPCs", "The Hardest Dungeon Is Trust",
        "The Relationship Begins", "When Hearts Meet", "The Connection Forms", "The Trust Builds", "The Bond Strengthens",
        "The Relationship Grows", "When Feelings Deepen", "The Connection Expands", "The Trust Tested", "The Bond Endures",
        "The Relationship's End", "When Hearts Break", "The Connection Fades", "The Trust Shatters", "The Bond Dissolves",
        "The Relationship's Truth", "When Love Remains", "The Connection's Memory", "The Trust's Legacy", "The Bond's Meaning"
      ],
      romance_scene: [
        "Something Shifted", "The Quiet Between Words", "Not Everything Is Combat", "Warmth in Unexpected Places", "The Heart's Own Quest",
        "The Romance Begins", "When Sparks Fly", "The Heart Races", "The Romance Blooms", "The Love Grows",
        "The Romance Deepens", "When Passion Ignites", "The Heart Soars", "The Romance Flourishes", "The Love Strengthens",
        "The Romance's End", "When Hearts Break", "The Passion Fades", "The Romance Withers", "The Love Ends",
        "The Romance's Truth", "When Memories Remain", "The Heart's Healing", "The Romance's Legacy", "The Love's Meaning"
      ],
      mentor_lesson: [
        "The Old Man's Words", "Lessons Without Levels", "Wisdom Doesn't Give XP", "What Can't Be Taught", "The Mentor's Silence",
        "The Lesson Begins", "When Wisdom Speaks", "The Mentor Teaches", "The Lesson Learned", "The Wisdom Gained",
        "The Lesson Deepens", "When Truth Reveals", "The Mentor Guides", "The Lesson's Path", "The Wisdom's Light",
        "The Lesson's End", "When Understanding Comes", "The Mentor's Pride", "The Lesson Complete", "The Wisdom Mastered",
        "The Lesson's Truth", "When Knowledge Serves", "The Mentor's Legacy", "The Lesson's Impact", "The Wisdom's Gift"
      ],
      rival_encounter: [
        "We Meet Again", "The Rivalry Evolves", "Respect Disguised as Hostility", "When Rivals Understand Each Other", "The Competition Deepens",
        "The Rival Appears", "When Competition Starts", "The Rivalry Forms", "The Challenge Issued", "The Battle Begins",
        "The Rivalry Grows", "When Skills Clash", "The Rivalry Intensifies", "The Challenge Accepted", "The Battle Rages",
        "The Rivalry's End", "When Respect Emerges", "The Competition Settles", "The Challenge Met", "The Battle Ends",
        "The Rivalry's Truth", "When Friendship Forms", "The Competition's Purpose", "The Challenge's Meaning", "The Battle's Legacy"
      ],
      nightmare_vision: [
        "The Dream That Wasn't", "Visions Behind Closed Eyes", "What Sleep Reveals", "The Nightmare Knows My Name", "Between Waking and Warning",
        "The Nightmare Begins", "When Darkness Calls", "The Vision Forms", "The Nightmare's Grip", "The Fear Rises",
        "The Nightmare Deepens", "When Terror Strikes", "The Vision Intensifies", "The Nightmare's Hold", "The Fear Peaks",
        "The Nightmare's End", "When Dawn Breaks", "The Vision Fades", "The Nightmare Releases", "The Fear Subsides",
        "The Nightmare's Truth", "When Lessons Come", "The Vision's Meaning", "The Nightmare's Purpose", "The Fear's Message"
      ],
      rest_recovery: [
        "The Body Remembers", "Rest Is Not Weakness", "Healing Takes Time", "The Quiet After", "Recovery Has Its Own Rhythm",
        "The Rest Begins", "When Healing Starts", "The Body Recovers", "The Rest's Peace", "The Recovery's Path",
        "The Rest Deepens", "When Strength Returns", "The Body Heals", "The Rest's Comfort", "The Recovery's Progress",
        "The Rest's End", "When Energy Returns", "The Body Renewed", "The Rest Complete", "The Recovery Finished",
        "The Rest's Truth", "When Health Restores", "The Body's Wisdom", "The Rest's Purpose", "The Recovery's Gift"
      ],
      travel: [
        "The Road Between", "Moving Through the World", "Distance and Thought", "The Journey Is the Chapter", "Between Here and There",
        "The Journey Begins", "When Travel Starts", "The Road Opens", "The Journey's Path", "The Distance Grows",
        "The Journey Continues", "When Miles Pass", "The Road Winds", "The Journey's Progress", "The Distance Shrinks",
        "The Journey's End", "When Arrival Comes", "The Road Ends", "The Journey Complete", "The Distance Gone",
        "The Journey's Truth", "When Memories Form", "The Road's Meaning", "The Journey's Purpose", "The Distance's Worth"
      ],
      clan_guild: [
        "Building Something Bigger", "The First Members", "Organization and Ambition", "What a Clan Means", "The Guild Takes Shape",
        "The Clan Forms", "When Members Gather", "The Organization Rises", "The Ambition Grows", "The Guild's Purpose",
        "The Clan Expands", "When Power Increases", "The Organization Strengthens", "The Ambition Spreads", "The Guild's Influence",
        "The Clan's Peak", "When Glory Comes", "The Organization's Triumph", "The Ambition Achieved", "The Guild's Legend",
        "The Clan's Truth", "When Legacy Remains", "The Organization's Impact", "The Ambition's Meaning", "The Guild's Memory"
      ]
    };

    const allTitles = { ...vrTitles, ...realTitles };
    const titlePool = allTitles[type] || allTitles["exploration"];
    
    // Hash function for title uniqueness
    function hashTitle(title) {
      const str = String(title).trim();
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash;
    }
    
    // Generate unique title with retries
    let title;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      // Try dynamic title generation 50% of the time
      if (random() < 0.5) {
        title = generateDynamicTitle(type, setting);
      } else {
        // Try to select from pool
        const available = titlePool.filter(item => !storyTracker.usedTitles.includes(item));
        if (available.length > 0) {
          title = available[Math.floor(random() * available.length)];
        } else {
          title = generateDynamicTitle(type, setting);
        }
      }
      
      // Check if title is unique using hash
      const hash = hashTitle(title);
      if (!storyTracker.titleHashes.has(hash)) {
        storyTracker.titleHashes.add(hash);
        storyTracker.usedTitles.push(title);
        return title;
      }
      
      attempts++;
    }
    
    // Fallback: Generate deterministic unique title
    title = `Chapter ${chapterNum}: ${Date.now()}-${Math.random()}`;
    const hash = hashTitle(title);
    storyTracker.titleHashes.add(hash);
    storyTracker.usedTitles.push(title);
    return title;
  }

  // Build sensory paragraph
  function buildSensoryDetail() {
    const senses = Object.keys(sensoryDetails);
    const chosen = shuffleArray(senses).slice(0, randomInt(2, 3));
    return chosen.map(s => randomFrom(sensoryDetails[s])).join(". ") + ".";
  }

  // Generate stat changes for a chapter
  function generateStatChanges(type) {
    const changes = [];
    switch (type) {
      case "combat":
      case "boss_fight":
      case "pvp":
        if (random() > 0.3) { mcState.xp += randomInt(20, 80); changes.push({ stat: "XP", val: "+" + randomInt(20, 80) }); }
        if (random() > 0.5) { const g = randomInt(10, 50); mcState.gold += g; changes.push({ stat: "Gold", val: "+" + g }); }
        if (random() > 0.6) { mcState.strength += 1; changes.push({ stat: "STR", val: "+1" }); }
        if (random() > 0.7) { mcState.killCount += randomInt(1, 5); changes.push({ stat: "Kills", val: "+" + randomInt(1, 5) }); }
        if (type === "boss_fight") { mcState.bossesDefeated++; changes.push({ stat: "Boss", val: "+1" }); }
        mcState.bloodlust = Math.min(100, mcState.bloodlust + randomInt(5, 15));
        break;
      case "extraction":
        mcState.extractionCount++; changes.push({ stat: "Extract", val: "+1" });
        break;
      case "training":
      case "skill_evolution":
        if (random() > 0.4) { mcState.agility += 1; changes.push({ stat: "AGI", val: "+1" }); }
        if (random() > 0.4) { mcState.intelligence += 1; changes.push({ stat: "INT", val: "+1" }); }
        mcState.xp += randomInt(10, 40);
        break;
      case "vampire_power":
        mcState.darkAffinity += randomInt(1, 3); changes.push({ stat: "Dark Affinity", val: "+" + randomInt(1, 3) });
        mcState.regeneration += 1; changes.push({ stat: "Regen", val: "+1" });
        if (random() > 0.5) { mcState.domination += 1; changes.push({ stat: "Domination", val: "+1" }); }
        break;
      case "dungeon":
        mcState.xp += randomInt(30, 60);
        mcState.dungeonsCleared++; changes.push({ stat: "Dungeon", val: "+1" });
        if (random() > 0.5) { const g = randomInt(20, 80); mcState.gold += g; changes.push({ stat: "Gold", val: "+" + g }); }
        break;
      case "crafting":
      case "economy":
        if (random() > 0.5) { const g = randomInt(5, 30); mcState.gold += g; changes.push({ stat: "Gold", val: "+" + g }); }
        break;
      case "lore_discovery":
        if (random() > 0.5) { mcState.intelligence += 1; changes.push({ stat: "INT", val: "+1" }); }
        mcState.willpower += 1; changes.push({ stat: "Willpower", val: "+1" });
        break;
      case "introspection":
      case "sister_moment":
        mcState.willpower += 1; changes.push({ stat: "Willpower", val: "+1" });
        if (random() > 0.6) { mcState.karma += randomInt(1, 3); changes.push({ stat: "Karma", val: "+" + randomInt(1, 3) }); }
        break;
      case "exploration":
      case "travel":
        mcState.xp += randomInt(5, 20);
        if (random() > 0.6) { mcState.luck += 1; changes.push({ stat: "Luck", val: "+1" }); }
        if (random() > 0.7) { mcState.instinct += 1; changes.push({ stat: "Instinct", val: "+1" }); }
        break;
      default:
        if (random() > 0.7) { mcState.xp += randomInt(5, 15); }
        break;
    }

    // Level up check
    while (mcState.xp >= mcState.xpToNext) {
      mcState.xp -= mcState.xpToNext;
      mcState.level++;
      mcState.xpToNext = Math.floor(mcState.xpToNext * 1.15);
      mcState.maxHp += randomInt(15, 30);
      mcState.maxSp += randomInt(8, 15);
      mcState.maxMp += randomInt(10, 20);
      mcState.maxBloodEssence += randomInt(5, 10);
      mcState.hp = mcState.maxHp;
      mcState.sp = mcState.maxSp;
      mcState.mp = mcState.maxMp;
      mcState.bloodEssence = mcState.maxBloodEssence;
      changes.push({ stat: "LEVEL UP", val: mcState.level, levelUp: true });
    }

    return changes;
  }

  // ============================================
  // PARAGRAPH GENERATORS — Each type unique
  // ============================================

  function generateExplorationParagraphs(setting, region) {
    const paras = [];
    const sensory = buildSensoryDetail();

    if (setting === "vr_world") {
      // Create more unique openings by combining templates with different sensory details
      const openingTemplates = [
        `The corridor opened into something that hadn't been on any map I'd checked. [SENSORY] My interface pulsed softly at the edge of my vision, cataloging new data faster than I could read it.`,
        `I pressed deeper into [REGION], where [REGION_DESC]. [SENSORY] Every step felt like the first step anyone had ever taken here.`,
        `The path split three ways ahead of me, each branch promising something different. [SENSORY] My Predator's Instinct tingled—not danger, exactly, but significance. Something waited down one of these paths that the game wanted me to find.`,
        `[REGION] stretched before me in impossible geometry. [SENSORY] The minimap in my interface showed blank space—uncharted territory that the game hadn't bothered to render until I arrived.`,
        `The air grew thick with ancient power as I ventured into [REGION]. [SENSORY] My Blood Essence responded to the ambient mana, vibrating with a frequency that felt almost like recognition.`,
        `Hidden passages revealed themselves as I explored [REGION]. [SENSORY] The game world seemed to be teaching me its secrets one discovery at a time, rewarding curiosity with glimpses of something vast and old.`,
        `The architecture here defied conventional logic—floating platforms, impossible angles, structures that shouldn't stand but did. [SENSORY] I moved carefully, knowing that in this place, the rules of physics were more like suggestions.`,
        `Time seemed to move differently in [REGION]. [SENSORY] Hours could pass in moments, or moments stretch into hours, depending on how the game decided to render the flow of experience.`
      ,
      `The [ENEMY_NAME] emerged from the darkness with impossible speed—[ENEMY_DESC]. My Predator's Instinct screamed a warning half a second before it struck, giving me just enough time to activate [SKILL_NAME] and brace for impact.`,
      `I'd been hunting the [ENEMY_NAME] for what felt like hours, tracking it through winding corridors and hidden passages. [ENEMY_DESC]. When I finally cornered it, it didn't flee—it turned to fight with a ferocity that made my blood sing.`,
      `The arena was ancient, the stone floor worn smooth by countless battles. The [ENEMY_NAME] materialized in the center, [ENEMY_DESC]. This wasn't just a fight—it was a test, and the game wanted to see if I was worthy of what lay beyond.`,
      `Three [ENEMY_NAME]s blocked my path, each one more dangerous than the last. [ENEMY_DESC]. My interface showed them all in red, their levels high enough to make this a genuine challenge. I smiled. Finally, something worth fighting.`,
      `The [ENEMY_NAME] had been waiting for me. I could tell by the way it was positioned—perfect ambush spot, clear escape route, multiple attack vectors. [ENEMY_DESC]. It thought it had the advantage. It was wrong.`,
      `Lightning split the sky as the [ENEMY_NAME] descended from above, [ENEMY_DESC]. The impact cratered the ground around us, debris flying in every direction. I stood my ground, [SKILL_NAME] already activating, because running wasn't an option anymore.`
      ];
      
      // Generate unique opening by combining template with current values
      const openingTemplate = randomFrom(openingTemplates);
      const opening = openingTemplate
        .replace('[SENSORY]', sensory)
        .replace('[REGION]', region.name)
        .replace('[REGION_DESC]', region.desc);
      paras.push(opening);

      // Create more unique middle paragraphs
      const middleTemplates = [
        `The walls here were different from the starter areas. Older. The textures had a depth to them that felt hand-crafted rather than procedurally generated, as if someone had spent months on every crack and shadow. I ran my fingers along the stone and felt the haptics respond with surprising detail—cold, rough, ancient. My Blood Essence stirred in response to something embedded in the architecture, a resonance I couldn't explain.`,
        `I found markings on the floor—not player markers or quest indicators, but something etched into the game world itself. Symbols that predated the current version, remnants of whatever this place had been before the developers reshaped it. The Archivist would have lost his mind over these. I took screenshots, knowing they'd be worth something to the right people.`,
        `A sound reached me from deeper in—not the ambient soundtrack, but something layered beneath it. A rhythm. A heartbeat. The kind of sound that made you realize the dungeon wasn't a place. It was a thing. Alive, or close enough to alive that the distinction stopped mattering. I adjusted my grip on my weapon and kept moving, because stopping felt like the wrong answer.`,
        `The environment shifted gradually as I progressed. The temperature dropped—I could feel it through the haptics, a creeping cold that started at my fingertips and worked inward. The lighting changed too, from the warm amber of torches to a pale, sourceless luminescence that seemed to come from the stone itself. This deep, the game stopped pretending to follow real-world rules.`,
        `My interface highlighted points of interest with increasing frequency as I explored [REGION]. Hidden caches, secret passages, environmental storytelling that the developers had woven into every corner. This wasn't just a dungeon—it was a narrative in stone and shadow, and I was walking through its pages.`,
        `The creatures here were different too. Not just stronger, but smarter. They didn't attack on sight—they watched, they assessed, they chose their moments. My Predator's Instinct warned me of ambushes before they happened, the skill proving its worth with every avoided trap.`,
        `I discovered evidence of previous explorers—broken equipment, abandoned camps, messages scrawled on walls in languages I couldn't read. Some had made it further than others. None had made it all the way. The question was whether I would be the exception.`,
        `The deeper I went into [REGION], the more the game world seemed to respond to my presence. Not just the monsters, but the environment itself—walls shifting, paths opening, secrets revealing themselves as if the dungeon was testing me, measuring my worthiness to proceed.`
      ];
      
      // Generate unique middles by combining templates with current values
      const middle1Template = randomFrom(middleTemplates);
      const middle1 = middle1Template
        .replace('[REGION]', region.name)
        .replace('[REGION_DESC]', region.desc);
      paras.push(middle1);
      
      const availableMiddles = middleTemplates.filter(t => t !== middle1Template);
      const middle2Template = randomFrom(availableMiddles);
      const middle2 = middle2Template
        .replace('[REGION]', region.name)
        .replace('[REGION_DESC]', region.desc);
      paras.push(middle2);

    } else {
      const realLoc = randomFrom(realWorldLocations);
      const openings = [
        `${realLoc.desc} I walked through it all with eyes that saw too much now—the way light bent around corners, the micro-expressions on strangers' faces, the structural weaknesses in every building I passed. The game had rewired my perception, and the real world hadn't gotten the memo.`,
        `The city felt smaller after the VR world. Not physically—the buildings were still tall, the streets still wide—but the scale of possibility had shrunk. No hidden dungeons behind that alley wall. No treasure chests in that abandoned lot. Just concrete and consequence and the slow grind of ordinary time.`,
        `I found myself cataloging everything like an inventory screen. The coffee in my hand: Common consumable, +5 alertness, -2 sleep quality. The stranger's umbrella: Improvised weapon, low durability. The game was bleeding into how I processed reality, and I wasn't sure I wanted it to stop.`
      ];
      paras.push(randomFrom(openings));

      const middles = [
        `The extracted items sat in a locked drawer in my apartment, wrapped in cloth like artifacts in a museum. A health potion that glowed faintly in the dark. A dagger that was sharper than anything manufactured on Earth. Materials that didn't match any known element on the periodic table. Each one was proof that the boundary between worlds was thinner than anyone imagined.`,
        `People moved around me in their routines—commuters, students, delivery drivers—and I envied their simplicity. They lived in one world. I lived in two, and the gap between them was filled with secrets that would sound insane if I spoke them aloud. So I didn't. I walked, and I watched, and I planned my next login.`,
        `My body felt different lately. Stronger, yes, but also more aware. I could hear conversations from across the street. My reflexes had sharpened to the point where I'd caught a falling glass before I'd consciously registered it tipping. The Vampire Progenitor class wasn't just changing my avatar. It was changing me.`
      ];
      paras.push(randomFrom(middles));
      paras.push(randomFrom(middles.filter(m => !paras.includes(m))));
    }

    return paras;
  }

  function generateCombatParagraphs(setting) {
    const paras = [];
    const enemies = [
      { name: "Shadow Wraith", level: mcState.level + randomInt(-2, 3), desc: "a creature of compressed darkness that moved like smoke and hit like a truck" },
      { name: "Bone Sentinel", level: mcState.level + randomInt(-1, 4), desc: "seven feet of animated skeleton wrapped in rusted armor, its eye sockets burning with cold blue fire" },
      { name: "Crimson Stalker", level: mcState.level + randomInt(0, 5), desc: "a lesser vampire that had gone feral, all instinct and hunger with none of the intelligence" },
      { name: "Thornbeast", level: mcState.level + randomInt(-2, 2), desc: "a mass of living thorns and vines that had learned to hunt, patient and relentless" },
      { name: "Void Crawler", level: mcState.level + randomInt(1, 6), desc: "something that existed between dimensions, its body flickering in and out of visibility" },
      { name: "Iron Construct", level: mcState.level + randomInt(0, 3), desc: "a mechanical guardian left over from a forgotten era, its joints screaming with every movement" },
      { name: "Frost Serpent", level: mcState.level + randomInt(-1, 3), desc: "a coiling mass of ice and scales that moved with impossible speed, its breath freezing everything it touched" },
      { name: "Flame Warden", level: mcState.level + randomInt(0, 4), desc: "an elemental guardian wreathed in eternal fire, its attacks leaving trails of molten stone" }
    ,
      { name: "Abyssal Horror", level: mcState.level + randomInt(2, 7), desc: "a writhing mass of tentacles and eyes from the deepest void, its presence warping reality around it" },
      { name: "Crystal Guardian", level: mcState.level + randomInt(1, 5), desc: "an ancient construct of living crystal that reflected attacks back at the source" },
      { name: "Blood Knight", level: mcState.level + randomInt(0, 4), desc: "a fallen vampire warrior clad in crimson armor, wielding a blade that drank blood with every strike" },
      { name: "Storm Caller", level: mcState.level + randomInt(1, 6), desc: "an elemental being that commanded lightning and thunder, its attacks crackling with raw power" },
      { name: "Shadow Weaver", level: mcState.level + randomInt(0, 3), desc: "a creature that could manipulate shadows, creating duplicates and striking from unexpected angles" },
      { name: "Venomous Hydra", level: mcState.level + randomInt(2, 5), desc: "a multi-headed serpent whose venom could melt through armor and flesh alike" },
      { name: "Spectral Banshee", level: mcState.level + randomInt(1, 4), desc: "a ghostly entity whose scream could shatter concentration and drain health" },
      { name: "Inferno Titan", level: mcState.level + randomInt(3, 8), desc: "a massive construct of molten rock and eternal flame, each step leaving burning footprints" },
      { name: "Frost Wraith", level: mcState.level + randomInt(0, 4), desc: "a spirit of pure cold that could freeze enemies in place with its touch" },
      { name: "Void Stalker", level: mcState.level + randomInt(2, 6), desc: "a hunter from between dimensions that could phase through walls and strike from nowhere" },
      { name: "Ancient Golem", level: mcState.level + randomInt(1, 5), desc: "a massive stone guardian that had stood watch for centuries, its body covered in runes of power" },
      { name: "Plague Carrier", level: mcState.level + randomInt(0, 3), desc: "a diseased creature whose very presence spread corruption and decay" },
      { name: "Thunder Drake", level: mcState.level + randomInt(2, 5), desc: "a winged reptile that rode lightning bolts and struck with electrifying speed" },
      { name: "Mind Flayer", level: mcState.level + randomInt(3, 7), desc: "a psychic predator that could attack the mind directly, bypassing physical defenses" },
      { name: "Bone Dragon", level: mcState.level + randomInt(4, 9), desc: "an undead dragon whose skeletal form was harder than steel and whose breath was death" }
    ];

    const enemy = randomFrom(enemies);
    const skill = mcState.skills.length > 0 ? randomFrom(mcState.skills) : vampireSkills[0];

    // Create more unique combat openings
    const openingTemplates = [
        `The corridor opened into something that hadn't been on any map I'd checked. [SENSORY] My interface pulsed softly at the edge of my vision, cataloging new data faster than I could read it.`,
        `I pressed deeper into [REGION], where [REGION_DESC]. [SENSORY] Every step felt like the first step anyone had ever taken here.`,
        `The path split three ways ahead of me, each branch promising something different. [SENSORY] My Predator's Instinct tingled—not danger, exactly, but significance. Something waited down one of these paths that the game wanted me to find.`,
        `[REGION] stretched before me in impossible geometry. [SENSORY] The minimap in my interface showed blank space—uncharted territory that the game hadn't bothered to render until I arrived.`,
        `The air grew thick with ancient power as I ventured into [REGION]. [SENSORY] My Blood Essence responded to the ambient mana, vibrating with a frequency that felt almost like recognition.`,
        `Hidden passages revealed themselves as I explored [REGION]. [SENSORY] The game world seemed to be teaching me its secrets one discovery at a time, rewarding curiosity with glimpses of something vast and old.`,
        `The architecture here defied conventional logic—floating platforms, impossible angles, structures that shouldn't stand but did. [SENSORY] I moved carefully, knowing that in this place, the rules of physics were more like suggestions.`,
        `Time seemed to move differently in [REGION]. [SENSORY] Hours could pass in moments, or moments stretch into hours, depending on how the game decided to render the flow of experience.`
      ,
      `The [ENEMY_NAME] emerged from the darkness with impossible speed—[ENEMY_DESC]. My Predator's Instinct screamed a warning half a second before it struck, giving me just enough time to activate [SKILL_NAME] and brace for impact.`,
      `I'd been hunting the [ENEMY_NAME] for what felt like hours, tracking it through winding corridors and hidden passages. [ENEMY_DESC]. When I finally cornered it, it didn't flee—it turned to fight with a ferocity that made my blood sing.`,
      `The arena was ancient, the stone floor worn smooth by countless battles. The [ENEMY_NAME] materialized in the center, [ENEMY_DESC]. This wasn't just a fight—it was a test, and the game wanted to see if I was worthy of what lay beyond.`,
      `Three [ENEMY_NAME]s blocked my path, each one more dangerous than the last. [ENEMY_DESC]. My interface showed them all in red, their levels high enough to make this a genuine challenge. I smiled. Finally, something worth fighting.`,
      `The [ENEMY_NAME] had been waiting for me. I could tell by the way it was positioned—perfect ambush spot, clear escape route, multiple attack vectors. [ENEMY_DESC]. It thought it had the advantage. It was wrong.`,
      `Lightning split the sky as the [ENEMY_NAME] descended from above, [ENEMY_DESC]. The impact cratered the ground around us, debris flying in every direction. I stood my ground, [SKILL_NAME] already activating, because running wasn't an option anymore.`
      ];
    
    const openingTemplate = randomFrom(openingTemplates);
    const opening = openingTemplate
      .replace('[ENEMY_DESC]', enemy.desc)
      .replace('[ENEMY_LEVEL]', enemy.level)
      .replace('[SKILL_NAME]', skill.name)
      .replace('[ENEMY_NAME]', enemy.name);
    paras.push(opening);

    // Create more unique combat middle paragraphs
    const combatMiddleTemplates = [
      `I activated [SKILL_NAME] and felt the familiar rush—blood essence converting to power, flowing from my core to my extremities in a wave of crimson energy. The [ENEMY_NAME] staggered as the ability connected, damage numbers floating upward in a satisfying cascade. But it recovered faster than I expected. Its counterattack came low and fast, and I barely got my guard up in time. The impact rattled through my avatar's bones, my health bar dipping by a visible chunk. I gritted my teeth and adjusted my stance. This thing learned.`,
      `Combat in this game wasn't about button mashing. It was a conversation—a violent, high-speed dialogue of attacks and responses, feints and commitments. The [ENEMY_NAME] spoke in sweeping strikes and sudden lunges. I answered with Shadow Step repositions and Blood Lance counters, each exchange teaching me something about how it moved, how it thought, where its patterns had gaps. My Bloodlust meter climbed with each hit I landed, the stat boosting my damage incrementally, turning the tide in centimeters.`,
      `The [ENEMY_NAME]'s attack pattern shifted at half health—they always did, the good ones. New moves, faster timing, abilities it had been holding in reserve. A lesser player would have panicked. I felt my lips curl into something that wasn't quite a smile. This was where the Vampire Progenitor class showed its teeth. I let my Crimson Aura flare, the oppressive presence debuffing the creature's speed and attack power. Then I closed the distance and made it personal.`,
      `Blood splattered across the stone—mine and the [ENEMY_NAME]'s, mingling in patterns that the game rendered with disturbing beauty. My health was at sixty percent. My blood essence was at forty. The creature was wounded but far from finished, its movements becoming more desperate and unpredictable. I could play it safe, kite it, whittle it down. Or I could trust my instincts and go for the kill. The Progenitor's blood in my veins made the decision for me.`,
      `The [ENEMY_NAME] adapted faster than most. It recognized when I was preparing [SKILL_NAME] and adjusted its positioning to minimize the impact. Smart. Dangerous. I had to get creative—combining abilities, using the environment, fighting dirty. The Vampire Progenitor class rewarded improvisation, and I was learning to improvise like a master.`,
      `My interface flashed warnings—low health, depleted blood essence, critical status. The [ENEMY_NAME] had me on the ropes, [ENEMY_DESC]. But desperation was a powerful fuel. I pushed past my limits, drawing on reserves I didn't know I had, and turned the tide with a desperate gambit that either would work or get me killed.`
    ,
      `The [ENEMY_NAME] moved with a fluid grace that belied its size, [ENEMY_DESC]. Every attack I dodged was followed by another, faster and more precise. My health bar dipped steadily, but my Bloodlust rose in response, the stat boosting my damage as the fight wore on. This was a battle of attrition, and I intended to win it.`,
      `I activated [SKILL_NAME] and felt the power surge through me—blood essence converting to raw destructive force. The [ENEMY_NAME] took the hit full on, its health bar dropping by a visible chunk. But it didn't stagger. It didn't flinch. It just kept coming, [ENEMY_DESC], and I realized I was fighting something that didn't know how to quit.`,
      `The arena itself was a weapon. The [ENEMY_NAME] used the environment—walls, pillars, even the ceiling—to gain advantages, [ENEMY_DESC]. I had to adapt, using Shadow Step repositions, Blood Lance counters, and every trick I'd learned to stay one step ahead.`,
      `My interface flashed a warning—critical health. The [ENEMY_NAME] had me backed into a corner, [ENEMY_DESC]. But desperation was a powerful fuel. I pushed past my limits, drawing on reserves I didn't know I had, and turned the tide with a desperate gambit that either would work or get me killed.`,
      `The [ENEMY_NAME] learned as we fought. It recognized my patterns, anticipated my moves, [ENEMY_DESC]. I had to get creative—combining abilities in ways I'd never tried, using the environment, fighting dirty. The Vampire Progenitor class rewarded improvisation, and I was improvising for my life.`,
      `Blood essence flowed through me like liquid fire, every cell in my avatar's body humming with power. The [ENEMY_NAME] was wounded but far from finished, [ENEMY_DESC]. I could end this safely, or I could trust my instincts and go for the kill. The Progenitor's blood made the decision for me.`
      ];
    
    const middle1Template = randomFrom(combatMiddleTemplates);
    const middle1 = middle1Template
      .replace('[SKILL_NAME]', skill.name)
      .replace('[ENEMY_NAME]', enemy.name)
      .replace('[ENEMY_DESC]', enemy.desc);
    paras.push(middle1);
    
    const availableMiddles = combatMiddleTemplates.filter(t => t !== middle1Template);
    const middle2Template = randomFrom(availableMiddles);
    const middle2 = middle2Template
      .replace('[SKILL_NAME]', skill.name)
      .replace('[ENEMY_NAME]', enemy.name)
      .replace('[ENEMY_DESC]', enemy.desc);
    paras.push(middle2);


    const vrScenarios = [
      `The chamber was vast, its ceiling lost in darkness above. Pillars of obsidian stretched toward the unseen heights, each one carved with symbols that pulsed with faint light. My interface couldn't translate them—too ancient, too alien—but my Blood Essence responded to their presence, vibrating with a frequency that felt almost like recognition. This place remembered something the rest of the world had forgotten.`,
      `I found a garden where plants shouldn't grow—bioluminescent flowers that bloomed in colors that didn't exist in nature, their petals soft as silk and warm to the touch. The air smelled of ozone and something sweeter, something that made my head spin. My Predator's Instinct warned me of danger, but my curiosity was stronger. I stepped deeper into the impossible garden.`,
      `The bridge spanned a chasm that dropped into infinity, its surface made of something that wasn't quite stone and wasn't quite glass. Every step sent ripples across its surface, and looking down made my stomach lurch. But there was something on the other side—something my interface marked with a question mark, something the game wanted me to find. I started walking.`,
      `The library was endless, shelves stretching in every direction, books stacked in impossible configurations. Some were bound in materials I couldn't identify—leather that felt like skin, paper that shimmered like metal. The Archivist would have lost his mind here. I pulled a book at random, and the pages filled with text that shifted and changed, telling stories that hadn't been written yet.`,
      `The mirror showed me something impossible—not my reflection, but another version of myself, standing in a place I'd never been. This other me wore armor I didn't recognize, carried weapons I'd never seen, and had eyes that glowed with the same crimson light that marked my class. The reflection moved when I didn't, smiled when I didn't, and I realized with a chill that it wasn't showing me the past or the future. It was showing me what I could become.`,
      `The waterfall flowed upward, defying gravity, its water glowing with inner light. I stepped through it and found myself in a hidden grotto, the walls covered in murals that told the story of a world I didn't recognize—people who looked like me but weren't, cities that floated in the sky, a war that had shattered reality itself. The last mural showed a figure standing alone in darkness, and the resemblance was impossible to ignore.`,
      `The machine was ancient, its gears the size of buildings, its mechanisms powered by something that hummed with the same frequency as my Blood Essence. It had been dormant for centuries, maybe millennia, but as I approached, it began to move—slowly at first, then faster, until the entire chamber was a symphony of motion. My interface couldn't identify its purpose, but my instincts told me it was important. Important enough to kill for.`,
      `The creature was beautiful—iridescent scales, wings that caught the light like prisms, eyes that held intelligence older than the game itself. It didn't attack. It watched. And when I didn't attack either, it spoke—not in words, but in images and feelings that flooded my mind. It showed me things I couldn't understand, places I couldn't reach, and a choice I wasn't ready to make.`,
      `The door was simple—wood, iron hinges, no locks or traps. But my interface marked it with a skull icon, and my Predator's Instinct screamed that what lay beyond was dangerous. I could turn back. I could find another path. But the game had put this door here for a reason, and the Vampire Progenitor class didn't believe in turning back. I opened it.`,
      `The city was dead, but it hadn't always been. Buildings stood empty but intact, streets were clean but silent, and somewhere in the distance, a clock tower marked time that no one was living through. I walked through the ghost city, and my Blood Essence pulled me toward something—a presence, a power, a secret that had been waiting for someone like me to find it.`
    ];


    const dialogueOptions = [
      `I've seen things in this world that don't make sense. Things that shouldn't exist. But you—you make even less sense than the rest of it.`,
      `The game keeps secrets. I know that. Everyone who plays knows that. But the secrets you're keeping? They're different. They're dangerous.`,
      `I'm not asking for your help. I'm telling you that if you don't get out of my way, I'll make you regret it.`,
      `You think you know what I am? You think you understand this class? You don't know anything.`,
      `The extraction ability—it's not just about items. It's about possibilities. About what happens when the boundary between worlds starts to blur.`,
      `My sister is in a coma. The doctors say there's no hope. But they don't know about this world. They don't know what's possible here.`,
      `I've been tracking you for days. I know your patterns, your routes, your weaknesses. The question is whether you're smart enough to surrender.`,
      `The Vampire Progenitor class—it's not just power. It's a responsibility. A burden. And I'm the only one carrying it.`,
      `You want to know why I keep coming back? Why I keep risking everything? Because somewhere in this world, there's an answer. And I'm going to find it.`,
      `The game is changing. Can't you feel it? The world is responding to us, adapting, evolving. And I think it's responding to me most of all.`
    ];

    return paras;
  }

  function generateIntrospectionParagraphs() {
    const paras = [];
    const thought = randomFrom(mcThoughts);
    const pattern = randomFrom(thoughtPatterns).replace("{thought}", thought);

    const openings = [
      `The quiet was louder than any dungeon. I sat in the darkness of my apartment, the VR headset resting on the desk beside me like a sleeping animal, and let the silence fill the spaces between my thoughts. ${pattern}`,
      `Sleep wouldn't come. It rarely did anymore—my body ran on a different clock now, one synced to blood essence regeneration cycles and dungeon reset timers rather than sunrise and sunset. In the dark, with nothing to fight and nowhere to explore, the thoughts I'd been outrunning finally caught up. ${pattern}`,
      `I stared at my hands. Real hands. Flesh and bone and ordinary human skin. But they'd held weapons that shouldn't exist, cast abilities that violated physics, and extracted items from a digital world into physical reality. These hands were the most impossible things in the room. ${pattern}`,
      `The city hummed outside my window—traffic, distant music, someone arguing three floors down about something that didn't matter. Normal sounds. Human sounds. I listened to them like a tourist listening to a foreign language, understanding the words but missing the meaning. ${pattern}`
    ];
    paras.push(randomFrom(openings));

    const middles = [
      `Two worlds. I lived in two worlds, and neither one knew the full truth of the other. In the game, I was the Vampire Progenitor—a class that shouldn't exist, wielding power that grew without limit. In reality, I was a twenty-year-old with a comatose sister, dead parents, and a drawer full of impossible objects. The gap between those two identities was where I actually lived, in the uncomfortable space where questions had no answers and the rules hadn't been written yet.`,
      `I thought about the other players sometimes. Mira, grinding dungeons with a grin and a bag of chips. Dex, trading secrets like currency. Soren, climbing the rankings with mechanical precision. They played the game. I lived it. The distinction mattered more than any of them would ever understand, because for them, logging out meant returning to their real lives. For me, logging out meant returning to a reality that was increasingly shaped by what happened inside.`,
      `The extraction ability changed everything. Not just practically—though pulling a healing potion into the real world was practical in ways that made my head spin—but philosophically. If I could bring game items into reality, what did that say about the nature of reality? About the game? About the boundary between digital and physical that everyone assumed was absolute? I wasn't a philosopher. I was a guy with a VR headset and a unique class. But the questions wouldn't stop coming.`,
      `My sister's face floated behind my closed eyes. Peaceful. Still. The machines kept her alive in the most technical sense—heart beating, lungs expanding, neurons firing in patterns that might or might not constitute dreams. The doctors said there was nothing more they could do. But the doctors didn't know about extraction. They didn't know that somewhere in a digital world, there might be an item, a skill, an ability that could do what medicine couldn't. That possibility was the engine that drove everything I did.`
    ];
    paras.push(randomFrom(middles));
    paras.push(randomFrom(middles.filter(m => !paras.includes(m))));

    return paras;
  }

  function generateSisterMomentParagraphs() {
    const paras = [];

    const openings = [
      `Room 414. The number was burned into my memory like a brand. I pushed through the hospital door and the smell hit me first—antiseptic, recycled air, and the faint sweetness of the flowers I'd brought last week, now wilting in their vase. She lay exactly as I'd left her. She always lay exactly as I'd left her.`,
      `The hospital was quieter at night. Fewer visitors, fewer announcements over the PA system, fewer reminders that this was a place where people came to get better. Or didn't. I sat in the chair beside her bed—my chair, the nurses called it now—and took her hand. Warm. Always warm. As if her body was keeping a promise her mind couldn't.`,
      `I brought something new today. Not flowers or books or the playlist she used to love. I brought a vial of Moonlight Essence, extracted from the game three hours ago. It sat in my pocket like a secret, glowing faintly through the fabric. I didn't know if it would work. I didn't know if anything would work. But I was running out of options that didn't involve impossible things.`,
      `Her hair had grown longer. The nurses kept it brushed and neat, a small kindness in a room full of machines and measurements. I tucked a strand behind her ear and studied her face for the thousandth time, looking for any change—a twitch, a flutter, any sign that she was still in there, fighting her way back. The monitors beeped their steady rhythm. Nothing changed. Everything hurt.`
    ];
    paras.push(randomFrom(openings));

    const middles = [
      `"I'm getting stronger," I told her, because I always told her everything, even now. Especially now. "There's this class in the game—Vampire Progenitor. It sounds ridiculous, I know. You'd laugh. You'd make that face you make when I talk about games too seriously." I squeezed her hand. "But it's real, Yuna. The things I can do... the things I can bring back from that world into this one. I'm going to find something that helps you. I promise."`,
      `The doctors had stopped being optimistic six months ago. They'd shifted from "when she wakes up" to "if she wakes up" to the careful, clinical language of managed expectations. I'd stopped listening to them around the same time I'd started extracting items from the game. Their science had limits. My abilities didn't. Not anymore. Every level I gained, every skill I evolved, every new region I discovered—it was all for this. For her. For the moment I'd find the thing that brought her back.`,
      `I sat there until the night shift changed, watching her breathe. In the game, I fought monsters and explored impossible worlds and wielded power that defied explanation. Here, in this room, I was just a brother. Just a kid who missed his sister. The contrast should have been jarring, but it wasn't. Both versions of me wanted the same thing. Both versions of me would do whatever it took to get it.`,
      `Sometimes I imagined what she'd say if she could see what I'd become. She'd probably call me an idiot first—that was her default. Then she'd ask a thousand questions, each one sharper than the last, because Yuna never accepted surface-level answers. She'd want to know how extraction worked, what the limits were, whether I'd tested the healing items on anything else first. She'd be right to ask. She was always right. God, I missed her being right.`
    ];
    paras.push(randomFrom(middles));
    paras.push(randomFrom(middles.filter(m => !paras.includes(m))));

    return paras;
  }

  function generateExtractionParagraphs() {
    const paras = [];
    const item = randomFrom(itemPool);

    const openings = [
      `The extraction happened in the space between heartbeats. One moment, the ${item.name} existed only as data—polygons and textures and stat values rendered by a server farm somewhere in the real world. The next moment, it was in my hand. My real hand. Physical. Tangible. Impossible.`,
      `I held the ${item.name} up to the light of my apartment window and watched reality try to make sense of it. ${item.desc}. It shouldn't exist here. It couldn't exist here. And yet my fingers felt its weight, its texture, its temperature. The extraction ability didn't care about what should or shouldn't be. It simply was.`,
      `Extraction number ${mcState.extractionCount + 1}. I'd started keeping count because the scientist in me—the part that still believed in rules and laws and the orderly nature of the universe—needed data points. Each extraction taught me something new about the ability's limits. Or rather, its lack of limits.`,
      `The process was getting easier. The first extraction had felt like pushing a camel through the eye of a needle—every atom of the item resisting the transition from digital to physical. Now it was more like opening a door. A door that shouldn't exist, connecting two rooms that occupied the same space in different realities. The ${item.name} passed through without resistance.`
    ];
    paras.push(randomFrom(openings));

    const middles = [
      `I examined the ${item.name} with the methodical attention of someone cataloging miracles. ${item.desc}. In the game, it was a ${item.rank}-rank ${item.type}. In reality, it was something that would make physicists weep and military contractors salivate. I wrapped it carefully and added it to the collection in my locked drawer. The drawer was getting full. I'd need a bigger hiding place soon.`,
      `The reverse extraction was something I'd discovered by accident—sending a real-world object into the game. A pen, the first time. It had appeared in my inventory as "Unknown Item (Real World Origin)" with stats that made no sense in the game's framework. The implications were staggering. Bidirectional transfer. Anything I could hold, I could send. Anything the game generated, I could take. The boundary between worlds wasn't a wall. It was a membrane. And I was the only one who could pass through it.`,
      `What fascinated me most was that extraction didn't remove the item from my game inventory. It created a copy—a real-world duplicate of a digital object. The original remained in the game, unchanged, as if nothing had happened. This violated every law of conservation I'd ever learned. Energy couldn't be created or destroyed, except apparently it could, if you were a Vampire Progenitor with an ability that the developers never intended to exist.`,
      `I'd started categorizing the extractions. Consumables worked perfectly—potions, food items, crafting materials. Weapons maintained their properties but lost their stat bonuses, becoming incredibly well-crafted physical objects without the magical enhancements. Armor was similar. The interesting category was skills and abilities—I couldn't extract them as objects, but prolonged use in the game seemed to bleed into my real-world capabilities. My night vision. My reflexes. My strength. The class was rewriting me, one login at a time.`
    ];
    paras.push(randomFrom(middles));
    paras.push(randomFrom(middles.filter(m => !paras.includes(m))));

    return paras;
  }

  function generateVampirePowerParagraphs() {
    const paras = [];
    const skill = mcState.skills.length > 0 ? randomFrom(mcState.skills) : randomFrom(vampireSkills);

    const openings = [
      `The blood essence surged without warning. One moment I was standing still, the next my veins were rivers of crimson fire, every cell in my avatar's body vibrating at a frequency that made the air around me shimmer. The Vampire Progenitor class was evolving again, and it didn't ask permission.`,
      `I felt it in my teeth first—a sharpening, a hunger that went beyond the physical. The Progenitor bloodline was ancient, older than the game itself if the lore fragments were to be believed, and it carried memories in its code. Memories of power. Memories of what vampires were before they became myth.`,
      `${skill.name} pulsed in my skill tree like a heartbeat, its icon brighter than before. The evolution notification appeared in my interface: "Skill threshold reached. Evolution path available." I'd been waiting for this. The base version of the skill had carried me through dozens of fights, but what came next would change the rules entirely.`,
      `The Dark Affinity stat ticked upward again—I could feel it like a physical sensation, the darkness around me becoming less of an obstacle and more of an ally. Shadows bent toward me now, not away. The game's lighting engine treated me differently than other players, as if the code recognized what I was becoming.`
    ];
    paras.push(randomFrom(openings));

    const middles = [
      `The Vampire Progenitor class tree was unlike anything in the game's documentation. Where other classes had linear progression paths—choose specialization A or B at level 10, unlock ultimate at level 50—mine branched in every direction like a neural network. Each evolution opened three more possibilities. Each ability could merge with others to create something entirely new. There was no ceiling. No final form. Just endless, hungry growth.`,
      `I activated ${skill.name} and watched it transform in real-time. The blood essence cost doubled, then tripled, then stabilized at a level that would have drained a lesser vampire dry. But the output—god, the output. What had been a simple attack became a symphony of destruction, crimson energy weaving patterns in the air that were equal parts beautiful and terrifying. The damage numbers that floated up from the training dummy were absurd. I'd need to find stronger things to fight.`,
      `The real-world bleedthrough was getting more pronounced. Last night, I'd woken up and seen perfectly in the pitch-dark room—not the fuzzy, adjusted-to-darkness vision of normal human eyes, but clear, sharp, full-color night vision. My Regeneration stat had manifested as accelerated healing; a cut on my hand from cooking had closed in minutes instead of days. The Progenitor class wasn't just making my avatar stronger. It was rewriting my biology.`,
      `Bloodlust was the stat I watched most carefully. In the game, it was a combat resource—build it up through fighting, spend it on powerful abilities. In practice, it was something more primal. When it peaked, my decision-making shifted. I became more aggressive, more instinctive, less human. The power it unlocked was intoxicating, but the loss of control terrified me. The Progenitor bloodline was a gift. It was also a leash, and I wasn't always sure who was holding the other end.`
    ];
    paras.push(randomFrom(middles));
    paras.push(randomFrom(middles.filter(m => !paras.includes(m))));

    return paras;
  }

  function generateLoreDiscoveryParagraphs() {
    const paras = [];
    const lore = selectUnique(lorePool, worldState.loreFragments, 4);

    const openings = [
      `The inscription was hidden behind a false wall that only appeared during the game's night cycle. I almost missed it—would have missed it, if my Dark Affinity hadn't made the shadows transparent. The text was written in a language the game's auto-translate struggled with, older than the current localization, possibly from an earlier build that was never meant to see the light of day.`,
      `The Archivist found me before I found him. One moment the library was empty; the next, he was there, existing in that unsettling way NPCs sometimes did—present without having arrived. "You've been asking questions," he said, adjusting spectacles that reflected light from sources I couldn't see. "I have answers. Whether you want them is a different matter entirely."`,
      `The lore fragment materialized in my inventory after I solved the puzzle—not as a quest reward, but as something the game seemed to generate spontaneously, as if the world itself wanted me to know. I opened it with the careful reverence of someone handling a live grenade.`,
      `It was carved into the floor of a room that didn't appear on any map, in a dungeon that reset every twelve hours but somehow preserved this one chamber, untouched, unchanging. The words glowed faintly with residual code energy, and as I read them, my interface flickered in ways that felt less like a bug and more like a reaction.`
    ];
    paras.push(randomFrom(openings));

    paras.push(`The fragment read: "${lore}" I read it three times, each pass revealing new implications. This wasn't flavor text. This wasn't worldbuilding for atmosphere. This was a breadcrumb—deliberately placed, carefully hidden, meant for someone with the patience and the perception to find it. Someone like me. Or someone like whatever I was becoming.`);

    const middles = [
      `The pieces were starting to connect, slowly, like a puzzle assembling itself in the dark. The Vampire Progenitor class. The extraction ability. The hidden realms. The lore fragments that spoke of things the developers supposedly never intended. Either this was the most elaborate Easter egg in gaming history, or something was happening inside this game that went beyond entertainment. Beyond code. Beyond anything I had a framework to understand.`,
      `I saved the fragment to a personal file I'd been building—a digital corkboard of clues, connections, and questions. The file was getting large. The connections were getting denser. And the questions were getting harder to ignore. Why did the Progenitor class exist? Why could I extract items? Why did the game seem to respond to me differently than to other players? The answers were in here somewhere, buried in lore and code and the spaces between.`,
      `The Archivist watched me process the information with an expression that NPCs weren't supposed to have—something between pride and pity, as if he knew where this path led and wasn't sure whether to encourage me or warn me. "Knowledge is not power," he said quietly. "Knowledge is responsibility. Power is what happens when you accept that responsibility and act." Then he was gone, existing somewhere else, leaving me alone with revelations that tasted like copper and starlight.`
    ];
    paras.push(randomFrom(middles));

    return paras;
  }

  function generateFlashbackParagraphs() {
    const paras = [];

    const openings = [
      `The memory surfaced without invitation, sharp-edged and vivid, cutting through the present like a blade through smoke. I was eight years old. The apartment was smaller then, or maybe I was just smaller in it. Mom was in the kitchen—I could smell garlic and something sweet—and Dad was at the table, papers spread around him like fallen leaves.`,
      `It came in fragments, the way old memories do. A sound first—laughter, bright and careless, the kind that belonged to a time before hospitals and headsets and the weight of two worlds. Then an image: sunlight through a window, dust motes dancing, my sister chasing me through a hallway that seemed to stretch forever.`,
      `I didn't dream often anymore. The blood essence kept my sleep deep and dreamless, a side effect I'd initially welcomed. But tonight, something broke through. A memory, or a vision, or something in between—my parents' faces, younger than I remembered, speaking words I couldn't quite hear, their expressions carrying a weight I'd been too young to understand at the time.`,
      `The flashback hit during a loading screen, of all things. The game's transition between zones created a brief moment of sensory deprivation—no visuals, no audio, just darkness—and my brain filled the void with the past. Specifically, the last day I saw my parents alive. Or the last day I thought I saw them alive.`
    ];
    paras.push(randomFrom(openings));

    const middles = [
      `Dad had a way of looking at me that I only understood now, years later, with the benefit of hindsight and the curse of experience. It wasn't just love—every parent's eyes held love. It was assessment. Evaluation. As if he was measuring me against some standard I couldn't see, checking my progress toward a destination I didn't know I was heading toward. Had he known? About the game? About what I'd become? The questions multiplied every time I revisited these memories.`,
      `Mom's voice was the hardest thing to remember accurately. Time eroded the details—the exact pitch, the specific rhythm of her laugh, the way she pronounced certain words with an accent she'd never fully explained. I held onto what fragments I could, replaying them like corrupted audio files, terrified that one day the playback would fail entirely and I'd be left with nothing but the knowledge that she'd existed.`,
      `Yuna was five in this memory, gap-toothed and fearless, climbing furniture like it was a dungeon and narrating her adventures in a breathless stream of consciousness. "The floor is lava and the couch is a castle and I'm the queen and you have to be the dragon." I'd been the dragon. I'd always been the dragon. Now I was something closer to a vampire, and she was sleeping in a hospital bed, and the floor wasn't lava but the world was still dangerous in ways our childhood games never prepared us for.`,
      `The memory faded like it always did—slowly, reluctantly, as if the past didn't want to let go any more than I did. I opened my eyes to the present and felt the familiar ache of displacement, of existing in a now that was built on the rubble of a then. My parents were dead. That's what I'd been told. That's what I'd believed for years. But lately, the lore fragments and the flashbacks and the things that didn't add up were whispering a different story. And I was starting to listen.`
    ];
    paras.push(randomFrom(middles));
    paras.push(randomFrom(middles.filter(m => !paras.includes(m))));

    return paras;
  }

  function generateSocialParagraphs() {
    const paras = [];
    const charPool = [...characterTemplates.allies, ...characterTemplates.rivals];
    const char = randomFrom(charPool);

    const openings = [
      `"You're weird, you know that?" ${char.name} said it without malice, the way you'd comment on the weather or the respawn timer. We were sitting on the edge of a cliff in ${randomFrom(vrRegions).name}, legs dangling over a drop that would have killed us both if fall damage wasn't disabled in safe zones. ${char.personality}.`,
      `I found ${char.name} at the usual spot—the tavern in the central hub where players gathered between dungeons to trade, brag, and pretend they weren't addicted. ${char.name} was ${char.quirk}, which somehow made the conversation that followed feel more real than it had any right to.`,
      `The party invite appeared in my interface with ${char.name}'s tag attached. I hesitated—I always hesitated, because parties meant trust and trust meant vulnerability and vulnerability meant someone else could see how I played. How I really played. But ${char.name} had earned a provisional version of my trust, and the dungeon ahead was designed for groups.`,
      `${char.name} caught up to me outside the dungeon entrance, slightly out of breath despite the fact that avatars didn't technically breathe. "${char.name} the ${char.class}," they'd introduced themselves the first time we met. Now they just appeared, like a recurring character in a story I hadn't agreed to share.`
    ];
    paras.push(randomFrom(openings));

    const middles = [
      `We talked the way gamers talk—in a language built from shared references, inside jokes, and the comfortable shorthand of people who'd faced digital death together. But underneath the banter, something real was forming. Not friendship exactly—not yet—but the raw material of it. The recognition that this person, behind their avatar and their class and their carefully constructed online persona, was someone worth knowing.`,
      `"Why do you play?" ${char.name} asked, and the question landed heavier than they intended. Most players had simple answers: fun, competition, escape, boredom. My answer involved a comatose sister, an impossible ability, and a class that was rewriting my DNA. So I gave them the simple version: "I'm looking for something." They nodded like that made perfect sense, because in a game with infinite content, everyone was looking for something.`,
      `The dynamic between us was shifting. What started as convenience—two players whose paths kept crossing—was becoming something with its own gravity. ${char.name} noticed things about my playstyle that I hadn't noticed myself. They asked questions that were too perceptive, made observations that were too accurate. Either they were exceptionally observant, or I was exceptionally transparent. Neither option was comfortable.`,
      `Trust in an online game was a strange currency. You couldn't see the other person's face, couldn't read their body language, couldn't verify anything they told you about their real life. All you had was behavior—patterns of action over time that either built confidence or eroded it. ${char.name}'s pattern was consistent: show up, contribute, don't ask for more than they gave. It was a simple formula, and it was working.`,
      `${char.name} had a habit of going quiet at the worst possible moments—right when the conversation was getting real, right when the masks were slipping. I'd learned not to push. In this game, in this world, people revealed themselves on their own schedule or not at all. The silence between us wasn't empty. It was full of things neither of us was ready to say.`,
      `"You fight like someone who's afraid of losing," ${char.name} observed after watching me clear a room of mobs with mechanical precision. They weren't wrong. Every fight was a calculation, every risk weighed against what I couldn't afford to lose. The game didn't know about Yuna, about the hospital bills, about the extraction ability that blurred the line between virtual and real. But ${char.name} was starting to sense that my stakes were different from everyone else's.`,
      `We shared a campfire in a safe zone, the kind of moment that games manufactured but players made real. The flames were pixels, the warmth was simulated, but the conversation was genuine. ${char.name} told me about their life outside the headset—fragments, carefully chosen, like someone testing the weight of a bridge before crossing it. I offered fragments of my own. Not the heavy ones. Not yet.`,
      `"You're always alone," ${char.name} said. It wasn't an accusation—more like a diagnosis. "Even when you're in a party, you're alone. You keep everyone at exactly the same distance." I wanted to argue, but the truth has a weight that makes it hard to deflect. I'd been alone since the accident. The game hadn't changed that. But ${char.name}'s presence was making the distance feel less deliberate.`,
      `The loot distribution was automatic, but the gratitude wasn't. ${char.name} had saved my life three times in that dungeon—once with a heal, once with a taunt, once by simply being in the right place at the right time. I'd saved theirs twice. The math of mutual survival created a bond that no friend request could replicate. We were allies in the truest sense: people who'd chosen to keep each other alive.`,
      `${char.name} laughed at something I said—a real laugh, not the polite kind—and for a moment the game felt less like a game and more like a place where actual human connection was possible. I'd forgotten what that felt like. The realization was uncomfortable in the way that all important realizations are: it meant something had changed, and change meant vulnerability, and vulnerability meant risk.`,
      `"What's your build?" ${char.name} asked, and I gave them the surface answer—the stats, the skills, the equipment. But the real answer was more complicated. My build was desperation shaped into efficiency, fear converted into power, loneliness weaponized into self-reliance. The Vampire Progenitor class wasn't just a set of abilities. It was a mirror that showed me who I'd become.`,
      `We ran the dungeon in silence—the comfortable kind, where words weren't necessary because the coordination spoke for itself. ${char.name} moved left when I moved right, attacked when I defended, healed when I pushed forward. It was the kind of synergy that took most parties weeks to develop. We'd found it in hours. That should have been reassuring. Instead, it made me nervous. Things that came too easily usually had a cost.`,
      `${char.name} shared a rare item with me—not because they had to, not because I asked, but because they noticed I needed it. That kind of attention was dangerous in a game where most players were focused entirely on their own progression. It meant ${char.name} was watching me. Studying me. Learning the patterns I thought I'd hidden. The question was whether that attention came from friendship or something else entirely.`,
      `The guild hall was empty except for us, the other members logged off for the night. ${char.name} sat across from me in the virtual space, their avatar's expression carefully neutral. "I know you're hiding something," they said. Not aggressive. Not accusatory. Just stating a fact the way you'd state the weather. I didn't deny it. Some truths are too heavy to carry alone, but too dangerous to share.`,
      `"Everyone has a reason for being here," ${char.name} said, staring at the horizon where the game's skybox met the procedurally generated mountains. "Most reasons are boring. Yours isn't." I didn't ask how they knew. Some people had an instinct for the weight others carried—a sensitivity to the gravity of unspoken things. ${char.name} was one of those people, and it made them both valuable and terrifying.`,
      `The party disbanded after the raid, but ${char.name} lingered. They always lingered. It was their way of saying "I'm here if you need to talk" without actually saying it, because saying it would have been too direct, too vulnerable, too real for a game where everyone wore masks made of polygons and carefully chosen usernames.`,
      `${char.name} and I developed a shorthand—a series of pings, emotes, and abbreviated messages that communicated more than full sentences ever could. "Left" meant "I'll flank left, you draw aggro." "Wait" meant "Something's wrong, I need a moment." "Thanks" meant everything from "good heal" to "I'm glad you're here." Language evolved to fit the space it occupied, and our space was getting smaller.`
    ];
    paras.push(randomFrom(middles));
    paras.push(randomFrom(middles.filter(m => !paras.includes(m))));

    return paras;
  }

  function generateWorldEventParagraphs() {
    const paras = [];
    const events = [
      { name: "Crimson Eclipse", desc: "the sky turned blood-red and every vampire-class player received a temporary power boost while non-vampire players found their abilities weakened" },
      { name: "The Great Rift", desc: "a massive crack appeared in the sky above the central hub, revealing glimpses of a hidden realm that shouldn't have been visible" },
      { name: "Server Anomaly", desc: "for exactly sixty seconds, every player in the game heard the same whisper—a set of coordinates that led to a location that didn't exist on any map" },
      { name: "The Merchant's Gambit", desc: "every shop in the game simultaneously changed its inventory to items that had never been seen before, priced in a currency no one recognized" },
      { name: "Night Eternal", desc: "the day-night cycle froze at midnight, and creatures that only spawned in darkness began appearing everywhere, including safe zones" },
      { name: "The Update That Wasn't", desc: "players received patch notes for an update that the developers denied releasing, describing features and regions that didn't match any known development roadmap" }
    ];

    const event = randomFrom(events);

    const openings = [
      `The notification hit every player simultaneously: "WORLD EVENT: ${event.name}." The chat exploded. The forums would be on fire within seconds. And in the space between the announcement and the chaos, ${event.desc}. I stood in the middle of it all and felt something I rarely felt in the game—surprise.`,
      `It started with a sound—a deep, resonant tone that vibrated through the game world like a struck bell the size of a continent. Then the sky changed. Then the ground changed. Then everything changed, because ${event.desc}. World events in this game weren't scripted spectacles. They were earthquakes. And this one was a magnitude ten.`,
      `I was mid-dungeon when reality—game reality—hiccupped. The walls flickered. The enemies froze. My interface filled with error messages that resolved into a single notification: "WORLD EVENT IN PROGRESS." I abandoned the dungeon without hesitation, because world events were the game's way of saying "pay attention," and I'd learned to listen.`
    ];
    paras.push(randomFrom(openings));

    const middles = [
      `The event transformed the landscape in real-time. Players gathered in clusters, some fighting the new threats, others documenting everything with screenshots and recordings. The competitive players saw opportunity—new enemies meant new loot, new challenges meant new rankings. The lore hunters saw revelation—every world event contained fragments of the game's deeper narrative, breadcrumbs that connected to the hidden architecture beneath the surface. I saw both. And something else. Something that resonated with my Progenitor class in ways I couldn't articulate.`,
      `My interface was behaving strangely during the event—displaying information that other players' interfaces didn't show. Hidden stats. Background processes. Fragments of code that scrolled too fast to read but left impressions, like afterimages of a truth the game was trying to tell me. The Vampire Progenitor class had always given me access to things other classes couldn't see. During world events, that access expanded exponentially.`,
      `The event lasted forty-seven minutes. In that time, the game world changed more than it had in the previous month of regular updates. New regions appeared at the edges of the map. New factions emerged from the chaos, their allegiances unclear. The power balance between guilds shifted as some capitalized on the event and others were caught flat-footed. And somewhere in the aftermath, buried in the rubble of the old status quo, I found something that made every extraction I'd ever done look like a warm-up.`
    ];
    paras.push(randomFrom(middles));
    paras.push(randomFrom(middles.filter(m => !paras.includes(m))));

    return paras;
  }

  function generateGenericParagraphs(type, setting) {
    const paras = [];
    const sensory = buildSensoryDetail();
    const region = randomFrom(vrRegions);
    const realLoc = randomFrom(realWorldLocations);

    const opening = setting === "vr_world"
      ? `${region.name} held secrets in its architecture—${region.desc}. ${sensory} I moved through it with the careful attention of someone who'd learned that this game rewarded observation as much as combat.`
      : `${realLoc.desc} The real world demanded a different kind of attention than the game—subtler, slower, but no less important. ${sensory}`;
    paras.push(opening);

    const middles = [
      `Time moved differently when I was focused. Minutes became elastic, stretching or compressing based on the intensity of what I was doing. Right now, every second felt full—packed with sensory data, tactical decisions, and the constant background hum of the Progenitor class processing the world around me. I'd read somewhere that flow state was the closest humans got to perfection. If that was true, I'd been living in it for weeks.`,
      `The game continued to surprise me, which was itself surprising. Most games revealed their patterns within the first hundred hours—the loop became visible, the seams showed, the magic faded into mechanics. This game buried its patterns deeper than I could dig, layered its systems in ways that created emergent complexity, and populated its world with enough variation that repetition felt impossible. Or maybe it was the Progenitor class that made everything feel new. Hard to tell.`,
      `I checked my stats out of habit—a quick glance at the numbers that defined my existence in this world. Level ${mcState.level}. Health, stamina, mana, blood essence—all within acceptable ranges. The hidden stats were harder to track, but I could feel them: Karma pulling me toward decisions that felt right, Instinct sharpening my reactions, Willpower holding the Bloodlust in check. I was a collection of numbers that added up to something more than their sum. Wasn't everyone?`,
      `Progress in this game wasn't linear. It came in bursts and plateaus, breakthroughs and grinding sessions, moments of revelation separated by hours of incremental improvement. Today felt like a plateau day—necessary, unglamorous, the kind of session that built the foundation for future breakthroughs. I'd learned to appreciate these days. The spectacular moments got the screenshots, but the quiet ones got the work done.`,
      `The world around me pulsed with data I was only beginning to understand. Every texture, every shadow, every ambient sound was a layer of information that the Progenitor class parsed automatically, feeding me insights I hadn't asked for but couldn't ignore. A crack in a wall that suggested a hidden passage. A shift in the wind that warned of approaching enemies. The game was teaching me to see, and I was learning faster than I'd expected.`,
      `I paused at a crossroads—literally and figuratively. Three paths diverged ahead, each leading to a different biome, a different challenge, a different version of the story I was writing with every step. The game didn't tell you which path was right. It just presented options and let the consequences teach you. I'd chosen wrong before. The scars—virtual and otherwise—were proof of that. But wrong choices were still choices, and choices were still progress.`,
      `My inventory was a museum of decisions—every item a souvenir from a moment that had mattered. The sword from my first boss kill. The potion I'd extracted into the real world. The letter from an NPC whose quest I'd completed three hundred chapters ago. I kept them all, not because they were useful, but because they were proof. Proof that I'd been here. Proof that I'd survived.`,
      `The Bloodlust meter ticked upward, a constant reminder that the Progenitor class came with costs as well as benefits. Every ability had a price. Every evolution demanded something in return. The game's economy wasn't just gold and items—it was a deeper currency of sacrifice and transformation. I was becoming something more than human, and the process wasn't always comfortable.`,
      `Somewhere in the distance, another player's spell lit up the sky—a brief flash of arcane energy that illuminated the clouds before fading back to darkness. I wasn't alone in this world, even when it felt like it. Thousands of players were out there, each running their own story, fighting their own battles, carrying their own reasons for being here. We were all protagonists in our own narratives, NPCs in everyone else's.`,
      `The respawn point glowed softly behind me, a safety net I'd learned not to rely on. Death in this game wasn't permanent, but it wasn't free either. Every death cost experience, items, time—and something less quantifiable. Confidence, maybe. The belief that you were good enough to survive what came next. I'd died enough times to know the cost, and I'd survived enough times to know it was worth paying.`,
      `I found a quiet spot—a ledge overlooking a valley where the game's lighting engine painted everything in shades of amber and gold. It was beautiful in the way that only artificial things could be: perfectly composed, deliberately atmospheric, designed to make you feel something specific. But the feeling was real, even if the sunset wasn't. That was the paradox of this place. The world was fake. The experience wasn't.`,
      `The skill tree branched in directions I hadn't anticipated. Every choice closed some doors and opened others, creating a build that was uniquely mine—not because I'd followed a guide, but because I'd followed my instincts. The Progenitor class rewarded intuition over optimization, adaptation over planning. It was a class for people who learned by doing, and I'd been doing nothing but learning since the moment I logged in.`,
      `A notification appeared at the edge of my vision—a system message about a world event starting in the northern territories. I dismissed it. Not because it wasn't important, but because everything was important in this game, and I'd learned to prioritize. The world event would still be there tomorrow. The dungeon in front of me wouldn't. Some opportunities had expiration dates, and I'd gotten better at reading them.`,
      `The weight of the headset was something I'd stopped noticing weeks ago. It had become an extension of my body, a bridge between the person I was and the person I became when I crossed into Eclipsis Online. The transition was seamless now—no loading screens in my mind, no adjustment period, just a shift in reality that felt as natural as opening my eyes in the morning.`,
      `Every session taught me something new about the game, about the class, about myself. Today's lesson was patience—the understanding that not every problem needed to be solved immediately, that some challenges were designed to be revisited with better skills and deeper knowledge. The game rewarded persistence, but it also rewarded wisdom. Knowing when to push and when to wait was becoming my most valuable skill.`,
      `The economy of this world fascinated me. Gold flowed like water through player-driven markets, rare items changed hands in trades that resembled stock exchanges more than fantasy bazaars, and information—the right information, at the right time—was worth more than any legendary weapon. I'd started paying attention to the meta-game, the game above the game, where the real power players operated.`
    ];
    paras.push(randomFrom(middles));
    paras.push(randomFrom(middles.filter(m => !paras.includes(m))));

    return paras;
  }

  // ============================================
  // MAIN CHAPTER GENERATOR
  // ============================================
  // --- BACKSTORY CHAPTER TITLES ---
  const backstoryTitles = {
    backstory_life: ["The Shape of Ordinary", "5:45 AM", "A Life in Routine", "The Weight of Days", "Counting Hours", "What Passes for Living", "The Quiet Grind", "Ordinary Gravity", "Between Shifts", "The Apartment Walls", "Survival Mode", "The Rhythm of Nothing"],
    backstory_sister: ["Room 414", "The Sound of Machines", "Before She Slept", "What the Monitors Say", "Yuna", "The Girl Who Climbed Everything", "Fourteen", "The Longest Night", "Holding On", "Her Hand Was Warm", "The Vigil", "What Sleep Took"],
    backstory_parents: ["The Kitchen Smelled Like Garlic", "Dad's Hands", "Mom's Song", "The Last Thursday", "What They Told Me", "The Locked Drawer", "Wedding Photo", "Before They Were Gone", "The Funeral", "Ghosts in Photographs", "What I Inherited", "The Questions That Remain"],
    backstory_struggle: ["Eighteen and Alone", "The Math Never Works", "Learning to Fix Things", "Hiro's Tamagoyaki", "The Budget", "What Giving Up Looks Like", "Duct Tape and Stubbornness", "The Shallow End Doesn't Exist", "Carrying Weight", "The Ceasefire with Loneliness", "Every Dollar Assigned", "The Inertia of Continuing"],
    backstory_vr_hype: ["The Announcement", "Eclipsis Online", "Everyone's Losing Their Minds", "The Trailer", "Four Hundred Dollars", "Watching from the Outside", "Hiro's Enthusiasm", "The Countdown", "A Door I Can't Afford", "The World Wants to Escape", "Pre-Order Frenzy", "Something I Can't Explain"],
    backstory_headset: ["The Package", "No Return Address", "Three Days on the Desk", "The Decision at 2 AM", "Putting It On", "Close Your Eyes to Begin", "The Void of Soft Light", "Character Creation", "The Glitch", "Vampire Progenitor", "The Blood Remembers", "First Login"]
  };

  // --- BACKSTORY CLOSINGS ---
  const backstoryClosings = [
    "The day ended the way most days ended—not with resolution, but with exhaustion. I set the alarm for 5:45 and closed my eyes and let the darkness take the weight I'd been carrying since morning. Tomorrow would be the same. But I'd be there for it. That was enough.",
    "I turned off the light and lay in the dark and listened to the city breathe outside my window. Somewhere out there, seven billion people were living their lives, carrying their own invisible weights, surviving their own quiet catastrophes. I was one of them. Anonymous and ordinary and still here. Still here.",
    "Sleep came eventually, the way it always did—not as relief but as surrender. The last thought before unconsciousness was the same thought it always was: tomorrow, I'll visit Yuna. Tomorrow, I'll keep going. Tomorrow, tomorrow, tomorrow. The word was a prayer and a promise and a threat, all at once.",
    "The apartment settled into its nighttime sounds—the radiator's rhythm, the distant traffic, the creak of old wood adjusting to temperature changes. Familiar sounds. Safe sounds. The sounds of a life that was small and hard and mine. I held onto that. Mine. Whatever else it was, it was mine.",
    "I washed the dishes, checked the locks, set the alarm. The rituals of ending a day that was identical to the one before it and would be identical to the one after. But somewhere beneath the routine, something was shifting. I could feel it the way you feel weather changing—not in the sky, but in your bones. Something was coming. I just didn't know what yet.",
    "Her face was the last thing I saw before sleep. Not the hospital version—the real version. Laughing, arguing, climbing things she shouldn't climb. The version that existed in memory and nowhere else. I held onto that image like a candle in a dark room and let it carry me into whatever dreams would come.",
    "The ceiling fan spun slowly above me, counting down the hours until morning. I watched it until my eyes lost focus and the blades blurred into a single circle of motion. Time moved like that sometimes—not forward or backward, but in circles, repeating the same patterns until you forgot where you started.",
    "I lay in bed and listened to the silence. Not the absence of sound, but the presence of it—the weight of empty space, the texture of quiet, the way silence could feel like a room you were trapped inside or a door you could walk through. Tonight it felt like a door. I just didn't know where it led.",
    "The night passed the way nights always passed—one moment at a time, each one indistinguishable from the last until they accumulated into something that felt like hours. I drifted in and out of consciousness, caught between the day that had ended and the day that would begin, suspended in the space between.",
    "My last thought before sleep was the same thought I'd had every night for two years: she's still there. Still in that bed. Still waiting. Still not waking up. The thought was a stone in my chest, heavy and permanent. I carried it into sleep with me, the way I carried everything else.",
    "The darkness was not empty. It was full of things I couldn't see—memories, regrets, hopes that had worn thin with time. I let them wash over me like waves, not fighting them, not holding onto them, just letting them exist. That was the only way I knew how to survive anymore.",
    "Tomorrow would come whether I was ready for it or not. That was the one certainty in a life that had lost all others. The sun would rise, the alarm would sound, the routine would begin again. I would get up and do what needed to be done. That was what survival looked like. That was what being alive meant now."
  ];

  // AI Configuration
  const aiConfig = {
    enabled: typeof window !== 'undefined' && window.UnifiedAIGenerator !== undefined,
    percentage: 40,  // 40% AI, 60% template
    webllmModel: 'Llama-2-7b-chat-hf-q4f16_1-MLC',
    transformersModel: 'Xenova/phi-2',
    enableParallelGeneration: true,
    enableEnsemble: true
  };

  // AI Status Tracking
  if (!storyTracker.aiGenerated) {
    storyTracker.aiGenerated = 0;
    storyTracker.templateGenerated = 0;
    storyTracker.aiErrors = 0;
  }

  // Initialize AI if available
  async function initializeAI() {
    if (aiConfig.enabled && window.UnifiedAIGenerator && !window.UnifiedAIGenerator.isEnabled()) {
      try {
        await window.UnifiedAIGenerator.initialize({
          webllmModel: aiConfig.webllmModel,
          transformersModel: aiConfig.transformersModel,
          maxTokens: 200,
          temperature: 0.8,
          aiPercentage: aiConfig.percentage,
          enableParallelGeneration: aiConfig.enableParallelGeneration,
          enableEnsemble: aiConfig.enableEnsemble
        });
        } catch (error) {
        console.error('Failed to initialize Unified AI Generator:', error);
        aiConfig.enabled = false;
      }
    }
  }

  // Generate paragraph with AI
  async function generateParagraphWithAI(context, options = {}) {
    if (!aiConfig.enabled || !window.UnifiedAIGenerator) {
      return null;  // AI not available, use template
    }

    try {
      const prompt = `Generate a single paragraph for a ${context.type} scene in a ${context.setting} setting. 
        ${context.theme ? `Theme: ${context.theme}.` : ''}
        ${context.region ? `Region: ${context.region.name}.` : ''}
        ${context.directive ? `Include this directive: ${context.directive}` : ''}
        The paragraph should be 2-4 sentences long and fit the tone of a dark fantasy VR game story.`;

      const result = await window.UnifiedAIGenerator.generateParagraph(prompt, options);
      
      if (result) {
        storyTracker.aiGenerated++;
        return result;
      }
      
      return null;  // AI failed, use template
    } catch (error) {
      console.error('AI generation error:', error);
      storyTracker.aiErrors++;
      return null;  // AI failed, use template
    }
  }

  // Generate chapter with AI (async version)
  async function generateChapterWithAI(directive = null) {
    // Initialize AI if needed
    await initializeAI();

    // Generate base chapter
    const chapter = generateChapter(directive);

    // If AI is enabled, replace some paragraphs with AI-generated ones
    if (aiConfig.enabled && window.AIIntegration && window.AIIntegration.isInitialized) {
      const numParagraphsToReplace = Math.floor(chapter.paragraphs.length * (aiConfig.percentage / 100));
      const indicesToReplace = [];
      
      // Select random paragraphs to replace
      while (indicesToReplace.length < numParagraphsToReplace) {
        const idx = Math.floor(Math.random() * chapter.paragraphs.length);
        if (!indicesToReplace.includes(idx)) {
          indicesToReplace.push(idx);
        }
      }

      // Replace selected paragraphs with AI-generated ones
      for (const idx of indicesToReplace) {
        const context = {
          type: chapter.arc,
          setting: chapter.arc.includes('backstory') ? 'real_world' : 'vr_world',
          theme: chapter.arc,
          region: chapter.arc.includes('backstory') ? null : { name: 'unknown', desc: 'unknown' },
          directive: directive ? directive.text : null
        };

        const aiParagraph = await generateParagraphWithAI(context);
        if (aiParagraph) {
          chapter.paragraphs[idx] = aiParagraph;
        }
      }
    }

    return chapter;
  }

  function generateChapter(directive = null) {
    // Check admin reading progress (if admin tracker is available)
    if (typeof window !== 'undefined' && window.AdminReadingTracker) {
      const progress = window.AdminReadingTracker.getReadingProgress();
      const nextChapterNum = storyTracker.chaptersGenerated + 1;
      
      if (!window.AdminReadingTracker.canGenerateChapter(nextChapterNum)) {
        throw new Error(
          `Cannot generate chapter ${nextChapterNum}. ` +
          `Admin has only read up to chapter ${progress.lastChapterRead}. ` +
          `Maximum allowed chapter: ${progress.maxAllowedChapter}. ` +
          `Please read more chapters to generate further content.`
        );
      }
    }

    storyTracker.chaptersGenerated++;
    storyTracker.arcChapterCount++;

    // Check arc progression
    const currentArcDef = storyArcs[storyTracker.currentArc % storyArcs.length];
    if (storyTracker.arcChapterCount >= currentArcDef.chapters) {
      storyTracker.currentArc++;
      storyTracker.arcChapterCount = 0;
      const newArc = storyArcs[storyTracker.currentArc % storyArcs.length];
      storyTracker.currentArcName = newArc.name;
    }

    const chapterNum = storyTracker.chaptersGenerated;
    const currentArc = storyArcs[storyTracker.currentArc % storyArcs.length];
    const isPreVR = currentArc.preVR === true;

    // ============================================
    // BACKSTORY CHAPTERS (Pre-VR)
    // ============================================
    if (isPreVR) {
      let paragraphs = [];
      let type = currentArc.theme;
      const setting = "real_world";

      // Generate backstory paragraphs based on arc theme
      switch (currentArc.theme) {
        case "backstory_life":
          paragraphs = BackstoryEngine.generateBackstoryLifeParagraphs(randomFrom, randomInt);
          break;
        case "backstory_sister":
          paragraphs = BackstoryEngine.generateBackstorySisterParagraphs(randomFrom, randomInt);
          break;
        case "backstory_parents":
          paragraphs = BackstoryEngine.generateBackstoryParentsParagraphs(randomFrom, randomInt);
          break;
        case "backstory_struggle":
          paragraphs = BackstoryEngine.generateBackstoryStruggleParagraphs(randomFrom, randomInt);
          break;
        case "backstory_vr_hype":
          paragraphs = BackstoryEngine.generateBackstoryVRHypeParagraphs(randomFrom, randomInt);
          break;
        case "backstory_headset":
          paragraphs = BackstoryEngine.generateBackstoryHeadsetParagraphs(randomFrom, randomInt);
          break;
        default:
          paragraphs = BackstoryEngine.generateBackstoryLifeParagraphs(randomFrom, randomInt);
          break;
      }
      
      // Filter out paragraphs already used in previous chapters
      let filteredParagraphs = paragraphs.filter(p => !storyTracker.usedBackstoryParagraphs.includes(p));
      
      // If all paragraphs are used, allow reuse with a cooldown
      if (filteredParagraphs.length === 0) {
        // Reset tracking for this type to allow reuse
        const recentUsed = storyTracker.usedBackstoryParagraphs.slice(-5000); // Keep only recent 5000
        filteredParagraphs = paragraphs.filter(p => !recentUsed.includes(p));
        
        // If still no paragraphs, just use all paragraphs
        if (filteredParagraphs.length === 0) {
          filteredParagraphs = paragraphs;
        }
      }
      
      paragraphs = filteredParagraphs;
      
      // Track these paragraphs to avoid reuse in future chapters
      paragraphs.forEach(p => {
        if (!storyTracker.usedBackstoryParagraphs.includes(p)) {
          storyTracker.usedBackstoryParagraphs.push(p);
        }
      });

      // Handle directives even in backstory
      let directiveText = null;
      if (directive) {
        directiveText = directive.text;
      } else if (storyTracker.pendingDirectives.length > 0) {
        const pd = storyTracker.pendingDirectives[0];
        pd.chaptersRemaining--;
        directiveText = pd.text;
        if (pd.chaptersRemaining <= 0) {
          storyTracker.pendingDirectives.shift();
          storyTracker.incorporatedDirectives.push({ ...pd, status: "incorporated" });
        }
      }

      if (directiveText) {
        const directivePara = `Something changed in the texture of the day—${directiveText.toLowerCase()}. It was subtle, barely noticeable, but it left a mark on everything that followed.`;
        paragraphs.splice(Math.min(1, paragraphs.length), 0, directivePara);
        // Track directive paragraph to prevent reuse
        if (!storyTracker.usedBackstoryParagraphs.includes(directivePara)) {
          storyTracker.usedBackstoryParagraphs.push(directivePara);
        }
      }

      // Add backstory closing
      // Add closing paragraph
      const availableClosings = backstoryClosings.filter(p => !storyTracker.usedBackstoryParagraphs.includes(p));
      let closingPara;
      
      if (availableClosings.length > 0) {
        closingPara = availableClosings[Math.floor(random() * availableClosings.length)];
        storyTracker.usedBackstoryParagraphs.push(closingPara);
      } else {
        // If all closings are used, reuse with cooldown
        const recentUsed = storyTracker.usedBackstoryParagraphs.slice(-5000);
        const reusableClosings = backstoryClosings.filter(p => !recentUsed.includes(p));
        closingPara = reusableClosings.length > 0 
          ? reusableClosings[Math.floor(random() * reusableClosings.length)]
          : backstoryClosings[Math.floor(random() * backstoryClosings.length)];
      }
      
      paragraphs.push(closingPara);

      // Pad to ~1000 words
      // Build a pool of ALL available backstory paragraphs for padding
      // Call each generator once to get all available paragraphs
      const allBackstoryParas = [
        ...BackstoryEngine.generateBackstoryLifeParagraphs(randomFrom, randomInt),
        ...BackstoryEngine.generateBackstorySisterParagraphs(randomFrom, randomInt),
        ...BackstoryEngine.generateBackstoryParentsParagraphs(randomFrom, randomInt),
        ...BackstoryEngine.generateBackstoryStruggleParagraphs(randomFrom, randomInt),
        ...BackstoryEngine.generateBackstoryVRHypeParagraphs(randomFrom, randomInt),
        ...BackstoryEngine.generateBackstoryHeadsetParagraphs(randomFrom, randomInt)
      ];
      
      // Remove duplicates from the pool (in case generators return overlapping paragraphs)
      const uniquePool = [...new Set(allBackstoryParas)];
      
      // Get recently used padding paragraphs for cooldown
      const recentPadding = storyTracker.usedPaddingParagraphs.slice(-5000);
      
      while (paragraphs.join(" ").split(/\s+/).length < 1000) {
        // Filter out paragraphs already in the chapter and recently used
        const availableParas = uniquePool.filter(p => 
          !paragraphs.includes(p) && !recentPadding.includes(p)
        );
        
        if (availableParas.length > 0) {
          const selectedPara = availableParas[randomInt(0, availableParas.length - 1)];
          paragraphs.splice(paragraphs.length - 1, 0, selectedPara);
          // Track padding paragraphs to prevent excessive reuse
          storyTracker.usedPaddingParagraphs.push(selectedPara);
        } else {
          // If all paragraphs are already used, break to avoid infinite loop
          break;
        }
      }

      // No stat changes during backstory (no game yet)
      const statChanges = [];
      mcState.currentLocation = "Real World";

      // Get backstory title
      const titlePool = backstoryTitles[currentArc.theme] || backstoryTitles["backstory_life"];
      const available = titlePool.filter(item => !storyTracker.usedTitles.includes(item));
      let title;
      
      // Use dynamic title generation 50% of the time for more variety
      if (random() < 0.5) {
        const dynamicTitle = generateDynamicTitle(currentArc.theme, "real_world");
        // Only use dynamic title if it's not already used
        if (!storyTracker.usedTitles.includes(dynamicTitle)) {
          title = dynamicTitle;
          storyTracker.usedTitles.push(title);
        }
      }
      
      if (!title && available.length > 0) {
        title = available[Math.floor(random() * available.length)];
        storyTracker.usedTitles.push(title);
      } else if (!title) {
        // If all titles are used, generate a dynamic title
        title = generateDynamicTitle(currentArc.theme, "real_world");
        storyTracker.usedTitles.push(title);
      }
      const wordCount = paragraphs.join(" ").split(/\s+/).length;
      storyTracker.totalWords += wordCount;

      return {
        id: chapterNum,
        number: chapterNum,
        title: title,
        type: type,
        setting: setting,
        location: "Real World",
        arc: storyTracker.currentArcName,
        paragraphs: paragraphs,
        wordCount: wordCount,
        statChanges: statChanges,
        mcSnapshot: { ...mcState, skills: mcState.skills.map(s => ({ ...s })) },
        trackerSnapshot: { chaptersGenerated: storyTracker.chaptersGenerated, totalWords: storyTracker.totalWords },
        timestamp: new Date().toISOString()
      };
    }

    // ============================================
    // VR GAME CHAPTERS (Post-Backstory)
    // ============================================
    const setting = getChapterSetting();
    let type = getChapterType();

    // Force certain types based on setting
    if (setting === "real_world" && ["dungeon", "boss_fight", "crafting", "pvp", "quest"].includes(type)) {
      type = randomFrom(["introspection", "real_world", "sister_moment", "extraction", "flashback", "relationship", "rest_recovery"]);
    }

    // Handle directives
    let directiveText = null;
    if (directive) {
      directiveText = directive.text;
    } else if (storyTracker.pendingDirectives.length > 0) {
      const pd = storyTracker.pendingDirectives[0];
      pd.chaptersRemaining--;
      directiveText = pd.text;
      if (pd.chaptersRemaining <= 0) {
        storyTracker.pendingDirectives.shift();
        storyTracker.incorporatedDirectives.push({ ...pd, status: "incorporated" });
      }
    }

    // Generate paragraphs based on type
    let paragraphs = [];
    const region = vrRegions[Math.min(Math.floor((chapterNum - 58) / 15), vrRegions.length - 1)];

    switch (type) {
      case "exploration":
      case "travel":
        paragraphs = generateExplorationParagraphs(setting, region);
        break;
      case "combat":
      case "pvp":
        paragraphs = generateCombatParagraphs(setting);
        break;
      case "boss_fight":
        paragraphs = generateCombatParagraphs(setting);
        break;
      case "introspection":
      case "rest_recovery":
      case "nightmare_vision":
        paragraphs = generateIntrospectionParagraphs();
        break;
      case "sister_moment":
        paragraphs = generateSisterMomentParagraphs();
        break;
      case "extraction":
        paragraphs = generateExtractionParagraphs();
        break;
      case "vampire_power":
      case "skill_evolution":
        paragraphs = generateVampirePowerParagraphs();
        break;
      case "lore_discovery":
      case "investigation":
        paragraphs = generateLoreDiscoveryParagraphs();
        break;
      case "flashback":
        paragraphs = generateFlashbackParagraphs();
        break;
      case "dialogue":
      case "social":
      case "relationship":
      case "romance_scene":
      case "mentor_lesson":
      case "rival_encounter":
      case "clan_guild":
        paragraphs = generateSocialParagraphs();
        break;
      case "world_event":
        paragraphs = generateWorldEventParagraphs();
        break;
      default:
        paragraphs = generateGenericParagraphs(type, setting);
        break;
    }

    // Filter out paragraphs already used in previous VR chapters
    if (setting === 'vr_world') {
      paragraphs = paragraphs.filter(p => !storyTracker.usedVRParagraphs.includes(p));
    }

    // Track initial VR paragraphs to prevent cross-chapter duplication
    if (setting === 'vr_world') {
      paragraphs.forEach(p => {
        if (!storyTracker.usedVRParagraphs.includes(p)) {
          storyTracker.usedVRParagraphs.push(p);
        }
      });
    }

    // Weave in directive if present
    if (directiveText) {
      const directivePara = `Something shifted in the fabric of the world—${directiveText.toLowerCase()}. The change was subtle at first, like a new color appearing at the edge of vision, but its implications rippled outward through everything that followed.`;
      paragraphs.splice(Math.min(1, paragraphs.length), 0, directivePara);
      // Track directive paragraph to prevent reuse
      if (setting === 'vr_world' && !storyTracker.usedVRParagraphs.includes(directivePara)) {
        storyTracker.usedVRParagraphs.push(directivePara);
      }
    }

    // Add closing paragraph with forward momentum
    const closings = [
      `The chapter of this day wasn't finished—it never was, not really—but the page was turning, and whatever came next would find me ready. Or at least, more ready than I'd been before.`,
      `I saved my progress—both in the game and in the mental ledger I kept of things learned, things gained, things still to do. The list never got shorter. But I was getting faster at working through it.`,
      `Tomorrow would bring new challenges. New questions. New opportunities to push the boundaries of what was possible. But tonight, in this moment, I allowed myself a breath. Just one. Then I kept moving.`,
      `The session ended, but the story didn't. It never did. Even logged out, even in the real world, the narrative continued—in my changing body, in my sister's hospital room, in the impossible objects hidden in my apartment. This was my life now. Both of them.`,
      `Something was coming. I could feel it the way you feel a storm before the clouds arrive—a pressure change, a shift in the wind, an instinct that predated language. Whatever it was, it would find me stronger than the last time. That was the only promise I could make. And I intended to keep it.`,
      `The path forward was unclear, but the direction was certain. Deeper. Stronger. Closer to the truth. Closer to saving her. Every step mattered, even the ones that felt like standing still.`,
      `I logged out with the satisfaction of progress made, but the hunger for more remained. The Vampire Progenitor class wasn't just about power—it was about potential. And I had only scratched the surface of what was possible.`,
      `The real world waited for me beyond the headset, but it felt less real with every session. The game was where I belonged now, where I could be who I was meant to be. The question was whether I could ever truly leave it behind.`,
      `My stats had improved, my skills had evolved, but the most important gains were the ones that didn't show up on any character sheet. Experience. Wisdom. The kind of knowledge that only came from surviving things that should have killed me.`,
      `The system notification faded as I prepared to disconnect, but the feeling remained—the sense that I was part of something larger than myself, a story that had been waiting for someone like me to tell it.`,
      `I checked my inventory one last time, reviewed my build, planned my next moves. The game rewarded preparation, and I intended to be as prepared as possible for whatever came next.`,
      `The boundary between worlds blurred more each day. What happened in Eclipsis Online didn't stay in Eclipsis Online—it bled into my reality, changed me, shaped me. I wasn't just playing a game anymore. I was living two lives, and both of them were becoming one.`
    ];
    const closingPara = selectUnique(closings, storyTracker.usedPlotPoints, 9999);
    paragraphs.push(closingPara);
    // Track closing paragraph to prevent reuse
    if (setting === 'vr_world' && !storyTracker.usedVRParagraphs.includes(closingPara)) {
      storyTracker.usedVRParagraphs.push(closingPara);
    }

    // Pad to ~1000 words with improved logic
    let paddingAttempts = 0;
    const maxPaddingAttempts = 100; // Increased from 50 to 100
    
    // Get recently used padding paragraphs for cooldown
    const recentPadding = storyTracker.usedPaddingParagraphs.slice(-5000);
    
    while (paragraphs.join(" ").split(/\s+/).length < 1000 && paddingAttempts < maxPaddingAttempts) {
      paddingAttempts++;
      let extraParas;
      switch (type) {
        case "exploration": case "travel":
          extraParas = generateExplorationParagraphs(setting, region); break;
        case "combat": case "pvp": case "boss_fight":
          extraParas = generateCombatParagraphs(setting); break;
        case "introspection": case "rest_recovery": case "nightmare_vision":
          extraParas = generateIntrospectionParagraphs(); break;
        case "sister_moment":
          extraParas = generateSisterMomentParagraphs(); break;
        case "extraction":
          extraParas = generateExtractionParagraphs(); break;
        case "vampire_power": case "skill_evolution":
          extraParas = generateVampirePowerParagraphs(); break;
        case "lore_discovery": case "investigation":
          extraParas = generateLoreDiscoveryParagraphs(); break;
        case "flashback":
          extraParas = generateFlashbackParagraphs(); break;
        case "dialogue": case "social": case "relationship": case "romance_scene":
        case "mentor_lesson": case "rival_encounter": case "clan_guild":
          extraParas = generateSocialParagraphs(); break;
        case "world_event":
          extraParas = generateWorldEventParagraphs(); break;
        default:
          extraParas = generateGenericParagraphs(type, setting); break;
      }
      
      // Filter out paragraphs already in the chapter and recently used
      const uniqueParas = extraParas.filter(p => 
        !paragraphs.includes(p) && !recentPadding.includes(p)
      );
      
      if (uniqueParas.length > 0) {
        const selectedPara = uniqueParas[randomInt(0, uniqueParas.length - 1)];
        paragraphs.splice(paragraphs.length - 1, 0, selectedPara);
        // Track padding paragraphs to prevent excessive reuse
        storyTracker.usedPaddingParagraphs.push(selectedPara);
      } else {
        // If all paragraphs are already used, try a different generator type
        // This provides more variety when the primary generator is exhausted
        const fallbackGenerators = [
          () => generateIntrospectionParagraphs(),
          () => generateExplorationParagraphs(setting, region),
          () => generateSocialParagraphs(),
          () => generateLoreDiscoveryParagraphs()
        ];
        
        for (const fallbackGen of fallbackGenerators) {
          const fallbackParas = fallbackGen();
          const uniqueFallback = fallbackParas.filter(p => !paragraphs.includes(p) && !storyTracker.usedVRParagraphs.includes(p));
          
          if (uniqueFallback.length > 0) {
            const selectedFallback = uniqueFallback[randomInt(0, uniqueFallback.length - 1)];
            paragraphs.splice(paragraphs.length - 1, 0, selectedFallback);
            storyTracker.usedVRParagraphs.push(selectedFallback);
            break;
          }
        }
        
        // If still no unique paragraphs found after trying fallbacks, 
        // allow reuse of paragraphs not in this specific chapter
        const allGenerators = [
          () => generateIntrospectionParagraphs(),
          () => generateExplorationParagraphs(setting, region),
          () => generateSocialParagraphs(),
          () => generateLoreDiscoveryParagraphs(),
          () => generateGenericParagraphs(type, setting),
          () => generateFlashbackParagraphs(),
          () => generateVampirePowerParagraphs()
        ];
        let foundAny = false;
        for (const gen of allGenerators) {
          const genParas = gen();
          const notInChapter = genParas.filter(p => !paragraphs.includes(p));
          if (notInChapter.length > 0) {
            paragraphs.splice(paragraphs.length - 1, 0, notInChapter[randomInt(0, notInChapter.length - 1)]);
            foundAny = true;
            break;
          }
        }
        if (!foundAny) break;
      }
    }

    // Generate stat changes
    const statChanges = generateStatChanges(type);

    // Update MC location
    mcState.currentLocation = setting === "vr_world" ? region.name : "Real World";

    // Initialize skills if empty
    if (mcState.skills.length === 0 && chapterNum >= 60) {
      mcState.skills = vampireSkills.slice(0, 3).map(s => ({ ...s }));
    }
    if (mcState.skills.length < vampireSkills.length && mcState.skills.length > 0 && chapterNum % 5 === 0) {
      const nextSkill = vampireSkills[mcState.skills.length];
      if (nextSkill) mcState.skills.push({ ...nextSkill });
    }

    const title = generateTitle(chapterNum, type, setting);
    const wordCount = paragraphs.join(" ").split(/\s+/).length;
    storyTracker.totalWords += wordCount;

    const chapter = {
      id: chapterNum,
      number: chapterNum,
      title: title,
      type: type,
      setting: setting,
      location: mcState.currentLocation,
      arc: storyTracker.currentArcName,
      paragraphs: paragraphs,
      wordCount: wordCount,
      statChanges: statChanges,
      mcSnapshot: { ...mcState, skills: mcState.skills.map(s => ({ ...s })) },
      trackerSnapshot: { chaptersGenerated: storyTracker.chaptersGenerated, totalWords: storyTracker.totalWords },
      timestamp: new Date().toISOString()
    };

    // Validate chapter for duplicates (if strict duplicate prevention is available)
    if (typeof window !== 'undefined' && window.StrictDuplicatePrevention) {
      const validation = window.StrictDuplicatePrevention.validateChapter(chapter);
      if (!validation.valid) {
        console.warn(`Chapter ${chapterNum} rejected: ${validation.reason}`);
        console.warn('Duplicates:', validation.duplicates);
        throw new Error(
          `Chapter ${chapterNum} contains duplicate content. ` +
          `Strict duplicate prevention is enabled. ` +
          `Please try again to generate unique content.`
        );
      }
    }

    return chapter;
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    generateChapter,
    generateChapterWithAI,
    getMcState: () => ({ ...mcState }),
    getWorldState: () => ({ ...worldState }),
    getStoryTracker: () => ({ ...storyTracker }),
    getCharacters: () => ({ ...characters }),
    addDirective: (text, chapters) => {
      const directive = {
        id: Date.now(),
        text: text,
        chaptersTotal: chapters,
        chaptersRemaining: chapters,
        status: "pending",
        addedAt: new Date().toISOString()
      };
      storyTracker.pendingDirectives.push(directive);
      return directive;
    },
    getPendingDirectives: () => [...storyTracker.pendingDirectives],
    getIncorporatedDirectives: () => [...storyTracker.incorporatedDirectives],
    getAllDirectives: () => [
      ...storyTracker.pendingDirectives.map(d => ({ ...d, status: "pending" })),
      ...storyTracker.incorporatedDirectives.map(d => ({ ...d, status: "incorporated" }))
    ],
    reset: () => {
      // Reset MC state
      mcState = {
        level: 1,
        hp: 100,
        sp: 100,
        mp: 50,
        bloodEssence: 100,
        strength: 10,
        agility: 10,
        intelligence: 10,
        vitality: 10,
        endurance: 10,
        luck: 5,
        bloodlust: 0,
        darkAffinity: 0,
        regeneration: 0,
        domination: 0,
        attackPower: 15,
        defense: 10,
        criticalRate: 5,
        evasion: 5,
        attackSpeed: 10,
        karma: 0,
        instinct: 0,
        willpower: 0,
        presence: 0,
        skills: [],
        abilities: [],
        inventory: [],
        gold: 0,
        extractionCount: 0
      };
      
      // Reset story tracker - ALL fields must be reset
      storyTracker = {
        chaptersGenerated: 0,
        totalWords: 0,
        usedOpenings: [],
        usedThemes: [],
        usedLocations: [],
        usedCombatStyles: [],
        usedPlotPoints: [],
        usedBackstoryParagraphs: [],
        usedVRParagraphs: [],
        usedPaddingParagraphs: [],
        usedTitles: [],
        currentArc: 0,
        currentArcName: "Before the Headset",
        arcChapterCount: 0,
        recentEvents: [],
        pendingDirectives: [],
        // AI Tracking
        aiGenerated: 0,
        templateGenerated: 0,
        aiErrors: 0,
        incorporatedDirectives: [],
        sisterMentioned: false,
        parentsRevealed: false,
        lastChapterType: "",
        lastSetting: "",
        consecutiveVR: 0,
        consecutiveReal: 0,
        chaptersInArc: 0,
        relationships: {},
        worldState: {},
        questProgress: {}
      };
      
      // Reset RNG
      _rngState = STORY_SEED;
      
      // Clear localStorage directives (if available)
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('ese_directives');
      }
    },
    getSkillEvolutions: () => ({ ...skillEvolutions }),
    getVampireSkills: () => [...vampireSkills],
    getItemPool: () => [...itemPool],
    initializePoolIntegration,
    getAdjectivesPool,
    getNounsPool,
    getActionsPool,
    // AI Configuration
    setAIConfig: (config) => {
      Object.assign(aiConfig, config);
    },
    getAIConfig: () => ({ ...aiConfig }),
    getAIStats: () => ({
      generated: storyTracker.aiGenerated || 0,
      template: storyTracker.templateGenerated || 0,
      errors: storyTracker.aiErrors || 0
    }),
    initializeAI
  };
})();

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StoryEngine;
} else {
  window.StoryEngine = StoryEngine;
}