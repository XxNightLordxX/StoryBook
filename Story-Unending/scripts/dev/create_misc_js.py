#!/usr/bin/env python3
"""Create proper misc.js file from embedded_js_temp.js"""

import re

# Read the embedded file
with open('utils/embedded_js_temp.js', 'r') as f:
    content = f.read()

# Extract all function definitions we need
functions_to_extract = [
    'catchUpAndStart',
    'generateNewChapter',
    'showChapter',
    'updateNavButtons',
    'updateDropdownStats',
    'jumpToLatestChapter',
    'getTypeIcon',
    'sendResetEmail',
    'simulateResetLink',
    'resetPassword',
    'logout',
    'checkSavedLogin',
    'saveProgress',
    'setChapterSpeed',
    'setCustomSpeed',
    'formatSpeed',
    'updateSpeedDisplay',
    'highlightActiveSpeed',
    'toggleDirectorMode',
    'showDirectorModeToggle',
    'hideDirectorModeToggle',
    'toggleDirectorModeFromUser',
    'toggleSection',
    'toggleStatusScreen',
    'updateStatusScreen',
    'setCustomSpeedScreen',
    'submitDirectiveScreen',
    'addStoryRule',
    'updateStoryRulesList',
    'removeStoryRule',
    'getActiveRules',
    'updateGenerationMode',
    'updateAdminProgressInfo',
    'resetStory',
    'quickResetStory',
    'togglePause',
    'submitDirective',
    'updateDirectiveList',
    'updateAdminCredentials',
    'updateAdminCredsDisplay',
    'toggleAdminPwVisibility',
    'loadUserList',
    'filterUsers',
    'deleteUser',
    'editUserEmail',
    'selectDonation',
    'openPayPalDonation',
    'confirmDonation',
    'closeDonateModal',
    'openPayPalSubscription',
    'confirmSubscription',
    'closeSubModal'
]

# Build the misc.js content
misc_content = """/**
 * Miscellaneous functions
 * Extracted from index.html
 */

(function() {
  // Generation mode configuration
  let generationMode = localStorage.getItem('ese_generationMode') || 'unlimited';

"""

# Extract each function
for func_name in functions_to_extract:
    # Try to match function declaration with proper brace counting
    pattern = rf'function {func_name}\([^)]*\) \{{'
    match = re.search(pattern, content)
    
    if match:
        start_pos = match.start()
        # Find the matching closing brace
        brace_count = 0
        in_function = False
        end_pos = start_pos
        
        for i in range(start_pos, len(content)):
            char = content[i]
            if char == '{':
                brace_count += 1
                in_function = True
            elif char == '}':
                brace_count -= 1
                if in_function and brace_count == 0:
                    end_pos = i + 1
                    break
        
        func_code = content[start_pos:end_pos]
        # Convert function declarations to const arrow functions
        func_code = func_code.replace(f'function {func_name}', f'const {func_name} =')
        misc_content += func_code + '\n\n'
    else:
        print(f"Warning: Function {func_name} not found")

# Add exports
misc_content += """  // Create namespace object
  const MiscFunctions = {
"""

# Add function names to exports
for func_name in functions_to_extract:
    misc_content += f'    {func_name}: {func_name},\n'

misc_content += """    generationMode: generationMode
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.MiscFunctions = MiscFunctions;
    // Also export individual functions for backward compatibility
"""

for func_name in functions_to_extract:
    misc_content += f'    window.{func_name} = {func_name};\n'

misc_content += """    window.generationMode = generationMode;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MiscFunctions;
  }
})();
"""

# Write the file
with open('js/modules/misc.js', 'w') as f:
    f.write(misc_content)

print(f"Created js/modules/misc.js with {len(functions_to_extract)} functions")