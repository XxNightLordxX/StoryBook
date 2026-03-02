#!/usr/bin/env python3
"""
Test script for search suggestions and screenshot capture enhancements
"""

import os
import json
import re

def test_search_suggestions_module():
    """Test search suggestions module"""
    print("Testing search suggestions module...")
    
    module_path = "js/modules/search-suggestions.js"
    
    if not os.path.exists(module_path):
        print(f"❌ FAIL: {module_path} not found")
        return False
    
    with open(module_path, 'r') as f:
        content = f.read()
    
    # Check for required functions
    required_functions = [
        'init',
        'getCachedSuggestions',
        'cacheSuggestions',
        'addToHistory',
        'getHistory',
        'clearHistory',
        'clearCache',
        'getContextAwareSuggestions',
        'getEnhancedSuggestions',
        'rankSuggestions',
        'getSuggestionStats'
    ]
    
    all_found = True
    for func in required_functions:
        if f'function {func}' not in content and f'{func}:' not in content:
            print(f"❌ FAIL: Function '{func}' not found")
            all_found = False
        else:
            print(f"✅ PASS: Function '{func}' found")
    
    # Check for namespace export
    if 'window.SearchSuggestions' not in content:
        print("❌ FAIL: SearchSuggestions namespace not exported")
        all_found = False
    else:
        print("✅ PASS: SearchSuggestions namespace exported")
    
    # Check for cache functionality
    if 'SUGGESTION_CACHE_KEY' not in content:
        print("❌ FAIL: Cache key not defined")
        all_found = False
    else:
        print("✅ PASS: Cache functionality present")
    
    # Check for history functionality
    if 'SUGGESTION_HISTORY_KEY' not in content:
        print("❌ FAIL: History key not defined")
        all_found = False
    else:
        print("✅ PASS: History functionality present")
    
    return all_found

def test_screenshot_capture_module():
    """Test screenshot capture module"""
    print("\nTesting screenshot capture module...")
    
    module_path = "js/modules/screenshot-capture.js"
    
    if not os.path.exists(module_path):
        print(f"❌ FAIL: {module_path} not found")
        return False
    
    with open(module_path, 'r') as f:
        content = f.read()
    
    # Check for required functions
    required_functions = [
        'initHtml2Canvas',
        'captureScreenshot',
        'captureChapterScreenshot',
        'capturePageScreenshot',
        'captureRegionScreenshot',
        'cacheScreenshot',
        'getCachedScreenshot',
        'removeCachedScreenshot',
        'clearCache',
        'downloadScreenshot',
        'createThumbnail',
        'getScreenshotStats',
        'optimizeCache',
        'captureWithPreview'
    ]
    
    all_found = True
    for func in required_functions:
        if f'function {func}' not in content and f'{func}:' not in content:
            print(f"❌ FAIL: Function '{func}' not found")
            all_found = False
        else:
            print(f"✅ PASS: Function '{func}' found")
    
    # Check for namespace export
    if 'window.ScreenshotCapture' not in content:
        print("❌ FAIL: ScreenshotCapture namespace not exported")
        all_found = False
    else:
        print("✅ PASS: ScreenshotCapture namespace exported")
    
    # Check for cache functionality
    if 'SCREENSHOT_CACHE_KEY' not in content:
        print("❌ FAIL: Cache key not defined")
        all_found = False
    else:
        print("✅ PASS: Cache functionality present")
    
    return all_found

def test_screenshot_ui():
    """Test screenshot UI module"""
    print("\nTesting screenshot UI module...")
    
    module_path = "js/ui/screenshot-ui.js"
    
    if not os.path.exists(module_path):
        print(f"❌ FAIL: {module_path} not found")
        return False
    
    with open(module_path, 'r') as f:
        content = f.read()
    
    # Check for required functions
    required_functions = [
        'openModal',
        'closeModal',
        'captureScreenshot',
        'displayPreview',
        'downloadScreenshot',
        'copyToClipboard',
        'attachToSave',
        'clearPreview',
        'updateStats',
        'clearCache'
    ]
    
    all_found = True
    for func in required_functions:
        if f'function {func}' not in content and f'{func}:' not in content:
            print(f"❌ FAIL: Function '{func}' not found")
            all_found = False
        else:
            print(f"✅ PASS: Function '{func}' found")
    
    # Check for namespace export
    if 'window.ScreenshotUI' not in content:
        print("❌ FAIL: ScreenshotUI namespace not exported")
        all_found = False
    else:
        print("✅ PASS: ScreenshotUI namespace exported")
    
    # Check for modal creation
    if 'screenshot-modal' not in content:
        print("❌ FAIL: Screenshot modal not created")
        all_found = False
    else:
        print("✅ PASS: Screenshot modal created")
    
    return all_found

def test_screenshot_css():
    """Test screenshot CSS file"""
    print("\nTesting screenshot CSS...")
    
    css_path = "css/screenshot.css"
    
    if not os.path.exists(css_path):
        print(f"❌ FAIL: {css_path} not found")
        return False
    
    with open(css_path, 'r') as f:
        content = f.read()
    
    # Check for required CSS classes
    required_classes = [
        '.screenshot-content',
        '.screenshot-options',
        '.preview-container',
        '.stats-grid',
        '.stat-item'
    ]
    
    all_found = True
    for css_class in required_classes:
        if css_class not in content:
            print(f"❌ FAIL: CSS class '{css_class}' not found")
            all_found = False
        else:
            print(f"✅ PASS: CSS class '{css_class}' found")
    
    return all_found

def test_html_integration():
    """Test HTML integration"""
    print("\nTesting HTML integration...")
    
    html_path = "index.html"
    
    if not os.path.exists(html_path):
        print(f"❌ FAIL: {html_path} not found")
        return False
    
    with open(html_path, 'r') as f:
        content = f.read()
    
    # Check for html2canvas CDN
    if 'html2canvas' not in content:
        print("❌ FAIL: html2canvas CDN not included")
        return False
    else:
        print("✅ PASS: html2canvas CDN included")
    
    # Check for search suggestions module
    if 'search-suggestions.js' not in content:
        print("❌ FAIL: search-suggestions.js not included")
        return False
    else:
        print("✅ PASS: search-suggestions.js included")
    
    # Check for screenshot capture module
    if 'screenshot-capture.js' not in content:
        print("❌ FAIL: screenshot-capture.js not included")
        return False
    else:
        print("✅ PASS: screenshot-capture.js included")
    
    # Check for screenshot UI
    if 'screenshot-ui.js' not in content:
        print("❌ FAIL: screenshot-ui.js not included")
        return False
    else:
        print("✅ PASS: screenshot-ui.js included")
    
    # Check for screenshot CSS
    if 'screenshot.css' not in content:
        print("❌ FAIL: screenshot.css not included")
        return False
    else:
        print("✅ PASS: screenshot.css included")
    
    # Check for screenshot button
    if 'ScreenshotUI.openModal' not in content:
        print("❌ FAIL: Screenshot button not found")
        return False
    else:
        print("✅ PASS: Screenshot button found")
    
    return True

def test_package_json():
    """Test package.json for dependencies"""
    print("\nTesting package.json...")
    
    package_path = "package.json"
    
    if not os.path.exists(package_path):
        print(f"❌ FAIL: {package_path} not found")
        return False
    
    with open(package_path, 'r') as f:
        content = f.read()
    
    # Check for html2canvas dependency
    if 'html2canvas' not in content.lower():
        print("❌ FAIL: html2canvas not in package.json dependencies")
        return False
    else:
        print("✅ PASS: html2canvas in package.json dependencies")
    
    return True

def test_code_quality():
    """Test code quality metrics"""
    print("\nTesting code quality...")
    
    # Check search suggestions module
    module_path = "js/modules/search-suggestions.js"
    with open(module_path, 'r') as f:
        content = f.read()
    
    lines = len(content.split('\n'))
    print(f"✅ PASS: search-suggestions.js has {lines} lines")
    
    jsdoc_count = content.count('/**')
    print(f"✅ PASS: search-suggestions.js has {jsdoc_count} JSDoc comments")
    
    # Check screenshot capture module
    module_path = "js/modules/screenshot-capture.js"
    with open(module_path, 'r') as f:
        content = f.read()
    
    lines = len(content.split('\n'))
    print(f"✅ PASS: screenshot-capture.js has {lines} lines")
    
    jsdoc_count = content.count('/**')
    print(f"✅ PASS: screenshot-capture.js has {jsdoc_count} JSDoc comments")
    
    # Check screenshot UI
    ui_path = "js/ui/screenshot-ui.js"
    with open(ui_path, 'r') as f:
        content = f.read()
    
    lines = len(content.split('\n'))
    print(f"✅ PASS: screenshot-ui.js has {lines} lines")
    
    jsdoc_count = content.count('/**')
    print(f"✅ PASS: screenshot-ui.js has {jsdoc_count} JSDoc comments")
    
    return True

def main():
    """Run all tests"""
    print("=" * 60)
    print("ENHANCEMENTS TESTS (Search Suggestions + Screenshot)")
    print("=" * 60)
    
    tests = [
        ("Search Suggestions Module", test_search_suggestions_module),
        ("Screenshot Capture Module", test_screenshot_capture_module),
        ("Screenshot UI", test_screenshot_ui),
        ("Screenshot CSS", test_screenshot_css),
        ("HTML Integration", test_html_integration),
        ("Package.json", test_package_json),
        ("Code Quality", test_code_quality)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ ERROR in {test_name}: {e}")
            results.append((test_name, False))
    
    # Print summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print("\n" + "=" * 60)
    print(f"TOTAL: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    print("=" * 60)
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)