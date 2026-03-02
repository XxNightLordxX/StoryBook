#!/usr/bin/env python3
"""Fix embedded_js_temp.js - simple byte-level approach"""

import subprocess
import os

filepath = 'utils/embedded_js_temp.js'

with open(filepath, 'rb') as f:
    data = f.read()

# Replace all sequences of 2+ backslashes followed by single quote
# with just single quote, at byte level
# backslash = 0x5c, single quote = 0x27

result = bytearray()
i = 0
fixes = 0
while i < len(data):
    # Check if we have a sequence of backslashes followed by a quote
    if data[i] == 0x5c:  # backslash
        # Count consecutive backslashes
        j = i
        while j < len(data) and data[j] == 0x5c:
            j += 1
        num_backslashes = j - i
        
        # If followed by single quote and we have 2+ backslashes
        if j < len(data) and data[j] == 0x27 and num_backslashes >= 2:
            result.append(0x27)  # just the quote
            i = j + 1
            fixes += 1
            continue
    
    result.append(data[i])
    i += 1

print(f"Fixed {fixes} backslash-quote sequences")

with open(filepath, 'wb') as f:
    f.write(bytes(result))

# Check syntax
check = subprocess.run(['node', '-c', filepath], capture_output=True, text=True, timeout=10)
if check.returncode == 0:
    print("CLEAN! No syntax errors!")
else:
    err = check.stderr.strip().split('\n')
    print("Still has error:")
    for line in err[:5]:
        print(f"  {line}")