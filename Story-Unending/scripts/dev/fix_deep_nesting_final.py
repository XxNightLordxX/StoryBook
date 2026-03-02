#!/usr/bin/env python3
"""
Fix deeply nested code - FINAL version.

Reduces indentation inside ALL multi-line template literals
so content starts at backtick_indent + 2, preserving relative indentation.
This eliminates deeply nested HTML template strings.
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
    Find all multi-line template literal regions.
    Returns list of (start_line, end_line, backtick_indent).
    Handles nested ${} expressions containing backticks.
    """
    regions = []
    i = 0
    
    while i < len(lines):
        raw = lines[i].rstrip('\n').rstrip('\r')
        
        # Look for opening backtick of a multi-line template
        j = 0
        in_sq = False
        in_dq = False
        
        while j < len(raw):
            ch = raw[j]
            
            if ch == '\\' and j + 1 < len(raw):
                j += 2
                continue
            
            if ch == "'" and not in_dq:
                in_sq = not in_sq
            elif ch == '"' and not in_sq:
                in_dq = not in_dq
            elif ch == '`' and not in_sq and not in_dq:
                # Found a backtick - check if it closes on same line
                k = j + 1
                closed = False
                expr_depth = 0
                while k < len(raw):
                    rch = raw[k]
                    if rch == '\\' and k + 1 < len(raw):
                        k += 2
                        continue
                    if rch == '$' and k + 1 < len(raw) and raw[k+1] == '{':
                        expr_depth += 1
                        k += 2
                        continue
                    if rch == '{' and expr_depth > 0:
                        expr_depth += 1
                    elif rch == '}' and expr_depth > 0:
                        expr_depth -= 1
                    elif rch == '`' and expr_depth == 0:
                        closed = True
                        break
                    k += 1
                
                if not closed:
                    # Multi-line template - find closing backtick
                    backtick_indent = len(lines[i]) - len(lines[i].lstrip())
                    end_line = find_closing_backtick(lines, i + 1)
                    if end_line is not None:
                        regions.append((i, end_line, backtick_indent))
                        i = end_line  # skip to end of template
                    break
            
            j += 1
        
        i += 1
    
    return regions


def find_closing_backtick(lines, start):
    """Find the line containing the closing backtick for a template literal."""
    expr_depth = 0
    
    for i in range(start, len(lines)):
        raw = lines[i].rstrip('\n').rstrip('\r')
        j = 0
        
        while j < len(raw):
            ch = raw[j]
            
            if ch == '\\' and j + 1 < len(raw):
                j += 2
                continue
            
            if ch == '$' and j + 1 < len(raw) and raw[j+1] == '{':
                expr_depth += 1
                j += 2
                continue
            
            if ch == '{' and expr_depth > 0:
                expr_depth += 1
            elif ch == '}' and expr_depth > 0:
                expr_depth -= 1
            elif ch == '`' and expr_depth == 0:
                return i
            
            j += 1
    
    return None


def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        lines = f.readlines()
    
    regions = find_template_regions(lines)
    if not regions:
        return 0
    
    new_lines = list(lines)
    fixes = 0
    
    for start_line, end_line, backtick_indent in regions:
        target_indent = backtick_indent + 2
        
        # Collect content lines (between start+1 and end_line)
        content_lines_idx = list(range(start_line + 1, end_line))
        
        if not content_lines_idx:
            continue
        
        # Find minimum indent of non-empty content lines
        min_indent = None
        has_deep = False
        for li in content_lines_idx:
            raw = new_lines[li].rstrip('\n').rstrip('\r')
            stripped = raw.strip()
            if stripped:
                indent = len(raw) - len(raw.lstrip())
                if min_indent is None or indent < min_indent:
                    min_indent = indent
                if indent >= 24:
                    has_deep = True
        
        if min_indent is None or not has_deep:
            continue
        
        # Calculate reduction needed
        reduction = min_indent - target_indent
        if reduction <= 0:
            continue
        
        # Re-indent all content lines
        for li in content_lines_idx:
            raw = new_lines[li].rstrip('\n').rstrip('\r')
            stripped = raw.strip()
            
            if not stripped:
                new_lines[li] = '\n'
                continue
            
            current_indent = len(raw) - len(raw.lstrip())
            new_indent = max(0, current_indent - reduction)
            new_lines[li] = ' ' * new_indent + stripped + '\n'
            
            if current_indent != new_indent:
                fixes += 1
        
        # Fix closing line too
        closing_raw = new_lines[end_line].rstrip('\n').rstrip('\r')
        closing_stripped = closing_raw.strip()
        closing_indent = len(closing_raw) - len(closing_raw.lstrip())
        new_closing_indent = max(0, closing_indent - reduction)
        if closing_indent != new_closing_indent:
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
            print(f"  ⏭️  {filepath}: {before} deeply nested (no template fixes)")
    
    print(f"\n{'='*60}")
    print(f"RESULTS")
    print(f"{'='*60}")
    print(f"  Total lines re-indented: {total_fixes}")
    print(f"  Deeply nested before:    {total_before}")
    print(f"  Deeply nested after:     {total_after}")
    reduction = total_before - total_after
    pct = (reduction / max(total_before, 1)) * 100
    print(f"  Reduction:               {reduction} ({pct:.1f}%)")
    print(f"{'='*60}")


if __name__ == '__main__':
    main()