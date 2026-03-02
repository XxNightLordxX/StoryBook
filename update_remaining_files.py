#!/usr/bin/env python3
import re
import os

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Add comment at top
    if '/**' in content and 'Updated to use DOM Helpers' not in content:
        content = content.replace(
            '/**',
            '/**\n * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)\n */\n/**'
        )
    
    # Pattern 1: document.getElementById('id').value
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.value",
        r"DOMHelpers.safeGetElement('\1').value",
        content
    )
    
    # Pattern 2: document.getElementById('id').textContent = value
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.textContent\s*=\s*([^;]+);",
        r"DOMHelpers.safeSetText('\1', \2);",
        content
    )
    
    # Pattern 3: document.getElementById('id').style.display = value
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.style\.display\s*=\s*['&quot;]([^'&quot;]+)['&quot;];",
        r"DOMHelpers.safeSetDisplay('\1', '\2');",
        content
    )
    
    # Pattern 4: document.getElementById('id').classList.add('class')
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.classList\.add\('([^']+)'\)",
        r"DOMHelpers.safeToggleClass('\1', '\2', true)",
        content
    )
    
    # Pattern 5: document.getElementById('id').classList.remove('class')
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.classList\.remove\('([^']+)'\)",
        r"DOMHelpers.safeToggleClass('\1', '\2', false)",
        content
    )
    
    # Pattern: const element = document.getElementById('id');
    content = re.sub(
        r"const\s+(\w+)\s*=\s*document\.getElementById\('([^']+)'\);",
        r"const \1 = DOMHelpers.safeGetElement('\2');",
        content
    )
    
    # Pattern: let element = document.getElementById('id');
    content = re.sub(
        r"let\s+(\w+)\s*=\s*document\.getElementById\('([^']+)'\);",
        r"let \1 = DOMHelpers.safeGetElement('\2');",
        content
    )
    
    # Pattern: var element = document.getElementById('id');
    content = re.sub(
        r"var\s+(\w+)\s*=\s*document\.getElementById\('([^']+)'\);",
        r"var \1 = DOMHelpers.safeGetElement('\2');",
        content
    )
    
    # Pattern: const element = document.getElementById("id");
    content = re.sub(
        r'const\s+(\w+)\s*=\s*document\.getElementById\("([^"]+)"\);',
        r'const \1 = DOMHelpers.safeGetElement("\2");',
        content
    )
    
    # Pattern: let element = document.getElementById("id");
    content = re.sub(
        r'let\s+(\w+)\s*=\s*document\.getElementById\("([^"]+)"\);',
        r'let \1 = DOMHelpers.safeGetElement("\2");',
        content
    )
    
    # Pattern: var element = document.getElementById("id");
    content = re.sub(
        r'var\s+(\w+)\s*=\s*document\.getElementById\("([^"]+)"\);',
        r'var \1 = DOMHelpers.safeGetElement("\2");',
        content
    )
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    # Count remaining document.getElementById calls
    remaining = len(re.findall(r"document\.getElementById", content))
    print(f"Updated {filepath}. Remaining document.getElementById calls: {remaining}")
    return remaining

if __name__ == '__main__':
    files = [
        'Story-Unending/js/ui/user-features-ui.js',
        'Story-Unending/js/ui/content-management-ui.js',
        'Story-Unending/js/ui/notifications-ui.js',
        'Story-Unending/js/ui/search-ui-enhanced.js',
        'Story-Unending/js/ui/analytics-ui.js',
        'Story-Unending/js/ui/search-ui.js',
        'Story-Unending/js/ui/social-sharing-ui.js',
        'Story-Unending/js/ui/screenshot-ui.js',
        'Story-Unending/js/ui/bookmarks-ui.js',
        'Story-Unending/js/ui/leaderboards-ui.js',
        'Story-Unending/js/ui/reading-history-ui.js',
        'Story-Unending/js/ui/performance-ui.js',
        'Story-Unending/js/ui/backup-ui.js',
        'Story-Unending/js/ui/save-load-ui.js',
        'Story-Unending/js/ui/notifications.js',
        'Story-Unending/js/modules/save-load.js',
        'Story-Unending/js/ui/modals.js',
        'Story-Unending/js/ui/dropdown.js',
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