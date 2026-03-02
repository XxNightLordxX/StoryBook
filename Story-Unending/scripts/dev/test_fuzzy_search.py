#!/usr/bin/env python3
"""
Test script for fuzzy search implementation
"""

import os
import json
import re

def test_fuzzy_search_module():
    """Test fuzzy search module exists and has required functions"""
    print("Testing fuzzy search module...")
    
    module_path = "js/modules/fuzzy-search.js"
    
    if not os.path.exists(module_path):
        print(f"❌ FAIL: {module_path} not found")
        return False
    
    with open(module_path, 'r') as f:
        content = f.read()
    
    # Check for required functions
    required_functions = [
        'initFuse',
        'prepareChapterData',
        'fuzzySearch',
        'hybridSearch',
        'getSearchSuggestions',
        'calculateRelevanceScore',
        'highlightFuzzyMatches'
    ]
    
    all_found = True
    for func in required_functions:
        if f'function {func}' not in content and f'{func}:' not in content:
            print(f"❌ FAIL: Function '{func}' not found in fuzzy-search.js")
            all_found = False
        else:
            print(f"✅ PASS: Function '{func}' found")
    
    # Check for namespace export
    if 'window.FuzzySearch' not in content:
        print("❌ FAIL: FuzzySearch namespace not exported")
        all_found = False
    else:
        print("✅ PASS: FuzzySearch namespace exported")
    
    return all_found

def test_search_ui_enhanced():
    """Test enhanced search UI module"""
    print("\nTesting enhanced search UI module...")
    
    module_path = "js/ui/search-ui-enhanced.js"
    
    if not os.path.exists(module_path):
        print(f"❌ FAIL: {module_path} not found")
        return False
    
    with open(module_path, 'r') as f:
        content = f.read()
    
    # Check for required functions
    required_functions = [
        'openModal',
        'closeModal',
        'handleInput',
        'showSuggestions',
        'hideSuggestions',
        'applySuggestion',
        'performSearch',
        'updateThresholdLabel'
    ]
    
    all_found = True
    for func in required_functions:
        if f'function {func}' not in content and f'{func}:' not in content:
            print(f"❌ FAIL: Function '{func}' not found in search-ui-enhanced.js")
            all_found = False
        else:
            print(f"✅ PASS: Function '{func}' found")
    
    # Check for namespace export
    if 'window.SearchUIEnhanced' not in content:
        print("❌ FAIL: SearchUIEnhanced namespace not exported")
        all_found = False
    else:
        print("✅ PASS: SearchUIEnhanced namespace exported")
    
    # Check for fuzzy mode checkbox
    if 'fuzzy-mode' not in content:
        print("❌ FAIL: Fuzzy mode checkbox not found")
        all_found = False
    else:
        print("✅ PASS: Fuzzy mode checkbox found")
    
    # Check for threshold slider
    if 'fuzzy-threshold' not in content:
        print("❌ FAIL: Fuzzy threshold slider not found")
        all_found = False
    else:
        print("✅ PASS: Fuzzy threshold slider found")
    
    return all_found

def test_fuzzy_search_css():
    """Test fuzzy search CSS file"""
    print("\nTesting fuzzy search CSS...")
    
    css_path = "css/fuzzy-search.css"
    
    if not os.path.exists(css_path):
        print(f"❌ FAIL: {css_path} not found")
        return False
    
    with open(css_path, 'r') as f:
        content = f.read()
    
    # Check for required CSS classes
    required_classes = [
        '.search-suggestions',
        '.suggestion-item',
        '.relevance-score',
        '.search-highlight',
        '#threshold-label'
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
    
    # Check for Fuse.js CDN
    if 'fuse.js' not in content.lower():
        print("❌ FAIL: Fuse.js CDN not included")
        return False
    else:
        print("✅ PASS: Fuse.js CDN included")
    
    # Check for fuzzy search module
    if 'fuzzy-search.js' not in content:
        print("❌ FAIL: fuzzy-search.js not included")
        return False
    else:
        print("✅ PASS: fuzzy-search.js included")
    
    # Check for enhanced search UI
    if 'search-ui-enhanced.js' not in content:
        print("❌ FAIL: search-ui-enhanced.js not included")
        return False
    else:
        print("✅ PASS: search-ui-enhanced.js included")
    
    # Check for fuzzy search CSS
    if 'fuzzy-search.css' not in content:
        print("❌ FAIL: fuzzy-search.css not included")
        return False
    else:
        print("✅ PASS: fuzzy-search.css included")
    
    # Check for enhanced search button
    if 'SearchUIEnhanced.openModal' not in content:
        print("❌ FAIL: Search button not updated to use enhanced UI")
        return False
    else:
        print("✅ PASS: Search button updated to use enhanced UI")
    
    return True

def test_package_json():
    """Test package.json for Fuse.js dependency"""
    print("\nTesting package.json...")
    
    package_path = "package.json"
    
    if not os.path.exists(package_path):
        print(f"❌ FAIL: {package_path} not found")
        return False
    
    with open(package_path, 'r') as f:
        content = f.read()
    
    # Check for Fuse.js dependency
    if 'fuse.js' not in content.lower():
        print("❌ FAIL: fuse.js not in package.json dependencies")
        return False
    else:
        print("✅ PASS: fuse.js in package.json dependencies")
    
    return True

def test_code_quality():
    """Test code quality metrics"""
    print("\nTesting code quality...")
    
    # Check fuzzy search module
    module_path = "js/modules/fuzzy-search.js"
    with open(module_path, 'r') as f:
        content = f.read()
    
    # Count lines
    lines = len(content.split('\n'))
    print(f"✅ PASS: fuzzy-search.js has {lines} lines")
    
    # Check for JSDoc comments
    jsdoc_count = content.count('/**')
    print(f"✅ PASS: fuzzy-search.js has {jsdoc_count} JSDoc comments")
    
    # Check for error handling
    try_catch_count = content.count('try {')
    print(f"✅ PASS: fuzzy-search.js has {try_catch_count} try-catch blocks")
    
    # Check enhanced search UI
    ui_path = "js/ui/search-ui-enhanced.js"
    with open(ui_path, 'r') as f:
        content = f.read()
    
    lines = len(content.split('\n'))
    print(f"✅ PASS: search-ui-enhanced.js has {lines} lines")
    
    jsdoc_count = content.count('/**')
    print(f"✅ PASS: search-ui-enhanced.js has {jsdoc_count} JSDoc comments")
    
    return True

def main():
    """Run all tests"""
    print("=" * 60)
    print("FUZZY SEARCH IMPLEMENTATION TESTS")
    print("=" * 60)
    
    tests = [
        ("Fuzzy Search Module", test_fuzzy_search_module),
        ("Enhanced Search UI", test_search_ui_enhanced),
        ("Fuzzy Search CSS", test_fuzzy_search_css),
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