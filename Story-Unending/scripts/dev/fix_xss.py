#!/usr/bin/env python3
import re

# Read the file
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add sanitization functions before the NOTIFICATIONS section
sanitization_functions = '''    // ============================================
    // SECURITY - INPUT SANITIZATION
    // ============================================
    function sanitizeHTML(str) {
      if (typeof str !== 'string') return str;
      const temp = document.createElement('div');
      temp.textContent = str;
      return temp.innerHTML;
    }

    function sanitizeAttribute(str) {
      if (typeof str !== 'string') return str;
      return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

'''

# Find and replace the NOTIFICATIONS section
old_notifications = '''    // ============================================
    // NOTIFICATIONS
    // ============================================
    function showNotification(type, title, body) {
      const container = document.getElementById('notificationContainer');
      const notif = document.createElement('div');
      notif.className = `notification ${type}`;
      notif.innerHTML = `<div class="notification-title">${title}</div><div class="notification-body">${body}</div><div class="notification-timer"></div>`;
      container.appendChild(notif);
      setTimeout(() => { notif.style.opacity = '0'; notif.style.transform = 'translateX(100px)'; notif.style.transition = 'all 0.3s ease'; setTimeout(() => notif.remove(), 300); }, 5000);
      while (container.children.length > 5) container.removeChild(container.firstChild);
    }'''

new_notifications = '''    // ============================================
    // SECURITY - INPUT SANITIZATION
    // ============================================
    function sanitizeHTML(str) {
      if (typeof str !== 'string') return str;
      const temp = document.createElement('div');
      temp.textContent = str;
      return temp.innerHTML;
    }

    function sanitizeAttribute(str) {
      if (typeof str !== 'string') return str;
      return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ============================================
    // NOTIFICATIONS
    // ============================================
    function showNotification(type, title, body) {
      const container = document.getElementById('notificationContainer');
      const notif = document.createElement('div');
      notif.className = `notification ${type}`;
      notif.innerHTML = `<div class="notification-title">${sanitizeHTML(title)}</div><div class="notification-body">${sanitizeHTML(body)}</div><div class="notification-timer"></div>`;
      container.appendChild(notif);
      setTimeout(() => { notif.style.opacity = '0'; notif.style.transform = 'translateX(100px)'; notif.style.transition = 'all 0.3s ease'; setTimeout(() => notif.remove(), 300); }, 5000);
      while (container.children.length > 5) container.removeChild(container.firstChild);
    }'''

content = content.replace(old_notifications, new_notifications)

# Fix loadUserList function - sanitize user data
# Replace the data-username and data-email attributes
content = re.sub(
    r'data-username="\$\{user\.username\.toLowerCase\(\)\}"',
    r'data-username="${sanitizeAttribute(user.username.toLowerCase())}"',
    content
)

content = re.sub(
    r'data-email="\$\{\(user\.email \|\| \'\'\)\.toLowerCase\(\)\}"',
    r'data-email="${sanitizeAttribute((user.email || \'\').toLowerCase())}"',
    content
)

# Replace user.username in display
content = re.sub(
    r'<span class="user-name">\$\{user\.username\}</span>',
    r'<span class="user-name">${sanitizeHTML(user.username)}</span>',
    content
)

# Replace user.email in display
content = re.sub(
    r'<span class="user-email">\$\{user\.email \|\| \'No email\'\}</span>',
    r'<span class="user-email">${sanitizeHTML(user.email || \'No email\')}</span>',
    content
)

# Replace onclick handlers
content = re.sub(
    r'onclick="editUserEmail\(\'\$\{user\.username\}\'\)"',
    r'onclick="editUserEmail(\'${sanitizeAttribute(user.username)}\')"',
    content
)

content = re.sub(
    r'onclick="deleteUser\(\'\$\{user\.username\}\'\)"',
    r'onclick="deleteUser(\'${sanitizeAttribute(user.username)}\')"',
    content
)

# Write the file back
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("XSS protection implemented successfully!")
print("- Added sanitizeHTML() function")
print("- Added sanitizeAttribute() function")
print("- Updated showNotification() to sanitize title and body")
print("- Updated loadUserList() to sanitize all user data")