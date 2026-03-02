#!/usr/bin/env python3
"""Add try/catch to all API endpoint functions that lack it"""

def fix_api_functions():
    with open('js/modules/api.js', 'r') as f:
        lines = f.readlines()
    
    original = ''.join(lines)
    result = []
    i = 0
    fixes = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Detect async function pattern: const funcName = async (params) => {
        if ('= async' in line and '=>' in line and line.strip().endswith('{')
            and 'const request' not in line):
            
            # Check if next non-empty line is a return statement (simple one-liner body)
            j = i + 1
            while j < len(lines) and lines[j].strip() == '':
                j += 1
            
            if j < len(lines) and 'return await request(' in lines[j]:
                # Check if there's already a try block
                if 'try {' not in lines[j] and (j + 1 >= len(lines) or 'try {' not in lines[j+1]):
                    # Find the closing brace
                    return_line = lines[j]
                    k = j + 1
                    # Handle multi-line return statements
                    brace_depth = return_line.count('{') - return_line.count('}')
                    paren_depth = return_line.count('(') - return_line.count(')')
                    while k < len(lines) and (brace_depth > 0 or paren_depth > 0):
                        brace_depth += lines[k].count('{') - lines[k].count('}')
                        paren_depth += lines[k].count('(') - lines[k].count(')')
                        k += 1
                    
                    # Extract function name
                    import re
                    name_match = re.search(r'const\s+(\w+)\s*=', line)
                    func_name = name_match.group(1) if name_match else 'unknown'
                    
                    # Get indentation
                    indent = len(line) - len(line.lstrip())
                    base_indent = ' ' * indent
                    inner_indent = base_indent + '    '
                    
                    # Write the function header
                    result.append(line)
                    # Add try block
                    result.append(inner_indent + 'try {\n')
                    # Add the return statement(s) with extra indentation
                    for idx in range(j, k):
                        orig_line = lines[idx]
                        if orig_line.strip():
                            result.append('    ' + orig_line)
                        else:
                            result.append(orig_line)
                    # Add catch block
                    result.append(inner_indent + '} catch (error) {\n')
                    result.append(inner_indent + f'    throw new Error(`API {func_name} failed: ${{error.message}}`);\n')
                    result.append(inner_indent + '}\n')
                    
                    i = k
                    fixes += 1
                    continue
        
        result.append(line)
        i += 1
    
    content = ''.join(result)
    
    # Also fix trailing slash
    content = content.replace("'/search/'", "'/search'")
    
    with open('js/modules/api.js', 'w') as f:
        f.write(content)
    
    print(f"Added try/catch to {fixes} API functions")
    
    # Verify syntax
    import subprocess
    r = subprocess.run(['node', '-c', 'js/modules/api.js'], capture_output=True, text=True)
    if r.returncode == 0:
        print("✅ Syntax validation passed")
    else:
        print(f"❌ Syntax error: {r.stderr}")
        with open('js/modules/api.js', 'w') as f:
            f.write(original)
        print("Restored original file")

fix_api_functions()