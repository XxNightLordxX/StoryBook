#!/usr/bin/env python3
"""Fix misc.js by adding IIFE wrapper and exports"""

import re

# Read the file
with open('js/modules/misc.js', 'r') as f:
    content = f.read()

# Extract only const function declarations (arrow functions and regular functions)
# Match patterns like: const name = () => { or const name = function() {
const_functions = set(re.findall(r'    const (\w+) = \(\)', content))
const_functions.update(re.findall(r'    const (\w+) = \([^)]*\) =>', content))
const_functions.update(re.findall(r'    const (\w+) = function', content))

# Sort for consistency
const_functions = sorted(const_functions)

# Create the export object
exports_lines = [f'      {name}: {name}' for name in const_functions]
exports = ',\n    '.join(exports_lines)

# Create individual window exports
window_exports = '\n'.join([f'    window.{name} = {name};' for name in const_functions])

# Wrap in IIFE with exports
wrapped_content = """/**
 * Miscellaneous functions
 * Extracted from index.html
 */

(function() {
""" + content + """

  // Create namespace object
  const MiscFunctions = {
""" + exports + """
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.MiscFunctions = MiscFunctions;
    // Also export individual functions for backward compatibility
""" + window_exports + """
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MiscFunctions;
  }
})();
"""

# Write the fixed file
with open('js/modules/misc.js', 'w') as f:
    f.write(wrapped_content)

print(f"Fixed js/modules/misc.js with {len(const_functions)} exported functions")
print(f"Exported functions: {', '.join(const_functions)}")