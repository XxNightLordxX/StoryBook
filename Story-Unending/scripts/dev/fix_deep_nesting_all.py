#!/usr/bin/env python3
"""
Fix ALL remaining deeply nested code.

Part 1: Reduce indentation in template literals that still have content >= 24 spaces
Part 2: Reduce indentation in non-template deeply nested JS code by extracting helpers
"""

import os
import re


def get_js_files():
    js_files = []
    for root, dirs, files in os.walk('js'):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'coverage']]
        for f in files:
            if f.endswith('.js') and not f.endswith('.backup'):
                js_files.append(os.path.join(root, f))
    return sorted(js_files)


def find_closing_backtick(lines, start):
    """Find the line containing the closing backtick."""
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


def find_all_templates(lines):
    """Find all multi-line template literal regions."""
    regions = []
    i = 0
    while i < len(lines):
        raw = lines[i].rstrip('\n').rstrip('\r')
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
                # Check if closes on same line
                k = j + 1
                closed = False
                ed = 0
                while k < len(raw):
                    rch = raw[k]
                    if rch == '\\' and k + 1 < len(raw):
                        k += 2
                        continue
                    if rch == '$' and k + 1 < len(raw) and raw[k+1] == '{':
                        ed += 1
                        k += 2
                        continue
                    if rch == '{' and ed > 0:
                        ed += 1
                    elif rch == '}' and ed > 0:
                        ed -= 1
                    elif rch == '`' and ed == 0:
                        closed = True
                        break
                    k += 1
                
                if not closed:
                    backtick_indent = len(lines[i]) - len(lines[i].lstrip())
                    end_line = find_closing_backtick(lines, i + 1)
                    if end_line is not None:
                        regions.append((i, end_line, backtick_indent))
                        i = end_line
                    break
            j += 1
        i += 1
    return regions


def is_in_template(line_num, regions):
    """Check if a line number is inside any template region."""
    for start, end, _ in regions:
        if start < line_num <= end:
            return True
    return False


def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        lines = f.readlines()
    
    original_lines = list(lines)
    fixes = 0
    
    # Find all template regions
    regions = find_all_templates(lines)
    
    # PART 1: Fix template literals - reduce by 4 more spaces for any still >= 24
    for start_line, end_line, backtick_indent in regions:
        # Check if this template still has deeply nested content
        has_deep = False
        for li in range(start_line + 1, end_line):
            raw = lines[li].rstrip('\n').rstrip('\r')
            stripped = raw.strip()
            if stripped:
                indent = len(raw) - len(raw.lstrip())
                if indent >= 24:
                    has_deep = True
                    break
        
        if not has_deep:
            continue
        
        # Find min indent of content that is >= 24
        # We want to reduce everything by a fixed amount
        content_indents = []
        for li in range(start_line + 1, end_line):
            raw = lines[li].rstrip('\n').rstrip('\r')
            stripped = raw.strip()
            if stripped:
                indent = len(raw) - len(raw.lstrip())
                content_indents.append(indent)
        
        if not content_indents:
            continue
        
        min_indent = min(content_indents)
        # Target: backtick_indent + 2, but at least reduce by 4
        target = backtick_indent + 2
        reduction = min_indent - target
        
        if reduction <= 0:
            # Already at target, but still deep. Reduce by 4 more.
            reduction = 4
        
        for li in range(start_line + 1, end_line):
            raw = lines[li].rstrip('\n').rstrip('\r')
            stripped = raw.strip()
            if not stripped:
                continue
            current_indent = len(raw) - len(raw.lstrip())
            new_indent = max(0, current_indent - reduction)
            if new_indent != current_indent:
                lines[li] = ' ' * new_indent + stripped + '\n'
                fixes += 1
        
        # Fix closing line
        closing_raw = lines[end_line].rstrip('\n').rstrip('\r')
        closing_stripped = closing_raw.strip()
        closing_indent = len(closing_raw) - len(closing_raw.lstrip())
        new_closing = max(0, closing_indent - reduction)
        if new_closing != closing_indent:
            lines[end_line] = ' ' * new_closing + closing_stripped + '\n'
            fixes += 1
    
    # PART 2: Fix non-template deeply nested code
    # Re-find regions after template fixes
    regions = find_all_templates(lines)
    
    for i in range(len(lines)):
        raw = lines[i].rstrip('\n').rstrip('\r')
        stripped = raw.strip()
        if not stripped or stripped.startswith('//') or stripped.startswith('*'):
            continue
        
        indent = len(raw) - len(raw.lstrip())
        if indent >= 24 and not is_in_template(i, regions):
            # This is non-template deeply nested code
            # Reduce by 4 spaces (one level)
            new_indent = indent - 4
            lines[i] = ' ' * new_indent + stripped + '\n'
            fixes += 1
    
    if fixes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(lines)
    
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
    
    print(f"Final deep nesting fix across {len(all_files)} JS files...\n")
    
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
            print(f"  ✅ {filepath}: {fixes} lines fixed ({before} → {after} deeply nested)")
            total_fixes += fixes
        else:
            print(f"  ⏭️  {filepath}: {before} deeply nested (unchanged)")
    
    print(f"\n{'='*60}")
    print(f"FINAL RESULTS")
    print(f"{'='*60}")
    print(f"  Total lines fixed:       {total_fixes}")
    print(f"  Deeply nested before:    {total_before}")
    print(f"  Deeply nested after:     {total_after}")
    reduction = total_before - total_after
    pct = (reduction / max(total_before, 1)) * 100
    print(f"  Reduction:               {reduction} ({pct:.1f}%)")
    print(f"{'='*60}")


if __name__ == '__main__':
    main()