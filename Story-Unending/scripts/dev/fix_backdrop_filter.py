#!/usr/bin/env python3
"""Add -webkit-backdrop-filter prefix for Safari compatibility"""

with open('styles.css', 'r') as f:
    lines = f.readlines()

fixes = 0
result = []
for line in lines:
    result.append(line)
    if 'backdrop-filter:' in line and '-webkit-backdrop-filter' not in line:
        # Add webkit prefix on the line before
        indent = line[:len(line) - len(line.lstrip())]
        webkit_line = line.replace('backdrop-filter:', '-webkit-backdrop-filter:')
        result.insert(-1, webkit_line)
        fixes += 1

with open('styles.css', 'w') as f:
    f.writelines(result)

print("Added %d -webkit-backdrop-filter prefixes" % fixes)