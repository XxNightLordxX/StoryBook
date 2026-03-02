#!/usr/bin/env python3
"""
Fix double IIFE patterns in JavaScript files
Removes nested IIFE wrappers that cause code duplication
"""

import re
import os
from pathlib import Path

def fix_double_iife(filepath):
    """Fix double IIFE pattern in a file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Pattern 1: (function() { (function() { ... })(); })();
    pattern1 = r'\(function\(\)\s*\{\s*//\s*Original\s+content\s*\n\s*\(function\(\)\s*\{\s*//\s*Original\s+content\s*\n'
    
    # Pattern 2: (function() { (function() { ... })();
    pattern2 = r'\(function\(\)\s*\{\s*//\s*Original\s+content\s*\n\s*\(function\(\)\s*\{\s*//\s*Original\s+content\s*\n'
    
    # Check if file has double IIFE pattern
    if '(function() {' in content and content.count('(function() {') >= 2:
        # Find the first IIFE opening
        first_iife_start = content.find('(function() {')
        if first_iife_start == -1:
            return False
        
        # Find the first comment after it
        first_comment = content.find('// Original content', first_iife_start)
        if first_comment == -1:
            return False
        
        # Find the second IIFE opening
        second_iife_start = content.find('(function() {', first_comment)
        if second_iife_start == -1:
            return False
        
        # Find the second comment
        second_comment = content.find('// Original content', second_iife_start)
        if second_comment == -1:
            return False
        
        # Remove the outer IIFE wrapper
        # Keep everything from the second IIFE onwards
        new_content = content[second_iife_start:]
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True
    
    return False

def main():
    """Main function"""
    js_dir = Path('js')
    
    fixed_files = []
    
    for js_file in js_dir.rglob('*.js'):
        if fix_double_iife(js_file):
            fixed_files.append(str(js_file))
            print(f"✅ Fixed: {js_file}")
    
    print(f"\n🎉 Fixed {len(fixed_files)} files with double IIFE patterns")
    
    return fixed_files

if __name__ == '__main__':
    main()