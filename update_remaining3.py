#!/usr/bin/env python3
import re
import os

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Pattern: element = document.getElementById('id');
    content = re.sub(
        r"(\w+)\s*=\s*document\.getElementById\('([^']+)'\);",
        r"\1 = DOMHelpers.safeGetElement('\2');",
        content
    )
    
    # Pattern: document.getElementById('prefix-' + variable)
    content = re.sub(
        r"document\.getElementById\('([^']+)'\s*\+\s*([^)]+)\)",
        r"DOMHelpers.safeGetElement('\1' + \2)",
        content
    )
    
    # Pattern: document.getElementById(variable)
    content = re.sub(
        r"document\.getElementById\(([^)]+)\)",
        r"DOMHelpers.safeGetElement(\1)",
        content
    )
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    # Count remaining document.getElementById calls
    remaining = len(re.findall(r"document\.getElementById", content))
    print(f"Updated {filepath} (pass 3). Remaining document.getElementById calls: {remaining}")
    return remaining

if __name__ == '__main__':
    files = [
        'Story-Unending/js/ui/user-features-ui.js',
        'Story-Unending/js/ui/content-management-ui.js',
        'Story-Unending/js/ui/notifications-ui.js',
        'Story-Unending/js/ui/analytics-ui.js',
        'Story-Unending/js/ui/bookmarks-ui.js',
        'Story-Unending/js/ui/leaderboards-ui.js',
        'Story-Unending/js/ui/reading-history-ui.js',
        'Story-Unending/js/ui/save-load-ui.js',
        'Story-Unending/js/ui/notifications.js',
        'Story-Unending/js/ui/modals.js',
        'Story-Unending/js/utils/ui-helpers.js',
        'Story-Unending/js/utils/prompt-modal.js'
    ]
    
    total_remaining = 0
    for filepath in files:
        if os.path.exists(filepath):
            remaining = update_file(filepath)
            total_remaining += remaining
        else:
            print(f"File not found: {filepath}")
    
    print(f"\nTotal remaining document.getElementById calls: {total_remaining}")