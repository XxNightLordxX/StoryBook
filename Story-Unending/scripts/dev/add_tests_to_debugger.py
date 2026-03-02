#!/usr/bin/env python3
"""Add the 3 test implementations to continuous_debugger.py"""

with open('continuous_debugger.py', 'r') as f:
    content = f.read()

# The new test methods to insert before WEB SEARCH section
new_tests = '''    # ==================== MEMORY LEAK DETECTION ====================
    
    def run_memory_leak_check(self):
        """Detect potential memory leaks in JavaScript code"""
        issues = []
        
        print("  Running memory leak detection...")
        
        js_files = []
        for root, dirs, files in os.walk('js'):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'coverage']]
            for file in files:
                if file.endswith('.js') and not file.endswith('.backup'):
                    js_files.append(os.path.join(root, file))
        
        for js_file in js_files:
            try:
                with open(js_file, 'r') as f:
                    content = f.read()
                    lines = content.split('\\n')
                
                add_listeners = []
                remove_listeners = []
                
                for line_num, line in enumerate(lines, 1):
                    stripped = line.strip()
                    if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
                        continue
                    
                    # Check addEventListener
                    if 'addEventListener(' in line:
                        match = re.search(r"addEventListener\\(\\s*['\&quot;](\\w+)['\&quot;"]", line)
                        if match:
                            add_listeners.append({'event': match.group(1), 'line': line_num})
                    
                    if 'removeEventListener(' in line:
                        match = re.search(r"removeEventListener\\(\\s*['\&quot;](\\w+)['\&quot;"]", line)
                        if match:
                            remove_listeners.append({'event': match.group(1), 'line': line_num})
                    
                    # Check untracked setInterval
                    if re.search(r'setInterval\\s*\\(', line):
                        if not re.search(r'(const|let|var|this\\.\\w+|\\w+)\\s*=\\s*setInterval', line):
                            issues.append({
                                'title': 'Potential Memory Leak - Untracked setInterval',
                                'severity': 'high',
                                'location': f'{js_file}:{line_num}',
                                'description': f'setInterval() without stored reference: {stripped[:60]}'
                            })
                    
                    # Check global DOM references
                    if re.search(r'window\\.\\w+\\s*=\\s*document\\.(getElementById|querySelector|getElementsBy)', line):
                        issues.append({
                            'title': 'Potential Memory Leak - Global DOM Reference',
                            'severity': 'medium',
                            'location': f'{js_file}:{line_num}',
                            'description': f'DOM element stored as global: {stripped[:60]}'
                        })
                    
                    # Check unbounded collections
                    if re.search(r'\\.\\s*push\\s*\\(', line):
                        if re.search(r'(history|log|buffer|queue|cache|stack)', line, re.IGNORECASE):
                            context_start = max(0, line_num - 20)
                            context = '\\n'.join(lines[context_start:line_num])
                            context_after = '\\n'.join(lines[line_num:min(len(lines), line_num + 10)])
                            if not re.search(r'(splice|shift|slice|\\.length\\s*[<>]|max[Ss]ize|limit|MAX_)', context + context_after):
                                issues.append({
                                    'title': 'Potential Memory Leak - Unbounded Collection',
                                    'severity': 'medium',
                                    'location': f'{js_file}:{line_num}',
                                    'description': f'Collection grows without size limit: {stripped[:60]}'
                                })
                
                # Check unbalanced listeners
                added_events = set(l['event'] for l in add_listeners)
                removed_events = set(l['event'] for l in remove_listeners)
                unremoved = added_events - removed_events
                
                if len(add_listeners) > 3 and len(unremoved) > 0:
                    unremoved_details = [l for l in add_listeners if l['event'] in unremoved]
                    if len(unremoved_details) > 3:
                        issues.append({
                            'title': 'Potential Memory Leak - Unremoved Event Listeners',
                            'severity': 'medium',
                            'location': js_file,
                            'description': f'{len(unremoved_details)} addEventListener without removeEventListener'
                        })
            
            except Exception as e:
                issues.append({
                    'title': 'Memory Leak Check Error',
                    'severity': 'low',
                    'location': js_file,
                    'description': str(e)
                })
        
        print(f"  Found {len(issues)} potential memory leak issues")
        return issues
    
    # ==================== CROSS-BROWSER COMPATIBILITY ====================
    
    def run_cross_browser_check(self):
        """Check for cross-browser compatibility issues"""
        issues = []
        
        print("  Running cross-browser compatibility check...")
        
        js_files = []
        for root, dirs, files in os.walk('js'):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'coverage']]
            for file in files:
                if file.endswith('.js') and not file.endswith('.backup'):
                    js_files.append(os.path.join(root, file))
        
        for file in os.listdir('.'):
            if file.endswith('.js') and file not in ['vite.config.js']:
                js_files.append(file)
        
        js_compat = [
            (r'\\.replaceAll\\(', 'String.replaceAll() - not supported in Chrome < 85, Firefox < 77', 'medium'),
            (r'globalThis\\b', 'globalThis - not supported in Chrome < 71, Firefox < 65', 'medium'),
            (r'structuredClone\\b', 'structuredClone() - not supported in Chrome < 98, Safari < 15.4', 'medium'),
            (r'\\.at\\(', 'Array/String.at() - not supported in Chrome < 92, Firefox < 90', 'medium'),
            (r'Object\\.hasOwn\\b', 'Object.hasOwn() - not supported in Chrome < 93, Firefox < 92', 'medium'),
            (r'\\?\\.[\\w\\[]', 'Optional chaining (?.) - not supported in Chrome < 80, Firefox < 74', 'low'),
            (r'\\?\\?[^=]', 'Nullish coalescing (??) - not supported in Chrome < 80, Firefox < 72', 'low'),
            (r'\\bIntersectionObserver\\b', 'IntersectionObserver - not supported in Safari < 12.1', 'low'),
        ]
        
        for js_file in js_files:
            try:
                with open(js_file, 'r') as f:
                    lines = f.readlines()
                
                for line_num, line in enumerate(lines, 1):
                    stripped = line.strip()
                    if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
                        continue
                    
                    for pattern, description, severity in js_compat:
                        match = re.search(pattern, line)
                        if match:
                            before = line[:match.start()]
                            sq = before.count("'") - before.count("\\\\'")
                            dq = before.count(chr(34)) - before.count(chr(92) + chr(34))
                            bt = before.count('`')
                            if sq % 2 == 0 and dq % 2 == 0 and bt % 2 == 0:
                                issues.append({
                                    'title': 'Cross-Browser Compatibility Issue',
                                    'severity': severity,
                                    'location': f'{js_file}:{line_num}',
                                    'description': description
                                })
            except Exception as e:
                pass
        
        # Check CSS files
        css_compat = [
            (r'backdrop-filter\\s*:', 'CSS backdrop-filter - needs -webkit- prefix for Safari', 'low'),
            (r'aspect-ratio\\s*:', 'CSS aspect-ratio - not supported in Chrome < 88, Firefox < 89', 'low'),
            (r'@container\\b', 'CSS Container Queries - not supported in Chrome < 105, Firefox < 110', 'medium'),
            (r'@layer\\b', 'CSS Cascade Layers - not supported in Chrome < 99, Firefox < 97', 'medium'),
        ]
        
        css_files = []
        for root, dirs, files in os.walk('.'):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'coverage']]
            for file in files:
                if file.endswith('.css'):
                    css_files.append(os.path.join(root, file))
        
        for css_file in css_files:
            try:
                with open(css_file, 'r') as f:
                    lines = f.readlines()
                for line_num, line in enumerate(lines, 1):
                    stripped = line.strip()
                    if stripped.startswith('/*') or stripped.startswith('*'):
                        continue
                    for pattern, description, severity in css_compat:
                        if re.search(pattern, line):
                            issues.append({
                                'title': 'CSS Cross-Browser Compatibility Issue',
                                'severity': severity,
                                'location': f'{css_file}:{line_num}',
                                'description': description
                            })
            except Exception:
                pass
        
        # Check service worker feature detection
        if os.path.exists('sw.js') and os.path.exists('index.html'):
            try:
                with open('index.html', 'r') as f:
                    html = f.read()
                if 'serviceWorker' in html:
                    has_check = ("'serviceWorker' in navigator" in html or 
                                 chr(34) + "serviceWorker" + chr(34) + " in navigator" in html)
                    if not has_check:
                        issues.append({
                            'title': 'Service Worker Missing Feature Detection',
                            'severity': 'low',
                            'location': 'index.html',
                            'description': 'Service worker registration should check browser support'
                        })
            except Exception:
                pass
        
        print(f"  Found {len(issues)} cross-browser compatibility issues")
        return issues
    
    # ==================== API ENDPOINT VALIDATION ====================
    
    def run_api_validation(self):
        """Validate all API endpoints and responses"""
        issues = []
        
        print("  Running API endpoint validation...")
        
        api_file = 'js/modules/api.js'
        if not os.path.exists(api_file):
            issues.append({
                'title': 'API Module Missing',
                'severity': 'critical',
                'location': 'js/modules/',
                'description': 'No api.js module found'
            })
            return issues
        
        with open(api_file, 'r') as f:
            api_content = f.read()
            api_lines = api_content.split('\\n')
        
        # Extract endpoints
        defined_endpoints = {}
        current_group = None
        ep_pattern = re.compile(r"""(\\w+):\\s*['"](/[^'"]+)['"]""")
        section_pattern = re.compile(r"(\\w+):\\s*\\{")
        
        for line_num, line in enumerate(api_lines, 1):
            section_match = section_pattern.search(line)
            if section_match and line_num < 100:
                current_group = section_match.group(1)
            
            endpoint_match = ep_pattern.search(line)
            if endpoint_match and line_num < 100:
                name = endpoint_match.group(1)
                path = endpoint_match.group(2)
                key = f"{current_group}.{name}" if current_group else name
                defined_endpoints[key] = {'path': path, 'line': line_num, 'group': current_group}
        
        print(f"  Found {len(defined_endpoints)} defined endpoints")
        
        # Check endpoint consistency
        for key, endpoint in defined_endpoints.items():
            path = endpoint['path']
            
            if re.search(r'[A-Z]', path):
                issues.append({
                    'title': 'API Endpoint Naming Issue',
                    'severity': 'low',
                    'location': f'{api_file}:{endpoint["line"]}',
                    'description': f'Endpoint contains uppercase (not RESTful): {path}'
                })
            
            if path.endswith('/') and path != '/':
                issues.append({
                    'title': 'API Endpoint Trailing Slash',
                    'severity': 'low',
                    'location': f'{api_file}:{endpoint["line"]}',
                    'description': f'Endpoint has trailing slash: {path}'
                })
        
        # Check endpoint usage
        req_pattern = re.compile(r"""request\\(\\s*['"](\w+)['"],\\s*ENDPOINTS\\.(\\w+)\\.(\\w+)""")
        used_endpoints = []
        for line_num, line in enumerate(api_lines, 1):
            req_match = req_pattern.search(line)
            if req_match:
                used_endpoints.append({
                    'method': req_match.group(1),
                    'group': req_match.group(2),
                    'name': req_match.group(3),
                    'line': line_num,
                    'key': f"{req_match.group(2)}.{req_match.group(3)}"
                })
        
        # Check HTTP method consistency
        method_rules = {
            'LIST': 'GET', 'GET': 'GET', 'CREATE': 'POST',
            'UPDATE': 'PUT', 'DELETE': 'DELETE', 'LOGIN': 'POST',
            'LOGOUT': 'POST', 'REFRESH': 'POST', 'VERIFY': 'GET',
        }
        
        for usage in used_endpoints:
            expected = method_rules.get(usage['name'])
            if expected and usage['method'] != expected:
                issues.append({
                    'title': 'API Method Mismatch',
                    'severity': 'medium',
                    'location': f'{api_file}:{usage["line"]}',
                    'description': f'{usage["key"]} uses {usage["method"]} but expected {expected}'
                })
        
        # Check for error handling in async functions
        in_function = False
        func_start = 0
        func_name = ""
        has_try = False
        
        for line_num, line in enumerate(api_lines, 1):
            func_match = re.search(r'(const|let|var)\\s+(\\w+)\\s*=\\s*async', line)
            if func_match and 'request' not in func_match.group(2):
                if in_function and not has_try:
                    issues.append({
                        'title': 'API Function Missing Error Handling',
                        'severity': 'medium',
                        'location': f'{api_file}:{func_start}',
                        'description': f'API function "{func_name}" lacks try/catch'
                    })
                in_function = True
                func_start = line_num
                func_name = func_match.group(2)
                has_try = False
            
            if in_function:
                if 'try {' in line or 'try{' in line:
                    has_try = True
        
        # Check rate limiting
        if 'rateLimit' not in api_content and 'RateLimit' not in api_content:
            issues.append({
                'title': 'API Missing Rate Limiting',
                'severity': 'medium',
                'location': api_file,
                'description': 'No rate limiting found in API module'
            })
        
        # Check CORS
        if 'cors' not in api_content.lower() and 'Access-Control' not in api_content:
            issues.append({
                'title': 'API Missing CORS Configuration',
                'severity': 'low',
                'location': api_file,
                'description': 'No CORS configuration found'
            })
        
        # Check timeout handling
        if 'timeout' not in api_content.lower() and 'AbortController' not in api_content:
            issues.append({
                'title': 'API Missing Request Timeout',
                'severity': 'medium',
                'location': api_file,
                'description': 'No request timeout handling found'
            })
        
        # Check CRUD completeness
        endpoint_groups = {}
        for key, ep in defined_endpoints.items():
            group = ep['group']
            if group not in endpoint_groups:
                endpoint_groups[group] = set()
            name = key.split('.')[-1] if '.' in key else key
            endpoint_groups[group].add(name)
        
        crud_ops = {'LIST', 'GET', 'CREATE', 'UPDATE', 'DELETE'}
        for group, ops in endpoint_groups.items():
            if group in ['AUTH', 'SEARCH', 'ANALYTICS']:
                continue
            missing = crud_ops - ops
            if missing and len(ops) >= 3:
                issues.append({
                    'title': 'API Incomplete CRUD Operations',
                    'severity': 'low',
                    'location': api_file,
                    'description': f'Group "{group}" missing: {", ".join(sorted(missing))}'
                })
        
        print(f"  Found {len(issues)} API validation issues")
        return issues
    
'''

# Insert before WEB SEARCH section
marker = '    # ==================== WEB SEARCH ===================='
content = content.replace(marker, new_tests + marker)

with open('continuous_debugger.py', 'w') as f:
    f.write(content)

print("Tests inserted successfully")

# Verify
import subprocess
result = subprocess.run(['python3', '-c', 'import continuous_debugger; print("OK")'], 
                       capture_output=True, text=True)
if result.returncode == 0:
    print(f"✅ {result.stdout.strip()}")
else:
    print(f"❌ {result.stderr[:300]}")