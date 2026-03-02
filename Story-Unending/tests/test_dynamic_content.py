#!/usr/bin/env python3
"""
Test script to verify dynamic content generation system
"""

import re

def test_dynamic_content():
    """Test that the dynamic content generation system is properly implemented"""
    
    with open('js/modules/dynamic-content.js', 'r') as f:
        content = f.read()
    
    print("Testing Dynamic Content Generation System...")
    print("=" * 60)
    
    # Test 1: Check that the module exists and is properly structured
    print("\n1. Testing module structure...")
    if 'const DynamicContent = (() => {' in content:
        print("   ✓ DynamicContent module found")
    else:
        print("   ✗ DynamicContent module not found")
        return False
    
    # Test 2: Check for procedural generation system
    print("\n2. Testing procedural generation system...")
    if 'const proceduralGenerator = {' in content:
        print("   ✓ Procedural generator found")
    else:
        print("   ✗ Procedural generator not found")
        return False
    
    # Test 3: Check for paragraph templates
    print("\n3. Testing paragraph templates...")
    template_types = ['combat', 'exploration', 'dialogue', 'introspection']
    for template_type in template_types:
        if '{}: ['.format(template_type) in content:
            print("   ✓ {} templates found".format(template_type))
        else:
            print("   ✗ {} templates not found".format(template_type))
            return False
    
    # Test 4: Check for placeholders
    print("\n4. Testing placeholders...")
    placeholder_count = content.count('ENEMY:') + content.count('ACTION:') + content.count('LOCATION:')
    if placeholder_count >= 3:
        print(f"   ✓ Placeholders found: {placeholder_count} types")
    else:
        print("   ✗ Insufficient placeholders")
        return False
    
    # Test 5: Check for character development system
    print("\n5. Testing character development system...")
    if 'const characterDevelopment = {' in content:
        print("   ✓ Character development system found")
    else:
        print("   ✗ Character development system not found")
        return False
    
    # Test 6: Check for character states
    print("\n6. Testing character states...")
    # Count character names in characterStates
    character_names = ['Mira', 'Dex', 'Yuki', 'Rook', 'Soren', 'Nyx', 'Sera', 'Lin']
    character_count = sum(1 for name in character_names if name + ':' in content)
    if character_count >= 8:
        print("   ✓ Character states found: {} characters".format(character_count))
    else:
        print("   ✗ Insufficient character states")
        return False
    
    # Test 7: Check for world events system
    print("\n7. Testing world events system...")
    if 'const worldEvents = {' in content:
        print("   ✓ World events system found")
    else:
        print("   ✗ World events system not found")
        return False
    
    # Test 8: Check for world event templates
    print("\n8. Testing world event templates...")
    event_types = ['supernatural', 'conflict', 'discovery']
    for event_type in event_types:
        if '{}: ['.format(event_type) in content:
            print("   ✓ {} events found".format(event_type))
        else:
            print("   ✗ {} events not found".format(event_type))
            return False
    
    # Test 9: Check for quest generation system
    print("\n9. Testing quest generation system...")
    if 'const questGenerator = {' in content:
        print("   ✓ Quest generator found")
    else:
        print("   ✗ Quest generator not found")
        return False
    
    # Test 10: Check for quest templates
    print("\n10. Testing quest templates...")
    quest_types = ['fetch', 'combat', 'exploration', 'investigation']
    for quest_type in quest_types:
        if '{}: {{'.format(quest_type) in content:
            print("   ✓ {} quest template found".format(quest_type))
        else:
            print("   ✗ {} quest template not found".format(quest_type))
            return False
    
    # Test 11: Check for core functions
    print("\n11. Testing core functions...")
    core_functions = [
        'generateParagraph',
        'generateParagraphs',
        'updateCharacterState',
        'generateCharacterDialogue',
        'getCharacterState',
        'getAllCharacterStates',
        'updateWorldState',
        'generateWorldEvent',
        'getWorldState',
        'generateQuest'
    ]
    
    missing_functions = []
    for func in core_functions:
        if '{}('.format(func) in content:
            print("   ✓ {} function found".format(func))
        else:
            print("   ✗ {} function not found".format(func))
            missing_functions.append(func)
    
    if missing_functions:
        print("   ✗ Missing {} core functions".format(len(missing_functions)))
        return False
    
    # Test 12: Check for localStorage integration
    print("\n12. Testing localStorage integration...")
    if 'localStorage.setItem' in content and 'localStorage.getItem' in content:
        print("   ✓ localStorage integration found")
    else:
        print("   ✗ localStorage integration not found")
        return False
    
    # Test 13: Check for syntax errors (basic)
    print("\n13. Testing for syntax errors...")
    issues = []
    
    # Check for unmatched quotes
    quote_count = content.count('"')
    if quote_count % 2 != 0:
        issues.append("Unmatched quotes detected")
    
    # Check for unmatched brackets
    open_brackets = content.count('[')
    close_brackets = content.count(']')
    if open_brackets != close_brackets:
        issues.append(f"Unmatched brackets: {open_brackets} open, {close_brackets} close")
    
    # Check for unmatched braces
    open_braces = content.count('{')
    close_braces = content.count('}')
    if open_braces != close_braces:
        issues.append(f"Unmatched braces: {open_braces} open, {close_braces} close")
    
    if issues:
        for issue in issues:
            print(f"   ✗ {issue}")
        return False
    else:
        print("   ✓ No syntax errors detected")
    
    # Test 14: Check file size
    print("\n14. File statistics...")
    line_count = len(content.split('\n'))
    char_count = len(content)
    print(f"   ✓ File size: {line_count} lines, {char_count} characters")
    
    # Test 15: Check for JSDoc comments
    print("\n15. Testing JSDoc comments...")
    jsdoc_count = content.count('/**')
    print(f"   ✓ JSDoc comments found: {jsdoc_count}")
    
    print("\n" + "=" * 60)
    print("DYNAMIC CONTENT GENERATION SYSTEM TEST COMPLETE")
    print("=" * 60)
    print("\n✓ All tests passed!")
    print("\nSummary:")
    print(f"- 4 paragraph template types")
    print(f"- {placeholder_count} placeholder types")
    print(f"- {character_count} character states")
    print(f"- 3 world event types")
    print(f"- 4 quest template types")
    print(f"- {len(core_functions)} core functions implemented")
    print(f"- {jsdoc_count} JSDoc comments")
    print("- localStorage integration: ✓")
    print("- No syntax errors: ✓")
    
    return True

if __name__ == '__main__':
    test_dynamic_content()