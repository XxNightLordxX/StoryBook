#!/usr/bin/env python3
"""
Remove console.log statements from index.html for production
"""

import re

def remove_console_logs():
    """Remove console.log statements from HTML"""
    
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove console.log statements
    content = re.sub(r'console\.log\([^)]*\);?\s*', '', content)
    
    # Remove console.error statements (keep for error handling)
    # content = re.sub(r'console\.error\([^)]*\);?\s*', '', content)
    
    # Remove console.warn statements
    content = re.sub(r'console\.warn\([^)]*\);?\s*', '', content)
    
    # Write updated content
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Console.log statements removed")
    print("✅ Production-ready code")

if __name__ == "__main__":
    remove_console_logs()