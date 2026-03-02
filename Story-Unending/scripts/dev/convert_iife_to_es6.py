#!/usr/bin/env python3
"""
Convert IIFE modules to ES6 modules
Converts (function(window) { ... })(window) pattern to ES6 import/export
"""

import re
from pathlib import Path

def convert_iife_to_es6(content, module_name):
    """Convert IIFE pattern to ES6 module"""
    
    # Remove IIFE wrapper
    # Pattern: (function(window) { 'use strict'; ... })(window);
    iife_start = r'\(function\s*\([^)]*\)\s*\{[\'"]use strict[\'"];\s*'
    iife_end = r'\}\)\(window\);'
    
    # Remove IIFE start
    content = re.sub(iife_start, '', content, count=1)
    
    # Remove IIFE end
    content = re.sub(iife_end, '', content, count=1)
    
    # Replace window.Namespace exports with named exports
    # Pattern: window.Namespace = { ... }
    export_pattern = r'window\.(\w+)\s*=\s*\{([^}]+)\};'
    
    def replace_exports(match):
        namespace = match.group(1)
        exports = match.group(2)
        
        # Convert to named exports
        # Remove quotes from keys
        exports = re.sub(r"'([^']+)':\s*", r'\1: ', exports)
        exports = re.sub(r'"([^"]+)":\s*', r'\1: ', exports)
        
        # Split by comma and create export statements
        export_lines = []
        for line in exports.split(','):
            line = line.strip()
            if line and ':' in line:
                export_lines.append(f'export {line};')
        
        return '\n'.join(export_lines)
    
    content = re.sub(export_pattern, replace_exports, content)
    
    # Replace simple window.Namespace = object
    simple_export_pattern = r'window\.(\w+)\s*=\s*(\w+);'
    
    def replace_simple_exports(match):
        namespace = match.group(1)
        obj_name = match.group(2)
        return f'export default {obj_name};'
    
    content = re.sub(simple_export_pattern, replace_simple_exports, content)
    
    # Replace window.Namespace references with imports
    # This will be handled by adding import statements at the top
    
    return content

def add_import_statements(content, dependencies):
    """Add import statements for dependencies"""
    
    if not dependencies:
        return content
    
    import_lines = []
    
    # Map dependencies to their file paths
    dep_map = {
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

def convert_module(file_path, module_name, dependencies):
    """Convert a single module"""
    
    content = file_path.read_text()
    
    # Convert IIFE to ES6
    content = convert_iife_to_es6(content, module_name)
    
    # Add import statements
    content = add_import_statements(content, dependencies)
    
    return content

def main():
    """Main conversion function"""
    
    # Read analysis
    analysis_file = Path("/workspace/IIFE_ANALYSIS.md")
    
    print("=" * 80)
    print("ES6 Module Conversion")
    print("=" * 80)
    
    # Convert modules (starting with simple ones - no dependencies)
    simple_modules = [
        ('js/utils/storage.js', 'Storage', []),
        ('js/utils/security.js', 'Security', []),
        ('js/utils/lazy-loader.js', 'LazyLoader', []),
        ('js/modules/app-state.js', 'AppStateModule', []),
        ('js/modules/auth.js', 'Auth', []),
        ('js/modules/navigation.js', 'Navigation', []),
        ('js/modules/admin.js', 'Admin', []),
        ('js/modules/generation.js', 'Generation', []),
        ('js/modules/story-timeline.js', 'StoryTimeline', []),
        ('js/modules/initialization.js', 'Initialization', []),
    ]
    
    converted_count = 0
    failed_count = 0
    
    for file_path, module_name, dependencies in simple_modules:
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
            converted_content = convert_module(backup_path, module_name, dependencies)
            
            # Write converted content
            path.write_text(converted_content)
            
            print(f"  ✅ Converted successfully")
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
    print(f"Total: {len(simple_modules)}")
    
    return 0 if failed_count == 0 else 1

if __name__ == "__main__":
    exit(main())