# Dynamic Content Generation Design Document

## Executive Summary
This document outlines the design for implementing dynamic content generation in the Story-Unending project, including procedural generation systems, dynamic character development, world events, and quest generation.

---

## Design Philosophy

### Core Principles
1. **Procedural Variety**: Generate unique content on-demand to reduce repetition
2. **Consistent Quality**: Maintain narrative quality and coherence in generated content
3. **Seeded RNG**: Use the existing seeded RNG system for reproducible results
4. **Context Awareness**: Generate content that fits the current story context
5. **Player Impact**: Dynamic content should respond to player choices and stats

### Generation Types
1. **Procedural Generation**: Algorithmic content creation from templates and rules
2. **Dynamic Character Development**: Characters that evolve based on interactions
3. **Dynamic World Events**: Events that change based on player actions and world state
4. **Dynamic Quest Generation**: Quests that adapt to player progress and choices

---

## Procedural Generation System

### Template-Based Generation

```javascript
const proceduralGenerator = {
  // Paragraph templates with placeholders
  paragraphTemplates: {
    combat: [
      "The [ENEMY] [ACTION] with [INTENSITY]. [REACTION]",
      "[ENVIRONMENT] shifted as the [ENEMY] [ACTION]. [REACTION]",
      // ... more templates
    ],
    exploration: [
      "The [LOCATION] revealed [DISCOVERY]. [ATMOSPHERE]",
      "[ENVIRONMENT] surrounded me as I [ACTION]. [REACTION]",
      // ... more templates
    ],
    dialogue: [
      "[CHARACTER] [EMOTION] as they [ACTION]. [RESPONSE]",
      "The [CHARACTER]'s [FEATURE] [REACTION]. [DIALOGUE]",
      // ... more templates
    ]
  },
  
  // Placeholder values
  placeholders: {
    ENEMY: ["Shadow Wraith", "Bone Sentinel", "Crimson Stalker", ...],
    ACTION: ["lunged", "struck", "attacked", "charged", ...],
    INTENSITY: ["ferocity", "precision", "unexpected speed", ...],
    REACTION: ["I barely dodged", "my instincts screamed", "I countered", ...],
    LOCATION: ["ancient chamber", "hidden passage", "forgotten shrine", ...],
    DISCOVERY: ["ancient runes", "hidden treasure", "mysterious artifact", ...],
    ATMOSPHERE: ["The air grew cold", "Shadows lengthened", "Power hummed", ...],
    CHARACTER: ["Mira", "Dex", "Yuki", "Soren", "Nyx", ...],
    EMOTION: ["smiled warmly", "frowned deeply", "laughed bitterly", ...],
    FEATURE: ["eyes narrowed", "voice softened", "posture relaxed", ...],
    DIALOGUE: ["'You shouldn't be here'", "'I've been expecting you'", ...]
  },
  
  // Generation function
  generateParagraph(type, context) {
    const templates = this.paragraphTemplates[type];
    const template = randomFrom(templates);
    
    // Replace placeholders with context-appropriate values
    let paragraph = template;
    for (const [placeholder, values] of Object.entries(this.placeholders)) {
      if (paragraph.includes(`[${placeholder}]`)) {
        const value = randomFrom(values);
        paragraph = paragraph.replace(`[${placeholder}]`, value);
      }
    }
    
    return paragraph;
  }
};
```

### Context-Aware Generation

```javascript
const contextAwareGenerator = {
  // Generate content based on current context
  generateContextualContent(context) {
    const { chapter, setting, type, playerStats, recentEvents } = context;
    
    // Adjust generation based on player stats
    if (playerStats.bloodlust > 50) {
      // Generate more aggressive content
      return this.generateAggressiveContent(context);
    } else if (playerStats.karma > 50) {
      // Generate more heroic content
      return this.generateHeroicContent(context);
    }
    
    // Default generation
    return this.generateStandardContent(context);
  },
  
  // Generate aggressive content for high bloodlust
  generateAggressiveContent(context) {
    // Use aggressive templates and descriptions
    const templates = [
      "Bloodlust surged as I [ACTION]. The [ENEMY] [REACTION].",
      "My instincts screamed for violence. [COMBAT_DESCRIPTION].",
      // ... more aggressive templates
    ];
    return this.generateFromTemplates(templates, context);
  },
  
  // Generate heroic content for high karma
  generateHeroicContent(context) {
    // Use heroic templates and descriptions
    const templates = [
      "I stood my ground, protecting [ALLY]. [HEROIC_ACTION].",
      "Justice demanded action. [MORAL_CHOICE].",
      // ... more heroic templates
    ];
    return this.generateFromTemplates(templates, context);
  }
};
```

---

## Dynamic Character Development

### Character State System

```javascript
const characterDevelopment = {
  // Track character states and relationships
  characterStates: {
    Mira: {
      trust: 50,
      friendship: 30,
      romance: 0,
      loyalty: 40,
      flags: [],
      memories: [],
      personality: "energetic and reckless"
    },
    Dex: {
      trust: 30,
      friendship: 20,
      romance: 0,
      loyalty: 20,
      flags: [],
      memories: [],
      personality: "quiet and calculating"
    },
    // ... more characters
  },
  
  // Update character state based on interaction
  updateCharacterState(character, interaction) {
    const state = this.characterStates[character];
    
    // Apply interaction effects
    if (interaction.type === "help") {
      state.trust += 10;
      state.friendship += 5;
      state.loyalty += 5;
    } else if (interaction.type === "betray") {
      state.trust -= 20;
      state.friendship -= 15;
      state.loyalty -= 10;
    }
    
    // Add memory
    state.memories.push({
      chapter: interaction.chapter,
      type: interaction.type,
      description: interaction.description,
      timestamp: new Date().toISOString()
    });
    
    // Add flags
    if (interaction.flags) {
      state.flags.push(...interaction.flags);
    }
    
    // Clamp values
    state.trust = Math.max(0, Math.min(100, state.trust));
    state.friendship = Math.max(0, Math.min(100, state.friendship));
    state.loyalty = Math.max(0, Math.min(100, state.loyalty));
  },
  
  // Generate character dialogue based on state
  generateCharacterDialogue(character, context) {
    const state = this.characterStates[character];
    
    // Select dialogue based on relationship level
    if (state.friendship > 70) {
      return this.generateFriendlyDialogue(character, context);
    } else if (state.trust < 30) {
      return this.generateSuspiciousDialogue(character, context);
    } else {
      return this.generateNeutralDialogue(character, context);
    }
  },
  
  // Generate friendly dialogue
  generateFriendlyDialogue(character, context) {
    const dialogues = [
      `"Hey! Good to see you. ${this.generatePersonalizedGreeting(character)}"`,
      `"I was just thinking about you. ${this.generateSharedMemory(character)}"`,
      `"You know you can count on me, right? ${this.generateSupportiveStatement(character)}"`,
      // ... more friendly dialogues
    ];
    return randomFrom(dialogues);
  },
  
  // Generate suspicious dialogue
  generateSuspiciousDialogue(character, context) {
    const dialogues = [
      `"What do you want? ${this.generateDefensiveStatement(character)}"`,
      `"I don't trust you. ${this.generateAccusation(character)}"`,
      `"Stay away from me. ${this.generateWarning(character)}"`,
      // ... more suspicious dialogues
    ];
    return randomFrom(dialogues);
  }
};
```

### Character Evolution System

```javascript
const characterEvolution = {
  // Evolve characters based on story progression
  evolveCharacter(character, chapter, events) {
    const state = characterDevelopment.characterStates[character];
    
    // Check for evolution triggers
    if (this.shouldEvolve(character, chapter, events)) {
      const evolution = this.getEvolution(character, state);
      
      // Apply evolution
      state.personality = evolution.personality;
      state.flags.push(...evolution.flags);
      
      // Generate evolution event
      return {
        character: character,
        type: "evolution",
        description: evolution.description,
        changes: evolution.changes
      };
    }
    
    return null;
  },
  
  // Check if character should evolve
  shouldEvolve(character, chapter, events) {
    const state = characterDevelopment.characterStates[character];
    
    // Evolution triggers
    if (state.friendship > 80 && !state.flags.includes("best_friend")) {
      return true;
    }
    
    if (state.trust < 20 && !state.flags.includes("enemy")) {
      return true;
    }
    
    if (state.romance > 70 && !state.flags.includes("romantic_partner")) {
      return true;
    }
    
    return false;
  },
  
  // Get evolution details
  getEvolution(character, state) {
    if (state.friendship > 80) {
      return {
        personality: "loyal and devoted",
        flags: ["best_friend"],
        description: `${character} has become your closest ally`,
        changes: { loyalty: 100, trust: 100 }
      };
    }
    
    if (state.trust < 20) {
      return {
        personality: "hostile and suspicious",
        flags: ["enemy"],
        description: `${character} has become your enemy`,
        changes: { loyalty: 0, trust: 0 }
      };
    }
    
    if (state.romance > 70) {
      return {
        personality: "loving and committed",
        flags: ["romantic_partner"],
        description: `${character} has fallen in love with you`,
        changes: { romance: 100, trust: 100 }
      };
    }
    
    return null;
  }
};
```

---

## Dynamic World Events

### World State System

```javascript
const worldState = {
  // Track world state variables
  variables: {
    dayNightCycle: "day",
    weather: "clear",
    season: "spring",
    moonPhase: "full",
    worldTension: 0,
    supernaturalActivity: 0,
    playerInfluence: 0,
    globalEvents: [],
    regionalEvents: {}
  },
  
  // Update world state based on player actions
  updateWorldState(action) {
    // Update tension based on player actions
    if (action.type === "combat") {
      this.variables.worldTension += 5;
    } else if (action.type === "diplomacy") {
      this.variables.worldTension -= 3;
    }
    
    // Update supernatural activity
    if (action.type === "extraction") {
      this.variables.supernaturalActivity += 10;
    }
    
    // Update player influence
    if (action.type === "major_choice") {
      this.variables.playerInfluence += 15;
    }
    
    // Clamp values
    this.variables.worldTension = Math.max(0, Math.min(100, this.variables.worldTension));
    this.variables.supernaturalActivity = Math.max(0, Math.min(100, this.variables.supernaturalActivity));
    this.variables.playerInfluence = Math.max(0, Math.min(100, this.variables.playerInfluence));
  },
  
  // Generate world event based on current state
  generateWorldEvent(context) {
    const { chapter, region, playerStats } = context;
    
    // Check for event triggers
    if (this.variables.supernaturalActivity > 70) {
      return this.generateSupernaturalEvent(context);
    }
    
    if (this.variables.worldTension > 60) {
      return this.generateConflictEvent(context);
    }
    
    if (this.variables.playerInfluence > 50) {
      return this.generateInfluenceEvent(context);
    }
    
    // Random events
    return this.generateRandomEvent(context);
  },
  
  // Generate supernatural event
  generateSupernaturalEvent(context) {
    const events = [
      {
        type: "supernatural",
        name: "Eclipse of Shadows",
        description: "Darkness spreads across the land as supernatural forces surge",
        effects: {
          darkAffinity: +10,
          bloodlust: +5,
          karma: -5
        },
        duration: 5
      },
      {
        type: "supernatural",
        name: "Blood Moon Rising",
        description: "The moon turns crimson, amplifying vampire powers",
        effects: {
          bloodlust: +15,
          darkAffinity: +10,
          regeneration: +5
        },
        duration: 3
      },
      // ... more supernatural events
    ];
    return randomFrom(events);
  },
  
  // Generate conflict event
  generateConflictEvent(context) {
    const events = [
      {
        type: "conflict",
        name: "Guild War Erupts",
        description: "Tensions between guilds boil over into open conflict",
        effects: {
          worldTension: +20,
          opportunities: ["guild_quests", "faction_choices"]
        },
        duration: 10
      },
      {
        type: "conflict",
        name: "Monster Invasion",
        description: "Monsters surge from the depths, attacking settlements",
        effects: {
          worldTension: +15,
          combat_opportunities: ["defend_settlements", "hunt_monsters"]
        },
        duration: 7
      },
      // ... more conflict events
    ];
    return randomFrom(events);
  }
};
```

### Regional Event System

```javascript
const regionalEvents = {
  // Track events in each region
  regionEvents: {
    "Ashenveil Ruins": [],
    "Thornwood Expanse": [],
    "Crimson Hollows": [],
    // ... more regions
  },
  
  // Generate regional event
  generateRegionalEvent(region, context) {
    const events = this.getRegionalEvents(region);
    const event = randomFrom(events);
    
    // Add to region events
    this.regionEvents[region].push({
      ...event,
      timestamp: new Date().toISOString(),
      chapter: context.chapter
    });
    
    return event;
  },
  
  // Get available events for region
  getRegionalEvents(region) {
    const eventPools = {
      "Ashenveil Ruins": [
        {
          type: "discovery",
          name: "Ancient Chamber Unsealed",
          description: "A sealed chamber opens, revealing ancient secrets",
          rewards: ["lore", "items", "experience"]
        },
        {
          type: "danger",
          name: "Shadow Beast Awakens",
          description: "A powerful shadow beast stirs in the depths",
          challenge: "boss_fight"
        },
        // ... more Ashenveil events
      ],
      "Thornwood Expanse": [
        {
          type: "exploration",
          name: "Hidden Path Discovered",
          description: "A hidden path through the forest reveals itself",
          rewards: ["exploration_bonus", "secret_area"]
        },
        {
          type: "encounter",
          name: "Forest Guardian Appears",
          description: "The ancient guardian of the forest approaches",
          challenge: "dialogue_or_combat"
        },
        // ... more Thornwood events
      ],
      // ... more regions
    };
    
    return eventPools[region] || [];
  }
};
```

---

## Dynamic Quest Generation

### Quest Template System

```javascript
const questGenerator = {
  // Quest templates
  questTemplates: {
    fetch: {
      name: "Fetch Quest",
      description: "Retrieve [ITEM] from [LOCATION]",
      objectives: [
        { type: "travel", target: "[LOCATION]" },
        { type: "collect", target: "[ITEM]", quantity: "[QUANTITY]" },
        { type: "return", target: "[QUEST_GIVER]" }
      ],
      rewards: {
        experience: "[EXP_AMOUNT]",
        gold: "[GOLD_AMOUNT]",
        reputation: "[REP_AMOUNT]"
      }
    },
    combat: {
      name: "Combat Quest",
      description: "Defeat [ENEMY] in [LOCATION]",
      objectives: [
        { type: "travel", target: "[LOCATION]" },
        { type: "defeat", target: "[ENEMY]", quantity: "[QUANTITY]" },
        { type: "return", target: "[QUEST_GIVER]" }
      ],
      rewards: {
        experience: "[EXP_AMOUNT]",
        gold: "[GOLD_AMOUNT]",
        items: "[ITEM_REWARD]"
      }
    },
    exploration: {
      name: "Exploration Quest",
      description: "Explore [LOCATION] and discover [DISCOVERY]",
      objectives: [
        { type: "travel", target: "[LOCATION]" },
        { type: "discover", target: "[DISCOVERY]" },
        { type: "report", target: "[QUEST_GIVER]" }
      ],
      rewards: {
        experience: "[EXP_AMOUNT]",
        lore: "[LORE_AMOUNT]",
        reputation: "[REP_AMOUNT]"
      }
    },
    // ... more quest types
  },
  
  // Generate quest based on context
  generateQuest(context) {
    const { chapter, playerLevel, playerStats, region, completedQuests } = context;
    
    // Select quest type based on player preferences
    const questType = this.selectQuestType(playerStats, completedQuests);
    const template = this.questTemplates[questType];
    
    // Fill in template with context-appropriate values
    const quest = this.fillTemplate(template, context);
    
    // Adjust difficulty based on player level
    quest.difficulty = this.calculateDifficulty(playerLevel, chapter);
    
    // Generate unique quest ID
    quest.id = `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return quest;
  },
  
  // Select quest type based on player stats
  selectQuestType(playerStats, completedQuests) {
    // Prefer quest types that align with player stats
    if (playerStats.bloodlust > 50) {
      return "combat";
    }
    
    if (playerStats.instinct > 50) {
      return "exploration";
    }
    
    if (playerStats.presence > 50) {
      return "diplomacy";
    }
    
    // Random selection
    const types = Object.keys(this.questTemplates);
    return randomFrom(types);
  },
  
  // Fill template with context-appropriate values
  fillTemplate(template, context) {
    const quest = JSON.parse(JSON.stringify(template)); // Deep copy
    
    // Replace placeholders
    quest.description = this.replacePlaceholders(quest.description, context);
    quest.objectives = quest.objectives.map(obj => ({
      ...obj,
      target: this.replacePlaceholders(obj.target, context),
      quantity: this.replacePlaceholders(obj.quantity || 1, context)
    }));
    
    quest.rewards = this.replacePlaceholders(quest.rewards, context);
    
    return quest;
  },
  
  // Replace placeholders with values
  replacePlaceholders(text, context) {
    const replacements = {
      "[ITEM]": this.getRandomItem(context),
      "[LOCATION]": this.getRandomLocation(context),
      "[ENEMY]": this.getRandomEnemy(context),
      "[QUEST_GIVER]": this.getRandomQuestGiver(context),
      "[QUANTITY]": this.getRandomQuantity(context),
      "[EXP_AMOUNT]": this.calculateExpReward(context),
      "[GOLD_AMOUNT]": this.calculateGoldReward(context),
      "[REP_AMOUNT]": this.calculateRepReward(context),
      "[DISCOVERY]": this.getRandomDiscovery(context),
      "[ITEM_REWARD]": this.getRandomItemReward(context),
      "[LORE_AMOUNT]": this.calculateLoreReward(context)
    };
    
    let result = text;
    for (const [placeholder, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return result;
  },
  
  // Get random item
  getRandomItem(context) {
    const items = [
      "Healing Potion", "Mana Crystal", "Blood Essence", 
      "Ancient Scroll", "Mysterious Artifact", "Enchanted Gem"
    ];
    return randomFrom(items);
  },
  
  // Get random location
  getRandomLocation(context) {
    const locations = [
      "Ashenveil Ruins", "Thornwood Expanse", "Crimson Hollows",
      "Stormbreak Plateau", "Drowned Market", "The Pale Wastes"
    ];
    return randomFrom(locations);
  },
  
  // Get random enemy
  getRandomEnemy(context) {
    const enemies = [
      "Shadow Wraith", "Bone Sentinel", "Crimson Stalker",
      "Thornbeast", "Void Crawler", "Iron Construct"
    ];
    return randomFrom(enemies);
  },
  
  // Get random quest giver
  getRandomQuestGiver(context) {
    const givers = [
      "Old Man Chen", "Vladris", "The Archivist",
      "Mira", "Dex", "Yuki"
    ];
    return randomFrom(givers);
  },
  
  // Get random quantity
  getRandomQuantity(context) {
    return Math.floor(Math.random() * 5) + 1;
  },
  
  // Calculate experience reward
  calculateExpReward(context) {
    const base = 100;
    const multiplier = context.playerLevel * 10;
    return base + multiplier + Math.floor(Math.random() * 50);
  },
  
  // Calculate gold reward
  calculateGoldReward(context) {
    const base = 50;
    const multiplier = context.playerLevel * 5;
    return base + multiplier + Math.floor(Math.random() * 25);
  },
  
  // Calculate reputation reward
  calculateRepReward(context) {
    return Math.floor(Math.random() * 10) + 5;
  },
  
  // Get random discovery
  getRandomDiscovery(context) {
    const discoveries = [
      "Ancient Ruins", "Hidden Chamber", "Secret Passage",
      "Mysterious Shrine", "Forgotten Temple", "Lost City"
    ];
    return randomFrom(discoveries);
  },
  
  // Get random item reward
  getRandomItemReward(context) {
    const items = [
      "Rare Weapon", "Enchanted Armor", "Powerful Artifact",
      "Unique Accessory", "Legendary Item"
    ];
    return randomFrom(items);
  },
  
  // Calculate lore reward
  calculateLoreReward(context) {
    return Math.floor(Math.random() * 3) + 1;
  },
  
  // Calculate quest difficulty
  calculateDifficulty(playerLevel, chapter) {
    const base = playerLevel;
    const chapterModifier = Math.floor(chapter / 10);
    const randomModifier = Math.floor(Math.random() * 3);
    
    return base + chapterModifier + randomModifier;
  }
};
```

---

## Integration with Story Engine

### Dynamic Content Integration

```javascript
// In story-engine.js
const DynamicContent = window.DynamicContent;

// Modify chapter generation to include dynamic content
function generateChapter(chapterNum, type, setting) {
  // ... existing code ...
  
  // Generate dynamic content based on context
  const context = {
    chapter: chapterNum,
    setting: setting,
    type: type,
    playerStats: mcState,
    recentEvents: storyTracker.recentEvents,
    region: worldState.currentRegion
  };
  
  // Add procedural paragraphs
  if (shouldAddProceduralContent(type)) {
    const proceduralPara = DynamicContent.generateProceduralParagraph(type, context);
    paragraphs.push(proceduralPara);
  }
  
  // Add character dialogue
  if (shouldAddCharacterDialogue(type)) {
    const dialogue = DynamicContent.generateCharacterDialogue(character, context);
    paragraphs.push(dialogue);
  }
  
  // Add world event
  if (shouldAddWorldEvent(chapterNum)) {
    const event = DynamicContent.generateWorldEvent(context);
    paragraphs.push(formatWorldEvent(event));
  }
  
  // Generate quest
  if (shouldGenerateQuest(chapterNum)) {
    const quest = DynamicContent.generateQuest(context);
    storyTracker.pendingQuests.push(quest);
  }
  
  // ... rest of chapter generation ...
}
```

---

## Testing Strategy

### Unit Tests
- Test procedural generation functions
- Test character state updates
- Test world state updates
- Test quest generation
- Test placeholder replacement

### Integration Tests
- Test dynamic content with chapter generation
- Test seeded RNG consistency
- Test context-aware generation
- Test character evolution
- Test world event triggers

### Quality Tests
- Test narrative coherence
- Test content variety
- Test player impact
- Test replayability

---

## Documentation Requirements

1. **API Documentation**: Document all dynamic content generation functions
2. **Template Documentation**: Document all templates and placeholders
3. **Event Documentation**: Document all world and regional events
4. **Quest Documentation**: Document all quest types and templates

---


## Conclusion

This dynamic content generation design provides a comprehensive framework for implementing procedural generation, dynamic character development, world events, and quest generation in the Story-Unending project. The system balances variety with quality, responds to player choices, and integrates seamlessly with the existing story engine.

**Next Steps**: Implement the dynamic content generation module and begin testing with the story engine.