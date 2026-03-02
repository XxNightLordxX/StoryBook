#!/usr/bin/env python3
import re

# Read the embedded JavaScript
with open('embedded_js_temp.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define module patterns and their corresponding files
modules = {
    'js/utils/security.js': {
        'patterns': [
            r'// SECURITY - INPUT SANITIZATION',
            r'function sanitizeHTML',
            r'function sanitizeAttribute',
            r'// SECURITY - RATE LIMITING',
            r'const RateLimiter',
            r'// SECURITY - INPUT VALIDATION',
            r'const Validator',
            r'// ERROR HANDLING',
            r'const ErrorHandler'
        ],
        'description': 'Security utilities including sanitization, rate limiting, validation, and error handling'
    },
    'js/utils/storage.js': {
        'patterns': [
            r'function getUsers\(\)',
            r'function saveUsers',
            r'function getUsedParagraphs',
            r'function saveUsedParagraphs',
            r'function getChapterContent',
            r'function saveChapterContent'
        ],
        'description': 'LocalStorage operations for users, chapters, and content'
    },
    'js/utils/content-database.js': {
        'patterns': [
            r'const ContentDatabase',
            r'function addToContentDatabase',
            r'function isContentUsed',
            r'function getContentStats'
        ],
        'description': 'Content database for tracking used paragraphs'
    },
    'js/modules/app-state.js': {
        'patterns': [
            r'// APP STATE',
            r'const AppState = \{'
        ],
        'description': 'Application state management'
    },
    'js/modules/story-timeline.js': {
        'patterns': [
            r'// STORY TIMELINE',
            r'const STORY_START',
            r'CHAPTER_INTERVAL_MS'
        ],
        'description': 'Story timeline and chapter generation settings'
    },
    'js/ui/dropdown.js': {
        'patterns': [
            r'// DROPDOWN',
            r'function toggleDropdown',
            r'function closeDropdown'
        ],
        'description': 'Dropdown menu functionality'
    },
    'js/ui/text-size.js': {
        'patterns': [
            r'// TEXT SIZE CONTROL',
            r'currentTextSize',
            r'function increaseTextSize',
            r'function decreaseTextSize',
            r'function resetTextSize'
        ],
        'description': 'Text size control functionality'
    },
    'js/ui/modals.js': {
        'patterns': [
            r'function openModal',
            r'function closeModal',
            r'function closeAllModals'
        ],
        'description': 'Modal management'
    },
    'js/ui/notifications.js': {
        'patterns': [
            r'function showNotification'
        ],
        'description': 'Notification system'
    },
    'js/modules/auth.js': {
        'patterns': [
            r'function login',
            r'function register',
            r'function logout',
            r'function loginUser',
            r'function checkSavedLogin'
        ],
        'description': 'Authentication and user management'
    },
    'js/modules/chapter-generation.js': {
        'patterns': [
            r'function generateChapter',
            r'function startGeneration',
            r'function pauseGeneration',
            r'function resumeGeneration',
            r'function stopGeneration'
        ],
        'description': 'Chapter generation and management'
    },
    'js/modules/navigation.js': {
        'patterns': [
            r'function nextChapter',
            r'function prevChapter',
            r'function goToChapter',
            r'function renderChapter'
        ],
        'description': 'Chapter navigation and rendering'
    },
    'js/modules/admin.js': {
        'patterns': [
            r'function renderAdminPanel',
            r'function updateAdminCredentialsScreen',
            r'function loadUserList',
            r'function editUserEmail',
            r'function deleteUser'
        ],
        'description': 'Admin panel and user management'
    },
    'js/ui/keyboard-shortcuts.js': {
        'patterns': [
            r'// KEYBOARD SHORTCUTS',
            r'document\.addEventListener\(\'keydown\''
        ],
        'description': 'Keyboard shortcuts'
    },
    'js/modules/initialization.js': {
        'patterns': [
            r'// INITIALIZATION',
            r'document\.addEventListener\(\'DOMContentLoaded\''
        ],
        'description': 'Application initialization'
    }
}

# Extract content for each module
extracted = {}
remaining_content = content

for file_path, module_info in modules.items():
    module_content = []
    lines = content.split('\n')
    in_module = False
    module_lines = []
    
    # Find lines matching any pattern
    for i, line in enumerate(lines):
        for pattern in module_info['patterns']:
            if re.search(pattern, line):
                in_module = True
                break
        
        if in_module:
            module_lines.append(line)
            # Check if we've reached the next major section
            if i > 0 and re.search(r'^    // ===', line) and len(module_lines) > 5:
                # This might be the start of a new section
                # Check if this line matches our current module's patterns
                is_new_section = True
                for pattern in module_info['patterns']:
                    if re.search(pattern, line):
                        is_new_section = False
                        break
                
                if is_new_section and len(module_lines) > 10:
                    # Remove the last line (it's the new section header)
                    module_lines = module_lines[:-1]
                    break
    
    if module_lines:
        extracted[file_path] = {
            'content': '\n'.join(module_lines),
            'description': module_info['description']
        }
        print(f"✓ Extracted: {file_path} ({len(module_lines)} lines)")

# Write each module to its file
for file_path, module_data in extracted.items():
    # Create directory if needed
    import os
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    # Write the file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(f"/**\n * {module_data['description']}\n * Extracted from index.html\n */\n\n")
        f.write(module_data['content'])
    
    print(f"✓ Written: {file_path}")

print(f"\n✅ Extracted {len(extracted)} modules")