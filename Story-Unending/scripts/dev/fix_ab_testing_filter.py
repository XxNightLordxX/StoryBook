#!/usr/bin/env python3
"""
Script to fix the loadResultsFilter function in ab-testing-ui.js
"""
import re
from pathlib import Path

def fix_ab_testing_filter():
    """Fix the loadResultsFilter function."""
    filepath = Path('/workspace/js/ui/ab-testing-ui.js')
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Find and replace the function
        old_function = r'''  function loadResultsFilter\(\) \{
    const experiments = window\.ABTesting\.getAllExperiments\(\);
    const filter = document\.getElementById\('ab-testing-results-filter'\);

    filter\.innerHTML = '<option value="">Select Experiment</option>' \+
      experiments\.map\(exp => `
        <option value="\$\{exp\.id\}">\$\{exp\.name\} \(\$\{exp\.status\}\)</option>
      `\)\.join\(''\);
  \}'''
        
        new_function = '''  function loadResultsFilter() {
    const experiments = window.ABTesting.getAllExperiments();
    const filter = document.getElementById('ab-testing-results-filter');

    // Clear existing options
    filter.innerHTML = '';
    
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
    });
  }'''
        
        content = re.sub(old_function, new_function, content, flags=re.DOTALL)
        
        # Write back if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print("✅ Fixed loadResultsFilter function")
            return True
        else:
            print("⚠️  Function not found or already fixed")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    fix_ab_testing_filter()