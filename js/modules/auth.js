/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Authentication and user management
 * Extracted from index.html
 */


(function() {
  
  const register = () => {
    const username = DOMHelpers.safeGetElement('regUsername').value.trim();
    const email = DOMHelpers.safeGetElement('regEmail').value.trim();
    const password = DOMHelpers.safeGetElement('regPassword').value;
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
    const username = DOMHelpers.safeGetElement('loginUsername').value.trim();
    const rateLimitKey = `login_${username}`;
    
    // Check rate limit
    if (!RateLimiter.check(rateLimitKey)) {
      const remaining = RateLimiter.getResetTime(rateLimitKey);
      const minutesLeft = Math.ceil((remaining - Date.now()) / 60000);
      showNotification('combat-notif', '🛡️ Too Many Attempts', `Account locked. Try again in ${minutesLeft} minutes.`);
      return;
    }
    
    const attemptsLeft = RateLimiter.getRemainingAttempts(rateLimitKey);
    const password = DOMHelpers.safeGetElement('loginPassword').value;
    
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
    DOMHelpers.safeGetElement('dropdownAuthSection').style.display = 'none';
    DOMHelpers.safeGetElement('dropdownUserSection').style.display = 'block';
    DOMHelpers.safeSetText('dropdownUserName', user.username);

    // Show/hide "Add Email" button based on whether user has email
    const addEmailBtn = DOMHelpers.safeGetElement('addEmailBtn');
    if (addEmailBtn) {
      addEmailBtn.style.display = (!user.email || user.email.trim() === '') ? 'flex' : 'none';
    }

    if (AppState.isAdmin) {
      DOMHelpers.safeSetText('dropdownUserIcon', '👑');
      DOMHelpers.safeSetText('dropdownUserRole', 'Admin — Story Director');
      DOMHelpers.safeToggleClass('dropdownUserInfo', 'admin-info', true);
      DOMHelpers.safeGetElement('dropdownDirectorSection').style.display = 'block';
      showDirectorModeToggle();
      updateSpeedDisplay();
      highlightActiveSpeed();
      updateAdminCredsDisplay();
      loadUserList();
      showNotification('level-notif', '👑 Admin Mode', 'Story Director Panel activated!');
    } else {
      DOMHelpers.safeSetText('dropdownUserIcon', user.subscribed ? '⭐' : '👤');
      DOMHelpers.safeSetText('dropdownUserRole', user.subscribed ? 'Premium Reader' : 'Reader');
      DOMHelpers.safeToggleClass('dropdownUserInfo', 'admin-info', false);
      DOMHelpers.safeGetElement('dropdownDirectorSection').style.display = 'none';
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