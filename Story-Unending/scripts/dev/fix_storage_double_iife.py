#!/usr/bin/env python3
"""
Fix double IIFE pattern in storage.js
"""

with open('js/utils/storage.js', 'r') as f:
    lines = f.readlines()

# Remove the first 3 lines (double IIFE wrapper)
# Keep everything from line 4 onwards
new_lines = lines[3:]

with open('js/utils/storage.js', 'w') as f:
    f.writelines(new_lines)

print("✅ Fixed double IIFE pattern in js/utils/storage.js")