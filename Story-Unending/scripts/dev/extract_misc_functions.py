#!/usr/bin/env python3
"""Extract and fix misc.js from embedded_js_temp.js"""

import re

# Read the embedded file
with open('utils/embedded_js_temp.js', 'r') as f:
    content = f.read()

# Find the generationMode variable and related functions
generation_mode_section = re.search(
    r'let generationMode = localStorage\.getItem.*?function submitDirective\(\) \{.*?\n    \}',
    content,
    re.DOTALL
)

if generation_mode_section:
    print("Found generation mode section")
    print(generation_mode_section.group(0)[:500])
else:
    print("Generation mode section not found")

# Find catchUpAndStart function
catchup_section = re.search(
    r'function catchUpAndStart\(\) \{.*?requestAnimationFrame\(generateBatch\);.*?\n    \}',
    content,
    re.DOTALL
)

if catchup_section:
    print("\nFound catchUpAndStart section")
    print(catchup_section.group(0)[:500])
else:
    print("catchUpAndStart section not found")