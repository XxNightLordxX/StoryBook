#!/usr/bin/env python3
import re

def update_misc_file():
    with open('js/modules/misc.js', 'r') as f:
        content = f.read()
    
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
    
    with open('js/modules/misc.js', 'w') as f:
        f.write(content)
    
    # Count remaining document.getElementById calls
    remaining = len(re.findall(r"document\.getElementById", content))
    print(f"Updated misc.js (pass 2). Remaining document.getElementById calls: {remaining}")

if __name__ == '__main__':
    update_misc_file()