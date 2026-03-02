/**
 * Main Application Entry Point
 * Loads all modules in the correct order
 * 
 * NOTE: This file is currently not used in index.html
 * Modules are loaded directly via script tags for better control
 */

// ============================================
// UTILITIES
// ============================================
import './utils/security.js';
import './utils/storage.js';
import './utils/helpers.js';

// ============================================
// MODULES
// ============================================
import './modules/app-state.js';
import './modules/story-timeline.js';
import './modules/auth.js';
import './modules/navigation.js';
import './modules/admin.js';
import './modules/generation.js';
// NOTE: donation.js, directive.js, and reset-password.js do not exist
// These modules were removed or never created
import './modules/misc.js';
import './modules/initialization.js';

// ============================================
// UI COMPONENTS
// ============================================
import './ui/dropdown.js';
import './ui/text-size.js';
// NOTE: text-size-extended.js does not exist
import './ui/modals.js';
import './ui/notifications.js';
import './ui/keyboard-shortcuts.js';
import './ui/sidebar.js';
import './ui/stats.js';

// All modules loaded successfully