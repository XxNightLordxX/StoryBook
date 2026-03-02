#!/usr/bin/env python3
"""
Update index.html to implement code splitting.
Remove lazy-loaded script tags and add lazy-loader.js.
"""

import re

# Read index.html
with open('index.html', 'r') as f:
    html_content = f.read()

# Script tags to remove (lazy-loaded modules)
scripts_to_remove = [
    'js/modules/admin.js',
    'js/modules/analytics.js',
    'js/ui/analytics-ui.js',
    'js/modules/bookmarks.js',
    'js/ui/bookmarks-ui.js',
    'js/modules/search.js',
    'js/ui/search-ui.js',
    'js/modules/save-load.js',
    'js/ui/save-load-ui.js',
    'js/modules/reading-history.js',
    'js/ui/reading-history-ui.js',
    'js/modules/performance.js',
    'js/ui/performance-ui.js',
    'js/modules/content-management.js',
    'js/ui/content-management-ui.js',
    'js/modules/user-profiles.js',
    'js/modules/user-preferences.js',
    'js/modules/achievements.js',
    'js/modules/social-features.js',
    'js/modules/messaging.js',
    'js/ui/user-features-ui.js',
    'js/modules/notifications.js',
    'js/ui/notifications-ui.js',
    'js/modules/api.js',
    'js/modules/branching-narrative.js',
    'js/modules/dynamic-content.js',
    'js/modules/generation.js',
    'js/modules/donation.js',
    'js/modules/directive.js',
    'js/modules/reset-password.js',
    'js/modules/misc.js',
    'js/ui/sidebar.js',
    'js/ui/stats.js',
]

# CSS files to remove (lazy-loaded)
css_to_remove = [
    'css/analytics.css',
    'css/bookmarks.css',
    'css/search.css',
    'css/save-load.css',
    'css/reading-history.css',
    'css/performance.css',
    'css/content-management.css',
    'css/user-features.css',
    'css/notifications.css',
]

# Remove lazy-loaded script tags
for script in scripts_to_remove:
    pattern = rf'<script src="{re.escape(script)}"></script>\s*'
    html_content = re.sub(pattern, '', html_content)

# Remove lazy-loaded CSS links
for css in css_to_remove:
    pattern = rf'<link rel="stylesheet" href="{re.escape(css)}">\s*'
    html_content = re.sub(pattern, '', html_content)

# Add lazy-loader.js after critical utilities
lazy_loader_script = '<script src="js/utils/lazy-loader.js"></script>'
# Find the position after ui-helpers.js
pattern = r'(<script src="js/utils/ui-helpers.js"></script>)'
replacement = r'\1\n    ' + lazy_loader_script
html_content = re.sub(pattern, replacement, html_content)

# Write updated index.html
with open('index.html', 'w') as f:
    f.write(html_content)

print("✅ Updated index.html for code splitting")
print("\n📊 Changes:")
print(f"  - Removed {len(scripts_to_remove)} lazy-loaded script tags")
print(f"  - Removed {len(css_to_remove)} lazy-loaded CSS links")
print(f"  - Added lazy-loader.js")
print("\n📋 Next: Update UI components to use LazyLoader.loadModule()")