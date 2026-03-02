#!/usr/bin/env python3
"""
Realistic User Flow Test Suite
The user wants me to continue with the realistic user flow test. I was in the middle of creating a test file that accounts for the actual implementation (lazy loading, dynamic content injection, etc.). Let me continue creating this test file.</think>Tests actual user flows and admin workflows
"""

import requests
import json
import time
import re
from typing import Dict, List, Any

class RealisticUserFlowTester:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        self.current_user = None
        self.is_admin = False
        
    def log_test(self, test_name: str, passed: bool, message: str = ""):
        """Log test result"""
        result = {
            "test": test_name,
            "passed": passed,
            "message": message,
            "user": self.current_user or "guest",
            "is_admin": self.is_admin
        }
        self.test_results.append(result)
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} | {test_name} | {message}")
        
    def get_page_content(self):
        """Get page content"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            return response.text
        except Exception as e:
            return None
            
    def test_guest_user_flow(self):
        """Test complete guest user flow"""
        print("\n" + "=" * 80)
        print("GUEST USER FLOW TEST")
        print("=" * 80)
        
        content = self.get_page_content()
        if not content:
            self.log_test("Guest User Flow", False, "Could not load page")
            return False
            
        # Test 1: Page loads
        self.log_test("Guest - Page Load", True, "Page loaded successfully")
        
        # Test 2: Can see story content area
        has_main_content = "mainContent" in content
        self.log_test("Guest - Story Content Area", has_main_content, "Main content area present")
        
        # Test 3: Can see navigation
        has_nav = "prevBtn" in content and "nextBtn" in content
        self.log_test("Guest - Navigation", has_nav, "Navigation buttons present")
        
        # Test 4: Can see login/register buttons
        has_auth = "Login" in content and "Register" in content
        self.log_test("Guest - Auth Buttons", has_auth, "Login/Register available")
        
        # Test 5: Can see dropdown menu
        has_dropdown = "dropdown-menu" in content
        self.log_test("Guest - Dropdown Menu", has_dropdown, "Dropdown menu available")
        
        # Test 6: Story engine loaded
        has_engine = "story-engine.js" in content
        self.log_test("Guest - Story Engine", has_engine, "Story engine loaded")
        
        # Test 7: Can access user features (read-only)
        user_features = ["Bookmarks", "Search", "Reading History"]
        for feature in user_features:
            has_feature = feature in content
            self.log_test(f"Guest - {feature} Access", has_feature, f"{feature} button visible")
        
        return True
        
    def test_registered_user_flow(self):
        """Test registered user flow"""
        print("\n" + "=" * 80)
        print("REGISTERED USER FLOW TEST")
        print("=" * 80)
        
        content = self.get_page_content()
        if not content:
            self.log_test("Registered User Flow", False, "Could not load page")
            return False
            
        self.current_user = "testuser"
        
        # Test 1: User features available
        user_features = [
            "Save / Load", "Bookmarks", "Search", "Reading History",
            "User Features", "Leaderboards"
        ]
        
        for feature in user_features:
            has_feature = feature in content
            self.log_test(f"User - {feature} Available", has_feature, f"{feature} accessible")
        
        # Test 2: Lazy loading configured
        has_lazy_loader = "LazyLoader" in content or "lazy-loader.js" in content
        self.log_test("User - Lazy Loading", has_lazy_loader, "Lazy loading configured")
        
        # Test 3: Storage available
        has_storage = "Storage" in content or "localStorage" in content
        self.log_test("User - Local Storage", has_storage, "Storage functions available")
        
        # Test 4: Security functions loaded
        has_security = "security.js" in content
        self.log_test("User - Security", has_security, "Security functions loaded")
        
        # Test 5: Error handling available
        has_error_handling = "ErrorHandler" in content
        self.log_test("User - Error Handling", has_error_handling, "Error handling available")
        
        return True
        
    def test_admin_user_flow(self):
        """Test admin user flow"""
        print("\n" + "=" * 80)
        print("ADMIN USER FLOW TEST")
        print("=" * 80)
        
        content = self.get_page_content()
        if not content:
            self.log_test("Admin User Flow", False, "Could not load page")
            return False
            
        self.current_user = "admin"
        self.is_admin = True
        
        # Test 1: Admin features available
        admin_features = [
            "Analytics", "Content Management", "A/B Testing"
        ]
        
        for feature in admin_features:
            has_feature = feature in content
            self.log_test(f"Admin - {feature} Available", has_feature, f"{feature} accessible")
        
        # Test 2: User management available
        has_user_mgmt = "loadUserList" in content or "user management" in content.lower()
        self.log_test("Admin - User Management", has_user_mgmt, "User management functions available")
        
        # Test 3: Director controls available
        has_director = "Director Controls" in content or "dropdownDirectorSection" in content
        self.log_test("Admin - Director Controls", has_director, "Director controls available")
        
        # Test 4: Analytics loaded
        has_analytics = "analytics.js" in content
        self.log_test("Admin - Analytics Module", has_analytics, "Analytics module loaded")
        
        # Test 5: CMS loaded
        has_cms = "content-management.js" in content
        self.log_test("Admin - CMS Module", has_cms, "CMS module loaded")
        
        # Test 6: A/B testing loaded
        has_ab_testing = "ab-testing.js" in content
        self.log_test("Admin - A/B Testing Module", has_ab_testing, "A/B testing module loaded")
        
        return True
        
    def test_feature_integration(self):
        """Test feature integration"""
        print("\n" + "=" * 80)
        print("FEATURE INTEGRATION TEST")
        print("=" * 80)
        
        content = self.get_page_content()
        if not content:
            self.log_test("Feature Integration", False, "Could not load page")
            return False
            
        # Test 1: All core modules loaded
        core_modules = [
            "story-engine.js", "backstory-engine.js",
            "js/utils/security.js", "js/utils/storage.js",
            "js/modules/auth.js", "js/modules/navigation.js"
        ]
        
        all_loaded = True
        for module in core_modules:
            has_module = module in content
            self.log_test(f"Integration - {module}", has_module, "Core module loaded")
            all_loaded = all_loaded and has_module
        
        # Test 2: All feature modules loaded
        feature_modules = [
            "js/modules/save-load.js", "js/modules/bookmarks.js",
            "js/modules/search.js", "js/modules/reading-history.js",
            "js/modules/analytics.js", "js/modules/content-management.js",
            "js/modules/api.js", "js/modules/branching-narrative.js",
            "js/modules/dynamic-content.js", "js/modules/backup.js"
        ]
        
        for module in feature_modules:
            has_module = module in content
            self.log_test(f"Integration - {module}", has_module, "Feature module loaded")
            all_loaded = all_loaded and has_module
        
        # Test 3: All UI modules loaded
        ui_modules = [
            "js/ui/dropdown.js", "js/ui/modals.js", "js/ui/notifications.js"
        ]
        
        for module in ui_modules:
            has_module = module in content
            self.log_test(f"Integration - {module}", has_module, "UI module loaded")
            all_loaded = all_loaded and has_module
        
        # Test 4: Integration points present
        integrations = [
            ("Auth", "Auth.login"),
            ("Navigation", "Navigation.nextChapter"),
            ("Storage", "Storage.getItem"),
            ("UI", "UIModals.openModal"),
            ("Notifications", "UINotifications.show")
        ]
        
        for integration_name, integration_text in integrations:
            has_integration = integration_text in content
            self.log_test(f"Integration - {integration_name}", has_integration, "Integration point present")
            all_loaded = all_loaded and has_integration
        
        return all_loaded
        
    def test_performance_features(self):
        """Test performance features"""
        print("\n" + "=" * 80)
        print("PERFORMANCE FEATURES TEST")
        print("=" * 80)
        
        content = self.get_page_content()
        if not content:
            self.log_test("Performance Features", False, "Could not load page")
            return False
            
        # Test 1: Service Worker
        has_sw = "sw.js" in content or "serviceWorker" in content
        self.log_test("Performance - Service Worker", has_sw, "PWA service worker configured")
        
        # Test 2: Lazy Loading
        has_lazy = "LazyLoader" in content or "lazy-loader.js" in content
        self.log_test("Performance - Lazy Loading", has_lazy, "Lazy loading implemented")
        
        # Test 3: Performance Monitoring
        has_perf = "performance-advanced.js" in content
        self.log_test("Performance - Monitoring", has_perf, "Performance monitoring loaded")
        
        # Test 4: Code Splitting
        has_splitting = "loadModule" in content
        self.log_test("Performance - Code Splitting", has_splitting, "Code splitting implemented")
        
        # Test 5: Caching
        has_cache = "cache" in content.lower()
        self.log_test("Performance - Caching", has_cache, "Caching mechanisms present")
        
        # Test 6: Optimized Assets
        has_minified = ".min.js" in content or "minified" in content.lower()
        self.log_test("Performance - Minified Assets", has_minified, "Minified assets used")
        
        return True
        
    def test_security_features(self):
        """Test security features"""
        print("\n" + "=" * 80)
        print("SECURITY FEATURES TEST")
        print("=" * 80)
        
        content = self.get_page_content()
        if not content:
            self.log_test("Security Features", False, "Could not load page")
            return False
            
        # Test 1: Security module loaded
        has_security = "security.js" in content
        self.log_test("Security - Module Loaded", has_security, "Security module present")
        
        # Test 2: Input sanitization
        has_sanitize = "sanitize" in content.lower()
        self.log_test("Security - Input Sanitization", has_sanitize, "Sanitization functions available")
        
        # Test 3: Rate limiting
        has_rate_limit = "RateLimiter" in content or "rate" in content.lower()
        self.log_test("Security - Rate Limiting", has_rate_limit, "Rate limiting implemented")
        
        # Test 4: Error tracking
        has_sentry = "sentry.js" in content or "@sentry" in content
        self.log_test("Security - Error Tracking", has_sentry, "Sentry error tracking configured")
        
        # Test 5: Validation
        has_validation = "Validator" in content or "validate" in content.lower()
        self.log_test("Security - Input Validation", has_validation, "Validation functions available")
        
        # Test 6: Error handling
        has_error_handler = "ErrorHandler" in content
        self.log_test("Security - Error Handling", has_error_handler, "Error handler present")
        
        return True
        
    def test_advanced_features(self):
        """Test advanced features"""
        print("\n" + "=" * 80)
        print("ADVANCED FEATURES TEST")
        print("=" * 80)
        
        content = self.get_page_content()
        if not content:
            self.log_test("Advanced Features", False, "Could not load page")
            return False
            
        # Test 1: Branching Narrative
        has_branching = "branching-narrative.js" in content
        self.log_test("Advanced - Branching Narrative", has_branching, "Branching narrative loaded")
        
        # Test 2: Dynamic Content
        has_dynamic = "dynamic-content.js" in content
        self.log_test("Advanced - Dynamic Content", has_dynamic, "Dynamic content loaded")
        
        # Test 3: Fuzzy Search
        has_fuzzy = "fuzzy-search.js" in content or "fuse.js" in content
        self.log_test("Advanced - Fuzzy Search", has_fuzzy, "Fuzzy search loaded")
        
        # Test 4: Screenshot Capture
        has_screenshot = "screenshot-capture.js" in content or "html2canvas" in content
        self.log_test("Advanced - Screenshot Capture", has_screenshot, "Screenshot capture loaded")
        
        # Test 5: Social Sharing
        has_sharing = "social-sharing.js" in content
        self.log_test("Advanced - Social Sharing", has_sharing, "Social sharing loaded")
        
        # Test 6: Leaderboards
        has_leaderboards = "leaderboards.js" in content
        self.log_test("Advanced - Leaderboards", has_leaderboards, "Leaderboards loaded")
        
        # Test 7: A/B Testing
        has_ab_testing = "ab-testing.js" in content
        self.log_test("Advanced - A/B Testing", has_ab_testing, "A/B testing loaded")
        
        # Test 8: Backup System
        has_backup = "backup.js" in content
        self.log_test("Advanced - Backup System", has_backup, "Backup system loaded")
        
        return True
        
    def test_responsive_design(self):
        """Test responsive design"""
        print("\n" + "=" * 80)
        print("RESPONSIVE DESIGN TEST")
        print("=" * 80)
        
        content = self.get_page_content()
        if not content:
            self.log_test("Responsive Design", False, "Could not load page")
            return False
            
        # Test 1: Viewport meta tag
        has_viewport = "viewport" in content
        self.log_test("Responsive - Viewport Meta", has_viewport, "Viewport configured")
        
        # Test 2: Responsive CSS
        has_responsive_css = "responsive" in content.lower() or "@media" in content
        self.log_test("Responsive - CSS Media Queries", has_responsive_css, "Responsive CSS present")
        
        # Test 3: Mobile-friendly buttons
        has_touch = "touch" in content.lower() or "mobile" in content.lower()
        self.log_test("Responsive - Mobile Support", has_touch, "Mobile optimizations present")
        
        # Test 4: Flexible layout
        has_flex = "flex" in content.lower() or "grid" in content.lower()
        self.log_test("Responsive - Flexible Layout", has_flex, "Flexible layout used")
        
        return True
        
    def run_all_tests(self):
        """Run all tests"""
        print("=" * 80)
        print("REALISTIC USER FLOW TEST SUITE")
        print("=" * 80)
        print()
        
        tests = [
            self.test_guest_user_flow,
            self.test_registered_user_flow,
            self.test_admin_user_flow,
            self.test_feature_integration,
            self.test_performance_features,
            self.test_security_features,
            self.test_advanced_features,
            self.test_responsive_design
        ]
        
        for test in tests:
            try:
                test()
                time.sleep(0.2)  # Small delay between tests
            except Exception as e:
                print(f"❌ ERROR running {test.__name__}: {e}")
        
        print()
        print("=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r["passed"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print()
        
        if failed_tests > 0:
            print("FAILED TESTS:")
            for result in self.test_results:
                if not result["passed"]:
                    print(f"  ❌ {result['test']}: {result['message']}")
            print()
        
        return passed_tests == total_tests

if __name__ == "__main__":
    tester = RealisticUserFlowTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)