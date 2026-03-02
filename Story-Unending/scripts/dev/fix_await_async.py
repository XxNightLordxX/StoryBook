#!/usr/bin/env python3
"""
Fix all 'await in non-async function' errors.
Finds functions containing 'await' that are not declared as 'async'.
"""

import re
import os

files_to_fix = [
    'js/ui/content-management-ui.js',
    'js/ui/save-load-ui.js',
    'js/ui/user-features-ui.js',
    'js/ui/bookmarks-ui.js',
    'js/modules/misc.js',
]

def fix_file(filepath):
    if not os.path.exists(filepath):
        print(f"  ⚠️ File not found: {filepath}")
        return 0
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    fixes = 0
    
    # Pattern 1: function functionName(...) { ... await ... }
    # Replace with: async function functionName(...) {
    # We need to find functions that contain await but aren't async
    
    # Find all function declarations
    # Match: function name(args) {
    pattern = r'(\s*)(function\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*\{)'
    
    matches = list(re.finditer(pattern, content))
    
    # Process in reverse to preserve positions
    for match in reversed(matches):
        indent = match.group(1)
        func_decl = match.group(2)
        start = match.start(2)
        end = match.end(2)
        
        # Check if already async
        before_func = content[max(0, start-20):start]
        if 'async' in before_func:
            continue
        
        # Find the matching closing brace for this function
        brace_count = 1
        pos = end
        while pos < len(content) and brace_count > 0:
            if content[pos] == '{':
                brace_count += 1
            elif content[pos] == '}':
                brace_count -= 1
            pos += 1
        
        # Get function body
        func_body = content[end:pos]
        
        # Check if body contains 'await'
        if 'await ' in func_body:
            # Add async keyword
            new_decl = 'async ' + func_decl
            content = content[:start] + new_decl + content[end:]
            func_name = re.search(r'function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)', func_decl)
            name = func_name.group(1) if func_name else 'anonymous'
            print(f"    Fixed: function {name}() → async function {name}()")
            fixes += 1
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    
    return fixes

def main():
    print("Fixing await in non-async functions...\n")
    
    total = 0
    for filepath in files_to_fix:
        print(f"  Processing: {filepath}")
        fixes = fix_file(filepath)
        if fixes > 0:
            print(f"  ✅ {filepath}: {fixes} fixes")
        else:
            print(f"  ℹ️  {filepath}: no fixes needed")
        total += fixes
    
    print(f"\n{'='*60}")
    print(f"Total async fixes: {total}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()