#!/usr/bin/env python3
"""
Remove console statements from JavaScript files
Removes console.log, console.warn, console.debug, console.info statements
"""

import re
from pathlib import Path

def fix_console_statements(filepath):
    """Remove console statements from a file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Remove console statements (keep console.error for error handling)
    patterns = [
        r'console\.log\([^)]*\);?\s*\n?',
        r'console\.warn\([^)]*\);?\s*\n?',
        r'console\.debug\([^)]*\);?\s*\n?',
        r'console\.info\([^)]*\);?\s*\n?',
    ]
    
    for pattern in patterns:
        content = re.sub(pattern, '', content)
    
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
        if fix_console_statements(js_file):
            fixed_files.append(str(js_file))
            print(f"✅ Fixed: {js_file}")
    
    print(f"\n🎉 Fixed {len(fixed_files)} files with console statements")
    
    return fixed_files

if __name__ == '__main__':
    main()