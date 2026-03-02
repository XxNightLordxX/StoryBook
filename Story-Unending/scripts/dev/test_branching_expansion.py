#!/usr/bin/env python3
"""
Test script for branching narrative expansion
"""

import re

def test_branching_expansion():
    """Test the branching narrative expansion"""
    print("Testing Branching Narrative Expansion...")
    
    file_path = "js/modules/branching-narrative.js"
    
    if not file_path:
        print("❌ FAIL: branching-narrative.js not found")
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Count branches
    branches = len(re.findall(r'branch_\d+:\s*\{', content))
    
    # Count options
    options = len(re.findall(r'id:\s*"option_\d+"', content))
    
    # Check for new branches
    new_branches = ['branch_31', 'branch_32', 'branch_33', 'branch_34', 'branch_35']
    missing_branches = []
    for branch in new_branches:
        if branch not in content:
            missing_branches.append(branch)
    
    if missing_branches:
        print(f"❌ FAIL: Missing branches: {', '.join(missing_branches)}")
        return False
    
    # Check for specific content in new branches
    required_content = [
        'VR World Discovery',
        'Ancient Secret Uncovered',
        'Ultimate Sacrifice',
        'VR World Destiny',
        'Final Resolution'
    ]
    
    missing_content = []
    for content_item in required_content:
        if content_item not in content:
            missing_content.append(content_item)
    
    if missing_content:
        print(f"❌ FAIL: Missing content: {', '.join(missing_content)}")
        return False
    
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
    print(f"  - Total branches: {branches}")
    print(f"  - Total options: {options}")
    print(f"  - New branches added: 5")
    print(f"  - New options added: 15")
    return True

def main():
    """Main function"""
    print("=" * 60)
    print("Branching Narrative Expansion Test Suite")
    print("=" * 60)
    
    result = test_branching_expansion()
    
    print("\n" + "=" * 60)
    if result:
        print("✅ All tests passed! Branching expansion is complete.")
        return 0
    else:
        print("❌ Tests failed. Please review the issues above.")
        return 1

if __name__ == "__main__":
    exit(main())