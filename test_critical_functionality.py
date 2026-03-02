#!/usr/bin/env python3
"""
Endless Story Engine - Critical Functionality Tests (P0)
Tests core features that must work for the application to be functional.
"""

import json
import os
import re
import sys
from pathlib import Path

class CriticalFunctionalityTester:
    def __init__(self):
        self.results = {
            'total': 0,
            'passed': 0,
            'failed': 0,
            'tests': []
        }
        self.workspace = Path('/workspace')
    
    def log_test(self, name, passed, message=""):
        """Log a test result"""
        self.results['total'] += 1
        if passed:
            self.results['passed'] += 1
            status = "✅ PASS"
        else:
            self.results['failed'] += 1
            status = "❌ FAIL"
        
        self.results['tests'].append({
            'name': name,
            'passed': passed,
            'message': message
        })
        print(f"{status}: {name}")
        if message:
            print(f"  → {message}")
    
    def test_file_exists(self, filepath, description):
        """Test if a file exists"""
        exists = (self.workspace / filepath).exists()
        self.log_test(
            f"{description} exists",
            exists,
            f"File: {filepath}" if not exists else ""
        )
        return exists
    
    def test_file_contains(self, filepath, pattern, description):
        """Test if a file contains a pattern"""
        try:
            content = (self.workspace / filepath).read_text()
            found = bool(re.search(pattern, content, re.MULTILINE | re.DOTALL))
            self.log_test(
                f"{description}",
                found,
                f"Pattern not found in {filepath}" if not found else ""
            )
            return found
        except Exception as e:
            self.log_test(
                f"{description}",
                False,
                f"Error reading {filepath}: {str(e)}"
            )
            return False
    
    def test_no_console_log(self, filepath, description):
        """Test that a file has no console.log statements"""
        try:
            content = (self.workspace / filepath).read_text()
            # Ignore comments and test files
            lines = content.split('\n')
            violations = []
            for i, line in enumerate(lines, 1):
                stripped = line.strip()
                # Skip comments
                if stripped.startswith('//') or stripped.startswith('*'):
                    continue
                if 'console.log' in line and not stripped.startswith('//'):
                    violations.append(f"Line {i}")
            
            passed = len(violations) == 0
            self.log_test(
                f"{description} - No console.log",
                passed,
                f"Found {len(violations)} console.log statements: {', '.join(violations[:5])}" if not passed else ""
            )
            return passed
        except Exception as e:
            self.log_test(
                f"{description} - No console.log",
                False,
                f"Error: {str(e)}"
            )
            return False
    
    def test_no_alert(self, filepath, description):
        """Test that a file has no alert() calls"""
        try:
            content = (self.workspace / filepath).read_text()
            # Look for alert( but not in comments
            lines = content.split('\n')
            violations = []
            for i, line in enumerate(lines, 1):
                stripped = line.strip()
                if stripped.startswith('//') or stripped.startswith('*'):
                    continue
                if 'alert(' in line and not stripped.startswith('//'):
                    violations.append(f"Line {i}")
            
            passed = len(violations) == 0
            self.log_test(
                f"{description} - No alert()",
                passed,
                f"Found {len(violations)} alert() calls: {', '.join(violations[:5])}" if not passed else ""
            )
            return passed
        except Exception as e:
            self.log_test(
                f"{description} - No alert()",
                False,
                f"Error: {str(e)}"
            )
            return False
    
    def test_dom_helpers_usage(self, filepath, description):
        """Test that file uses DOM Helpers instead of document.getElementById"""
        try:
            content = (self.workspace / filepath).read_text()
            has_get_element = 'document.getElementById' in content
            has_dom_helpers = 'DOMHelpers.' in content or 'safeGetElement' in content
            
            # If it has getElementById, it should also use DOM Helpers
            passed = not has_get_element or has_dom_helpers
            self.log_test(
                f"{description} - Uses DOM Helpers",
                passed,
                f"Uses document.getElementById without DOM Helpers" if not passed else ""
            )
            return passed
        except Exception as e:
            self.log_test(
                f"{description} - Uses DOM Helpers",
                False,
                f"Error: {str(e)}"
            )
            return False
    
    def test_function_exists(self, filepath, function_name, description):
        """Test that a function exists in a file"""
        pattern = rf'function\s+{function_name}\s*\(|{function_name}\s*:\s*function|const\s+{function_name}\s*=\s*\(|let\s+{function_name}\s*=\s*\(|var\s+{function_name}\s*=\s*\(|{function_name}\s*=\s*\([^)]*\)\s*=>'
        return self.test_file_contains(filepath, pattern, description)
    
    def test_error_handling(self, filepath, description):
        """Test that async functions have error handling"""
        try:
            content = (self.workspace / filepath).read_text()
            # Find async functions without try-catch
            async_funcs = re.findall(r'async\s+\w+\s*\([^)]*\)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}', content, re.DOTALL)
            
            violations = []
            for func in async_funcs:
                if 'try' not in func and 'catch' not in func:
                    violations.append("Async function without try-catch")
            
            # This is a soft check - not all async functions need try-catch
            # Just warn if there are many
            passed = len(violations) < 5  # Allow some without error handling
            self.log_test(
                f"{description} - Error handling",
                passed,
                f"{len(violations)} async functions without try-catch" if not passed else ""
            )
            return passed
        except Exception as e:
            self.log_test(
                f"{description} - Error handling",
                False,
                f"Error: {str(e)}"
            )
            return False
    
    def run_all_tests(self):
        """Run all critical functionality tests"""
        print("=" * 80)
        print("CRITICAL FUNCTIONALITY TESTS (P0)")
        print("=" * 80)
        print()
        
        # 1. Authentication Tests
        print("🔐 Authentication Tests")
        print("-" * 80)
        self.test_file_exists('js/modules/auth.js', 'Auth module')
        self.test_function_exists('js/modules/auth.js', 'login', 'Login function exists')
        self.test_function_exists('js/modules/misc.js', 'logout', 'Logout function exists')
        self.test_no_console_log('js/modules/auth.js', 'Auth module')
        self.test_no_alert('js/modules/auth.js', 'Auth module')
        self.test_dom_helpers_usage('js/modules/auth.js', 'Auth module')
        print()
        
        # 2. Story Generation Tests
        print("📖 Story Generation Tests")
        print("-" * 80)
        self.test_file_exists('js/modules/generation.js', 'Generation module')
        self.test_file_exists('js/unified-ai-generator.js', 'Unified AI generator')
        self.test_function_exists('js/unified-ai-generator.js', 'generateChapterWithAI', 'Generate chapter function exists')
        self.test_no_console_log('js/modules/generation.js', 'Generation module')
        self.test_dom_helpers_usage('js/modules/generation.js', 'Generation module')
        print()
        
        # 3. Story Generation Control Tests
        print("🎛️ Story Generation Control Tests")
        print("-" * 80)
        self.test_file_exists('js/modules/story-generation-control.js', 'Story generation control module')
        self.test_function_exists('js/modules/story-generation-control.js', 'setSpeed', 'Set speed function exists')
        self.test_function_exists('js/modules/story-generation-control.js', 'togglePause', 'Toggle pause function exists')
        self.test_function_exists('js/modules/story-generation-control.js', 'resetStory', 'Reset story function exists')
        self.test_function_exists('js/modules/story-generation-control.js', 'updateGenerationMode', 'Update generation mode function exists')
        self.test_no_console_log('js/modules/story-generation-control.js', 'Story generation control module')
        self.test_dom_helpers_usage('js/modules/story-generation-control.js', 'Story generation control module')
        print()
        
        # 4. Storage Tests
        print("💾 Storage Tests")
        print("-" * 80)
        self.test_file_exists('js/utils/storage.js', 'Storage module')
        self.test_function_exists('js/utils/storage.js', 'setAppState', 'Set app state function exists')
        self.test_function_exists('js/utils/storage.js', 'getAppState', 'Get app state function exists')
        self.test_no_console_log('js/utils/storage.js', 'Storage module')
        print()
        
        # 5. DOM Helpers Tests
        print("🛡️ DOM Helpers Tests")
        print("-" * 80)
        self.test_file_exists('js/utils/dom-helpers.js', 'DOM helpers module')
        self.test_function_exists('js/utils/dom-helpers.js', 'safeGetElement', 'Safe get element function exists')
        self.test_function_exists('js/utils/dom-helpers.js', 'safeSetText', 'Safe set text function exists')
        self.test_function_exists('js/utils/dom-helpers.js', 'safeSetDisplay', 'Safe set display function exists')
        self.test_function_exists('js/utils/dom-helpers.js', 'safeToggleClass', 'Safe toggle class function exists')
        print()
        
        # 6. UI Tests
        print("🎨 UI Tests")
        print("-" * 80)
        self.test_file_exists('js/modules/misc.js', 'Misc module (UI helpers)')
        self.test_function_exists('js/ui/notifications.js', 'showNotification', 'Show notification function exists')
        self.test_function_exists('js/ui/modals.js', 'openModal', 'Open modal function exists')
        self.test_function_exists('js/ui/modals.js', 'closeModal', 'Close modal function exists')
        self.test_no_console_log('js/modules/misc.js', 'Misc module')
        self.test_no_alert('js/modules/misc.js', 'Misc module')
        self.test_dom_helpers_usage('js/modules/misc.js', 'Misc module')
        print()
        
        # 7. Initialization Tests
        print("🚀 Initialization Tests")
        print("-" * 80)
        self.test_file_exists('js/modules/initialization.js', 'Initialization module')
        self.test_no_console_log('js/modules/initialization.js', 'Initialization module')
        print()
        
        # 8. Index HTML Tests
        print("📄 Index HTML Tests")
        print("-" * 80)
        self.test_file_exists('index.html', 'Index HTML')
        self.test_file_contains('index.html', 'js/utils/dom-helpers.js', 'DOM helpers included in HTML')
        self.test_file_contains('index.html', 'js/modules/story-generation-control.js', 'Story generation control included in HTML')
        self.test_file_contains('index.html', 'js/system/system-init.js', 'System init included in HTML')
        print()
        
        # 9. System Rules Tests
        print("📋 System Rules Tests")
        print("-" * 80)
        self.test_file_exists('SYSTEM_RULES.md', 'System rules document')
        self.test_file_contains('SYSTEM_RULES.md', 'UZF-MSR v1.0', 'System rules version is UZF-MSR v1.0')
        print()
        
        # 10. Error Handling Tests
        print("⚠️ Error Handling Tests")
        print("-" * 80)
        self.test_file_exists('js/utils/error-handler.js', 'Error handler module')
        self.test_function_exists('js/utils/error-handler.js', 'safeExecute', 'Safe execute function exists')
        self.test_no_console_log('js/utils/error-handler.js', 'Error handler module')
        print()
        
        # Print summary
        print()
        print("=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.results['total']}")
        print(f"Passed: {self.results['passed']} ✅")
        print(f"Failed: {self.results['failed']} ❌")
        print(f"Success Rate: {(self.results['passed']/self.results['total']*100):.1f}%")
        print()
        
        if self.results['failed'] > 0:
            print("FAILED TESTS:")
            for test in self.results['tests']:
                if not test['passed']:
                    print(f"  ❌ {test['name']}")
                    if test['message']:
                        print(f"     {test['message']}")
            print()
        
        return self.results['failed'] == 0

def main():
    tester = CriticalFunctionalityTester()
    success = tester.run_all_tests()
    
    # Save results to JSON
    results_file = Path('/workspace/CRITICAL_TEST_RESULTS.json')
    with open(results_file, 'w') as f:
        json.dump(tester.results, f, indent=2)
    
    print(f"Test results saved to: {results_file}")
    
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()