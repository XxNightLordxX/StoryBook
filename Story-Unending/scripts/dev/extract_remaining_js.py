#!/usr/bin/env python3
import re

# Read the embedded JavaScript
with open('embedded_js_temp.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define additional modules for remaining content
additional_modules = {
    'js/utils/helpers.js': {
        'patterns': [
            r'function getTotalChaptersShouldExist',
            r'function getTypeIcon',
            r'function getChapterStats'
        ],
        'description': 'Helper functions for calculations and utilities'
    },
    'js/ui/text-size-extended.js': {
        'patterns': [
            r'function setTextSize',
            r'function applyTextSize',
            r'function updateTextSizeInput'
        ],
        'description': 'Extended text size control functions'
    },
    'js/modules/generation.js': {
        'patterns': [
            r'function initSessionTimer',
            r'function catchUpAndStart',
            r'function generateNewChapter',
            r'function showChapter',
            r'function updateNavButtons'
        ],
        'description': 'Chapter generation and session management'
    },
    'js/ui/sidebar.js': {
        'patterns': [
            r'function addSidebarItem',
            r'function toggleSidebar',
            r'function handleSidebarJumpKey',
            r'function jumpToChapter'
        ],
        'description': 'Sidebar functionality and navigation'
    },
    'js/ui/stats.js': {
        'patterns': [
            r'function updateBadge',
            r'function updateStatsBar',
            r'function updateDropdownStats',
            r'function jumpToLatestChapter'
        ],
        'description': 'Statistics and badge updates'
    },
    'js/modules/donation.js': {
        'patterns': [
            r'function processDonation',
            r'function showDonationModal',
            r'Donation'
        ],
        'description': 'Donation processing and UI'
    },
    'js/modules/directive.js': {
        'patterns': [
            r'function submitDirective',
            r'function updateDirective',
            r'Directive'
        ],
        'description': 'Directive system functionality'
    },
    'js/modules/reset-password.js': {
        'patterns': [
            r'function requestPasswordReset',
            r'function resetPassword',
            r'Password'
        ],
        'description': 'Password reset functionality'
    }
}

# Extract content for each module
lines = content.split('\n')
for file_path, module_info in additional_modules.items():
    module_lines = []
    in_module = False
    start_line = -1
    
    for i, line in enumerate(lines):
        # Check if this line matches any pattern
        for pattern in module_info['patterns']:
            if re.search(pattern, line):
                if not in_module:
                    in_module = True
                    start_line = i
                break
        
        if in_module:
            module_lines.append(line)
            
            # Check if we should stop (next major section)
            if i > start_line + 5 and re.search(r'^    // ===', line):
                # Check if this is a new section not matching our patterns
                is_new_section = True
                for pattern in module_info['patterns']:
                    if re.search(pattern, line):
                        is_new_section = False
                        break
                
                if is_new_section and len(module_lines) > 10:
                    module_lines = module_lines[:-1]
                    break
    
    if module_lines:
        import os
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(f"/**\n * {module_info['description']}\n * Extracted from index.html\n */\n\n")
            f.write('\n'.join(module_lines))
        
        print(f"✓ Extracted: {file_path} ({len(module_lines)} lines)")

print("\n✅ Additional modules extracted")