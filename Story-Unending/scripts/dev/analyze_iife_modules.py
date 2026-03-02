#!/usr/bin/env python3
"""
Analyze IIFE modules for ES6 conversion
Identifies all IIFE patterns and dependencies
"""

import os
import re
from pathlib import Path
from collections import defaultdict

def analyze_js_files():
    """Analyze all JavaScript files for IIFE patterns"""
    js_dir = Path("/workspace/js")
    
    iife_modules = []
    dependencies = defaultdict(set)
    
    # Find all JS files
    for js_file in js_dir.rglob("*.js"):
        content = js_file.read_text()
        
        # Check for IIFE pattern
        iife_pattern = r'\(function\s*\([^)]*\)\s*\{'
        if re.search(iife_pattern, content):
            # Extract module name from file
            module_name = js_file.stem
            
            # Find global exports
            export_pattern = r'window\.(\w+)\s*='
            exports = re.findall(export_pattern, content)
            
            # Find dependencies (window.Namespace references)
            dep_pattern = r'window\.(\w+)\.'
            deps = set(re.findall(dep_pattern, content))
            deps.discard(module_name)  # Remove self-reference
            
            # Count functions
            func_pattern = r'\s+(?:async\s+)?function\s+(\w+)'
            functions = re.findall(func_pattern, content)
            
            # Count lines
            lines = len(content.split('\n'))
            
            iife_modules.append({
                'file': str(js_file.relative_to('/workspace')),
                'name': module_name,
                'exports': exports,
                'dependencies': sorted(deps),
                'functions': len(functions),
                'lines': lines
            })
            
            # Track dependencies
            for dep in deps:
                dependencies[module_name].add(dep)
    
    return iife_modules, dependencies

def generate_conversion_plan(iife_modules, dependencies):
    """Generate conversion plan with order"""
    
    # Sort by dependencies (modules with fewer dependencies first)
    def dependency_count(module):
        return len(module['dependencies'])
    
    sorted_modules = sorted(iife_modules, key=dependency_count)
    
    return sorted_modules

def main():
    """Main analysis function"""
    print("=" * 80)
    print("IIFE Module Analysis for ES6 Conversion")
    print("=" * 80)
    
    iife_modules, dependencies = analyze_js_files()
    
    print(f"\nFound {len(iife_modules)} IIFE modules\n")
    
    # Print module details
    for module in iife_modules:
        print(f"\n{'=' * 80}")
        print(f"Module: {module['name']}")
        print(f"File: {module['file']}")
        print(f"Lines: {module['lines']}")
        print(f"Functions: {module['functions']}")
        print(f"Exports: {', '.join(module['exports']) if module['exports'] else 'None'}")
        print(f"Dependencies: {', '.join(module['dependencies']) if module['dependencies'] else 'None'}")
        print('=' * 80)
    
    # Generate conversion plan
    conversion_plan = generate_conversion_plan(iife_modules, dependencies)
    
    print(f"\n\n{'=' * 80}")
    print("Conversion Plan (Dependency Order)")
    print('=' * 80)
    
    for i, module in enumerate(conversion_plan, 1):
        print(f"\n{i}. {module['name']}")
        print(f"   File: {module['file']}")
        print(f"   Dependencies: {len(module['dependencies'])}")
        if module['dependencies']:
            print(f"   Requires: {', '.join(module['dependencies'])}")
    
    # Save analysis to file
    output_file = Path("/workspace/IIFE_ANALYSIS.md")
    with open(output_file, 'w') as f:
        f.write("# IIFE Module Analysis\n\n")
        f.write(f"Total Modules: {len(iife_modules)}\n\n")
        
        f.write("## Module Details\n\n")
        for module in iife_modules:
            f.write(f"### {module['name']}\n\n")
            f.write(f"- **File**: {module['file']}\n")
            f.write(f"- **Lines**: {module['lines']}\n")
            f.write(f"- **Functions**: {module['functions']}\n")
            f.write(f"- **Exports**: {', '.join(module['exports']) if module['exports'] else 'None'}\n")
            f.write(f"- **Dependencies**: {', '.join(module['dependencies']) if module['dependencies'] else 'None'}\n\n")
        
        f.write("## Conversion Order\n\n")
        for i, module in enumerate(conversion_plan, 1):
            f.write(f"{i}. {module['name']} ({module['file']})\n")
            if module['dependencies']:
                f.write(f"   - Depends on: {', '.join(module['dependencies'])}\n")
    
    print(f"\n\nAnalysis saved to: {output_file}")
    print(f"\nTotal modules to convert: {len(iife_modules)}")
    
    return 0

if __name__ == "__main__":
    exit(main())