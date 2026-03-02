#!/usr/bin/env python3
import json
with open('LOW_PRIORITY_ANALYSIS.json') as f:
    data = json.load(f)
print('Remaining 12 function declarations:')
for item in data['function_declarations']:
    print(f"  {item['file']}:{item['line']} - {item['text'][:80]}")