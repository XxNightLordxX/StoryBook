/**
 * System Initialization
 * Loads and initializes all system modules
 */

(function() {
  'use strict';

  /**
   * Initialize all system modules
   */
  function initializeSystem() {
    console.log('[System] Initializing all system modules...');

    // Initialize Change Management System (CMS) - Rule 4
    if (typeof CMS !== 'undefined') {
      console.log('[System] CMS already loaded');
    }

    // Initialize Consolidation & Optimization Engine (COE) - Rule 5
    if (typeof COE !== 'undefined') {
      console.log('[System] COE already loaded');
    }

    // Initialize Self-Healing System (SHS) - Rule 6
    if (typeof SHS !== 'undefined') {
      SHS.init();
      console.log('[System] SHS initialized');
    }

    // Initialize Testing Enforcement Layer (TEL) - Rule 7
    if (typeof TEL !== 'undefined') {
      TEL.init();
      console.log('[System] TEL initialized');
    }

    // Initialize Continuity & State Preservation Layer (CSPL) - Rule 8
    if (typeof CSPL !== 'undefined') {
      CSPL.init();
      console.log('[System] CSPL initialized');
    }

    // Initialize Documentation Enforcement Layer (DEL) - Rule 9
    if (typeof DEL !== 'undefined') {
      DEL.init();
      console.log('[System] DEL initialized');
    }

    // Initialize Verification Hierarchy - Rule 10
    if (typeof VerificationHierarchy !== 'undefined') {
      VerificationHierarchy.init();
      console.log('[System] Verification Hierarchy initialized');
    }

    // Initialize Output Rules Enforcement - Rules 11-20
    if (typeof OutputRulesEnforcement !== 'undefined') {
      OutputRulesEnforcement.init();
      console.log('[System] Output Rules Enforcement initialized');
    }

    console.log('[System] All system modules initialized successfully');
  }

  // Initialize when DOM is ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeSystem);
    } else {
      initializeSystem();
    }
  } else {
    // Node.js environment
    initializeSystem();
  }

  // Export initialization function
  if (typeof window !== 'undefined') {
    window.initializeSystem = initializeSystem;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initializeSystem };
  }
})();