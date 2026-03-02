#!/usr/bin/env python3
import json

with open('LOW_PRIORITY_ANALYSIS.json') as f:
    data = json.load(f)

# Show sample deeply nested lines from the top files
top_files = ['js/ui/user-features-ui.js', 'js/ui/leaderboards-ui.js', 'js/ui/content-management-ui.js']

for tf in top_files:
    print(f"\n{'='*70}")
    print(f"FILE: {tf}")
    print(f"{'='*70}")
    count = 0
    for item in data['deeply_nested']:
        if item['file'] == tf and count < 5:
            print(f"  Line {item['line']} (indent: {item['indent_level']})")
            print(f"    {item['text'][:100]}")
            count += 1