#!/usr/bin/env python3
"""
Analyze JavaScript files for redundancies and optimization opportunities
"""
import re
from pathlib import Path
from collections import defaultdict

def extract_functions(filepath):
    """Extract function names and signatures from a file"""
    functions = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Match function declarations
        patterns = [
            r'function\s+(\w+)\s*\(',
            r'const\s+(\w+)\s*=\s*(?:async\s+)?function',
            r'const\s+(\w+)\s*=\s*\([^)]*\)\s*=>',
            r'(\w+)\s*:\s*function',
            r'(\w+)\s*:\s*\([^)]*\)\s*=>',
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                func_name = match.group(1)
                # Skip common patterns
                if func_name not in ['if', 'for', 'while', 'switch', 'catch']:
                    functions.append(func_name)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    
    return functions

def analyze_files():
    js_dir = Path('/workspace/js')
    all_functions = defaultdict(list)
    
    print("=" * 80)
    print("JAVASCRIPT CODE ANALYSIS")
    print("=" * 80)
    
    # Analyze each file
    for js_file in js_dir.rglob('*.js'):
        relative_path = js_file.relative_to(js_dir)
        functions = extract_functions(js_file)
        
        for func in functions:
            all_functions[func].append(str(relative_path))
    
    # Find duplicates
    print(f"\n📊 Total Files: {len(list(js_dir.rglob('*.js')))}")
    print(f"📊 Total Functions Found: {len(all_functions)}")
    
    duplicates = {k: v for k, v in all_functions.items() if len(v) > 1}
    
    print(f"\n🔍 DUPLICATE FUNCTIONS ({len(duplicates)}):")
    if duplicates:
        for func_name, files in sorted(duplicates.items()):
            print(f"\n  {func_name}:")
            for f in files:
                print(f"    - {f}")
    else:
        print("  No duplicate functions found!")
    
    # Find potential issues
    print(f"\n⚠️  POTENTIAL ISSUES:")
    
    # Check for console.log statements
    console_logs = []
    for js_file in js_dir.rglob('*.js'):
        try:
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()
                count = len(re.findall(r'console\.log', content))
                if count > 0:
                    console_logs.append((js_file.name, count))
        except:
            pass
    
    if console_logs:
        print(f"\n  Console.log statements:")
        for filename, count in sorted(console_logs, key=lambda x: x[1], reverse=True):
            print(f"    - {filename}: {count}")
    
    # Check for TODO/FIXME comments
    todos = []
    for js_file in js_dir.rglob('*.js'):
        try:
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()
                count = len(re.findall(r'TODO|FIXME|HACK|XXX', content))
                if count > 0:
                    todos.append((js_file.name, count))
        except:
            pass
    
    if todos:
        print(f"\n  TODO/FIXME comments:")
        for filename, count in sorted(todos, key=lambda x: x[1], reverse=True):
            print(f"    - {filename}: {count}")
    
    print("\n" + "=" * 80)
    print("ANALYSIS COMPLETE")
    print("=" * 80)

if __name__ == '__main__':
    analyze_files()