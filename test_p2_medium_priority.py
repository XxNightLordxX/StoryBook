#!/usr/bin/env python3
"""
P2 - Medium Priority Tests
Tests for medium priority features: Screenshots, Leaderboards, Achievements, Analytics, Performance
"""

import os
import re
import json
from pathlib import Path

# ANSI color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{'='*80}")
    print(f"{text}")
    print(f"{'='*80}\n")

def print_section(text):
    print(f"\n{text}")
    print("-" * 80)

def check_file_exists(filepath):
    """Check if a file exists"""
    return os.path.exists(filepath)

def check_function_exists(filepath, function_name):
    """Check if a function is defined in a file"""
    if not check_file_exists(filepath):
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for function definition (both regular and arrow functions)
    patterns = [
        rf'function\s+{function_name}\s*\(',
        rf'{function_name}\s*:\s*function\s*\(',
        rf'{function_name}\s*=\s*function\s*\(',
        rf'{function_name}\s*=\s*\([^)]*\)\s*=>',
        rf'export\s+function\s+{function_name}',
        rf'export\s+const\s+{function_name}\s*=\s*\(',
    ]
    
    for pattern in patterns:
        if re.search(pattern, content):
            return True
    
    return False

def check_no_console_log(filepath):
    """Check if file has no console.log statements"""
    if not check_file_exists(filepath):
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for console.log (but not in comments)
    lines = content.split('\n')
    for line in lines:
        stripped = line.strip()
        # Skip comments
        if stripped.startswith('//') or stripped.startswith('*'):
            continue
        if 'console.log' in line and not stripped.startswith('//'):
            return False
    
    return True

def check_module_included(html_file, module_path):
    """Check if a module is included in HTML"""
    if not check_file_exists(html_file):
        return False
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    return module_path in content

def run_test(test_name, test_func):
    """Run a single test and return result"""
    try:
        result = test_func()
        if result:
            print(f"{GREEN}✅ PASS:{RESET} {test_name}")
            return True
        else:
            print(f"{RED}❌ FAIL:{RESET} {test_name}")
            return False
    except Exception as e:
        print(f"{RED}❌ ERROR:{RESET} {test_name} - {str(e)}")
        return False

# Test results storage
test_results = {
    'total': 0,
    'passed': 0,
    'failed': 0,
    'categories': {}
}

def main():
    print_header("MEDIUM PRIORITY TESTS (P2)")
    
    # Screenshots Tests
    print_section("📸 Screenshots Tests")
    screenshot_tests = [
        ("Screenshot module exists", lambda: check_file_exists('js/modules/screenshot.js')),
        ("Capture screenshot function exists", lambda: check_function_exists('js/modules/screenshot.js', 'captureScreenshot')),
        ("Download screenshot function exists", lambda: check_function_exists('js/modules/screenshot.js', 'downloadScreenshot')),
        ("Screenshot module - No console.log", lambda: check_no_console_log('js/modules/screenshot.js')),
        ("Screenshot UI module exists", lambda: check_file_exists('js/ui/screenshot-ui.js')),
        ("Screenshot UI module - No console.log", lambda: check_no_console_log('js/ui/screenshot-ui.js')),
    ]
    
    screenshot_results = {'passed': 0, 'failed': 0, 'total': len(screenshot_tests)}
    for test_name, test_func in screenshot_tests:
        if run_test(test_name, test_func):
            screenshot_results['passed'] += 1
        else:
            screenshot_results['failed'] += 1
    test_results['categories']['screenshots'] = screenshot_results
    
    # Leaderboards Tests
    print_section("🏆 Leaderboards Tests")
    leaderboard_tests = [
        ("Leaderboards module exists", lambda: check_file_exists('js/modules/leaderboards.js')),
        ("Get leaderboard function exists", lambda: check_function_exists('js/modules/leaderboards.js', 'getLeaderboard')),
        ("Submit score function exists", lambda: check_function_exists('js/modules/leaderboards.js', 'submitScore')),
        ("Leaderboards module - No console.log", lambda: check_no_console_log('js/modules/leaderboards.js')),
        ("Leaderboards UI module exists", lambda: check_file_exists('js/ui/leaderboards-ui.js')),
        ("Leaderboards UI module - No console.log", lambda: check_no_console_log('js/ui/leaderboards-ui.js')),
    ]
    
    leaderboard_results = {'passed': 0, 'failed': 0, 'total': len(leaderboard_tests)}
    for test_name, test_func in leaderboard_tests:
        if run_test(test_name, test_func):
            leaderboard_results['passed'] += 1
        else:
            leaderboard_results['failed'] += 1
    test_results['categories']['leaderboards'] = leaderboard_results
    
    # Achievements Tests
    print_section("🎖️ Achievements Tests")
    achievement_tests = [
        ("Achievements module exists", lambda: check_file_exists('js/modules/achievements.js')),
        ("Unlock achievement function exists", lambda: check_function_exists('js/modules/achievements.js', 'unlockAchievement')),
        ("Get achievements function exists", lambda: check_function_exists('js/modules/achievements.js', 'getAchievements')),
        ("Check achievement function exists", lambda: check_function_exists('js/modules/achievements.js', 'checkAchievement')),
        ("Achievements module - No console.log", lambda: check_no_console_log('js/modules/achievements.js')),
    ]
    
    achievement_results = {'passed': 0, 'failed': 0, 'total': len(achievement_tests)}
    for test_name, test_func in achievement_tests:
        if run_test(test_name, test_func):
            achievement_results['passed'] += 1
        else:
            achievement_results['failed'] += 1
    test_results['categories']['achievements'] = achievement_results
    
    # Analytics Tests
    print_section("📊 Analytics Tests")
    analytics_tests = [
        ("Analytics module exists", lambda: check_file_exists('js/modules/analytics.js')),
        ("Track event function exists", lambda: check_function_exists('js/modules/analytics.js', 'trackEvent')),
        ("Get analytics function exists", lambda: check_function_exists('js/modules/analytics.js', 'getAnalytics')),
        ("Analytics module - No console.log", lambda: check_no_console_log('js/modules/analytics.js')),
        ("Analytics UI module exists", lambda: check_file_exists('js/ui/analytics-ui.js')),
        ("Analytics UI module - No console.log", lambda: check_no_console_log('js/ui/analytics-ui.js')),
    ]
    
    analytics_results = {'passed': 0, 'failed': 0, 'total': len(analytics_tests)}
    for test_name, test_func in analytics_tests:
        if run_test(test_name, test_func):
            analytics_results['passed'] += 1
        else:
            analytics_results['failed'] += 1
    test_results['categories']['analytics'] = analytics_results
    
    # Performance Tests
    print_section("⚡ Performance Tests")
    performance_tests = [
        ("Performance module exists", lambda: check_file_exists('js/modules/performance.js')),
        ("Measure performance function exists", lambda: check_function_exists('js/modules/performance.js', 'measurePerformance')),
        ("Performance module - No console.log", lambda: check_no_console_log('js/modules/performance.js')),
        ("Performance advanced module exists", lambda: check_file_exists('js/modules/performance-advanced.js')),
        ("Performance advanced module - No console.log", lambda: check_no_console_log('js/modules/performance-advanced.js')),
        ("Performance UI module exists", lambda: check_file_exists('js/ui/performance-ui.js')),
        ("Performance UI module - No console.log", lambda: check_no_console_log('js/ui/performance-ui.js')),
    ]
    
    performance_results = {'passed': 0, 'failed': 0, 'total': len(performance_tests)}
    for test_name, test_func in performance_tests:
        if run_test(test_name, test_func):
            performance_results['passed'] += 1
        else:
            performance_results['failed'] += 1
    test_results['categories']['performance'] = performance_results
    
    # Integration Tests
    print_section("🔗 Integration Tests")
    integration_tests = [
        ("Screenshot module included in HTML", lambda: check_module_included('index.html', 'js/modules/screenshot.js')),
        ("Leaderboards module included in HTML", lambda: check_module_included('index.html', 'js/modules/leaderboards.js')),
        ("Achievements module included in HTML", lambda: check_module_included('index.html', 'js/modules/achievements.js')),
        ("Analytics module included in HTML", lambda: check_module_included('index.html', 'js/modules/analytics.js')),
        ("Performance module included in HTML", lambda: check_module_included('index.html', 'js/modules/performance.js')),
    ]
    
    integration_results = {'passed': 0, 'failed': 0, 'total': len(integration_tests)}
    for test_name, test_func in integration_tests:
        if run_test(test_name, test_func):
            integration_results['passed'] += 1
        else:
            integration_results['failed'] += 1
    test_results['categories']['integration'] = integration_results
    
    # Calculate totals
    test_results['total'] = sum(cat['total'] for cat in test_results['categories'].values())
    test_results['passed'] = sum(cat['passed'] for cat in test_results['categories'].values())
    test_results['failed'] = sum(cat['failed'] for cat in test_results['categories'].values())
    
    # Print summary
    print_header("TEST SUMMARY")
    print(f"Total Tests: {test_results['total']}")
    print(f"Passed: {test_results['passed']} {GREEN}✅{RESET}")
    print(f"Failed: {test_results['failed']} {RED}❌{RESET}")
    success_rate = (test_results['passed'] / test_results['total'] * 100) if test_results['total'] > 0 else 0
    print(f"Success Rate: {success_rate:.1f}%")
    
    # Save results to JSON
    with open('/workspace/P2_TEST_RESULTS.json', 'w') as f:
        json.dump(test_results, f, indent=2)
    
    print(f"\nTest results saved to: /workspace/P2_TEST_RESULTS.json")
    
    return test_results

if __name__ == '__main__':
    main()