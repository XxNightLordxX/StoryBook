#!/usr/bin/env python3
import os
import re

# Common issues to check for
issues = {
    'missing_null_check': [
        r'\.getElementById\([^)]+\)\.(?!style\.|classList\.|textContent|value|innerHTML|focus|blur|click|addEventListener|remove)',
        r'\.querySelector\([^)]+\)\.(?!style\.|classList\.|textContent|value|innerHTML|focus|blur|click|addEventListener|remove)',
    ],
    'undefined_function': [
        r'\b(showNotification|closeModal|openModal|updateBadge|addSidebarItem)\s*\(',
    ],
    'console_log': [
        r'console\.log\(',
    ],
    'debugger': [
        r'\bdebugger\b',
    ],
    'alert': [
        r'\balert\s*\(',
    ],
}

def check_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        lines = content.split('\n')
    
    file_issues = {}
    for issue_type, patterns in issues.items():
        for pattern in patterns:
            for i, line in enumerate(lines, 1):
                if re.search(pattern, line):
                    if issue_type not in file_issues:
                        file_issues[issue_type] = []
                    file_issues[issue_type].append((i, line.strip()))
    
    return file_issues

def main():
    js_files = []
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in root:
            continue
        for file in files:
            if file.endswith('.js'):
                js_files.append(os.path.join(root, file))
    
    print(f"Found {len(js_files)} JavaScript files to review\n")
    
    total_issues = 0
    for filepath in sorted(js_files):
        file_issues = check_file(filepath)
        if file_issues:
            print(f"\n{'='*80}")
            print(f"File: {filepath}")
            print('='*80)
            for issue_type, occurrences in file_issues.items():
                print(f"\n{issue_type.upper().replace('_', ' ')}:")
                for line_num, line in occurrences:
                    print(f"  Line {line_num}: {line[:100]}")
                    total_issues += 1
    
    print(f"\n{'='*80}")
    print(f"Total issues found: {total_issues}")
    print('='*80)

if __name__ == '__main__':
    main()