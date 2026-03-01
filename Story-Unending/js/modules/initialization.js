/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Application initialization
 * Extracted from index.html
 */


(function() {
  
  // INITIALIZATION
  // ============================================
  const runInitialization = () => {
    try {
      
      // Verify critical systems are available
      if (typeof UnifiedPoolManager !== 'undefined') {
      } else {
        console.warn('✗ UnifiedPoolManager not available');
      }
      
      if (typeof UnifiedAIGenerator !== 'undefined') {
      } else {
        console.warn('✗ UnifiedAIGenerator not available');
      }
      
      if (typeof AdminReadingTracker !== 'undefined') {
      } else {
        console.warn('✗ AdminReadingTracker not available');
      }
      
      if (typeof StrictDuplicatePrevention !== 'undefined') {
      } else {
        console.warn('✗ StrictDuplicatePrevention not available');
      }
      
      if (typeof StoryEngine !== 'undefined') {
      } else {
        console.warn('✗ StoryEngine not available');
      \n      // Initialize Story Generation Control\n      if (typeof StoryGenerationControl !== 'undefined' && typeof StoryGenerationControl.initialize === 'function') {\n        StoryGenerationControl.initialize();\n      } else {\n        console.warn('\u2717 StoryGenerationControl not available');\n      }
      }
      
      // Generate initial chapter and start the story
      if (typeof StoryEngine !== 'undefined' && typeof generateNewChapter === 'function' && typeof catchUpAndStart === 'function') {
        try {
          // Generate first chapter if none exist
          if (!AppState.totalGenerated || AppState.totalGenerated === 0) {
            generateNewChapter();
          }
          // Start the story display and generation timer
          catchUpAndStart();
        } catch (genError) {
          console.error('Failed to generate initial chapter:', genError.message);
          // If AdminReadingTracker is blocking, try without it
          if (genError.message.includes('Admin has only read up to chapter')) {
            if (typeof AdminReadingTracker !== 'undefined') {
              AdminReadingTracker.updateReadingProgress(1);
              try {
                generateNewChapter();
                catchUpAndStart();
              } catch (retryError) {
                console.error('Failed to start story after admin progress update:', retryError.message);
              }
            }
          }
        }
      } else {
        console.warn('Story generation functions not available yet. Waiting...');
        // Retry after a short delay to allow all scripts to load
        setTimeout(() => {
          if (typeof generateNewChapter === 'function' && typeof catchUpAndStart === 'function') {
            try {
              if (!AppState.totalGenerated || AppState.totalGenerated === 0) {
                generateNewChapter();
              }
              catchUpAndStart();
            } catch (delayError) {
              console.error('Failed to start story (delayed):', delayError.message);
            }
          }
        }, 500);
      }
      
      
    } catch (error) {
      console.error('=== Initialization failed ===');
      console.error('Error:', error);
      console.error('Stack:', error.stack);
    }
  };

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInitialization);
  } else {
    // DOM is already loaded, run immediately
    runInitialization();
  }

  // Create namespace object
  const Initialization = {
    // Initialization module - runs on DOMContentLoaded
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.Initialization = Initialization;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Initialization;
  }
})();