#!/usr/bin/env python3
"""
Script to expand character states system
"""

def expand_character_states():
    """Expand character states with new characters and enhanced states"""
    print("Expanding character states system...")
    
    file_path = "js/modules/dynamic-content.js"
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # New characters to add
    new_characters = '''
      Sera: {
        trust: 35,
        friendship: 25,
        romance: 0,
        loyalty: 30,
        flags: [],
        memories: [],
        personality: "mysterious and enigmatic"
      },
      Lin: {
        trust: 40,
        friendship: 30,
        romance: 0,
        loyalty: 35,
        flags: [],
        memories: [],
        personality: "wise and patient"
      },
      Vance: {
        trust: 25,
        friendship: 15,
        romance: 0,
        loyalty: 20,
        flags: [],
        memories: [],
        personality: "ambitious and ruthless"
      },
      Elara: {
        trust: 45,
        friendship: 40,
        romance: 0,
        loyalty: 45,
        flags: [],
        memories: [],
        personality: "noble and compassionate"
      }'''
    
    # Find where to insert new characters (after Nyx)
    content = content.replace(
        '      Nyx: {',
        new_characters + ',\n      Nyx: {'
    )
    
    # Write back to file
    with open(file_path, 'w') as f:
        f.write(content)
    
    print("✅ Added 4 new characters")
    print("  - Sera: mysterious and enigmatic")
    print("  - Lin: wise and patient")
    print("  - Vance: ambitious and ruthless")
    print("  - Elara: noble and compassionate")

if __name__ == "__main__":
    expand_character_states()