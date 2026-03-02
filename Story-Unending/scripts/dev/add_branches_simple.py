#!/usr/bin/env python3
"""
Simple script to add new branching paths
"""

def add_new_branches():
    """Add new branches to the file"""
    print("Adding new branching paths...")
    
    file_path = "js/modules/branching-narrative.js"
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Find the closing brace of the branches object
    # It's at line 1140: "    }"
    
    # New branches to add
    new_branches = '''
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
'''
    
    # Insert new branches before the closing brace
    content = content.replace(
        '    }\n  };',
        new_branches + '\n    }\n  };'
    )
    
    # Write back to file
    with open(file_path, 'w') as f:
        f.write(content)
    
    print("✅ Added 5 new major branches (branch_31 to branch_35)")
    print("✅ Added 15 new options (3 per branch)")

if __name__ == "__main__":
    add_new_branches()