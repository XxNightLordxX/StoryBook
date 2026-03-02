#!/usr/bin/env python3
"""
Test script for Search System
"""

import requests
import json
import time

def test_search_system():
    """Test the search system functionality"""
    
    print("🧪 Testing Search System")
    print("=" * 50)
    
    # Wait for server to start
    time.sleep(2)
    
    try:
        # Test 1: Check if index.html loads
        print("\n✅ Test 1: Checking if index.html loads...")
        response = requests.get('http://localhost:9003/index.html')
        assert response.status_code == 200, "Failed to load index.html"
        print("   ✓ index.html loaded successfully")
        
        # Test 2: Check if search.js is included
        print("\n✅ Test 2: Checking if search.js is included...")
        assert 'js/modules/search.js' in response.text, "search.js not found in HTML"
        print("   ✓ search.js is included in HTML")
        
        # Test 3: Check if search-ui.js is included
        print("\n✅ Test 3: Checking if search-ui.js is included...")
        assert 'js/ui/search-ui.js' in response.text, "search-ui.js not found in HTML"
        print("   ✓ search-ui.js is included in HTML")
        
        # Test 4: Check if search.css is included
        print("\n✅ Test 4: Checking if search.css is included...")
        assert 'css/search.css' in response.text, "search.css not found in HTML"
        print("   ✓ search.css is included in HTML")
        
        # Test 5: Check if Search button is in dropdown
        print("\n✅ Test 5: Checking if Search button is in dropdown...")
        assert 'SearchUI.openModal()' in response.text, "Search button not found"
        print("   ✓ Search button is present in dropdown")
        
        # Load JavaScript files for further tests
        print("\n✅ Test 6: Loading JavaScript files...")
        response_js = requests.get('http://localhost:9003/js/modules/search.js')
        assert response_js.status_code == 200, "Failed to load search.js"
        print("   ✓ search.js loaded successfully")
        
        response_ui = requests.get('http://localhost:9003/js/ui/search-ui.js')
        assert response_ui.status_code == 200, "Failed to load search-ui.js"
        print("   ✓ search-ui.js loaded successfully")
        
        # Test 7: Check if Search namespace is exported
        print("\n✅ Test 7: Checking if Search namespace is exported...")
        assert 'window.Search = Search' in response_js.text, "Search namespace not exported"
        print("   ✓ Search namespace is exported")
        
        # Test 8: Check if SearchUI namespace is exported
        print("\n✅ Test 8: Checking if SearchUI namespace is exported...")
        assert 'window.SearchUI = SearchUI' in response_ui.text, "SearchUI namespace not exported"
        print("   ✓ SearchUI namespace is exported")
        
        # Test 9: Check for key functions in search.js
        print("\n✅ Test 9: Checking for key functions in search.js...")
        functions = ['searchChapter', 'searchAllChapters', 'highlightMatches', 'advancedSearch']
        for func in functions:
            assert func in response_js.text, f"Function {func} not found in search.js"
            print(f"   ✓ Function {func} found")
        
        # Test 10: Check for key functions in search-ui.js
        print("\n✅ Test 10: Checking for key functions in search-ui.js...")
        ui_functions = ['openModal', 'closeModal', 'performSearch', 'displaySearchResults']
        for func in ui_functions:
            assert func in response_ui.text, f"Function {func} not found in search-ui.js"
            print(f"   ✓ Function {func} found")
        
        # Test 11: Check CSS styles
        print("\n✅ Test 11: Checking CSS styles...")
        response_css = requests.get('http://localhost:9003/css/search.css')
        assert response_css.status_code == 200, "Failed to load search.css"
        
        css_classes = ['.search-content', '.search-input-wrapper', '.search-result-item', '.search-highlight']
        for css_class in css_classes:
            assert css_class in response_css.text, f"CSS class {css_class} not found"
            print(f"   ✓ CSS class {css_class} found")
        
        print("\n" + "=" * 50)
        print("✅ All tests passed!")
        print("=" * 50)
        
        return True
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        return False

if __name__ == '__main__':
    success = test_search_system()
    exit(0 if success else 1)