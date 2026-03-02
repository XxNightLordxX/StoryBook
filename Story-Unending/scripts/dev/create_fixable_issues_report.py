#!/usr/bin/env python3
"""
Script to create a report of fixable issues (excluding tests and acceptable patterns).
"""
import re
from pathlib import Path

# Patterns for fixable issues
fixable_patterns = {
    'eval(': r'eval\(',
    'document.write': r'document\.write\(',
    'prompt(': r'prompt\(',
}

# Files to scan (exclude tests)
code_dirs = [
    '/workspace/js',
    '/workspace/css',
]

# Files to exclude
exclude_files = [
    'tests/',
    'test-',
    'security.test.js',  # Security tests with alert examples
]

def should_exclude_file(filepath):
    """Check if file should be excluded."""
    filepath_str = str(filepath)
    for exclude in exclude_files:
        if exclude in filepath_str:
            return True
    return False

def scan_file_for_issues(filepath):
    """Scan a single file for fixable issues."""
    issues = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
            
        for i, line in enumerate(lines, 1):
            line_stripped = line.strip()
            
            # Skip empty lines and comments
            if not line_stripped:
                continue
            # Skip single-line comments
            if line_stripped.startswith('//'):
                continue
            # Skip JSDoc comments (lines starting with *)
            if line_stripped.startswith('*'):
                continue
            # Skip multi-line comment blocks
            if line_stripped.startswith('/*') or line_stripped.startswith('*/'):
                continue
                
            # Check for fixable issue patterns
            for issue_type, pattern in fixable_patterns.items():
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
    print("Scanning for FIXABLE code issues...\n")
    
    all_issues = []
    
    for code_dir in code_dirs:
        dir_path = Path(code_dir)
        if not dir_path.exists():
            continue
            
        # Get all JS and CSS files
        js_files = list(dir_path.glob('**/*.js'))
        css_files = list(dir_path.glob('**/*.css'))
        
        for file_path in js_files + css_files:
            if should_exclude_file(file_path):
                continue
                
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
    print(f"FIXABLE CODE ISSUES FOUND: {len(all_issues)}")
    print(f"{'='*80}\n")
    
    # Create consolidated report
    report_lines = [
        "# Fixable Code Issues Report",
        "",
        f"**Date**: 2026-02-27",
        f"**Total Fixable Issues Found**: {len(all_issues)}",
        "",
        "This report contains ONLY fixable code issues that need attention.",
        "Test files and acceptable patterns (alert, confirm, console.log) are excluded.",
        "",
        "---",
        "",
    ]
    
    if not all_issues:
        report_lines.append("## ✅ No Fixable Issues Found!")
        report_lines.append("")
        report_lines.append("Excellent! The codebase is clean of fixable issues.")
    else:
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
    report_path = Path('/workspace/FIXABLE_ISSUES_REPORT.md')
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report_lines))
    
    print(f"Report saved to: {report_path}")
    
    if all_issues:
        print(f"\nIssues by type:")
        sorted_types = sorted(issues_by_type.items(), key=lambda x: len(x[1]), reverse=True)
        for issue_type, issues in sorted_types:
            print(f"  - {issue_type}: {len(issues)}")

if __name__ == '__main__':
    main()