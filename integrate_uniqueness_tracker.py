#!/usr/bin/env python3
"""Integrate UniquenessTracker into story-engine.js"""

import re

# Read the file
with open('story-engine.js', 'r') as f:
    content = f.read()

# Find the line "return chapter;" and insert tracking code before it
tracking_code = '''
      // Track content with UniquenessTracker for Phase 1 testing
      if (typeof window !== 'undefined' && window.UniquenessTracker) {
        // Track title
        if (chapter.title) {
          window.UniquenessTracker.addTitle(chapter.title);
        }
        
        // Track all paragraphs
        if (chapter.paragraphs && Array.isArray(chapter.paragraphs)) {
          chapter.paragraphs.forEach(paragraph => {
            if (paragraph && typeof paragraph === 'string') {
              window.UniquenessTracker.addParagraph(paragraph);
            }
          });
        }
        
        // Track entire chapter content
        const chapterContent = chapter.paragraphs ? chapter.paragraphs.join(' ') : '';
        window.UniquenessTracker.addChapter(chapterContent);
      }
'''

# Replace "return chapter;" with tracking code + "return chapter;"
content = content.replace(
    '\n      return chapter;\n    }',
    tracking_code + '\n      return chapter;\n    }'
)

# Write the file back
with open('story-engine.js', 'w') as f:
    f.write(content)

print("Successfully integrated UniquenessTracker into story-engine.js")