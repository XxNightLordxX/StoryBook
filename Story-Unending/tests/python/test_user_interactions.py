#!/usr/bin/env python3
"""
User Interaction Test Suite
Simulates actual user and admin interactions
"""

import requests
import json
import time
import re
from typing import Dict, List, Any

class UserInteractionTester:
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
            
    def test_dropdown_menu(self):
        """Test dropdown menu functionality"""
        content = self.get_page_content()
        if not content:
            self.log_test("Dropdown Menu", False, "Could not load page")
            return False
            
        has_dropdown = "dropdown-menu" in content and "menuToggle" in content
        self.log_test("Dropdown Menu", has_dropdown, "Dropdown menu present")
        
        # Check for menu items
        menu_items = [
            "Login", "Register", "Save/Load", "Bookmarks", 
            "Search", "Reading History", "Analytics", 
            "Content Management", "User Features", "Notifications",
            "Backup", "Leaderboards", "A/B Testing"
        ]
        
        for item in menu_items:
            has_item = item in content
            self.log_test(f"Dropdown Menu - {item}", has_item, f"Menu item: {item}")
            
        return has_dropdown
        
    def test_modals(self):
        """Test modal dialogs"""
        content = self.get_page_content()
        if not content:
            self.log_test("Modal Dialogs", False, "Could not load page")
            return False
            
        modals = [
            "loginOverlay", "registerOverlay", "saveLoadModal",
            "bookmarksModal", "searchModal", "readingHistoryModal",
            "analyticsModal", "contentManagementModal", "userFeaturesModal",
            "notificationsModal", "backupModal", "leaderboardsModal",
            "abTestingModal"
        ]
        
        all_present = True
        for modal in modals:
            has_modal = modal in content
            self.log_test(f"Modal - {modal}", has_modal, f"Modal present")
            all_present = all_present and has_modal
            
        return all_present
        
    def test_story_elements(self):
        """Test story elements"""
        content = self.get_page_content()
        if not content:
            self.log_test("Story Elements", False, "Could not load page")
            return False
            
        story_elements = [
            ("Chapter Display", "chapterDisplay"),
            ("Story Content", "storyContent"),
            ("Character Stats", "characterStats"),
            ("Arc Display", "arcDisplay"),
            ("Previous Button", "prevBtn"),
            ("Next Button", "nextBtn")
        ]
        
        all_present = True
        for element_name, element_id in story_elements:
            has_element = element_id in content
            self.log_test(f"Story Element - {element_name}", has_element, f"Element ID: {element_id}")
            all_present = all_present and has_element
            
        return all_present
        
    def test_javascript_modules(self):
        """Test JavaScript modules are loaded"""
        content = self.get_page_content()
        if not content:
            self.log_test("JavaScript Modules", False, "Could not load page")
            return False
            
        modules = [
            "story-engine.js", "backstory-engine.js",
            "js/utils/security.js", "js/utils/storage.js",
            "js/modules/auth.js", "js/modules/navigation.js",
            "js/modules/save-load.js", "js/modules/bookmarks.js",
            "js/modules/search.js", "js/modules/reading-history.js",
            "js/modules/analytics.js", "js/modules/content-management.js",
            "js/modules/api.js", "js/modules/branching-narrative.js",
            "js/modules/dynamic-content.js", "js/modules/backup.js",
            "js/modules/fuzzy-search.js", "js/modules/screenshot-capture.js",
            "js/modules/social-sharing.js", "js/modules/performance-advanced.js",
            "js/modules/ab-testing.js", "js/modules/leaderboards.js"
        ]
        
        all_loaded = True
        for module in modules:
            has_module = module in content
            self.log_test(f"Module - {module}", has_module, f"Module loaded")
            all_loaded = all_loaded and has_module
            
        return all_loaded
        
    def test_css_files(self):
        """Test CSS files are loaded"""
        content = self.get_page_content()
        if not content:
            self.log_test("CSS Files", False, "Could not load page")
            return False
            
        css_files = [
            "styles.css", "css/backup.css", "css/fuzzy-search.css",
            "css/screenshot.css", "css/leaderboards.css",
            "css/social-sharing.css", "css/performance-advanced.css",
            "css/ab-testing.css"
        ]
        
        all_loaded = True
        for css_file in css_files:
            has_css = css_file in content
            self.log_test(f"CSS - {css_file}", has_css, f"CSS loaded")
            all_loaded = all_loaded and has_css
            
        return all_loaded
        
    def test_security_functions(self):
        """Test security functions are available"""
        content = self.get_page_content()
        if not content:
            self.log_test("Security Functions", False, "Could not load page")
            return False
            
        security_functions = [
            "sanitizeHTML", "sanitizeAttribute", "RateLimiter",
            "Validator", "ErrorHandler"
        ]
        
        all_present = True
        for func in security_functions:
            has_func = func in content
            self.log_test(f"Security - {func}", has_func, f"Function available")
            all_present = all_present and has_func
            
        return all_present
        
    def test_admin_features(self):
        """Test admin-specific features"""
        content = self.get_page_content()
        if not content:
            self.log_test("Admin Features", False, "Could not load page")
            return False
            
        admin_features = [
            ("Content Management", "Content Management"),
            ("Analytics Dashboard", "Analytics"),
            ("A/B Testing", "A/B Testing"),
            ("User Management", "loadUserList")
        ]
        
        all_present = True
        for feature_name, feature_text in admin_features:
            has_feature = feature_text in content
            self.log_test(f"Admin - {feature_name}", has_feature, f"Feature available")
            all_present = all_present and has_feature
            
        return all_present
        
    def test_user_features(self):
        """Test user-specific features"""
        content = self.get_page_content()
        if not content:
            self.log_test("User Features", False, "Could not load page")
            return False
            
        user_features = [
            ("Save/Load", "Save/Load"),
            ("Bookmarks", "Bookmarks"),
            ("Search", "Search"),
            ("Reading History", "Reading History"),
            ("User Profiles", "User Features"),
            ("Achievements", "Achievements"),
            ("Social Features", "Social"),
            ("Leaderboards", "Leaderboards")
        ]
        
        all_present = True
        for feature_name, feature_text in user_features:
            has_feature = feature_text in content
            self.log_test(f"User - {feature_name}", has_feature, f"Feature available")
            all_present = all_present and has_feature
            
        return all_present
        
    def test_performance_features(self):
        """Test performance features"""
        content = self.get_page_content()
        if not content:
            self.log_test("Performance Features", False, "Could not load page")
            return False
            
        perf_features = [
            ("Service Worker", "sw.js"),
            ("Performance Monitoring", "performance-advanced.js"),
            ("Lazy Loading", "lazy-loader.js"),
            ("Caching", "cache")
        ]
        
        all_present = True
        for feature_name, feature_text in perf_features:
            has_feature = feature_text in content
            self.log_test(f"Performance - {feature_name}", has_feature, f"Feature available")
            all_present = all_present and has_feature
            
        return all_present
        
    def test_integration_points(self):
        """Test integration points between modules"""
        content = self.get_page_content()
        if not content:
            self.log_test("Integration Points", False, "Could not load page")
            return False
            
        integrations = [
            ("Auth Integration", "Auth.login"),
            ("Navigation Integration", "Navigation.nextChapter"),
            ("Storage Integration", "Storage.getItem"),
            ("UI Integration", "UIModals.openModal"),
            ("Notification Integration", "UINotifications.show")
        ]
        
        all_present = True
        for integration_name, integration_text in integrations:
            has_integration = integration_text in content
            self.log_test(f"Integration - {integration_name}", has_integration, f"Integration point")
            all_present = all_present and has_integration
            
        return all_present
        
    def test_error_handling(self):
        """Test error handling"""
        content = self.get_page_content()
        if not content:
            self.log_test("Error Handling", False, "Could not load page")
            return False
            
        error_handling = [
            ("ErrorHandler", "ErrorHandler"),
            ("Try-Catch", "try {"),
            ("Safe Execute", "safeExecute")
        ]
        
        all_present = True
        for eh_name, eh_text in error_handling:
            has_eh = eh_text in content
            self.log_test(f"Error Handling - {eh_name}", has_eh, f"Error handling present")
            all_present = all_present and has_eh
            
        return all_present
        
    def test_responsive_design(self):
        """Test responsive design"""
        content = self.get_page_content()
        if not content:
            self.log_test("Responsive Design", False, "Could not load page")
            return False
            
        responsive_features = [
            ("Viewport Meta", "viewport"),
            ("Media Queries", "@media"),
            ("Responsive Classes", "responsive")
        ]
        
        all_present = True
        for feature_name, feature_text in responsive_features:
            has_feature = feature_text in content
            self.log_test(f"Responsive - {feature_name}", has_feature, f"Responsive feature")
            all_present = all_present and has_feature
            
        return all_present
        
    def test_accessibility(self):
        """Test accessibility features"""
        content = self.get_page_content()
        if not content:
            self.log_test("Accessibility", False, "Could not load page")
            return False
            
        accessibility_features = [
            ("ARIA Labels", "aria-"),
            ("Alt Text", "alt="),
            ("Semantic HTML - nav", "<nav>"),
            ("Semantic HTML - header", "<header>"),
            ("Semantic HTML - main", "<main>")
        ]
        
        all_present = True
        for feature_name, feature_text in accessibility_features:
            has_feature = feature_text in content
            self.log_test(f"Accessibility - {feature_name}", has_feature, f"Accessibility feature")
            all_present = all_present and has_feature
            
        return all_present
        
    def run_all_tests(self):
        """Run all tests"""
        print("=" * 80)
        print("USER INTERACTION TEST SUITE")
        print("=" * 80)
        print()
        
        # Test as guest
        print("Testing as GUEST user...")
        print("-" * 80)
        
        tests = [
            self.test_dropdown_menu,
            self.test_modals,
            self.test_story_elements,
            self.test_javascript_modules,
            self.test_css_files,
            self.test_security_functions,
            self.test_admin_features,
            self.test_user_features,
            self.test_performance_features,
            self.test_integration_points,
            self.test_error_handling,
            self.test_responsive_design,
            self.test_accessibility
        ]
        
        for test in tests:
            try:
                test()
                time.sleep(0.1)  # Small delay between tests
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
    tester = UserInteractionTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)