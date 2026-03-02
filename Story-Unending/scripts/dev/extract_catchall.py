#!/usr/bin/env python3
import re

# Read the embedded JavaScript
with open('embedded_js_temp.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Get all function definitions
function_pattern = r'^    function (\w+)\('
functions = re.findall(function_pattern, content, re.MULTILINE)

print(f"Found {len(functions)} functions in embedded JS")
print("\nFunctions:")
for i, func in enumerate(functions, 1):
    print(f"{i}. {func}")

# Check which functions we've already extracted
extracted_files = [
    'js/utils/security.js',
    'js/utils/storage.js',
    'js/utils/helpers.js',
    'js/modules/app-state.js',
    'js/modules/story-timeline.js',
    'js/modules/auth.js',
    'js/modules/navigation.js',
    'js/modules/admin.js',
    'js/modules/initialization.js',
    'js/modules/generation.js',
    'js/modules/donation.js',
    'js/modules/directive.js',
    'js/modules/reset-password.js',
    'js/ui/dropdown.js',
    'js/ui/text-size.js',
    'js/ui/text-size-extended.js',
    'js/ui/modals.js',
    'js/ui/notifications.js',
    'js/ui/keyboard-shortcuts.js',
    'js/ui/sidebar.js',
    'js/ui/stats.js'
]

# Read all extracted files to see what functions we have
extracted_functions = set()
for file_path in extracted_files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            file_content = f.read()
            file_functions = re.findall(r'function (\w+)\(', file_content)
            extracted_functions.update(file_functions)
    except FileNotFoundError:
        pass

print(f"\nExtracted {len(extracted_functions)} functions")

# Find remaining functions
remaining_functions = set(functions) - extracted_functions
print(f"\nRemaining {len(remaining_functions)} functions:")
for i, func in enumerate(sorted(remaining_functions), 1):
    print(f"{i}. {func}")

# Extract remaining functions into a catch-all module
remaining_content = []
lines = content.split('\n')
in_function = False
function_indent = None

for i, line in enumerate(lines):
    # Check if this is a function definition we haven't extracted
    match = re.match(r'^    function (\w+)\(', line)
    if match:
        func_name = match.group(1)
        if func_name in remaining_functions:
            in_function = True
            function_indent = len(line) - len(line.lstrip())
    
    if in_function:
        remaining_content.append(line)
        
        # Check if function has ended
        if line.strip() and not line.strip().startswith('//'):
            current_indent = len(line) - len(line.lstrip())
            if current_indent <= function_indent and 'function' not in line:
                # Check if this is the end of the function
                if line.strip().endswith('}') or (i > 0 and lines[i-1].strip().endswith('}')):
                    in_function = False

if remaining_content:
    with open('js/modules/misc.js', 'w', encoding='utf-8') as f:
        f.write("/**\n * Miscellaneous functions\n * Extracted from index.html\n */\n\n")
        f.write('\n'.join(remaining_content))
    
    print(f"\n✓ Extracted remaining functions to js/modules/misc.js ({len(remaining_content)} lines)")
else:
    print("\n✓ All functions have been extracted!")