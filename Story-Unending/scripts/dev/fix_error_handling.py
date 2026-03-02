#!/usr/bin/env python3
"""
Fix missing error handling in async functions
Adds try-catch blocks to async functions that lack error handling
"""

import re
from pathlib import Path

def fix_error_handling(filepath):
    """Fix missing error handling in async functions"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    lines = content.split('\n')
    
    # Find async functions without try-catch
    async_func_pattern = r'async\s+function\s+(\w+)\s*\([^)]*\)\s*\{'
    
    for match in re.finditer(async_func_pattern, content):
        func_name = match.group(1)
        func_start = match.start()
        func_line = content[:func_start].count('\n') + 1
        
        # Find the function body
        brace_count = 0
        in_function = False
        func_start_line = 0
        func_end_line = 0
        
        for i, line in enumerate(lines[func_line-1:], start=func_line):
            if 'async function' in line and func_name in line:
                in_function = True
                func_start_line = i
                brace_count += line.count('{') - line.count('}')
                continue
            
            if in_function:
                brace_count += line.count('{') - line.count('}')
                
                # Check if function has try-catch
                if 'try' in line or 'catch' in line:
                    break
                
                # Function ended
                if brace_count == 0 and i > func_start_line:
                    func_end_line = i
                    
                    # Add try-catch wrapper
                    # Find the first line after function declaration
                    first_code_line = func_start_line + 1
                    
                    # Skip empty lines and comments
                    while first_code_line < func_end_line:
                        if lines[first_code_line].strip() and not lines[first_code_line].strip().startswith('//'):
                            break
                        first_code_line += 1
                    
                    if first_code_line >= func_end_line:
                        break
                    
                    # Insert try block
                    indent = len(lines[first_code_line]) - len(lines[first_code_line].lstrip())
                    try_indent = '  ' * (indent // 2)
                    
                    # Add try at the beginning
                    lines[first_code_line] = try_indent + 'try {\n' + lines[first_code_line]
                    
                    # Add catch at the end
                    catch_line = try_indent + '} catch (error) {\n'
                    catch_line += try_indent + '  ErrorHandler.handleError(`Error in ' + func_name + '`, error);\n'
                    catch_line += try_indent + '}\n'
                    
                    # Insert catch before the closing brace
                    lines.insert(func_end_line, catch_line)
                    
                    # Update content
                    content = '\n'.join(lines)
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
        if fix_error_handling(js_file):
            fixed_files.append(str(js_file))
            print(f"✅ Fixed: {js_file}")
    
    print(f"\n🎉 Fixed {len(fixed_files)} files with missing error handling")
    
    return fixed_files

if __name__ == '__main__':
    main()