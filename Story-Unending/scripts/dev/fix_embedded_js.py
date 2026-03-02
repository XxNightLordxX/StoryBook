#!/usr/bin/env python3
"""Fix excessive escaping in utils/embedded_js_temp.js"""

import subprocess

filepath = 'utils/embedded_js_temp.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix excessive backslash escaping: \\' → '
content = content.replace("\\\\'", "'")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

# Check syntax
result = subprocess.run(['node', '-c', filepath], capture_output=True, text=True, timeout=10)
if result.returncode == 0:
    print(f"✅ {filepath}: CLEAN - no syntax errors!")
else:
    # Get error line
    lines = result.stderr.strip().split('\n')
    print(f"❌ Still has error:")
    for line in lines[:5]:
        print(f"  {line}")