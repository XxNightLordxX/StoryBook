#!/usr/bin/env python3
"""
Simple script to add new dynamic content templates
"""

def add_new_templates():
    """Add new templates to the file"""
    print("Adding new dynamic content templates...")
    
    file_path = "js/modules/dynamic-content.js"
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # New combat templates to add
    new_combat = '''
        "The [ENEMY]\'s [FEATURE] [ACTION] with [INTENSITY]. [REACTION]",
        "[ENVIRONMENT] twisted as the [ENEMY] [ACTION]. [REACTION]",
        "My [STAT] surged as the [ENEMY] [ACTION]. [REACTION]",
        "The [ENEMY] [ACTION] through the [ENVIRONMENT]. [REACTION]",
        "Ancient power [ACTION] as the [ENEMY] [ACTION]. [REACTION]",
        "The [ENEMY]\'s [FEATURE] glowed with [INTENSITY]. [REACTION]",
        "[ENVIRONMENT] shattered as the [ENEMY] [ACTION]. [REACTION]",
        "My [STAT] warned me as the [ENEMY] [ACTION]. [REACTION]"'''
    
    # New exploration templates to add
    new_exploration = '''
        "The [LOCATION] [ACTION] with [DISCOVERY]. [ATMOSPHERE]",
        "[ENVIRONMENT] [ACTION] as I [ACTION]. [REACTION]",
        "Ancient [FEATURE] [ACTION] through the [LOCATION]. [ATMOSPHERE]",
        "The path [ACTION] to [DISCOVERY]. [REACTION]",
        "Hidden [FEATURE] [ACTION] in the [LOCATION]. [ATMOSPHERE]",
        "The [LOCATION] [ACTION] [DISCOVERY] within its depths. [REACTION]",
        "[ENVIRONMENT] [ACTION] through the [LOCATION], revealing [DISCOVERY]. [ATMOSPHERE]",
        "The [LOCATION] [ACTION] of [DISCOVERY]. [REACTION]"'''
    
    # New dialogue templates to add
    new_dialogue = '''
        "[CHARACTER]\'s [FEATURE] [ACTION] with [INTENSITY]. [RESPONSE]",
        "The [CHARACTER] [EMOTION] as their [FEATURE] [ACTION]. [DIALOGUE]",
        "[CHARACTER] [ACTION] with [TONE] in their voice. [RESPONSE]",
        "The [CHARACTER]\'s [FEATURE] [ACTION] as they [EMOTION]. [DIALOGUE]",
        "[CHARACTER]\'s [FEATURE] [ACTION] with [INTENSITY]. [RESPONSE]",
        "The [CHARACTER] [EMOTION] before their [FEATURE] [ACTION]. [DIALOGUE]",
        "[CHARACTER] [ACTION] as [EMOTION] [ACTION] through them. [RESPONSE]",
        "The [CHARACTER]\'s [FEATURE] [ACTION] with [TONE]. [DIALOGUE]"'''
    
    # New introspection templates to add
    new_introspection = '''
        "The [EMOTION] [ACTION] through me as I [ACTION]. [THOUGHT]",
        "[MEMORY] [ACTION] unbidden from the depths. [THOUGHT]",
        "The [ENVIRONMENT] [ACTION] me of [MEMORY]. [THOUGHT]",
        "I found myself [ACTION] as [EMOTION] [ACTION] hold. [THOUGHT]",
        "The [ENVIRONMENT] of the [LOCATION] allowed [MEMORY] to [ACTION]. [THOUGHT]",
        "[EMOTION] [ACTION] through my [STAT] as I [ACTION]. [THOUGHT]",
        "The [ENVIRONMENT] seemed to [ACTION] to my [STAT]. [THOUGHT]",
        "I couldn\'t shake the feeling that [MEMORY] [ACTION]. [THOUGHT]"'''
    
    # Add new combat templates
    content = content.replace(
        '"The ground trembled beneath us as the [ENEMY] [ACTION]. [REACTION]"',
        '"The ground trembled beneath us as the [ENEMY] [ACTION]. [REACTION]",' + new_combat
    )
    
    # Add new exploration templates
    content = content.replace(
        '"The [LOCATION] whispered of [DISCOVERY]. [REACTION]"',
        '"The [LOCATION] whispered of [DISCOVERY]. [REACTION]",' + new_exploration
    )
    
    # Add new dialogue templates
    content = content.replace(
        '"The [CHARACTER]\'s [FEATURE] hardened as they [ACTION]. [DIALOGUE]"',
        '"The [CHARACTER]\'s [FEATURE] hardened as they [ACTION]. [DIALOGUE]",' + new_dialogue
    )
    
    # Add new introspection templates
    content = content.replace(
        '"I couldn\'t shake the feeling that [MEMORY]. [THOUGHT]"',
        '"I couldn\'t shake the feeling that [MEMORY]. [THOUGHT]",' + new_introspection
    )
    
    # Write back to file
    with open(file_path, 'w') as f:
        f.write(content)
    
    print("✅ Added 32 new dynamic content templates")
    print("  - Combat templates: 8 new")
    print("  - Exploration templates: 8 new")
    print("  - Dialogue templates: 8 new")
    print("  - Introspection templates: 8 new")

if __name__ == "__main__":
    add_new_templates()