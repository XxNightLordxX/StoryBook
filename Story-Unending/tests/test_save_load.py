#!/usr/bin/env python3
"""
Test script for Save/Load System
"""

import requests
import json
import time

def test_save_load_system():
    """Test the save/load system functionality"""
    
    print("🧪 Testing Save/Load System")
    print("=" * 50)
    
    # Wait for server to start
    time.sleep(2)
    
    try:
        # Test 1: Check if index.html loads
        print("\n✅ Test 1: Checking if index.html loads...")
        response = requests.get('http://localhost:9003/index.html')
        assert response.status_code == 200, "Failed to load index.html"
        print("   ✓ index.html loaded successfully")
        
        # Test 2: Check if save-load.js is included
        print("\n✅ Test 2: Checking if save-load.js is included...")
        assert 'js/modules/save-load.js' in response.text, "save-load.js not found in HTML"
        print("   ✓ save-load.js is included in HTML")
        
        # Test 3: Check if save-load-ui.js is included
        print("\n✅ Test 3: Checking if save-load-ui.js is included...")
        assert 'js/ui/save-load-ui.js' in response.text, "save-load-ui.js not found in HTML"
        print("   ✓ save-load-ui.js is included in HTML")
        
        # Test 4: Check if save-load.css is included
        print("\n✅ Test 4: Checking if save-load.css is included...")
        assert 'css/save-load.css' in response.text, "save-load.css not found in HTML"
        print("   ✓ save-load.css is included in HTML")
        
        # Test 5: Check if Save/Load button is in dropdown
        print("\n✅ Test 5: Checking if Save/Load button is in dropdown...")
        assert 'SaveLoadUI.openModal()' in response.text, "Save/Load button not found"
        print("   ✓ Save/Load button is present in dropdown")
        
        # Load JavaScript files for further tests
        print("\n✅ Test 6: Loading JavaScript files...")
        response_js = requests.get('http://localhost:9003/js/modules/save-load.js')
        assert response_js.status_code == 200, "Failed to load save-load.js"
        print("   ✓ save-load.js loaded successfully")
        
        response_ui = requests.get('http://localhost:9003/js/ui/save-load-ui.js')
        assert response_ui.status_code == 200, "Failed to load save-load-ui.js"
        print("   ✓ save-load-ui.js loaded successfully")
        
        # Test 7: Check if SaveLoad namespace is exported
        print("\n✅ Test 7: Checking if SaveLoad namespace is exported...")
        assert 'window.SaveLoad = SaveLoad' in response_js.text, "SaveLoad namespace not exported"
        print("   ✓ SaveLoad namespace is exported")
        
        # Test 8: Check if SaveLoadUI namespace is exported
        print("\n✅ Test 8: Checking if SaveLoadUI namespace is exported...")
        assert 'window.SaveLoadUI = SaveLoadUI' in response_ui.text, "SaveLoadUI namespace not exported"
        print("   ✓ SaveLoadUI namespace is exported")
        
        # Test 9: Check for key functions in save-load.js
        print("\n✅ Test 9: Checking for key functions in save-load.js...")
        functions = ['getSaveSlots', 'createSaveSlot', 'loadSaveSlot', 'deleteSaveSlot']
        for func in functions:
            assert func in response_js.text, f"Function {func} not found in save-load.js"
            print(f"   ✓ Function {func} found")
        
        # Test 10: Check for key functions in save-load-ui.js
        print("\n✅ Test 10: Checking for key functions in save-load-ui.js...")
        ui_functions = ['openModal', 'closeModal', 'saveToSlot', 'loadFromSlot']
        for func in ui_functions:
            assert func in response_ui.text, f"Function {func} not found in save-load-ui.js"
            print(f"   ✓ Function {func} found")
        
        # Test 11: Check CSS styles
        print("\n✅ Test 11: Checking CSS styles...")
        response_css = requests.get('http://localhost:9003/css/save-load.css')
        assert response_css.status_code == 200, "Failed to load save-load.css"
        
        css_classes = ['.save-load-content', '.save-slots-grid', '.save-slot', '.tab-btn']
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
    success = test_save_load_system()
    exit(0 if success else 1)