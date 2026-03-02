#!/usr/bin/env python3
"""
Extract roadmap sections from documentation files
"""
import re
import os
from pathlib import Path

def extract_roadmap_section(content, filename):
    """Extract roadmap-related sections from content"""
    sections = []
    
    # Common roadmap section patterns
    patterns = [
        r'#{1,3}\s*(Roadmap|Implementation Roadmap|Implementation Plan|Future Roadmap)[\s\S]*?(?=\n#{1,3}\s|\Z)',
        r'#{1,3}\s*(Next Steps|Future Work|Future Enhancements|Planned Features)[\s\S]*?(?=\n#{1,3}\s|\Z)',
        r'#{1,3}\s*(Implementation Timeline|Development Timeline|Project Timeline)[\s\S]*?(?=\n#{1,3}\s|\Z)',
        r'#{1,3}\s*(Phase \d+.*?Plan|Phase \d+.*?Roadmap)[\s\S]*?(?=\n#{1,3}\s|\Z)',
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
    all_roadmaps = []
    
    # Find all markdown files
    for md_file in docs_dir.rglob('*.md'):
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
                roadmaps = extract_roadmap_section(content, md_file.name)
                all_roadmaps.extend(roadmaps)
        except Exception as e:
            print(f"Error reading {md_file}: {e}")
    
    # Write consolidated roadmaps
    output_file = Path('/workspace/docs/ANALYSIS_DOCS/CONSOLIDATED_ROADMAPS.md')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Consolidated Roadmaps\n\n")
        f.write(f"This document consolidates all roadmap sections from the project documentation.\n\n")
        f.write(f"Total sections extracted: {len(all_roadmaps)}\n\n")
        f.write("---\n\n")
        
        for i, roadmap in enumerate(all_roadmaps, 1):
            f.write(f"## Roadmap Section {i}\n\n")
            f.write(f"**Source:** {roadmap['source']}\n\n")
            f.write(roadmap['content'])
            f.write("\n\n---\n\n")
    
    print(f"✓ Extracted {len(all_roadmaps)} roadmap sections")
    print(f"✓ Saved to {output_file}")

if __name__ == '__main__':
    main()