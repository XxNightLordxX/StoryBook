#!/usr/bin/env python3
"""
Script to expand world events system
"""

def expand_world_events():
    """Expand world events with new event types and events"""
    print("Expanding world events system...")
    
    file_path = "js/modules/dynamic-content.js"
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # New supernatural events
    new_supernatural = '''
        {
          type: "supernatural",
          name: "Void Rift Opens",
          description: "A tear in reality allows void creatures to enter",
          effects: {
            darkAffinity: 12,
            bloodlust: 8,
            instinct: 10,
            karma: -8
          },
          duration: 6
        },
        {
          type: "supernatural",
          name: "Ancestral Awakening",
          description: "Ancient vampire ancestors stir from their slumber",
          effects: {
            darkAffinity: 15,
            presence: 10,
            lore: 20
          },
          duration: 5
        },
        {
          type: "supernatural",
          name: "Shadow Plague",
          description: "A supernatural plague spreads through the population",
          effects: {
            bloodlust: 10,
            karma: -15,
            worldTension: 15
          },
          duration: 7
        }'''
    
    # New conflict events
    new_conflict = '''
        {
          type: "conflict",
          name: "Assassination Attempt",
          description: "An assassin targets the player character",
          effects: {
            worldTension: 10,
            combat_opportunities: ["defend_yourself", "track_assassin"],
            karma: 5
          },
          duration: 3
        },
        {
          type: "conflict",
          name: "Resource Crisis",
          description: "Critical resources become scarce across the land",
          effects: {
            worldTension: 20,
            opportunities: ["secure_resources", "help_others"],
            karma: 10
          },
          duration: 12
        },
        {
          type: "conflict",
          name: "Faction Schism",
          description: "A major faction splits into opposing groups",
          effects: {
            worldTension: 18,
            diplomatic_opportunities: ["choose_side", "mediate_conflict"],
            playerInfluence: 10
          },
          duration: 9
        }'''
    
    # New discovery events
    new_discovery = '''
        {
          type: "discovery",
          name: "Lost Technology Found",
          description: "Advanced technology from a forgotten age is discovered",
          effects: {
            exploration_opportunities: ["study_technology", "use_technology"],
            lore: 25,
            supernaturalActivity: 5
          },
          duration: 0
        },
        {
          type: "discovery",
          name: "Underground City Revealed",
          description: "A massive underground city is uncovered",
          effects: {
            exploration_opportunities: ["explore_city", "meet_inhabitants"],
            lore: 30,
            worldTension: 5
          },
          duration: 0
        },
        {
          type: "discovery",
          name: "Celestial Alignment",
          description: "Rare celestial alignment reveals hidden locations",
          effects: {
            exploration_opportunities: ["visit_locations", "gather_power"],
            supernaturalActivity: 20,
            lore: 15
          },
          duration: 0
        }'''
    
    # New event types
    new_event_types = '''
      environmental: [
        {
          type: "environmental",
          name: "Great Drought",
          description: "A severe drought affects the entire region",
          effects: {
            worldTension: 15,
            opportunities: ["find_water", "help_survivors"],
            karma: 10
          },
          duration: 14
        },
        {
          type: "environmental",
          name: "Magical Storm",
          description: "A storm of pure magic sweeps across the land",
          effects: {
            supernaturalActivity: 20,
            darkAffinity: 8,
            exploration_opportunities: ["harness_magic", "seek_shelter"]
          },
          duration: 5
        },
        {
          type: "environmental",
          name: "Season of Plenty",
          description: "An unusually bountiful season brings prosperity",
          effects: {
            worldTension: -10,
            karma: 15,
            opportunities: ["share_wealth", "build_alliances"]
          },
          duration: 10
        }
      ],
      political: [
        {
          type: "political",
          name: "New Ruler Rises",
          description: "A new ruler takes power with unknown intentions",
          effects: {
            worldTension: 12,
            diplomatic_opportunities: ["meet_ruler", "assess_threat"],
            playerInfluence: 8
          },
          duration: 15
        },
        {
          type: "political",
          name: "Treaty Signed",
          description: "Major powers sign a historic treaty",
          effects: {
            worldTension: -15,
            karma: 10,
            opportunities: ["honor_treaty", "exploit_treaty"]
          },
          duration: 20
        },
        {
          type: "political",
          name: "Corruption Exposed",
          description: "Widespread corruption is revealed in the government",
          effects: {
            worldTension: 18,
            karma: 5,
            opportunities: ["fight_corruption", "exploit_chaos"]
          },
          duration: 8
        }
      ]'''
    
    # Add new supernatural events
    content = content.replace(
        '          duration: 4\n        }\n      ],\n      conflict: [',
        '          duration: 4' + new_supernatural + '\n        }\n      ],\n      conflict: ['
    )
    
    # Add new conflict events
    content = content.replace(
        '          duration: 8\n        }\n      ],\n      discovery: [',
        '          duration: 8' + new_conflict + '\n        }\n      ],\n      discovery: ['
    )
    
    # Add new discovery events
    content = content.replace(
        '          duration: 0\n        }\n      ]\n    },',
        '          duration: 0' + new_discovery + '\n        }\n      ]' + new_event_types + '\n    },'
    )
    
    # Write back to file
    with open(file_path, 'w') as f:
        f.write(content)
    
    print("✅ Expanded world events system")
    print("  - Supernatural events: 3 new (6 total)")
    print("  - Conflict events: 3 new (6 total)")
    print("  - Discovery events: 3 new (6 total)")
    print("  - Environmental events: 3 new (new type)")
    print("  - Political events: 3 new (new type)")
    print("  - Total events: 18 (9 original + 9 new)")

if __name__ == "__main__":
    expand_world_events()