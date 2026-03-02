#!/usr/bin/env python3
"""
Extract future enhancements sections from documentation files
"""
import re
import os
from pathlib import Path

def extract_enhancement_section(content, filename):
    """Extract enhancement-related sections from content"""
    sections = []
    
    # Common enhancement section patterns
    patterns = [
        r'#{1,3}\s*(Future Enhancements|Future Improvements|Potential Improvements|Enhancements)[\s\S]*?(?=\n#{1,3}\s|\Z)',
        r'#{1,3}\s*(Additional Features|Additional Enhancements|Further Enhancements)[\s\S]*?(?=\n#{1,3}\s|\Z)',
        r'#{1,3}\s*(Improvement Opportunities|Optimization Opportunities)[\s\S]*?(?=\n#{1,3}\s|\Z)',
        r'#{1,3}\s*(Recommended Enhancements|Suggested Enhancements)[\s\S]*?(?=\n#{1,3}\s|\Z)',
    ]
    
    for pattern in patterns:
        matches = re.finditer(pattern, content, re.IGNORECASE | re.MULTILINE)
        for match in matches:
            section = match.group(0).strip()
            if len(section) > 50:  # Only include substantial sections
                sections.append({
                    'source': filename,
                    'content': section
                })
    
    return sections

def main():
    docs_dir = Path('/workspace/docs')
    all_enhancements = []
    
    # Find all markdown files
    for md_file in docs_dir.rglob('*.md'):
        # Skip the consolidated enhancements file
        if 'CONSOLIDATED_ENHANCEMENTS.md' in md_file.name:
            continue
            
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
                enhancements = extract_enhancement_section(content, md_file.name)
                all_enhancements.extend(enhancements)
        except Exception as e:
            print(f"Error reading {md_file}: {e}")
    
    # Write consolidated enhancements
    output_file = Path('/workspace/docs/ANALYSIS_DOCS/CONSOLIDATED_ENHANCEMENTS.md')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Consolidated Future Enhancements\n\n")
        f.write(f"This document consolidates all future enhancements sections from the project documentation.\n\n")
        f.write(f"Total sections extracted: {len(all_enhancements)}\n\n")
        f.write("---\n\n")
        
        for i, enhancement in enumerate(all_enhancements, 1):
            f.write(f"## Enhancement Section {i}\n\n")
            f.write(f"**Source:** {enhancement['source']}\n\n")
            f.write(enhancement['content'])
            f.write("\n\n---\n\n")
    
    print(f"✓ Extracted {len(all_enhancements)} enhancement sections")
    print(f"✓ Saved to {output_file}")

if __name__ == '__main__':
    main()