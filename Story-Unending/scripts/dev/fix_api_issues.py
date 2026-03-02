#!/usr/bin/env python3
"""Fix API validation issues: add try/catch, fix trailing slash, add CORS config"""

import re

def fix_api_file():
    with open('js/modules/api.js', 'r') as f:
        content = f.read()
    
    original = content
    
    # 1. Fix trailing slash on /search/ endpoint
    content = content.replace("'/search/'", "'/search'")
    content = content.replace('"/search/"', '"/search"')
    
    # 2. Add try/catch to simple API endpoint functions
    # Pattern: const funcName = async (params) => {\n        return await request(...)\n    }
    pattern = r'(    const (\w+) = async \(([^)]*)\) => \{\n)(        return await request\([^)]+(?:\{[^}]*\})?\);?\n)(    \})'
    
    def add_try_catch(match):
        func_header = match.group(1)
        func_name = match.group(2)
        request_line = match.group(4)
        func_end = match.group(5)
        
        # Skip if already has try/catch or if it's the main request function
        if func_name in ['request', 'parseResponse', 'handleRateLimit']:
            return match.group(0)
        
        return (
            func_header +
            '        try {\n' +
            '    ' + request_line +
            '        } catch (error) {\n' +
            f'            throw new Error(`API {func_name} failed: ${{error.message}}`);\n' +
            '        }\n' +
            func_end
        )
    
    content = re.sub(pattern, add_try_catch, content)
    
    # Count changes
    changes = 0
    if content != original:
        # Count try/catch additions
        changes = content.count('try {') - original.count('try {')
    
    # 3. Check if CORS config exists, if not add it
    if 'CORS' not in content and 'cors' not in content and 'Access-Control' not in content:
        # Find the CONSTANTS section to add CORS config
        cors_config = """
    // CORS Configuration
    const CORS_CONFIG = {
        allowedOrigins: ['*'],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        maxAge: 86400
    };
"""
        # Insert after BASE_URL line
        content = content.replace(
            "const BASE_URL = '/api/' + API_VERSION;",
            "const BASE_URL = '/api/' + API_VERSION;\n" + cors_config
        )
        changes += 1
    
    with open('js/modules/api.js', 'w') as f:
        f.write(content)
    
    print(f"Fixed {changes} issues in api.js")
    
    # Verify syntax
    import subprocess
    result = subprocess.run(['node', '-c', 'js/modules/api.js'], capture_output=True, text=True)
    if result.returncode == 0:
        print("✅ Syntax validation passed")
    else:
        print(f"❌ Syntax error: {result.stderr}")
        # Restore original
        with open('js/modules/api.js', 'w') as f:
            f.write(original)
        print("Restored original file")

fix_api_file()