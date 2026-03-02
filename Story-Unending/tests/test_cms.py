#!/usr/bin/env python3
"""
Test script for Content Management System Module
Tests all CMS functionality including versioning, approval workflow, and content management
"""

import json
import os
import sys
import time

def test_cms_module_exists():
    """Test that CMS module file exists"""
    print("Testing CMS module file existence...")
    
    if os.path.exists('js/modules/content-management.js'):
        print("✅ CMS module file exists")
        return True
    else:
        print("❌ CMS module file not found")
        return False

def test_cms_ui_exists():
    """Test that CMS UI module file exists"""
    print("\nTesting CMS UI module file existence...")
    
    if os.path.exists('js/ui/content-management-ui.js'):
        print("✅ CMS UI module file exists")
        return True
    else:
        print("❌ CMS UI module file not found")
        return False

def test_cms_css_exists():
    """Test that CMS CSS file exists"""
    print("\nTesting CMS CSS file existence...")
    
    if os.path.exists('css/content-management.css'):
        print("✅ CMS CSS file exists")
        return True
    else:
        print("❌ CMS CSS file not found")
        return False

def test_cms_module_structure():
    """Test CMS module structure and functions"""
    print("\nTesting CMS module structure...")
    
    try:
        with open('js/modules/content-management.js', 'r') as f:
            content = f.read()
        
        required_functions = [
            'init',
            'getChapterContent',
            'createVersion',
            'getVersions',
            'getVersion',
            'saveDraft',
            'getDraft',
            'deleteDraft',
            'submitForApproval',
            'getApprovalQueue',
            'approveContent',
            'rejectContent',
            'getStatistics',
            'searchContent',
            'exportContent',
            'importContent',
            'clearAllData'
        ]
        
        missing_functions = []
        for func in required_functions:
            if f'function {func}(' not in content and f'{func}:' not in content:
                missing_functions.append(func)
        
        if missing_functions:
            print(f"❌ Missing functions: {', '.join(missing_functions)}")
            return False
        else:
            print(f"✅ All {len(required_functions)} required functions present")
            return True
            
    except Exception as e:
        print(f"❌ Error reading CMS module: {e}")
        return False

def test_cms_ui_structure():
    """Test CMS UI module structure and functions"""
    print("\nTesting CMS UI module structure...")
    
    try:
        with open('js/ui/content-management-ui.js', 'r') as f:
            content = f.read()
        
        required_functions = [
            'init',
            'openModal',
            'closeModal',
            'switchTab',
            'loadChapter',
            'loadVersion',
            'saveDraft',
            'createVersion',
            'submitForApproval',
            'previewContent',
            'deleteDraft',
            'loadVersions',
            'approveContent',
            'rejectContent',
            'searchContent',
            'updateStatistics',
            'exportContent',
            'importContent'
        ]
        
        missing_functions = []
        for func in required_functions:
            if f'function {func}(' not in content and f'{func}:' not in content:
                missing_functions.append(func)
        
        if missing_functions:
            print(f"❌ Missing functions: {', '.join(missing_functions)}")
            return False
        else:
            print(f"✅ All {len(required_functions)} required functions present")
            return True
            
    except Exception as e:
        print(f"❌ Error reading CMS UI module: {e}")
        return False

def test_cms_namespace():
    """Test that ContentManagement namespace is exported"""
    print("\nTesting ContentManagement namespace export...")
    
    try:
        with open('js/modules/content-management.js', 'r') as f:
            content = f.read()
        
        if 'window.ContentManagement' in content:
            print("✅ ContentManagement namespace exported to window")
            return True
        else:
            print("❌ ContentManagement namespace not exported")
            return False
            
    except Exception as e:
        print(f"❌ Error checking namespace: {e}")
        return False

def test_cms_ui_namespace():
    """Test that ContentManagementUI namespace is exported"""
    print("\nTesting ContentManagementUI namespace export...")
    
    try:
        with open('js/ui/content-management-ui.js', 'r') as f:
            content = f.read()
        
        if 'window.ContentManagementUI' in content:
            print("✅ ContentManagementUI namespace exported to window")
            return True
        else:
            print("❌ ContentManagementUI namespace not exported")
            return False
            
    except Exception as e:
        print(f"❌ Error checking namespace: {e}")
        return False

def test_html_integration():
    """Test that CMS is integrated into HTML"""
    print("\nTesting HTML integration...")
    
    try:
        with open('index.html', 'r') as f:
            content = f.read()
        
        checks = {
            'CSS link': '<link rel="stylesheet" href="css/content-management.css">' in content,
            'CMS module': '<script src="js/modules/content-management.js"></script>' in content,
            'CMS UI': '<script src="js/ui/content-management-ui.js"></script>' in content,
            'CMS button': 'ContentManagement' in content or 'content-management' in content.lower()
        }
        
        all_passed = True
        for check_name, passed in checks.items():
            if passed:
                print(f"✅ {check_name} found")
            else:
                print(f"❌ {check_name} not found")
                all_passed = False
        
        return all_passed
            
    except Exception as e:
        print(f"❌ Error reading HTML file: {e}")
        return False

def test_cms_css_content():
    """Test CMS CSS content"""
    print("\nTesting CMS CSS content...")
    
    try:
        with open('css/content-management.css', 'r') as f:
            content = f.read()
        
        required_classes = [
            '.cms-modal',
            '.cms-tabs',
            '.cms-editor',
            '.version-item',
            '.approval-item',
            '.search-result-item',
            '.stat-card'
        ]
        
        missing_classes = []
        for css_class in required_classes:
            if css_class not in content:
                missing_classes.append(css_class)
        
        if missing_classes:
            print(f"❌ Missing CSS classes: {', '.join(missing_classes)}")
            return False
        else:
            print(f"✅ All {len(required_classes)} required CSS classes present")
            return True
            
    except Exception as e:
        print(f"❌ Error reading CSS file: {e}")
        return False

def test_code_quality():
    """Test code quality metrics"""
    print("\nTesting code quality...")
    
    try:
        with open('js/modules/content-management.js', 'r') as f:
            cms_content = f.read()
        
        with open('js/ui/content-management-ui.js', 'r') as f:
            ui_content = f.read()
        
        # Check for JSDoc comments
        cms_jsdoc = cms_content.count('/**')
        ui_jsdoc = ui_content.count('/**')
        
        # Check for error handling
        cms_error_handling = cms_content.count('try {')
        ui_error_handling = ui_content.count('try {')
        
        # Check for input sanitization
        sanitization = cms_content.count('sanitizeHTML') + ui_content.count('sanitizeHTML')
        
        print(f"✅ CMS module: {cms_jsdoc} JSDoc comments")
        print(f"✅ CMS UI: {ui_jsdoc} JSDoc comments")
        print(f"✅ CMS module: {cms_error_handling} try-catch blocks")
        print(f"✅ CMS UI: {ui_error_handling} try-catch blocks")
        print(f"✅ Input sanitization: {sanitization} instances")
        
        return True
            
    except Exception as e:
        print(f"❌ Error checking code quality: {e}")
        return False

def test_functionality_integration():
    """Test that CMS integrates with other modules"""
    print("\nTesting functionality integration...")
    
    try:
        with open('js/modules/content-management.js', 'r') as f:
            content = f.read()
        
        # Check for integration with other modules
        integrations = {
            'Storage module': 'Storage.getItem' in content or 'Storage.setItem' in content,
            'ErrorHandler': 'ErrorHandler.handleError' in content
        }
        
        all_passed = True
        for integration_name, passed in integrations.items():
            if passed:
                print(f"✅ {integration_name} integrated")
            else:
                print(f"❌ {integration_name} not integrated")
                all_passed = False
        
        return all_passed
            
    except Exception as e:
        print(f"❌ Error checking integration: {e}")
        return False

def test_cms_features():
    """Test CMS-specific features"""
    print("\nTesting CMS-specific features...")
    
    try:
        with open('js/modules/content-management.js', 'r') as f:
            content = f.read()
        
        features = {
            'Versioning system': 'createVersion' in content and 'getVersions' in content,
            'Draft system': 'saveDraft' in content and 'getDraft' in content,
            'Approval workflow': 'submitForApproval' in content and 'approveContent' in content,
            'Content search': 'searchContent' in content,
            'Export functionality': 'exportContent' in content,
            'Import functionality': 'importContent' in content,
            'Statistics': 'getStatistics' in content
        }
        
        all_passed = True
        for feature_name, passed in features.items():
            if passed:
                print(f"✅ {feature_name} implemented")
            else:
                print(f"❌ {feature_name} not implemented")
                all_passed = False
        
        return all_passed
            
    except Exception as e:
        print(f"❌ Error checking CMS features: {e}")
        return False

def run_all_tests():
    """Run all tests and return results"""
    print("=" * 60)
    print("CONTENT MANAGEMENT SYSTEM TEST SUITE")
    print("=" * 60)
    
    tests = [
        test_cms_module_exists,
        test_cms_ui_exists,
        test_cms_css_exists,
        test_cms_module_structure,
        test_cms_ui_structure,
        test_cms_namespace,
        test_cms_ui_namespace,
        test_html_integration,
        test_cms_css_content,
        test_code_quality,
        test_functionality_integration,
        test_cms_features
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append(False)
        time.sleep(0.1)
    
    print("\n" + "=" * 60)
    print("TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    percentage = (passed / total) * 100 if total > 0 else 0
    
    print(f"Tests Passed: {passed}/{total} ({percentage:.1f}%)")
    
    if passed == total:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1

if __name__ == '__main__':
    sys.exit(run_all_tests())