#!/usr/bin/env python3
import re

# Read the file
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add rate limiting system after the sanitizeAttribute function
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

# Find the exact string to replace
insertion_point = "    function sanitizeAttribute(str) {\n      if (typeof str !== 'string') return str;\n      return str.replace(/&quot;/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');\n    }"

if insertion_point in content:
    content = content.replace(insertion_point, insertion_point + rate_limiting_code)
    print("✓ Rate limiting code inserted successfully")
else:
    print("✗ Could not find insertion point")
    # Try alternative approach
    print("Trying alternative insertion method...")
    # Find the line number and insert after it
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'function sanitizeAttribute' in line:
            # Find the closing brace
            for j in range(i, min(i+10, len(lines))):
                if '}' in lines[j] and 'replace' in lines[j]:
                    lines[j] = lines[j] + rate_limiting_code
                    content = '\n'.join(lines)
                    print("✓ Rate limiting code inserted using alternative method")
                    break
            break

# Now let's add rate limiting to the login function
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

if old_login_check in content:
    content = content.replace(old_login_check, new_login_check)
    print("✓ Login rate limiting added")
else:
    print("✗ Could not find login function to update")

# Add rate limiting to chapter generation
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

if old_generate_start in content:
    content = content.replace(old_generate_start, new_generate_start)
    print("✓ Generation rate limiting added")
else:
    print("✗ Could not find startGeneration function to update")

# Write the file back
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nRate limiting implementation complete!")