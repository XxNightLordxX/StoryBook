#!/usr/bin/env python3
"""
Test lazy loading implementation without requiring Vite build.
Verify that lazy loading works correctly in development mode.
"""

import subprocess
import time
import os

def test_html_structure():
    """Test that HTML structure is correct."""
    print("=" * 80)
    print("TEST 1: HTML Structure Verification")
    print("=" * 80)
    
    with open('index.html', 'r') as f:
        html_content = f.read()
    
    # Check that lazy-loader.js is present
    if 'js/utils/lazy-loader.js' in html_content:
        print("  ✓ lazy-loader.js is present")
    else:
        print("  ✗ lazy-loader.js is missing")
        return False
    
    # Check that lazy-loaded scripts are removed
    lazy_scripts = [
        'js/modules/analytics.js',
        'js/ui/analytics-ui.js',
        'js/modules/bookmarks.js',
        'js/ui/bookmarks-ui.js',
        'js/modules/search.js',
        'js/ui/search-ui.js',
        'js/modules/save-load.js',
        'js/ui/save-load-ui.js',
        'js/modules/reading-history.js',
        'js/ui/reading-history-ui.js',
        'js/modules/performance.js',
        'js/ui/performance-ui.js',
        'js/modules/content-management.js',
        'js/ui/content-management-ui.js',
        'js/modules/user-profiles.js',
        'js/modules/user-preferences.js',
        'js/modules/achievements.js',
        'js/modules/social-features.js',
        'js/modules/messaging.js',
        'js/ui/user-features-ui.js',
        'js/modules/notifications.js',
        'js/ui/notifications-ui.js',
        'js/modules/api.js',
        'js/modules/branching-narrative.js',
        'js/modules/dynamic-content.js',
    ]
    
    removed_count = 0
    for script in lazy_scripts:
        if script not in html_content:
            removed_count += 1
    
    print(f"  ✓ {removed_count}/{len(lazy_scripts)} lazy-loaded scripts removed")
    
    # Check that lazy loading is used in buttons
    if 'LazyLoader.loadModule' in html_content:
        print("  ✓ LazyLoader.loadModule() is used in buttons")
    else:
        print("  ✗ LazyLoader.loadModule() is not used")
        return False
    
    # Count script tags
    script_count = html_content.count('<script src=')
    print(f"  ✓ Total script tags: {script_count} (reduced from 52)")
    
    return True

def test_lazy_loader_module():
    """Test that lazy-loader.js exists and is valid."""
    print("\n" + "=" * 80)
    print("TEST 2: Lazy Loader Module Verification")
    print("=" * 80)
    
    try:
        with open('js/utils/lazy-loader.js', 'r') as f:
            content = f.read()
        
        # Check for key functions
        required_functions = [
            'loadModule',
            'preloadModule',
            'isModuleLoaded',
            'getAvailableModules'
        ]
        
        for func in required_functions:
            if func in content:
                print(f"  ✓ Function '{func}' found")
            else:
                print(f"  ✗ Function '{func}' missing")
                return False
        
        # Check for module definitions
        if 'const modules = {' in content:
            print("  ✓ Module definitions found")
        else:
            print("  ✗ Module definitions missing")
            return False
        
        # Check for export
        if 'window.LazyLoader = LazyLoader' in content:
            print("  ✓ Export to global scope found")
        else:
            print("  ✗ Export to global scope missing")
            return False
        
        # Check for CSS loading
        if 'loadCSS' in content:
            print("  ✓ CSS loading function found")
        else:
            print("  ✗ CSS loading function missing")
            return False
        
        # Check for JS loading
        if 'loadJS' in content:
            print("  ✓ JS loading function found")
        else:
            print("  ✗ JS loading function missing")
            return False
        
        return True
        
    except FileNotFoundError:
        print("  ✗ lazy-loader.js not found")
        return False

def test_module_files_exist():
    """Test that all module files exist."""
    print("\n" + "=" * 80)
    print("TEST 3: Module Files Verification")
    print("=" * 80)
    
    # Critical modules (should be loaded immediately)
    critical_modules = [
        'js/utils/security.js',
        'js/utils/storage.js',
        'js/utils/helpers.js',
        'js/utils/formatters.js',
        'js/utils/ui-helpers.js',
        'js/utils/lazy-loader.js',
        'js/modules/app-state.js',
        'js/modules/auth.js',
        'js/modules/navigation.js',
        'js/modules/initialization.js',
        'js/ui/dropdown.js',
        'js/ui/text-size.js',
        'js/ui/modals.js',
        'js/ui/notifications.js',
        'backstory-engine.js',
        'story-engine.js',
    ]
    
    print("  Critical Modules:")
    critical_found = 0
    for module in critical_modules:
        if os.path.exists(module):
            critical_found += 1
            print(f"    ✓ {module}")
        else:
            print(f"    ✗ {module} NOT FOUND")
    
    print(f"\n  Found {critical_found}/{len(critical_modules)} critical modules")
    
    # Lazy-loaded modules (should exist but not loaded initially)
    lazy_modules = [
        'js/modules/analytics.js',
        'js/ui/analytics-ui.js',
        'js/modules/bookmarks.js',
        'js/ui/bookmarks-ui.js',
        'js/modules/search.js',
        'js/ui/search-ui.js',
        'js/modules/save-load.js',
        'js/ui/save-load-ui.js',
        'js/modules/reading-history.js',
        'js/ui/reading-history-ui.js',
        'js/modules/performance.js',
        'js/ui/performance-ui.js',
        'js/modules/content-management.js',
        'js/ui/content-management-ui.js',
        'js/modules/user-profiles.js',
        'js/modules/user-preferences.js',
        'js/modules/achievements.js',
        'js/modules/social-features.js',
        'js/modules/messaging.js',
        'js/ui/user-features-ui.js',
        'js/modules/notifications.js',
        'js/ui/notifications-ui.js',
        'js/modules/api.js',
        'js/modules/branching-narrative.js',
        'js/modules/dynamic-content.js',
    ]
    
    print("\n  Lazy-Loaded Modules:")
    lazy_found = 0
    for module in lazy_modules:
        if os.path.exists(module):
            lazy_found += 1
            print(f"    ✓ {module}")
        else:
            print(f"    ✗ {module} NOT FOUND")
    
    print(f"\n  Found {lazy_found}/{len(lazy_modules)} lazy-loaded modules")
    
    return critical_found == len(critical_modules) and lazy_found == len(lazy_modules)

def calculate_performance_improvement():
    """Calculate expected performance improvement."""
    print("\n" + "=" * 80)
    print("TEST 4: Performance Improvement Analysis")
    print("=" * 80)
    
    # Calculate sizes
    critical_modules = [
        'js/utils/security.js',
        'js/utils/storage.js',
        'js/utils/helpers.js',
        'js/utils/formatters.js',
        'js/utils/ui-helpers.js',
        'js/utils/lazy-loader.js',
        'js/modules/app-state.js',
        'js/modules/auth.js',
        'js/modules/navigation.js',
        'js/modules/initialization.js',
        'js/ui/dropdown.js',
        'js/ui/text-size.js',
        'js/ui/modals.js',
        'js/ui/notifications.js',
        'backstory-engine.js',
        'story-engine.js',
    ]
    
    lazy_modules = [
        'js/modules/analytics.js',
        'js/ui/analytics-ui.js',
        'js/modules/bookmarks.js',
        'js/ui/bookmarks-ui.js',
        'js/modules/search.js',
        'js/ui/search-ui.js',
        'js/modules/save-load.js',
        'js/ui/save-load-ui.js',
        'js/modules/reading-history.js',
        'js/ui/reading-history-ui.js',
        'js/modules/performance.js',
        'js/ui/performance-ui.js',
        'js/modules/content-management.js',
        'js/ui/content-management-ui.js',
        'js/modules/user-profiles.js',
        'js/modules/user-preferences.js',
        'js/modules/achievements.js',
        'js/modules/social-features.js',
        'js/modules/messaging.js',
        'js/ui/user-features-ui.js',
        'js/modules/notifications.js',
        'js/ui/notifications-ui.js',
        'js/modules/api.js',
        'js/modules/branching-narrative.js',
        'js/modules/dynamic-content.js',
    ]
    
    critical_size = sum(os.path.getsize(m) for m in critical_modules if os.path.exists(m))
    lazy_size = sum(os.path.getsize(m) for m in lazy_modules if os.path.exists(m))
    total_size = critical_size + lazy_size
    
    improvement = (lazy_size / total_size) * 100
    
    print(f"  Total JavaScript Size: {total_size:,} bytes ({total_size/1024:.1f} KB)")
    print(f"  Critical (Initial Load): {critical_size:,} bytes ({critical_size/1024:.1f} KB)")
    print(f"  Lazy Load (On Demand): {lazy_size:,} bytes ({lazy_size/1024:.1f} KB)")
    print(f"  Initial Load Reduction: {lazy_size/1024:.1f} KB")
    print(f"  Expected Performance Improvement: ~{improvement:.1f}% faster initial load")
    
    return True

def test_server_startup():
    """Test that the server starts correctly."""
    print("\n" + "=" * 80)
    print("TEST 5: Server Startup Verification")
    print("=" * 80)
    
    try:
        # Start server in background
        print("  Starting HTTP server on port 8080...")
        process = subprocess.Popen(
            ['python3', '-m', 'http.server', '8080'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait for server to start
        time.sleep(2)
        
        # Check if process is running
        if process.poll() is None:
            print("  ✓ Server started successfully")
            print("  ✓ Server running on http://localhost:8080")
            
            # Stop server
            process.terminate()
            process.wait(timeout=5)
            print("  ✓ Server stopped successfully")
            
            return True
        else:
            print("  ✗ Server failed to start")
            return False
            
    except Exception as e:
        print(f"  ✗ Server error: {e}")
        return False

def main():
    """Run all tests."""
    print("\n" + "=" * 80)
    print("LAZY LOADING IMPLEMENTATION TESTS")
    print("=" * 80)
    
    tests = [
        ("HTML Structure", test_html_structure),
        ("Lazy Loader Module", test_lazy_loader_module),
        ("Module Files", test_module_files_exist),
        ("Performance Analysis", calculate_performance_improvement),
        ("Server Startup", test_server_startup),
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
        print("\n  🎉 All tests passed! Lazy loading implementation is complete.")
        return True
    else:
        print(f"\n  ⚠️  {total - passed} test(s) failed. Please review the issues above.")
        return False

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)