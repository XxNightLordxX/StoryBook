#!/usr/bin/env python3
"""
Fix MISSING_ERROR_HANDLING issues in the codebase
Adds try-catch blocks to async functions that lack error handling.
"""

import re
from pathlib import Path

def fix_async_function_error_handling(filepath, function_name, line_number):
    """Add error handling to an async function"""
    try:
        content = Path(filepath).read_text()
        lines = content.split('\n')
        
        # Find the function definition
        func_start = line_number - 1
        if func_start >= len(lines):
            return False, "Line number out of range"
        
        func_line = lines[func_start]
        
        # Check if it's an async function
        if 'async' not in func_line:
            return False, "Not an async function"
        
        # Check if it already has try-catch
        # Look ahead to see if there's a try block
        has_try = False
        for i in range(func_start, min(func_start + 10, len(lines))):
            if 'try' in lines[i] and '{' in lines[i]:
                has_try = True
                break
        
        if has_try:
            return False, "Already has error handling"
        
        # Find the opening brace
        open_brace_line = func_start
        for i in range(func_start, min(func_start + 5, len(lines))):
            if '{' in lines[i]:
                open_brace_line = i
                break
        
        # Find the closing brace (simplified - just look for the first closing brace at same level)
        # This is a simplified approach - in production, you'd want proper brace matching
        close_brace_line = open_brace_line + 1
        brace_count = 0
        for i in range(open_brace_line, len(lines)):
            brace_count += lines[i].count('{')
            brace_count -= lines[i].count('}')
            if brace_count == 0:
                close_brace_line = i
                break
        
        # Extract the function body
        func_body = lines[open_brace_line + 1:close_brace_line]
        
        # Add try-catch wrapper
        indent = '  '  # 2 spaces
        new_body = [f'{indent}try {{']
        for line in func_body:
            new_body.append(f'{indent}  {line}')
        new_body.append(f'{indent}}} catch (error) {{')
        new_body.append(f'{indent}  console.error(\'Error in {function_name}:\', error);')
        new_body.append(f'{indent}  throw error; // Re-throw to allow caller to handle')
        new_body.append(f'{indent}}}')
        
        # Replace the function body
        new_lines = lines[:open_brace_line + 1] + new_body + lines[close_brace_line:]
        
        # Write back
        Path(filepath).write_text('\n'.join(new_lines))
        
        return True, f"Added error handling to {function_name}"
        
    except Exception as e:
        return False, f"Error: {str(e)}"

def main():
    """Fix all MISSING_ERROR_HANDLING issues"""
    issues_file = Path('/workspace/docs/analysis/ISSUES_ANALYSIS.json')
    
    if not issues_file.exists():
        print("ISSUES_ANALYSIS.json not found")
        return
    
    import json
    with open(issues_file) as f:
        issues_data = json.load(f)
    
    # Filter for MISSING_ERROR_HANDLING issues
    missing_error_handling = []
    for file_data in issues_data['files']:
        for issue in file_data['issues']:
            if issue['type'] == 'MISSING_ERROR_HANDLING':
                missing_error_handling.append({
                    'file': file_data['file'],
                    'line': issue['line'],
                    'message': issue['message']
                })
    
    print(f"Found {len(missing_error_handling)} MISSING_ERROR_HANDLING issues")
    print()
    
    fixed = 0
    failed = 0
    
    for issue in missing_error_handling:
        filepath = f"/workspace/{issue['file']}"
        function_name = issue['message'].split(' ')[-1]  # Extract function name from message
        
        print(f"Fixing: {issue['file']}:{issue['line']} - {function_name}")
        success, message = fix_async_function_error_handling(filepath, function_name, issue['line'])
        
        if success:
            print(f"  ✅ {message}")
            fixed += 1
        else:
            print(f"  ❌ {message}")
            failed += 1
        print()
    
    print("=" * 80)
    print(f"Fixed: {fixed}")
    print(f"Failed: {failed}")
    print(f"Total: {len(missing_error_handling)}")

if __name__ == '__main__':
    main()