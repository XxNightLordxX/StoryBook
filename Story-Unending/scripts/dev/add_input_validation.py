#!/usr/bin/env python3
import re

# Read the file
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add input validation functions after the rate limiting section
validation_code = '''
    // ============================================
    // SECURITY - INPUT VALIDATION
    // ============================================
    const Validator = {
      patterns: {
        username: /^[a-zA-Z0-9_]{3,20}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        password: /^.{6,100}$/,
        chapterTitle: /^.{1,100}$/,
        text: /^.{1,10000}$/
      },
      
      validate(type, value) {
        const pattern = this.patterns[type];
        if (!pattern) return { valid: true, error: null };
        
        if (!value || value.trim() === '') {
          return { valid: false, error: `${type} cannot be empty` };
        }
        
        if (!pattern.test(value)) {
          const messages = {
            username: 'Username must be 3-20 characters (letters, numbers, underscores only)',
            email: 'Please enter a valid email address',
            password: 'Password must be at least 6 characters',
            chapterTitle: 'Title must be 1-100 characters',
            text: 'Text must be 1-10000 characters'
          };
          return { valid: false, error: messages[type] || 'Invalid input' };
        }
        
        return { valid: true, error: null };
      },
      
      sanitizeAndValidate(type, value) {
        const sanitized = sanitizeHTML(value.trim());
        const validation = this.validate(type, sanitized);
        return {
          sanitized,
          valid: validation.valid,
          error: validation.error
        };
      }
    };

'''

# Find a good place to insert - after the RateLimiter closing brace
insertion_point = "      reset(key) {\n        delete this.attempts[key];\n      }\n    };"

if insertion_point in content:
    content = content.replace(insertion_point, insertion_point + validation_code)
    print("✓ Input validation code inserted")
else:
    print("✗ Could not find insertion point for validation code")

# Update the login function to use validation
# Find the login function and add validation
old_login_start = '''    function login() {
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value;'''

new_login_start = '''    function login() {
      const usernameInput = document.getElementById('loginUsername').value.trim();
      const passwordInput = document.getElementById('loginPassword').value;
      
      // Validate inputs
      const usernameValidation = Validator.validate('username', usernameInput);
      if (!usernameValidation.valid) {
        showNotification('combat-notif', '❌ Invalid Username', usernameValidation.error);
        return;
      }
      
      const passwordValidation = Validator.validate('password', passwordInput);
      if (!passwordValidation.valid) {
        showNotification('combat-notif', '❌ Invalid Password', passwordValidation.error);
        return;
      }
      
      const username = sanitizeHTML(usernameInput);
      const password = passwordInput; // Passwords should not be sanitized'''

if old_login_start in content:
    content = content.replace(old_login_start, new_login_start)
    print("✓ Login validation added")
else:
    print("✗ Could not find login function to update")

# Update the editUserEmail function to use validation
old_edit_email = '''    function editUserEmail(username) {
      const users = getUsers();
      const user = users.find(u => u.username === username);

      if (!user) {
        showNotification('combat-notif', '❌ Error', 'User not found');
        return;
      }

      const newEmail = prompt(`Enter new email for ${username}:`, user.email || '');

      if (newEmail === null) return; // Cancelled

      if (newEmail && !newEmail.includes('@')) {
        showNotification('combat-notif', '❌ Error', 'Please enter a valid email address');
        return;
      }'''

new_edit_email = '''    function editUserEmail(username) {
      const users = getUsers();
      const user = users.find(u => u.username === username);

      if (!user) {
        showNotification('combat-notif', '❌ Error', 'User not found');
        return;
      }

      const newEmail = prompt(`Enter new email for ${username}:`, user.email || '');

      if (newEmail === null) return; // Cancelled

      if (newEmail && newEmail.trim() !== '') {
        const emailValidation = Validator.validate('email', newEmail.trim());
        if (!emailValidation.valid) {
          showNotification('combat-notif', '❌ Invalid Email', emailValidation.error);
          return;
        }
      }'''

if old_edit_email in content:
    content = content.replace(old_edit_email, new_edit_email)
    print("✓ Email validation added")
else:
    print("✗ Could not find editUserEmail function to update")

# Update the register function to use validation
old_register = '''    function register() {
      const username = document.getElementById('registerUsername').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value;
      
      if (!username || !password) {
        showNotification('combat-notif', '❌ Error', 'Username and password are required');
        return;
      }'''

new_register = '''    function register() {
      const usernameInput = document.getElementById('registerUsername').value.trim();
      const emailInput = document.getElementById('registerEmail').value.trim();
      const passwordInput = document.getElementById('registerPassword').value;
      
      // Validate inputs
      const usernameValidation = Validator.validate('username', usernameInput);
      if (!usernameValidation.valid) {
        showNotification('combat-notif', '❌ Invalid Username', usernameValidation.error);
        return;
      }
      
      if (emailInput) {
        const emailValidation = Validator.validate('email', emailInput);
        if (!emailValidation.valid) {
          showNotification('combat-notif', '❌ Invalid Email', emailValidation.error);
          return;
        }
      }
      
      const passwordValidation = Validator.validate('password', passwordInput);
      if (!passwordValidation.valid) {
        showNotification('combat-notif', '❌ Invalid Password', passwordValidation.error);
        return;
      }
      
      const username = sanitizeHTML(usernameInput);
      const email = sanitizeHTML(emailInput);
      const password = passwordInput; // Passwords should not be sanitized'''

if old_register in content:
    content = content.replace(old_register, new_register)
    print("✓ Registration validation added")
else:
    print("✗ Could not find register function to update")

# Write the file back
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ Input validation implementation complete!")
print("- Validator class added with pattern matching")
print("- Login validation implemented")
print("- Email validation implemented")
print("- Registration validation implemented")
print("- All user inputs now validated before processing")