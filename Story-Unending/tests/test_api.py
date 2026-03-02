#!/usr/bin/env python3
"""
Test Suite for REST API Module
Tests API endpoints, authentication, rate limiting, and error handling
"""

import os
import sys
import json
import subprocess
import time

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

def test_api_module_structure():
    """Test API module structure"""
    print_info("Testing API module structure...")
    
    try:
        with open('js/modules/api.js', 'r') as f:
            content = f.read()
        
        expected_constants = [
            'STORAGE_KEYS',
            'API_VERSION',
            'BASE_URL',
            'ENDPOINTS',
            'RATE_LIMITS',
            'HTTP_STATUS'
        ]
        
        expected_functions = [
            'initialize',
            'request',
            'login',
            'logout',
            'refreshAccessToken',
            'verifyToken',
            'getUsers',
            'getUser',
            'createUser',
            'updateUser',
            'deleteUser',
            'getContent',
            'getContentById',
            'createContent',
            'updateContent',
            'deleteContent',
            'getAnalyticsSessions',
            'getAnalyticsChapters',
            'getAnalyticsActions',
            'getAnalyticsDaily',
            'exportAnalytics'
        ]
        
        all_found = True
        
        for const in expected_constants:
            if const in content:
                print_success(f"Constant found: {const}")
            else:
                print_error(f"Constant not found: {const}")
                all_found = False
        
        for func in expected_functions:
            if func in content:
                print_success(f"Function found: {func}")
            else:
                print_error(f"Function not found: {func}")
                all_found = False
        
        return all_found
    except Exception as e:
        print_error(f"Failed to test API module structure: {e}")
        return False

def test_endpoints_structure():
    """Test endpoints structure"""
    print_info("Testing endpoints structure...")
    
    try:
        with open('js/modules/api.js', 'r') as f:
            content = f.read()
        
        expected_endpoints = {
            'AUTH': ['LOGIN', 'LOGOUT', 'REFRESH', 'VERIFY'],
            'USERS': ['LIST', 'GET', 'CREATE', 'UPDATE', 'DELETE', 'PROFILE', 'PREFERENCES'],
            'CONTENT': ['LIST', 'GET', 'CREATE', 'UPDATE', 'DELETE', 'VERSIONS', 'APPROVE'],
            'ANALYTICS': ['SESSIONS', 'CHAPTERS', 'ACTIONS', 'DAILY', 'EXPORT'],
            'NOTIFICATIONS': ['LIST', 'GET', 'CREATE', 'UPDATE', 'DELETE', 'MARK_READ', 'MARK_ALL_READ'],
            'BOOKMARKS': ['LIST', 'GET', 'CREATE', 'UPDATE', 'DELETE'],
            'SEARCH': ['CHAPTERS', 'CONTENT', 'USERS']
        }
        
        all_found = True
        
        for category, endpoints in expected_endpoints.items():
            for endpoint in endpoints:
                if endpoint in content:
                    print_success(f"Endpoint found: {category}.{endpoint}")
                else:
                    print_error(f"Endpoint not found: {category}.{endpoint}")
                    all_found = False
        
        return all_found
    except Exception as e:
        print_error(f"Failed to test endpoints structure: {e}")
        return False

def test_rate_limiting():
    """Test rate limiting implementation"""
    print_info("Testing rate limiting implementation...")
    
    try:
        with open('js/modules/api.js', 'r') as f:
            content = f.read()
        
        expected_features = [
            'checkRateLimit',
            'getRateLimitForEndpoint',
            'incrementRateLimit',
            'getRateLimitStatus',
            'RATE_LIMITS',
            'rateLimitStore'
        ]
        
        all_found = True
        
        for feature in expected_features:
            if feature in content:
                print_success(f"Rate limiting feature found: {feature}")
            else:
                print_error(f"Rate limiting feature not found: {feature}")
                all_found = False
        
        return all_found
    except Exception as e:
        print_error(f"Failed to test rate limiting: {e}")
        return False

def test_authentication():
    """Test authentication implementation"""
    print_info("Testing authentication implementation...")
    
    try:
        with open('js/modules/api.js', 'r') as f:
            content = f.read()
        
        expected_features = [
            'login',
            'logout',
            'refreshAccessToken',
            'verifyToken',
            'apiToken',
            'refreshToken',
            'loadTokens',
            'Authorization'
        ]
        
        all_found = True
        
        for feature in expected_features:
            if feature in content:
                print_success(f"Authentication feature found: {feature}")
            else:
                print_error(f"Authentication feature not found: {feature}")
                all_found = False
        
        return all_found
    except Exception as e:
        print_error(f"Failed to test authentication: {e}")
        return False

def test_error_handling():
    """Test error handling implementation"""
    print_info("Testing error handling implementation...")
    
    try:
        with open('js/modules/api.js', 'r') as f:
            content = f.read()
        
        expected_features = [
            'APIError',
            'ErrorHandler.handleError',
            'try {',
            'catch',
            'throw new APIError'
        ]
        
        all_found = True
        
        for feature in expected_features:
            if feature in content:
                print_success(f"Error handling feature found: {feature}")
            else:
                print_error(f"Error handling feature not found: {feature}")
                all_found = False
        
        return all_found
    except Exception as e:
        print_error(f"Failed to test error handling: {e}")
        return False

def test_http_client():
    """Test HTTP client implementation"""
    print_info("Testing HTTP client implementation...")
    
    try:
        with open('js/modules/api.js', 'r') as f:
            content = f.read()
        
        expected_features = [
            'request',
            'buildURL',
            'buildHeaders',
            'parseResponse',
            'handleRateLimitHeaders',
            'fetch',
            'method',
            'headers',
            'body'
        ]
        
        all_found = True
        
        for feature in expected_features:
            if feature in content:
                print_success(f"HTTP client feature found: {feature}")
            else:
                print_error(f"HTTP client feature not found: {feature}")
                all_found = False
        
        return all_found
    except Exception as e:
        print_error(f"Failed to test HTTP client: {e}")
        return False

def test_api_documentation():
    """Test API documentation"""
    print_info("Testing API documentation...")
    
    try:
        with open('API_DOCUMENTATION.md', 'r') as f:
            content = f.read()
        
        expected_sections = [
            'Authentication',
            'Users',
            'Content',
            'Analytics',
            'Notifications',
            'Bookmarks',
            'Search',
            'Rate Limiting',
            'Error Handling',
            'SDK Usage',
            'Best Practices'
        ]
        
        expected_endpoints = [
            'POST /api/v1/auth/login',
            'GET /api/v1/users',
            'GET /api/v1/content',
            'GET /api/v1/analytics/sessions'
        ]
        
        all_found = True
        
        for section in expected_sections:
            if section in content:
                print_success(f"Documentation section found: {section}")
            else:
                print_error(f"Documentation section not found: {section}")
                all_found = False
        
        for endpoint in expected_endpoints:
            if endpoint in content:
                print_success(f"Endpoint documented: {endpoint}")
            else:
                print_error(f"Endpoint not documented: {endpoint}")
                all_found = False
        
        return all_found
    except Exception as e:
        print_error(f"Failed to test API documentation: {e}")
        return False

def test_security_features():
    """Test security features"""
    print_info("Testing security features...")
    
    try:
        with open('js/modules/api.js', 'r') as f:
            content = f.read()
        
        security_features = [
            'Bearer',
            'Authorization',
            'token',
            'refreshToken',
            'ErrorHandler.handleError',
            'try {',
            'catch'
        ]
        
        all_found = True
        
        for feature in security_features:
            if feature in content:
                print_success(f"Security feature found: {feature}")
            else:
                print_error(f"Security feature not found: {feature}")
                all_found = False
        
        return all_found
    except Exception as e:
        print_error(f"Failed to test security features: {e}")
        return False

def test_html_integration():
    """Test if API module is integrated into index.html"""
    print_info("Testing HTML integration...")
    
    try:
        with open('index.html', 'r') as f:
            content = f.read()
        
        checks = [
            ('js/modules/api.js', 'API module script'),
            ('API.', 'API namespace usage')
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
    print_header("REST API Module Test Suite")
    
    results = {
        'passed': 0,
        'failed': 0,
        'total': 0
    }
    
    # Test 1: File existence
    print_header("Test 1: File Existence")
    tests = [
        ('js/modules/api.js', 5000),
        ('API_DOCUMENTATION.md', 5000)
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
    if test_javascript_syntax('js/modules/api.js'):
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 3: API module structure
    print_header("Test 3: API Module Structure")
    results['total'] += 1
    if test_api_module_structure():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 4: Endpoints structure
    print_header("Test 4: Endpoints Structure")
    results['total'] += 1
    if test_endpoints_structure():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 5: Rate limiting
    print_header("Test 5: Rate Limiting")
    results['total'] += 1
    if test_rate_limiting():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 6: Authentication
    print_header("Test 6: Authentication")
    results['total'] += 1
    if test_authentication():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 7: Error handling
    print_header("Test 7: Error Handling")
    results['total'] += 1
    if test_error_handling():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 8: HTTP client
    print_header("Test 8: HTTP Client")
    results['total'] += 1
    if test_http_client():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 9: API documentation
    print_header("Test 9: API Documentation")
    results['total'] += 1
    if test_api_documentation():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 10: Security features
    print_header("Test 10: Security Features")
    results['total'] += 1
    if test_security_features():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 11: HTML integration
    print_header("Test 11: HTML Integration")
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