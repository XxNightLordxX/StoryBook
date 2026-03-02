#!/usr/bin/env python3

# Read the file
with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Add rate limiting code after line 2188 (after sanitizeAttribute function)
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

# Insert after line 2188 (index 2187)
lines.insert(2188, rate_limiting_code)
print("✓ Rate limiting code inserted at line 2188")

# Now update the login function (around line 1279)
# Find the login function and add rate limiting
for i, line in enumerate(lines):
    if 'function login()' in line:
        # Look for the next few lines to find the right place to add rate limiting
        for j in range(i, min(i+10, len(lines))):
            if 'const username = document.getElementById' in lines[j]:
                # Insert rate limiting check after this line
                rate_limit_check = '''      const rateLimitKey = `login_${username}`;
      
      // Check rate limit
      if (!RateLimiter.check(rateLimitKey)) {
        const remaining = RateLimiter.getResetTime(rateLimitKey);
        const minutesLeft = Math.ceil((remaining - Date.now()) / 60000);
        showNotification('combat-notif', '🚫 Too Many Attempts', `Account locked. Try again in ${minutesLeft} minutes.`);
        return;
      }
      
      const attemptsLeft = RateLimiter.getRemainingAttempts(rateLimitKey);
'''
                lines.insert(j+1, rate_limit_check)
                print(f"✓ Login rate limiting added at line {j+2}")
                break
        break

# Update the error message in login function to show remaining attempts
for i, line in enumerate(lines):
    if "showNotification('combat-notif', '❌ Error', 'Invalid credentials!')" in line:
        lines[i] = line.replace("'Invalid credentials!'", "`Invalid credentials. ${attemptsLeft - 1} attempts remaining.`")
        print(f"✓ Updated login error message at line {i+1}")
        break

# Add rate limiting reset on successful login
for i, line in enumerate(lines):
    if 'loginUser(ADMIN_USER); closeModal' in line:
        lines[i] = '      RateLimiter.reset(rateLimitKey); loginUser(ADMIN_USER); closeModal(\'loginOverlay\'); return;\n'
        print(f"✓ Added rate limit reset on successful admin login at line {i+1}")
        break

for i, line in enumerate(lines):
    if 'loginUser(user); closeModal' in line and 'ADMIN_USER' not in line:
        lines[i] = '      RateLimiter.reset(rateLimitKey); loginUser(user); closeModal(\'loginOverlay\');\n'
        print(f"✓ Added rate limit reset on successful user login at line {i+1}")
        break

# Write the file back
with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("\n✅ Rate limiting implementation complete!")
print("- RateLimiter class added")
print("- Login rate limiting implemented (5 attempts per 15 minutes)")
print("- Attempt tracking and reset functionality added")
print("- User-friendly error messages implemented")