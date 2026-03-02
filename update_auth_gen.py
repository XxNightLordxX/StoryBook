#!/usr/bin/env python3
import re

def update_auth():
    with open('Story-Unending/js/modules/auth.js', 'r') as f:
        content = f.read()
    
    # Add comment at top
    if '/**' in content and 'Updated to use DOM Helpers' not in content:
        content = content.replace(
            '/**',
            '/**\n * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)\n */\n/**'
        )
    
    # Pattern: const element = document.getElementById('id');
    content = re.sub(
        r"const\s+(\w+)\s*=\s*document\.getElementById\('([^']+)'\);",
        r"const \1 = DOMHelpers.safeGetElement('\2');",
        content
    )
    
    # Pattern: const element = document.getElementById("id");
    content = re.sub(
        r'const\s+(\w+)\s*=\s*document\.getElementById\("([^"]+)"\);',
        r'const \1 = DOMHelpers.safeGetElement("\2");',
        content
    )
    
    # Pattern: document.getElementById('id').value
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.value",
        r"DOMHelpers.safeGetElement('\1').value",
        content
    )
    
    # Pattern: document.getElementById('id').textContent = value
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.textContent\s*=\s*([^;]+);",
        r"DOMHelpers.safeSetText('\1', \2);",
        content
    )
    
    # Pattern: document.getElementById('id').style.display = value
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.style\.display\s*=\s*['&quot;]([^'&quot;]+)['&quot;];",
        r"DOMHelpers.safeSetDisplay('\1', '\2');",
        content
    )
    
    # Pattern: document.getElementById('id').classList.add('class')
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.classList\.add\('([^']+)'\)",
        r"DOMHelpers.safeToggleClass('\1', '\2', true)",
        content
    )
    
    # Pattern: document.getElementById('id').classList.remove('class')
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.classList\.remove\('([^']+)'\)",
        r"DOMHelpers.safeToggleClass('\1', '\2', false)",
        content
    )
    
    with open('Story-Unending/js/modules/auth.js', 'w') as f:
        f.write(content)
    
    remaining = len(re.findall(r"document\.getElementById", content))
    print(f"Updated auth.js. Remaining document.getElementById calls: {remaining}")

def update_generation():
    with open('Story-Unending/js/modules/generation.js', 'r') as f:
        content = f.read()
    
    # Add comment at top
    if '/**' in content and 'Updated to use DOM Helpers' not in content:
        content = content.replace(
            '/**',
            '/**\n * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)\n */\n/**'
        )
    
    # Pattern: document.getElementById('id').textContent = value
    content = re.sub(
        r"document\.getElementById\('([^']+)'\)\.textContent\s*=\s*([^;]+);",
        r"DOMHelpers.safeSetText('\1', \2);",
        content
    )
    
    with open('Story-Unending/js/modules/generation.js', 'w') as f:
        f.write(content)
    
    remaining = len(re.findall(r"document\.getElementById", content))
    print(f"Updated generation.js. Remaining document.getElementById calls: {remaining}")

if __name__ == '__main__':
    update_auth()
    update_generation()