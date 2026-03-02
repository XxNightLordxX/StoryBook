# Branching Narrative Design Document

## Executive Summary
This document outlines the design for implementing branching narrative paths in the Story-Unending project, including choice tracking systems, major and minor branching points, and the technical implementation approach.

---

## Design Philosophy

### Core Principles
1. **Meaningful Choices**: Every branch should have meaningful consequences that affect the story
2. **Player Agency**: Players should feel their decisions matter and shape the narrative
3. **Replayability**: Different choices should lead to different experiences
4. **Consistency**: Branches must maintain narrative consistency with the established story
5. **Seeded RNG**: Branching must work with the existing seeded RNG system

### Branching Types
1. **Major Branches**: Significant story-altering decisions that change the narrative direction
2. **Minor Branches**: Smaller choices that affect character development, relationships, or immediate outcomes
3. **Conditional Branches**: Branches that unlock based on previous choices, stats, or achievements
4. **Temporary Branches**: Short-term deviations that converge back to the main story

---

## Choice Tracking System

### Data Structure

```javascript
const choiceTracker = {
  // Track all choices made by the player
  choices: [],
  
  // Track choice outcomes and consequences
  outcomes: {},
  
  // Track relationship changes
  relationships: {
    allies: {},
    rivals: {},
    romance: {},
    mentors: {}
  },
  
  // Track stat modifications from choices
  statChanges: {
    karma: 0,
    instinct: 0,
    willpower: 0,
    presence: 0,
    bloodlust: 0,
    darkAffinity: 0
  },
  
  // Track unlocked branches
  unlockedBranches: [],
  
  // Track locked branches
  lockedBranches: [],
  
  // Track branch convergence points
  convergencePoints: []
};
```

### Choice Object Structure

```javascript
const choice = {
  id: "unique_choice_id",
  chapter: 15,
  type: "major|minor|conditional",
  category: "combat|dialogue|exploration|relationship|moral",
  options: [
    {
      id: "option_1",
      text: "Choice description",
      consequences: {
        statChanges: { karma: 5, bloodlust: -2 },
        relationshipChanges: { Mira: 10, Soren: -5 },
        unlocks: ["branch_id_1"],
        locks: ["branch_id_2"],
        flags: ["flag_1", "flag_2"]
      }
    }
  ],
  selectedOption: "option_1",
  timestamp: "2024-01-01T00:00:00Z"
};
```

---

## Major Branching Points (10+)

### Branch 1: First Extraction Choice
**Chapter**: 25 (First Extraction)
**Type**: Major
**Context**: Kael successfully extracts his first item from the VR world

**Options**:
1. **Keep it secret** - Hide the extracted item, tell no one
   - Consequences: +10 Karma, +5 Instinct, unlocks "Secret Keeper" path
   - Future: More cautious approach to extraction, trust issues with allies

2. **Share with Mira** - Show the extracted item to trusted ally
   - Consequences: +15 Relationship (Mira), +5 Presence, unlocks "Alliance" path
   - Future: Mira becomes confidant, potential betrayal risk

3. **Sell it** - Attempt to sell the extracted item
   - Consequences: +100 Gold, -10 Karma, +5 Bloodlust, unlocks "Mercenary" path
   - Future: Financial independence, dangerous connections, moral ambiguity

### Branch 2: Sister's Treatment Decision
**Chapter**: 35 (Hospital Crisis)
**Type**: Major
**Context**: Yuna's condition worsens, doctors offer experimental treatment

**Options**:
1. **Accept experimental treatment** - Risky but potentially curative
   - Consequences: +10 Willpower, +5 Karma, unlocks "Risk Taker" path
   - Future: Yuna's recovery uncertain, medical complications possible

2. **Seek VR cure** - Believe VR world holds the answer
   - Consequences: +15 Instinct, +10 Dark Affinity, unlocks "VR Believer" path
   - Future: Intense VR focus, extraction attempts, supernatural elements

3. **Refuse treatment** - Let nature take its course
   - Consequences: +10 Karma, +5 Willpower, unlocks "Acceptance" path
   - Future: Emotional journey, focus on quality of life, spiritual themes

### Branch 3: Vampire Evolution Path
**Chapter**: 50 (Evolution Threshold)
**Type**: Major
**Context**: Kael reaches evolution threshold, must choose vampire path

**Options**:
1. **Blood Sovereign** - Focus on blood manipulation and domination
   - Consequences: +20 Bloodlust, +10 Domination, -10 Karma, unlocks "Blood Sovereign" path
   - Future: Powerful blood abilities, moral descent, isolation from allies

2. **Shadow Lord** - Focus on stealth, shadows, and assassination
   - Consequences: +15 Agility, +10 Dark Affinity, +5 Instinct, unlocks "Shadow Lord" path
   - Future: Master of shadows, strategic combat, information broker

3. **Eternal Guardian** - Focus on protection, regeneration, and defense
   - Consequences: +20 Vitality, +15 Regeneration, +10 Karma, unlocks "Eternal Guardian" path
   - Future: Unbreakable defender, protector of allies, moral compass

### Branch 4: Guild Alliance
**Chapter**: 65 (Guild Wars)
**Type**: Major
**Context**: Major guilds recruit Kael, must choose alliance

**Options**:
1. **Join Crimson Court** - Vampire-focused guild
   - Consequences: +15 Dark Affinity, +10 Bloodlust, +5 Domination, unlocks "Crimson Court" path
   - Future: Vampire politics, blood hierarchy, supernatural intrigue

2. **Join Shadow Syndicate** - Mercenary guild
   - Consequences: +100 Gold, +10 Agility, +5 Instinct, -5 Karma, unlocks "Shadow Syndicate" path
   - Future: Dangerous missions, moral ambiguity, financial power

3. **Remain Independent** - No guild affiliation
   - Consequences: +10 Willpower, +10 Presence, +5 Karma, unlocks "Lone Wolf" path
   - Future: Freedom but isolation, harder challenges, self-reliance

### Branch 5: Romance Path
**Chapter**: 75 (Bonds Tested)
**Type**: Major
**Context**: Multiple romantic interests express feelings

**Options**:
1. **Pursue Sera** - Mysterious player with game secrets
   - Consequences: +20 Relationship (Sera), +10 Instinct, +5 Presence, unlocks "Sera Romance" path
   - Future: Mystery, danger, supernatural connection, game secrets

2. **Pursue Lin** - Real world hospital worker
   - Consequences: +20 Relationship (Lin), +10 Karma, +5 Willpower, unlocks "Lin Romance" path
   - Future: Real world connection, emotional support, grounding in reality

3. **Choose neither** - Focus on goals, not romance
   - Consequences: +10 Willpower, +10 Instinct, unlocks "Solitary" path
   - Future: Unencumbered by relationships, focused on objectives

### Branch 6: Confrontation with Rival
**Chapter**: 85 (Rival Encounter)
**Type**: Major
**Context**: Major rival challenges Kael to decisive battle

**Options**:
1. **Fight to the death** - No mercy, total victory
   - Consequences: +10 Bloodlust, +5 Domination, -5 Karma, unlocks "Ruthless" path
   - Future: Reputation as ruthless, fear from enemies, moral questions

2. **Spare the rival** - Show mercy, offer alliance
   - Consequences: +15 Karma, +10 Willpower, +5 Presence, unlocks "Merciful" path
   - Future: Potential ally, respect from others, vulnerability to betrayal

3. **Avoid confrontation** - Strategic retreat
   - Consequences: +10 Instinct, +5 Agility, unlocks "Strategic" path
   - Future: Reputation as cautious, survival focus, missed opportunities

### Branch 7: Hidden Realm Discovery
**Chapter**: 95 (Hidden Realm: Abyssal Depths)
**Type**: Major
**Context**: Discover hidden realm with ancient power

**Options**:
1. **Absorb the power** - Take ancient power for yourself
   - Consequences: +30 All Stats, +20 Bloodlust, -15 Karma, unlocks "Power Hungry" path
   - Future: Immense power, corruption, isolation, god-like abilities

2. **Seal the realm** - Protect the world from dangerous power
   - Consequences: +20 Karma, +15 Willpower, +10 Presence, unlocks "Protector" path
   - Future: Respect from allies, moral high ground, missed power

3. **Share the power** - Distribute power among allies
   - Consequences: +10 Karma, +15 Presence, +10 Willpower, unlocks "Leader" path
   - Future: Strong alliances, shared burden, collective strength

### Branch 8: Parent's Secret Revealed
**Chapter**: 105 (Fractured Memories)
**Type**: Major
**Context**: Discover truth about parents' disappearance

**Options**:
1. **Seek revenge** - Pursue those responsible
   - Consequences: +15 Bloodlust, +10 Domination, -10 Karma, unlocks "Vengeance" path
   - Future: Obsessive quest, moral descent, potential redemption

2. **Seek truth** - Understand what happened
   - Consequences: +15 Instinct, +10 Willpower, +5 Karma, unlocks "Truth Seeker" path
   - Future: Philosophical journey, understanding, closure

3. **Let it go** - Accept the past, focus on future
   - Consequences: +15 Karma, +10 Willpower, unlocks "Acceptance" path
   - Future: Emotional healing, focus on present, peace

### Branch 9: World Event Choice
**Chapter**: 115 (World Event: The Crimson Eclipse)
**Type**: Major
**Context**: World-altering event requires decisive action

**Options**:
1. **Embrace the eclipse** - Align with supernatural forces
   - Consequences: +25 Dark Affinity, +20 Bloodlust, -15 Karma, unlocks "Dark Lord" path
   - Future: Supernatural power, world domination, moral corruption

2. **Fight the eclipse** - Protect the world from darkness
   - Consequences: +25 Karma, +20 Willpower, +15 Presence, unlocks "World Savior" path
   - Future: Hero's journey, sacrifice, world salvation

3. **Use the eclipse** - Exploit the event for personal gain
   - Consequences: +20 All Stats, +10 Bloodlust, -5 Karma, unlocks "Opportunist" path
   - Future: Personal advancement, moral ambiguity, strategic advantage

### Branch 10: Final Choice
**Chapter**: 130 (Progenitor's Domain)
**Type**: Major
**Context**: Ultimate decision about the nature of reality and Kael's role

**Options**:
1. **Merge the worlds** - Bring VR and reality together
   - Consequences: +50 All Stats, +30 Dark Affinity, -20 Karma, unlocks "World Merger" ending
   - Future: New reality, god-like power, ultimate transformation

2. **Separate the worlds** - Maintain boundary between VR and reality
   - Consequences: +30 Karma, +25 Willpower, +20 Presence, unlocks "World Separator" ending
   - Future: Balance, protection, dual existence

3. **Transcend both worlds** - Become something beyond both
   - Consequences: +100 All Stats, +50 Dark Affinity, +50 Karma, unlocks "Transcendent" ending
   - Future: Beyond comprehension, new existence, ultimate evolution

---

## Minor Branching Points (20+)

### Combat Choices
1. **Lethal vs Non-lethal** - Choose to kill or spare enemies
2. **Aggressive vs Defensive** - Combat style choices
3. **Solo vs Team** - Fight alone or with allies
4. **Skill Usage** - Which skills to use in combat

### Dialogue Choices
5. **Aggressive vs Diplomatic** - Tone in conversations
6. **Truth vs Deception** - Honesty in dialogue
7. **Helpful vs Selfish** - Assistance to others
8. **Curious vs Cautious** - Information gathering approach

### Exploration Choices
9. **Rush vs Explore** - Speed vs thoroughness
10. **Risk vs Safety** - Dangerous vs safe paths
11. **Secret vs Public** - Share discoveries or keep secret
12. **Investigate vs Ignore** - Follow leads or move on

### Relationship Choices
13. **Trust vs Suspicion** - Trust allies or be cautious
14. **Help vs Ignore** - Assist others or focus on self
15. **Forgive vs Grudge** - Handle betrayals or conflicts
16. **Intimacy vs Distance** - Emotional closeness with others

### Moral Choices
17. **Selfish vs Selfless** - Personal gain vs helping others
18. **Lawful vs Chaotic** - Follow rules or break them
19. **Mercy vs Ruthlessness** - Show compassion or be ruthless
20. **Honesty vs Deception** - Tell truth or lie

---

## Technical Implementation

### Module Structure

```javascript
// js/modules/branching-narrative.js
const BranchingNarrative = (() => {
  // Choice tracking system
  let choiceTracker = {
    choices: [],
    outcomes: {},
    relationships: {},
    statChanges: {},
    unlockedBranches: [],
    lockedBranches: [],
    convergencePoints: []
  };
  
  // Branch definitions
  const branches = {
    // Major branches
    major: {
      branch_1: { /* First Extraction Choice */ },
      branch_2: { /* Sister's Treatment Decision */ },
      // ... more major branches
    },
    // Minor branches
    minor: {
      branch_11: { /* Lethal vs Non-lethal */ },
      branch_12: { /* Aggressive vs Defensive */ },
      // ... more minor branches
    }
  };
  
  // Functions
  function presentChoice(choiceId) { /* ... */ }
  function recordChoice(choiceId, optionId) { /* ... */ }
  function applyConsequences(consequences) { /* ... */ }
  function checkBranchConditions(branchId) { /* ... */ }
  function getAvailableBranches() { /* ... */ }
  function getBranchHistory() { /* ... */ }
  function resetChoices() { /* ... */ }
  
  // Export
  return {
    presentChoice,
    recordChoice,
    applyConsequences,
    checkBranchConditions,
    getAvailableBranches,
    getBranchHistory,
    resetChoices
  };
})();
```

### Integration with Story Engine

```javascript
// In story-engine.js
// Add branching narrative integration
const BranchingNarrative = window.BranchingNarrative;

// Modify chapter generation to include choices
function generateChapter(chapterNum, type, setting) {
  // ... existing code ...
  
  // Check if chapter has a branching point
  if (hasBranchingPoint(chapterNum)) {
    const branch = getBranchForChapter(chapterNum);
    const choice = BranchingNarrative.presentChoice(branch.id);
    
    if (choice) {
      // Record choice and apply consequences
      BranchingNarrative.recordChoice(branch.id, choice.selectedOption);
      BranchingNarrative.applyConsequences(choice.consequences);
      
      // Modify chapter content based on choice
      paragraphs = applyChoiceToContent(paragraphs, choice);
    }
  }
  
  // ... rest of chapter generation ...
}
```

---

## Testing Strategy

### Unit Tests
- Test choice tracking functionality
- Test consequence application
- Test branch condition checking
- Test branch unlocking/locking

### Integration Tests
- Test branching with chapter generation
- Test seeded RNG consistency with branches
- Test save/load with choices
- Test branch convergence

### User Experience Tests
- Test choice presentation UI
- Test choice feedback
- Test branch visibility
- Test replayability with different choices

---

## Documentation Requirements

1. **Branch Documentation**: Document all major and minor branches
2. **Choice Documentation**: Document all choices and consequences
3. **API Documentation**: Document branching narrative API
4. **User Guide**: Document how branching works for players

---


## Conclusion

This branching narrative design provides a comprehensive framework for implementing meaningful choices in the Story-Unending project. The system balances player agency with narrative consistency, enhances replayability, and integrates seamlessly with the existing story engine.

**Next Steps**: Implement the choice tracking system and begin adding major branching points to the story engine.