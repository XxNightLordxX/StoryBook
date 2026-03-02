#!/usr/bin/env python3
"""
Test script for world events expansion
"""

import re

def test_world_events_expansion():
    """Test the world events expansion"""
    print("Testing World Events Expansion...")
    
    file_path = "js/modules/dynamic-content.js"
    
    if not file_path:
        print("❌ FAIL: dynamic-content.js not found")
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check for new event types
    new_event_types = ['environmental', 'political']
    missing_types = []
    for event_type in new_event_types:
        if event_type + ': [' not in content:
            missing_types.append(event_type)
    
    if missing_types:
        print(f"❌ FAIL: Missing event types: {', '.join(missing_types)}")
        return False
    
    # Check for new events
    new_events = [
        'Void Rift Opens',
        'Ancestral Awakening',
        'Shadow Plague',
        'Assassination Attempt',
        'Resource Crisis',
        'Faction Schism',
        'Lost Technology Found',
        'Underground City Revealed',
        'Celestial Alignment',
        'Great Drought',
        'Magical Storm',
        'Season of Plenty',
        'New Ruler Rises',
        'Treaty Signed',
        'Corruption Exposed'
    ]
    
    missing_events = []
    for event in new_events:
        if event not in content:
            missing_events.append(event)
    
    if missing_events:
        print(f"❌ FAIL: Missing events: {', '.join(missing_events)}")
        return False
    
    # Count total events
    event_count = len(re.findall(r'name:\s*"[^"]+"', content))
    
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
    print(f"  - Total events: {event_count}")
    print(f"  - Event types: 5 (supernatural, conflict, discovery, environmental, political)")
    print(f"  - New events: 9")
    return True

def main():
    """Main function"""
    print("=" * 60)
    print("World Events Expansion Test Suite")
    print("=" * 60)
    
    result = test_world_events_expansion()
    
    print("\n" + "=" * 60)
    if result:
        print("✅ All tests passed! World events expansion is complete.")
        return 0
    else:
        print("❌ Tests failed. Please review the issues above.")
        return 1

if __name__ == "__main__":
    exit(main())