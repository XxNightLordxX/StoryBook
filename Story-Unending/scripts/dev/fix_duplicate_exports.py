#!/usr/bin/env python3
"""
Fix duplicate window exports in JavaScript files
Removes duplicate window.Namespace = Namespace statements
"""

import re
from pathlib import Path

def fix_duplicate_exports(filepath):
    """Fix duplicate window exports in a file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Find all window exports
    export_pattern = r'window\.([A-Z][a-zA-Z]+)\s*=\s*([A-Z][a-zA-Z]+);'
    exports = re.findall(export_pattern, content)
    
    if not exports:
        return False
    
    # Check for duplicates
    export_names = [e[0] for e in exports]
    duplicates = [name for name in set(export_names) if export_names.count(name) > 1]
    
    if not duplicates:
        return False
    
    # Remove duplicate exports, keep only the last occurrence
    for dup in duplicates:
        # Find all occurrences
        pattern = rf'window\.{dup}\s*=\s*{dup};'
        matches = list(re.finditer(pattern, content))
        
        if len(matches) > 1:
            # Remove all but the last occurrence
            for match in reversed(matches[:-1]):
                # Remove the line containing this export
                start = match.start()
                # Find the start of the line
                while start > 0 and content[start-1] != '\n':
                    start -= 1
                # Find the end of the line
                end = match.end()
                while end < len(content) and content[end] != '\n':
                    end += 1
                
                # Remove the line
                content = content[:start] + content[end+1:]
    
    # Write back if changed
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    return False

def main():
    """Main function"""
    js_dir = Path('js')
    
    fixed_files = []
    
    for js_file in js_dir.rglob('*.js'):
        if fix_duplicate_exports(js_file):
            fixed_files.append(str(js_file))
            print(f"✅ Fixed: {js_file}")
    
    print(f"\n🎉 Fixed {len(fixed_files)} files with duplicate exports")
    
    return fixed_files

if __name__ == '__main__':
    main()