#!/usr/bin/env python3
"""
Fix all double IIFE patterns in JavaScript files
"""

import os
from pathlib import Path

def fix_double_iife_file(filepath):
    """Fix double IIFE pattern in a single file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    
    # Check if file has double IIFE pattern
    if len(lines) < 3:
        return False
    
    # Check first 3 lines
    first_three = '\n'.join(lines[:3])
    
    # Pattern: (function() { \n  // Original content \n  (function() {
    if '(function() {' in lines[0] and '// Original content' in lines[1] and '(function() {' in lines[2]:
        # Remove first 3 lines
        new_lines = lines[3:]
        
        # Remove duplicate "// Original content" if present
        if new_lines and new_lines[0].strip() == '// Original content':
            new_lines = new_lines[1:]
        
        new_content = '\n'.join(new_lines)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True
    
    return False

def main():
    """Main function"""
    js_dir = Path('js')
    
    fixed_files = []
    
    for js_file in js_dir.rglob('*.js'):
        if fix_double_iife_file(js_file):
            fixed_files.append(str(js_file))
            print(f"✅ Fixed: {js_file}")
    
    print(f"\n🎉 Fixed {len(fixed_files)} files with double IIFE patterns")
    
    return fixed_files

if __name__ == '__main__':
    main()