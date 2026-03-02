#!/usr/bin/env python3
"""Show deeply nested lines in non-template files"""

files = [
    'js/modules/backup.js',
    'js/modules/content-management.js',
    'js/modules/notifications.js',
    'js/modules/leaderboards.js',
    'js/utils/sentry.js',
    'js/ui/search-ui-enhanced.js',
    'js/ui/analytics-ui.js',
    'js/ui/leaderboards-ui.js',
    'js/ui/notifications-ui.js',
    'js/ui/user-features-ui.js',
    'js/ui/content-management-ui.js',
    'js/ui/backup-ui.js',
]

for filepath in files:
    try:
        with open(filepath, 'r') as f:
            lines = f.readlines()
        
        deep = []
        for i, line in enumerate(lines, 1):
            raw = line.rstrip('\n').rstrip('\r')
            stripped = raw.strip()
            if stripped and not stripped.startswith('//') and not stripped.startswith('*'):
                indent = len(raw) - len(raw.lstrip())
                if indent >= 24:
                    deep.append((i, indent, stripped[:80]))
        
        if deep:
            print(f"\n{'='*70}")
            print(f"FILE: {filepath} ({len(deep)} deep lines)")
            print(f"{'='*70}")
            for linenum, indent, text in deep[:8]:
                print(f"  L{linenum:4d} [{indent:2d}sp] {text}")
            if len(deep) > 8:
                print(f"  ... and {len(deep) - 8} more")
    except Exception as e:
        print(f"Error reading {filepath}: {e}")