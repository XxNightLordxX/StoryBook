#!/usr/bin/env python3
"""
Proper script to add new dynamic content templates
"""

def add_new_templates():
    """Add new templates to the file"""
    print("Adding new dynamic content templates...")
    
    file_path = "js/modules/dynamic-content.js"
    
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    # Find the line numbers for each template section
    combat_end = -1
    exploration_end = -1
    dialogue_end = -1
    introspection_end = -1
    
    for i, line in enumerate(lines):
        if 'combat: [' in line:
            combat_start = i
        if 'exploration: [' in line:
            exploration_start = i
            combat_end = i - 1
        if 'dialogue: [' in line:
            dialogue_start = i
            exploration_end = i - 1
        if 'introspection: [' in line:
            introspection_start = i
            dialogue_end = i - 1
    
    # Find introspection end
    for i in range(introspection_start, len(lines)):
        if lines[i].strip() == '],':
            introspection_end = i
            break
    
    # New templates
    new_combat = [
        '        "The [ENEMY]\'s [FEATURE] [ACTION] with [INTENSITY]. [REACTION]",\n',
        '        "[ENVIRONMENT] twisted as the [ENEMY] [ACTION]. [REACTION]",\n',
        '        "My [STAT] surged as the [ENEMY] [ACTION]. [REACTION]",\n',
        '        "The [ENEMY] [ACTION] through the [ENVIRONMENT]. [REACTION]",\n',
        '        "Ancient power [ACTION] as the [ENEMY] [ACTION]. [REACTION]",\n',
        '        "The [ENEMY]\'s [FEATURE] glowed with [INTENSITY]. [REACTION]",\n',
        '        "[ENVIRONMENT] shattered as the [ENEMY] [ACTION]. [REACTION]",\n',
        '        "My [STAT] warned me as the [ENEMY] [ACTION]. [REACTION]"\n'
    ]
    
    new_exploration = [
        '        "The [LOCATION] [ACTION] with [DISCOVERY]. [ATMOSPHERE]",\n',
        '        "[ENVIRONMENT] [ACTION] as I [ACTION]. [REACTION]",\n',
        '        "Ancient [FEATURE] [ACTION] through the [LOCATION]. [ATMOSPHERE]",\n',
        '        "The path [ACTION] to [DISCOVERY]. [REACTION]",\n',
        '        "Hidden [FEATURE] [ACTION] in the [LOCATION]. [ATMOSPHERE]",\n',
        '        "The [LOCATION] [ACTION] [DISCOVERY] within its depths. [REACTION]",\n',
        '        "[ENVIRONMENT] [ACTION] through the [LOCATION], revealing [DISCOVERY]. [ATMOSPHERE]",\n',
        '        "The [LOCATION] [ACTION] of [DISCOVERY]. [REACTION]"\n'
    ]
    
    new_dialogue = [
        '        "[CHARACTER]\'s [FEATURE] [ACTION] with [INTENSITY]. [RESPONSE]",\n',
        '        "The [CHARACTER] [EMOTION] as their [FEATURE] [ACTION]. [DIALOGUE]",\n',
        '        "[CHARACTER] [ACTION] with [TONE] in their voice. [RESPONSE]",\n',
        '        "The [CHARACTER]\'s [FEATURE] [ACTION] as they [EMOTION]. [DIALOGUE]",\n',
        '        "[CHARACTER]\'s [FEATURE] [ACTION] with [INTENSITY]. [RESPONSE]",\n',
        '        "The [CHARACTER] [EMOTION] before their [FEATURE] [ACTION]. [DIALOGUE]",\n',
        '        "[CHARACTER] [ACTION] as [EMOTION] [ACTION] through them. [RESPONSE]",\n',
        '        "The [CHARACTER]\'s [FEATURE] [ACTION] with [TONE]. [DIALOGUE]"\n'
    ]
    
    new_introspection = [
        '        "The [EMOTION] [ACTION] through me as I [ACTION]. [THOUGHT]",\n',
        '        "[MEMORY] [ACTION] unbidden from the depths. [THOUGHT]",\n',
        '        "The [ENVIRONMENT] [ACTION] me of [MEMORY]. [THOUGHT]",\n',
        '        "I found myself [ACTION] as [EMOTION] [ACTION] hold. [THOUGHT]",\n',
        '        "The [ENVIRONMENT] of the [LOCATION] allowed [MEMORY] to [ACTION]. [THOUGHT]",\n',
        '        "[EMOTION] [ACTION] through my [STAT] as I [ACTION]. [THOUGHT]",\n',
        '        "The [ENVIRONMENT] seemed to [ACTION] to my [STAT]. [THOUGHT]",\n',
        '        "I couldn\'t shake the feeling that [MEMORY] [ACTION]. [THOUGHT]"\n'
    ]
    
    # Insert new templates
    lines[combat_end:combat_end] = new_combat
    exploration_end += len(new_combat)
    dialogue_start += len(new_combat)
    introspection_start += len(new_combat)
    
    lines[exploration_end:exploration_end] = new_exploration
    dialogue_end += len(new_exploration)
    introspection_start += len(new_exploration)
    
    lines[dialogue_end:dialogue_end] = new_dialogue
    introspection_start += len(new_dialogue)
    
    lines[introspection_end:introspection_end] = new_introspection
    
    # Write back to file
    with open(file_path, 'w') as f:
        f.writelines(lines)
    
    print("✅ Added 32 new dynamic content templates")
    print("  - Combat templates: 8 new")
    print("  - Exploration templates: 8 new")
    print("  - Dialogue templates: 8 new")
    print("  - Introspection templates: 8 new")

if __name__ == "__main__":
    add_new_templates()