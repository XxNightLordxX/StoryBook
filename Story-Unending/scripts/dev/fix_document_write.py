#!/usr/bin/env python3
"""
Script to fix document.write in content-management-ui.js
"""
import re
from pathlib import Path

def fix_document_write(filepath):
    """Fix document.write in a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Find and replace the previewContent function
        old_pattern = r'function previewContent\(\) \{[^}]*const previewWindow = window\.open\(\'\', \'_blank\'\);[^}]*previewWindow\.document\.write\(`[^`]+`\);[^}]*\}'
        
        new_function = '''function previewContent() {
        const title = document.getElementById('chapter-title').value;
        const content = document.getElementById('chapter-content').value;

        const previewWindow = window.open('', '_blank');
        
        // Use proper DOM manipulation instead of document.write
        const doc = previewWindow.document;
        doc.open();
        
        // Create HTML structure
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Preview: ${sanitizeHTML(title)}</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
                    h1 { color: #333; }
                    p { line-height: 1.6; }
                </style>
            </head>
            <body>
                <h1>${sanitizeHTML(title)}</h1>
                <div>${sanitizeHTML(content).replace(/\\\\n/g, '<br>')}</div>
            </body>
            </html>
        `;
        
        doc.write(html);
        doc.close();
    }'''
        
        content = re.sub(old_pattern, new_function, content, flags=re.DOTALL)
        
        # Write back if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed document.write in {filepath.name}")
            return True
        else:
            print(f"⚠️  No document.write found in {filepath.name}")
            return False
            
    except Exception as e:
        print(f"❌ Error fixing {filepath.name}: {e}")
        return False

def main():
    """Main function."""
    filepath = Path('/workspace/js/ui/content-management-ui.js')
    if filepath.exists():
        fix_document_write(filepath)

if __name__ == '__main__':
    main()