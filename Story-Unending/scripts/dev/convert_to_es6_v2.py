#!/usr/bin/env python3
"""
Convert existing module pattern to ES6 modules
Handles the pattern: const Module = { ... }; window.Module = Module;
"""

import re
from pathlib import Path

def convert_to_es6(content, module_name):
    """Convert module pattern to ES6"""
    
    # Remove the outer IIFE wrapper
    # Pattern: (function() { ... })();
    content = re.sub(r'^\(function\(\)\s*\{\s*', '', content, count=1)
    content = re.sub(r'\}\)\(\);$', '', content, count=1)
    
    # Find the module object definition
    # Pattern: const ModuleName = { ... };
    module_pattern = rf'const\s+{module_name}\s*=\s*\{{([^}}]+)\}};'
    
    def replace_module(match):
        exports = match.group(1)
        
        # Convert to named exports
        export_lines = []
        for line in exports.split(','):
            line = line.strip()
            if line and ':' in line:
                export_lines.append(f'export {line};')
        
        return '\n'.join(export_lines)
    
    content = re.sub(module_pattern, replace_module, content)
    
    # Remove window.Module = Module; export
    content = re.sub(rf'window\.{module_name}\s*=\s*{module_name};', '', content)
    
    # Remove module.exports = Module; export
    content = re.sub(rf'module\.exports\s*=\s*{module_name};', '', content)
    
    # Remove if (typeof window !== 'undefined') { ... } blocks
    content = re.sub(r'if\s*\(typeof\s+window\s*!==\s*[\'"]undefined[\'"]\)\s*\{[^}]*\}', '', content)
    
    # Remove if (typeof module !== 'undefined' && module.exports) { ... } blocks
    content = re.sub(r'if\s*\(typeof\s+module\s*!==\s*[\'"]undefined[\'"]\s*&&\s*module\.exports\)\s*\{[^}]*\}', '', content)
    
    # Clean up extra whitespace
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    return content

def add_imports(content, dependencies):
    """Add import statements for dependencies"""
    
    if not dependencies:
        return content
    
    import_lines = []
    
    # Map dependencies to their file paths
    dep_map = {
        'ErrorHandler': './utils/security.js',
        'Storage': './utils/storage.js',
        'Security': './utils/security.js',
        'Sentry': './utils/sentry.js',
        'LazyLoader': './utils/lazy-loader.js',
        'AppStateModule': './modules/app-state.js',
        'Auth': './modules/auth.js',
        'Navigation': './modules/navigation.js',
        'Admin': './modules/admin.js',
        'Generation': './modules/generation.js',
        'StoryTimeline': './modules/story-timeline.js',
        'Initialization': './modules/initialization.js',
        'Analytics': './modules/analytics.js',
        'ContentManagement': './modules/content-management.js',
        'UserProfiles': './modules/user-profiles.js',
        'UserPreferences': './modules/user-preferences.js',
        'Achievements': './modules/achievements.js',
        'SocialFeatures': './modules/social-features.js',
        'Messaging': './modules/messaging.js',
        'Notifications': './modules/notifications.js',
        'Search': './modules/search.js',
        'FuzzySearch': './modules/fuzzy-search.js',
        'SearchSuggestions': './modules/search-suggestions.js',
        'SaveLoad': './modules/save-load.js',
        'BackupSystem': './modules/backup.js',
        'Bookmarks': './modules/bookmarks.js',
        'ReadingHistory': './modules/reading-history.js',
        'Performance': './modules/performance.js',
        'PerformanceAdvanced': './modules/performance-advanced.js',
        'ScreenshotCapture': './modules/screenshot-capture.js',
        'SocialSharing': './modules/social-sharing.js',
        'API': './modules/api.js',
        'UIModals': './ui/modals.js',
        'UIDropdown': './ui/dropdown.js',
        'UINotifications': './ui/notifications.js',
        'UISidebar': './ui/sidebar.js',
        'UITextSize': './ui/text-size.js',
        'UIStats': './ui/stats.js',
        'PerformanceUI': './ui/performance-ui.js',
        'SearchUI': './ui/search-ui.js',
        'SearchUIEnhanced': './ui/search-ui-enhanced.js',
        'BookmarksUI': './ui/bookmarks-ui.js',
        'SaveLoadUI': './ui/save-load-ui.js',
        'ReadingHistoryUI': './ui/reading-history-ui.js',
        'AnalyticsUI': './ui/analytics-ui.js',
        'ContentManagementUI': './ui/content-management-ui.js',
        'UserFeaturesUI': './ui/user-features-ui.js',
        'NotificationsUI': './ui/notifications-ui.js',
        'BackupUI': './ui/backup-ui.js',
        'ScreenshotUI': './ui/screenshot-ui.js',
        'SocialSharingUI': './ui/social-sharing-ui.js',
    }
    
    for dep in dependencies:
        if dep in dep_map:
            import_lines.append(f'import {dep} from "{dep_map[dep]}";')
    
    if import_lines:
        imports = '\n'.join(import_lines) + '\n\n'
        content = imports + content
    
    return content

def detect_dependencies(content):
    """Detect dependencies from content"""
    
    dependencies = set()
    
    # Find references to ErrorHandler, Storage, etc.
    patterns = [
        r'\bErrorHandler\.',
        r'\bStorage\.',
        r'\bSecurity\.',
        r'\bSentry\.',
        r'\bLazyLoader\.',
        r'\bAppStateModule\.',
        r'\bAuth\.',
        r'\bNavigation\.',
        r'\bAdmin\.',
        r'\bGeneration\.',
        r'\bStoryTimeline\.',
        r'\bInitialization\.',
        r'\bAnalytics\.',
        r'\bContentManagement\.',
        r'\bUserProfiles\.',
        r'\bUserPreferences\.',
        r'\bAchievements\.',
        r'\bSocialFeatures\.',
        r'\bMessaging\.',
        r'\bNotifications\.',
        r'\bSearch\.',
        r'\bFuzzySearch\.',
        r'\bSearchSuggestions\.',
        r'\bSaveLoad\.',
        r'\bBackupSystem\.',
        r'\bBookmarks\.',
        r'\bReadingHistory\.',
        r'\bPerformance\.',
        r'\bPerformanceAdvanced\.',
        r'\bScreenshotCapture\.',
        r'\bSocialSharing\.',
        r'\bAPI\.',
        r'\bUIModals\.',
        r'\bUIDropdown\.',
        r'\bUINotifications\.',
        r'\bUISidebar\.',
        r'\bUITextSize\.',
        r'\bUIStats\.',
        r'\bPerformanceUI\.',
        r'\bSearchUI\.',
        r'\bSearchUIEnhanced\.',
        r'\bBookmarksUI\.',
        r'\bSaveLoadUI\.',
        r'\bReadingHistoryUI\.',
        r'\bAnalyticsUI\.',
        r'\bContentManagementUI\.',
        r'\bUserFeaturesUI\.',
        r'\bNotificationsUI\.',
        r'\bBackupUI\.',
        r'\bScreenshotUI\.',
        r'\bSocialSharingUI\.',
    ]
    
    for pattern in patterns:
        if re.search(pattern, content):
            dep_name = pattern.replace(r'\b', '').replace('.', '')
            dependencies.add(dep_name)
    
    return sorted(dependencies)

def convert_module(file_path, module_name):
    """Convert a single module"""
    
    content = file_path.read_text()
    
    # Detect dependencies
    dependencies = detect_dependencies(content)
    
    # Convert to ES6
    content = convert_to_es6(content, module_name)
    
    # Add imports
    content = add_imports(content, dependencies)
    
    return content, dependencies

def main():
    """Main conversion function"""
    
    print("=" * 80)
    print("ES6 Module Conversion - Phase 1")
    print("=" * 80)
    
    # Convert utility modules first (no dependencies)
    utility_modules = [
        ('js/utils/security.js', 'Security'),
        ('js/utils/storage.js', 'Storage'),
        ('js/utils/lazy-loader.js', 'LazyLoader'),
    ]
    
    converted_count = 0
    failed_count = 0
    
    for file_path, module_name in utility_modules:
        print(f"\nConverting: {file_path}")
        
        try:
            path = Path(f"/workspace/{file_path}")
            if not path.exists():
                print(f"  ⚠️  File not found, skipping")
                failed_count += 1
                continue
            
            # Create backup
            backup_path = path.with_suffix('.js.backup')
            path.rename(backup_path)
            
            # Convert module
            converted_content, dependencies = convert_module(backup_path, module_name)
            
            # Write converted content
            path.write_text(converted_content)
            
            print(f"  ✅ Converted successfully")
            if dependencies:
                print(f"  📦 Dependencies: {', '.join(dependencies)}")
            converted_count += 1
            
        except Exception as e:
            print(f"  ❌ Failed: {e}")
            failed_count += 1
            # Restore backup if exists
            if backup_path.exists():
                backup_path.rename(path)
    
    print(f"\n{'=' * 80}")
    print(f"Conversion Complete")
    print(f"{'=' * 80}")
    print(f"Converted: {converted_count}")
    print(f"Failed: {failed_count}")
    print(f"Total: {len(utility_modules)}")
    
    return 0 if failed_count == 0 else 1

if __name__ == "__main__":
    exit(main())