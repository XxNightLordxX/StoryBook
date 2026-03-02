#!/usr/bin/env python3
"""
Test script to verify branching narrative system
"""

import re

def test_branching_narrative():
    """Test that the branching narrative system is properly implemented"""
    
    with open('js/modules/branching-narrative.js', 'r') as f:
        content = f.read()
    
    print("Testing Branching Narrative System...")
    print("=" * 60)
    
    # Test 1: Check that the module exists and is properly structured
    print("\n1. Testing module structure...")
    if 'const BranchingNarrative = (() => {' in content:
        print("   ✓ BranchingNarrative module found")
    else:
        print("   ✗ BranchingNarrative module not found")
        return False
    
    # Test 2: Check that choiceTracker exists
    print("\n2. Testing choice tracker...")
    if 'let choiceTracker = {' in content:
        print("   ✓ Choice tracker found")
    else:
        print("   ✗ Choice tracker not found")
        return False
    
    # Test 3: Check that branches object exists
    print("\n3. Testing branches object...")
    if 'const branches = {' in content:
        print("   ✓ Branches object found")
    else:
        print("   ✗ Branches object not found")
        return False
    
    # Test 4: Check for major branches
    print("\n4. Testing major branches...")
    # Count branch_1 through branch_10 in major section
    major_branch_count = 0
    for i in range(1, 11):
        if f'branch_{i}:' in content:
            major_branch_count += 1
    
    print("   ✓ Major branches found: {}".format(major_branch_count))
    
    if major_branch_count >= 10:
        print("   ✓ Major branches meet requirement (10+)")
    else:
        print("   ✗ Major branches below requirement (need 10+)")
        return False
    
    # Test 5: Check for minor branches
    print("\n5. Testing minor branches...")
    # Count branch_11 through branch_30 in minor section
    minor_branch_count = 0
    for i in range(11, 31):
        if f'branch_{i}:' in content:
            minor_branch_count += 1
    
    print("   ✓ Minor branches found: {}".format(minor_branch_count))
    
    if minor_branch_count >= 20:
        print("   ✓ Minor branches meet requirement (20+)")
    else:
        print("   ✗ Minor branches below requirement (need 20+)")
        return False
    
    # Test 6: Check for core functions
    print("\n6. Testing core functions...")
    core_functions = [
        'presentChoice',
        'recordChoice',
        'applyConsequences',
        'checkBranchConditions',
        'getAvailableBranches',
        'getBranchHistory',
        'getStatChanges',
        'getRelationships',
        'getFlags',
        'hasFlag',
        'saveChoiceTracker',
        'loadChoiceTracker',
        'resetChoices',
        'getBranch',
        'getAllBranches'
    ]
    
    missing_functions = []
    for func in core_functions:
        if f'function {func}(' in content:
            print("   ✓ {} function found".format(func))
        else:
            print("   ✗ {} function not found".format(func))
            missing_functions.append(func)
    
    if missing_functions:
        print("   ✗ Missing {} core functions".format(len(missing_functions)))
        return False
    
    # Test 7: Check for specific major branches
    print("\n7. Testing specific major branches...")
    major_branch_names = [
        "First Extraction Choice",
        "Sister's Treatment Decision",
        "Vampire Evolution Path",
        "Guild Alliance",
        "Romance Path",
        "Confrontation with Rival",
        "Hidden Realm Discovery",
        "Parent's Secret Revealed",
        "World Event Choice",
        "Final Choice"
    ]
    
    found_branches = 0
    for branch_name in major_branch_names:
        if branch_name in content:
            print("   ✓ {} branch found".format(branch_name))
            found_branches += 1
        else:
            print("   ✗ {} branch not found".format(branch_name))
    
    if found_branches >= 10:
        print("   ✓ All major branches present")
    else:
        print("   ✗ Some major branches missing")
        return False
    
    # Test 8: Check for localStorage integration
    print("\n8. Testing localStorage integration...")
    if 'localStorage.setItem' in content and 'localStorage.getItem' in content:
        print("   ✓ localStorage integration found")
    else:
        print("   ✗ localStorage integration not found")
        return False
    
    # Test 9: Check for consequence application
    print("\n9. Testing consequence application...")
    if 'statChanges' in content and 'relationshipChanges' in content:
        print("   ✓ Consequence application found")
    else:
        print("   ✗ Consequence application not found")
        return False
    
    # Test 10: Check for syntax errors (basic)
    print("\n10. Testing for syntax errors...")
    issues = []
    
    # Check for unmatched quotes
    quote_count = content.count('"')
    if quote_count % 2 != 0:
        issues.append("Unmatched quotes detected")
    
    # Check for unmatched brackets
    open_brackets = content.count('[')
    close_brackets = content.count(']')
    if open_brackets != close_brackets:
        issues.append("Unmatched brackets: {} open, {} close".format(open_brackets, close_brackets))
    
    # Check for unmatched braces
    open_braces = content.count('{')
    close_braces = content.count('}')
    if open_braces != close_braces:
        issues.append("Unmatched braces: {} open, {} close".format(open_braces, close_braces))
    
    if issues:
        for issue in issues:
            print("   ✗ {}".format(issue))
        return False
    else:
        print("   ✓ No syntax errors detected")
    
    # Test 11: Check file size
    print("\n11. File statistics...")
    line_count = len(content.split('\n'))
    char_count = len(content)
    print("   ✓ File size: {} lines, {} characters".format(line_count, char_count))
    
    # Test 12: Check for JSDoc comments
    print("\n12. Testing JSDoc comments...")
    jsdoc_count = content.count('/**')
    print("   ✓ JSDoc comments found: {}".format(jsdoc_count))
    
    print("\n" + "=" * 60)
    print("BRANCHING NARRATIVE SYSTEM TEST COMPLETE")
    print("=" * 60)
    print("\n✓ All tests passed!")
    print("\nSummary:")
    print("- {} major branches (requirement: 10+)".format(major_branch_count))
    print("- {} minor branches (requirement: 20+)".format(minor_branch_count))
    print("- {} core functions implemented".format(len(core_functions)))
    print("- {} JSDoc comments".format(jsdoc_count))
    print("- localStorage integration: ✓")
    print("- Consequence application: ✓")
    print("\nTotal branches: {}".format(major_branch_count + minor_branch_count))
    
    return True

if __name__ == '__main__':
    test_branching_narrative()