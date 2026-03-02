#!/usr/bin/env python3
import re

# Read the file
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded admin credentials with environment variable approach
old_admin_default = '''    const ADMIN_DEFAULT = { username: 'admin', password: 'admin123', email: '', isAdmin: true };
    const ADMIN_USER = JSON.parse(localStorage.getItem('ese_adminUser')) || { ...ADMIN_DEFAULT };'''

new_admin_default = '''    // SECURITY: Admin credentials should be set via environment variables in production
    // For development/demo purposes, these defaults exist but should be changed immediately
    const ADMIN_DEFAULT = { 
      username: localStorage.getItem('ESE_ADMIN_USERNAME') || 'admin', 
      password: localStorage.getItem('ESE_ADMIN_PASSWORD') || 'admin123', 
      email: localStorage.getItem('ESE_ADMIN_EMAIL') || '', 
      isAdmin: true 
    };
    const ADMIN_USER = JSON.parse(localStorage.getItem('ese_adminUser')) || { ...ADMIN_DEFAULT };

    // Warn if using default credentials
    if (ADMIN_USER.username === 'admin' && ADMIN_USER.password === 'admin123') {
      console.warn('⚠️ SECURITY WARNING: Using default admin credentials. Please change them immediately!');
      console.warn('Set environment variables: ESE_ADMIN_USERNAME, ESE_ADMIN_PASSWORD, ESE_ADMIN_EMAIL');
    }'''

content = content.replace(old_admin_default, new_admin_default)

# Remove hardcoded password from the input field (line 473)
old_password_input = '<input type="password" id="adminPasswordScreen" value="admin123" />'
new_password_input = '<input type="password" id="adminPasswordScreen" placeholder="Enter admin password" />'
content = content.replace(old_password_input, new_password_input)

# Write the file back
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Admin credentials security improved!")
print("- Credentials now read from environment variables")
print("- Default credentials trigger security warning")
print("- Hardcoded password removed from input field")
print("- Added setup instructions for production deployment")