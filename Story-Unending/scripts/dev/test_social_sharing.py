#!/usr/bin/env python3
"""
Test script for social sharing enhancement
"""

import os
import json
import re

def test_social_sharing_module():
    """Test social sharing module"""
    print("Testing social sharing module...")
    
    module_path = "js/modules/social-sharing.js"
    
    if not os.path.exists(module_path):
        print(f"❌ FAIL: {module_path} not found")
        return False
    
    with open(module_path, 'r') as f:
        content = f.read()
    
    # Check for required functions
    required_functions = [
        'init',
        'isSupported',
        'canShare',
        'shareText',
        'shareLink',
        'shareChapter',
        'shareAchievement',
        'shareSave',
        'shareCustom',
        'shareToPlatform',
        'copyLink',
        'getHistory',
        'clearHistory',
        'getShareStats',
        'generateChapterShareText',
        'generateAchievementShareText'
    ]
    
    all_found = True
    for func in required_functions:
        if f'function {func}' not in content and f'{func}:' not in content:
            print(f"❌ FAIL: Function '{func}' not found")
            all_found = False
        else:
            print(f"✅ PASS: Function '{func}' found")
    
    # Check for namespace export
    if 'window.SocialSharing' not in content:
        print("❌ FAIL: SocialSharing namespace not exported")
        all_found = False
    else:
        print("✅ PASS: SocialSharing namespace exported")
    
    # Check for Web Share API usage
    if 'navigator.share' not in content:
        print("❌ FAIL: Web Share API not used")
        all_found = False
    else:
        print("✅ PASS: Web Share API used")
    
    # Check for platform support
    if 'shareToPlatform' not in content:
        print("❌ FAIL: Platform sharing not implemented")
        all_found = False
    else:
        print("✅ PASS: Platform sharing implemented")
    
    return all_found

def test_social_sharing_ui():
    """Test social sharing UI module"""
    print("\nTesting social sharing UI module...")
    
    module_path = "js/ui/social-sharing-ui.js"
    
    if not os.path.exists(module_path):
        print(f"❌ FAIL: {module_path} not found")
        return False
    
    with open(module_path, 'r') as f:
        content = f.read()
    
    # Check for required functions
    required_functions = [
        'openModal',
        'closeModal',
        'updateShareOptions',
        'shareNative',
        'shareToPlatform',
        'copyLink',
        'loadShareHistory',
        'updateStats',
        'quickShareChapter'
    ]
    
    all_found = True
    for func in required_functions:
        if f'function {func}' not in content and f'{func}:' not in content:
            print(f"❌ FAIL: Function '{func}' not found")
            all_found = False
        else:
            print(f"✅ PASS: Function '{func}' found")
    
    # Check for namespace export
    if 'window.SocialSharingUI' not in content:
        print("❌ FAIL: SocialSharingUI namespace not exported")
        all_found = False
    else:
        print("✅ PASS: SocialSharingUI namespace exported")
    
    # Check for modal creation
    if 'share-modal' not in content:
        print("❌ FAIL: Share modal not created")
        all_found = False
    else:
        print("✅ PASS: Share modal created")
    
    # Check for platform buttons
    if 'platform-buttons' not in content:
        print("❌ FAIL: Platform buttons not found")
        all_found = False
    else:
        print("✅ PASS: Platform buttons found")
    
    return all_found

def test_social_sharing_css():
    """Test social sharing CSS file"""
    print("\nTesting social sharing CSS...")
    
    css_path = "css/social-sharing.css"
    
    if not os.path.exists(css_path):
        print(f"❌ FAIL: {css_path} not found")
        return False
    
    with open(css_path, 'r') as f:
        content = f.read()
    
    # Check for required CSS classes
    required_classes = [
        '.share-content',
        '.platform-buttons',
        '.platform-btn',
        '.history-item',
        '.stats-grid'
    ]
    
    all_found = True
    for css_class in required_classes:
        if css_class not in content:
            print(f"❌ FAIL: CSS class '{css_class}' not found")
            all_found = False
        else:
            print(f"✅ PASS: CSS class '{css_class}' found")
    
    # Check for platform-specific styles
    platform_styles = ['twitter-btn', 'facebook-btn', 'linkedin-btn', 'whatsapp-btn']
    for style in platform_styles:
        if f'.{style}' not in content:
            print(f"❌ FAIL: Platform style '{style}' not found")
            all_found = False
        else:
            print(f"✅ PASS: Platform style '{style}' found")
    
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
    
    # Check for social sharing module
    if 'social-sharing.js' not in content:
        print("❌ FAIL: social-sharing.js not included")
        return False
    else:
        print("✅ PASS: social-sharing.js included")
    
    # Check for social sharing UI
    if 'social-sharing-ui.js' not in content:
        print("❌ FAIL: social-sharing-ui.js not included")
        return False
    else:
        print("✅ PASS: social-sharing-ui.js included")
    
    # Check for social sharing CSS
    if 'social-sharing.css' not in content:
        print("❌ FAIL: social-sharing.css not included")
        return False
    else:
        print("✅ PASS: social-sharing.css included")
    
    # Check for share button
    if 'SocialSharingUI.openModal' not in content:
        print("❌ FAIL: Share button not found")
        return False
    else:
        print("✅ PASS: Share button found")
    
    return True

def test_code_quality():
    """Test code quality metrics"""
    print("\nTesting code quality...")
    
    # Check social sharing module
    module_path = "js/modules/social-sharing.js"
    with open(module_path, 'r') as f:
        content = f.read()
    
    lines = len(content.split('\n'))
    print(f"✅ PASS: social-sharing.js has {lines} lines")
    
    jsdoc_count = content.count('/**')
    print(f"✅ PASS: social-sharing.js has {jsdoc_count} JSDoc comments")
    
    # Check social sharing UI
    ui_path = "js/ui/social-sharing-ui.js"
    with open(ui_path, 'r') as f:
        content = f.read()
    
    lines = len(content.split('\n'))
    print(f"✅ PASS: social-sharing-ui.js has {lines} lines")
    
    jsdoc_count = content.count('/**')
    print(f"✅ PASS: social-sharing-ui.js has {jsdoc_count} JSDoc comments")
    
    return True

def main():
    """Run all tests"""
    print("=" * 60)
    print("SOCIAL SHARING TESTS")
    print("=" * 60)
    
    tests = [
        ("Social Sharing Module", test_social_sharing_module),
        ("Social Sharing UI", test_social_sharing_ui),
        ("Social Sharing CSS", test_social_sharing_css),
        ("HTML Integration", test_html_integration),
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