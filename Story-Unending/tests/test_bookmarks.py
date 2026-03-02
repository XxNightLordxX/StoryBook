#!/usr/bin/env python3
"""
Test script for Bookmarks System
"""

import requests
import json
import time

def test_bookmarks_system():
    """Test the bookmarks system functionality"""
    
    print("🧪 Testing Bookmarks System")
    print("=" * 50)
    
    # Wait for server to start
    time.sleep(2)
    
    try:
        # Test 1: Check if index.html loads
        print("\n✅ Test 1: Checking if index.html loads...")
        response = requests.get('http://localhost:9003/index.html')
        assert response.status_code == 200, "Failed to load index.html"
        print("   ✓ index.html loaded successfully")
        
        # Test 2: Check if bookmarks.js is included
        print("\n✅ Test 2: Checking if bookmarks.js is included...")
        assert 'js/modules/bookmarks.js' in response.text, "bookmarks.js not found in HTML"
        print("   ✓ bookmarks.js is included in HTML")
        
        # Test 3: Check if bookmarks-ui.js is included
        print("\n✅ Test 3: Checking if bookmarks-ui.js is included...")
        assert 'js/ui/bookmarks-ui.js' in response.text, "bookmarks-ui.js not found in HTML"
        print("   ✓ bookmarks-ui.js is included in HTML")
        
        # Test 4: Check if bookmarks.css is included
        print("\n✅ Test 4: Checking if bookmarks.css is included...")
        assert 'css/bookmarks.css' in response.text, "bookmarks.css not found in HTML"
        print("   ✓ bookmarks.css is included in HTML")
        
        # Test 5: Check if Bookmarks button is in dropdown
        print("\n✅ Test 5: Checking if Bookmarks button is in dropdown...")
        assert 'BookmarksUI.openModal()' in response.text, "Bookmarks button not found"
        print("   ✓ Bookmarks button is present in dropdown")
        
        # Load JavaScript files for further tests
        print("\n✅ Test 6: Loading JavaScript files...")
        response_js = requests.get('http://localhost:9003/js/modules/bookmarks.js')
        assert response_js.status_code == 200, "Failed to load bookmarks.js"
        print("   ✓ bookmarks.js loaded successfully")
        
        response_ui = requests.get('http://localhost:9003/js/ui/bookmarks-ui.js')
        assert response_ui.status_code == 200, "Failed to load bookmarks-ui.js"
        print("   ✓ bookmarks-ui.js loaded successfully")
        
        # Test 7: Check if Bookmarks namespace is exported
        print("\n✅ Test 7: Checking if Bookmarks namespace is exported...")
        assert 'window.Bookmarks = Bookmarks' in response_js.text, "Bookmarks namespace not exported"
        print("   ✓ Bookmarks namespace is exported")
        
        # Test 8: Check if BookmarksUI namespace is exported
        print("\n✅ Test 8: Checking if BookmarksUI namespace is exported...")
        assert 'window.BookmarksUI = BookmarksUI' in response_ui.text, "BookmarksUI namespace not exported"
        print("   ✓ BookmarksUI namespace is exported")
        
        # Test 9: Check for key functions in bookmarks.js
        print("\n✅ Test 9: Checking for key functions in bookmarks.js...")
        functions = ['getBookmarks', 'createBookmark', 'deleteBookmark', 'isChapterBookmarked']
        for func in functions:
            assert func in response_js.text, f"Function {func} not found in bookmarks.js"
            print(f"   ✓ Function {func} found")
        
        # Test 10: Check for key functions in bookmarks-ui.js
        print("\n✅ Test 10: Checking for key functions in bookmarks-ui.js...")
        ui_functions = ['openModal', 'closeModal', 'toggleBookmark', 'editNote']
        for func in ui_functions:
            assert func in response_ui.text, f"Function {func} not found in bookmarks-ui.js"
            print(f"   ✓ Function {func} found")
        
        # Test 11: Check CSS styles
        print("\n✅ Test 11: Checking CSS styles...")
        response_css = requests.get('http://localhost:9003/css/bookmarks.css')
        assert response_css.status_code == 200, "Failed to load bookmarks.css"
        
        css_classes = ['.bookmarks-content', '.bookmarks-list', '.bookmark-item', '.bookmark-btn']
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
    success = test_bookmarks_system()
    exit(0 if success else 1)