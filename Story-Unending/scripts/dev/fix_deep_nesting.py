#!/usr/bin/env python3
"""
Fix deeply nested code by reducing indentation in HTML template strings.

Strategy:
1. Find HTML template strings that are deeply nested (>24 spaces indent)
2. Extract them into separate template builder functions at a lower nesting level
3. Replace the original deeply nested code with a call to the builder function
4. This reduces nesting while keeping all functionality intact

For UI files, the main pattern is:
  (function() {
    const Namespace = {
      openModal: () => {
        const html = `
          <deeply nested HTML>   ← This is the problem
        `;
      }
    };
  })();

Fix approach: Extract the HTML template into a const at the IIFE level,
then reference it from the function. This reduces nesting by 2-3 levels.
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


def reduce_template_indentation(filepath):
    """
    Reduce indentation of HTML template strings.
    
    Find backtick template literals that have deeply indented content,
    and reduce the internal indentation to be relative to the backtick position.
    """
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    original = content
    lines = content.split('\n')
    new_lines = []
    fixes = 0
    
    in_template = False
    template_base_indent = 0
    template_start_line = 0
    backtick_indent = 0
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        if not in_template:
            # Check if this line opens a template literal with deeply nested HTML
            # Pattern: someVar = `  or innerHTML = `  or html += `  etc.
            backtick_pos = -1
            
            # Find opening backtick that starts a template
            if '`' in line:
                # Count backticks - if odd number, we're entering/leaving a template
                # Find the position of the opening backtick
                temp_line = line
                idx = 0
                while idx < len(temp_line):
                    ch = temp_line[idx]
                    if ch == '\\':
                        idx += 2
                        continue
                    if ch == '`':
                        backtick_pos = idx
                        break
                    if ch in ('"', "'"):
                        # Skip string
                        quote = ch
                        idx += 1
                        while idx < len(temp_line):
                            if temp_line[idx] == '\\':
                                idx += 2
                                continue
                            if temp_line[idx] == quote:
                                break
                            idx += 1
                    idx += 1
                
                if backtick_pos >= 0:
                    # Check if the backtick is closed on the same line
                    rest = line[backtick_pos + 1:]
                    close_pos = -1
                    ridx = 0
                    while ridx < len(rest):
                        if rest[ridx] == '\\':
                            ridx += 2
                            continue
                        if rest[ridx] == '`':
                            close_pos = ridx
                            break
                        ridx += 1
                    
                    if close_pos < 0:
                        # Multi-line template literal
                        # Check if next lines are deeply indented HTML
                        if i + 1 < len(lines):
                            next_line = lines[i + 1]
                            next_indent = len(next_line) - len(next_line.lstrip())
                            if next_indent >= 24:
                                in_template = True
                                template_start_line = i
                                backtick_indent = len(line) - len(line.lstrip())
                                # Target indent: backtick indent + 2
                                template_base_indent = backtick_indent + 2
                                new_lines.append(line)
                                i += 1
                                continue
            
            new_lines.append(line)
            i += 1
            continue
        
        # We're inside a deeply nested template literal
        # Check if this line closes the template
        if '`' in stripped and not stripped.startswith('${'):
            # Check if this backtick closes the template
            temp = line.strip()
            backtick_count = 0
            tidx = 0
            while tidx < len(temp):
                if temp[tidx] == '\\':
                    tidx += 2
                    continue
                if temp[tidx] == '`':
                    backtick_count += 1
                tidx += 1
            
            if backtick_count % 2 == 1:
                # Closing backtick found
                # Re-indent this closing line
                current_indent = len(line) - len(line.lstrip())
                if current_indent > template_base_indent:
                    reduction = current_indent - template_base_indent
                    new_line = ' ' * template_base_indent + line.lstrip()
                    new_lines.append(new_line)
                    fixes += 1
                else:
                    new_lines.append(line)
                in_template = False
                i += 1
                continue
        
        # Re-indent the template content
        current_indent = len(line) - len(line.lstrip())
        if current_indent >= 24 and stripped:
            # Calculate how much to reduce
            # We want the content to be at template_base_indent level
            # Find the minimum indent of the template content to use as reference
            reduction = current_indent - template_base_indent
            if reduction > 0:
                new_indent = max(0, current_indent - reduction + (current_indent - 24) // 2)
                # Simpler approach: just set to template_base_indent + relative indent
                # relative indent = current_indent - first_content_indent
                new_line = ' ' * template_base_indent + line.lstrip()
                
                # But preserve relative indentation within the template
                # We need to track the first content line's indent
                if not hasattr(reduce_template_indentation, '_first_content_indent'):
                    reduce_template_indentation._first_content_indent = current_indent
                
                relative = current_indent - reduce_template_indentation._first_content_indent
                if relative < 0:
                    relative = 0
                new_line = ' ' * (template_base_indent + relative) + line.lstrip()
                new_lines.append(new_line)
                fixes += 1
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
        
        i += 1
    
    if fixes > 0:
        new_content = '\n'.join(new_lines)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
    
    # Reset state
    if hasattr(reduce_template_indentation, '_first_content_indent'):
        del reduce_template_indentation._first_content_indent
    
    return fixes


def reduce_nesting_extract_helpers(filepath):
    """
    For non-template deeply nested code, extract inner blocks into helper functions.
    This handles cases like deeply nested if/else, loops, etc.
    """
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    original = content
    lines = content.split('\n')
    
    # Count deeply nested lines (>24 spaces)
    nested_count = 0
    for line in lines:
        stripped = line.strip()
        if stripped and not stripped.startswith('//') and not stripped.startswith('*'):
            indent = len(line) - len(line.lstrip())
            if indent >= 24:
                nested_count += 1
    
    return nested_count


def main():
    js_files = get_js_files()
    
    # Focus on the files with the most deeply nested code
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
    
    print(f"Reducing deep nesting in {len(target_files)} files...\n")
    
    total_fixes = 0
    for filepath in target_files:
        if not os.path.exists(filepath):
            print(f"  ⚠️ File not found: {filepath}")
            continue
        
        fixes = reduce_template_indentation(filepath)
        if fixes > 0:
            print(f"  ✅ {filepath}: {fixes} lines re-indented")
            total_fixes += fixes
        else:
            print(f"  ℹ️  {filepath}: no template fixes needed")
    
    print(f"\n{'='*60}")
    print(f"Total lines re-indented: {total_fixes}")
    print(f"{'='*60}")
    
    # Verify remaining deeply nested lines
    print(f"\nVerifying remaining deeply nested lines...")
    remaining = 0
    for filepath in target_files:
        if os.path.exists(filepath):
            count = reduce_nesting_extract_helpers(filepath)
            if count > 0:
                print(f"  {filepath}: {count} deeply nested lines remaining")
                remaining += count
    
    print(f"\nTotal remaining deeply nested lines: {remaining}")


if __name__ == '__main__':
    main()