#!/usr/bin/env python3
import re

# Read the file
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add rate limiting system after the security section
rate_limiting_code = '''
    // ============================================
    // SECURITY - RATE LIMITING
    // ============================================
    const RateLimiter = {
      attempts: {},
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      
      check(key) {
        const now = Date.now();
        if (!this.attempts[key]) {
          this.attempts[key] = { count: 0, resetTime: now + this.windowMs };
        }
        
        const record = this.attempts[key];
        
        // Reset if window expired
        if (now > record.resetTime) {
          record.count = 0;
          record.resetTime = now + this.windowMs;
        }
        
        record.count++;
        return record.count <= this.maxAttempts;
      },
      
      getRemainingAttempts(key) {
        const record = this.attempts[key];
        if (!record) return this.maxAttempts;
        const now = Date.now();
        if (now > record.resetTime) return this.maxAttempts;
        return Math.max(0, this.maxAttempts - record.count);
      },
      
      getResetTime(key) {
        const record = this.attempts[key];
        if (!record) return 0;
        return record.resetTime;
      },
      
      reset(key) {
        delete this.attempts[key];
      }
    };

'''

# Find a good place to insert the rate limiting code (after the sanitization functions)
insertion_point = "    function sanitizeAttribute(str) {\n      if (typeof str !== 'string') return str;\n      return str.replace(/&quot;/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');\n    }\n"

content = content.replace(insertion_point, insertion_point + rate_limiting_code)

# Now let's add rate limiting to the login function
# Find the login function and add rate limiting check
old_login_check = '''    function checkAdminLogin() {
      const username = document.getElementById('adminUsernameScreen').value.trim();
      const password = document.getElementById('adminPasswordScreen').value.trim();
      
      if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
        AppState.isAdminLoggedIn = true;
        localStorage.setItem('ese_adminLoggedIn', 'true');
        closeAllModals();
        showNotification('level-notif', '👑 Admin Access Granted', 'Welcome back, Administrator');
        renderAdminPanel();
      } else {
        showNotification('combat-notif', '❌ Access Denied', 'Invalid admin credentials');
      }
    }'''

new_login_check = '''    function checkAdminLogin() {
      const username = document.getElementById('adminUsernameScreen').value.trim();
      const password = document.getElementById('adminPasswordScreen').value.trim();
      const rateLimitKey = `login_${username}`;
      
      // Check rate limit
      if (!RateLimiter.check(rateLimitKey)) {
        const remaining = RateLimiter.getResetTime(rateLimitKey);
        const minutesLeft = Math.ceil((remaining - Date.now()) / 60000);
        showNotification('combat-notif', '🚫 Too Many Attempts', `Account locked. Try again in ${minutesLeft} minutes.`);
        return;
      }
      
      const attemptsLeft = RateLimiter.getRemainingAttempts(rateLimitKey);
      
      if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
        AppState.isAdminLoggedIn = true;
        localStorage.setItem('ese_adminLoggedIn', 'true');
        RateLimiter.reset(rateLimitKey); // Reset on successful login
        closeAllModals();
        showNotification('level-notif', '👑 Admin Access Granted', 'Welcome back, Administrator');
        renderAdminPanel();
      } else {
        showNotification('combat-notif', '❌ Access Denied', `Invalid credentials. ${attemptsLeft - 1} attempts remaining.`);
      }
    }'''

content = content.replace(old_login_check, new_login_check)

# Add rate limiting to chapter generation
# Find the generateChapter function and add rate limiting
old_generate_start = '''    function startGeneration() {
      if (AppState.generating) {
        pauseGeneration();
        return;
      }'''

new_generate_start = '''    function startGeneration() {
      if (AppState.generating) {
        pauseGeneration();
        return;
      }
      
      // Rate limiting for chapter generation
      const rateLimitKey = `generation_${AppState.currentUser || 'anonymous'}`;
      if (!RateLimiter.check(rateLimitKey)) {
        const remaining = RateLimiter.getResetTime(rateLimitKey);
        const minutesLeft = Math.ceil((remaining - Date.now()) / 60000);
        showNotification('combat-notif', '🚫 Generation Limit Reached', `Too many chapters generated. Try again in ${minutesLeft} minutes.`);
        return;
      }'''

content = content.replace(old_generate_start, new_generate_start)

# Write the file back
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Rate limiting implemented successfully!")
print("- Added RateLimiter class with configurable limits")
print("- Applied rate limiting to admin login (5 attempts per 15 minutes)")
print("- Applied rate limiting to chapter generation")
print("- Added attempt tracking and reset functionality")
print("- Added user-friendly error messages")