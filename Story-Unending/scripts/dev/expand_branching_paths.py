#!/usr/bin/env python3
"""
Script to expand branching narrative paths with new branches and options
"""

import re
import json

def analyze_current_branches():
    """Analyze current branching system"""
    print("Analyzing current branching system...")
    
    file_path = "js/modules/branching-narrative.js"
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Count major branches
    major_branches = len(re.findall(r'branch_\d+:\s*\{', content))
    
    # Count minor branches
    minor_branches = len(re.findall(r'minor_branch_\d+:\s*\{', content))
    
    # Count total options
    options = len(re.findall(r'id:\s*"option_\d+"', content))
    
    print(f"Current State:")
    print(f"  - Major branches: {major_branches}")
    print(f"  - Minor branches: {minor_branches}")
    print(f"  - Total branches: {major_branches + minor_branches}")
    print(f"  - Total options: {options}")
    
    return {
        'major': major_branches,
        'minor': minor_branches,
        'total': major_branches + minor_branches,
        'options': options
    }

def generate_new_branches():
    """Generate new branching paths"""
    print("\nGenerating new branching paths...")
    
    new_branches = {
        # New major branches
        'branch_11': {
            'id': 'branch_11',
            'name': 'VR World Discovery',
            'chapter': 140,
            'type': 'major',
            'category': 'exploration',
            'description': 'Kael discovers a hidden region in the VR world',
            'options': [
                {
                    'id': 'option_1',
                    'text': 'Explore cautiously - Take time to understand the new region',
                    'consequences': {
                        'statChanges': {'instinct': 5, 'willpower': 5},
                        'relationshipChanges': {},
                        'unlocks': ['cautious_explorer_path'],
                        'locks': [],
                        'flags': ['cautious_explorer']
                    }
                },
                {
                    'id': 'option_2',
                    'text': 'Dive in headfirst - Rush into the new region immediately',
                    'consequences': {
                        'statChanges': {'bloodlust': 5, 'presence': 5},
                        'relationshipChanges': {},
                        'unlocks': ['bold_explorer_path'],
                        'locks': [],
                        'flags': ['bold_explorer']
                    }
                },
                {
                    'id': 'option_3',
                    'text': 'Gather allies - Bring companions to explore together',
                    'consequences': {
                        'statChanges': {'presence': 10},
                        'relationshipChanges': {'Mira': 5, 'Dex': 5},
                        'unlocks': ['team_explorer_path'],
                        'locks': [],
                        'flags': ['team_explorer']
                    }
                }
            ]
        },
        'branch_12': {
            'id': 'branch_12',
            'name': 'Ancient Secret Uncovered',
            'chapter': 155,
            'type': 'major',
            'category': 'mystery',
            'description': 'Kael uncovers an ancient secret about the VR world',
            'options': [
                {
                    'id': 'option_1',
                    'text': 'Share the secret - Reveal the truth to others',
                    'consequences': {
                        'statChanges': {'karma': 10, 'presence': 5},
                        'relationshipChanges': {'Mira': 10, 'Yuki': 5},
                        'unlocks': ['truth_seeker_path'],
                        'locks': [],
                        'flags': ['truth_seeker']
                    }
                },
                {
                    'id': 'option_2',
                    'text': 'Keep it hidden - Protect the secret at all costs',
                    'consequences': {
                        'statChanges': {'instinct': 10, 'karma': -5},
                        'relationshipChanges': {},
                        'unlocks': ['secret_guardian_path'],
                        'locks': [],
                        'flags': ['secret_guardian']
                    }
                },
                {
                    'id': 'option_3',
                    'text': 'Use the secret - Leverage the secret for personal gain',
                    'consequences': {
                        'statChanges': {'bloodlust': 10, 'karma': -10},
                        'relationshipChanges': {},
                        'unlocks': ['opportunist_path'],
                        'locks': [],
                        'flags': ['opportunist']
                    }
                }
            ]
        },
        'branch_13': {
            'id': 'branch_13',
            'name': 'Ultimate Sacrifice',
            'chapter': 170,
            'type': 'major',
            'category': 'moral',
            'description': 'Kael faces a choice that requires ultimate sacrifice',
            'options': [
                {
                    'id': 'option_1',
                    'text': 'Sacrifice yourself - Give up everything for others',
                    'consequences': {
                        'statChanges': {'karma': 20, 'willpower': 10},
                        'relationshipChanges': {'Mira': 15, 'Yuna': 20},
                        'unlocks': ['selfless_path'],
                        'locks': [],
                        'flags': ['selfless']
                    }
                },
                {
                    'id': 'option_2',
                    'text': 'Sacrifice others - Choose survival over others',
                    'consequences': {
                        'statChanges': {'karma': -20, 'bloodlust': 10},
                        'relationshipChanges': {'Mira': -20, 'Yuna': -20},
                        'unlocks': ['selfish_path'],
                        'locks': [],
                        'flags': ['selfish']
                    }
                },
                {
                    'id': 'option_3',
                    'text': 'Find another way - Seek a third option',
                    'consequences': {
                        'statChanges': {'instinct': 10, 'willpower': 5},
                        'relationshipChanges': {},
                        'unlocks': ['creative_path'],
                        'locks': [],
                        'flags': ['creative_solution']
                    }
                }
            ]
        },
        'branch_14': {
            'id': 'branch_14',
            'name': 'VR World Destiny',
            'chapter': 185,
            'type': 'major',
            'category': 'destiny',
            'description': 'Kael must choose the ultimate fate of the VR world',
            'options': [
                {
                    'id': 'option_1',
                    'text': 'Preserve the VR world - Protect it from destruction',
                    'consequences': {
                        'statChanges': {'karma': 15, 'willpower': 10},
                        'relationshipChanges': {'Mira': 10, 'Dex': 10},
                        'unlocks': ['preserver_path'],
                        'locks': [],
                        'flags': ['world_preserver']
                    }
                },
                {
                    'id': 'option_2',
                    'text': 'Destroy the VR world - End the illusion forever',
                    'consequences': {
                        'statChanges': {'karma': -10, 'bloodlust': 15},
                        'relationshipChanges': {'Mira': -10, 'Dex': -10},
                        'unlocks': ['destroyer_path'],
                        'locks': [],
                        'flags': ['world_destroyer']
                    }
                },
                {
                    'id': 'option_3',
                    'text': 'Transform the VR world - Evolve it into something new',
                    'consequences': {
                        'statChanges': {'instinct': 15, 'presence': 10},
                        'relationshipChanges': {},
                        'unlocks': ['transformer_path'],
                        'locks': [],
                        'flags': ['world_transformer']
                    }
                }
            ]
        },
        'branch_15': {
            'id': 'branch_15',
            'name': 'Final Resolution',
            'chapter': 200,
            'type': 'major',
            'category': 'resolution',
            'description': 'Kael faces the final resolution of his journey',
            'options': [
                {
                    'id': 'option_1',
                    'text': 'Return to reality - Accept the real world and move forward',
                    'consequences': {
                        'statChanges': {'karma': 10, 'willpower': 15},
                        'relationshipChanges': {'Yuna': 20},
                        'unlocks': ['reality_acceptance_path'],
                        'locks': [],
                        'flags': ['reality_accepted']
                    }
                },
                {
                    'id': 'option_2',
                    'text': 'Embrace the VR world - Choose to live in the virtual realm',
                    'consequences': {
                        'statChanges': {'darkAffinity': 15, 'presence': 10},
                        'relationshipChanges': {'Mira': 10},
                        'unlocks': ['vr_embrace_path'],
                        'locks': [],
                        'flags': ['vr_embraced']
                    }
                },
                {
                    'id': 'option_3',
                    'text': 'Find balance - Create harmony between both worlds',
                    'consequences': {
                        'statChanges': {'instinct': 10, 'karma': 10},
                        'relationshipChanges': {'Mira': 10, 'Yuna': 10},
                        'unlocks': ['balance_path'],
                        'locks': [],
                        'flags': ['balance_found']
                    }
                }
            ]
        }
    }
    
    # New minor branches
    new_minor_branches = {
        'minor_branch_21': {
            'id': 'minor_branch_21',
            'name': 'Combat Style Choice',
            'chapter': 45,
            'type': 'minor',
            'category': 'combat',
            'description': 'Choose combat style in VR battle',
            'options': [
                {
                    'id': 'option_1',
                    'text': 'Aggressive - Attack with full force',
                    'consequences': {
                        'statChanges': {'bloodlust': 5, 'presence': 5},
                        'relationshipChanges': {},
                        'unlocks': ['aggressive_combat'],
                        'locks': [],
                        'flags': ['aggressive_fighter']
                    }
                },
                {
                    'id': 'option_2',
                    'text': 'Defensive - Focus on protection and counter',
                    'consequences': {
                        'statChanges': {'willpower': 5, 'instinct': 5},
                        'relationshipChanges': {},
                        'unlocks': ['defensive_combat'],
                        'locks': [],
                        'flags': ['defensive_fighter']
                    }
                }
            ]
        },
        'minor_branch_22': {
            'id': 'minor_branch_22',
            'name': 'Dialogue Approach',
            'chapter': 60,
            'type': 'minor',
            'category': 'dialogue',
            'description': 'Choose approach in important conversation',
            'options': [
                {
                    'id': 'option_1',
                    'text': 'Diplomatic - Use persuasion and reason',
                    'consequences': {
                        'statChanges': {'presence': 5, 'karma': 5},
                        'relationshipChanges': {},
                        'unlocks': ['diplomatic_approach'],
                        'locks': [],
                        'flags': ['diplomatic']
                    }
                },
                {
                    'id': 'option_2',
                    'text': 'Direct - Speak honestly and bluntly',
                    'consequences': {
                        'statChanges': {'instinct': 5, 'presence': 5},
                        'relationshipChanges': {},
                        'unlocks': ['direct_approach'],
                        'locks': [],
                        'flags': ['direct_speaker']
                    }
                },
                {
                    'id': 'option_3',
                    'text': 'Deceptive - Use manipulation and lies',
                    'consequences': {
                        'statChanges': {'instinct': 5, 'karma': -5},
                        'relationshipChanges': {},
                        'unlocks': ['deceptive_approach'],
                        'locks': [],
                        'flags': ['deceptive']
                    }
                }
            ]
        },
        'minor_branch_23': {
            'id': 'minor_branch_23',
            'name': 'Resource Allocation',
            'chapter': 75,
            'type': 'minor',
            'category': 'resource',
            'description': 'Decide how to allocate limited resources',
            'options': [
                {
                    'id': 'option_1',
                    'text': 'Share resources - Distribute to all allies',
                    'consequences': {
                        'statChanges': {'karma': 10},
                        'relationshipChanges': {'Mira': 5, 'Dex': 5},
                        'unlocks': ['generous_allocation'],
                        'locks': [],
                        'flags': ['generous']
                    }
                },
                {
                    'id': 'option_2',
                    'text': 'Keep resources - Hoard for personal use',
                    'consequences': {
                        'statChanges': {'karma': -10, 'instinct': 5},
                        'relationshipChanges': {},
                        'unlocks': ['selfish_allocation'],
                        'locks': [],
                        'flags': ['selfish']
                    }
                }
            ]
        },
        'minor_branch_24': {
            'id': 'minor_branch_24',
            'name': 'Risk Assessment',
            'chapter': 90,
            'type': 'minor',
            'category': 'risk',
            'description': 'Choose risk level in dangerous situation',
            'options': [
                {
                    'id': 'option_1',
                    'text': 'High risk - Take dangerous path for greater reward',
                    'consequences': {
                        'statChanges': {'bloodlust': 5, 'instinct': 5},
                        'relationshipChanges': {},
                        'unlocks': ['high_risk_path'],
                        'locks': [],
                        'flags': ['risk_taker']
                    }
                },
                {
                    'id': 'option_2',
                    'text': 'Low risk - Choose safe path with modest reward',
                    'consequences': {
                        'statChanges': {'willpower': 5, 'instinct': 5},
                        'relationshipChanges': {},
                        'unlocks': ['low_risk_path'],
                        'locks': [],
                        'flags': ['risk_averse']
                    }
                }
            ]
        },
        'minor_branch_25': {
            'id': 'minor_branch_25',
            'name': 'Moral Dilemma',
            'chapter': 105,
            'type': 'minor',
            'category': 'moral',
            'description': 'Face a difficult moral choice',
            'options': [
                {
                    'id': 'option_1',
                    'text': 'Help the weak - Assist those in need',
                    'consequences': {
                        'statChanges': {'karma': 10, 'willpower': 5},
                        'relationshipChanges': {},
                        'unlocks': ['helper_path'],
                        'locks': [],
                        'flags': ['helpful']
                    }
                },
                {
                    'id': 'option_2',
                    'text': 'Ignore the weak - Focus on personal goals',
                    'consequences': {
                        'statChanges': {'karma': -10, 'instinct': 5},
                        'relationshipChanges': {},
                        'unlocks': ['selfish_path'],
                        'locks': [],
                        'flags': ['selfish']
                    }
                }
            ]
        }
    }
    
    return new_branches, new_minor_branches

def format_branch_as_js(branch_data, indent=6):
    """Format branch data as JavaScript"""
    indent_str = ' ' * indent
    js_lines = []
    
    js_lines.append(indent_str + '{')
    js_lines.append(indent_str + '  id: "' + branch_data["id"] + '",')
    js_lines.append(indent_str + '  name: "' + branch_data["name"] + '",')
    js_lines.append(indent_str + '  chapter: ' + str(branch_data["chapter"]) + ',')
    js_lines.append(indent_str + '  type: "' + branch_data["type"] + '",')
    js_lines.append(indent_str + '  category: "' + branch_data["category"] + '",')
    js_lines.append(indent_str + '  description: "' + branch_data["description"] + '",')
    js_lines.append(indent_str + '  options: [')
    
    for option in branch_data['options']:
        js_lines.append(indent_str + '  {')
        js_lines.append(indent_str + '    id: "' + option["id"] + '",')
        js_lines.append(indent_str + '    text: "' + option["text"] + '",')
        js_lines.append(indent_str + '    consequences: {')
        js_lines.append(indent_str + '      statChanges: {')
        
        for stat, value in option['consequences']['statChanges'].items():
            js_lines.append(indent_str + '        ' + stat + ': ' + str(value) + ',')
        
        js_lines.append(indent_str + '      },')
        js_lines.append(indent_str + '      relationshipChanges: {')
        
        for char, value in option['consequences']['relationshipChanges'].items():
            js_lines.append(indent_str + '        ' + char + ': ' + str(value) + ',')
        
        js_lines.append(indent_str + '      },')
        js_lines.append(indent_str + '      unlocks: ' + str(option["consequences"]["unlocks"]) + ',')
        js_lines.append(indent_str + '      locks: ' + str(option["consequences"]["locks"]) + ',')
        js_lines.append(indent_str + '      flags: ' + str(option["consequences"]["flags"]))
        js_lines.append(indent_str + '    }')
        js_lines.append(indent_str + '  },')
    
    js_lines.append(indent_str + ']')
    js_lines.append(indent_str + '}')
    
    return '\n'.join(js_lines)

def add_branches_to_file():
    """Add new branches to branching-narrative.js"""
    print("\nAdding new branches to file...")
    
    file_path = "js/modules/branching-narrative.js"
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Generate new branches
    new_major_branches, new_minor_branches = generate_new_branches()
    
    # Find where to insert new major branches
    major_branches_pattern = r'(branch_10:\s*\{[^}]+\}\s*\}\s*,\s*\n\s*\}\s*,\s*\n\s*// Minor branches)'
    
    new_major_js = ''
    for branch_id, branch_data in new_major_branches.items():
        new_major_js += '      ' + branch_id + ':\n'
        new_major_js += format_branch_as_js(branch_data, 6)
        new_major_js += ',\n'
    
    # Insert new major branches
    content = re.sub(
        major_branches_pattern,
        lambda m: m.group(0).replace('// Minor branches', new_major_js + '\n      // Minor branches'),
        content,
        flags=re.DOTALL
    )
    
    # Find where to insert new minor branches
    minor_branches_pattern = r'(minor_branch_20:\s*\{[^}]+\}\s*\}\s*,\s*\n\s*\}\s*,\s*\n\s*// Branch functions)'
    
    new_minor_js = ''
    for branch_id, branch_data in new_minor_branches.items():
        new_minor_js += '      ' + branch_id + ':\n'
        new_minor_js += format_branch_as_js(branch_data, 6)
        new_minor_js += ',\n'
    
    # Insert new minor branches
    content = re.sub(
        minor_branches_pattern,
        lambda m: m.group(0).replace('// Branch functions', new_minor_js + '\n      // Branch functions'),
        content,
        flags=re.DOTALL
    )
    
    # Write back to file
    with open(file_path, 'w') as f:
        f.write(content)
    
    print("✅ New branches added successfully")

def main():
    """Main function"""
    print("=" * 60)
    print("Branching Narrative Expansion Script")
    print("=" * 60)
    
    # Analyze current state
    current_state = analyze_current_branches()
    
    # Generate and add new branches
    add_branches_to_file()
    
    # Analyze new state
    print("\nAnalyzing new state...")
    new_state = analyze_current_branches()
    
    # Calculate improvements
    print("\n" + "=" * 60)
    print("Expansion Summary")
    print("=" * 60)
    print("Major branches: " + str(current_state['major']) + " → " + str(new_state['major']) + " (+" + str(new_state['major'] - current_state['major']) + ")")
    print("Minor branches: " + str(current_state['minor']) + " → " + str(new_state['minor']) + " (+" + str(new_state['minor'] - current_state['minor']) + ")")
    print("Total branches: " + str(current_state['total']) + " → " + str(new_state['total']) + " (+" + str(new_state['total'] - current_state['total']) + ")")
    print("Total options: " + str(current_state['options']) + " → " + str(new_state['options']) + " (+" + str(new_state['options'] - current_state['options']) + ")")
    print("=" * 60)
    print("\n✅ Branching narrative expansion complete!")

if __name__ == "__main__":
    main()