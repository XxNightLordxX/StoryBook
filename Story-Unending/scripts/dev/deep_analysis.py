#!/usr/bin/env python3
"""
Deep Analysis Script - Categorize ALL low-priority issues with exact file:line locations
"""

import os
import re
import json

# Directories to scan (only production JS files)
JS_DIRS = ['js']
EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'coverage', 'tests', 'scripts', 'utils']

results = {
    'var_declarations': [],
    'loose_equality_eq': [],
    'loose_equality_neq': [],
    'console_error': [],
    'console_warn': [],
    'console_log': [],
    'console_debug': [],
    'console_info': [],
    'function_declarations': [],
    'deeply_nested': [],
    'large_files': [],
    'empty_catch': [],
    'throw_without_catch': [],
}

def get_js_files():
    """Get all production JavaScript files"""
    js_files = []
    for js_dir in JS_DIRS:
        if not os.path.exists(js_dir):
            continue
        for root, dirs, files in os.walk(js_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for f in files:
                if f.endswith('.js') and not f.endswith('.backup'):
                    js_files.append(os.path.join(root, f))
    return sorted(js_files)

def analyze_file(filepath):
    """Analyze a single file for all issue types"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
            lines = content.split('\n')
    except Exception as e:
        print(f"  ERROR reading {filepath}: {e}")
        return

    filesize = os.path.getsize(filepath)
    if filesize > 100000:
        results['large_files'].append({
            'file': filepath,
            'line': 0,
            'size_kb': round(filesize / 1024, 1),
            'text': f'File size: {round(filesize/1024, 1)}KB'
        })

    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        # Skip comments
        if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
            continue

        # Skip strings that contain patterns (rough heuristic: skip lines that are mostly strings)
        # We'll be more precise per-pattern below

        # --- var declarations ---
        # Match: var x = ...; or var x, y; but NOT inside strings or comments
        var_match = re.search(r'\bvar\s+[a-zA-Z_$]', line)
        if var_match:
            # Make sure it's not inside a string or comment
            before = line[:var_match.start()]
            if not _in_string_or_comment(before, line):
                results['var_declarations'].append({
                    'file': filepath,
                    'line': i,
                    'text': stripped[:120]
                })

        # --- loose equality == (but not ===) ---
        eq_matches = list(re.finditer(r'[^!=]==[^=]', line))
        for m in eq_matches:
            before = line[:m.start()]
            if not _in_string_or_comment(before, line):
                results['loose_equality_eq'].append({
                    'file': filepath,
                    'line': i,
                    'text': stripped[:120]
                })

        # --- loose inequality != (but not !==) ---
        neq_matches = list(re.finditer(r'!=[^=]', line))
        for m in neq_matches:
            before = line[:m.start()]
            if not _in_string_or_comment(before, line):
                results['loose_equality_neq'].append({
                    'file': filepath,
                    'line': i,
                    'text': stripped[:120]
                })

        # --- console statements ---
        for ctype in ['error', 'warn', 'log', 'debug', 'info']:
            pattern = rf'console\.{ctype}\s*\('
            cmatch = re.search(pattern, line)
            if cmatch:
                before = line[:cmatch.start()]
                if not _in_string_or_comment(before, line):
                    results[f'console_{ctype}'].append({
                        'file': filepath,
                        'line': i,
                        'text': stripped[:120]
                    })

        # --- function declarations (not arrow, not method) ---
        func_match = re.search(r'\bfunction\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(', line)
        if func_match:
            before = line[:func_match.start()]
            if not _in_string_or_comment(before, line):
                results['function_declarations'].append({
                    'file': filepath,
                    'line': i,
                    'text': stripped[:120]
                })

        # Also catch: var/let/const x = function(
        anon_func_match = re.search(r'=\s*function\s*\(', line)
        if anon_func_match:
            before = line[:anon_func_match.start()]
            if not _in_string_or_comment(before, line):
                results['function_declarations'].append({
                    'file': filepath,
                    'line': i,
                    'text': stripped[:120]
                })

        # --- deeply nested code (>6 levels = 24 spaces or 6 tabs) ---
        if line and not stripped.startswith('//') and not stripped.startswith('*'):
            indent = len(line) - len(line.lstrip())
            if indent >= 24 and len(stripped) > 5:
                results['deeply_nested'].append({
                    'file': filepath,
                    'line': i,
                    'indent_level': indent // 4 if '    ' in line[:indent] else indent // 2,
                    'text': stripped[:120]
                })

        # --- empty catch blocks ---
        if re.search(r'catch\s*\([^)]*\)\s*\{\s*\}', line):
            results['empty_catch'].append({
                'file': filepath,
                'line': i,
                'text': stripped[:120]
            })


def _in_string_or_comment(before_text, full_line):
    """Rough check if position is inside a string or comment"""
    # Check if we're inside a line comment
    comment_pos = full_line.find('//')
    if comment_pos >= 0 and len(before_text) >= comment_pos:
        return True

    # Count unescaped quotes before position
    single_quotes = before_text.count("'") - before_text.count("\\'")
    double_quotes = before_text.count('"') - before_text.count('\&quot;')
    backticks = before_text.count('`')

    # If odd number of any quote type, we're likely inside a string
    if single_quotes % 2 != 0 or double_quotes % 2 != 0 or backticks % 2 != 0:
        return True

    return False


def main():
    js_files = get_js_files()
    print(f"Scanning {len(js_files)} production JavaScript files...\n")

    for filepath in js_files:
        print(f"  Analyzing: {filepath}")
        analyze_file(filepath)

    # Print summary
    print("\n" + "=" * 70)
    print("DEEP ANALYSIS RESULTS")
    print("=" * 70)

    total = 0
    for category, items in results.items():
        count = len(items)
        total += count
        print(f"  {category}: {count}")

    print(f"\n  TOTAL ISSUES: {total}")
    print("=" * 70)

    # Print per-file breakdown
    print("\nPER-FILE BREAKDOWN:")
    print("-" * 70)

    file_counts = {}
    for category, items in results.items():
        for item in items:
            f = item['file']
            if f not in file_counts:
                file_counts[f] = {}
            if category not in file_counts[f]:
                file_counts[f][category] = 0
            file_counts[f][category] += 1

    for filepath in sorted(file_counts.keys()):
        counts = file_counts[filepath]
        total_file = sum(counts.values())
        print(f"\n  {filepath} ({total_file} issues):")
        for cat, count in sorted(counts.items(), key=lambda x: -x[1]):
            print(f"    {cat}: {count}")

    # Save detailed results
    with open('LOW_PRIORITY_ANALYSIS.json', 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\nDetailed results saved to LOW_PRIORITY_ANALYSIS.json")


if __name__ == '__main__':
    main()