#!/usr/bin/env python3
"""
Fix remaining missing error handling in async functions
"""

import re
from pathlib import Path

def fix_remaining_error_handling(filepath):
    """Fix missing error handling in async functions"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Find async functions without try-catch
    async_func_pattern = r'async\s+function\s+(\w+)\s*\([^)]*\)\s*\{'
    
    for match in re.finditer(async_func_pattern, content):
        func_name = match.group(1)
        func_start = match.start()
        
        # Find the function body
        brace_count = 0
        in_function = False
        func_start_pos = 0
        
        for i, char in enumerate(content[func_start:], start=func_start):
            if not in_function:
                if char == '{':
                    in_function = True
                    func_start_pos = i
                    brace_count = 1
                continue
            
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                
                if brace_count == 0:
                    # Function ended
                    func_body = content[func_start_pos+1:i]
                    
                    # Check if function has try-catch
                    if 'try' not in func_body and 'catch' not in func_body:
                        # Add try-catch wrapper
                        new_body = '    try {\n' + func_body + '\n    } catch (error) {\n      ErrorHandler.handleError(`Error in ' + func_name + '`, error);\n    }'
                        
                        # Replace the function body
                        content = content[:func_start_pos+1] + new_body + content[i:]
                        
                        # Update content for next iteration
                        break
        
        # Break after first fix to avoid issues
        if content != original_content:
            break
    
    # Write back if changed
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    return False

def main():
    """Main function"""
    js_dir = Path('js')
    
    fixed_files = []
    
    for js_file in js_dir.rglob('*.js'):
        if fix_remaining_error_handling(js_file):
            fixed_files.append(str(js_file))
            print(f"✅ Fixed: {js_file}")
    
    print(f"\n🎉 Fixed {len(fixed_files)} files with missing error handling")
    
    return fixed_files

if __name__ == '__main__':
    main()