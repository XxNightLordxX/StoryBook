#!/usr/bin/env python3
"""
Test script for Reading History System
"""

import requests
import json
import time

def test_reading_history_system():
    """Test the reading history system functionality"""
    
    print("🧪 Testing Reading History System")
    print("=" * 50)
    
    # Wait for server to start
    time.sleep(2)
    
    try:
        # Test 1: Check if index.html loads
        print("\n✅ Test 1: Checking if index.html loads...")
        response = requests.get('http://localhost:9003/index.html')
        assert response.status_code == 200, "Failed to load index.html"
        print("   ✓ index.html loaded successfully")
        
        # Test 2: Check if reading-history.js is included
        print("\n✅ Test 2: Checking if reading-history.js is included...")
        assert 'js/modules/reading-history.js' in response.text, "reading-history.js not found in HTML"
        print("   ✓ reading-history.js is included in HTML")
        
        # Test 3: Check if reading-history-ui.js is included
        print("\n✅ Test 3: Checking if reading-history-ui.js is included...")
        assert 'js/ui/reading-history-ui.js' in response.text, "reading-history-ui.js not found in HTML"
        print("   ✓ reading-history-ui.js is included in HTML")
        
        # Test 4: Check if reading-history.css is included
        print("\n✅ Test 4: Checking if reading-history.css is included...")
        assert 'css/reading-history.css' in response.text, "reading-history.css not found in HTML"
        print("   ✓ reading-history.css is included in HTML")
        
        # Test 5: Check if Reading History button is in dropdown
        print("\n✅ Test 5: Checking if Reading History button is in dropdown...")
        assert 'ReadingHistoryUI.openModal()' in response.text, "Reading History button not found"
        print("   ✓ Reading History button is present in dropdown")
        
        # Load JavaScript files for further tests
        print("\n✅ Test 6: Loading JavaScript files...")
        response_js = requests.get('http://localhost:9003/js/modules/reading-history.js')
        assert response_js.status_code == 200, "Failed to load reading-history.js"
        print("   ✓ reading-history.js loaded successfully")
        
        response_ui = requests.get('http://localhost:9003/js/ui/reading-history-ui.js')
        assert response_ui.status_code == 200, "Failed to load reading-history-ui.js"
        print("   ✓ reading-history-ui.js loaded successfully")
        
        # Test 7: Check if ReadingHistory namespace is exported
        print("\n✅ Test 7: Checking if ReadingHistory namespace is exported...")
        assert 'window.ReadingHistory = ReadingHistory' in response_js.text, "ReadingHistory namespace not exported"
        print("   ✓ ReadingHistory namespace is exported")
        
        # Test 8: Check if ReadingHistoryUI namespace is exported
        print("\n✅ Test 8: Checking if ReadingHistoryUI namespace is exported...")
        assert 'window.ReadingHistoryUI = ReadingHistoryUI' in response_ui.text, "ReadingHistoryUI namespace not exported"
        print("   ✓ ReadingHistoryUI namespace is exported")
        
        # Test 9: Check for key functions in reading-history.js
        print("\n✅ Test 9: Checking for key functions in reading-history.js...")
        functions = ['startReadingSession', 'endReadingSession', 'getReadingHistory', 'getReadingStatistics']
        for func in functions:
            assert func in response_js.text, f"Function {func} not found in reading-history.js"
            print(f"   ✓ Function {func} found")
        
        # Test 10: Check for key functions in reading-history-ui.js
        print("\n✅ Test 10: Checking for key functions in reading-history-ui.js...")
        ui_functions = ['openModal', 'closeModal', 'renderStatistics', 'renderReadingHistory']
        for func in ui_functions:
            assert func in response_ui.text, f"Function {func} not found in reading-history-ui.js"
            print(f"   ✓ Function {func} found")
        
        # Test 11: Check CSS styles
        print("\n✅ Test 11: Checking CSS styles...")
        response_css = requests.get('http://localhost:9003/css/reading-history.css')
        assert response_css.status_code == 200, "Failed to load reading-history.css"
        
        css_classes = ['.reading-history-content', '.stats-grid', '.stat-card', '.history-item']
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
    success = test_reading_history_system()
    exit(0 if success else 1)