/**
 * Authentication and user management
 * Extracted from index.html
 */


(function() {
  
  const register = () => {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    if (!username || !password) { showNotification('combat-notif', '❌ Error', 'Username and password required!'); return; }
    const users = getUsers();
    if (users.find(u => u.username === username)) { showNotification('combat-notif', '❌ Error', 'Username exists!'); return; }
    users.push({ username, email, password, isAdmin: false, progress: null, subscribed: false });
    saveUsers(users);
    showNotification('quest-notif', '✅ Registered!', `Welcome, ${username}!`);
    closeModal('registerOverlay');
    loginUser({ username, email, password, isAdmin: false, progress: null, subscribed: false });
  }

  const login = () => {
    const username = document.getElementById('loginUsername').value.trim();
    const rateLimitKey = `login_${username}`;
    
    // Check rate limit
    if (!RateLimiter.check(rateLimitKey)) {
      const remaining = RateLimiter.getResetTime(rateLimitKey);
      const minutesLeft = Math.ceil((remaining - Date.now()) / 60000);
      showNotification('combat-notif', '🛡️ Too Many Attempts', `Account locked. Try again in ${minutesLeft} minutes.`);
      return;
    }
    
    const attemptsLeft = RateLimiter.getRemainingAttempts(rateLimitKey);
    const password = document.getElementById('loginPassword').value;
    
    // Check if it's admin login
    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
      RateLimiter.reset(rateLimitKey);
      loginUser(ADMIN_USER);
      closeModal('loginOverlay');
      return;
    }
    
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) { showNotification('combat-notif', '❌ Error', `Invalid credentials. ${attemptsLeft - 1} attempts remaining.`); return; }
    loginUser(user);
    closeModal('loginOverlay');
  }

  const loginUser = (user) => {
    AppState.currentUser = user;
    AppState.isAdmin = user.isAdmin || false;
    document.getElementById('dropdownAuthSection').style.display = 'none';
    document.getElementById('dropdownUserSection').style.display = 'block';
    document.getElementById('dropdownUserName').textContent = user.username;

    // Show/hide "Add Email" button based on whether user has email
    const addEmailBtn = document.getElementById('addEmailBtn');
    if (addEmailBtn) {
      addEmailBtn.style.display = (!user.email || user.email.trim() === '') ? 'flex' : 'none';
    }

    if (AppState.isAdmin) {
      document.getElementById('dropdownUserIcon').textContent = '👑';
      document.getElementById('dropdownUserRole').textContent = 'Admin — Story Director';
      document.getElementById('dropdownUserInfo').classList.add('admin-info');
      document.getElementById('dropdownDirectorSection').style.display = 'block';
      showDirectorModeToggle();
      updateSpeedDisplay();
      highlightActiveSpeed();
      updateAdminCredsDisplay();
      loadUserList();
      showNotification('level-notif', '👑 Admin Mode', 'Story Director Panel activated!');
    } else {
      document.getElementById('dropdownUserIcon').textContent = user.subscribed ? '⭐' : '👤';
      document.getElementById('dropdownUserRole').textContent = user.subscribed ? 'Premium Reader' : 'Reader';
      document.getElementById('dropdownUserInfo').classList.remove('admin-info');
      document.getElementById('dropdownDirectorSection').style.display = 'none';
      hideDirectorModeToggle();
    }
    Storage.setItem('ese_currentUser', user);
    if (user.progress && user.progress.lastChapter && AppState.totalGenerated > 0) {
      showChapter(Math.min(user.progress.lastChapter, AppState.totalGenerated));
      showNotification('quest-notif', '📝 Position Restored', `Chapter ${user.progress.lastChapter}`);
    }
    showNotification('quest-notif', '🔑 Logged In', `Welcome back, ${user.username}!`);
    updateDirectiveList();
  }

  // Create namespace object
  const Auth = {
    register: register,
    login: login,
    loginUser: loginUser
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.Auth = Auth;
    window.register = register;
    window.login = login;
    window.loginUser = loginUser;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
  }
})();