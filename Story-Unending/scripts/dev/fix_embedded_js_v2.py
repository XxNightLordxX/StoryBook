#!/usr/bin/env python3
"""Fix excessive escaping in utils/embedded_js_temp.js - iterative approach"""

import subprocess
import re

filepath = 'utils/embedded_js_temp.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Keep replacing multiple backslashes until stable
for i in range(10):
    old = content
    # Replace \\\\' with '  (multiple levels of escaping)
    content = content.replace("\\\\\\\\'", "'")
    content = content.replace("\\\\\\'", "'")
    content = content.replace("\\\\'", "'")
    # Also fix \\\&quot; patterns
    content = content.replace('\\\\\\\&quot;', '"')
    content = content.replace('\\\\\&quot;', '\&quot;')
    if content == old:
        break
    print(f"  Pass {i+1}: Fixed escaping")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

# Check syntax
result = subprocess.run(['node', '-c', filepath], capture_output=True, text=True, timeout=10)
if result.returncode == 0:
    print(f"✅ {filepath}: CLEAN - no syntax errors!")
else:
    lines = result.stderr.strip().split('\n')
    print(f"❌ Still has error:")
    for line in lines[:5]:
        print(f"  {line}")
    
    # Show the problematic line
    with open(filepath, 'r') as f:
        file_lines = f.readlines()
    match = re.search(r':(\d+)', result.stderr)
    if match:
        ln = int(match.group(1))
        print(f"\nLine {ln}:")
        print(f"  {file_lines[ln-1].strip()[:150]}")