#!/usr/bin/env python3
"""
Script to scan all documentation files for issues, errors, and problems.
"""
import os
import re
from pathlib import Path

# Keywords that indicate issues or errors
issue_keywords = [
    r'issue',
    r'error',
    r'bug',
    r'problem',
    r'fix',
    r'warning',
    r'failed',
    r'failure',
    r'not working',
    r'broken',
    r'missing',
    r'incorrect',
    r'wrong',
    r'exception',
    r'crash',
    r'vulnerability',
    r'security',
    r'todo',
    r'FIXME',
    r'XXX',
    r'HACK',
    r'NOTE:',
    r'WARNING:',
    r'IMPORTANT:',
    r'CAUTION:',
]

def scan_file_for_issues(filepath):
    """Scan a single file for issues."""
    issues = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
            
        for i, line in enumerate(lines, 1):
            line_lower = line.lower()
            
            # Check for issue keywords
            for keyword in issue_keywords:
                if re.search(rf'\b{keyword}\b', line_lower):
                    # Extract context
                    context = line.strip()
                    if len(context) > 200:
                        context = context[:200] + '...'
                    
                    issues.append({
                        'file': filepath.name,
                        'line': i,
                        'keyword': keyword,
                        'context': context
                    })
                    break  # Only record once per line
                    
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        
    return issues

def main():
    """Main function to scan all documentation files."""
    docs_dir = Path('/workspace/docs')
    
    if not docs_dir.exists():
        print("Documentation directory not found!")
        return
    
    # Get all markdown files
    md_files = list(docs_dir.glob('*.md'))
    
    print(f"Scanning {len(md_files)} documentation files...\n")
    
    all_issues = []
    
    for md_file in sorted(md_files):
        issues = scan_file_for_issues(md_file)
        if issues:
            all_issues.extend(issues)
            print(f"Found {len(issues)} issues in {md_file.name}")
    
    # Group issues by file
    issues_by_file = {}
    for issue in all_issues:
        file = issue['file']
        if file not in issues_by_file:
            issues_by_file[file] = []
        issues_by_file[file].append(issue)
    
    # Generate report
    print(f"\n{'='*80}")
    print(f"TOTAL ISSUES FOUND: {len(all_issues)}")
    print(f"{'='*80}\n")
    
    # Create consolidated report
    report_lines = [
        "# Consolidated Issues Report",
        "",
        f"**Date**: 2026-02-27",
        f"**Total Issues Found**: {len(all_issues)}",
        f"**Files Scanned**: {len(md_files)}",
        "",
        "---",
        "",
    ]
    
    for file, issues in sorted(issues_by_file.items()):
        report_lines.append(f"## {file}")
        report_lines.append(f"**Issues**: {len(issues)}")
        report_lines.append("")
        
        for issue in issues:
            report_lines.append(f"- **Line {issue['line']}** [{issue['keyword'].upper()}]: {issue['context']}")
        
        report_lines.append("")
        report_lines.append("---")
        report_lines.append("")
    
    # Write report
    report_path = Path('/workspace/CONSOLIDATED_ISSUES_REPORT.md')
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report_lines))
    
    print(f"Report saved to: {report_path}")
    print(f"\nTop 5 files with most issues:")
    
    sorted_files = sorted(issues_by_file.items(), key=lambda x: len(x[1]), reverse=True)
    for file, issues in sorted_files[:5]:
        print(f"  - {file}: {len(issues)} issues")

if __name__ == '__main__':
    main()