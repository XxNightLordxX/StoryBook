#!/usr/bin/env python3
"""Fix &quot; HTML entities in continuous_debugger.py on specific lines"""

with open('continuous_debugger.py', 'r') as f:
    lines = f.readlines()

fixes = 0
for i, line in enumerate(lines):
    if '&quot;' in line:
        # Replace \&quot; with \&quot; (escaped double quote)
        old = line
        line = line.replace('\\&quot;', '\\\\\&quot;')
        if line != old:
            lines[i] = line
            fixes += 1
            print("Fixed line %d" % (i + 1))

with open('continuous_debugger.py', 'w') as f:
    f.writelines(lines)

print("Fixed %d lines" % fixes)

import subprocess
result = subprocess.run(['python3', '-c', 'import continuous_debugger; print("OK")'],
                       capture_output=True, text=True)
print(result.stdout.strip())
if result.returncode != 0:
    print("ERROR:", result.stderr[:300])