#!/usr/bin/env python3
"""
Test script for quest variety expansion
"""

import re

def test_quest_variety_expansion():
    """Test the quest variety expansion"""
    print("Testing Quest Variety Expansion...")
    
    file_path = "js/modules/dynamic-content.js"
    
    if not file_path:
        print("❌ FAIL: dynamic-content.js not found")
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check for new quest types
    new_quest_types = ['escort', 'rescue', 'delivery', 'crafting', 'diplomacy', 'stealth']
    missing_types = []
    for quest_type in new_quest_types:
        if quest_type + ': {' not in content:
            missing_types.append(quest_type)
    
    if missing_types:
        print(f"❌ FAIL: Missing quest types: {', '.join(missing_types)}")
        return False
    
    # Check for new placeholders
    new_placeholders = ['NPC', 'RECIPIENT', 'MATERIALS', 'FACTION', 'TOPIC', 'OBJECTIVE', 'ESCAPE_ROUTE']
    missing_placeholders = []
    for placeholder in new_placeholders:
        if placeholder + ': [' not in content:
            missing_placeholders.append(placeholder)
    
    if missing_placeholders:
        print(f"❌ FAIL: Missing placeholders: {', '.join(missing_placeholders)}")
        return False
    
    # Count total quest types
    quest_count = len(re.findall(r'\w+:\s*\{[\s\S]*?name:', content))
    
    # Verify syntax
    try:
        # Check for balanced braces
        open_braces = content.count('{')
        close_braces = content.count('}')
        if open_braces != close_braces:
            print(f"❌ FAIL: Unbalanced braces ({open_braces} open, {close_braces} close)")
            return False
    except Exception as e:
        print(f"❌ FAIL: Syntax error: {str(e)}")
        return False
    
    print("✅ PASS: All tests passed")
    print(f"  - Total quest types: {quest_count}")
    print(f"  - New quest types: 6")
    print(f"  - New placeholders: 7")
    return True

def main():
    """Main function"""
    print("=" * 60)
    print("Quest Variety Expansion Test Suite")
    print("=" * 60)
    
    result = test_quest_variety_expansion()
    
    print("\n" + "=" * 60)
    if result:
        print("✅ All tests passed! Quest variety expansion is complete.")
        return 0
    else:
        print("❌ Tests failed. Please review the issues above.")
        return 1

if __name__ == "__main__":
    exit(main())