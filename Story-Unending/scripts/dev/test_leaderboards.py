#!/usr/bin/env python3
"""
Test script for Achievement Leaderboards implementation
"""

import os
import json
import re

def test_leaderboards_module():
    """Test the leaderboards module"""
    print("Testing Leaderboards Module...")
    
    file_path = "js/modules/leaderboards.js"
    
    if not os.path.exists(file_path):
        print("❌ FAIL: leaderboards.js not found")
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Test for required functions
    required_functions = [
        'init',
        'updateUserStats',
        'getLeaderboard',
        'getUserRank',
        'getUserHistory',
        'getStatistics',
        'getTopUsers',
        'searchLeaderboard',
        'exportLeaderboard',
        'importLeaderboard',
        'resetLeaderboard',
        'sortLeaderboards',
        'compareUsers',
        'getUserStats'
    ]
    
    missing_functions = []
    for func in required_functions:
        if f'function {func}(' not in content and f'{func}:' not in content:
            missing_functions.append(func)
    
    if missing_functions:
        print(f"❌ FAIL: Missing functions: {', '.join(missing_functions)}")
        return False
    
    # Test for constants
    required_constants = [
        'LEADERBOARD_TYPES',
        'SORT_METHODS',
        'TIME_PERIODS'
    ]
    
    for const in required_constants:
        if const not in content:
            print(f"❌ FAIL: Missing constant: {const}")
            return False
    
    # Test for namespace export
    if 'window.Leaderboards' not in content:
        print("❌ FAIL: Leaderboards namespace not exported")
        return False
    
    print("✅ PASS: Leaderboards module has all required functions and constants")
    return True

def test_leaderboards_ui_module():
    """Test the leaderboards UI module"""
    print("\nTesting Leaderboards UI Module...")
    
    file_path = "js/ui/leaderboards-ui.js"
    
    if not os.path.exists(file_path):
        print("❌ FAIL: leaderboards-ui.js not found")
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Test for required functions
    required_functions = [
        'init',
        'openModal',
        'closeModal',
        'switchTab',
        'changeType',
        'changeSort',
        'changeLimit',
        'searchLeaderboard',
        'runComparison',
        'exportData'
    ]
    
    missing_functions = []
    for func in required_functions:
        if f'function {func}(' not in content and f'{func}:' not in content:
            missing_functions.append(func)
    
    if missing_functions:
        print(f"❌ FAIL: Missing functions: {', '.join(missing_functions)}")
        return False
    
    # Test for namespace export
    if 'window.LeaderboardsUI' not in content:
        print("❌ FAIL: LeaderboardsUI namespace not exported")
        return False
    
    # Test for modal creation
    if 'leaderboards-modal' not in content:
        print("❌ FAIL: Modal HTML not found")
        return False
    
    # Test for tabs
    if 'leaderboard' not in content or 'my-rank' not in content:
        print("❌ FAIL: Required tabs not found")
        return False
    
    print("✅ PASS: Leaderboards UI module has all required functions and UI elements")
    return True

def test_leaderboards_css():
    """Test the leaderboards CSS"""
    print("\nTesting Leaderboards CSS...")
    
    file_path = "css/leaderboards.css"
    
    if not os.path.exists(file_path):
        print("❌ FAIL: leaderboards.css not found")
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Test for required classes
    required_classes = [
        '.leaderboard-modal',
        '.tab-btn',
        '.leaderboard-filters',
        '.leaderboard-table',
        '.rank-col',
        '.user-col',
        '.stat-card',
        '.rank-item',
        '.top-user-item',
        '.comparison-bar'
    ]
    
    missing_classes = []
    for cls in required_classes:
        if cls not in content:
            missing_classes.append(cls)
    
    if missing_classes:
        print(f"❌ FAIL: Missing CSS classes: {', '.join(missing_classes)}")
        return False
    
    # Test for responsive design
    if '@media' not in content:
        print("❌ FAIL: No responsive design found")
        return False
    
    # Test for dark mode
    if '@media (prefers-color-scheme: dark)' not in content:
        print("❌ FAIL: No dark mode support found")
        return False
    
    print("✅ PASS: Leaderboards CSS has all required classes and responsive design")
    return True

def test_html_integration():
    """Test HTML integration"""
    print("\nTesting HTML Integration...")
    
    file_path = "index.html"
    
    if not os.path.exists(file_path):
        print("❌ FAIL: index.html not found")
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Test for script tags
    if 'js/modules/leaderboards.js' not in content:
        print("❌ FAIL: leaderboards.js not included in HTML")
        return False
    
    if 'js/ui/leaderboards-ui.js' not in content:
        print("❌ FAIL: leaderboards-ui.js not included in HTML")
        return False
    
    # Test for CSS link
    if 'css/leaderboards.css' not in content:
        print("❌ FAIL: leaderboards.css not included in HTML")
        return False
    
    print("✅ PASS: All leaderboards files properly integrated in HTML")
    return True

def test_package_json():
    """Test package.json for dependencies"""
    print("\nTesting package.json...")
    
    file_path = "package.json"
    
    if not os.path.exists(file_path):
        print("❌ FAIL: package.json not found")
        return False
    
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    # Leaderboards doesn't require external dependencies
    print("✅ PASS: package.json exists (no external dependencies needed)")
    return True

def main():
    """Run all tests"""
    print("=" * 60)
    print("Achievement Leaderboards Test Suite")
    print("=" * 60)
    
    tests = [
        ("Leaderboards Module", test_leaderboards_module),
        ("Leaderboards UI Module", test_leaderboards_ui_module),
        ("Leaderboards CSS", test_leaderboards_css),
        ("HTML Integration", test_html_integration),
        ("package.json", test_package_json)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ ERROR in {test_name}: {str(e)}")
            results.append((test_name, False))
    
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print("\n" + "=" * 60)
    print(f"Total: {passed}/{total} tests passed")
    print("=" * 60)
    
    if passed == total:
        print("\n🎉 All tests passed! Achievement Leaderboards is ready.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review the issues above.")
        return 1

if __name__ == "__main__":
    exit(main())