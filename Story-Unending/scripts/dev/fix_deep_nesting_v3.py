#!/usr/bin/env python3
"""
Fix deeply nested code v3 - Robust template literal indentation reducer.

Scans all JS files for multi-line template literals (backtick strings)
whose content is indented >= 20 spaces, and reduces the indentation
to be relative to the opening backtick position + 2 spaces.
"""

import os
import sys

def get_js_files():
    js_files = []
    for root, dirs, files in os.walk('js'):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'coverage']]
        for f in files:
            if f.endswith('.js') and not f.endswith('.backup'):
                js_files.append(os.path.join(root, f))
    return sorted(js_files)


def find_template_regions(lines):
    """
    Find all multi-line template literal regions in the file.
    Returns list of (start_line, end_line, backtick_indent) tuples.
    """
    regions = []
    i = 0
    in_template = False
    template_start = 0
    backtick_indent = 0
    
    # Track nesting of template expressions ${...}
    expr_depth = 0
    
    while i < len(lines):
        raw = lines[i].rstrip('\n').rstrip('\r')
        
        if not in_template:
            # Look for an opening backtick
            j = 0
            in_sq = False
            in_dq = False
            found_open = False
            
            while j < len(raw):
                ch = raw[j]
                
                # Handle escape
                if ch == '\\' and j + 1 < len(raw):
                    j += 2
                    continue
                
                # Track string context
                if ch == "'" and not in_dq:
                    in_sq = not in_sq
                elif ch == '"' and not in_sq:
                    in_dq = not in_dq
                elif ch == '`' and not in_sq and not in_dq:
                    # Found a backtick - check if it closes on same line
                    rest = raw[j+1:]
                    k = 0
                    closed = False
                    while k < len(rest):
                        rch = rest[k]
                        if rch == '\\' and k + 1 < len(rest):
                            k += 2
                            continue
                        if rch == '`':
                            closed = True
                            break
                        k += 1
                    
                    if not closed:
                        # Multi-line template starts here
                        in_template = True
                        template_start = i
                        backtick_indent = len(lines[i]) - len(lines[i].lstrip())
                        expr_depth = 0
                        found_open = True
                        break
                
                j += 1
        else:
            # Inside a template literal - look for closing backtick
            raw_line = lines[i].rstrip('\n').rstrip('\r')
            j = 0
            
            while j < len(raw_line):
                ch = raw_line[j]
                
                if ch == '\\' and j + 1 < len(raw_line):
                    j += 2
                    continue
                
                if ch == '$' and j + 1 < len(raw_line) and raw_line[j+1] == '{':
                    expr_depth += 1
                    j += 2
                    continue
                
                if ch == '{' and expr_depth > 0:
                    expr_depth += 1
                elif ch == '}' and expr_depth > 0:
                    expr_depth -= 1
                elif ch == '`' and expr_depth == 0:
                    # Found closing backtick
                    regions.append((template_start, i, backtick_indent))
                    in_template = False
                    break
                
                j += 1
        
        i += 1
    
    return regions


def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        lines = f.readlines()
    
    # Find all template regions
    regions = find_template_regions(lines)
    
    if not regions:
        return 0
    
    fixes = 0
    new_lines = list(lines)  # copy
    
    for start_line, end_line, backtick_indent in regions:
        # Only process if the template has deeply nested content
        target_indent = backtick_indent + 2
        
        # Find the minimum indent of content lines in this template
        # (skip the opening and closing lines)
        content_indents = []
        for li in range(start_line + 1, end_line):
            raw = new_lines[li].rstrip('\n').rstrip('\r')
            stripped = raw.strip()
            if stripped:  # non-empty line
                indent = len(raw) - len(raw.lstrip())
                content_indents.append(indent)
        
        if not content_indents:
            continue
        
        min_indent = min(content_indents)
        
        # Only fix if content is deeply nested (>= 20 spaces)
        if min_indent < 20:
            continue
        
        # Calculate reduction
        reduction = min_indent - target_indent
        if reduction <= 0:
            continue
        
        # Re-indent all content lines (between start+1 and end-1 inclusive)
        for li in range(start_line + 1, end_line):
            raw = new_lines[li].rstrip('\n').rstrip('\r')
            stripped = raw.strip()
            
            if not stripped:
                # Keep empty lines
                new_lines[li] = '\n'
                continue
            
            current_indent = len(raw) - len(raw.lstrip())
            new_indent = max(0, current_indent - reduction)
            new_lines[li] = ' ' * new_indent + stripped + '\n'
            
            if current_indent != new_indent:
                fixes += 1
        
        # Also fix the closing line if it's deeply indented
        closing_raw = new_lines[end_line].rstrip('\n').rstrip('\r')
        closing_stripped = closing_raw.strip()
        closing_indent = len(closing_raw) - len(closing_raw.lstrip())
        if closing_indent >= 20:
            new_closing_indent = max(0, closing_indent - reduction)
            new_lines[end_line] = ' ' * new_closing_indent + closing_stripped + '\n'
            fixes += 1
    
    if fixes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
    
    return fixes


def count_deeply_nested(filepath):
    count = 0
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        for line in f:
            raw = line.rstrip('\n').rstrip('\r')
            stripped = raw.strip()
            if stripped and not stripped.startswith('//') and not stripped.startswith('*'):
                indent = len(raw) - len(raw.lstrip())
                if indent >= 24:
                    count += 1
    return count


def main():
    all_files = get_js_files()
    
    print(f"Scanning {len(all_files)} JS files for deeply nested template literals...\n")
    
    total_fixes = 0
    total_before = 0
    total_after = 0
    
    for filepath in all_files:
        before = count_deeply_nested(filepath)
        if before == 0:
            continue
        
        total_before += before
        fixes = fix_file(filepath)
        after = count_deeply_nested(filepath)
        total_after += after
        
        if fixes > 0:
            print(f"  ✅ {filepath}: {fixes} lines re-indented ({before} → {after} deeply nested)")
            total_fixes += fixes
        else:
            print(f"  ⏭️  {filepath}: {before} deeply nested (no template fixes possible)")
    
    print(f"\n{'='*60}")
    print(f"RESULTS")
    print(f"{'='*60}")
    print(f"  Total lines re-indented: {total_fixes}")
    print(f"  Deeply nested before:    {total_before}")
    print(f"  Deeply nested after:     {total_after}")
    print(f"  Reduction:               {total_before - total_after} ({((total_before - total_after) / max(total_before, 1) * 100):.1f}%)")
    print(f"{'='*60}")


if __name__ == '__main__':
    main()