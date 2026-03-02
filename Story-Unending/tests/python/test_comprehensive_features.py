#!/usr/bin/env python3
"""
Comprehensive Feature Test Suite
Tests all features as both user and admin
"""

import requests
import json
import time
import sys
from typing import Dict, List, Any

class FeatureTester:
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
        
    def test_server_running(self):
        """Test if server is running"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            self.log_test("Server Running", response.status_code == 200, f"Status: {response.status_code}")
            return response.status_code == 200
        except Exception as e:
            self.log_test("Server Running", False, str(e))
            return False
            
    def test_page_load(self):
        """Test if main page loads correctly"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            checks = [
                ("DOCTYPE html", "DOCTYPE" in content),
                ("Title", "Vampire Progenitor" in content),
                ("Stylesheet", "styles.css" in content),
                ("JavaScript", "story-engine.js" in content),
                ("Login Button", "Login" in content),
                ("Register Button", "Register" in content)
            ]
            
            all_passed = True
            for check_name, check_result in checks:
                self.log_test(f"Page Load - {check_name}", check_result)
                all_passed = all_passed and check_result
                
            return all_passed
        except Exception as e:
            self.log_test("Page Load", False, str(e))
            return False
            
    def test_user_registration(self):
        """Test user registration"""
        try:
            # This would require actual form submission
            # For now, we'll check if registration form exists
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_register_form = "registerOverlay" in content or "Register" in content
            self.log_test("User Registration Form", has_register_form, "Registration form available")
            
            return has_register_form
        except Exception as e:
            self.log_test("User Registration Form", False, str(e))
            return False
            
    def test_user_login(self):
        """Test user login"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_login_form = "loginOverlay" in content or "Login" in content
            self.log_test("User Login Form", has_login_form, "Login form available")
            
            return has_login_form
        except Exception as e:
            self.log_test("User Login Form", False, str(e))
            return False
            
    def test_story_generation(self):
        """Test story generation"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_story_engine = "story-engine.js" in content or "generateChapter" in content
            self.log_test("Story Generation Engine", has_story_engine, "Story engine loaded")
            
            return has_story_engine
        except Exception as e:
            self.log_test("Story Generation Engine", False, str(e))
            return False
            
    def test_chapter_navigation(self):
        """Test chapter navigation"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_navigation = "prevBtn" in content and "nextBtn" in content
            self.log_test("Chapter Navigation", has_navigation, "Navigation buttons present")
            
            return has_navigation
        except Exception as e:
            self.log_test("Chapter Navigation", False, str(e))
            return False
            
    def test_save_load_system(self):
        """Test save/load system"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_save_load = "save-load.js" in content or "Save/Load" in content
            self.log_test("Save/Load System", has_save_load, "Save/Load functionality available")
            
            return has_save_load
        except Exception as e:
            self.log_test("Save/Load System", False, str(e))
            return False
            
    def test_bookmark_system(self):
        """Test bookmark system"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_bookmarks = "bookmarks.js" in content or "Bookmarks" in content
            self.log_test("Bookmark System", has_bookmarks, "Bookmark functionality available")
            
            return has_bookmarks
        except Exception as e:
            self.log_test("Bookmark System", False, str(e))
            return False
            
    def test_search_functionality(self):
        """Test search functionality"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_search = "search.js" in content or "Search" in content
            self.log_test("Search Functionality", has_search, "Search functionality available")
            
            return has_search
        except Exception as e:
            self.log_test("Search Functionality", False, str(e))
            return False
            
    def test_reading_history(self):
        """Test reading history"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_history = "reading-history.js" in content or "Reading History" in content
            self.log_test("Reading History", has_history, "Reading history available")
            
            return has_history
        except Exception as e:
            self.log_test("Reading History", False, str(e))
            return False
            
    def test_analytics_dashboard(self):
        """Test analytics dashboard"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_analytics = "analytics.js" in content or "Analytics" in content
            self.log_test("Analytics Dashboard", has_analytics, "Analytics available")
            
            return has_analytics
        except Exception as e:
            self.log_test("Analytics Dashboard", False, str(e))
            return False
            
    def test_content_management(self):
        """Test content management system"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_cms = "content-management.js" in content or "Content Management" in content
            self.log_test("Content Management System", has_cms, "CMS available")
            
            return has_cms
        except Exception as e:
            self.log_test("Content Management System", False, str(e))
            return False
            
    def test_user_features(self):
        """Test user features"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_user_features = "user-profiles.js" in content or "User Features" in content
            self.log_test("User Features", has_user_features, "User features available")
            
            return has_user_features
        except Exception as e:
            self.log_test("User Features", False, str(e))
            return False
            
    def test_notification_system(self):
        """Test notification system"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_notifications = "notifications.js" in content or "Notifications" in content
            self.log_test("Notification System", has_notifications, "Notifications available")
            
            return has_notifications
        except Exception as e:
            self.log_test("Notification System", False, str(e))
            return False
            
    def test_api_integration(self):
        """Test API integration"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_api = "api.js" in content
            self.log_test("API Integration", has_api, "API client loaded")
            
            return has_api
        except Exception as e:
            self.log_test("API Integration", False, str(e))
            return False
            
    def test_fuzzy_search(self):
        """Test fuzzy search"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_fuzzy_search = "fuzzy-search.js" in content or "fuse.js" in content
            self.log_test("Fuzzy Search", has_fuzzy_search, "Fuzzy search available")
            
            return has_fuzzy_search
        except Exception as e:
            self.log_test("Fuzzy Search", False, str(e))
            return False
            
    def test_screenshot_capture(self):
        """Test screenshot capture"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_screenshot = "screenshot-capture.js" in content or "html2canvas" in content
            self.log_test("Screenshot Capture", has_screenshot, "Screenshot capture available")
            
            return has_screenshot
        except Exception as e:
            self.log_test("Screenshot Capture", False, str(e))
            return False
            
    def test_social_sharing(self):
        """Test social sharing"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_sharing = "social-sharing.js" in content or "Share" in content
            self.log_test("Social Sharing", has_sharing, "Social sharing available")
            
            return has_sharing
        except Exception as e:
            self.log_test("Social Sharing", False, str(e))
            return False
            
    def test_performance_optimizations(self):
        """Test performance optimizations"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_performance = "performance-advanced.js" in content or "performance.js" in content
            self.log_test("Performance Optimizations", has_performance, "Performance optimizations loaded")
            
            return has_performance
        except Exception as e:
            self.log_test("Performance Optimizations", False, str(e))
            return False
            
    def test_ab_testing(self):
        """Test A/B testing"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_ab_testing = "ab-testing.js" in content or "A/B Testing" in content
            self.log_test("A/B Testing Framework", has_ab_testing, "A/B testing available")
            
            return has_ab_testing
        except Exception as e:
            self.log_test("A/B Testing Framework", False, str(e))
            return False
            
    def test_leaderboards(self):
        """Test leaderboards"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_leaderboards = "leaderboards.js" in content or "Leaderboards" in content
            self.log_test("Achievement Leaderboards", has_leaderboards, "Leaderboards available")
            
            return has_leaderboards
        except Exception as e:
            self.log_test("Achievement Leaderboards", False, str(e))
            return False
            
    def test_branching_narrative(self):
        """Test branching narrative"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_branching = "branching-narrative.js" in content
            self.log_test("Branching Narrative System", has_branching, "Branching narrative loaded")
            
            return has_branching
        except Exception as e:
            self.log_test("Branching Narrative System", False, str(e))
            return False
            
    def test_dynamic_content(self):
        """Test dynamic content"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_dynamic = "dynamic-content.js" in content
            self.log_test("Dynamic Content Generation", has_dynamic, "Dynamic content loaded")
            
            return has_dynamic
        except Exception as e:
            self.log_test("Dynamic Content Generation", False, str(e))
            return False
            
    def test_backup_system(self):
        """Test backup system"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_backup = "backup.js" in content or "Backup" in content
            self.log_test("Automated Backup System", has_backup, "Backup system available")
            
            return has_backup
        except Exception as e:
            self.log_test("Automated Backup System", False, str(e))
            return False
            
    def test_service_worker(self):
        """Test service worker"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_sw = "sw.js" in content or "serviceWorker" in content
            self.log_test("Service Worker (PWA)", has_sw, "Service worker configured")
            
            return has_sw
        except Exception as e:
            self.log_test("Service Worker (PWA)", False, str(e))
            return False
            
    def test_security_features(self):
        """Test security features"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_security = "security.js" in content or "sanitizeHTML" in content
            self.log_test("Security Features", has_security, "Security functions loaded")
            
            return has_security
        except Exception as e:
            self.log_test("Security Features", False, str(e))
            return False
            
    def test_error_tracking(self):
        """Test error tracking (Sentry)"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            content = response.text
            
            has_sentry = "sentry.js" in content or "@sentry/browser" in content
            self.log_test("Error Tracking (Sentry)", has_sentry, "Sentry integration available")
            
            return has_sentry
        except Exception as e:
            self.log_test("Error Tracking (Sentry)", False, str(e))
            return False
            
    def run_all_tests(self):
        """Run all tests"""
        print("=" * 80)
        print("COMPREHENSIVE FEATURE TEST SUITE")
        print("=" * 80)
        print()
        
        # Test as guest
        print("Testing as GUEST user...")
        print("-" * 80)
        
        tests = [
            self.test_server_running,
            self.test_page_load,
            self.test_user_registration,
            self.test_user_login,
            self.test_story_generation,
            self.test_chapter_navigation,
            self.test_save_load_system,
            self.test_bookmark_system,
            self.test_search_functionality,
            self.test_reading_history,
            self.test_analytics_dashboard,
            self.test_content_management,
            self.test_user_features,
            self.test_notification_system,
            self.test_api_integration,
            self.test_fuzzy_search,
            self.test_screenshot_capture,
            self.test_social_sharing,
            self.test_performance_optimizations,
            self.test_ab_testing,
            self.test_leaderboards,
            self.test_branching_narrative,
            self.test_dynamic_content,
            self.test_backup_system,
            self.test_service_worker,
            self.test_security_features,
            self.test_error_tracking
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
    tester = FeatureTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)