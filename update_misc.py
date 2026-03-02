#!/usr/bin/env python3
import re

def update_misc_file():
    with open('js/modules/misc.js', 'r') as f:
        content = f.read()
    
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
    
    # Pattern 6: document.getElementById('id').innerHTML = value
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.innerHTML\s*=\s*([^;]+);",
        r"DOMHelpers.safeGetElement('\1').innerHTML = \2;",
        content
    )
    
    # Pattern 7: document.getElementById('id').checked
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.checked",
        r"DOMHelpers.safeGetElement('\1').checked",
        content
    )
    
    # Pattern 8: document.getElementById('id').focus()
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.focus\(\)",
        r"DOMHelpers.safeGetElement('\1')?.focus()",
        content
    )
    
    # Pattern 9: document.getElementById('id').scrollIntoView()
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.scrollIntoView\(\)",
        r"DOMHelpers.safeGetElement('\1')?.scrollIntoView()",
        content
    )
    
    # Pattern 10: document.getElementById('id').disabled = value
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.disabled\s*=\s*([^;]+);",
        r"DOMHelpers.safeGetElement('\1').disabled = \2;",
        content
    )
    
    # Pattern 11: document.getElementById('id').click()
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.click\(\)",
        r"DOMHelpers.safeGetElement('\1')?.click()",
        content
    )
    
    # Pattern 12: document.getElementById('id').addEventListener
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.addEventListener",
        r"DOMHelpers.safeGetElement('\1')?.addEventListener",
        content
    )
    
    # Pattern 13: document.getElementById('id').remove()
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.remove\(\)",
        r"DOMHelpers.safeGetElement('\1')?.remove()",
        content
    )
    
    # Pattern 14: document.getElementById('id').appendChild
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.appendChild",
        r"DOMHelpers.safeGetElement('\1')?.appendChild",
        content
    )
    
    # Pattern 15: document.getElementById('id').insertBefore
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.insertBefore",
        r"DOMHelpers.safeGetElement('\1')?.insertBefore",
        content
    )
    
    # Pattern 16: document.getElementById('id').replaceWith
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.replaceWith",
        r"DOMHelpers.safeGetElement('\1')?.replaceWith",
        content
    )
    
    # Pattern 17: document.getElementById('id').setAttribute
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.setAttribute",
        r"DOMHelpers.safeGetElement('\1')?.setAttribute",
        content
    )
    
    # Pattern 18: document.getElementById('id').getAttribute
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.getAttribute",
        r"DOMHelpers.safeGetElement('\1')?.getAttribute",
        content
    )
    
    # Pattern 19: document.getElementById('id').classList.toggle
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.classList\.toggle\('([^']+)'\)",
        r"DOMHelpers.safeGetElement('\1')?.classList.toggle('\2')",
        content
    )
    
    # Pattern 20: document.getElementById('id').classList.contains
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.classList\.contains\('([^']+)'\)",
        r"DOMHelpers.safeGetElement('\1')?.classList.contains('\2')",
        content
    )
    
    # Pattern 21: document.getElementById('id').style.property = value
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.style\.(\w+)\s*=\s*([^;]+);",
        r"DOMHelpers.safeGetElement('\1').style.\2 = \3;",
        content
    )
    
    # Pattern 22: document.getElementById('id').style.property
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.style\.(\w+)",
        r"DOMHelpers.safeGetElement('\1').style.\2",
        content
    )
    
    # Pattern 23: document.getElementById('id').property (generic)
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.(\w+)",
        r"DOMHelpers.safeGetElement('\1').\2",
        content
    )
    
    # Add comment at top
    if '/**' in content and 'Updated to use DOM Helpers' not in content:
        content = content.replace(
            '/**',
            '/**\n * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)\n */\n/**'
        )
    
    with open('js/modules/misc.js', 'w') as f:
        f.write(content)
    
    # Count remaining document.getElementById calls
    remaining = len(re.findall(r"document\.getElementById", content))
    print(f"Updated misc.js. Remaining document.getElementById calls: {remaining}")

if __name__ == '__main__':
    update_misc_file()