#!/usr/bin/env python3
"""
Fix deeply nested code by reducing indentation inside template literals.

The pattern is:
  (function() {           ← level 0
    const NS = {          ← level 1
      method: () => {     ← level 2
        const html = `    ← level 3
            <div>         ← level 4+ (DEEPLY NESTED - the problem)
              <h2>        ← level 5+
            </div>        ← level 4+
        `;                ← level 3
      }
    };
  })();

Fix: Reduce the indentation inside template literals so the HTML
starts at 2 spaces relative to the backtick, preserving internal
relative indentation.
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


def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        lines = f.readlines()
    
    new_lines = []
    fixes = 0
    in_template = False
    template_min_indent = None
    target_base_indent = 0
    backtick_line_indent = 0
    
    i = 0
    while i < len(lines):
        line = lines[i]
        raw = line.rstrip('\n')
        
        if not in_template:
            # Look for opening of a multi-line template literal
            # Pattern: something = ` or something += ` or innerHTML = ` etc.
            # The backtick must be the last non-whitespace char (or followed only by whitespace)
            stripped = raw.strip()
            
            if stripped.endswith('`') and not stripped.endswith('\\`'):
                # Check it's an opening backtick (odd count on this line)
                backtick_count = 0
                in_str = None
                for ci, ch in enumerate(raw):
                    if ch == '\\' and ci + 1 < len(raw):
                        continue
                    if ch == '`' and in_str is None:
                        backtick_count += 1
                    elif ch in ('"', "'") and in_str is None:
                        in_str = ch
                    elif ch == in_str:
                        in_str = None
                
                if backtick_count == 1:
                    # This opens a template literal
                    backtick_line_indent = len(raw) - len(raw.lstrip())
                    target_base_indent = backtick_line_indent + 2
                    
                    # Peek ahead to see if next lines are deeply indented
                    if i + 1 < len(lines):
                        next_raw = lines[i + 1].rstrip('\n')
                        next_stripped = next_raw.strip()
                        if next_stripped:
                            next_indent = len(next_raw) - len(next_raw.lstrip())
                            if next_indent >= 20:  # Deeply nested threshold
                                in_template = True
                                template_min_indent = None
                                new_lines.append(line)
                                i += 1
                                continue
            
            new_lines.append(line)
            i += 1
            continue
        
        # Inside a template literal
        raw = line.rstrip('\n')
        stripped = raw.strip()
        
        # Check for closing backtick
        has_closing = False
        if '`' in raw:
            # Check if this line has a closing backtick (not escaped, not in ${})
            temp = raw
            depth = 0
            for ci in range(len(temp)):
                ch = temp[ci]
                if ch == '\\' and ci + 1 < len(temp):
                    continue
                if ch == '$' and ci + 1 < len(temp) and temp[ci + 1] == '{':
                    depth += 1
                elif ch == '{' and depth > 0:
                    depth += 1
                elif ch == '}' and depth > 0:
                    depth -= 1
                elif ch == '`' and depth == 0:
                    has_closing = True
                    break
        
        if has_closing:
            # Closing line - re-indent to target level
            if stripped == '`;' or stripped == '`':
                new_line = ' ' * backtick_line_indent + stripped + '\n'
                if len(raw) - len(raw.lstrip()) >= 20:
                    fixes += 1
                new_lines.append(new_line)
            else:
                # Closing backtick with content
                current_indent = len(raw) - len(raw.lstrip())
                if current_indent >= 20 and template_min_indent is not None:
                    reduction = template_min_indent - target_base_indent
                    new_indent = max(0, current_indent - reduction)
                    new_line = ' ' * new_indent + stripped + '\n'
                    fixes += 1
                    new_lines.append(new_line)
                else:
                    new_lines.append(line)
            in_template = False
            template_min_indent = None
            i += 1
            continue
        
        # Content line inside template
        current_indent = len(raw) - len(raw.lstrip())
        
        if stripped and current_indent >= 20:
            # Track minimum indent of content
            if template_min_indent is None or current_indent < template_min_indent:
                template_min_indent = current_indent
            
            # Calculate reduction
            if template_min_indent is not None:
                reduction = template_min_indent - target_base_indent
                if reduction > 0:
                    new_indent = max(0, current_indent - reduction)
                    new_line = ' ' * new_indent + stripped + '\n'
                    fixes += 1
                    new_lines.append(new_line)
                    i += 1
                    continue
        elif stripped == '' or not stripped:
            # Empty line inside template - keep it
            new_lines.append(line)
            i += 1
            continue
        
        new_lines.append(line)
        i += 1
    
    if fixes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
    
    return fixes


def count_deeply_nested(filepath):
    """Count remaining deeply nested lines"""
    count = 0
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        for line in f:
            raw = line.rstrip('\n')
            stripped = raw.strip()
            if stripped and not stripped.startswith('//') and not stripped.startswith('*'):
                indent = len(raw) - len(raw.lstrip())
                if indent >= 24:
                    count += 1
    return count


def main():
    target_files = [
        'js/ui/user-features-ui.js',
        'js/ui/leaderboards-ui.js',
        'js/ui/content-management-ui.js',
        'js/ui/notifications-ui.js',
        'js/ui/analytics-ui.js',
        'js/ui/backup-ui.js',
        'js/modules/content-management.js',
        'js/modules/backup.js',
        'js/modules/notifications.js',
        'js/modules/leaderboards.js',
        'js/ui/search-ui-enhanced.js',
    ]
    
    print(f"Reducing template literal indentation in {len(target_files)} files...\n")
    
    total_fixes = 0
    for filepath in target_files:
        if not os.path.exists(filepath):
            print(f"  ⚠️ Not found: {filepath}")
            continue
        
        before = count_deeply_nested(filepath)
        fixes = fix_file(filepath)
        after = count_deeply_nested(filepath)
        
        if fixes > 0:
            print(f"  ✅ {filepath}: {fixes} lines re-indented ({before} → {after} deeply nested)")
            total_fixes += fixes
        else:
            print(f"  ℹ️  {filepath}: no fixes ({before} deeply nested)")
    
    print(f"\n{'='*60}")
    print(f"Total lines re-indented: {total_fixes}")
    print(f"{'='*60}")
    
    # Final count
    print(f"\nFinal deeply nested line counts:")
    total_remaining = 0
    for filepath in target_files:
        if os.path.exists(filepath):
            count = count_deeply_nested(filepath)
            if count > 0:
                print(f"  {filepath}: {count}")
            total_remaining += count
    print(f"\nTotal remaining: {total_remaining}")


if __name__ == '__main__':
    main()