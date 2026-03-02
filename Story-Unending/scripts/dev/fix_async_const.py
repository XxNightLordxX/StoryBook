#!/usr/bin/env python3
"""
Fix 'async const name = () =>' → 'const name = async () =>'
Also fix 'return const name = () =>' → 'const name = () =>' (invalid return)
"""

import os
import re

JS_DIR = 'js'
EXCLUDE = ['node_modules', '.git', 'dist', 'coverage']

def get_js_files():
    js_files = []
    for root, dirs, files in os.walk(JS_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE]
        for f in files:
            if f.endswith('.js') and not f.endswith('.backup'):
                js_files.append(os.path.join(root, f))
    return sorted(js_files)

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    original = content
    fixes = 0
    
    # Fix 1: async const name = (...) => → const name = async (...) =>
    pattern1 = re.compile(r'(\s*)async\s+const\s+(\w+)\s*=\s*(\([^)]*\))\s*=>', re.MULTILINE)
    def replace_async_const(m):
        nonlocal fixes
        fixes += 1
        indent = m.group(1)
        name = m.group(2)
        params = m.group(3)
        return f'{indent}const {name} = async {params} =>'
    
    content = pattern1.sub(replace_async_const, content)
    
    # Fix 2: return const name = (...) => { ... } → just the function body inline
    # This is trickier - "return function name(args) { body }" was converted to "return const name = (args) => { body }"
    # The correct fix is to convert it to "return (args) => { body }"
    pattern2 = re.compile(r'(\s*)return\s+const\s+\w+\s*=\s*(\([^)]*\))\s*=>', re.MULTILINE)
    def replace_return_const(m):
        nonlocal fixes
        fixes += 1
        indent = m.group(1)
        params = m.group(2)
        return f'{indent}return {params} =>'
    
    content = pattern2.sub(replace_return_const, content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    
    return fixes

def main():
    js_files = get_js_files()
    print(f"Fixing async const and return const patterns in {len(js_files)} files...\n")
    
    total = 0
    for filepath in js_files:
        fixes = fix_file(filepath)
        if fixes > 0:
            print(f"  ✅ {filepath}: {fixes} fixes")
            total += fixes
    
    print(f"\n{'='*60}")
    print(f"Total fixes: {total}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()