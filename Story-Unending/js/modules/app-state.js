/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Application state management
 * Extracted from index.html
 */


(function() {
  
  // APP STATE
  // ============================================
  const AppState = {
    currentUser: null,
    isAdmin: false,
    chapters: [],          // All generated chapter data (lightweight objects)
    currentChapter: 1,     // Which chapter is currently displayed
    totalGenerated: 0,
    generationInterval: null,
    sessionStart: Date.now(),
    timerInterval: null,
    sidebarOpen: false,
    dropdownOpen: false,
    selectedDonation: null,
    generating: false,
    paused: Storage.getPausedState()
  };

  // SECURITY: Admin credentials should be set via environment variables in production
  // For development/demo purposes, these defaults exist but should be changed immediately
  const ADMIN_DEFAULT = { 
    username: Storage.getAdminConfig().username || 'Admin', 
    password: Storage.getAdminConfig().password || 'admin123', 
    email: Storage.getAdminConfig().email || '', 
    isAdmin: true 
  };
  const ADMIN_USER = { ...ADMIN_DEFAULT, ...Storage.getAdminUser() };

  // Warn if using default credentials
  if (ADMIN_USER.username === 'Admin' && ADMIN_USER.password === 'admin123') {
    console.warn('⚠️ SECURITY WARNING: Using default admin credentials. Please change them!');
    console.warn('Set environment variables: ESE_ADMIN_USERNAME, ESE_ADMIN_PASSWORD');
  }

  // Create namespace object
  const AppStateModule = {
    AppState: AppState,
    ADMIN_DEFAULT: ADMIN_DEFAULT,
    ADMIN_USER: ADMIN_USER
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.AppState = AppState;
    window.AppStateModule = AppStateModule;
    window.ADMIN_DEFAULT = ADMIN_DEFAULT;
    window.ADMIN_USER = ADMIN_USER;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppStateModule;
  }
})();