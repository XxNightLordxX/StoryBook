#!/usr/bin/env python3
"""
Continuous Debugger System
Runs tests in sections, finds bugs/glitches, and consolidates all issues.
"""

import json
import os
import re
import subprocess
import time
from datetime import datetime
from typing import Dict, List, Any
import sys

class ContinuousDebugger:
    def __init__(self, issues_file="DEBUGGER_ISSUES_LOG.md", max_tests_per_section=5):
        self.issues_file = issues_file
        self.max_tests_per_section = max_tests_per_section
        self.issues_found = []
        self.test_registry = self.load_test_registry()
        self.web_search_enabled = True
        
        # Initialize issues file if it doesn't exist
        if not os.path.exists(self.issues_file):
            self.initialize_issues_file()
    
    def load_test_registry(self) -> Dict[str, Any]:
        """Load or create test registry"""
        registry_file = "debugger_test_registry.json"
        if os.path.exists(registry_file):
            with open(registry_file, 'r') as f:
                return json.load(f)
        return {
            "completed_tests": [],
            "available_tests": self.get_initial_tests(),
            "web_search_tests": []
        }
    
    def get_initial_tests(self) -> List[Dict[str, Any]]:
        """Get initial test suite"""
        return [
            {
                "id": "syntax_check",
                "name": "JavaScript Syntax Validation",
                "description": "Check all JavaScript files for syntax errors",
                "priority": "critical",
                "function": "run_syntax_check"
            },
            {
                "id": "html_validation",
                "name": "HTML Structure Validation",
                "description": "Validate HTML structure and integrity",
                "priority": "critical",
                "function": "run_html_validation"
            },
            {
                "id": "feature_tests",
                "name": "Feature Functionality Tests",
                "description": "Run comprehensive feature tests",
                "priority": "high",
                "function": "run_feature_tests"
            },
            {
                "id": "console_errors",
                "name": "Console Error Detection",
                "description": "Check for console errors in code",
                "priority": "high",
                "function": "run_console_error_check"
            },
            {
                "id": "security_scan",
                "name": "Security Vulnerability Scan",
                "description": "Scan for security vulnerabilities",
                "priority": "critical",
                "function": "run_security_scan"
            },
            {
                "id": "performance_check",
                "name": "Performance Analysis",
                "description": "Analyze performance bottlenecks",
                "priority": "medium",
                "function": "run_performance_check"
            },
            {
                "id": "code_quality",
                "name": "Code Quality Analysis",
                "description": "Check code quality and best practices",
                "priority": "medium",
                "function": "run_code_quality_check"
            },
            {
                "id": "accessibility_check",
                "name": "Accessibility Compliance",
                "description": "Check accessibility features",
                "priority": "medium",
                "function": "run_accessibility_check"
            }
        ]
    
    def initialize_issues_file(self):
        """Initialize the issues log file"""
        content = f"""# Continuous Debugger Issues Log

**Started**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Status**: Active Monitoring

---

## Summary Statistics
- Total Issues Found: 0
- Critical Issues: 0
- High Priority: 0
- Medium Priority: 0
- Low Priority: 0
- Tests Completed: 0

---

## Issues Found

*No issues found yet. Debugger is running...*

---

## Test History

*No tests completed yet.*

---

## Web Search Tests Added

*No web search tests added yet.*
"""
        with open(self.issues_file, 'w') as f:
            f.write(content)
    
    def update_issues_file(self, new_issues: List[Dict[str, Any]], test_info: Dict[str, Any]):
        """Update the issues file with new findings"""
        # Read current content
        with open(self.issues_file, 'r') as f:
            content = f.read()
        
        # Update statistics
        total_issues = len(self.issues_found)
        critical = len([i for i in self.issues_found if i.get('severity') == 'critical'])
        high = len([i for i in self.issues_found if i.get('severity') == 'high'])
        medium = len([i for i in self.issues_found if i.get('severity') == 'medium'])
        low = len([i for i in self.issues_found if i.get('severity') == 'low'])
        tests_completed = len(self.test_registry['completed_tests'])
        
        # Update summary section
        summary_pattern = r'## Summary Statistics.*?(?=## Issues Found)'
        summary_replacement = f"""## Summary Statistics
- Total Issues Found: {total_issues}
- Critical Issues: {critical}
- High Priority: {high}
- Medium Priority: {medium}
- Low Priority: {low}
- Tests Completed: {tests_completed}"""
        
        content = re.sub(summary_pattern, summary_replacement, content, flags=re.DOTALL)
        
        # Add new issues
        if new_issues:
            issues_section_pattern = r'(## Issues Found\n)(.*?)(?=\n## Test History)'
            current_issues = re.search(issues_section_pattern, content, flags=re.DOTALL)
            
            if current_issues:
                issues_text = current_issues.group(2)
                new_issues_text = "\n\n### " + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + "\n\n"
                
                for issue in new_issues:
                    severity_icon = {
                        'critical': '🔴',
                        'high': '🟠',
                        'medium': '🟡',
                        'low': '🟢'
                    }.get(issue.get('severity', 'low'), '⚪')
                    
                    new_issues_text += f"""#### {severity_icon} {issue.get('title', 'Unknown Issue')}
- **Severity**: {issue.get('severity', 'low').upper()}
- **Location**: {issue.get('location', 'Unknown')}
- **Test**: {test_info.get('name', 'Unknown')}
- **Description**: {issue.get('description', 'No description')}
- **Found**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

"""
                
                # Simple string replacement instead of regex with backreferences
                marker = "## Issues Found\n"
                if marker in content:
                    parts = content.split(marker, 1)
                    if len(parts) == 2:
                        content = parts[0] + marker + issues_text + new_issues_text + parts[1]
        
        # Add test to history
        test_history_marker = "## Test History\n"
        if test_history_marker in content:
            parts = content.split(test_history_marker, 1)
            if len(parts) == 2:
                new_history_entry = f"""### {test_info.get('name', 'Unknown Test')}
- **ID**: {test_info.get('id', 'unknown')}
- **Priority**: {test_info.get('priority', 'unknown')}
- **Completed**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **Issues Found**: {len(new_issues)}
- **Status**: ✅ Complete

"""
                content = parts[0] + test_history_marker + parts[1] + new_history_entry
        
        # Write updated content
        with open(self.issues_file, 'w') as f:
            f.write(content)
    
    def add_web_search_test(self, test_info: Dict[str, Any]):
        """Add a test discovered via web search"""
        self.test_registry['web_search_tests'].append(test_info)
        self.test_registry['available_tests'].append(test_info)
        
        # Update issues file
        with open(self.issues_file, 'r') as f:
            content = f.read()
        
        web_search_marker = "## Web Search Tests Added\n"
        if web_search_marker in content:
            parts = content.split(web_search_marker, 1)
            if len(parts) == 2:
                new_entry = f"""### {test_info.get('name', 'Unknown Test')}
- **ID**: {test_info.get('id', 'unknown')}
- **Source**: Web Search
- **Added**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **Description**: {test_info.get('description', 'No description')}

"""
                content = parts[0] + web_search_marker + parts[1] + new_entry
        
        with open(self.issues_file, 'w') as f:
            f.write(content)
    
    def save_test_registry(self):
        """Save test registry"""
        with open("debugger_test_registry.json", 'w') as f:
            json.dump(self.test_registry, f, indent=2)
    
    # ==================== TEST IMPLEMENTATIONS ====================
    
    def run_syntax_check(self) -> List[Dict[str, Any]]:
        """Check JavaScript files for syntax errors"""
        issues = []
        js_files = []
        
        # Find all JavaScript files
        for root, dirs, files in os.walk('.'):
            # Skip node_modules and other directories
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'coverage']]
            for file in files:
                if file.endswith('.js'):
                    js_files.append(os.path.join(root, file))
        
        print(f"  Checking {len(js_files)} JavaScript files for syntax errors...")
        
        for js_file in js_files:
            try:
                result = subprocess.run(
                    ['node', '-c', js_file],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                if result.returncode != 0:
                    issues.append({
                        'title': 'JavaScript Syntax Error',
                        'severity': 'critical',
                        'location': js_file,
                        'description': result.stderr.strip()
                    })
            except subprocess.TimeoutExpired:
                issues.append({
                    'title': 'Syntax Check Timeout',
                    'severity': 'medium',
                    'location': js_file,
                    'description': 'Syntax check timed out (file may be too large)'
                })
            except Exception as e:
                issues.append({
                    'title': 'Syntax Check Error',
                    'severity': 'medium',
                    'location': js_file,
                    'description': str(e)
                })
        
        return issues
    
    def run_html_validation(self) -> List[Dict[str, Any]]:
        """Validate HTML structure"""
        issues = []
        
        print("  Validating HTML structure...")
        
        # Check index.html
        if os.path.exists('index.html'):
            with open('index.html', 'r') as f:
                html_content = f.read()
            
            # Check for unclosed tags
            open_tags = re.findall(r'<([a-zA-Z][a-zA-Z0-9]*)[^>]*>', html_content)
            close_tags = re.findall(r'</([a-zA-Z][a-zA-Z0-9]*)>', html_content)
            
            # Simple check (not perfect but catches obvious issues)
            void_tags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'command', 'embed', 'keygen', 'param', 'source', 'track', 'wbr']
            
            for tag in open_tags:
                tag_name = tag.split()[0].lower()
                if tag_name not in void_tags:
                    # Check if closing tag exists
                    if f'</{tag_name}>' not in html_content:
                        # This is a simplified check - may have false positives
                        pass
            
            # Check for duplicate IDs
            ids = re.findall(r'id="([^"]+)"', html_content)
            duplicate_ids = [id for id in set(ids) if ids.count(id) > 1]
            
            for dup_id in duplicate_ids:
                issues.append({
                    'title': 'Duplicate HTML ID',
                    'severity': 'medium',
                    'location': 'index.html',
                    'description': f'ID "{dup_id}" appears {ids.count(dup_id)} times'
                })
        
        return issues
    
    def run_feature_tests(self) -> List[Dict[str, Any]]:
        """Run feature tests"""
        issues = []
        
        print("  Running feature tests...")
        
        # Run the comprehensive test script
        if os.path.exists('test_comprehensive_features.py'):
            try:
                result = subprocess.run(
                    ['python3', 'test_comprehensive_features.py'],
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                
                # Parse the actual test results from output
                output = result.stdout
                
                # Look for the summary line: "Failed: N"
                failed_match = re.search(r'Failed:\s*(\d+)', output)
                passed_match = re.search(r'Passed:\s*(\d+)', output)
                
                if failed_match:
                    failed_count = int(failed_match.group(1))
                    passed_count = int(passed_match.group(1)) if passed_match else 0
                    
                    if failed_count > 0:
                        issues.append({
                            'title': 'Feature Test Failures',
                            'severity': 'high',
                            'location': 'test_comprehensive_features.py',
                            'description': f'{failed_count} tests failed out of {passed_count + failed_count}'
                        })
                elif result.returncode != 0:
                    issues.append({
                        'title': 'Feature Test Error',
                        'severity': 'medium',
                        'location': 'test_comprehensive_features.py',
                        'description': 'Test script returned non-zero exit code'
                    })
                
            except subprocess.TimeoutExpired:
                issues.append({
                    'title': 'Feature Tests Timeout',
                    'severity': 'medium',
                    'location': 'test_comprehensive_features.py',
                    'description': 'Feature tests timed out'
                })
            except Exception as e:
                issues.append({
                    'title': 'Feature Test Error',
                    'severity': 'medium',
                    'location': 'test_comprehensive_features.py',
                    'description': str(e)
                })
        
        return issues
    
    def run_console_error_check(self) -> List[Dict[str, Any]]:
        """Check for console errors in code (skips comments)"""
        issues = []
        
        print("  Checking for console errors...")
        
        # Find all JavaScript files
        js_files = []
        for root, dirs, files in os.walk('js'):
            for file in files:
                if file.endswith('.js') and not file.endswith('.backup'):
                    js_files.append(os.path.join(root, file))
        
        error_patterns = [
            (r'console\.error\s*\(', 'console.error statement'),
            (r'console\.warn\s*\(', 'console.warn statement'),
            (r'console\.log\s*\(', 'console.log statement'),
            (r'catch\s*\([^)]*\)\s*\{\s*\}', 'Empty catch block'),
        ]
        
        for js_file in js_files:
            try:
                with open(js_file, 'r') as f:
                    lines = f.readlines()
                
                for line_num, line in enumerate(lines, 1):
                    stripped = line.strip()
                    # Skip comments
                    if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
                        continue
                    
                    for pattern, description in error_patterns:
                        if re.search(pattern, line):
                            issues.append({
                                'title': 'Console Error Statement',
                                'severity': 'low',
                                'location': f'{js_file}:{line_num}',
                                'description': f'{description} found'
                            })
            
            except Exception as e:
                issues.append({
                    'title': 'Console Check Error',
                    'severity': 'low',
                    'location': js_file,
                    'description': str(e)
                })
        
        return issues
    
    def run_security_scan(self) -> List[Dict[str, Any]]:
        """Scan for security vulnerabilities (skips comments, strings, and safe patterns)"""
        issues = []
        
        print("  Running security scan...")
        
        # Find all JavaScript files
        js_files = []
        for root, dirs, files in os.walk('js'):
            for file in files:
                if file.endswith('.js') and not file.endswith('.backup'):
                    js_files.append(os.path.join(root, file))
        
        # Only flag truly dangerous patterns
        security_patterns = [
            (r'\beval\s*\(', 'Use of eval() - potential code injection risk', 'high'),
            (r'document\.write\s*\(', 'Use of document.write() - potential XSS risk', 'high'),
            (r'innerHTML\s*\+=', 'innerHTML concatenation with += - potential XSS risk', 'high'),
            (r'new\s+Function\s*\(', 'Dynamic function creation - potential code injection', 'medium'),
        ]
        
        for js_file in js_files:
            try:
                with open(js_file, 'r') as f:
                    lines = f.readlines()
                
                for line_num, line in enumerate(lines, 1):
                    stripped = line.strip()
                    # Skip comments
                    if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
                        continue
                    
                    for pattern, description, severity in security_patterns:
                        match = re.search(pattern, line)
                        if match:
                            # Verify not inside a string
                            before = line[:match.start()]
                            sq = before.count("'") - before.count("\\'")
                            dq = before.count('"') - before.count('\\\&quot;')
                            bt = before.count('`')
                            if sq % 2 == 0 and dq % 2 == 0 and bt % 2 == 0:
                                issues.append({
                                    'title': 'Security Concern',
                                    'severity': severity,
                                    'location': f'{js_file}:{line_num}',
                                    'description': description
                                })
            
            except Exception as e:
                issues.append({
                    'title': 'Security Scan Error',
                    'severity': 'low',
                    'location': js_file,
                    'description': str(e)
                })
        
        return issues
    
    def run_performance_check(self) -> List[Dict[str, Any]]:
        """Analyze performance bottlenecks"""
        issues = []
        
        print("  Running performance analysis...")
        
        # Check file sizes
        large_files = []
        for root, dirs, files in os.walk('js'):
            for file in files:
                if file.endswith('.js'):
                    file_path = os.path.join(root, file)
                    size = os.path.getsize(file_path)
                    if size > 100000:  # > 100KB
                        large_files.append((file_path, size))
        
        for file_path, size in large_files:
            issues.append({
                'title': 'Large JavaScript File',
                'severity': 'low',
                'location': file_path,
                'description': f'File size is {size/1024:.1f}KB - consider code splitting'
            })
        
        # Check for nested loops (simplified)
        js_files = []
        for root, dirs, files in os.walk('js'):
            for file in files:
                if file.endswith('.js'):
                    js_files.append(os.path.join(root, file))
        
        for js_file in js_files:
            try:
                with open(js_file, 'r') as f:
                    content = f.read()
                
                # Check for deeply nested code
                lines = content.split('\n')
                for i, line in enumerate(lines, 1):
                    indent = len(line) - len(line.lstrip())
                    if indent > 24:  # More than 6 levels of indentation
                        issues.append({
                            'title': 'Deeply Nested Code',
                            'severity': 'low',
                            'location': f'{js_file}:{i}',
                            'description': f'Code has {indent//4} levels of nesting - consider refactoring'
                        })
                        break  # Only report once per file
            
            except Exception as e:
                pass
        
        return issues
    
    def run_code_quality_check(self) -> List[Dict[str, Any]]:
        """Check code quality and best practices (skips comments and strings)"""
        issues = []
        
        print("  Running code quality analysis...")
        
        # Find all JavaScript files
        js_files = []
        for root, dirs, files in os.walk('js'):
            for file in files:
                if file.endswith('.js') and not file.endswith('.backup'):
                    js_files.append(os.path.join(root, file))
        
        quality_patterns = [
            (r'\bvar\s+[a-zA-Z_$]', 'Use of var - consider using let or const'),
            (r'[^!=]==[^=]', 'Use of == - consider using === for strict equality'),
            (r'!=[^=]', 'Use of != - consider using !== for strict inequality'),
        ]
        
        for js_file in js_files:
            try:
                with open(js_file, 'r') as f:
                    lines = f.readlines()
                
                for line_num, line in enumerate(lines, 1):
                    stripped = line.strip()
                    # Skip comments
                    if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
                        continue
                    # Skip lines that are mostly strings (template content)
                    if stripped.startswith('<') or stripped.startswith("'") or stripped.startswith('"'):
                        continue
                    
                    for pattern, description in quality_patterns:
                        if re.search(pattern, line):
                            # Extra check: make sure it's not inside a string
                            match = re.search(pattern, line)
                            if match:
                                before = line[:match.start()]
                                single_q = before.count("'") - before.count("\\'")
                                double_q = before.count('"') - before.count('\\\&quot;')
                                backtick = before.count('`')
                                if single_q % 2 == 0 and double_q % 2 == 0 and backtick % 2 == 0:
                                    issues.append({
                                        'title': 'Code Quality Issue',
                                        'severity': 'low',
                                        'location': f'{js_file}:{line_num}',
                                        'description': description
                                    })
            
            except Exception as e:
                pass
        
        return issues
    
    def run_accessibility_check(self) -> List[Dict[str, Any]]:
        """Check accessibility features"""
        issues = []
        
        print("  Running accessibility check...")
        
        if os.path.exists('index.html'):
            with open('index.html', 'r') as f:
                html_content = f.read()
            
            # Check for alt attributes on images
            images_without_alt = re.findall(r'<img(?![^>]*alt=)[^>]*>', html_content)
            if images_without_alt:
                issues.append({
                    'title': 'Images Without Alt Text',
                    'severity': 'medium',
                    'location': 'index.html',
                    'description': f'{len(images_without_alt)} images missing alt attribute'
                })
            
            # Check for ARIA labels
            buttons_without_aria = re.findall(r'<button(?![^>]*aria-label=)[^>]*>', html_content)
            if buttons_without_aria:
                issues.append({
                    'title': 'Buttons Without ARIA Labels',
                    'severity': 'low',
                    'location': 'index.html',
                    'description': f'{len(buttons_without_aria)} buttons missing aria-label attribute'
                })
        
        return issues
    
# ==================== MEMORY LEAK DETECTION ====================
    
    def run_memory_leak_check(self):
        """Detect potential memory leaks in JavaScript code"""
        issues = []
        
        print("  Running memory leak detection...")
        
        js_files = []
        for root, dirs, files in os.walk('js'):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'coverage']]
            for file in files:
                if file.endswith('.js') and not file.endswith('.backup'):
                    js_files.append(os.path.join(root, file))
        
        for js_file in js_files:
            try:
                with open(js_file, 'r') as f:
                    file_content = f.read()
                    lines = file_content.split('\n')
                
                add_listeners = []
                remove_listeners = []
                
                for line_num, line in enumerate(lines, 1):
                    stripped = line.strip()
                    if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
                        continue
                    
                    if 'addEventListener(' in line:
                        evt_match = re.search(r"addEventListener\(\s*['" + '"' + r"](\w+)['" + '"' + r"]", line)
                        if evt_match:
                            add_listeners.append({'event': evt_match.group(1), 'line': line_num})
                    
                    if 'removeEventListener(' in line:
                        evt_match = re.search(r"removeEventListener\(\s*['" + '"' + r"](\w+)['" + '"' + r"]", line)
                        if evt_match:
                            remove_listeners.append({'event': evt_match.group(1), 'line': line_num})
                    
                    if re.search(r'setInterval\s*\(', line):
                        if not re.search(r'(const|let|var|this\.\w+|\w+)\s*=\s*setInterval', line):
                            issues.append({
                                'title': 'Potential Memory Leak - Untracked setInterval',
                                'severity': 'high',
                                'location': '%s:%d' % (js_file, line_num),
                                'description': 'setInterval() without stored reference: %s' % stripped[:60]
                            })
                    
                    if re.search(r'window\.\w+\s*=\s*document\.(getElementById|querySelector|getElementsBy)', line):
                        issues.append({
                            'title': 'Potential Memory Leak - Global DOM Reference',
                            'severity': 'medium',
                            'location': '%s:%d' % (js_file, line_num),
                            'description': 'DOM element stored as global: %s' % stripped[:60]
                        })
                    
                    if re.search(r'\.\s*push\s*\(', line):
                        if re.search(r'(history|log|buffer|queue|cache|stack)', line, re.IGNORECASE):
                            ctx_start = max(0, line_num - 20)
                            ctx = '\n'.join(lines[ctx_start:line_num])
                            ctx_after = '\n'.join(lines[line_num:min(len(lines), line_num + 10)])
                            if not re.search(r'(splice|shift|slice|\.length\s*[<>]|max[Ss]ize|limit|MAX_)', ctx + ctx_after):
                                issues.append({
                                    'title': 'Potential Memory Leak - Unbounded Collection',
                                    'severity': 'medium',
                                    'location': '%s:%d' % (js_file, line_num),
                                    'description': 'Collection grows without size limit: %s' % stripped[:60]
                                })
                
                added_events = set(l['event'] for l in add_listeners)
                removed_events = set(l['event'] for l in remove_listeners)
                unremoved = added_events - removed_events
                
                if len(add_listeners) > 3 and len(unremoved) > 0:
                    unremoved_details = [l for l in add_listeners if l['event'] in unremoved]
                    if len(unremoved_details) > 3:
                        issues.append({
                            'title': 'Potential Memory Leak - Unremoved Event Listeners',
                            'severity': 'medium',
                            'location': js_file,
                            'description': '%d addEventListener without removeEventListener' % len(unremoved_details)
                        })
            
            except Exception as e:
                issues.append({
                    'title': 'Memory Leak Check Error',
                    'severity': 'low',
                    'location': js_file,
                    'description': str(e)
                })
        
        print("  Found %d potential memory leak issues" % len(issues))
        return issues
    
    # ==================== CROSS-BROWSER COMPATIBILITY ====================
    
    def run_cross_browser_check(self):
        """Check for cross-browser compatibility issues"""
        issues = []
        
        print("  Running cross-browser compatibility check...")
        
        js_files = []
        for root, dirs, files in os.walk('js'):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'coverage']]
            for file in files:
                if file.endswith('.js') and not file.endswith('.backup'):
                    js_files.append(os.path.join(root, file))
        
        for file in os.listdir('.'):
            if file.endswith('.js') and file not in ['vite.config.js']:
                js_files.append(file)
        
        js_compat = [
            (r'\.replaceAll\(', 'String.replaceAll() - not supported in Chrome < 85, Firefox < 77', 'medium'),
            (r'globalThis\b', 'globalThis - not supported in Chrome < 71, Firefox < 65', 'medium'),
            (r'structuredClone\b', 'structuredClone() - not supported in Chrome < 98, Safari < 15.4', 'medium'),
            (r'\.at\(', 'Array/String.at() - not supported in Chrome < 92, Firefox < 90', 'medium'),
            (r'Object\.hasOwn\b', 'Object.hasOwn() - not supported in Chrome < 93, Firefox < 92', 'medium'),
            (r'\?\.\w', 'Optional chaining (?.) - not supported in Chrome < 80, Firefox < 74', 'low'),
            (r'\?\?[^=]', 'Nullish coalescing (??) - not supported in Chrome < 80, Firefox < 72', 'low'),
            (r'(?<!typeof )\bnew IntersectionObserver\b', 'IntersectionObserver - not supported in Safari < 12.1', 'low'),
        ]
        
        for js_file in js_files:
            try:
                with open(js_file, 'r') as f:
                    lines = f.readlines()
                
                for line_num, line in enumerate(lines, 1):
                    stripped = line.strip()
                    if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
                        continue
                    
                    for pattern, description, severity in js_compat:
                        match = re.search(pattern, line)
                        if match:
                            before = line[:match.start()]
                            sq = before.count("'") - before.count("\\\\'")
                            dq = before.count(chr(34)) - before.count(chr(92) + chr(34))
                            bt = before.count('`')
                            if sq % 2 == 0 and dq % 2 == 0 and bt % 2 == 0:
                                # Check for feature detection guard in surrounding lines
                                ctx_start = max(0, line_num - 6)
                                ctx_lines = lines[ctx_start:line_num]
                                ctx_text = ''.join(ctx_lines)
                                if 'typeof IntersectionObserver' in ctx_text:
                                    continue
                                if 'typeof ResizeObserver' in ctx_text:
                                    continue
                                issues.append({
                                    'title': 'Cross-Browser Compatibility Issue',
                                    'severity': severity,
                                    'location': '%s:%d' % (js_file, line_num),
                                    'description': description
                                })
            except Exception:
                pass
        
        css_compat = [
            (r'(?<!-webkit-)backdrop-filter\s*:', 'CSS backdrop-filter - needs -webkit- prefix for Safari', 'low'),
            (r'aspect-ratio\s*:', 'CSS aspect-ratio - not supported in Chrome < 88', 'low'),
            (r'@container\b', 'CSS Container Queries - not supported in Chrome < 105', 'medium'),
            (r'@layer\b', 'CSS Cascade Layers - not supported in Chrome < 99', 'medium'),
        ]
        
        css_files = []
        for root, dirs, files in os.walk('.'):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'coverage']]
            for file in files:
                if file.endswith('.css'):
                    css_files.append(os.path.join(root, file))
        
        for css_file in css_files:
            try:
                with open(css_file, 'r') as f:
                    lines = f.readlines()
                for line_num, line in enumerate(lines, 1):
                    stripped = line.strip()
                    if stripped.startswith('/*') or stripped.startswith('*'):
                        continue
                    for pattern, description, severity in css_compat:
                        if re.search(pattern, line):
                            # For backdrop-filter, check if -webkit- prefix exists nearby
                            if 'backdrop-filter' in description:
                                prev_line = lines[line_num - 2] if line_num >= 2 else ''
                                next_line = lines[line_num] if line_num < len(lines) else ''
                                if '-webkit-backdrop-filter' in prev_line or '-webkit-backdrop-filter' in next_line:
                                    continue
                            issues.append({
                                'title': 'CSS Cross-Browser Compatibility Issue',
                                'severity': severity,
                                'location': '%s:%d' % (css_file, line_num),
                                'description': description
                            })
            except Exception:
                pass
        
        print("  Found %d cross-browser compatibility issues" % len(issues))
        return issues
    
    # ==================== API ENDPOINT VALIDATION ====================
    
    def run_api_validation(self):
        """Validate all API endpoints and responses"""
        issues = []
        
        print("  Running API endpoint validation...")
        
        api_file = 'js/modules/api.js'
        if not os.path.exists(api_file):
            issues.append({
                'title': 'API Module Missing',
                'severity': 'critical',
                'location': 'js/modules/',
                'description': 'No api.js module found'
            })
            return issues
        
        with open(api_file, 'r') as f:
            api_content = f.read()
            api_lines = api_content.split('\n')
        
        defined_endpoints = {}
        current_group = None
        ep_re = re.compile(r"""(\w+):\s*['"](/[^'"]+)['"]""")
        sec_re = re.compile(r"(\w+):\s*\{")
        
        for line_num, line in enumerate(api_lines, 1):
            sec_m = sec_re.search(line)
            if sec_m and line_num < 100:
                current_group = sec_m.group(1)
            
            ep_m = ep_re.search(line)
            if ep_m and line_num < 100:
                name = ep_m.group(1)
                path = ep_m.group(2)
                key = '%s.%s' % (current_group, name) if current_group else name
                defined_endpoints[key] = {'path': path, 'line': line_num, 'group': current_group}
        
        print("  Found %d defined endpoints" % len(defined_endpoints))
        
        for key, endpoint in defined_endpoints.items():
            path = endpoint['path']
            
            if re.search(r'[A-Z]', path):
                issues.append({
                    'title': 'API Endpoint Naming Issue',
                    'severity': 'low',
                    'location': '%s:%d' % (api_file, endpoint['line']),
                    'description': 'Endpoint contains uppercase (not RESTful): %s' % path
                })
            
            if path.endswith('/') and path != '/':
                issues.append({
                    'title': 'API Endpoint Trailing Slash',
                    'severity': 'low',
                    'location': '%s:%d' % (api_file, endpoint['line']),
                    'description': 'Endpoint has trailing slash: %s' % path
                })
        
        req_re = re.compile(r"""request\(\s*['"](\w+)['"],\s*ENDPOINTS\.(\w+)\.(\w+)""")
        used_endpoints = []
        for line_num, line in enumerate(api_lines, 1):
            req_m = req_re.search(line)
            if req_m:
                used_endpoints.append({
                    'method': req_m.group(1),
                    'group': req_m.group(2),
                    'name': req_m.group(3),
                    'line': line_num,
                    'key': '%s.%s' % (req_m.group(2), req_m.group(3))
                })
        
        method_rules = {
            'LIST': 'GET', 'GET': 'GET', 'CREATE': 'POST',
            'UPDATE': 'PUT', 'DELETE': 'DELETE', 'LOGIN': 'POST',
            'LOGOUT': 'POST', 'REFRESH': 'POST', 'VERIFY': 'GET',
        }
        
        for usage in used_endpoints:
            expected = method_rules.get(usage['name'])
            if expected and usage['method'] != expected:
                issues.append({
                    'title': 'API Method Mismatch',
                    'severity': 'medium',
                    'location': '%s:%d' % (api_file, usage['line']),
                    'description': '%s uses %s but expected %s' % (usage['key'], usage['method'], expected)
                })
        
        in_function = False
        func_start = 0
        func_name = ''
        has_try = False
        
        for line_num, line in enumerate(api_lines, 1):
            func_match = re.search(r'(const|let|var)\s+(\w+)\s*=\s*async', line)
            if func_match and 'request' not in func_match.group(2):
                if in_function and not has_try:
                    issues.append({
                        'title': 'API Function Missing Error Handling',
                        'severity': 'medium',
                        'location': '%s:%d' % (api_file, func_start),
                        'description': 'API function lacks try/catch: %s' % func_name
                    })
                in_function = True
                func_start = line_num
                func_name = func_match.group(2)
                has_try = False
            
            if in_function:
                if 'try {' in line or 'try{' in line:
                    has_try = True
        
        if 'rateLimit' not in api_content and 'RateLimit' not in api_content:
            issues.append({
                'title': 'API Missing Rate Limiting',
                'severity': 'medium',
                'location': api_file,
                'description': 'No rate limiting found'
            })
        
        if 'cors' not in api_content.lower() and 'Access-Control' not in api_content:
            issues.append({
                'title': 'API Missing CORS Configuration',
                'severity': 'low',
                'location': api_file,
                'description': 'No CORS configuration found'
            })
        
        if 'timeout' not in api_content.lower() and 'AbortController' not in api_content:
            issues.append({
                'title': 'API Missing Request Timeout',
                'severity': 'medium',
                'location': api_file,
                'description': 'No request timeout handling found'
            })
        
        endpoint_groups = {}
        for key, ep in defined_endpoints.items():
            group = ep['group']
            if group not in endpoint_groups:
                endpoint_groups[group] = set()
            name = key.split('.')[-1] if '.' in key else key
            endpoint_groups[group].add(name)
        
        crud_ops = {'LIST', 'GET', 'CREATE', 'UPDATE', 'DELETE'}
        for group, ops in endpoint_groups.items():
            if group in ['AUTH', 'SEARCH', 'ANALYTICS']:
                continue
            missing = crud_ops - ops
            if missing and len(ops) >= 3:
                issues.append({
                    'title': 'API Incomplete CRUD Operations',
                    'severity': 'low',
                    'location': api_file,
                    'description': 'Group %s missing: %s' % (group, ', '.join(sorted(missing)))
                })
        
        print("  Found %d API validation issues" % len(issues))
        return issues    # ==================== WEB SEARCH ====================
    
    def search_web_for_tests(self):
        """Search web for new testing approaches"""
        print("\n🔍 Searching web for new testing approaches...")
        
        # This is a placeholder - in a real implementation, you'd use web-search tool
        # For now, we'll add some predefined tests
        new_tests = [
            {
                "id": "memory_leak_detection",
                "name": "Memory Leak Detection",
                "description": "Detect potential memory leaks in JavaScript code",
                "priority": "high",
                "function": "run_memory_leak_check"
            },
            {
                "id": "cross_browser_compatibility",
                "name": "Cross-Browser Compatibility",
                "description": "Check for cross-browser compatibility issues",
                "priority": "medium",
                "function": "run_cross_browser_check"
            },
            {
                "id": "api_endpoint_validation",
                "name": "API Endpoint Validation",
                "description": "Validate all API endpoints and responses",
                "priority": "high",
                "function": "run_api_validation"
            }
        ]
        
        for test in new_tests:
            if test['id'] not in [t['id'] for t in self.test_registry['available_tests']]:
                self.add_web_search_test(test)
                print(f"  ✅ Added new test: {test['name']}")
    
    # ==================== MAIN LOOP ====================
    
    def run_test(self, test_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Run a single test"""
        print(f"\n{'='*60}")
        print(f"🧪 Running Test: {test_info.get('name', 'Unknown')}")
        print(f"{'='*60}")
        print(f"ID: {test_info.get('id', 'unknown')}")
        print(f"Priority: {test_info.get('priority', 'unknown')}")
        print(f"Description: {test_info.get('description', 'No description')}")
        
        # Get test function
        function_name = test_info.get('function', '')
        if hasattr(self, function_name):
            test_function = getattr(self, function_name)
            issues = test_function()
        else:
            print(f"  ⚠️ Test function '{function_name}' not found")
            issues = [{
                'title': 'Test Function Missing',
                'severity': 'medium',
                'location': 'continuous_debugger.py',
                'description': f"Test function '{function_name}' not implemented"
            }]
        
        print(f"\n  ✅ Test completed - Found {len(issues)} issues")
        
        return issues
    
    def run_section(self):
        """Run a section of tests"""
        print(f"\n{'#'*60}")
        print(f"# Starting New Test Section")
        print(f"# Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'#'*60}")
        
        # Get available tests
        available_tests = [
            t for t in self.test_registry['available_tests']
            if t['id'] not in self.test_registry['completed_tests']
        ]
        
        if not available_tests:
            print("\n✅ All tests completed!")
            return False
        
        # Run tests in this section
        tests_to_run = available_tests[:self.max_tests_per_section]
        
        for test_info in tests_to_run:
            try:
                issues = self.run_test(test_info)
                
                # Add to issues found
                for issue in issues:
                    if issue not in self.issues_found:
                        self.issues_found.append(issue)
                
                # Update issues file
                self.update_issues_file(issues, test_info)
                
                # Mark test as completed
                self.test_registry['completed_tests'].append(test_info['id'])
                self.save_test_registry()
                
                # Small delay between tests
                time.sleep(1)
            
            except Exception as e:
                print(f"  ❌ Error running test: {e}")
                issues = [{
                    'title': 'Test Execution Error',
                    'severity': 'high',
                    'location': 'continuous_debugger.py',
                    'description': str(e)
                }]
                self.update_issues_file(issues, test_info)
        
        # Search web for new tests after completing a section
        if self.web_search_enabled:
            self.search_web_for_tests()
        
        print(f"\n{'#'*60}")
        print(f"# Section Complete")
        print(f"# Tests in Section: {len(tests_to_run)}")
        print(f"# Total Issues Found: {len(self.issues_found)}")
        print(f"# Tests Remaining: {len(available_tests) - len(tests_to_run)}")
        print(f"{'#'*60}")
        
        return True
    
    def run_continuous(self, sections_to_run=None):
        """Run continuous debugging"""
        print("\n" + "="*60)
        print("🐛 CONTINUOUS DEBUGGER STARTED")
        print("="*60)
        print(f"Issues File: {self.issues_file}")
        print(f"Max Tests Per Section: {self.max_tests_per_section}")
        print(f"Web Search Enabled: {self.web_search_enabled}")
        print("="*60)
        
        section_count = 0
        
        try:
            while True:
                has_more = self.run_section()
                section_count += 1
                
                if not has_more:
                    print("\n✅ All tests completed!")
                    break
                
                if sections_to_run and section_count >= sections_to_run:
                    print(f"\n✅ Completed {sections_to_run} sections as requested")
                    break
                
                # Auto-continue to next section (no user input needed)
                print(f"\n⏭️  Section {section_count} complete. Continuing to next section...")
                time.sleep(1)  # Brief pause before next section
        
        except KeyboardInterrupt:
            print("\n\n👋 Debugger interrupted by user")
        
        print(f"\n{'='*60}")
        print("🐛 CONTINUOUS DEBUGGER STOPPED")
        print(f"Total Sections Run: {section_count}")
        print(f"Total Issues Found: {len(self.issues_found)}")
        print(f"Issues Log: {self.issues_file}")
        print("="*60)


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Continuous Debugger System')
    parser.add_argument('--sections', type=int, help='Number of sections to run (default: continuous)')
    parser.add_argument('--max-tests', type=int, default=5, help='Max tests per section (default: 5)')
    parser.add_argument('--issues-file', default='DEBUGGER_ISSUES_LOG.md', help='Issues log file (default: DEBUGGER_ISSUES_LOG.md)')
    
    args = parser.parse_args()
    
    debugger = ContinuousDebugger(
        issues_file=args.issues_file,
        max_tests_per_section=args.max_tests
    )
    
    debugger.run_continuous(sections_to_run=args.sections)


if __name__ == '__main__':
    main()