#!/usr/bin/env python3
import re

# Read the file
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add error handling utilities after the Validator section
error_handling_code = '''
    // ============================================
    // ERROR HANDLING
    // ============================================
    const ErrorHandler = {
      handle(error, context = 'Operation') {
        console.error(`[${context}] Error:`, error);
        
        // Show user-friendly error message
        const message = error.message || 'An unexpected error occurred';
        showNotification('combat-notif', '❌ Error', `${context} failed: ${message}`);
        
        // Log detailed error for debugging
        if (error.stack) {
          console.error('Stack trace:', error.stack);
        }
      },
      
      safeExecute(fn, context = 'Operation', fallback = null) {
        try {
          return fn();
        } catch (error) {
          this.handle(error, context);
          return fallback;
        }
      },
      
      async safeExecuteAsync(fn, context = 'Operation', fallback = null) {
        try {
          return await fn();
        } catch (error) {
          this.handle(error, context);
          return fallback;
        }
      }
    };

'''

# Find a good place to insert - after the Validator closing brace
insertion_point = "      }\n    };"

# Find the last occurrence (after Validator)
last_pos = content.rfind(insertion_point)
if last_pos != -1:
    content = content[:last_pos + len(insertion_point)] + error_handling_code + content[last_pos + len(insertion_point):]
    print("✓ Error handling code inserted")
else:
    print("✗ Could not find insertion point for error handling code")

# Add error handling to localStorage operations
# Find getUsers function and add error handling
old_getUsers = '''    function getUsers() {
      return JSON.parse(localStorage.getItem('ese_users') || '[]');
    }'''

new_getUsers = '''    function getUsers() {
      return ErrorHandler.safeExecute(() => {
        return JSON.parse(localStorage.getItem('ese_users') || '[]');
      }, 'Loading users', []);
    }'''

if old_getUsers in content:
    content = content.replace(old_getUsers, new_getUsers)
    print("✓ Error handling added to getUsers()")
else:
    print("✗ Could not find getUsers function")

# Find saveUsers function and add error handling
old_saveUsers = '''    function saveUsers(users) {
      localStorage.setItem('ese_users', JSON.stringify(users));
    }'''

new_saveUsers = '''    function saveUsers(users) {
      ErrorHandler.safeExecute(() => {
        localStorage.setItem('ese_users', JSON.stringify(users));
      }, 'Saving users');
    }'''

if old_saveUsers in content:
    content = content.replace(old_saveUsers, new_saveUsers)
    print("✓ Error handling added to saveUsers()")
else:
    print("✗ Could not find saveUsers function")

# Add error handling to chapter generation
# Find generateChapter function and wrap with error handling
old_generate_chapter = '''    function generateChapter() {
      const num = AppState.totalGenerated + 1;
      const seed = AppState.seed + num;'''

new_generate_chapter = '''    function generateChapter() {
      return ErrorHandler.safeExecute(() => {
        const num = AppState.totalGenerated + 1;
        const seed = AppState.seed + num;'''

if old_generate_chapter in content:
    content = content.replace(old_generate_chapter, new_generate_chapter)
    print("✓ Error handling added to generateChapter()")
else:
    print("✗ Could not find generateChapter function")

# Add error handling to content database operations
old_get_used_paragraphs = '''    function getUsedParagraphs() {
      return JSON.parse(localStorage.getItem('ese_usedParagraphs') || '[]');
    }'''

new_get_used_paragraphs = '''    function getUsedParagraphs() {
      return ErrorHandler.safeExecute(() => {
        return JSON.parse(localStorage.getItem('ese_usedParagraphs') || '[]');
      }, 'Loading used paragraphs', []);
    }'''

if old_get_used_paragraphs in content:
    content = content.replace(old_get_used_paragraphs, new_get_used_paragraphs)
    print("✓ Error handling added to getUsedParagraphs()")
else:
    print("✗ Could not find getUsedParagraphs function")

old_save_used_paragraphs = '''    function saveUsedParagraphs(used) {
      localStorage.setItem('ese_usedParagraphs', JSON.stringify(used));
    }'''

new_save_used_paragraphs = '''    function saveUsedParagraphs(used) {
      ErrorHandler.safeExecute(() => {
        localStorage.setItem('ese_usedParagraphs', JSON.stringify(used));
      }, 'Saving used paragraphs');
    }'''

if old_save_used_paragraphs in content:
    content = content.replace(old_save_used_paragraphs, new_save_used_paragraphs)
    print("✓ Error handling added to saveUsedParagraphs()")
else:
    print("✗ Could not find saveUsedParagraphs function")

# Write the file back
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ Error handling implementation complete!")
print("- ErrorHandler class added with try-catch utilities")
print("- Error handling added to localStorage operations")
print("- Error handling added to chapter generation")
print("- User-friendly error messages implemented")
print("- Detailed error logging for debugging")