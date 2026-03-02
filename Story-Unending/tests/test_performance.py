#!/usr/bin/env python3
"""
Test script for Performance Optimization System
"""

import requests
import json
import time

def test_performance_system():
    """Test the performance system functionality"""
    
    print("🧪 Testing Performance Optimization System")
    print("=" * 50)
    
    # Wait for server to start
    time.sleep(2)
    
    try:
        # Test 1: Check if index.html loads
        print("\n✅ Test 1: Checking if index.html loads...")
        response = requests.get('http://localhost:9003/index.html')
        assert response.status_code == 200, "Failed to load index.html"
        print("   ✓ index.html loaded successfully")
        
        # Test 2: Check if performance.js is included
        print("\n✅ Test 2: Checking if performance.js is included...")
        assert 'js/modules/performance.js' in response.text, "performance.js not found in HTML"
        print("   ✓ performance.js is included in HTML")
        
        # Test 3: Check if performance-ui.js is included
        print("\n✅ Test 3: Checking if performance-ui.js is included...")
        assert 'js/ui/performance-ui.js' in response.text, "performance-ui.js not found in HTML"
        print("   ✓ performance-ui.js is included in HTML")
        
        # Test 4: Check if performance.css is included
        print("\n✅ Test 4: Checking if performance.css is included...")
        assert 'css/performance.css' in response.text, "performance.css not found in HTML"
        print("   ✓ performance.css is included in HTML")
        
        # Load JavaScript files for further tests
        print("\n✅ Test 5: Loading JavaScript files...")
        response_js = requests.get('http://localhost:9003/js/modules/performance.js')
        assert response_js.status_code == 200, "Failed to load performance.js"
        print("   ✓ performance.js loaded successfully")
        
        response_ui = requests.get('http://localhost:9003/js/ui/performance-ui.js')
        assert response_ui.status_code == 200, "Failed to load performance-ui.js"
        print("   ✓ performance-ui.js loaded successfully")
        
        # Test 6: Check if Performance namespace is exported
        print("\n✅ Test 6: Checking if Performance namespace is exported...")
        assert 'window.Performance = Performance' in response_js.text, "Performance namespace not exported"
        print("   ✓ Performance namespace is exported")
        
        # Test 7: Check if PerformanceUI namespace is exported
        print("\n✅ Test 7: Checking if PerformanceUI namespace is exported...")
        assert 'window.PerformanceUI = PerformanceUI' in response_ui.text, "PerformanceUI namespace not exported"
        print("   ✓ PerformanceUI namespace is exported")
        
        # Test 8: Check for key functions in performance.js
        print("\n✅ Test 8: Checking for key functions in performance.js...")
        functions = ['setCache', 'getCache', 'lazyLoadElement', 'debounce', 'throttle']
        for func in functions:
            assert func in response_js.text, f"Function {func} not found in performance.js"
            print(f"   ✓ Function {func} found")
        
        # Test 9: Check for key functions in performance-ui.js
        print("\n✅ Test 9: Checking for key functions in performance-ui.js...")
        ui_functions = ['openModal', 'closeModal', 'renderPageMetrics', 'renderCacheMetrics']
        for func in ui_functions:
            assert func in response_ui.text, f"Function {func} not found in performance-ui.js"
            print(f"   ✓ Function {func} found")
        
        # Test 10: Check CSS styles
        print("\n✅ Test 10: Checking CSS styles...")
        response_css = requests.get('http://localhost:9003/css/performance.css')
        assert response_css.status_code == 200, "Failed to load performance.css"
        
        css_classes = ['.performance-content', '.metrics-grid', '.metric-card', '.loading-indicator']
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
    success = test_performance_system()
    exit(0 if success else 1)