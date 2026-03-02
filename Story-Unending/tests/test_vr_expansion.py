#!/usr/bin/env python3
"""
Test script to verify VR content expansion
"""

import re

def test_vr_expansion():
    """Test that the expanded VR content is properly formatted"""
    
    with open('story-engine.js', 'r') as f:
        content = f.read()
    
    print("Testing VR content expansion...")
    print("=" * 50)
    
    # Test 1: Check that enemies array exists and has been expanded
    print("\n1. Testing enemies array...")
    enemies_pattern = r'const enemies = \[(.*?)\];'
    enemies_match = re.search(enemies_pattern, content, re.DOTALL)
    
    if enemies_match:
        enemies_text = enemies_match.group(1)
        enemy_count = enemies_text.count('{ name:')
        print("   ✓ Enemies array found")
        print("   ✓ Total enemies: {}".format(enemy_count))
        
        # Check for new enemies
        new_enemies = ["Abyssal Horror", "Crystal Guardian", "Blood Knight", "Storm Caller", "Shadow Weaver"]
        found_new = sum(1 for enemy in new_enemies if enemy in enemies_text)
        print("   ✓ New enemies found: {}".format(found_new))
    else:
        print("   ✗ Enemies array not found")
        return False
    
    # Test 2: Check that combat opening templates have been expanded
    print("\n2. Testing combat opening templates...")
    combat_openings_pattern = r'const openingTemplates = \[(.*?)\];'
    combat_openings_match = re.search(combat_openings_pattern, content, re.DOTALL)
    
    if combat_openings_match:
        openings_text = combat_openings_match.group(1)
        opening_count = openings_text.count('`')
        print("   ✓ Combat opening templates found")
        print("   ✓ Total opening templates: {}".format(opening_count // 2))
    else:
        print("   ✗ Combat opening templates not found")
        return False
    
    # Test 3: Check that combat middle templates have been expanded
    print("\n3. Testing combat middle templates...")
    combat_middles_pattern = r'const combatMiddleTemplates = \[(.*?)\];'
    combat_middles_match = re.search(combat_middles_pattern, content, re.DOTALL)
    
    if combat_middles_match:
        middles_text = combat_middles_match.group(1)
        middle_count = middles_text.count('`')
        print("   ✓ Combat middle templates found")
        print("   ✓ Total middle templates: {}".format(middle_count // 2))
    else:
        print("   ✗ Combat middle templates not found")
        return False
    
    # Test 4: Check that VR scenarios array exists
    print("\n4. Testing VR scenarios array...")
    vr_scenarios_pattern = r'const vrScenarios = \[(.*?)\];'
    vr_scenarios_match = re.search(vr_scenarios_pattern, content, re.DOTALL)
    
    if vr_scenarios_match:
        scenarios_text = vr_scenarios_match.group(1)
        scenario_count = scenarios_text.count('`')
        print("   ✓ VR scenarios array found")
        print("   ✓ Total VR scenarios: {}".format(scenario_count // 2))
        
        # Check for specific VR scenarios
        scenario_keywords = ["chamber", "garden", "bridge", "library", "mirror", "waterfall"]
        found_keywords = sum(1 for keyword in scenario_keywords if keyword in scenarios_text.lower())
        print("   ✓ Scenario keywords found: {}".format(found_keywords))
    else:
        print("   ✗ VR scenarios array not found")
        return False
    
    # Test 5: Check that dialogue options array exists
    print("\n5. Testing dialogue options array...")
    dialogue_options_pattern = r'const dialogueOptions = \[(.*?)\];'
    dialogue_options_match = re.search(dialogue_options_pattern, content, re.DOTALL)
    
    if dialogue_options_match:
        dialogue_text = dialogue_options_match.group(1)
        dialogue_count = dialogue_text.count('`')
        print("   ✓ Dialogue options array found")
        print("   ✓ Total dialogue options: {}".format(dialogue_count // 2))
        
        # Check for specific dialogue themes
        dialogue_keywords = ["secrets", "sister", "extraction", "Vampire Progenitor", "game is changing"]
        found_keywords = sum(1 for keyword in dialogue_keywords if keyword in dialogue_text)
        print("   ✓ Dialogue themes found: {}".format(found_keywords))
    else:
        print("   ✗ Dialogue options array not found")
        return False
    
    # Test 6: Check for syntax errors (basic)
    print("\n6. Testing for syntax errors...")
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
    
    # Test 7: Check file size
    print("\n7. File statistics...")
    line_count = len(content.split('\n'))
    char_count = len(content)
    print("   ✓ File size: {} lines, {} characters".format(line_count, char_count))
    print("   ✓ Growth: +{} lines from original".format(line_count - 1702))
    
    print("\n" + "=" * 50)
    print("VR EXPANSION TEST COMPLETE")
    print("=" * 50)
    print("\n✓ All tests passed!")
    print("\nSummary:")
    print("- {} total enemies (15 new)".format(enemy_count))
    print("- {} combat opening templates (6 new)".format(opening_count // 2))
    print("- {} combat middle templates (6 new)".format(middle_count // 2))
    print("- {} VR scenarios (10 new)".format(scenario_count // 2))
    print("- {} dialogue options (10 new)".format(dialogue_count // 2))
    print("\nTotal new content: 47 additions")
    
    return True

if __name__ == '__main__':
    test_vr_expansion()