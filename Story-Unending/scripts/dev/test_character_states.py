#!/usr/bin/env python3
"""
Test script for character states expansion
"""

import re

def test_character_states_expansion():
    """Test the character states expansion"""
    print("Testing Character States Expansion...")
    
    file_path = "js/modules/dynamic-content.js"
    
    if not file_path:
        print("❌ FAIL: dynamic-content.js not found")
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check for new characters
    new_characters = ['Sera', 'Lin', 'Vance', 'Elara']
    missing_characters = []
    for char in new_characters:
        if char + ': {' not in content:
            missing_characters.append(char)
    
    if missing_characters:
        print(f"❌ FAIL: Missing characters: {', '.join(missing_characters)}")
        return False
    
    # Count total characters
    character_count = len(re.findall(r'\w+:\s*\{[\s\S]*?trust:', content))
    
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
    print(f"  - Total characters: {character_count}")
    print(f"  - New characters: 4")
    return True

def main():
    """Main function"""
    print("=" * 60)
    print("Character States Expansion Test Suite")
    print("=" * 60)
    
    result = test_character_states_expansion()
    
    print("\n" + "=" * 60)
    if result:
        print("✅ All tests passed! Character states expansion is complete.")
        return 0
    else:
        print("❌ Tests failed. Please review the issues above.")
        return 1

if __name__ == "__main__":
    exit(main())