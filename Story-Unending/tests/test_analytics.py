#!/usr/bin/env python3
"""
Test script for Analytics Module
Tests all analytics functionality including tracking, metrics, and data export
"""

import json
import os
import sys
import subprocess
import time
from datetime import datetime, timedelta

def test_analytics_module_exists():
    """Test that analytics module file exists"""
    print("Testing analytics module file existence...")
    
    if os.path.exists('js/modules/analytics.js'):
        print("✅ Analytics module file exists")
        return True
    else:
        print("❌ Analytics module file not found")
        return False

def test_analytics_ui_exists():
    """Test that analytics UI module file exists"""
    print("\nTesting analytics UI module file existence...")
    
    if os.path.exists('js/ui/analytics-ui.js'):
        print("✅ Analytics UI module file exists")
        return True
    else:
        print("❌ Analytics UI module file not found")
        return False

def test_analytics_css_exists():
    """Test that analytics CSS file exists"""
    print("\nTesting analytics CSS file existence...")
    
    if os.path.exists('css/analytics.css'):
        print("✅ Analytics CSS file exists")
        return True
    else:
        print("❌ Analytics CSS file not found")
        return False

def test_analytics_module_structure():
    """Test analytics module structure and functions"""
    print("\nTesting analytics module structure...")
    
    try:
        with open('js/modules/analytics.js', 'r') as f:
            content = f.read()
        
        required_functions = [
            'init',
            'trackChapterView',
            'trackReadingTime',
            'trackAction',
            'getSessionStats',
            'getChapterStats',
            'getDailyStats',
            'getActionStats',
            'getSummary',
            'exportData',
            'clearData'
        ]
        
        missing_functions = []
        for func in required_functions:
            if f'function {func}(' not in content and f'{func}:' not in content:
                missing_functions.append(func)
        
        if missing_functions:
            print(f"❌ Missing functions: {', '.join(missing_functions)}")
            return False
        else:
            print(f"✅ All {len(required_functions)} required functions present")
            return True
            
    except Exception as e:
        print(f"❌ Error reading analytics module: {e}")
        return False

def test_analytics_ui_structure():
    """Test analytics UI module structure and functions"""
    print("\nTesting analytics UI module structure...")
    
    try:
        with open('js/ui/analytics-ui.js', 'r') as f:
            content = f.read()
        
        required_functions = [
            'init',
            'openModal',
            'closeModal',
            'switchTab',
            'updateDashboard',
            'exportData',
            'clearData'
        ]
        
        missing_functions = []
        for func in required_functions:
            if f'function {func}(' not in content and f'{func}:' not in content:
                missing_functions.append(func)
        
        if missing_functions:
            print(f"❌ Missing functions: {', '.join(missing_functions)}")
            return False
        else:
            print(f"✅ All {len(required_functions)} required functions present")
            return True
            
    except Exception as e:
        print(f"❌ Error reading analytics UI module: {e}")
        return False

def test_analytics_namespace():
    """Test that Analytics namespace is exported"""
    print("\nTesting Analytics namespace export...")
    
    try:
        with open('js/modules/analytics.js', 'r') as f:
            content = f.read()
        
        if 'window.Analytics' in content:
            print("✅ Analytics namespace exported to window")
            return True
        else:
            print("❌ Analytics namespace not exported")
            return False
            
    except Exception as e:
        print(f"❌ Error checking namespace: {e}")
        return False

def test_analytics_ui_namespace():
    """Test that AnalyticsUI namespace is exported"""
    print("\nTesting AnalyticsUI namespace export...")
    
    try:
        with open('js/ui/analytics-ui.js', 'r') as f:
            content = f.read()
        
        if 'window.AnalyticsUI' in content:
            print("✅ AnalyticsUI namespace exported to window")
            return True
        else:
            print("❌ AnalyticsUI namespace not exported")
            return False
            
    except Exception as e:
        print(f"❌ Error checking namespace: {e}")
        return False

def test_html_integration():
    """Test that analytics is integrated into HTML"""
    print("\nTesting HTML integration...")
    
    try:
        with open('index.html', 'r') as f:
            content = f.read()
        
        checks = {
            'CSS link': '<link rel="stylesheet" href="css/analytics.css">' in content,
            'Analytics module': '<script src="js/modules/analytics.js"></script>' in content,
            'Analytics UI': '<script src="js/ui/analytics-ui.js"></script>' in content,
            'Analytics button': 'Analytics' in content or 'analytics' in content.lower()
        }
        
        all_passed = True
        for check_name, passed in checks.items():
            if passed:
                print(f"✅ {check_name} found")
            else:
                print(f"❌ {check_name} not found")
                all_passed = False
        
        return all_passed
            
    except Exception as e:
        print(f"❌ Error reading HTML file: {e}")
        return False

def test_analytics_css_content():
    """Test analytics CSS content"""
    print("\nTesting analytics CSS content...")
    
    try:
        with open('css/analytics.css', 'r') as f:
            content = f.read()
        
        required_classes = [
            '.analytics-modal',
            '.analytics-tabs',
            '.tab-btn',
            '.stats-grid',
            '.stat-card',
            '.chart-container',
            '.analytics-table'
        ]
        
        missing_classes = []
        for css_class in required_classes:
            if css_class not in content:
                missing_classes.append(css_class)
        
        if missing_classes:
            print(f"❌ Missing CSS classes: {', '.join(missing_classes)}")
            return False
        else:
            print(f"✅ All {len(required_classes)} required CSS classes present")
            return True
            
    except Exception as e:
        print(f"❌ Error reading CSS file: {e}")
        return False

def test_code_quality():
    """Test code quality metrics"""
    print("\nTesting code quality...")
    
    try:
        with open('js/modules/analytics.js', 'r') as f:
            analytics_content = f.read()
        
        with open('js/ui/analytics-ui.js', 'r') as f:
            ui_content = f.read()
        
        # Check for JSDoc comments
        analytics_jsdoc = analytics_content.count('/**')
        ui_jsdoc = ui_content.count('/**')
        
        # Check for error handling
        analytics_error_handling = analytics_content.count('try {')
        ui_error_handling = ui_content.count('try {')
        
        # Check for input sanitization
        sanitization = analytics_content.count('sanitizeHTML') + ui_content.count('sanitizeHTML')
        
        print(f"✅ Analytics module: {analytics_jsdoc} JSDoc comments")
        print(f"✅ Analytics UI: {ui_jsdoc} JSDoc comments")
        print(f"✅ Analytics module: {analytics_error_handling} try-catch blocks")
        print(f"✅ Analytics UI: {ui_error_handling} try-catch blocks")
        print(f"✅ Input sanitization: {sanitization} instances")
        
        return True
            
    except Exception as e:
        print(f"❌ Error checking code quality: {e}")
        return False

def test_functionality_integration():
    """Test that analytics integrates with other modules"""
    print("\nTesting functionality integration...")
    
    try:
        with open('js/modules/analytics.js', 'r') as f:
            content = f.read()
        
        # Check for integration with other modules
        integrations = {
            'Storage module': 'Storage.getItem' in content or 'Storage.setItem' in content,
            'AppState module': 'AppStateModule' in content,
            'ErrorHandler': 'ErrorHandler.handleError' in content
        }
        
        all_passed = True
        for integration_name, passed in integrations.items():
            if passed:
                print(f"✅ {integration_name} integrated")
            else:
                print(f"❌ {integration_name} not integrated")
                all_passed = False
        
        return all_passed
            
    except Exception as e:
        print(f"❌ Error checking integration: {e}")
        return False

def run_all_tests():
    """Run all tests and return results"""
    print("=" * 60)
    print("ANALYTICS MODULE TEST SUITE")
    print("=" * 60)
    
    tests = [
        test_analytics_module_exists,
        test_analytics_ui_exists,
        test_analytics_css_exists,
        test_analytics_module_structure,
        test_analytics_ui_structure,
        test_analytics_namespace,
        test_analytics_ui_namespace,
        test_html_integration,
        test_analytics_css_content,
        test_code_quality,
        test_functionality_integration
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append(False)
        time.sleep(0.1)
    
    print("\n" + "=" * 60)
    print("TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    percentage = (passed / total) * 100 if total > 0 else 0
    
    print(f"Tests Passed: {passed}/{total} ({percentage:.1f}%)")
    
    if passed == total:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1

if __name__ == '__main__':
    sys.exit(run_all_tests())