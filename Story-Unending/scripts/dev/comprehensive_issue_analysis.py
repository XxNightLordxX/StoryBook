#!/usr/bin/env python3
"""
Comprehensive issue analysis script.
Identifies and categorizes all issues, separating real issues from false positives.
"""
import re
from pathlib import Path

# Issue categories
issue_categories = {
    'CRITICAL': {
        'patterns': [
            r'eval\(',
            r'document\.write\(',
            r'innerHTML.*\+',
        ],
        'description': 'Critical security or performance issues'
    },
    'HIGH': {
        'patterns': [
            r'prompt\(',
            r'alert\(',
        ],
        'description': 'High priority - affects UX or security'
    },
    'MEDIUM': {
        'patterns': [
            r'console\.log\(',
            r'console\.debug\(',
            r'console\.warn\(',
        ],
        'description': 'Medium priority - debugging code'
    },
    'LOW': {
        'patterns': [
            r'confirm\(',
            r'console\.error\(',
        ],
        'description': 'Low priority - acceptable in certain contexts'
    },
}

# Files to exclude
exclude_files = [
    'tests/',
    'test-',
    'node_modules/',
    'coverage/',
]

# Acceptable patterns (false positives)
acceptable_patterns = [
    r'//.*console\.log',  # Commented out
    r'/\*.*console\.log',  # In comment block
    r'\*.*console\.log',  # JSDoc comment
    r'console\.log.*sanitizeHTML',  # Security testing
    r'console\.log.*Sentry',  # Error tracking
    r'console\.log.*Error',  # Error handling
    r'console\.error.*Error',  # Error logging
    r'console\.warn.*Warning',  # Warning logging
]

def should_exclude_file(filepath):
    """Check if file should be excluded."""
    filepath_str = str(filepath)
    for exclude in exclude_files:
        if exclude in filepath_str:
            return True
    return False

def is_acceptable_pattern(line):
    """Check if line matches an acceptable pattern."""
    for pattern in acceptable_patterns:
        if re.search(pattern, line):
            return True
    return False

def analyze_file(filepath):
    """Analyze a single file for issues."""
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
                
            # Check if it's an acceptable pattern
            if is_acceptable_pattern(line):
                continue
                
            # Check each category
            for category, info in issue_categories.items():
                for pattern in info['patterns']:
                    if re.search(pattern, line):
                        # Extract context
                        context = line.strip()
                        if len(context) > 150:
                            context = context[:150] + '...'
                        
                        issues.append({
                            'file': str(filepath.relative_to('/workspace')),
                            'line': i,
                            'category': category,
                            'pattern': pattern,
                            'context': context
                        })
                        break  # Only record once per line per category
                    
    except Exception as e:
        print(f"Error analyzing {filepath}: {e}")
        
    return issues

def main():
    """Main function."""
    print("Comprehensive Issue Analysis\n")
    print("="*80)
    
    # Scan all JS files
    js_files = list(Path('/workspace/js').glob('**/*.js'))
    css_files = list(Path('/workspace/css').glob('**/*.css'))
    
    # Also check main files
    main_files = [
        Path('/workspace/index.html'),
        Path('/workspace/story-engine.js'),
        Path('/workspace/backstory-engine.js'),
        Path('/workspace/styles.css'),
    ]
    
    all_files = js_files + css_files + main_files
    
    # Filter out excluded files
    filtered_files = [f for f in all_files if not should_exclude_file(f)]
    
    print(f"Scanning {len(filtered_files)} files...\n")
    
    all_issues = []
    
    for filepath in filtered_files:
        if filepath.exists():
            issues = analyze_file(filepath)
            if issues:
                all_issues.extend(issues)
    
    # Group issues by category
    issues_by_category = {}
    for issue in all_issues:
        category = issue['category']
        if category not in issues_by_category:
            issues_by_category[category] = []
        issues_by_category[category].append(issue)
    
    # Generate report
    print(f"\n{'='*80}")
    print(f"TOTAL ISSUES FOUND: {len(all_issues)}")
    print(f"{'='*80}\n")
    
    # Create comprehensive report
    report_lines = [
        "# Comprehensive Issue Analysis Report",
        "",
        f"**Date**: 2026-02-27",
        f"**Total Issues Found**: {len(all_issues)}",
        f"**Files Scanned**: {len(filtered_files)}",
        "",
        "This report categorizes all issues by severity and separates real issues from false positives.",
        "",
        "---",
        "",
    ]
    
    for category in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
        if category in issues_by_category:
            issues = issues_by_category[category]
            report_lines.append(f"## {category} Priority")
            report_lines.append(f"**Description**: {issue_categories[category]['description']}")
            report_lines.append(f"**Count**: {len(issues)}")
            report_lines.append("")
            
            # Group by file
            issues_by_file = {}
            for issue in issues:
                file = issue['file']
                if file not in issues_by_file:
                    issues_by_file[file] = []
                issues_by_file[file].append(issue)
            
            for file, file_issues in sorted(issues_by_file.items()):
                report_lines.append(f"### {file}")
                report_lines.append(f"**Issues**: {len(file_issues)}")
                report_lines.append("")
                
                for issue in file_issues:
                    report_lines.append(f"- **Line {issue['line']}**: {issue['context']}")
                
                report_lines.append("")
            
            report_lines.append("---")
            report_lines.append("")
    
    # Write report
    report_path = Path('/workspace/COMPREHENSIVE_ISSUE_ANALYSIS.md')
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report_lines))
    
    print(f"Report saved to: {report_path}")
    
    # Print summary
    print(f"\nIssues by Category:")
    for category in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
        if category in issues_by_category:
            print(f"  - {category}: {len(issues_by_category[category])} issues")

if __name__ == '__main__':
    main()