#!/usr/bin/env python3
"""
Comprehensive issue analysis script for Story-Unending project
Identifies potential bugs, errors, and code quality issues
"""

import os
import re
import json
from pathlib import Path

def analyze_file(filepath):
    """Analyze a single JavaScript file for issues"""
    issues = []
    
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        lines = content.split('\n')
        
    # Check for nested IIFE patterns (double wrapping)
    if content.count('(function() {') > 1:
        issues.append({
            'type': 'DOUBLE_IIFE',
            'severity': 'HIGH',
            'message': 'File has nested IIFE patterns - potential code duplication',
            'line': 1
        })
    
    # Check for duplicate window exports
    window_exports = re.findall(r'window\.([A-Z][a-zA-Z]+)\s*=', content)
    if len(window_exports) > len(set(window_exports)):
        duplicates = [x for x in window_exports if window_exports.count(x) > 1]
        issues.append({
            'type': 'DUPLICATE_EXPORTS',
            'severity': 'HIGH',
            'message': f'Duplicate window exports: {set(duplicates)}',
            'line': 1
        })
    
    # Check for missing error handling in async functions
    async_functions = re.finditer(r'async\s+function\s+(\w+)', content)
    for match in async_functions:
        func_name = match.group(1)
        func_start = match.start()
        # Find the function body
        brace_count = 0
        in_function = False
        for i, line in enumerate(lines[content[:func_start].count('\n'):], start=1):
            if 'async function' in line:
                in_function = True
            if in_function:
                brace_count += line.count('{') - line.count('}')
                if brace_count == 0 and i > content[:func_start].count('\n') + 1:
                    # Check if function has try-catch
                    func_content = '\n'.join(lines[content[:func_start].count('\n'):i])
                    if 'try' not in func_content and 'catch' not in func_content:
                        issues.append({
                            'type': 'MISSING_ERROR_HANDLING',
                            'severity': 'MEDIUM',
                            'message': f'Async function {func_name} lacks error handling',
                            'line': content[:func_start].count('\n') + 1
                        })
                    break
    
    # Check for console statements
    console_matches = re.finditer(r'console\.(log|warn|debug|info)\(', content)
    for match in console_matches:
        line_num = content[:match.start()].count('\n') + 1
        issues.append({
            'type': 'CONSOLE_STATEMENT',
            'severity': 'LOW',
            'message': f'Console statement found: console.{match.group(1)}',
            'line': line_num
        })
    
    # Check for undefined variable references
    undefined_refs = re.finditer(r'\b(undefined|null)\b', content)
    for match in undefined_refs:
        line_num = content[:match.start()].count('\n') + 1
        # Check if it's a comparison (acceptable)
        line_content = lines[line_num - 1]
        if 'if' in line_content and match.group(1) in line_content:
            continue  # Acceptable comparison
        issues.append({
            'type': 'UNDEFINED_REFERENCE',
            'severity': 'LOW',
            'message': f'Potential undefined/null reference: {match.group(1)}',
            'line': line_num
        })
    
    return issues

def main():
    """Main analysis function"""
    js_dir = Path('js')
    
    all_issues = []
    file_count = 0
    
    for js_file in js_dir.rglob('*.js'):
        file_count += 1
        issues = analyze_file(js_file)
        if issues:
            all_issues.append({
                'file': str(js_file),
                'issues': issues
            })
    
    # Generate report
    report = {
        'summary': {
            'total_files': file_count,
            'files_with_issues': len(all_issues),
            'total_issues': sum(len(f['issues']) for f in all_issues)
        },
        'issues_by_type': {},
        'issues_by_severity': {},
        'files': all_issues
    }
    
    # Categorize issues
    for file_data in all_issues:
        for issue in file_data['issues']:
            issue_type = issue['type']
            severity = issue['severity']
            
            if issue_type not in report['issues_by_type']:
                report['issues_by_type'][issue_type] = 0
            report['issues_by_type'][issue_type] += 1
            
            if severity not in report['issues_by_severity']:
                report['issues_by_severity'][severity] = 0
            report['issues_by_severity'][severity] += 1
    
    # Print summary
    print("=" * 80)
    print("COMPREHENSIVE ISSUE ANALYSIS REPORT")
    print("=" * 80)
    print(f"\nTotal Files Analyzed: {report['summary']['total_files']}")
    print(f"Files with Issues: {report['summary']['files_with_issues']}")
    print(f"Total Issues Found: {report['summary']['total_issues']}")
    
    print("\n" + "=" * 80)
    print("ISSUES BY SEVERITY")
    print("=" * 80)
    for severity in ['HIGH', 'MEDIUM', 'LOW']:
        count = report['issues_by_severity'].get(severity, 0)
        if count > 0:
            print(f"{severity}: {count}")
    
    print("\n" + "=" * 80)
    print("ISSUES BY TYPE")
    print("=" * 80)
    for issue_type, count in sorted(report['issues_by_type'].items()):
        print(f"{issue_type}: {count}")
    
    print("\n" + "=" * 80)
    print("DETAILED ISSUES")
    print("=" * 80)
    
    for file_data in all_issues:
        print(f"\n📄 {file_data['file']}")
        for issue in file_data['issues']:
            severity_icon = {'HIGH': '🔴', 'MEDIUM': '🟡', 'LOW': '🟢'}[issue['severity']]
            print(f"  {severity_icon} Line {issue['line']}: [{issue['type']}] {issue['message']}")
    
    # Save report
    with open('ISSUES_ANALYSIS.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n✅ Report saved to ISSUES_ANALYSIS.json")
    
    return report

if __name__ == '__main__':
    main()