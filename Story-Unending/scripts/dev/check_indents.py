#!/usr/bin/env python3
with open('js/ui/analytics-ui.js', 'r') as f:
    lines = f.readlines()

# Show indent distribution for lines 27-90 (inside first template)
indents = {}
for i in range(26, 90):
    line = lines[i].rstrip()
    if line.strip():
        indent = len(line) - len(line.lstrip())
        if indent not in indents:
            indents[indent] = 0
        indents[indent] += 1

print('Indent distribution (lines 27-90):')
for indent in sorted(indents.keys()):
    deep = "<-- DEEP" if indent >= 24 else ""
    print(f'  {indent:3d} spaces: {indents[indent]:3d} lines {deep}')