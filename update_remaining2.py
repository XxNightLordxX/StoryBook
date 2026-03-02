#!/usr/bin/env python3
import re
import os

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Pattern: document.getElementById('id').innerHTML = value
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.innerHTML\s*=\s*([^;]+);",
        r"DOMHelpers.safeGetElement('\1').innerHTML = \2;",
        content
    )
    
    # Pattern: document.getElementById('id').checked
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.checked",
        r"DOMHelpers.safeGetElement('\1').checked",
        content
    )
    
    # Pattern: document.getElementById('id').focus()
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.focus\(\)",
        r"DOMHelpers.safeGetElement('\1')?.focus()",
        content
    )
    
    # Pattern: document.getElementById('id').scrollIntoView()
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.scrollIntoView\(\)",
        r"DOMHelpers.safeGetElement('\1')?.scrollIntoView()",
        content
    )
    
    # Pattern: document.getElementById('id').disabled = value
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.disabled\s*=\s*([^;]+);",
        r"DOMHelpers.safeGetElement('\1').disabled = \2;",
        content
    )
    
    # Pattern: document.getElementById('id').click()
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.click\(\)",
        r"DOMHelpers.safeGetElement('\1')?.click()",
        content
    )
    
    # Pattern: document.getElementById('id').addEventListener
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.addEventListener",
        r"DOMHelpers.safeGetElement('\1')?.addEventListener",
        content
    )
    
    # Pattern: document.getElementById('id').remove()
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.remove\(\)",
        r"DOMHelpers.safeGetElement('\1')?.remove()",
        content
    )
    
    # Pattern: document.getElementById('id').appendChild
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.appendChild",
        r"DOMHelpers.safeGetElement('\1')?.appendChild",
        content
    )
    
    # Pattern: document.getElementById('id').insertBefore
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.insertBefore",
        r"DOMHelpers.safeGetElement('\1')?.insertBefore",
        content
    )
    
    # Pattern: document.getElementById('id').replaceWith
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.replaceWith",
        r"DOMHelpers.safeGetElement('\1')?.replaceWith",
        content
    )
    
    # Pattern: document.getElementById('id').setAttribute
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.setAttribute",
        r"DOMHelpers.safeGetElement('\1')?.setAttribute",
        content
    )
    
    # Pattern: document.getElementById('id').getAttribute
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.getAttribute",
        r"DOMHelpers.safeGetElement('\1')?.getAttribute",
        content
    )
    
    # Pattern: document.getElementById('id').classList.toggle
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.classList\.toggle\('([^']+)'\)",
        r"DOMHelpers.safeGetElement('\1')?.classList.toggle('\2')",
        content
    )
    
    # Pattern: document.getElementById('id').classList.contains
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.classList\.contains\('([^']+)'\)",
        r"DOMHelpers.safeGetElement('\1')?.classList.contains('\2')",
        content
    )
    
    # Pattern: document.getElementById('id').style.property = value
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.style\.(\w+)\s*=\s*([^;]+);",
        r"DOMHelpers.safeGetElement('\1').style.\2 = \3;",
        content
    )
    
    # Pattern: document.getElementById('id').style.property
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.style\.(\w+)",
        r"DOMHelpers.safeGetElement('\1').style.\2",
        content
    )
    
    # Pattern: document.getElementById('id').property (generic)
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.(\w+)",
        r"DOMHelpers.safeGetElement('\1').\2",
        content
    )
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    # Count remaining document.getElementById calls
    remaining = len(re.findall(r"document\.getElementById", content))
    print(f"Updated {filepath} (pass 2). Remaining document.getElementById calls: {remaining}")
    return remaining

if __name__ == '__main__':
    files = [
        'Story-Unending/js/ui/user-features-ui.js',
        'Story-Unending/js/ui/content-management-ui.js',
        'Story-Unending/js/ui/notifications-ui.js',
        'Story-Unending/js/ui/search-ui-enhanced.js',
        'Story-Unending/js/ui/analytics-ui.js',
        'Story-Unending/js/ui/search-ui.js',
        'Story-Unending/js/ui/screenshot-ui.js',
        'Story-Unending/js/ui/bookmarks-ui.js',
        'Story-Unending/js/ui/leaderboards-ui.js',
        'Story-Unending/js/ui/reading-history-ui.js',
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