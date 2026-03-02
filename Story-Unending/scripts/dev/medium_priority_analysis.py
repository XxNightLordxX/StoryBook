#!/usr/bin/env python3
"""
Deep analysis of ALL medium-priority issues with exact file:line locations.
Categories: Security, Accessibility, Syntax Errors, Feature Tests
"""

import os
import re
import json
import subprocess

results = {
    'security_eval': [],
    'security_document_write': [],
    'security_innerhtml_concat': [],
    'security_localstorage_user': [],
    'security_hardcoded_password': [],
    'security_innerhtml_assign': [],
    'security_xss_risk': [],
    'accessibility_img_no_alt': [],
    'accessibility_btn_no_aria': [],
    'accessibility_input_no_label': [],
    'accessibility_no_role': [],
    'accessibility_no_tabindex': [],
    'syntax_errors': [],
    'feature_test_failures': [],
}

def get_all_js_files():
    """Get ALL JavaScript files including root and utils"""
    js_files = []
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'coverage']]
        for f in files:
            if f.endswith('.js') and not f.endswith('.backup'):
                js_files.append(os.path.join(root, f))
    return sorted(js_files)

def remove_strings_and_comments(text):
    """Remove string literals and comments for safe pattern matching."""
    result = []
    i = 0
    while i < len(text):
        ch = text[i]
        if ch == '/' and i + 1 < len(text):
            if text[i+1] == '/':
                while i < len(text) and text[i] != '\n':
                    i += 1
                continue
            elif text[i+1] == '*':
                i += 2
                while i + 1 < len(text):
                    if text[i] == '*' and text[i+1] == '/':
                        i += 2
                        break
                    i += 1
                continue
        elif ch in ('"', "'", '`'):
            quote = ch
            i += 1
            while i < len(text):
                if text[i] == '\\':
                    i += 2
                    continue
                if text[i] == quote:
                    i += 1
                    break
                i += 1
            continue
        result.append(ch)
        i += 1
    return ''.join(result)

def analyze_security(filepath):
    """Analyze a JS file for security issues"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
            lines = content.split('\n')
    except:
        return
    
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        # Skip comments
        if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
            continue
        
        # Check for eval()
        if re.search(r'\beval\s*\(', line):
            before = line[:line.find('eval')]
            sq = before.count("'") - before.count("\\'")
            dq = before.count('"') - before.count('\&quot;')
            bt = before.count('`')
            if sq % 2 == 0 and dq % 2 == 0 and bt % 2 == 0:
                results['security_eval'].append({
                    'file': filepath, 'line': i, 'text': stripped[:120]
                })
        
        # Check for document.write()
        if re.search(r'document\.write\s*\(', line):
            before = line[:line.find('document.write')]
            sq = before.count("'") - before.count("\\'")
            dq = before.count('"') - before.count('\&quot;')
            bt = before.count('`')
            if sq % 2 == 0 and dq % 2 == 0 and bt % 2 == 0:
                results['security_document_write'].append({
                    'file': filepath, 'line': i, 'text': stripped[:120]
                })
        
        # Check for innerHTML with concatenation or user input
        if re.search(r'\.innerHTML\s*[\+]?=', line):
            before_match = line[:line.find('.innerHTML')]
            sq = before_match.count("'") - before_match.count("\\'")
            dq = before_match.count('"') - before_match.count('\&quot;')
            bt = before_match.count('`')
            if sq % 2 == 0 and dq % 2 == 0 and bt % 2 == 0:
                if '+=' in line or ('+' in line.split('innerHTML')[1] if 'innerHTML' in line else False):
                    results['security_innerhtml_concat'].append({
                        'file': filepath, 'line': i, 'text': stripped[:120]
                    })
                else:
                    results['security_innerhtml_assign'].append({
                        'file': filepath, 'line': i, 'text': stripped[:120]
                    })
        
        # Check for hardcoded passwords
        if re.search(r'password\s*[:=]\s*["\'][^"\']+["\']', line, re.IGNORECASE):
            before = line[:re.search(r'password', line, re.IGNORECASE).start()]
            sq = before.count("'") - before.count("\\'")
            dq = before.count('"') - before.count('\&quot;')
            bt = before.count('`')
            if sq % 2 == 0 and dq % 2 == 0 and bt % 2 == 0:
                results['security_hardcoded_password'].append({
                    'file': filepath, 'line': i, 'text': stripped[:120]
                })
        
        # Check for localStorage with sensitive data
        if re.search(r'localStorage\.(setItem|getItem)\s*\(.*(?:password|token|secret|key)', line, re.IGNORECASE):
            results['security_localstorage_user'].append({
                'file': filepath, 'line': i, 'text': stripped[:120]
            })

def analyze_accessibility(filepath):
    """Analyze HTML file for accessibility issues"""
    if not filepath.endswith('.html'):
        return
    
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
            lines = content.split('\n')
    except:
        return
    
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        
        # Images without alt
        if re.search(r'<img\b', line) and not re.search(r'\balt\s*=', line):
            results['accessibility_img_no_alt'].append({
                'file': filepath, 'line': i, 'text': stripped[:120]
            })
        
        # Buttons without aria-label (only if no text content visible)
        if re.search(r'<button\b', line) and not re.search(r'\baria-label\s*=', line):
            # Check if button has visible text (not just an icon)
            btn_text = re.sub(r'<[^>]+>', '', line).strip()
            if not btn_text or len(btn_text) < 2:
                results['accessibility_btn_no_aria'].append({
                    'file': filepath, 'line': i, 'text': stripped[:120]
                })
        
        # Input without label or aria-label
        if re.search(r'<input\b', line):
            if not re.search(r'\baria-label\s*=', line) and not re.search(r'\bid\s*=', line):
                results['accessibility_input_no_label'].append({
                    'file': filepath, 'line': i, 'text': stripped[:120]
                })
        
        # Interactive elements without tabindex
        if re.search(r'<div\b.*onclick', line) and not re.search(r'\btabindex\s*=', line):
            results['accessibility_no_tabindex'].append({
                'file': filepath, 'line': i, 'text': stripped[:120]
            })

def analyze_syntax():
    """Check all JS files for syntax errors"""
    js_files = get_all_js_files()
    for filepath in js_files:
        try:
            result = subprocess.run(
                ['node', '-c', filepath],
                capture_output=True, text=True, timeout=10
            )
            if result.returncode != 0:
                error_msg = result.stderr.strip()
                # Extract just the key error line
                error_lines = error_msg.split('\n')
                short_error = error_lines[0] if error_lines else error_msg
                results['syntax_errors'].append({
                    'file': filepath, 'line': 0, 'text': short_error[:200],
                    'full_error': error_msg[:500]
                })
        except:
            pass

def analyze_feature_tests():
    """Run feature tests and capture failures"""
    test_file = 'test_comprehensive_features.py'
    if not os.path.exists(test_file):
        # Check in tests/ directory
        for root, dirs, files in os.walk('.'):
            for f in files:
                if 'comprehensive' in f and f.endswith('.py'):
                    test_file = os.path.join(root, f)
                    break
    
    if os.path.exists(test_file):
        try:
            result = subprocess.run(
                ['python3', test_file],
                capture_output=True, text=True, timeout=120
            )
            output = result.stdout + result.stderr
            if 'FAIL' in output or 'Error' in output:
                results['feature_test_failures'].append({
                    'file': test_file, 'line': 0,
                    'text': 'Feature test has failures - see output',
                    'output': output[:2000]
                })
        except Exception as e:
            results['feature_test_failures'].append({
                'file': test_file, 'line': 0,
                'text': f'Error running tests: {str(e)}'
            })

def main():
    print("=" * 70)
    print("MEDIUM PRIORITY DEEP ANALYSIS")
    print("=" * 70)
    
    # Security analysis - all JS files
    print("\n1. Scanning for security issues...")
    js_files = get_all_js_files()
    for f in js_files:
        analyze_security(f)
    
    # Also scan HTML for security issues
    for f in ['index.html']:
        if os.path.exists(f):
            analyze_security(f)
    
    # Accessibility analysis
    print("2. Scanning for accessibility issues...")
    for f in ['index.html']:
        if os.path.exists(f):
            analyze_accessibility(f)
    
    # Also check JS files that generate HTML
    for f in js_files:
        if 'ui' in f:
            analyze_security(f)  # Check UI files for innerHTML
    
    # Syntax errors
    print("3. Checking for syntax errors...")
    analyze_syntax()
    
    # Feature tests
    print("4. Running feature tests...")
    analyze_feature_tests()
    
    # Print results
    print("\n" + "=" * 70)
    print("RESULTS")
    print("=" * 70)
    
    total = 0
    for category, items in results.items():
        count = len(items)
        total += count
        if count > 0:
            print(f"\n  {category}: {count}")
            for item in items[:5]:
                print(f"    {item['file']}:{item['line']} - {item['text'][:80]}")
            if count > 5:
                print(f"    ... and {count - 5} more")
    
    print(f"\n  TOTAL MEDIUM PRIORITY ISSUES: {total}")
    print("=" * 70)
    
    # Save results
    with open('MEDIUM_PRIORITY_ANALYSIS.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nDetailed results saved to MEDIUM_PRIORITY_ANALYSIS.json")

if __name__ == '__main__':
    main()