#!/usr/bin/env python3
"""
Script to expand quest variety
"""

def expand_quest_variety():
    """Expand quest templates with new quest types"""
    print("Expanding quest variety...")
    
    file_path = "js/modules/dynamic-content.js"
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # New quest types
    new_quest_types = '''
      escort: {
        name: "Escort Quest",
        description: "Escort [NPC] safely to [LOCATION]",
        objectives: [
          { type: "meet", target: "[NPC]" },
          { type: "travel", target: "[LOCATION]" },
          { type: "protect", target: "[NPC]" },
          { type: "return", target: "[QUEST_GIVER]" }
        ],
        rewards: {
          experience: "[EXP_AMOUNT]",
          gold: "[GOLD_AMOUNT]",
          reputation: "[REP_AMOUNT]",
          relationship: "[RELATIONSHIP_BONUS]"
        }
      },
      rescue: {
        name: "Rescue Quest",
        description: "Rescue [NPC] from [LOCATION] held by [ENEMY]",
        objectives: [
          { type: "travel", target: "[LOCATION]" },
          { type: "defeat", target: "[ENEMY]", quantity: "[QUANTITY]" },
          { type: "rescue", target: "[NPC]" },
          { type: "return", target: "[QUEST_GIVER]" }
        ],
        rewards: {
          experience: "[EXP_AMOUNT]",
          gold: "[GOLD_AMOUNT]",
          reputation: "[REP_AMOUNT]",
          gratitude: "[GRATITUDE_BONUS]"
        }
      },
      delivery: {
        name: "Delivery Quest",
        description: "Deliver [ITEM] to [RECIPIENT] in [LOCATION]",
        objectives: [
          { type: "collect", target: "[ITEM]", quantity: "[QUANTITY]" },
          { type: "travel", target: "[LOCATION]" },
          { type: "deliver", target: "[RECIPIENT]" },
          { type: "return", target: "[QUEST_GIVER]" }
        ],
        rewards: {
          experience: "[EXP_AMOUNT]",
          gold: "[GOLD_AMOUNT]",
          reputation: "[REP_AMOUNT]"
        }
      },
      crafting: {
        name: "Crafting Quest",
        description: "Craft [ITEM] using [MATERIALS] from [LOCATION]",
        objectives: [
          { type: "travel", target: "[LOCATION]" },
          { type: "collect", target: "[MATERIALS]", quantity: "[QUANTITY]" },
          { type: "craft", target: "[ITEM]" },
          { type: "return", target: "[QUEST_GIVER]" }
        ],
        rewards: {
          experience: "[EXP_AMOUNT]",
          gold: "[GOLD_AMOUNT]",
          item: "[CRAFTED_ITEM]",
          skill: "[SKILL_BONUS]"
        }
      },
      diplomacy: {
        name: "Diplomacy Quest",
        description: "Negotiate with [FACTION] in [LOCATION] about [TOPIC]",
        objectives: [
          { type: "travel", target: "[LOCATION]" },
          { type: "negotiate", target: "[FACTION]" },
          { type: "resolve", target: "[TOPIC]" },
          { type: "report", target: "[QUEST_GIVER]" }
        ],
        rewards: {
          experience: "[EXP_AMOUNT]",
          reputation: "[REP_AMOUNT]",
          alliance: "[ALLIANCE_BONUS]",
          karma: "[KARMA_BONUS]"
        }
      },
      stealth: {
        name: "Stealth Quest",
        description: "Infiltrate [LOCATION] and [OBJECTIVE] without detection",
        objectives: [
          { type: "travel", target: "[LOCATION]" },
          { type: "infiltrate", target: "[LOCATION]" },
          { type: "stealth_objective", target: "[OBJECTIVE]" },
          { type: "escape", target: "[ESCAPE_ROUTE]" },
          { type: "return", target: "[QUEST_GIVER]" }
        ],
        rewards: {
          experience: "[EXP_AMOUNT]",
          gold: "[GOLD_AMOUNT]",
          reputation: "[REP_AMOUNT]",
          stealth: "[STEALTH_BONUS]"
        }
      }'''
    
    # New placeholders
    new_placeholders = '''
      NPC: [
        "Merchant", "Scholar", "Noble", "Peasant", "Soldier",
        "Priest", "Thief", "Hunter", "Healer", "Artisan"
      ],
      RECIPIENT: [
        "The Elder", "The Merchant Guild", "The Military", "The Scholars",
        "The Temple", "The Resistance", "The Royal Family"
      ],
      MATERIALS: [
        "Iron Ore", "Wood", "Leather", "Herbs", "Crystals",
        "Ancient Metal", "Magical Essence", "Rare Gems"
      ],
      FACTION: [
        "The Merchants Guild", "The Military", "The Scholars",
        "The Temple", "The Resistance", "The Royal Court"
      ],
      TOPIC: [
        "Trade Agreement", "Peace Treaty", "Resource Sharing",
        "Military Alliance", "Territorial Dispute", "Cultural Exchange"
      ],
      OBJECTIVE: [
        "steal documents", "gather intelligence", "sabotage equipment",
        "rescue prisoner", "plant evidence", "assassinate target"
      ],
      ESCAPE_ROUTE: [
        "secret passage", "underground tunnel", "rooftop escape",
        "disguise exit", "distraction method"
      ]'''
    
    # Add new quest types
    content = content.replace(
        '          reputation: "[REP_AMOUNT]"\n        }\n      }\n    },',
        '          reputation: "[REP_AMOUNT]"\n        }\n      }' + new_quest_types + '\n    },'
    )
    
    # Add new placeholders
    content = content.replace(
        '        "Lost City"\n      ],',
        '        "Lost City"\n      ]' + new_placeholders + ','
    )
    
    # Write back to file
    with open(file_path, 'w') as f:
        f.write(content)
    
    print("✅ Expanded quest variety")
    print("  - Quest types: 4 → 10 (+6 new types)")
    print("  - New quest types: escort, rescue, delivery, crafting, diplomacy, stealth")
    print("  - New placeholders: 7 new placeholder types")
    print("  - Total quest types: 10")

if __name__ == "__main__":
    expand_quest_variety()