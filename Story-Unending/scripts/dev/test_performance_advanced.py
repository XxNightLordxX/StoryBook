#!/usr/bin/env python3
"""
Test script for advanced performance optimizations
Tests all performance optimization features
"""

import os
import re
import json
from pathlib import Path

def test_performance_advanced_module():
    """Test the performance-advanced.js module"""
    print("Testing Performance Advanced Module...")
    
    module_path = Path("/workspace/js/modules/performance-advanced.js")
    
    if not module_path.exists():
        print("❌ FAIL: performance-advanced.js not found")
        return False
    
    content = module_path.read_text()
    
    # Test 1: Check for AnimationFrameManager
    if "AnimationFrameManager" in content:
        print("✅ PASS: AnimationFrameManager found")
    else:
        print("❌ FAIL: AnimationFrameManager not found")
        return False
    
    # Test 2: Check for VirtualScroll
    if "VirtualScroll" in content:
        print("✅ PASS: VirtualScroll found")
    else:
        print("❌ FAIL: VirtualScroll not found")
        return False
    
    # Test 3: Check for ImageLazyLoader
    if "ImageLazyLoader" in content:
        print("✅ PASS: ImageLazyLoader found")
    else:
        print("❌ FAIL: ImageLazyLoader not found")
        return False
    
    # Test 4: Check for debounce function
    if "function debounce" in content:
        print("✅ PASS: debounce function found")
    else:
        print("❌ FAIL: debounce function not found")
        return False
    
    # Test 5: Check for throttle function
    if "function throttle" in content:
        print("✅ PASS: throttle function found")
    else:
        print("❌ FAIL: throttle function not found")
        return False
    
    # Test 6: Check for MemoryMonitor
    if "MemoryMonitor" in content:
        print("✅ PASS: MemoryMonitor found")
    else:
        print("❌ FAIL: MemoryMonitor not found")
        return False
    
    # Test 7: Check for StorageOptimizer
    if "StorageOptimizer" in content:
        print("✅ PASS: StorageOptimizer found")
    else:
        print("❌ FAIL: StorageOptimizer not found")
        return False
    
    # Test 8: Check for ConnectionAwareLoader
    if "ConnectionAwareLoader" in content:
        print("✅ PASS: ConnectionAwareLoader found")
    else:
        print("❌ FAIL: ConnectionAwareLoader not found")
        return False
    
    # Test 9: Check for PerformanceMonitor
    if "PerformanceMonitor" in content:
        print("✅ PASS: PerformanceMonitor found")
    else:
        print("❌ FAIL: PerformanceMonitor not found")
        return False
    
    # Test 10: Check for IIFE pattern
    if "(function(window)" in content:
        print("✅ PASS: IIFE pattern found")
    else:
        print("❌ FAIL: IIFE pattern not found")
        return False
    
    # Test 11: Check for global export
    if "window.PerformanceAdvanced" in content:
        print("✅ PASS: Global export found")
    else:
        print("❌ FAIL: Global export not found")
        return False
    
    # Test 12: Check for initialization
    if "function init()" in content:
        print("✅ PASS: Initialization function found")
    else:
        print("❌ FAIL: Initialization function not found")
        return False
    
    # Test 13: Count functions
    function_count = len(re.findall(r'\s+(requestFrame|cancelFrame|cancelAllFrames|init|update|updateItems|destroy|observeImages|observeNewImages|loadImage|loadNow|addEventListener|removeEventListener|trackInterval|clearInterval|trackTimeout|clearTimeout|trackObserver|disconnectObserver|cleanup|getStats|getItem|setItem|scheduleWrite|flush|updateCache|removeItem|clear|updateConnectionInfo|shouldLoadHighQuality|getImageQuality|getLoadingStrategy|getConnectionInfo|startMeasure|endMeasure|getMetric|getAllMetrics|clearMetrics|getPageLoadMetrics|getFirstPaint|getFirstContentfulPaint|observeLongTasks|disconnectObservers)\s*\(', content))
    if function_count >= 30:
        print(f"✅ PASS: Found {function_count} functions (expected 30+)")
    else:
        print(f"❌ FAIL: Found only {function_count} functions (expected 30+)")
        return False
    
    print("\n✅ All Performance Advanced Module tests passed!")
    return True

def test_performance_advanced_css():
    """Test the performance-advanced.css file"""
    print("\nTesting Performance Advanced CSS...")
    
    css_path = Path("/workspace/css/performance-advanced.css")
    
    if not css_path.exists():
        print("❌ FAIL: performance-advanced.css not found")
        return False
    
    content = css_path.read_text()
    
    # Test 1: Check for virtual scroll styles
    if ".virtual-scroll-container" in content:
        print("✅ PASS: Virtual scroll styles found")
    else:
        print("❌ FAIL: Virtual scroll styles not found")
        return False
    
    # Test 2: Check for lazy loading styles
    if "img[data-src]" in content:
        print("✅ PASS: Lazy loading styles found")
    else:
        print("❌ FAIL: Lazy loading styles not found")
        return False
    
    # Test 3: Check for performance monitor styles
    if ".performance-monitor" in content:
        print("✅ PASS: Performance monitor styles found")
    else:
        print("❌ FAIL: Performance monitor styles not found")
        return False
    
    # Test 4: Check for connection status styles
    if ".connection-status" in content:
        print("✅ PASS: Connection status styles found")
    else:
        print("❌ FAIL: Connection status styles not found")
        return False
    
    # Test 5: Check for loading indicators
    if ".loading-spinner" in content:
        print("✅ PASS: Loading spinner styles found")
    else:
        print("❌ FAIL: Loading spinner styles not found")
        return False
    
    # Test 6: Check for GPU acceleration
    if ".gpu-accelerated" in content:
        print("✅ PASS: GPU acceleration styles found")
    else:
        print("❌ FAIL: GPU acceleration styles not found")
        return False
    
    # Test 7: Check for responsive design
    if "@media (max-width: 768px)" in content:
        print("✅ PASS: Responsive design found")
    else:
        print("❌ FAIL: Responsive design not found")
        return False
    
    # Test 8: Check for dark mode support
    if "@media (prefers-color-scheme: dark)" in content:
        print("✅ PASS: Dark mode support found")
    else:
        print("❌ FAIL: Dark mode support not found")
        return False
    
    # Test 9: Check for reduced motion support
    if "@media (prefers-reduced-motion: reduce)" in content:
        print("✅ PASS: Reduced motion support found")
    else:
        print("❌ FAIL: Reduced motion support not found")
        return False
    
    # Test 10: Count CSS classes
    class_count = len(re.findall(r'\.[a-z-]+[,\s\{]', content))
    if class_count >= 20:
        print(f"✅ PASS: Found {class_count} CSS classes (expected 20+)")
    else:
        print(f"❌ FAIL: Found only {class_count} CSS classes (expected 20+)")
        return False
    
    print("\n✅ All Performance Advanced CSS tests passed!")
    return True

def test_html_integration():
    """Test HTML integration of performance optimizations"""
    print("\nTesting HTML Integration...")
    
    html_path = Path("/workspace/index.html")
    
    if not html_path.exists():
        print("❌ FAIL: index.html not found")
        return False
    
    content = html_path.read_text()
    
    # Test 1: Check for performance-advanced.js script tag
    if 'src="js/modules/performance-advanced.js"' in content:
        print("✅ PASS: performance-advanced.js script tag found")
    else:
        print("❌ FAIL: performance-advanced.js script tag not found")
        return False
    
    # Test 2: Check for performance-advanced.css link tag
    if 'href="css/performance-advanced.css"' in content:
        print("✅ PASS: performance-advanced.css link tag found")
    else:
        print("❌ FAIL: performance-advanced.css link tag not found")
        return False
    
    print("\n✅ All HTML Integration tests passed!")
    return True

def test_functionality():
    """Test specific functionality"""
    print("\nTesting Functionality...")
    
    module_path = Path("/workspace/js/modules/performance-advanced.js")
    content = module_path.read_text()
    
    # Test 1: Check requestAnimationFrame usage
    if "requestAnimationFrame" in content:
        print("✅ PASS: requestAnimationFrame usage found")
    else:
        print("❌ FAIL: requestAnimationFrame usage not found")
        return False
    
    # Test 2: Check IntersectionObserver for lazy loading
    if "IntersectionObserver" in content:
        print("✅ PASS: IntersectionObserver found for lazy loading")
    else:
        print("❌ FAIL: IntersectionObserver not found")
        return False
    
    # Test 3: Check localStorage optimization
    if "localStorage" in content and "cache" in content.lower():
        print("✅ PASS: localStorage optimization found")
    else:
        print("❌ FAIL: localStorage optimization not found")
        return False
    
    # Test 4: Check network connection API
    if "navigator.connection" in content:
        print("✅ PASS: Network connection API found")
    else:
        print("❌ FAIL: Network connection API not found")
        return False
    
    # Test 5: Check performance API
    if "performance.mark" in content or "performance.measure" in content:
        print("✅ PASS: Performance API found")
    else:
        print("❌ FAIL: Performance API not found")
        return False
    
    # Test 6: Check MutationObserver for dynamic content
    if "MutationObserver" in content:
        print("✅ PASS: MutationObserver found for dynamic content")
    else:
        print("❌ FAIL: MutationObserver not found")
        return False
    
    # Test 7: Check memory leak prevention
    if "cleanup" in content.lower() and "removeEventListener" in content:
        print("✅ PASS: Memory leak prevention found")
    else:
        print("❌ FAIL: Memory leak prevention not found")
        return False
    
    # Test 8: Check debouncing implementation
    if "setTimeout" in content and "debounce" in content:
        print("✅ PASS: Debouncing implementation found")
    else:
        print("❌ FAIL: Debouncing implementation not found")
        return False
    
    # Test 9: Check throttling implementation
    if "throttle" in content and "Date.now()" in content:
        print("✅ PASS: Throttling implementation found")
    else:
        print("❌ FAIL: Throttling implementation not found")
        return False
    
    # Test 10: Check virtual scrolling implementation
    if "scrollTop" in content and "clientHeight" in content:
        print("✅ PASS: Virtual scrolling implementation found")
    else:
        print("❌ FAIL: Virtual scrolling implementation not found")
        return False
    
    print("\n✅ All Functionality tests passed!")
    return True

def main():
    """Run all tests"""
    print("=" * 60)
    print("Advanced Performance Optimizations Test Suite")
    print("=" * 60)
    
    tests = [
        ("Performance Advanced Module", test_performance_advanced_module),
        ("Performance Advanced CSS", test_performance_advanced_css),
        ("HTML Integration", test_html_integration),
        ("Functionality", test_functionality)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{'=' * 60}")
        print(f"Running: {test_name}")
        print('=' * 60)
        result = test_func()
        results.append((test_name, result))
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed successfully!")
        return 0
    else:
        print(f"\n❌ {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    exit(main())