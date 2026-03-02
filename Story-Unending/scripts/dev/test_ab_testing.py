#!/usr/bin/env python3
"""
Test script for A/B Testing Framework
Tests all A/B testing functionality
"""

import os
import re
from pathlib import Path

def test_ab_testing_module():
    """Test the ab-testing.js module"""
    print("Testing A/B Testing Module...")
    
    module_path = Path("/workspace/js/modules/ab-testing.js")
    
    if not module_path.exists():
        print("❌ FAIL: ab-testing.js not found")
        return False
    
    content = module_path.read_text()
    
    # Test 1: Check for user management functions
    if "getUserId" in content and "generateUserId" in content:
        print("✅ PASS: User management functions found")
    else:
        print("❌ FAIL: User management functions not found")
        return False
    
    # Test 2: Check for experiment management functions
    if "createExperiment" in content and "getExperiment" in content:
        print("✅ PASS: Experiment management functions found")
    else:
        print("❌ FAIL: Experiment management functions not found")
        return False
    
    # Test 3: Check for variant assignment functions
    if "assignVariant" in content and "getVariant" in content:
        print("✅ PASS: Variant assignment functions found")
    else:
        print("❌ FAIL: Variant assignment functions not found")
        return False
    
    # Test 4: Check for event tracking functions
    if "trackEvent" in content and "trackConversion" in content:
        print("✅ PASS: Event tracking functions found")
    else:
        print("❌ FAIL: Event tracking functions not found")
        return False
    
    # Test 5: Check for analytics functions
    if "getResults" in content and "calculateSignificance" in content:
        print("✅ PASS: Analytics functions found")
    else:
        print("❌ FAIL: Analytics functions not found")
        return False
    
    # Test 6: Check for statistical functions
    if "normalCDF" in content and "isSignificant" in content:
        print("✅ PASS: Statistical functions found")
    else:
        print("❌ FAIL: Statistical functions not found")
        return False
    
    # Test 7: Check for lifecycle management
    if "activateExperiment" in content and "pauseExperiment" in content:
        print("✅ PASS: Lifecycle management functions found")
    else:
        print("❌ FAIL: Lifecycle management functions not found")
        return False
    
    # Test 8: Check for IIFE pattern
    if "(function(window)" in content:
        print("✅ PASS: IIFE pattern found")
    else:
        print("❌ FAIL: IIFE pattern not found")
        return False
    
    # Test 9: Check for global export
    if "window.ABTesting" in content:
        print("✅ PASS: Global export found")
    else:
        print("❌ FAIL: Global export not found")
        return False
    
    # Test 10: Count functions
    function_count = len(re.findall(r'\s+(function\s+\w+|const\s+\w+\s*=\s*function)', content))
    if function_count >= 20:
        print(f"✅ PASS: Found {function_count} functions (expected 20+)")
    else:
        print(f"❌ FAIL: Found only {function_count} functions (expected 20+)")
        return False
    
    print("\n✅ All A/B Testing Module tests passed!")
    return True

def test_ab_testing_ui():
    """Test the ab-testing-ui.js module"""
    print("\nTesting A/B Testing UI...")
    
    ui_path = Path("/workspace/js/ui/ab-testing-ui.js")
    
    if not ui_path.exists():
        print("❌ FAIL: ab-testing-ui.js not found")
        return False
    
    content = ui_path.read_text()
    
    # Test 1: Check for modal functions
    if "openModal" in content and "closeModal" in content:
        print("✅ PASS: Modal functions found")
    else:
        print("❌ FAIL: Modal functions not found")
        return False
    
    # Test 2: Check for tab management
    if "switchTab" in content:
        print("✅ PASS: Tab management found")
    else:
        print("❌ FAIL: Tab management not found")
        return False
    
    # Test 3: Check for experiment UI functions
    if "loadExperiments" in content and "createExperiment" in content:
        print("✅ PASS: Experiment UI functions found")
    else:
        print("❌ FAIL: Experiment UI functions not found")
        return False
    
    # Test 4: Check for results UI functions
    if "loadResults" in content and "viewResults" in content:
        print("✅ PASS: Results UI functions found")
    else:
        print("❌ FAIL: Results UI functions not found")
        return False
    
    # Test 5: Check for statistics UI
    if "loadStatistics" in content:
        print("✅ PASS: Statistics UI found")
    else:
        print("❌ FAIL: Statistics UI not found")
        return False
    
    # Test 6: Check for variant management
    if "addVariant" in content and "removeVariant" in content:
        print("✅ PASS: Variant management found")
    else:
        print("❌ FAIL: Variant management not found")
        return False
    
    # Test 7: Check for IIFE pattern
    if "(function(window)" in content:
        print("✅ PASS: IIFE pattern found")
    else:
        print("❌ FAIL: IIFE pattern not found")
        return False
    
    # Test 8: Check for global export
    if "window.ABTestingUI" in content:
        print("✅ PASS: Global export found")
    else:
        print("❌ FAIL: Global export not found")
        return False
    
    # Test 9: Count functions
    function_count = len(re.findall(r'\s+(function\s+\w+|const\s+\w+\s*=\s*function)', content))
    if function_count >= 15:
        print(f"✅ PASS: Found {function_count} functions (expected 15+)")
    else:
        print(f"❌ FAIL: Found only {function_count} functions (expected 15+)")
        return False
    
    print("\n✅ All A/B Testing UI tests passed!")
    return True

def test_ab_testing_css():
    """Test the ab-testing.css file"""
    print("\nTesting A/B Testing CSS...")
    
    css_path = Path("/workspace/css/ab-testing.css")
    
    if not css_path.exists():
        print("❌ FAIL: ab-testing.css not found")
        return False
    
    content = css_path.read_text()
    
    # Test 1: Check for modal styles
    if ".ab-testing-modal" in content:
        print("✅ PASS: Modal styles found")
    else:
        print("❌ FAIL: Modal styles not found")
        return False
    
    # Test 2: Check for tab styles
    if ".ab-testing-tab" in content:
        print("✅ PASS: Tab styles found")
    else:
        print("❌ FAIL: Tab styles not found")
        return False
    
    # Test 3: Check for button styles
    if ".ab-testing-btn" in content:
        print("✅ PASS: Button styles found")
    else:
        print("❌ FAIL: Button styles not found")
        return False
    
    # Test 4: Check for form styles
    if ".ab-testing-form-group" in content:
        print("✅ PASS: Form styles found")
    else:
        print("❌ FAIL: Form styles not found")
        return False
    
    # Test 5: Check for experiment card styles
    if ".ab-testing-experiment-card" in content:
        print("✅ PASS: Experiment card styles found")
    else:
        print("❌ FAIL: Experiment card styles not found")
        return False
    
    # Test 6: Check for results styles
    if ".ab-testing-variant-result" in content:
        print("✅ PASS: Results styles found")
    else:
        print("❌ FAIL: Results styles not found")
        return False
    
    # Test 7: Check for significance styles
    if ".ab-testing-significance" in content:
        print("✅ PASS: Significance styles found")
    else:
        print("❌ FAIL: Significance styles not found")
        return False
    
    # Test 8: Check for responsive design
    if "@media (max-width: 768px)" in content:
        print("✅ PASS: Responsive design found")
    else:
        print("❌ FAIL: Responsive design not found")
        return False
    
    # Test 9: Check for dark mode support
    if "@media (prefers-color-scheme: dark)" in content:
        print("✅ PASS: Dark mode support found")
    else:
        print("❌ FAIL: Dark mode support not found")
        return False
    
    # Test 10: Count CSS classes
    class_count = len(re.findall(r'\.[a-z-]+[,\s\{]', content))
    if class_count >= 40:
        print(f"✅ PASS: Found {class_count} CSS classes (expected 40+)")
    else:
        print(f"❌ FAIL: Found only {class_count} CSS classes (expected 40+)")
        return False
    
    print("\n✅ All A/B Testing CSS tests passed!")
    return True

def test_html_integration():
    """Test HTML integration of A/B testing"""
    print("\nTesting HTML Integration...")
    
    html_path = Path("/workspace/index.html")
    
    if not html_path.exists():
        print("❌ FAIL: index.html not found")
        return False
    
    content = html_path.read_text()
    
    # Test 1: Check for ab-testing.js script tag
    if 'src="js/modules/ab-testing.js"' in content:
        print("✅ PASS: ab-testing.js script tag found")
    else:
        print("❌ FAIL: ab-testing.js script tag not found")
        return False
    
    # Test 2: Check for ab-testing-ui.js script tag
    if 'src="js/ui/ab-testing-ui.js"' in content:
        print("✅ PASS: ab-testing-ui.js script tag found")
    else:
        print("❌ FAIL: ab-testing-ui.js script tag not found")
        return False
    
    # Test 3: Check for ab-testing.css link tag
    if 'href="css/ab-testing.css"' in content:
        print("✅ PASS: ab-testing.css link tag found")
    else:
        print("❌ FAIL: ab-testing.css link tag not found")
        return False
    
    print("\n✅ All HTML Integration tests passed!")
    return True

def test_functionality():
    """Test specific functionality"""
    print("\nTesting Functionality...")
    
    module_path = Path("/workspace/js/modules/ab-testing.js")
    content = module_path.read_text()
    
    # Test 1: Check consistent hashing
    if "consistentHash" in content:
        print("✅ PASS: Consistent hashing found")
    else:
        print("❌ FAIL: Consistent hashing not found")
        return False
    
    # Test 2: Check localStorage integration
    if "localStorage" in content:
        print("✅ PASS: localStorage integration found")
    else:
        print("❌ FAIL: localStorage integration not found")
        return False
    
    # Test 3: Check statistical calculations
    if "calculateSignificance" in content and "normalCDF" in content:
        print("✅ PASS: Statistical calculations found")
    else:
        print("❌ FAIL: Statistical calculations not found")
        return False
    
    # Test 4: Check analytics integration
    if "window.Analytics" in content:
        print("✅ PASS: Analytics integration found")
    else:
        print("❌ FAIL: Analytics integration not found")
        return False
    
    # Test 5: Check variant weighting
    if "weight" in content:
        print("✅ PASS: Variant weighting found")
    else:
        print("❌ FAIL: Variant weighting not found")
        return False
    
    # Test 6: Check confidence level
    if "confidenceLevel" in content:
        print("✅ PASS: Confidence level found")
    else:
        print("❌ FAIL: Confidence level not found")
        return False
    
    # Test 7: Check sample size
    if "minSampleSize" in content:
        print("✅ PASS: Sample size found")
    else:
        print("❌ FAIL: Sample size not found")
        return False
    
    # Test 8: Check experiment lifecycle
    if "activateExperiment" in content and "pauseExperiment" in content and "completeExperiment" in content:
        print("✅ PASS: Experiment lifecycle found")
    else:
        print("❌ FAIL: Experiment lifecycle not found")
        return False
    
    # Test 9: Check export/import functionality
    if "exportExperiment" in content and "importExperiment" in content:
        print("✅ PASS: Export/import functionality found")
    else:
        print("❌ FAIL: Export/import functionality not found")
        return False
    
    # Test 10: Check statistics
    if "getStatistics" in content:
        print("✅ PASS: Statistics function found")
    else:
        print("❌ FAIL: Statistics function not found")
        return False
    
    print("\n✅ All Functionality tests passed!")
    return True

def main():
    """Run all tests"""
    print("=" * 60)
    print("A/B Testing Framework Test Suite")
    print("=" * 60)
    
    tests = [
        ("A/B Testing Module", test_ab_testing_module),
        ("A/B Testing UI", test_ab_testing_ui),
        ("A/B Testing CSS", test_ab_testing_css),
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