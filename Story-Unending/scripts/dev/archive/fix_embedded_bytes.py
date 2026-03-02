#!/usr/bin/env python3
"""Fix embedded_js_temp.js at byte level"""

import subprocess
import re

filepath = 'utils/embedded_js_temp.js'

with open(filepath, 'rb') as f:
    raw = f.read()

# Show the bytes around the problem area on line 1296
lines = raw.split(b'\n')
line = lines[1295]  # 0-indexed

# Find 'email ||' 
idx = line.find(b'email ||')
if idx >= 0:
    section = line[idx:idx+40]
    print(f"Bytes: {section}")
    print(f"Hex:   {section.hex()}")
    
    # The pattern is: email || followed by some combo of backslashes and quotes
    # Let's replace the exact bytes
    # Find the pattern after 'email || '
    after = line[idx+9:idx+30]
    print(f"After 'email || ': {repr(after)}")

# Strategy: replace all occurrences of backslash-backslash-single-quote 
# with just single-quote, at the byte level
# b'\\' is one backslash in the file
old_content = raw.decode('utf-8', errors='replace')

# Count backslash sequences before quotes
print(f"\nSearching for backslash patterns...")
for pattern, name in [
    (r"\\\\\\\\\\\\\'", "6 backslashes + quote"),
    (r"\\\\\\\\\\'", "5 backslashes + quote"),
    (r"\\\\\\\\\'", "4 backslashes + quote"),
    (r"\\\\\\\\'", "3 backslashes + quote"),  
    (r"\\\\\\\'", "3 backslashes + quote v2"),
]:
    count = len(re.findall(pattern, old_content))
    if count > 0:
        print(f"  Found {count} occurrences of {name}")

# Just do a simple replacement: any run of backslashes before a quote
# In the actual file content, we want to replace \' with just '
# But we need to be careful about template literals

# Let's just fix line 1296 specifically
line_str = line.decode('utf-8', errors='replace')
print(f"\nOriginal line 1296 section:")
email_idx = line_str.find('email ||')
print(f"  {repr(line_str[email_idx:email_idx+40])}")

# Replace the specific pattern on this line
fixed_line = line_str.replace("\\\\\\'", "'").replace("\\\\'", "'").replace("\\'", "'")
# But we need to keep legitimate escapes in template literals
# Actually in a template literal, single quotes don't need escaping at all
# So any \' inside a backtick string should just be '

print(f"Fixed section:")
email_idx2 = fixed_line.find('email ||')
print(f"  {repr(fixed_line[email_idx2:email_idx2+40])}")

# Apply the fix
lines[1295] = fixed_line.encode('utf-8')

# Also fix any other lines with the same issue
fixed_count = 0
for i in range(len(lines)):
    line_s = lines[i].decode('utf-8', errors='replace')
    if "\\\&quot; in line_s and "'" in line_s:
        new_line = line_s
        # Replace sequences of backslashes before single quotes
        # In template literals, \' should just be '
        new_line = re.sub(r"\\{2,}'", "'", new_line)
        if new_line != line_s:
            lines[i] = new_line.encode('utf-8')
            fixed_count += 1

print(f"\nFixed {fixed_count} lines with backslash-quote patterns")

# Write back
with open(filepath, 'wb') as f:
    f.write(b'\n'.join(lines))

# Check syntax
result = subprocess.run(['node', '-c', filepath], capture_output=True, text=True, timeout=10)
if result.returncode == 0:
    print("\n✅ CLEAN! No syntax errors!")
else:
    err = result.stderr.strip().split('\n')
    print(f"\n❌ Still has error:")
    for l in err[:5]:
        print(f"  {l}")