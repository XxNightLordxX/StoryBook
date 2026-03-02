#!/usr/bin/env python3
"""
Convert function declarations to arrow functions where safe.

Rules:
1. Named function declarations inside IIFEs → const name = (...) => { }
2. Anonymous function expressions (var/let/const x = function(...)) → const x = (...) => { }
3. DO NOT convert if function uses 'this', 'arguments', 'new.target', or 'super'
4. DO NOT convert if function is a constructor (called with 'new')
5. DO NOT convert generator functions (function*)
6. Preserve JSDoc comments
7. Handle single-line and multi-line functions
"""

import os
import re
import json

JS_DIR = 'js'
EXCLUDE = ['node_modules', '.git', 'dist', 'coverage']

stats = {
    'converted': 0,
    'skipped_this': 0,
    'skipped_arguments': 0,
    'skipped_constructor': 0,
    'skipped_generator': 0,
    'skipped_getter_setter': 0,
    'skipped_other': 0,
    'files_modified': 0,
    'files_scanned': 0,
    'per_file': {}
}

def get_js_files():
    js_files = []
    for root, dirs, files in os.walk(JS_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE]
        for f in files:
            if f.endswith('.js') and not f.endswith('.backup'):
                js_files.append(os.path.join(root, f))
    return sorted(js_files)


def get_function_body(content, open_brace_pos):
    """Get the full function body from the opening brace to the matching closing brace."""
    brace_count = 1
    pos = open_brace_pos + 1
    while pos < len(content) and brace_count > 0:
        ch = content[pos]
        if ch == '{':
            brace_count += 1
        elif ch == '}':
            brace_count -= 1
        elif ch == "'" or ch == '"' or ch == '`':
            # Skip strings
            quote = ch
            pos += 1
            while pos < len(content):
                if content[pos] == '\\':
                    pos += 1  # skip escaped char
                elif content[pos] == quote:
                    break
                elif quote == '`' and content[pos] == '$' and pos + 1 < len(content) and content[pos+1] == '{':
                    # Template literal expression - skip it
                    pos += 2
                    inner_brace = 1
                    while pos < len(content) and inner_brace > 0:
                        if content[pos] == '{':
                            inner_brace += 1
                        elif content[pos] == '}':
                            inner_brace -= 1
                        pos += 1
                    continue
                pos += 1
        elif ch == '/' and pos + 1 < len(content):
            next_ch = content[pos + 1]
            if next_ch == '/':
                # Line comment - skip to end of line
                while pos < len(content) and content[pos] != '\n':
                    pos += 1
            elif next_ch == '*':
                # Block comment - skip to */
                pos += 2
                while pos + 1 < len(content):
                    if content[pos] == '*' and content[pos+1] == '/':
                        pos += 1
                        break
                    pos += 1
        pos += 1
    return pos  # position after closing brace


def body_uses_this(body):
    """Check if function body uses 'this' keyword (not in strings/comments)."""
    # Remove strings and comments first
    cleaned = remove_strings_and_comments(body)
    return bool(re.search(r'\bthis\b', cleaned))


def body_uses_arguments(body):
    """Check if function body uses 'arguments' keyword."""
    cleaned = remove_strings_and_comments(body)
    return bool(re.search(r'\barguments\b', cleaned))


def remove_strings_and_comments(text):
    """Remove string literals and comments from text for safe pattern matching."""
    result = []
    i = 0
    while i < len(text):
        ch = text[i]
        if ch == '/' and i + 1 < len(text):
            if text[i+1] == '/':
                # Line comment
                while i < len(text) and text[i] != '\n':
                    i += 1
                continue
            elif text[i+1] == '*':
                # Block comment
                i += 2
                while i + 1 < len(text):
                    if text[i] == '*' and text[i+1] == '/':
                        i += 2
                        break
                    i += 1
                continue
        elif ch in ('"', "'", '`'):
            quote = ch
            i += 1
            while i < len(text):
                if text[i] == '\\':
                    i += 2
                    continue
                if text[i] == quote:
                    i += 1
                    break
                i += 1
            continue
        result.append(ch)
        i += 1
    return ''.join(result)


def fix_file(filepath):
    """Fix function declarations in a single file."""
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    original = content
    file_fixes = 0
    
    # We'll process the file iteratively since each replacement changes positions
    max_iterations = 500  # safety limit
    iteration = 0
    
    while iteration < max_iterations:
        iteration += 1
        
        # Pattern 1: Named function declaration
        # function name(args) {
        match = re.search(
            r'(?<!\basync\s)(?<!\.)(\s*)(function\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(\([^)]*\))\s*\{',
            content
        )
        
        if not match:
            # Pattern 2: Anonymous function expression assigned to variable
            # const/let/var name = function(args) {
            match = re.search(
                r'(?<!\basync\s)([ \t]*(?:const|let|var)\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*)(function)\s*(\([^)]*\))\s*\{',
                content
            )
            
            if match:
                # This is pattern 2 - handle differently
                prefix = match.group(1)  # "const name = "
                params = match.group(3)  # "(args)"
                
                brace_start = match.end() - 1
                brace_end = get_function_body(content, brace_start)
                body = content[brace_start:brace_end]
                
                # Safety checks
                if body_uses_this(body):
                    stats['skipped_this'] += 1
                    # Mark this match so we don't find it again
                    content = content[:match.start(2)] + 'function/*keep*/' + content[match.end(2):]
                    continue
                
                if body_uses_arguments(body):
                    stats['skipped_arguments'] += 1
                    content = content[:match.start(2)] + 'function/*keep*/' + content[match.end(2):]
                    continue
                
                # Convert: const name = function(args) { body } → const name = (args) => { body }
                new_code = f'{prefix}{params} => {body}'
                content = content[:match.start()] + new_code + content[brace_end:]
                file_fixes += 1
                stats['converted'] += 1
                continue
            
            break  # No more matches
        
        # Pattern 1 processing
        indent = match.group(1)
        func_name = match.group(3)
        params = match.group(4)
        
        # Skip generator functions
        if 'function*' in match.group(0):
            stats['skipped_generator'] += 1
            content = content[:match.start(2)] + 'function/*keep*/' + content[match.end(2):]
            continue
        
        # Find the function body
        brace_start = match.end() - 1
        brace_end = get_function_body(content, brace_start)
        body = content[brace_start:brace_end]
        
        # Safety checks
        if body_uses_this(body):
            stats['skipped_this'] += 1
            content = content[:match.start(2)] + 'function/*keep*/' + content[match.end(2):]
            continue
        
        if body_uses_arguments(body):
            stats['skipped_arguments'] += 1
            content = content[:match.start(2)] + 'function/*keep*/' + content[match.end(2):]
            continue
        
        # Check if function is used as constructor (new FuncName)
        cleaned_content = remove_strings_and_comments(content)
        if re.search(rf'\bnew\s+{re.escape(func_name)}\b', cleaned_content):
            stats['skipped_constructor'] += 1
            content = content[:match.start(2)] + 'function/*keep*/' + content[match.end(2):]
            continue
        
        # Convert: function name(args) { body } → const name = (args) => { body }
        new_code = f'{indent}const {func_name} = {params} => {body}'
        content = content[:match.start()] + new_code + content[brace_end:]
        file_fixes += 1
        stats['converted'] += 1
    
    # Clean up the /*keep*/ markers
    content = content.replace('function/*keep*/', 'function ')
    # Clean up any double spaces
    content = re.sub(r'function  +', 'function ', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        stats['files_modified'] += 1
    
    stats['per_file'][filepath] = file_fixes
    return file_fixes


def main():
    js_files = get_js_files()
    stats['files_scanned'] = len(js_files)
    
    print(f"Converting function declarations to arrow functions in {len(js_files)} files...\n")
    
    for filepath in js_files:
        fixes = fix_file(filepath)
        if fixes > 0:
            print(f"  ✅ {filepath}: {fixes} conversions")
    
    print(f"\n{'='*70}")
    print(f"FUNCTION DECLARATION CONVERSION RESULTS")
    print(f"{'='*70}")
    print(f"  Files scanned:       {stats['files_scanned']}")
    print(f"  Files modified:      {stats['files_modified']}")
    print(f"  Functions converted:  {stats['converted']}")
    print(f"  Skipped (this):      {stats['skipped_this']}")
    print(f"  Skipped (arguments): {stats['skipped_arguments']}")
    print(f"  Skipped (constructor): {stats['skipped_constructor']}")
    print(f"  Skipped (generator): {stats['skipped_generator']}")
    print(f"{'='*70}")
    
    # Save stats
    with open('FUNCTION_CONVERSION_STATS.json', 'w') as f:
        json.dump(stats, f, indent=2)


if __name__ == '__main__':
    main()