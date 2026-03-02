#!/usr/bin/env python3
"""Fix embedded_js_temp.js by replacing all backslash-quote sequences"""

import subprocess
import re

filepath = 'utils/embedded_js_temp.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any sequence of 2+ backslashes followed by a single quote
# with just a single quote
content = re.sub(r"\\{2,}'", "'", content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

result = subprocess.run(['node', '-c', filepath], capture_output=True, text=True, timeout=10)
if result.returncode == 0:
    print("CLEAN! No syntax errors!")
else:
    err = result.stderr.strip().split('\n')
    print("Still has error:")
    for line in err[:5]:
        print(f"  {line}")
    
    # Try another approach - find and show the line
    match = re.search(r':(\d+)', result.stderr)
    if match:
        ln = int(match.group(1))
        with open(filepath, 'r') as f:
            lines = f.readlines()
        if ln <= len(lines):
            raw = lines[ln-1]
            print(f"\nRaw line {ln} repr:")
            # Find the area around the error
            for i in range(0, len(raw), 100):
                chunk = raw[i:i+100]
                if '\\' in chunk:
                    print(f"  pos {i}: {repr(chunk)}")