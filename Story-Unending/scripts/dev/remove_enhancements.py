#!/usr/bin/env python3
"""
Remove future enhancements sections from documentation files
"""
import re
import os
from pathlib import Path

def remove_enhancement_sections(content):
    """Remove enhancement-related sections from content"""
    
    # Patterns to remove
    patterns = [
        r'#{1,3}\s*(Future Enhancements|Future Improvements|Potential Improvements|Enhancements)[\s\S]*?(?=\n#{1,3}\s|\Z)',
        r'#{1,3}\s*(Additional Features|Additional Enhancements|Further Enhancements)[\s\S]*?(?=\n#{1,3}\s|\Z)',
        r'#{1,3}\s*(Improvement Opportunities|Optimization Opportunities)[\s\S]*?(?=\n#{1,3}\s|\Z)',
        r'#{1,3}\s*(Recommended Enhancements|Suggested Enhancements)[\s\S]*?(?=\n#{1,3}\s|\Z)',
    ]
    
    modified_content = content
    removed_count = 0
    
    for pattern in patterns:
        matches = list(re.finditer(pattern, modified_content, re.IGNORECASE | re.MULTILINE))
        for match in reversed(matches):  # Reverse to maintain positions
            section = match.group(0).strip()
            if len(section) > 50:  # Only remove substantial sections
                modified_content = modified_content[:match.start()] + modified_content[match.end():]
                removed_count += 1
    
    return modified_content, removed_count

def main():
    docs_dir = Path('/workspace/docs')
    total_removed = 0
    modified_files = []
    
    # Find all markdown files
    for md_file in docs_dir.rglob('*.md'):
        # Skip the consolidated enhancements file
        if 'CONSOLIDATED_ENHANCEMENTS.md' in md_file.name:
            continue
            
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content, removed = remove_enhancement_sections(content)
            
            if removed > 0:
                with open(md_file, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                total_removed += removed
                modified_files.append((md_file.name, removed))
                print(f"✓ Removed {removed} enhancement sections from {md_file.name}")
        except Exception as e:
            print(f"Error processing {md_file}: {e}")
    
    print(f"\n✓ Total enhancement sections removed: {total_removed}")
    print(f"✓ Files modified: {len(modified_files)}")

if __name__ == '__main__':
    main()