#!/usr/bin/env python3
import re

# Read the file
with open('js/modules/auth.js', 'r') as f:
    content = f.read()

# Fix register function
old_register = '''  const register = () => {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    if (!username || !password) { showNotification('combat-notif', '\\u274c Error', 'Username and password required!'); return; }'''

new_register = '''  const register = () => {
    const regUsername = document.getElementById('regUsername');
    const regEmail = document.getElementById('regEmail');
    const regPassword = document.getElementById('regPassword');
    
    if (!regUsername || !regEmail || !regPassword) {
      showNotification('combat-notif', '\\u274c Error', 'Registration form elements not found!');
      return;
    }
    
    const username = regUsername.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value;
    
    if (!username || !password) { showNotification('combat-notif', '\\u274c Error', 'Username and password required!'); return; }'''

content = content.replace(old_register, new_register)

# Fix login function
old_login = '''  const login = () => {
    const username = document.getElementById('loginUsername').value.trim();
    const rateLimitKey = `login_${username}`;
    
    // Check rate limit
    if (!RateLimiter.check(rateLimitKey)) {
      const remaining = RateLimiter.getResetTime(rateLimitKey);
      const minutesLeft = Math.ceil((remaining - Date.now()) / 60000);
      showNotification('combat-notif', '\\ud83d\\udee1\\ufe0f Too Many Attempts', `Account locked. Try again in ${minutesLeft} minutes.`);
      return;
    }
    
    const attemptsLeft = RateLimiter.getRemainingAttempts(rateLimitKey);
    const password = document.getElementById('loginPassword').value;'''

new_login = '''  const login = () => {
    const loginUsername = document.getElementById('loginUsername');
    const loginPassword = document.getElementById('loginPassword');
    
    if (!loginUsername || !loginPassword) {
      showNotification('combat-notif', '\\u274c Error', 'Login form elements not found!');
      return;
    }
    
    const username = loginUsername.value.trim();
    const rateLimitKey = `login_${username}`;
    
    // Check rate limit
    if (!RateLimiter.check(rateLimitKey)) {
      const remaining = RateLimiter.getResetTime(rateLimitKey);
      const minutesLeft = Math.ceil((remaining - Date.now()) / 60000);
      showNotification('combat-notif', '\\ud83d\\udee1\\ufe0f Too Many Attempts', `Account locked. Try again in ${minutesLeft} minutes.`);
      return;
    }
    
    const attemptsLeft = RateLimiter.getRemainingAttempts(rateLimitKey);
    const password = loginPassword.value;'''

content = content.replace(old_login, new_login)

# Fix loginUser function dropdown elements
old_dropdown = '''    document.getElementById('dropdownAuthSection').style.display = 'none';
    document.getElementById('dropdownUserSection').style.display = 'block';
    document.getElementById('dropdownUserName').textContent = user.username;

    // Show/hide "Add Email" button based on whether user has email
    const addEmailBtn = document.getElementById('addEmailBtn');
    if (addEmailBtn) {
      addEmailBtn.style.display = (!user.email || user.email.trim() === '') ? 'flex' : 'none';
    }

    if (AppState.isAdmin) {
      document.getElementById('dropdownUserIcon').textContent = '\\ud83d\\udc51';
      document.getElementById('dropdownUserRole').textContent = 'Admin \\u2014 Story Director';
      document.getElementById('dropdownUserInfo').classList.add('admin-info');
      document.getElementById('dropdownDirectorSection').style.display = 'block';
      showDirectorModeToggle();
      updateSpeedDisplay();
      highlightActiveSpeed();
      updateAdminCredsDisplay();
      loadUserList();
      showNotification('level-notif', '\\ud83d\\udc51 Admin Mode', 'Story Director Panel activated!');
    } else {
      document.getElementById('dropdownUserIcon').textContent = user.subscribed ? '\\u2b50' : '\\ud83d\\udc64';
      document.getElementById('dropdownUserRole').textContent = user.subscribed ? 'Premium Reader' : 'Reader';
      document.getElementById('dropdownUserInfo').classList.remove('admin-info');
      document.getElementById('dropdownDirectorSection').style.display = 'none';
      hideDirectorModeToggle();
    }'''

new_dropdown = '''    const dropdownAuthSection = document.getElementById('dropdownAuthSection');
    const dropdownUserSection = document.getElementById('dropdownUserSection');
    const dropdownUserName = document.getElementById('dropdownUserName');
    
    if (dropdownAuthSection) dropdownAuthSection.style.display = 'none';
    if (dropdownUserSection) dropdownUserSection.style.display = 'block';
    if (dropdownUserName) dropdownUserName.textContent = user.username;

    // Show/hide "Add Email" button based on whether user has email
    const addEmailBtn = document.getElementById('addEmailBtn');
    if (addEmailBtn) {
      addEmailBtn.style.display = (!user.email || user.email.trim() === '') ? 'flex' : 'none';
    }

    if (AppState.isAdmin) {
      const dropdownUserIcon = document.getElementById('dropdownUserIcon');
      const dropdownUserRole = document.getElementById('dropdownUserRole');
      const dropdownUserInfo = document.getElementById('dropdownUserInfo');
      const dropdownDirectorSection = document.getElementById('dropdownDirectorSection');
      
      if (dropdownUserIcon) dropdownUserIcon.textContent = '\\ud83d\\udc51';
      if (dropdownUserRole) dropdownUserRole.textContent = 'Admin \\u2014 Story Director';
      if (dropdownUserInfo) dropdownUserInfo.classList.add('admin-info');
      if (dropdownDirectorSection) dropdownDirectorSection.style.display = 'block';
      
      showDirectorModeToggle();
      updateSpeedDisplay();
      highlightActiveSpeed();
      updateAdminCredsDisplay();
      loadUserList();
      showNotification('level-notif', '\\ud83d\\udc51 Admin Mode', 'Story Director Panel activated!');
    } else {
      const dropdownUserIcon = document.getElementById('dropdownUserIcon');
      const dropdownUserRole = document.getElementById('dropdownUserRole');
      const dropdownUserInfo = document.getElementById('dropdownUserInfo');
      const dropdownDirectorSection = document.getElementById('dropdownDirectorSection');
      
      if (dropdownUserIcon) dropdownUserIcon.textContent = user.subscribed ? '\\u2b50' : '\\ud83d\\udc64';
      if (dropdownUserRole) dropdownUserRole.textContent = user.subscribed ? 'Premium Reader' : 'Reader';
      if (dropdownUserInfo) dropdownUserInfo.classList.remove('admin-info');
      if (dropdownDirectorSection) dropdownDirectorSection.style.display = 'none';
      
      hideDirectorModeToggle();
    }'''

content = content.replace(old_dropdown, new_dropdown)

# Write the file
with open('js/modules/auth.js', 'w') as f:
    f.write(content)

print("Fixed auth.js with null safety checks")