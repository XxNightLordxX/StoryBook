#!/usr/bin/env python3
"""
Fix syntax errors in backstory-engine.js and content-pools.js.
Problem: Strings with escaped quotes inside double-quoted strings.
Solution: Convert problematic double-quoted strings to backtick template literals.
"""

import os
import re
import subprocess

def check_syntax(filepath):
    """Check if file has syntax errors, return error line number or None"""
    result = subprocess.run(['node', '-c', filepath], capture_output=True, text=True, timeout=10)
    if result.returncode != 0:
        match = re.search(r':(\d+)', result.stderr)
        if match:
            return int(match.group(1))
    return None

def fix_file(filepath):
    """Fix string escaping issues by converting to backtick strings"""
    if not os.path.exists(filepath):
        print(f"  ⚠️  Not found: {filepath}")
        return 0
    
    print(f"\n  Processing: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    fixes = 0
    max_passes = 50  # Safety limit
    
    for pass_num in range(max_passes):
        error_line = check_syntax(filepath)
        if error_line is None:
            print(f"    ✅ No syntax errors (after {fixes} fixes)")
            break
        
        print(f"    Pass {pass_num + 1}: Error at line {error_line}")
        
        # Re-read the file (may have been modified)
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.read().split('\n')
        
        if error_line > len(lines):
            print(f"    ⚠️  Error line {error_line} exceeds file length {len(lines)}")
            break
        
        # Get the problematic line (0-indexed)
        idx = error_line - 1
        line = lines[idx]
        stripped = line.strip()
        indent = line[:len(line) - len(line.lstrip())]
        
        # Strategy 1: Line is a double-quoted string with escaped quotes
        if stripped.startswith('"') and (stripped.endswith('",') or stripped.endswith('"')):
            # Convert to backtick string
            # Remove outer quotes
            if stripped.endswith('",'):
                inner = stripped[1:-2]
                suffix = ','
            else:
                inner = stripped[1:-1]
                suffix = ''
            
            # Unescape double quotes
            inner = inner.replace('\&quot;', '"')
            # Escape backticks
            inner = inner.replace('`', '\\`')
            # Escape ${
            inner = inner.replace('${', '\\${')
            
            new_line = indent + '`' + inner + '`' + suffix
            lines[idx] = new_line
            fixes += 1
        
        # Strategy 2: The error is on a line that continues from previous
        # Check if previous line has an unclosed string
        elif idx > 0:
            prev_line = lines[idx - 1].strip()
            if prev_line.startswith('"') and not prev_line.endswith('",') and not prev_line.endswith('"'):
                # Previous line has unclosed string - merge and fix
                # Actually, let's just convert the previous line to backtick
                prev_idx = idx - 1
                prev_full = lines[prev_idx]
                prev_indent = prev_full[:len(prev_full) - len(prev_full.lstrip())]
                prev_stripped = prev_full.strip()
                
                if prev_stripped.startswith('"'):
                    inner = prev_stripped[1:]
                    if inner.endswith(','):
                        inner = inner[:-1]
                    inner = inner.replace('\&quot;', '"')
                    inner = inner.replace('`', '\\`')
                    inner = inner.replace('${', '\\${')
                    lines[prev_idx] = prev_indent + '`' + inner + '`,'
                    fixes += 1
            else:
                # Try converting current line
                print(f"    ⚠️  Cannot auto-fix line {error_line}: {stripped[:60]}")
                # Try a broader approach - convert ALL double-quoted strings in the array
                break
        else:
            print(f"    ⚠️  Cannot auto-fix line {error_line}: {stripped[:60]}")
            break
        
        # Write the fix
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
    
    return fixes

def bulk_convert_strings(filepath):
    """Convert ALL double-quoted strings with escaped quotes to backtick strings"""
    if not os.path.exists(filepath):
        return 0
    
    print(f"\n  Bulk converting strings in: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    new_lines = []
    fixes = 0
    
    for line in lines:
        stripped = line.strip()
        indent = line[:len(line) - len(line.lstrip())]
        
        # Check if this is a double-quoted string array element with escaped quotes
        if stripped.startswith('"') and (stripped.endswith('",') or stripped.endswith('"')) and '\&quot;' in stripped:
            if stripped.endswith('",'):
                inner = stripped[1:-2]
                suffix = ','
            else:
                inner = stripped[1:-1]
                suffix = ''
            
            # Unescape double quotes
            inner = inner.replace('\&quot;', '"')
            # Escape backticks and template expressions
            inner = inner.replace('`', '\\`')
            inner = inner.replace('${', '\\${')
            
            new_lines.append(indent + '`' + inner + '`' + suffix)
            fixes += 1
        else:
            new_lines.append(line)
    
    if fixes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        print(f"    ✅ Converted {fixes} strings to backtick literals")
    
    return fixes

def main():
    files = [
        'backstory-engine.js',
        'utils/content-pools.js',
        'utils/embedded_js_temp.js',
    ]
    
    print("=" * 70)
    print("FIXING SYNTAX ERRORS IN STRING-HEAVY FILES")
    print("=" * 70)
    
    total_fixes = 0
    
    for filepath in files:
        if not os.path.exists(filepath):
            print(f"\n  ⚠️  Not found: {filepath}")
            continue
        
        # First try bulk conversion
        fixes = bulk_convert_strings(filepath)
        total_fixes += fixes
        
        # Then check if there are remaining errors
        error = check_syntax(filepath)
        if error:
            print(f"    Still has error at line {error}, trying iterative fix...")
            fixes2 = fix_file(filepath)
            total_fixes += fixes2
        
        # Final check
        error = check_syntax(filepath)
        if error is None:
            print(f"    ✅ {filepath}: CLEAN - no syntax errors!")
        else:
            print(f"    ❌ {filepath}: Still has error at line {error}")
    
    print(f"\n{'='*70}")
    print(f"Total string fixes: {total_fixes}")
    print(f"{'='*70}")

if __name__ == '__main__':
    main()