#!/usr/bin/env python3
"""
Test Sentry error tracking implementation.
"""

import os

def test_sentry_module():
    """Test that Sentry module exists and is valid."""
    print("=" * 80)
    print("TEST 1: Sentry Module Verification")
    print("=" * 80)
    
    try:
        with open('js/utils/sentry.js', 'r') as f:
            content = f.read()
        
        # Check for key functions
        required_functions = [
            'init',
            'captureException',
            'captureMessage',
            'setUser',
            'setTag',
            'setContext',
            'addBreadcrumb',
            'startTransaction',
            'isInitialized'
        ]
        
        for func in required_functions:
            if func in content:
                print(f"  ✓ Function '{func}' found")
            else:
                print(f"  ✗ Function '{func}' missing")
                return False
        
        # Check for export
        if 'window.SentryModule = Sentry' in content:
            print("  ✓ Export to global scope found")
        else:
            print("  ✗ Export to global scope missing")
            return False
        
        # Check for error handling
        if 'try {' in content and 'catch' in content:
            print("  ✓ Error handling found")
        else:
            print("  ✗ Error handling missing")
            return False
        
        return True
        
    except FileNotFoundError:
        print("  ✗ sentry.js not found")
        return False

def test_html_integration():
    """Test that HTML integration is correct."""
    print("\n" + "=" * 80)
    print("TEST 2: HTML Integration Verification")
    print("=" * 80)
    
    with open('index.html', 'r') as f:
        html_content = f.read()
    
    # Check that sentry.js is present
    if 'js/utils/sentry.js' in html_content:
        print("  ✓ sentry.js is present")
    else:
        print("  ✗ sentry.js is missing")
        return False
    
    # Check that Sentry CDN is present
    if '@sentry/browser' in html_content:
        print("  ✓ Sentry CDN is present")
    else:
        print("  ✗ Sentry CDN is missing")
        return False
    
    # Check for initialization code
    if 'SentryModule.init' in html_content:
        print("  ✓ Sentry initialization code found")
    else:
        print("  ✗ Sentry initialization code missing")
        return False
    
    # Check for DSN configuration
    if 'sentry_dsn' in html_content:
        print("  ✓ DSN configuration found")
    else:
        print("  ✗ DSN configuration missing")
        return False
    
    return True

def test_package_json():
    """Test that Sentry is in package.json."""
    print("\n" + "=" * 80)
    print("TEST 3: Package.json Verification")
    print("=" * 80)
    
    try:
        with open('package.json', 'r') as f:
            import json
            package_json = json.load(f)
        
        # Check for Sentry dependency
        if '@sentry/browser' in package_json.get('dependencies', {}):
            print("  ✓ @sentry/browser in dependencies")
            version = package_json['dependencies']['@sentry/browser']
            print(f"    Version: {version}")
        else:
            print("  ✗ @sentry/browser not in dependencies")
            return False
        
        return True
        
    except FileNotFoundError:
        print("  ✗ package.json not found")
        return False
    except json.JSONDecodeError:
        print("  ✗ package.json is not valid JSON")
        return False

def test_error_handling():
    """Test error handling capabilities."""
    print("\n" + "=" * 80)
    print("TEST 4: Error Handling Capabilities")
    print("=" * 80)
    
    with open('js/utils/sentry.js', 'r') as f:
        content = f.read()
    
    # Check for before send callback
    if 'beforeSend' in content:
        print("  ✓ beforeSend callback found")
    else:
        print("  ✗ beforeSend callback missing")
        return False
    
    # Check for before breadcrumb callback
    if 'beforeBreadcrumb' in content:
        print("  ✓ beforeBreadcrumb callback found")
    else:
        print("  ✗ beforeBreadcrumb callback missing")
        return False
    
    # Check for error filtering
    if 'NetworkError' in content or 'AbortError' in content:
        print("  ✓ Error filtering found")
    else:
        print("  ✗ Error filtering missing")
        return False
    
    # Check for context setting
    if 'setContext' in content:
        print("  ✓ Context setting found")
    else:
        print("  ✗ Context setting missing")
        return False
    
    return True

def test_performance_monitoring():
    """Test performance monitoring capabilities."""
    print("\n" + "=" * 80)
    print("TEST 5: Performance Monitoring Capabilities")
    print("=" * 80)
    
    with open('js/utils/sentry.js', 'r') as f:
        content = f.read()
    
    # Check for transaction support
    if 'startTransaction' in content:
        print("  ✓ Transaction support found")
    else:
        print("  ✗ Transaction support missing")
        return False
    
    # Check for tracing configuration
    if 'tracesSampleRate' in content:
        print("  ✓ Tracing configuration found")
    else:
        print("  ✗ Tracing configuration missing")
        return False
    
    # Check for replay support
    if 'Replay' in content or 'replaysSessionSampleRate' in content:
        print("  ✓ Session replay support found")
    else:
        print("  ✗ Session replay support missing")
        return False
    
    return True

def main():
    """Run all tests."""
    print("\n" + "=" * 80)
    print("SENTRY ERROR TRACKING IMPLEMENTATION TESTS")
    print("=" * 80)
    
    tests = [
        ("Sentry Module", test_sentry_module),
        ("HTML Integration", test_html_integration),
        ("Package.json", test_package_json),
        ("Error Handling", test_error_handling),
        ("Performance Monitoring", test_performance_monitoring),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n  ✗ Test failed with error: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status}: {test_name}")
    
    print(f"\n  Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n  🎉 All tests passed! Sentry error tracking implementation is complete.")
        return True
    else:
        print(f"\n  ⚠️  {total - passed} test(s) failed. Please review the issues above.")
        return False

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)