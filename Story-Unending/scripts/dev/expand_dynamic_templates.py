#!/usr/bin/env python3
"""
Script to expand dynamic content templates
"""

def expand_templates():
    """Expand dynamic content templates"""
    print("Expanding dynamic content templates...")
    
    file_path = "js/modules/dynamic-content.js"
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # New templates to add
    new_combat_templates = [
        '"The [ENEMY]\'s [FEATURE] [ACTION] with [INTENSITY]. [REACTION]"',
        '"[ENVIRONMENT] twisted as the [ENEMY] [ACTION]. [REACTION]"',
        '"My [STAT] surged as the [ENEMY] [ACTION]. [REACTION]"',
        '"The [ENEMY] [ACTION] through the [ENVIRONMENT]. [REACTION]"',
        '"Ancient power [ACTION] as the [ENEMY] [ACTION]. [REACTION]"',
        '"The [ENEMY]\'s [FEATURE] glowed with [INTENSITY]. [REACTION]"',
        '"[ENVIRONMENT] shattered as the [ENEMY] [ACTION]. [REACTION]"',
        '"My [STAT] warned me as the [ENEMY] [ACTION]. [REACTION]"'
    ]
    
    new_exploration_templates = [
        '"The [LOCATION] [ACTION] with [DISCOVERY]. [ATMOSPHERE]"',
        '"[ENVIRONMENT] [ACTION] as I [ACTION]. [REACTION]"',
        '"Ancient [FEATURE] [ACTION] through the [LOCATION]. [ATMOSPHERE]"',
        '"The path [ACTION] to [DISCOVERY]. [REACTION]"',
        '"Hidden [FEATURE] [ACTION] in the [LOCATION]. [ATMOSPHERE]"',
        '"The [LOCATION] [ACTION] [DISCOVERY] within its depths. [REACTION]"',
        '"[ENVIRONMENT] [ACTION] through the [LOCATION], revealing [DISCOVERY]. [ATMOSPHERE]"',
        '"The [LOCATION] [ACTION] of [DISCOVERY]. [REACTION]"'
    ]
    
    new_dialogue_templates = [
        '"[CHARACTER]\'s [FEATURE] [ACTION] with [INTENSITY]. [RESPONSE]"',
        '"The [CHARACTER] [EMOTION] as their [FEATURE] [ACTION]. [DIALOGUE]"',
        '"[CHARACTER] [ACTION] with [TONE] in their voice. [RESPONSE]"',
        '"The [CHARACTER]\'s [FEATURE] [ACTION] as they [EMOTION]. [DIALOGUE]"',
        '"[CHARACTER]\'s [FEATURE] [ACTION] with [INTENSITY]. [RESPONSE]"',
        '"The [CHARACTER] [EMOTION] before their [FEATURE] [ACTION]. [DIALOGUE]"',
        '"[CHARACTER] [ACTION] as [EMOTION] [ACTION] through them. [RESPONSE]"',
        '"The [CHARACTER]\'s [FEATURE] [ACTION] with [TONE]. [DIALOGUE]"'
    ]
    
    new_introspection_templates = [
        '"The [EMOTION] [ACTION] through me as I [ACTION]. [THOUGHT]"',
        '"[MEMORY] [ACTION] unbidden from the depths. [THOUGHT]"',
        '"The [ENVIRONMENT] [ACTION] me of [MEMORY]. [THOUGHT]"',
        '"I found myself [ACTION] as [EMOTION] [ACTION] hold. [THOUGHT]"',
        '"The [ENVIRONMENT] of the [LOCATION] allowed [MEMORY] to [ACTION]. [THOUGHT]"',
        '"[EMOTION] [ACTION] through my [STAT] as I [ACTION]. [THOUGHT]"',
        '"The [ENVIRONMENT] seemed to [ACTION] to my [STAT]. [THOUGHT]"',
        '"I couldn\'t shake the feeling that [MEMORY] [ACTION]. [THOUGHT]"'
    ]
    
    # Find and replace combat templates
    combat_pattern = r'(combat: \[[^\]]+\],)'
    combat_replacement = 'combat: [\n        ' + ',\n        '.join(new_combat_templates) + '\n      ],'
    import re
    content = re.sub(combat_pattern, combat_replacement, content, count=1)
    
    # Find and replace exploration templates
    exploration_pattern = r'(exploration: \[[^\]]+\],)'
    exploration_replacement = 'exploration: [\n        ' + ',\n        '.join(new_exploration_templates) + '\n      ],'
    content = re.sub(exploration_pattern, exploration_replacement, content, count=1)
    
    # Find and replace dialogue templates
    dialogue_pattern = r'(dialogue: \[[^\]]+\],)'
    dialogue_replacement = 'dialogue: [\n        ' + ',\n        '.join(new_dialogue_templates) + '\n      ],'
    content = re.sub(dialogue_pattern, dialogue_replacement, content, count=1)
    
    # Find and replace introspection templates
    introspection_pattern = r'(introspection: \[[^\]]+\])'
    introspection_replacement = 'introspection: [\n        ' + ',\n        '.join(new_introspection_templates) + '\n      ]'
    content = re.sub(introspection_pattern, introspection_replacement, content, count=1)
    
    # Write back to file
    with open(file_path, 'w') as f:
        f.write(content)
    
    print("✅ Expanded dynamic content templates")
    print("  - Combat templates: 8 new")
    print("  - Exploration templates: 8 new")
    print("  - Dialogue templates: 8 new")
    print("  - Introspection templates: 8 new")
    print("  - Total: 32 new templates")

if __name__ == "__main__":
    expand_templates()