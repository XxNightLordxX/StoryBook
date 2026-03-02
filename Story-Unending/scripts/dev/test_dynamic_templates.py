#!/usr/bin/env python3
"""
Test script for dynamic content template expansion
"""

import re

def test_template_expansion():
    """Test the template expansion"""
    print("Testing Dynamic Content Template Expansion...")
    
    file_path = "js/modules/dynamic-content.js"
    
    if not file_path:
        print("❌ FAIL: dynamic-content.js not found")
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Count templates in each category
    combat_count = len(re.findall(r'"The \[ENEMY\]', content))
    exploration_count = len(re.findall(r'"The \[LOCATION\]', content))
    dialogue_count = len(re.findall(r'"\[CHARACTER\]', content))
    introspection_count = len(re.findall(r'"The \[EMOTION\]', content))
    
    # Check for new template patterns
    new_patterns = [
        'The [ENEMY]\'s [FEATURE]',
        'The [LOCATION] [ACTION]',
        '[CHARACTER]\'s [FEATURE]',
        'The [EMOTION] [ACTION]'
    ]
    
    missing_patterns = []
    for pattern in new_patterns:
        if pattern not in content:
            missing_patterns.append(pattern)
    
    if missing_patterns:
        print(f"❌ FAIL: Missing patterns: {', '.join(missing_patterns)}")
        return False
    
    # Verify syntax
    try:
        # Check for balanced braces
        open_braces = content.count('{')
        close_braces = content.count('}')
        if open_braces != close_braces:
            print(f"❌ FAIL: Unbalanced braces ({open_braces} open, {close_braces} close)")
            return False
        
        # Check for balanced brackets
        open_brackets = content.count('[')
        close_brackets = content.count(']')
        if open_brackets != close_brackets:
            print(f"❌ FAIL: Unbalanced brackets ({open_brackets} open, {close_brackets} close)")
            return False
    except Exception as e:
        print(f"❌ FAIL: Syntax error: {str(e)}")
        return False
    
    print("✅ PASS: All tests passed")
    print(f"  - Combat templates: {combat_count}")
    print(f"  - Exploration templates: {exploration_count}")
    print(f"  - Dialogue templates: {dialogue_count}")
    print(f"  - Introspection templates: {introspection_count}")
    print(f"  - Total templates: {combat_count + exploration_count + dialogue_count + introspection_count}")
    return True

def main():
    """Main function"""
    print("=" * 60)
    print("Dynamic Content Template Expansion Test Suite")
    print("=" * 60)
    
    result = test_template_expansion()
    
    print("\n" + "=" * 60)
    if result:
        print("✅ All tests passed! Template expansion is complete.")
        return 0
    else:
        print("❌ Tests failed. Please review the issues above.")
        return 1

if __name__ == "__main__":
    exit(main())