/* ============================================
   BRANCHING NARRATIVE SYSTEM
   Choice tracking and branching narrative paths
   ============================================ */

const BranchingNarrative = (() => {
  
  // ============================================
  // CHOICE TRACKER STATE
  // ============================================
  let choiceTracker = {
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
    convergencePoints: [],
    
    // Track flags for conditional branches
    flags: []
  };
  
  // ============================================
  // BRANCH DEFINITIONS
  // ============================================
  const branches = {
    // Major branches (10)
    major: {
      branch_1: {
        id: "branch_1",
        name: "First Extraction Choice",
        chapter: 25,
        type: "major",
        category: "moral",
        description: "Kael successfully extracts his first item from the VR world",
        options: [
          {
            id: "option_1",
            text: "Keep it secret - Hide the extracted item, tell no one",
            consequences: {
              statChanges: { karma: 5, instinct: 5 },
              relationshipChanges: {},
              unlocks: ["secret_keeper_path"],
              locks: [],
              flags: ["secret_keeper"]
            }
          },
          {
            id: "option_2",
            text: "Share with Mira - Show the extracted item to trusted ally",
            consequences: {
              statChanges: { presence: 5 },
              relationshipChanges: { Mira: 10 },
              unlocks: ["alliance_path"],
              locks: [],
              flags: ["alliance"]
            }
          },
          {
            id: "option_3",
            text: "Sell it - Attempt to sell the extracted item",
            consequences: {
              statChanges: { karma: -10, bloodlust: 5 },
              relationshipChanges: {},
              unlocks: ["mercenary_path"],
              locks: [],
              flags: ["mercenary"]
            }
          }
        ]
      },
      branch_2: {
        id: "branch_2",
        name: "Sister's Treatment Decision",
        chapter: 35,
        type: "major",
        category: "moral",
        description: "Yuna's condition worsens, doctors offer experimental treatment",
        options: [
          {
            id: "option_1",
            text: "Accept experimental treatment - Risky but potentially curative",
            consequences: {
              statChanges: { willpower: 10, karma: 5 },
              relationshipChanges: {},
              unlocks: ["risk_taker_path"],
              locks: [],
              flags: ["risk_taker"]
            }
          },
          {
            id: "option_2",
            text: "Seek VR cure - Believe VR world holds the answer",
            consequences: {
              statChanges: { instinct: 15, darkAffinity: 10 },
              relationshipChanges: {},
              unlocks: ["vr_believer_path"],
              locks: [],
              flags: ["vr_believer"]
            }
          },
          {
            id: "option_3",
            text: "Refuse treatment - Let nature take its course",
            consequences: {
              statChanges: { karma: 10, willpower: 5 },
              relationshipChanges: {},
              unlocks: ["acceptance_path"],
              locks: [],
              flags: ["acceptance"]
            }
          }
        ]
      },
      branch_3: {
        id: "branch_3",
        name: "Vampire Evolution Path",
        chapter: 50,
        type: "major",
        category: "character",
        description: "Kael reaches evolution threshold, must choose vampire path",
        options: [
          {
            id: "option_1",
            text: "Blood Sovereign - Focus on blood manipulation and domination",
            consequences: {
              statChanges: { bloodlust: 20, domination: 10, karma: -10 },
              relationshipChanges: {},
              unlocks: ["blood_sovereign_path"],
              locks: [],
              flags: ["blood_sovereign"]
            }
          },
          {
            id: "option_2",
            text: "Shadow Lord - Focus on stealth, shadows, and assassination",
            consequences: {
              statChanges: { agility: 15, darkAffinity: 10, instinct: 5 },
              relationshipChanges: {},
              unlocks: ["shadow_lord_path"],
              locks: [],
              flags: ["shadow_lord"]
            }
          },
          {
            id: "option_3",
            text: "Eternal Guardian - Focus on protection, regeneration, and defense",
            consequences: {
              statChanges: { vitality: 20, regeneration: 15, karma: 10 },
              relationshipChanges: {},
              unlocks: ["eternal_guardian_path"],
              locks: [],
              flags: ["eternal_guardian"]
            }
          }
        ]
      },
      branch_4: {
        id: "branch_4",
        name: "Guild Alliance",
        chapter: 65,
        type: "major",
        category: "relationship",
        description: "Major guilds recruit Kael, must choose alliance",
        options: [
          {
            id: "option_1",
            text: "Join Crimson Court - Vampire-focused guild",
            consequences: {
              statChanges: { darkAffinity: 15, bloodlust: 10, domination: 5 },
              relationshipChanges: {},
              unlocks: ["crimson_court_path"],
              locks: [],
              flags: ["crimson_court"]
            }
          },
          {
            id: "option_2",
            text: "Join Shadow Syndicate - Mercenary guild",
            consequences: {
              statChanges: { agility: 10, instinct: 5, karma: -5 },
              relationshipChanges: {},
              unlocks: ["shadow_syndicate_path"],
              locks: [],
              flags: ["shadow_syndicate"]
            }
          },
          {
            id: "option_3",
            text: "Remain Independent - No guild affiliation",
            consequences: {
              statChanges: { willpower: 10, presence: 10, karma: 5 },
              relationshipChanges: {},
              unlocks: ["lone_wolf_path"],
              locks: [],
              flags: ["lone_wolf"]
            }
          }
        ]
      },
      branch_5: {
        id: "branch_5",
        name: "Romance Path",
        chapter: 75,
        type: "major",
        category: "relationship",
        description: "Multiple romantic interests express feelings",
        options: [
          {
            id: "option_1",
            text: "Pursue Sera - Mysterious player with game secrets",
            consequences: {
              statChanges: { instinct: 10, presence: 5 },
              relationshipChanges: { Sera: 20 },
              unlocks: ["sera_romance_path"],
              locks: [],
              flags: ["sera_romance"]
            }
          },
          {
            id: "option_2",
            text: "Pursue Lin - Real world hospital worker",
            consequences: {
              statChanges: { karma: 10, willpower: 5 },
              relationshipChanges: { Lin: 20 },
              unlocks: ["lin_romance_path"],
              locks: [],
              flags: ["lin_romance"]
            }
          },
          {
            id: "option_3",
            text: "Choose neither - Focus on goals, not romance",
            consequences: {
              statChanges: { willpower: 10, instinct: 10 },
              relationshipChanges: {},
              unlocks: ["solitary_path"],
              locks: [],
              flags: ["solitary"]
            }
          }
        ]
      },
      branch_6: {
        id: "branch_6",
        name: "Confrontation with Rival",
        chapter: 85,
        type: "major",
        category: "combat",
        description: "Major rival challenges Kael to decisive battle",
        options: [
          {
            id: "option_1",
            text: "Fight to the death - No mercy, total victory",
            consequences: {
              statChanges: { bloodlust: 10, domination: 5, karma: -5 },
              relationshipChanges: {},
              unlocks: ["ruthless_path"],
              locks: [],
              flags: ["ruthless"]
            }
          },
          {
            id: "option_2",
            text: "Spare the rival - Show mercy, offer alliance",
            consequences: {
              statChanges: { karma: 15, willpower: 10, presence: 5 },
              relationshipChanges: {},
              unlocks: ["merciful_path"],
              locks: [],
              flags: ["merciful"]
            }
          },
          {
            id: "option_3",
            text: "Avoid confrontation - Strategic retreat",
            consequences: {
              statChanges: { instinct: 10, agility: 5 },
              relationshipChanges: {},
              unlocks: ["strategic_path"],
              locks: [],
              flags: ["strategic"]
            }
          }
        ]
      },
      branch_7: {
        id: "branch_7",
        name: "Hidden Realm Discovery",
        chapter: 95,
        type: "major",
        category: "exploration",
        description: "Discover hidden realm with ancient power",
        options: [
          {
            id: "option_1",
            text: "Absorb the power - Take ancient power for yourself",
            consequences: {
              statChanges: { bloodlust: 20, karma: -15 },
              relationshipChanges: {},
              unlocks: ["power_hungry_path"],
              locks: [],
              flags: ["power_hungry"]
            }
          },
          {
            id: "option_2",
            text: "Seal the realm - Protect the world from dangerous power",
            consequences: {
              statChanges: { karma: 20, willpower: 15, presence: 10 },
              relationshipChanges: {},
              unlocks: ["protector_path"],
              locks: [],
              flags: ["protector"]
            }
          },
          {
            id: "option_3",
            text: "Share the power - Distribute power among allies",
            consequences: {
              statChanges: { karma: 10, presence: 15, willpower: 10 },
              relationshipChanges: {},
              unlocks: ["leader_path"],
              locks: [],
              flags: ["leader"]
            }
          }
        ]
      },
      branch_8: {
        id: "branch_8",
        name: "Parent's Secret Revealed",
        chapter: 105,
        type: "major",
        category: "story",
        description: "Discover truth about parents' disappearance",
        options: [
          {
            id: "option_1",
            text: "Seek revenge - Pursue those responsible",
            consequences: {
              statChanges: { bloodlust: 15, domination: 10, karma: -10 },
              relationshipChanges: {},
              unlocks: ["vengeance_path"],
              locks: [],
              flags: ["vengeance"]
            }
          },
          {
            id: "option_2",
            text: "Seek truth - Understand what happened",
            consequences: {
              statChanges: { instinct: 15, willpower: 10, karma: 5 },
              relationshipChanges: {},
              unlocks: ["truth_seeker_path"],
              locks: [],
              flags: ["truth_seeker"]
            }
          },
          {
            id: "option_3",
            text: "Let it go - Accept the past, focus on future",
            consequences: {
              statChanges: { karma: 15, willpower: 10 },
              relationshipChanges: {},
              unlocks: ["acceptance_path"],
              locks: [],
              flags: ["acceptance"]
            }
          }
        ]
      },
      branch_9: {
        id: "branch_9",
        name: "World Event Choice",
        chapter: 115,
        type: "major",
        category: "world",
        description: "World-altering event requires decisive action",
        options: [
          {
            id: "option_1",
            text: "Embrace the eclipse - Align with supernatural forces",
            consequences: {
              statChanges: { darkAffinity: 25, bloodlust: 20, karma: -15 },
              relationshipChanges: {},
              unlocks: ["dark_lord_path"],
              locks: [],
              flags: ["dark_lord"]
            }
          },
          {
            id: "option_2",
            text: "Fight the eclipse - Protect the world from darkness",
            consequences: {
              statChanges: { karma: 25, willpower: 20, presence: 15 },
              relationshipChanges: {},
              unlocks: ["world_savior_path"],
              locks: [],
              flags: ["world_savior"]
            }
          },
          {
            id: "option_3",
            text: "Use the eclipse - Exploit the event for personal gain",
            consequences: {
              statChanges: { bloodlust: 10, karma: -5 },
              relationshipChanges: {},
              unlocks: ["opportunist_path"],
              locks: [],
              flags: ["opportunist"]
            }
          }
        ]
      },
      branch_10: {
        id: "branch_10",
        name: "Final Choice",
        chapter: 130,
        type: "major",
        category: "story",
        description: "Ultimate decision about the nature of reality and Kael's role",
        options: [
          {
            id: "option_1",
            text: "Merge the worlds - Bring VR and reality together",
            consequences: {
              statChanges: { darkAffinity: 30, karma: -20 },
              relationshipChanges: {},
              unlocks: ["world_merger_ending"],
              locks: [],
              flags: ["world_merger"]
            }
          },
          {
            id: "option_2",
            text: "Separate the worlds - Maintain boundary between VR and reality",
            consequences: {
              statChanges: { karma: 30, willpower: 25, presence: 20 },
              relationshipChanges: {},
              unlocks: ["world_separator_ending"],
              locks: [],
              flags: ["world_separator"]
            }
          },
          {
            id: "option_3",
            text: "Transcend both worlds - Become something beyond both",
            consequences: {
              statChanges: { darkAffinity: 50, karma: 50 },
              relationshipChanges: {},
              unlocks: ["transcendent_ending"],
              locks: [],
              flags: ["transcendent"]
            }
          }
        ]
      }
    },
    
    // Minor branches (20)
    minor: {
      branch_11: {
        id: "branch_11",
        name: "Lethal vs Non-lethal",
        chapter: 30,
        type: "minor",
        category: "combat",
        description: "Choose to kill or spare enemies",
        options: [
          {
            id: "option_1",
            text: "Kill them - No mercy",
            consequences: {
              statChanges: { bloodlust: 5, karma: -3 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["lethal_combatant"]
            }
          },
          {
            id: "option_2",
            text: "Spare them - Show mercy",
            consequences: {
              statChanges: { karma: 3, willpower: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["merciful_combatant"]
            }
          }
        ]
      },
      branch_12: {
        id: "branch_12",
        name: "Aggressive vs Defensive",
        chapter: 32,
        type: "minor",
        category: "combat",
        description: "Combat style choices",
        options: [
          {
            id: "option_1",
            text: "Aggressive - Attack first, ask questions later",
            consequences: {
              statChanges: { bloodlust: 3, domination: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["aggressive_fighter"]
            }
          },
          {
            id: "option_2",
            text: "Defensive - Wait for openings, counterattack",
            consequences: {
              statChanges: { instinct: 3, willpower: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["defensive_fighter"]
            }
          }
        ]
      },
      branch_13: {
        id: "branch_13",
        name: "Solo vs Team",
        chapter: 40,
        type: "minor",
        category: "combat",
        description: "Fight alone or with allies",
        options: [
          {
            id: "option_1",
            text: "Solo - Fight alone",
            consequences: {
              statChanges: { instinct: 3, presence: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["solo_fighter"]
            }
          },
          {
            id: "option_2",
            text: "Team - Fight with allies",
            consequences: {
              statChanges: { presence: 3, karma: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["team_fighter"]
            }
          }
        ]
      },
      branch_14: {
        id: "branch_14",
        name: "Aggressive vs Diplomatic",
        chapter: 45,
        type: "minor",
        category: "dialogue",
        description: "Tone in conversations",
        options: [
          {
            id: "option_1",
            text: "Aggressive - Intimidate and threaten",
            consequences: {
              statChanges: { domination: 3, presence: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["aggressive_speaker"]
            }
          },
          {
            id: "option_2",
            text: "Diplomatic - Negotiate and persuade",
            consequences: {
              statChanges: { presence: 3, karma: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["diplomatic_speaker"]
            }
          }
        ]
      },
      branch_15: {
        id: "branch_15",
        name: "Truth vs Deception",
        chapter: 48,
        type: "minor",
        category: "dialogue",
        description: "Honesty in dialogue",
        options: [
          {
            id: "option_1",
            text: "Tell the truth - Be honest",
            consequences: {
              statChanges: { karma: 3, willpower: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["honest_speaker"]
            }
          },
          {
            id: "option_2",
            text: "Lie - Deceive for advantage",
            consequences: {
              statChanges: { instinct: 3, karma: -2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["deceptive_speaker"]
            }
          }
        ]
      },
      branch_16: {
        id: "branch_16",
        name: "Helpful vs Selfish",
        chapter: 52,
        type: "minor",
        category: "dialogue",
        description: "Assistance to others",
        options: [
          {
            id: "option_1",
            text: "Help - Assist others",
            consequences: {
              statChanges: { karma: 3, presence: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["helpful"]
            }
          },
          {
            id: "option_2",
            text: "Ignore - Focus on yourself",
            consequences: {
              statChanges: { instinct: 2, karma: -2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["selfish"]
            }
          }
        ]
      },
      branch_17: {
        id: "branch_17",
        name: "Rush vs Explore",
        chapter: 55,
        type: "minor",
        category: "exploration",
        description: "Speed vs thoroughness",
        options: [
          {
            id: "option_1",
            text: "Rush - Move quickly",
            consequences: {
              statChanges: { instinct: 2, agility: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["rushed_explorer"]
            }
          },
          {
            id: "option_2",
            text: "Explore - Be thorough",
            consequences: {
              statChanges: { instinct: 3, willpower: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["thorough_explorer"]
            }
          }
        ]
      },
      branch_18: {
        id: "branch_18",
        name: "Risk vs Safety",
        chapter: 58,
        type: "minor",
        category: "exploration",
        description: "Dangerous vs safe paths",
        options: [
          {
            id: "option_1",
            text: "Take the risk - Dangerous path",
            consequences: {
              statChanges: { instinct: 3, willpower: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["risk_taker"]
            }
          },
          {
            id: "option_2",
            text: "Play it safe - Safe path",
            consequences: {
              statChanges: { instinct: 2, karma: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["safe_player"]
            }
          }
        ]
      },
      branch_19: {
        id: "branch_19",
        name: "Secret vs Public",
        chapter: 60,
        type: "minor",
        category: "exploration",
        description: "Share discoveries or keep secret",
        options: [
          {
            id: "option_1",
            text: "Keep secret - Don't share",
            consequences: {
              statChanges: { instinct: 3, presence: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["secret_keeper"]
            }
          },
          {
            id: "option_2",
            text: "Share - Tell others",
            consequences: {
              statChanges: { presence: 3, karma: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["sharer"]
            }
          }
        ]
      },
      branch_20: {
        id: "branch_20",
        name: "Trust vs Suspicion",
        chapter: 62,
        type: "minor",
        category: "relationship",
        description: "Trust allies or be cautious",
        options: [
          {
            id: "option_1",
            text: "Trust - Believe in allies",
            consequences: {
              statChanges: { karma: 3, presence: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["trusting"]
            }
          },
          {
            id: "option_2",
            text: "Be suspicious - Stay cautious",
            consequences: {
              statChanges: { instinct: 3, karma: -2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["suspicious"]
            }
          }
        ]
      },
      branch_21: {
        id: "branch_21",
        name: "Help vs Ignore",
        chapter: 68,
        type: "minor",
        category: "relationship",
        description: "Assist others or focus on self",
        options: [
          {
            id: "option_1",
            text: "Help - Assist others",
            consequences: {
              statChanges: { karma: 3, presence: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["helpful"]
            }
          },
          {
            id: "option_2",
            text: "Ignore - Focus on yourself",
            consequences: {
              statChanges: { instinct: 2, karma: -2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["selfish"]
            }
          }
        ]
      },
      branch_22: {
        id: "branch_22",
        name: "Forgive vs Grudge",
        chapter: 72,
        type: "minor",
        category: "relationship",
        description: "Handle betrayals or conflicts",
        options: [
          {
            id: "option_1",
            text: "Forgive - Let it go",
            consequences: {
              statChanges: { karma: 3, willpower: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["forgiving"]
            }
          },
          {
            id: "option_2",
            text: "Hold a grudge - Remember the betrayal",
            consequences: {
              statChanges: { bloodlust: 2, karma: -2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["grudge_holder"]
            }
          }
        ]
      },
      branch_23: {
        id: "branch_23",
        name: "Selfish vs Selfless",
        chapter: 78,
        type: "minor",
        category: "moral",
        description: "Personal gain vs helping others",
        options: [
          {
            id: "option_1",
            text: "Selfish - Focus on personal gain",
            consequences: {
              statChanges: { instinct: 2, karma: -3 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["selfish"]
            }
          },
          {
            id: "option_2",
            text: "Selfless - Help others",
            consequences: {
              statChanges: { karma: 3, presence: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["selfless"]
            }
          }
        ]
      },
      branch_24: {
        id: "branch_24",
        name: "Lawful vs Chaotic",
        chapter: 82,
        type: "minor",
        category: "moral",
        description: "Follow rules or break them",
        options: [
          {
            id: "option_1",
            text: "Lawful - Follow the rules",
            consequences: {
              statChanges: { karma: 3, willpower: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["lawful"]
            }
          },
          {
            id: "option_2",
            text: "Chaotic - Break the rules",
            consequences: {
              statChanges: { instinct: 3, karma: -2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["chaotic"]
            }
          }
        ]
      },
      branch_25: {
        id: "branch_25",
        name: "Mercy vs Ruthlessness",
        chapter: 88,
        type: "minor",
        category: "moral",
        description: "Show compassion or be ruthless",
        options: [
          {
            id: "option_1",
            text: "Show mercy - Be compassionate",
            consequences: {
              statChanges: { karma: 3, willpower: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["merciful"]
            }
          },
          {
            id: "option_2",
            text: "Be ruthless - No compassion",
            consequences: {
              statChanges: { bloodlust: 3, karma: -3 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["ruthless"]
            }
          }
        ]
      },
      branch_26: {
        id: "branch_26",
        name: "Honesty vs Deception",
        chapter: 92,
        type: "minor",
        category: "moral",
        description: "Tell truth or lie",
        options: [
          {
            id: "option_1",
            text: "Be honest - Tell the truth",
            consequences: {
              statChanges: { karma: 3, willpower: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["honest"]
            }
          },
          {
            id: "option_2",
            text: "Deceive - Lie for advantage",
            consequences: {
              statChanges: { instinct: 3, karma: -2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["deceptive"]
            }
          }
        ]
      },
      branch_27: {
        id: "branch_27",
        name: "Skill Usage",
        chapter: 95,
        type: "minor",
        category: "combat",
        description: "Which skills to use in combat",
        options: [
          {
            id: "option_1",
            text: "Use Blood Drain - Drain life force",
            consequences: {
              statChanges: { bloodlust: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["blood_drain_user"]
            }
          },
          {
            id: "option_2",
            text: "Use Shadow Step - Teleport through shadows",
            consequences: {
              statChanges: { instinct: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["shadow_step_user"]
            }
          },
          {
            id: "option_3",
            text: "Use Blood Lance - Piercing projectile",
            consequences: {
              statChanges: { domination: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["blood_lance_user"]
            }
          }
        ]
      },
      branch_28: {
        id: "branch_28",
        name: "Curious vs Cautious",
        chapter: 98,
        type: "minor",
        category: "exploration",
        description: "Information gathering approach",
        options: [
          {
            id: "option_1",
            text: "Be curious - Investigate everything",
            consequences: {
              statChanges: { instinct: 3, willpower: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["curious"]
            }
          },
          {
            id: "option_2",
            text: "Be cautious - Stay safe",
            consequences: {
              statChanges: { instinct: 2, karma: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["cautious"]
            }
          }
        ]
      },
      branch_29: {
        id: "branch_29",
        name: "Investigate vs Ignore",
        chapter: 102,
        type: "minor",
        category: "exploration",
        description: "Follow leads or move on",
        options: [
          {
            id: "option_1",
            text: "Investigate - Follow the lead",
            consequences: {
              statChanges: { instinct: 3, willpower: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["investigator"]
            }
          },
          {
            id: "option_2",
            text: "Ignore - Move on",
            consequences: {
              statChanges: { instinct: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["ignorer"]
            }
          }
        ]
      },
      branch_30: {
        id: "branch_30",
        name: "Intimacy vs Distance",
        chapter: 108,
        type: "minor",
        category: "relationship",
        description: "Emotional closeness with others",
        options: [
          {
            id: "option_1",
            text: "Be intimate - Open up emotionally",
            consequences: {
              statChanges: { presence: 3, karma: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["intimate"]
            }
          },
          {
            id: "option_2",
            text: "Keep distance - Stay emotionally distant",
            consequences: {
              statChanges: { instinct: 2, willpower: 2 },
              relationshipChanges: {},
              unlocks: [],
              locks: [],
              flags: ["distant"]
            }
          }
        ]
      },

      branch_31: {
        id: "branch_31",
        name: "VR World Discovery",
        chapter: 140,
        type: "major",
        category: "exploration",
        description: "Kael discovers a hidden region in the VR world",
        options: [
          {
            id: "option_1",
            text: "Explore cautiously - Take time to understand the new region",
            consequences: {
              statChanges: { instinct: 5, willpower: 5 },
              relationshipChanges: {},
              unlocks: ["cautious_explorer_path"],
              locks: [],
              flags: ["cautious_explorer"]
            }
          },
          {
            id: "option_2",
            text: "Dive in headfirst - Rush into the new region immediately",
            consequences: {
              statChanges: { bloodlust: 5, presence: 5 },
              relationshipChanges: {},
              unlocks: ["bold_explorer_path"],
              locks: [],
              flags: ["bold_explorer"]
            }
          },
          {
            id: "option_3",
            text: "Gather allies - Bring companions to explore together",
            consequences: {
              statChanges: { presence: 10 },
              relationshipChanges: { Mira: 5, Dex: 5 },
              unlocks: ["team_explorer_path"],
              locks: [],
              flags: ["team_explorer"]
            }
          }
        ]
      },
      branch_32: {
        id: "branch_32",
        name: "Ancient Secret Uncovered",
        chapter: 155,
        type: "major",
        category: "mystery",
        description: "Kael uncovers an ancient secret about the VR world",
        options: [
          {
            id: "option_1",
            text: "Share the secret - Reveal the truth to others",
            consequences: {
              statChanges: { karma: 10, presence: 5 },
              relationshipChanges: { Mira: 10, Yuki: 5 },
              unlocks: ["truth_seeker_path"],
              locks: [],
              flags: ["truth_seeker"]
            }
          },
          {
            id: "option_2",
            text: "Keep it hidden - Protect the secret at all costs",
            consequences: {
              statChanges: { instinct: 10, karma: -5 },
              relationshipChanges: {},
              unlocks: ["secret_guardian_path"],
              locks: [],
              flags: ["secret_guardian"]
            }
          },
          {
            id: "option_3",
            text: "Use the secret - Leverage the secret for personal gain",
            consequences: {
              statChanges: { bloodlust: 10, karma: -10 },
              relationshipChanges: {},
              unlocks: ["opportunist_path"],
              locks: [],
              flags: ["opportunist"]
            }
          }
        ]
      },
      branch_33: {
        id: "branch_33",
        name: "Ultimate Sacrifice",
        chapter: 170,
        type: "major",
        category: "moral",
        description: "Kael faces a choice that requires ultimate sacrifice",
        options: [
          {
            id: "option_1",
            text: "Sacrifice yourself - Give up everything for others",
            consequences: {
              statChanges: { karma: 20, willpower: 10 },
              relationshipChanges: { Mira: 15, Yuna: 20 },
              unlocks: ["selfless_path"],
              locks: [],
              flags: ["selfless"]
            }
          },
          {
            id: "option_2",
            text: "Sacrifice others - Choose survival over others",
            consequences: {
              statChanges: { karma: -20, bloodlust: 10 },
              relationshipChanges: { Mira: -20, Yuna: -20 },
              unlocks: ["selfish_path"],
              locks: [],
              flags: ["selfish"]
            }
          },
          {
            id: "option_3",
            text: "Find another way - Seek a third option",
            consequences: {
              statChanges: { instinct: 10, willpower: 5 },
              relationshipChanges: {},
              unlocks: ["creative_path"],
              locks: [],
              flags: ["creative_solution"]
            }
          }
        ]
      },
      branch_34: {
        id: "branch_34",
        name: "VR World Destiny",
        chapter: 185,
        type: "major",
        category: "destiny",
        description: "Kael must choose the ultimate fate of the VR world",
        options: [
          {
            id: "option_1",
            text: "Preserve the VR world - Protect it from destruction",
            consequences: {
              statChanges: { karma: 15, willpower: 10 },
              relationshipChanges: { Mira: 10, Dex: 10 },
              unlocks: ["preserver_path"],
              locks: [],
              flags: ["world_preserver"]
            }
          },
          {
            id: "option_2",
            text: "Destroy the VR world - End the illusion forever",
            consequences: {
              statChanges: { karma: -10, bloodlust: 15 },
              relationshipChanges: { Mira: -10, Dex: -10 },
              unlocks: ["destroyer_path"],
              locks: [],
              flags: ["world_destroyer"]
            }
          },
          {
            id: "option_3",
            text: "Transform the VR world - Evolve it into something new",
            consequences: {
              statChanges: { instinct: 15, presence: 10 },
              relationshipChanges: {},
              unlocks: ["transformer_path"],
              locks: [],
              flags: ["world_transformer"]
            }
          }
        ]
      },
      branch_35: {
        id: "branch_35",
        name: "Final Resolution",
        chapter: 200,
        type: "major",
        category: "resolution",
        description: "Kael faces the final resolution of his journey",
        options: [
          {
            id: "option_1",
            text: "Return to reality - Accept the real world and move forward",
            consequences: {
              statChanges: { karma: 10, willpower: 15 },
              relationshipChanges: { Yuna: 20 },
              unlocks: ["reality_acceptance_path"],
              locks: [],
              flags: ["reality_accepted"]
            }
          },
          {
            id: "option_2",
            text: "Embrace the VR world - Choose to live in the virtual realm",
            consequences: {
              statChanges: { darkAffinity: 15, presence: 10 },
              relationshipChanges: { Mira: 10 },
              unlocks: ["vr_embrace_path"],
              locks: [],
              flags: ["vr_embraced"]
            }
          },
          {
            id: "option_3",
            text: "Find balance - Create harmony between both worlds",
            consequences: {
              statChanges: { instinct: 10, karma: 10 },
              relationshipChanges: { Mira: 10, Yuna: 10 },
              unlocks: ["balance_path"],
              locks: [],
              flags: ["balance_found"]
            }
          }
        ]
      }

    }
  };
  
  // ============================================
  // CORE FUNCTIONS
  // ============================================
  
  /**
   * Present a choice to the player
   * @param {string} branchId - The ID of the branch to present
   * @returns {Object|null} The choice object or null if branch not found
   */
  const presentChoice = (branchId) => {
    try {
      // Search in major branches first
      let branch = branches.major[branchId];
      if (!branch) {
        // Search in minor branches
        branch = branches.minor[branchId];
      }
      
      if (!branch) {
        // Error logged: console.error('Branch not found:', branchId);
        return null;
      }
      
      // Check if branch is locked
      if (choiceTracker.lockedBranches.includes(branchId)) {
        // Branch is locked: branchId
        return null;
      }
      
      // Check if branch has already been used
      if (choiceTracker.choices.some(c => c.branchId === branchId)) {
        // Branch already used: branchId
        return null;
      }
      
      return branch;
    } catch (error) {
      // Error handled silently: console.error('Error presenting choice:', error);
      return null;
    }
  }
  
  /**
   * Record a choice made by the player
   * @param {string} branchId - The ID of the branch
   * @param {string} optionId - The ID of the selected option
   * @returns {boolean} Success status
   */
  const recordChoice = (branchId, optionId) => {
    try {
      // Get the branch
      let branch = branches.major[branchId];
      if (!branch) {
        branch = branches.minor[branchId];
      }
      
      if (!branch) {
        // Error logged: console.error('Branch not found:', branchId);
        return false;
      }
      
      // Get the selected option
      const option = branch.options.find(o => o.id === optionId);
      if (!option) {
        // Error logged: console.error('Option not found:', optionId);
        return false;
      }
      
      // Create choice record
      const choice = {
        id: `choice_${choiceTracker.choices.length + 1}`,
        branchId: branchId,
        branchName: branch.name,
        chapter: branch.chapter,
        type: branch.type,
        category: branch.category,
        selectedOption: optionId,
        optionText: option.text,
        consequences: option.consequences,
        timestamp: new Date().toISOString()
      };
      
      // Add to choices array
      choiceTracker.choices.push(choice);
      
      // Store outcome
      choiceTracker.outcomes[branchId] = {
        selectedOption: optionId,
        consequences: option.consequences
      };
      
      // Apply consequences
      applyConsequences(option.consequences);
      
      // Save to localStorage
      saveChoiceTracker();
      
      return true;
    } catch (error) {
      // Error handled silently: console.error('Error recording choice:', error);
      return false;
    }
  }
  
  /**
   * Apply consequences of a choice
   * @param {Object} consequences - The consequences to apply
   */
  const applyConsequences = (consequences) => {
    try {
      // Apply stat changes
      if (consequences.statChanges) {
        for (const [stat, value] of Object.entries(consequences.statChanges)) {
          if (choiceTracker.statChanges[stat] !== undefined) {
            choiceTracker.statChanges[stat] += value;
          }
        }
      }
      
      // Apply relationship changes
      if (consequences.relationshipChanges) {
        for (const [character, value] of Object.entries(consequences.relationshipChanges)) {
          // Determine relationship category
          let category = 'allies';
          if (['Soren', 'Nyx', 'Graves'].includes(character)) {
            category = 'rivals';
          } else if (['Sera', 'Lin'].includes(character)) {
            category = 'romance';
          } else if (['Old Man Chen', 'Vladris', 'The Archivist'].includes(character)) {
            category = 'mentors';
          }
          
          if (!choiceTracker.relationships[category][character]) {
            choiceTracker.relationships[category][character] = 0;
          }
          choiceTracker.relationships[category][character] += value;
        }
      }
      
      // Unlock branches
      if (consequences.unlocks && consequences.unlocks.length > 0) {
        for (const branchId of consequences.unlocks) {
          if (!choiceTracker.unlockedBranches.includes(branchId)) {
            choiceTracker.unlockedBranches.push(branchId);
          }
        }
      }
      
      // Lock branches
      if (consequences.locks && consequences.locks.length > 0) {
        for (const branchId of consequences.locks) {
          if (!choiceTracker.lockedBranches.includes(branchId)) {
            choiceTracker.lockedBranches.push(branchId);
          }
        }
      }
      
      // Add flags
      if (consequences.flags && consequences.flags.length > 0) {
        for (const flag of consequences.flags) {
          if (!choiceTracker.flags.includes(flag)) {
            choiceTracker.flags.push(flag);
          }
        }
      }
      
    } catch (error) {
      // Error handled silently: console.error('Error applying consequences:', error);
    }
  }
  
  /**
   * Check if a branch's conditions are met
   * @param {string} branchId - The ID of the branch to check
   * @returns {boolean} Whether conditions are met
   */
  const checkBranchConditions = (branchId) => {
    try {
      // Check if branch is locked
      if (choiceTracker.lockedBranches.includes(branchId)) {
        return false;
      }
      
      // Check if branch has already been used
      if (choiceTracker.choices.some(c => c.branchId === branchId)) {
        return false;
      }
      
      // Check if branch is unlocked
      if (choiceTracker.unlockedBranches.length > 0) {
        // If there are unlocked branches, only show those
        if (!choiceTracker.unlockedBranches.includes(branchId)) {
          // Check if it's a major branch (always available unless locked)
          const isMajor = branches.major[branchId] !== undefined;
          if (!isMajor) {
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      // Error handled silently: console.error('Error checking branch conditions:', error);
      return false;
    }
  }
  
  /**
   * Get all available branches for a chapter
   * @param {number} chapter - The chapter number
   * @returns {Array} Array of available branches
   */
  const getAvailableBranches = (chapter) => {
    try {
      const available = [];
      
      // Check major branches
      for (const [branchId, branch] of Object.entries(branches.major)) {
        if (branch.chapter === chapter && checkBranchConditions(branchId)) {
          available.push(branch);
        }
      }
      
      // Check minor branches
      for (const [branchId, branch] of Object.entries(branches.minor)) {
        if (branch.chapter === chapter && checkBranchConditions(branchId)) {
          available.push(branch);
        }
      }
      
      return available;
    } catch (error) {
      // Error handled silently: console.error('Error getting available branches:', error);
      return [];
    }
  }
  
  /**
   * Get the complete choice history
   * @returns {Array} Array of all choices made
   */
  const getBranchHistory = () => {
    return choiceTracker.choices;
  }
  
  /**
   * Get current stat changes from choices
   * @returns {Object} Current stat changes
   */
  const getStatChanges = () => {
    return choiceTracker.statChanges;
  }
  
  /**
   * Get current relationship values
   * @returns {Object} Current relationship values
   */
  const getRelationships = () => {
    return choiceTracker.relationships;
  }
  
  /**
   * Get all flags
   * @returns {Array} Array of all flags
   */
  const getFlags = () => {
    return choiceTracker.flags;
  }
  
  /**
   * Check if a flag is set
   * @param {string} flag - The flag to check
   * @returns {boolean} Whether the flag is set
   */
  const hasFlag = (flag) => {
    return choiceTracker.flags.includes(flag);
  }
  
  /**
   * Save choice tracker to localStorage
   */
  const saveChoiceTracker = () => {
    try {
      Storage.setItem('choiceTracker', choiceTracker);
    } catch (error) {
      // Error handled silently: console.error('Error saving choice tracker:', error);
    }
  }
  
  /**
   * Load choice tracker from localStorage
   */
  const loadChoiceTracker = () => {
    try {
      const saved = Storage.getItem('choiceTracker');
      if (saved) {
        choiceTracker = JSON.parse(saved);
      }
    } catch (error) {
      // Error handled silently: console.error('Error loading choice tracker:', error);
    }
  }
  
  /**
   * Reset all choices
   */
  const resetChoices = () => {
    choiceTracker = {
      choices: [],
      outcomes: {},
      relationships: {
        allies: {},
        rivals: {},
        romance: {},
        mentors: {}
      },
      statChanges: {
        karma: 0,
        instinct: 0,
        willpower: 0,
        presence: 0,
        bloodlust: 0,
        darkAffinity: 0
      },
      unlockedBranches: [],
      lockedBranches: [],
      convergencePoints: [],
      flags: []
    };
    saveChoiceTracker();
  }
  
  /**
   * Get branch by ID
   * @param {string} branchId - The ID of the branch
   * @returns {Object|null} The branch object or null
   */
  const getBranch = (branchId) => {
    let branch = branches.major[branchId];
    if (!branch) {
      branch = branches.minor[branchId];
    }
    return branch || null;
  }
  
  /**
   * Get all branches
   * @returns {Object} All branches
   */
  const getAllBranches = () => {
    return branches;
  }
  
  // ============================================
  // INITIALIZATION
  // ============================================
  
  // Load choice tracker from localStorage on initialization
  loadChoiceTracker();
  
  // ============================================
  // EXPORTS
  // ============================================
  return {
    presentChoice,
    recordChoice,
    applyConsequences,
    checkBranchConditions,
    getAvailableBranches,
    getBranchHistory,
    getStatChanges,
    getRelationships,
    getFlags,
    hasFlag,
    saveChoiceTracker,
    loadChoiceTracker,
    resetChoices,
    getBranch,
    getAllBranches
  };
  
})();