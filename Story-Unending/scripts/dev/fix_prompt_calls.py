#!/usr/bin/env python3
"""
Script to replace all prompt() calls with PromptModal.show()
"""
import re
from pathlib import Path

# Files to fix
files_to_fix = [
    '/workspace/js/ui/content-management-ui.js',
    '/workspace/js/ui/save-load-ui.js',
    '/workspace/js/ui/user-features-ui.js',
    '/workspace/js/ui/bookmarks-ui.js',
    '/workspace/js/modules/misc.js',
]

def fix_prompt_calls(filepath):
    """Fix prompt() calls in a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Pattern 1: const x = prompt('message');
        pattern1 = r"const\s+(\w+)\s*=\s*prompt\('([^']+)'\);"
        replacement1 = r"const \1 = await PromptModal.show('\2', '', 'Input');"
        content = re.sub(pattern1, replacement1, content)
        
        # Pattern 2: const x = prompt('message', 'default');
        pattern2 = r"const\s+(\w+)\s*=\s*prompt\('([^']+)',\s*'([^']+)'\);"
        replacement2 = r"const \1 = await PromptModal.show('\2', '\3', 'Input');"
        content = re.sub(pattern2, replacement2, content)
        
        # Pattern 3: const x = prompt(`message`);
        pattern3 = r'const\s+(\w+)\s*=\s*prompt\(`([^`]+)`\);'
        replacement3 = r"const \1 = await PromptModal.show(`\2`, '', 'Input');"
        content = re.sub(pattern3, replacement3, content)
        
        # Pattern 4: const x = prompt(`message`, `default`);
        pattern4 = r'const\s+(\w+)\s*=\s*prompt\(`([^`]+)`,\s*`([^`]+)`\);'
        replacement4 = r"const \1 = await PromptModal.show(`\2`, `\3`, 'Input');"
        content = re.sub(pattern4, replacement4, content)
        
        # Pattern 5: const x = prompt("message");
        pattern5 = r'const\s+(\w+)\s*=\s*prompt\("([^"]+)"\);'
        replacement5 = r'const \1 = await PromptModal.show("\2", "", "Input");'
        content = re.sub(pattern5, replacement5, content)
        
        # Pattern 6: const x = prompt("message", "default");
        pattern6 = r'const\s+(\w+)\s*=\s*prompt\("([^"]+)",\s*"([^"]+)"\);'
        replacement6 = r'const \1 = await PromptModal.show("\2", "\3", "Input");'
        content = re.sub(pattern6, replacement6, content)
        
        # Write back if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed prompt() calls in {filepath.name}")
            return True
        else:
            print(f"⚠️  No prompt() calls found in {filepath.name}")
            return False
            
    except Exception as e:
        print(f"❌ Error fixing {filepath.name}: {e}")
        return False

def main():
    """Main function."""
    print("Fixing prompt() calls...\n")
    
    fixed_count = 0
    for filepath in files_to_fix:
        path = Path(filepath)
        if path.exists():
            if fix_prompt_calls(path):
                fixed_count += 1
    
    print(f"\n{'='*80}")
    print(f"Fixed {fixed_count} files")
    print(f"{'='*80}")

if __name__ == '__main__':
    main()