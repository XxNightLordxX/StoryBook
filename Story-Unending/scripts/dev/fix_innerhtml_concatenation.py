#!/usr/bin/env python3
"""
Script to fix innerHTML concatenation issues.
"""
import re
from pathlib import Path

def fix_innerhtml_concatenation(filepath):
    """Fix innerHTML concatenation in a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Pattern to find innerHTML concatenation
        pattern = r"filter\.innerHTML = '<option value=&quot;&quot;>Select Experiment</option>' \+\s*experiments\.map\(exp => `\s*<option value=&quot;\$\{exp\.id\}&quot;>\$\{exp\.name\} \(\$\{exp\.status\}\)</option>\s*`\)\.join\(''\);"
        
        replacement = """filter.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Experiment';
    filter.appendChild(defaultOption);
    
    // Add experiment options
    experiments.forEach(exp => {
      const option = document.createElement('option');
      option.value = sanitizeHTML(exp.id);
      option.textContent = `${sanitizeHTML(exp.name)} (${sanitizeHTML(exp.status)})`;
      filter.appendChild(option);
    });"""
        
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        
        # Write back if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed innerHTML concatenation in {filepath.name}")
            return True
        else:
            print(f"⚠️  No innerHTML concatenation found in {filepath.name}")
            return False
            
    except Exception as e:
        print(f"❌ Error fixing {filepath.name}: {e}")
        return False

def main():
    """Main function."""
    filepath = Path('/workspace/js/ui/ab-testing-ui.js')
    if filepath.exists():
        fix_innerhtml_concatenation(filepath)

if __name__ == '__main__':
    main()