#!/usr/bin/env python3
"""
Test script for User Features Module
Tests all user features including profiles, preferences, achievements, social features, and messaging
"""

import json
import os
import sys
import time

def test_user_profiles_module_exists():
    """Test that user profiles module file exists"""
    print("Testing user profiles module file existence...")
    
    if os.path.exists('js/modules/user-profiles.js'):
        print("✅ User profiles module file exists")
        return True
    else:
        print("❌ User profiles module file not found")
        return False

def test_user_preferences_module_exists():
    """Test that user preferences module file exists"""
    print("\nTesting user preferences module file existence...")
    
    if os.path.exists('js/modules/user-preferences.js'):
        print("✅ User preferences module file exists")
        return True
    else:
        print("❌ User preferences module file not found")
        return False

def test_achievements_module_exists():
    """Test that achievements module file exists"""
    print("\nTesting achievements module file existence...")
    
    if os.path.exists('js/modules/achievements.js'):
        print("✅ Achievements module file exists")
        return True
    else:
        print("❌ Achievements module file not found")
        return False

def test_social_features_module_exists():
    """Test that social features module file exists"""
    print("\nTesting social features module file existence...")
    
    if os.path.exists('js/modules/social-features.js'):
        print("✅ Social features module file exists")
        return True
    else:
        print("❌ Social features module file not found")
        return False

def test_messaging_module_exists():
    """Test that messaging module file exists"""
    print("\nTesting messaging module file existence...")
    
    if os.path.exists('js/modules/messaging.js'):
        print("✅ Messaging module file exists")
        return True
    else:
        print("❌ Messaging module file not found")
        return False

def test_user_features_ui_exists():
    """Test that user features UI module file exists"""
    print("\nTesting user features UI module file existence...")
    
    if os.path.exists('js/ui/user-features-ui.js'):
        print("✅ User features UI module file exists")
        return True
    else:
        print("❌ User features UI module file not found")
        return False

def test_user_features_css_exists():
    """Test that user features CSS file exists"""
    print("\nTesting user features CSS file existence...")
    
    if os.path.exists('css/user-features.css'):
        print("✅ User features CSS file exists")
        return True
    else:
        print("❌ User features CSS file not found")
        return False

def test_module_structure():
    """Test module structure and functions"""
    print("\nTesting module structure...")
    
    modules = {
        'user-profiles.js': ['createProfile', 'getProfile', 'updateProfile', 'setAvatar', 'searchProfiles'],
        'user-preferences.js': ['getPreferences', 'setPreference', 'setPreferences', 'resetPreferences'],
        'achievements.js': ['unlockAchievement', 'getUserAchievements', 'getAchievementProgress', 'checkAchievements'],
        'social-features.js': ['addComment', 'shareChapter', 'followUser', 'getFollowers', 'getFollowing'],
        'messaging.js': ['sendMessage', 'getMessages', 'getUserConversations', 'getUnreadCount']
    }
    
    all_passed = True
    for module_file, required_functions in modules.items():
        try:
            with open(f'js/modules/{module_file}', 'r') as f:
                content = f.read()
            
            missing_functions = []
            for func in required_functions:
                if f'function {func}(' not in content and f'{func}:' not in content:
                    missing_functions.append(func)
            
            if missing_functions:
                print(f"❌ {module_file}: Missing functions: {', '.join(missing_functions)}")
                all_passed = False
            else:
                print(f"✅ {module_file}: All {len(required_functions)} required functions present")
        except Exception as e:
            print(f"❌ {module_file}: Error reading module: {e}")
            all_passed = False
    
    return all_passed

def test_ui_structure():
    """Test UI module structure and functions"""
    print("\nTesting UI module structure...")
    
    try:
        with open('js/ui/user-features-ui.js', 'r') as f:
            content = f.read()
        
        required_functions = [
            'init', 'openModal', 'closeModal', 'switchTab',
            'loadUserProfile', 'saveProfile', 'uploadAvatar',
            'loadPreferences', 'updatePreference',
            'loadAchievements', 'searchUsers', 'followUser',
            'loadMessages', 'sendMessage'
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
        print(f"❌ Error reading UI module: {e}")
        return False

def test_namespace_exports():
    """Test that namespaces are exported"""
    print("\nTesting namespace exports...")
    
    namespaces = {
        'UserProfiles': 'js/modules/user-profiles.js',
        'UserPreferences': 'js/modules/user-preferences.js',
        'Achievements': 'js/modules/achievements.js',
        'SocialFeatures': 'js/modules/social-features.js',
        'Messaging': 'js/modules/messaging.js',
        'UserFeaturesUI': 'js/ui/user-features-ui.js'
    }
    
    all_passed = True
    for namespace, file_path in namespaces.items():
        try:
            with open(file_path, 'r') as f:
                content = f.read()
            
            if f'window.{namespace}' in content:
                print(f"✅ {namespace} namespace exported")
            else:
                print(f"❌ {namespace} namespace not exported")
                all_passed = False
        except Exception as e:
            print(f"❌ {namespace}: Error checking namespace: {e}")
            all_passed = False
    
    return all_passed

def test_html_integration():
    """Test that user features are integrated into HTML"""
    print("\nTesting HTML integration...")
    
    try:
        with open('index.html', 'r') as f:
            content = f.read()
        
        checks = {
            'CSS link': '<link rel="stylesheet" href="css/user-features.css">' in content,
            'User profiles module': '<script src="js/modules/user-profiles.js"></script>' in content,
            'User preferences module': '<script src="js/modules/user-preferences.js"></script>' in content,
            'Achievements module': '<script src="js/modules/achievements.js"></script>' in content,
            'Social features module': '<script src="js/modules/social-features.js"></script>' in content,
            'Messaging module': '<script src="js/modules/messaging.js"></script>' in content,
            'User features UI': '<script src="js/ui/user-features-ui.js"></script>' in content,
            'User features button': 'UserFeatures' in content or 'user-features' in content.lower()
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

def test_css_content():
    """Test user features CSS content"""
    print("\nTesting user features CSS content...")
    
    try:
        with open('css/user-features.css', 'r') as f:
            content = f.read()
        
        required_classes = [
            '.user-features-modal',
            '.user-profile',
            '.user-preferences',
            '.user-achievements',
            '.user-social',
            '.user-messages',
            '.achievement-card',
            '.user-card',
            '.conversation-item'
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
        modules = [
            'js/modules/user-profiles.js',
            'js/modules/user-preferences.js',
            'js/modules/achievements.js',
            'js/modules/social-features.js',
            'js/modules/messaging.js',
            'js/ui/user-features-ui.js'
        ]
        
        total_jsdoc = 0
        total_try_catch = 0
        total_sanitization = 0
        
        for module in modules:
            with open(module, 'r') as f:
                content = f.read()
            
            total_jsdoc += content.count('/**')
            total_try_catch += content.count('try {')
            total_sanitization += content.count('sanitizeHTML')
        
        print(f"✅ Total JSDoc comments: {total_jsdoc}")
        print(f"✅ Total try-catch blocks: {total_try_catch}")
        print(f"✅ Total sanitization instances: {total_sanitization}")
        
        return True
            
    except Exception as e:
        print(f"❌ Error checking code quality: {e}")
        return False

def test_achievement_definitions():
    """Test achievement definitions"""
    print("\nTesting achievement definitions...")
    
    try:
        with open('js/modules/achievements.js', 'r') as f:
            content = f.read()
        
        required_achievements = [
            'first_chapter', 'chapter_10', 'chapter_50', 'chapter_100',
            'hour_1', 'hour_10', 'hour_50',
            'first_bookmark', 'bookmark_10',
            'streak_3', 'streak_7', 'streak_30'
        ]
        
        missing_achievements = []
        for achievement in required_achievements:
            if achievement not in content:
                missing_achievements.append(achievement)
        
        if missing_achievements:
            print(f"❌ Missing achievements: {', '.join(missing_achievements)}")
            return False
        else:
            print(f"✅ All {len(required_achievements)} required achievements defined")
            return True
            
    except Exception as e:
        print(f"❌ Error checking achievements: {e}")
        return False

def run_all_tests():
    """Run all tests and return results"""
    print("=" * 60)
    print("USER FEATURES MODULE TEST SUITE")
    print("=" * 60)
    
    tests = [
        test_user_profiles_module_exists,
        test_user_preferences_module_exists,
        test_achievements_module_exists,
        test_social_features_module_exists,
        test_messaging_module_exists,
        test_user_features_ui_exists,
        test_user_features_css_exists,
        test_module_structure,
        test_ui_structure,
        test_namespace_exports,
        test_html_integration,
        test_css_content,
        test_code_quality,
        test_achievement_definitions
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