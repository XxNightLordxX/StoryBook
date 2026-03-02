#!/usr/bin/env python3
"""
Scan all documentation for items that need immediate fixes
"""
import re
from pathlib import Path

def scan_for_fixes(content, filename):
    """Scan content for items that need immediate fixes"""
    fixes = []
    
    # Patterns for immediate fixes
    patterns = [
        r'(?:CRITICAL|URGENT|IMMEDIATE|HIGH PRIORITY|FIX REQUIRED|NEEDS FIX|BROKEN|ISSUE|BUG|VULNERABILITY)[\s\S]*?(?=\n#{1,3}\s|\n-|\n\*|\Z)',
        r'(?:TODO|FIXME|HACK|XXX)[\s\S]*?(?=\n#{1,3}\s|\n-|\n\*|\Z)',
        r'(?:Missing|Not implemented|Incomplete|Partial|Deferred|Pending)[\s\S]*?(?=\n#{1,3}\s|\n-|\n\*|\Z)',
    ]
    
    for pattern in patterns:
        matches = re.finditer(pattern, content, re.IGNORECASE | re.MULTILINE)
        for match in matches:
            section = match.group(0).strip()
            if len(section) > 20 and len(section) < 500:  # Reasonable length
                fixes.append({
                    'source': filename,
                    'content': section,
                    'type': 'IMMEDIATE_FIX'
                })
    
    return fixes

def main():
    docs_dir = Path('/workspace/docs')
    all_fixes = []
    
    # Find all markdown files
    for md_file in docs_dir.rglob('*.md'):
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
                fixes = scan_for_fixes(content, md_file.name)
                all_fixes.extend(fixes)
        except Exception as e:
            print(f"Error reading {md_file}: {e}")
    
    # Write fixes report
    output_file = Path('/workspace/IMMEDIATE_FIXES_REPORT.md')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Immediate Fixes Report\n\n")
        f.write(f"This report contains all items that need immediate fixes from documentation.\n\n")
        f.write(f"Total fixes found: {len(all_fixes)}\n\n")
        f.write("---\n\n")
        
        for i, fix in enumerate(all_fixes, 1):
            f.write(f"## Fix {i}\n\n")
            f.write(f"**Source:** {fix['source']}\n\n")
            f.write(f"**Type:** {fix['type']}\n\n")
            f.write(fix['content'])
            f.write("\n\n---\n\n")
    
    print(f"✓ Found {len(all_fixes)} items needing immediate fixes")
    print(f"✓ Saved to {output_file}")

if __name__ == '__main__':
    main()