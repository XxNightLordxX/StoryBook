#!/usr/bin/env python3
"""
Properly fix double IIFE pattern in storage.js
"""

with open('js/utils/storage.js', 'r') as f:
    content = f.read()

# Find the second IIFE start (it's on line 3)
lines = content.split('\n')

# Skip the first 3 lines (double IIFE wrapper)
new_lines = lines[3:]

# Remove the duplicate "// Original content" line if present
if new_lines and new_lines[0].strip() == '// Original content':
    new_lines = new_lines[1:]

new_content = '\n'.join(new_lines)

with open('js/utils/storage.js', 'w') as f:
    f.write(new_content)

print("✅ Fixed double IIFE pattern in js/utils/storage.js")
print(f"   Reduced from {len(content)} to {len(new_content)} characters")