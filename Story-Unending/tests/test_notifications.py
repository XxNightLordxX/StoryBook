#!/usr/bin/env python3
"""
Test Suite for Notification System
Tests notification preferences, email notifications, history, scheduling, and templates
"""

import os
import sys
import json
import subprocess
import time
from datetime import datetime, timedelta

# Test configuration
TEST_PORT = 9002
BASE_URL = f"http://localhost:{TEST_PORT}"

# ANSI color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(text):
    """Print a formatted header"""
    print(f"\n{BLUE}{'=' * 70}{RESET}")
    print(f"{BLUE}{text}{RESET}")
    print(f"{BLUE}{'=' * 70}{RESET}\n")

def print_success(text):
    """Print success message"""
    print(f"{GREEN}✓ {text}{RESET}")

def print_error(text):
    """Print error message"""
    print(f"{RED}✗ {text}{RESET}")

def print_info(text):
    """Print info message"""
    print(f"{YELLOW}ℹ {text}{RESET}")

def test_file_exists(filepath):
    """Test if a file exists"""
    if os.path.exists(filepath):
        print_success(f"File exists: {filepath}")
        return True
    else:
        print_error(f"File not found: {filepath}")
        return False

def test_file_size(filepath, min_size=1000):
    """Test if a file meets minimum size requirement"""
    if os.path.exists(filepath):
        size = os.path.getsize(filepath)
        if size >= min_size:
            print_success(f"File size OK: {filepath} ({size} bytes)")
            return True
        else:
            print_error(f"File too small: {filepath} ({size} bytes, expected {min_size}+)")
            return False
    else:
        print_error(f"File not found: {filepath}")
        return False

def test_javascript_syntax(filepath):
    """Test JavaScript syntax using Node.js"""
    try:
        result = subprocess.run(
            ['node', '--check', filepath],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print_success(f"JavaScript syntax valid: {filepath}")
            return True
        else:
            print_error(f"JavaScript syntax error in {filepath}:")
            print(result.stderr)
            return False
    except Exception as e:
        print_error(f"Failed to check JavaScript syntax: {e}")
        return False

def test_css_syntax(filepath):
    """Test CSS syntax"""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        if '{' in content and '}' in content:
            print_success(f"CSS syntax appears valid: {filepath}")
            return True
        else:
            print_error(f"CSS syntax error in {filepath}")
            return False
    except Exception as e:
        print_error(f"Failed to check CSS syntax: {e}")
        return False

def test_notification_preferences():
    """Test notification preferences functionality"""
    print_info("Testing notification preferences...")
    
    if not test_file_exists('js/modules/notifications.js'):
        return False
    
    expected_functions = [
        'getPreferences',
        'updatePreferences',
        'resetPreferences',
        'isTypeEnabled'
    ]
    
    try:
        with open('js/modules/notifications.js', 'r') as f:
            content = f.read()
        
        all_found = True
        for func in expected_functions:
            if func in content:
                print_success(f"Function found: {func}")
            else:
                print_error(f"Function not found: {func}")
                all_found = False
        
        return all_found
    except Exception as e:
        print_error(f"Failed to test notification preferences: {e}")
        return False

def test_email_notifications():
    """Test email notification functionality"""
    print_info("Testing email notifications...")
    
    try:
        with open('js/modules/notifications.js', 'r') as f:
            content = f.read()
        
        checks = [
            ('sendEmailNotification', 'Email send function'),
            ('updateEmailSettings', 'Email settings function'),
            ('email.enabled', 'Email enabled setting'),
            ('email.address', 'Email address setting'),
            ('email.frequency', 'Email frequency setting')
        ]
        
        all_passed = True
        for check, description in checks:
            if check in content:
                print_success(f"{description} found")
            else:
                print_error(f"{description} not found")
                all_passed = False
        
        return all_passed
    except Exception as e:
        print_error(f"Failed to test email notifications: {e}")
        return False

def test_notification_history():
    """Test notification history functionality"""
    print_info("Testing notification history...")
    
    try:
        with open('js/modules/notifications.js', 'r') as f:
            content = f.read()
        
        expected_functions = [
            'getHistory',
            'markAsRead',
            'markAllAsRead',
            'dismissNotification',
            'deleteNotification',
            'clearHistory',
            'getUnreadCount'
        ]
        
        all_found = True
        for func in expected_functions:
            if func in content:
                print_success(f"Function found: {func}")
            else:
                print_error(f"Function not found: {func}")
                all_found = False
        
        return all_found
    except Exception as e:
        print_error(f"Failed to test notification history: {e}")
        return False

def test_notification_scheduling():
    """Test notification scheduling functionality"""
    print_info("Testing notification scheduling...")
    
    try:
        with open('js/modules/notifications.js', 'r') as f:
            content = f.read()
        
        expected_functions = [
            'scheduleNotification',
            'cancelScheduledNotification',
            'getScheduledNotifications',
            'startScheduler'
        ]
        
        all_found = True
        for func in expected_functions:
            if func in content:
                print_success(f"Function found: {func}")
            else:
                print_error(f"Function not found: {func}")
                all_found = False
        
        return all_found
    except Exception as e:
        print_error(f"Failed to test notification scheduling: {e}")
        return False

def test_notification_templates():
    """Test notification templates functionality"""
    print_info("Testing notification templates...")
    
    try:
        with open('js/modules/notifications.js', 'r') as f:
            content = f.read()
        
        expected_functions = [
            'getTemplates',
            'updateTemplate',
            'resetTemplate',
            'createFromTemplate',
            'substituteVariables'
        ]
        
        expected_templates = [
            'chapter_update',
            'bookmark_reminder',
            'achievement',
            'social',
            'system',
            'email'
        ]
        
        all_found = True
        for func in expected_functions:
            if func in content:
                print_success(f"Function found: {func}")
            else:
                print_error(f"Function not found: {func}")
                all_found = False
        
        for template in expected_templates:
            if template in content:
                print_success(f"Template found: {template}")
            else:
                print_error(f"Template not found: {template}")
                all_found = False
        
        return all_found
    except Exception as e:
        print_error(f"Failed to test notification templates: {e}")
        return False

def test_ui_module():
    """Test notification UI module"""
    print_info("Testing notification UI module...")
    
    try:
        with open('js/ui/notifications-ui.js', 'r') as f:
            content = f.read()
        
        expected_functions = [
            'openModal',
            'closeModal',
            'switchTab',
            'savePreferences',
            'resetPreferences',
            'applyHistoryFilter',
            'markAsRead',
            'markAllAsRead',
            'dismissNotification',
            'deleteNotification',
            'clearHistory',
            'showScheduleForm',
            'submitSchedule',
            'cancelScheduled',
            'editTemplate',
            'saveTemplate',
            'resetTemplate'
        ]
        
        all_found = True
        for func in expected_functions:
            if func in content:
                print_success(f"UI function found: {func}")
            else:
                print_error(f"UI function not found: {func}")
                all_found = False
        
        return all_found
    except Exception as e:
        print_error(f"Failed to test UI module: {e}")
        return False

def test_css_styling():
    """Test CSS styling"""
    print_info("Testing CSS styling...")
    
    try:
        with open('css/notifications.css', 'r') as f:
            content = f.read()
        
        expected_classes = [
            '.notifications-modal',
            '.notification-card',
            '.scheduled-card',
            '.template-card',
            '.preferences-section',
            '.history-section',
            '.scheduled-section',
            '.templates-section',
            '.tab-btn',
            '.tab-pane'
        ]
        
        all_found = True
        for cls in expected_classes:
            if cls in content:
                print_success(f"CSS class found: {cls}")
            else:
                print_error(f"CSS class not found: {cls}")
                all_found = False
        
        return all_found
    except Exception as e:
        print_error(f"Failed to test CSS styling: {e}")
        return False

def test_security_features():
    """Test security features in notification system"""
    print_info("Testing security features...")
    
    try:
        with open('js/modules/notifications.js', 'r') as f:
            content = f.read()
        
        security_checks = [
            ('ErrorHandler.handleError', 'Error handling'),
            ('try {', 'Try-catch blocks'),
            ('Storage.setItem', 'Secure storage')
        ]
        
        all_passed = True
        for check, description in security_checks:
            if check in content:
                print_success(f"{description} found")
            else:
                print_error(f"{description} not found")
                all_passed = False
        
        return all_passed
    except Exception as e:
        print_error(f"Failed to test security features: {e}")
        return False

def test_html_integration():
    """Test if notification system is integrated into index.html"""
    print_info("Testing HTML integration...")
    
    try:
        with open('index.html', 'r') as f:
            content = f.read()
        
        checks = [
            ('css/notifications.css', 'CSS link'),
            ('js/modules/notifications.js', 'Module script'),
            ('js/ui/notifications-ui.js', 'UI script'),
            ('NotificationsUI.openModal()', 'Function call')
        ]
        
        all_passed = True
        for check, description in checks:
            if check in content:
                print_success(f"{description} found in index.html")
            else:
                print_error(f"{description} not found in index.html")
                all_passed = False
        
        return all_passed
    except Exception as e:
        print_error(f"Failed to check HTML integration: {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print_header("Notification System Test Suite")
    
    results = {
        'passed': 0,
        'failed': 0,
        'total': 0
    }
    
    # Test 1: File existence
    print_header("Test 1: File Existence")
    tests = [
        ('js/modules/notifications.js', 5000),
        ('js/ui/notifications-ui.js', 5000),
        ('css/notifications.css', 3000)
    ]
    
    for filepath, min_size in tests:
        results['total'] += 1
        if test_file_size(filepath, min_size):
            results['passed'] += 1
        else:
            results['failed'] += 1
    
    # Test 2: JavaScript syntax
    print_header("Test 2: JavaScript Syntax")
    results['total'] += 1
    if test_javascript_syntax('js/modules/notifications.js'):
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    results['total'] += 1
    if test_javascript_syntax('js/ui/notifications-ui.js'):
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 3: CSS syntax
    print_header("Test 3: CSS Syntax")
    results['total'] += 1
    if test_css_syntax('css/notifications.css'):
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 4: Notification preferences
    print_header("Test 4: Notification Preferences")
    results['total'] += 1
    if test_notification_preferences():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 5: Email notifications
    print_header("Test 5: Email Notifications")
    results['total'] += 1
    if test_email_notifications():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 6: Notification history
    print_header("Test 6: Notification History")
    results['total'] += 1
    if test_notification_history():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 7: Notification scheduling
    print_header("Test 7: Notification Scheduling")
    results['total'] += 1
    if test_notification_scheduling():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 8: Notification templates
    print_header("Test 8: Notification Templates")
    results['total'] += 1
    if test_notification_templates():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 9: UI module
    print_header("Test 9: UI Module")
    results['total'] += 1
    if test_ui_module():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 10: CSS styling
    print_header("Test 10: CSS Styling")
    results['total'] += 1
    if test_css_styling():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 11: Security features
    print_header("Test 11: Security Features")
    results['total'] += 1
    if test_security_features():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 12: HTML integration
    print_header("Test 12: HTML Integration")
    results['total'] += 1
    if test_html_integration():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Print summary
    print_header("Test Summary")
    print(f"Total Tests: {results['total']}")
    print(f"{GREEN}Passed: {results['passed']}{RESET}")
    print(f"{RED}Failed: {results['failed']}{RESET}")
    
    if results['failed'] == 0:
        print(f"\n{GREEN}All tests passed! ✓{RESET}")
        return True
    else:
        print(f"\n{RED}Some tests failed. ✗{RESET}")
        return False

if __name__ == '__main__':
    os.chdir('/workspace')
    success = run_all_tests()
    sys.exit(0 if success else 1)