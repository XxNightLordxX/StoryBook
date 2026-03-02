#!/usr/bin/env python3
"""
Test script to verify backstory content expansion
"""

import re

def test_backstory_expansion():
    """Test that the expanded backstory content is properly formatted"""
    
    with open('backstory-engine.js', 'r') as f:
        content = f.read()
    
    # Test 1: Check that all 6 generators exist
    generators = [
        'generateBackstoryLifeParagraphs',
        'generateBackstorySisterParagraphs',
        'generateBackstoryParentsParagraphs',
        'generateBackstoryStruggleParagraphs',
        'generateBackstoryVRHypeParagraphs',
        'generateBackstoryHeadsetParagraphs'
    ]
    
    print("Testing backstory generators...")
    for generator in generators:
        if f'function {generator}' in content:
            print(f"✓ {generator} found")
        else:
            print(f"✗ {generator} NOT found")
            return False
    
    # Test 2: Check that each generator has openings and middles arrays
    print("\nTesting paragraph arrays...")
    for generator in generators:
        # Extract the generator function
        pattern = rf'function {generator}\([^)]*\) {{(.*?)}}'
        match = re.search(pattern, content, re.DOTALL)
        
        if match:
            generator_content = match.group(1)
            
            # Check for openings array
            if 'const openings = [' in generator_content:
                # Count paragraphs in openings
                openings_match = re.search(r'const openings = \[(.*?)\];', generator_content, re.DOTALL)
                if openings_match:
                    openings_text = openings_match.group(1)
                    opening_count = openings_text.count('"')
                    print(f"✓ {generator}: {opening_count // 2} opening paragraphs")
                else:
                    print(f"✗ {generator}: Could not count opening paragraphs")
                    return False
            else:
                print(f"✗ {generator}: No openings array found")
                return False
            
            # Check for middles array
            if 'const middles = [' in generator_content:
                # Count paragraphs in middles
                middles_match = re.search(r'const middles = \[(.*?)\];', generator_content, re.DOTALL)
                if middles_match:
                    middles_text = middles_match.group(1)
                    middle_count = middles_text.count('"')
                    print(f"✓ {generator}: {middle_count // 2} middle paragraphs")
                else:
                    print(f"✗ {generator}: Could not count middle paragraphs")
                    return False
            else:
                print(f"✗ {generator}: No middles array found")
                return False
        else:
            print(f"✗ {generator}: Could not extract function content")
            return False
    
    # Test 3: Check for syntax errors (basic)
    print("\nTesting for syntax errors...")
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
            print(f"✗ {issue}")
        return False
    else:
        print("✓ No syntax errors detected")
    
    # Test 4: Check file size
    print("\nFile statistics...")
    line_count = len(content.split('\n'))
    char_count = len(content)
    print(f"✓ File size: {line_count} lines, {char_count} characters")
    
    # Test 5: Check for duplicate paragraphs (basic check)
    print("\nChecking for obvious duplicates...")
    duplicate_found = False
    for generator in generators:
        pattern = rf'function {generator}\([^)]*\) {{(.*?)}}'
        match = re.search(pattern, content, re.DOTALL)
        
        if match:
            generator_content = match.group(1)
            
            # Extract all paragraphs
            paragraphs = re.findall(r'"([^"]{50,})"', generator_content)
            
            # Check for duplicates
            seen = set()
            duplicates = set()
            for para in paragraphs:
                if para in seen:
                    duplicates.add(para[:50] + "...")
                seen.add(para)
            
            if duplicates:
                print(f"✗ {generator}: Found {len(duplicates)} potential duplicates")
                duplicate_found = True
            else:
                print(f"✓ {generator}: No obvious duplicates")
    
    if duplicate_found:
        print("\nNote: Some duplicates may be intentional (repeated phrases)")
    
    print("\n" + "="*50)
    print("BACKSTORY EXPANSION TEST COMPLETE")
    print("="*50)
    return True

if __name__ == '__main__':
    success = test_backstory_expansion()
    if success:
        print("\n✓ All tests passed!")
    else:
        print("\n✗ Some tests failed!")