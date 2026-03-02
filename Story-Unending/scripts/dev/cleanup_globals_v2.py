#!/usr/bin/env python3
"""
Script to clean up global namespace by wrapping JavaScript files in IIFE
and creating namespace objects. Improved version that handles indented functions.
"""

import os
import re
from pathlib import Path

def extract_declarations(content):
    """
    Extract all function, const, and let declarations from content.
    Handles both top-level and indented declarations.
    """
    declarations = []
    
    # Extract function declarations (with or without leading whitespace)
    functions = re.findall(r'^\s*function\s+(\w+)\s*\(', content, re.MULTILINE)
    declarations.extend(functions)
    
    # Extract const declarations
    consts = re.findall(r'^\s*const\s+(\w+)\s*=', content, re.MULTILINE)
    declarations.extend(consts)
    
    # Extract let declarations
    lets = re.findall(r'^\s*let\s+(\w+)\s*=', content, re.MULTILINE)
    declarations.extend(lets)
    
    # Remove duplicates while preserving order
    seen = set()
    unique_declarations = []
    for decl in declarations:
        if decl not in seen:
            seen.add(decl)
            unique_declarations.append(decl)
    
    return unique_declarations

def wrap_file_in_iife(file_path, namespace_name):
    """
    Wrap a JavaScript file in an IIFE and create a namespace object.
    """
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Extract all function and const declarations
    all_declarations = extract_declarations(content)
    
    if not all_declarations:
        print(f"⚠ No declarations found in {file_path}")
        print(f"  Skipping IIFE wrapping\n")
        return False
    
    # Create namespace export
    exports = []
    for decl in all_declarations:
        exports.append(f"  {decl}: {decl}")
    
    export_block = ",\n".join(exports)
    
    # Wrap in IIFE
    wrapped_content = f"""(function() {{
  // Original content
  {content}
  
  // Create namespace object
  const {namespace_name} = {{
{export_block}
  }};
  
  // Export to global scope
  if (typeof window !== 'undefined') {{
    window.{namespace_name} = {namespace_name};
  }}
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {{
    module.exports = {namespace_name};
  }}
}})();
"""
    
    # Backup original file
    backup_path = file_path + '.backup'
    with open(backup_path, 'w') as f:
        f.write(content)
    
    # Write wrapped content
    with open(file_path, 'w') as f:
        f.write(wrapped_content)
    
    print(f"✓ Wrapped {file_path} in IIFE with namespace '{namespace_name}'")
    print(f"  Backup saved to {backup_path}")
    print(f"  Found {len(all_declarations)} declarations")
    return True

def main():
    """Main function to clean up global namespace."""
    print("=== Global Namespace Cleanup v2 ===\n")
    
    # Define files and their namespaces
    files_to_wrap = [
        ('js/utils/security.js', 'Security'),
        ('js/utils/storage.js', 'Storage'),
        ('js/ui/modals.js', 'UIModals'),
        ('js/ui/dropdown.js', 'UIDropdown'),
        ('js/ui/notifications.js', 'UINotifications'),
        ('js/ui/sidebar.js', 'UISidebar'),
        ('js/ui/text-size.js', 'UITextSize'),
        ('js/ui/stats.js', 'UIStats'),
        ('js/modules/app-state.js', 'AppStateModule'),
        ('js/modules/auth.js', 'Auth'),
        ('js/modules/navigation.js', 'Navigation'),
        ('js/modules/admin.js', 'Admin'),
        ('js/modules/generation.js', 'Generation'),
        ('js/modules/initialization.js', 'Initialization'),
        ('js/modules/story-timeline.js', 'StoryTimeline'),
    ]
    
    wrapped_count = 0
    skipped_count = 0
    
    # Wrap each file
    for file_path, namespace in files_to_wrap:
        if os.path.exists(file_path):
            try:
                if wrap_file_in_iife(file_path, namespace):
                    wrapped_count += 1
                else:
                    skipped_count += 1
                print()
            except Exception as e:
                print(f"✗ Error wrapping {file_path}: {e}\n")
                skipped_count += 1
        else:
            print(f"✗ File not found: {file_path}\n")
            skipped_count += 1
    
    print("=== Cleanup Complete ===")
    print(f"\nSummary:")
    print(f"  Files wrapped: {wrapped_count}")
    print(f"  Files skipped: {skipped_count}")
    print(f"  Total files: {len(files_to_wrap)}")
    print("\nNext steps:")
    print("1. Review the wrapped files")
    print("2. Update index.html to use new namespace structure")
    print("3. Test all functionality")
    print("4. If issues occur, restore from .backup files")

if __name__ == '__main__':
    main()