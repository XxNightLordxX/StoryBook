#!/usr/bin/env python3
"""Fix the remaining 12 function declarations where safe."""

import os
import re

targets = [
    ('js/modules/backup.js', 221, 'reader.onload = function(e) {', 'reader.onload = (e) => {'),
    ('js/modules/backup.js', 240, 'reader.onerror = function() {', 'reader.onerror = () => {'),
    ('js/ui/content-management-ui.js', 832, 'input.onchange = function(e) {', 'input.onchange = (e) => {'),
    ('js/ui/content-management-ui.js', 837, 'reader.onload = function(e) {', 'reader.onload = (e) => {'),
    ('js/ui/performance-ui.js', 308, 'Navigation.goToChapter = function(chapterNum) {', 'Navigation.goToChapter = (chapterNum) => {'),
    ('js/ui/user-features-ui.js', 515, 'input.onchange = function(e) {', 'input.onchange = (e) => {'),
    ('js/ui/user-features-ui.js', 520, 'reader.onload = function(e) {', 'reader.onload = (e) => {'),
    ('js/ui/user-features-ui.js', 977, 'input.onchange = function(e) {', 'input.onchange = (e) => {'),
    ('js/ui/user-features-ui.js', 982, 'reader.onload = function(e) {', 'reader.onload = (e) => {'),
]

# Skip debounce/throttle - they use 'this' via .apply()
skip = [
    ('js/modules/performance-advanced.js', 345),
    ('js/modules/performance-advanced.js', 347),
    ('js/modules/performance-advanced.js', 366),
]

def check_this_usage(filepath, line_num):
    """Check if the function body uses 'this'"""
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    # Find the function body
    start = line_num - 1  # 0-indexed
    brace_count = 0
    found_open = False
    body_lines = []
    
    for i in range(start, len(lines)):
        line = lines[i]
        for ch in line:
            if ch == '{':
                brace_count += 1
                found_open = True
            elif ch == '}':
                brace_count -= 1
        
        body_lines.append(line)
        
        if found_open and brace_count == 0:
            break
    
    body = ''.join(body_lines)
    # Check for 'this' usage (not in strings/comments)
    # Simple check
    has_this = bool(re.search(r'\bthis\b', body))
    return has_this, body[:200]

fixes = 0
for filepath, line_num, old, new in targets:
    uses_this, body_preview = check_this_usage(filepath, line_num)
    
    if uses_this:
        print(f"  ⏭️  SKIP {filepath}:{line_num} - uses 'this'")
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    if old in content:
        content = content.replace(old, new, 1)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"  ✅ {filepath}:{line_num} - converted to arrow function")
        fixes += 1
    else:
        print(f"  ⚠️  {filepath}:{line_num} - pattern not found (may have different whitespace)")

print(f"\nSkipping debounce/throttle (use 'this' via .apply()):")
for filepath, line_num in skip:
    print(f"  ⏭️  {filepath}:{line_num} - intentionally uses 'this'")

print(f"\nTotal fixes: {fixes}")
print(f"Intentionally skipped: {len(skip)}")