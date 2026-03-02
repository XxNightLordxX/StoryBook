#!/usr/bin/env python3
"""
Script to find ACTUAL code issues that need fixing.
"""
import os
import re
from pathlib import Path

# Patterns for actual code issues
actual_issue_patterns = {
    'TODO': r'//\s*TODO:|/\*\s*TODO:|#\s*TODO:',
    'FIXME': r'//\s*FIXME:|/\*\s*FIXME:|#\s*FIXME:',
    'XXX': r'//\s*XXX:|/\*\s*XXX:|#\s*XXX:',
    'HACK': r'//\s*HACK:|/\*\s*HACK:|#\s*HACK:',
    'console.log': r'console\.log\(',
    'console.debug': r'console\.debug\(',
    'console.warn': r'console\.warn\(',
    'alert(': r'alert\(',
    'confirm(': r'confirm\(',
    'prompt(': r'prompt\(',
    'eval(': r'eval\(',
    'innerHTML.*\+': r'innerHTML\s*\+=',
    'document.write': r'document\.write\(',
}

# Files to scan
code_dirs = [
    '/workspace/js',
    '/workspace/css',
    '/workspace/tests',
]

def scan_file_for_issues(filepath):
    """Scan a single file for actual code issues."""
    issues = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
            
        for i, line in enumerate(lines, 1):
            line_stripped = line.strip()
            
            # Skip empty lines
            if not line_stripped:
                continue
                
            # Check for actual issue patterns
            for issue_type, pattern in actual_issue_patterns.items():
                if re.search(pattern, line):
                    # Extract context
                    context = line.strip()
                    if len(context) > 150:
                        context = context[:150] + '...'
                    
                    issues.append({
                        'file': str(filepath.relative_to('/workspace')),
                        'line': i,
                        'type': issue_type,
                        'context': context
                    })
                    break  # Only record once per line
                    
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        
    return issues

def main():
    """Main function to scan all code files."""
    print("Scanning for ACTUAL code issues...\n")
    
    all_issues = []
    
    for code_dir in code_dirs:
        dir_path = Path(code_dir)
        if not dir_path.exists():
            continue
            
        # Get all JS and CSS files
        js_files = list(dir_path.glob('**/*.js'))
        css_files = list(dir_path.glob('**/*.css'))
        
        for file_path in js_files + css_files:
            issues = scan_file_for_issues(file_path)
            if issues:
                all_issues.extend(issues)
                print(f"Found {len(issues)} issues in {file_path.relative_to('/workspace')}")
    
    # Also check main files
    main_files = [
        '/workspace/index.html',
        '/workspace/story-engine.js',
        '/workspace/backstory-engine.js',
        '/workspace/styles.css',
    ]
    
    for filepath in main_files:
        path = Path(filepath)
        if path.exists():
            issues = scan_file_for_issues(path)
            if issues:
                all_issues.extend(issues)
                print(f"Found {len(issues)} issues in {path.name}")
    
    # Group issues by type
    issues_by_type = {}
    for issue in all_issues:
        issue_type = issue['type']
        if issue_type not in issues_by_type:
            issues_by_type[issue_type] = []
        issues_by_type[issue_type].append(issue)
    
    # Generate report
    print(f"\n{'='*80}")
    print(f"ACTUAL CODE ISSUES FOUND: {len(all_issues)}")
    print(f"{'='*80}\n")
    
    # Create consolidated report
    report_lines = [
        "# Actual Code Issues Report",
        "",
        f"**Date**: 2026-02-27",
        f"**Total Actual Issues Found**: {len(all_issues)}",
        "",
        "This report contains ACTUAL code issues that need fixing (TODO, FIXME, console.log, etc.).",
        "",
        "---",
        "",
    ]
    
    for issue_type, issues in sorted(issues_by_type.items()):
        report_lines.append(f"## {issue_type}")
        report_lines.append(f"**Count**: {len(issues)}")
        report_lines.append("")
        
        for issue in issues:
            report_lines.append(f"- **{issue['file']}:{issue['line']}**: {issue['context']}")
        
        report_lines.append("")
        report_lines.append("---")
        report_lines.append("")
    
    # Write report
    report_path = Path('/workspace/ACTUAL_CODE_ISSUES.md')
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report_lines))
    
    print(f"Report saved to: {report_path}")
    print(f"\nIssues by type:")
    
    sorted_types = sorted(issues_by_type.items(), key=lambda x: len(x[1]), reverse=True)
    for issue_type, issues in sorted_types:
        print(f"  - {issue_type}: {len(issues)}")

if __name__ == '__main__':
    main()