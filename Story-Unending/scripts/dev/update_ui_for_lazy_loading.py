#!/usr/bin/env python3
"""
Update UI components to use LazyLoader for dynamic module loading.
"""

import re

# Mapping of button onclick handlers to modules
button_mappings = {
    'AnalyticsUI.openModal()': 'analytics',
    'ContentManagementUI.openModal()': 'content-management',
    'UserFeaturesUI.openModal()': 'user-features',
    'NotificationsUI.openModal()': 'notifications',
    'SaveLoadUI.openModal()': 'save-load',
    'BookmarksUI.openModal()': 'bookmarks',
    'SearchUI.openModal()': 'search',
    'ReadingHistoryUI.openModal()': 'reading-history',
    'PerformanceUI.openModal()': 'performance',
}

# Read index.html
with open('index.html', 'r') as f:
    html_content = f.read()

# Update button onclick handlers to use lazy loading
for original_handler, module_name in button_mappings.items():
    # Pattern to match the button with the handler
    pattern = rf'(onclick=["\']{re.escape(original_handler)}["\'])'
    
    # Create new handler that loads module first
    new_handler = f'onclick="LazyLoader.loadModule(\'{module_name}\').then(() => {{ {original_handler} }}).catch(err => console.error(err))"'
    
    html_content = re.sub(pattern, new_handler, html_content)

# Write updated index.html
with open('index.html', 'w') as f:
    f.write(html_content)

print("✅ Updated UI components for lazy loading")
print("\n📊 Updated buttons:")
for original_handler, module_name in button_mappings.items():
    print(f"  - {module_name}: {original_handler}")

print("\n📋 Next: Configure Vite for code splitting")