/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Story Generation Control Module
 * Unified control for story generation speed, mode, and pause/resume
 */

(function() {
  
  // State management
  const state = {
    generationMode: 'unlimited', // 'unlimited' or 'admin_progress'
    chapterInterval: 30000, // milliseconds
    isPaused: false,
    generationInterval: null
  };

  // Initialize from storage
  const initialize = () => {
    state.generationMode = Storage.getItem('ese_generationMode', 'unlimited') || 'unlimited';
    state.chapterInterval = parseInt(Storage.getItem('ese_chapterInterval', 30000)) || 30000;
    state.isPaused = Storage.getPausedState() || false;
    
    // Validate chapter interval
    if (isNaN(state.chapterInterval) || state.chapterInterval < 1000) {
      state.chapterInterval = 30000;
    }
    if (state.chapterInterval > 3600000) {
      state.chapterInterval = 30000;
    }
    
    // Update global reference
    if (typeof window !== 'undefined') {
      window.CHAPTER_INTERVAL_MS = state.chapterInterval;
    }
    
    updateUI();
  };

  // Set generation speed
  const setSpeed = (ms) => {
    if (typeof ms !== 'number' || ms < 1000 || ms > 3600000) {
      safeShowNotification('combat-notif', '\u274c Invalid Speed', 'Speed must be between 1 and 3600 seconds');
      return;
    }
    
    state.chapterInterval = ms;
    Storage.setItem('ese_chapterInterval', ms);
    
    // Update global reference
    if (typeof window !== 'undefined') {
      window.CHAPTER_INTERVAL_MS = ms;
    }
    
    // Restart generation interval if not paused
    if (!state.isPaused && AppState && AppState.generationInterval) {
      clearInterval(AppState.generationInterval);
      AppState.generationInterval = setInterval(generateNewChapter, ms);
    }
    
    updateSpeedDisplay();
    highlightActiveSpeed();
    safeShowNotification('level-notif', '\u23f1\ufe0f Speed Updated', `Generating 1 chapter every ${formatSpeed(ms)}`);
  };

  // Set custom speed from input
  const setCustomSpeedScreen = () => {
    const input = DOMHelpers.safeGetElement('customSpeedInputScreen');
    if (!input) {
      safeShowNotification('combat-notif', '\u274c Error', 'Speed input not found');
      return;
    }
    
    const seconds = parseInt(input.value);
    if (isNaN(seconds) || seconds < 1 || seconds > 3600) {
      safeShowNotification('combat-notif', '\u274c Invalid Speed', 'Enter a value between 1 and 3600 seconds');
      return;
    }
    
    setSpeed(seconds * 1000);
    input.value = '';
  };

  // Update generation mode
  const updateGenerationMode = () => {
    const select = DOMHelpers.safeGetElement('generationMode');
    if (!select) {
      safeShowNotification('combat-notif', '\u274c Error', 'Generation mode selector not found');
      return;
    }
    
    state.generationMode = select.value;
    Storage.setItem('ese_generationMode', state.generationMode);
    
    updateAdminProgressInfo();
    safeShowNotification('level-notif', '\ud83c\udfae Mode Changed', 
      `Generation: ${state.generationMode === 'unlimited' ? 'Unlimited' : 'Admin Progress'}`);
  };

  // Toggle pause/resume
  const togglePause = () => {
    state.isPaused = !state.isPaused;
    Storage.setPausedState(state.isPaused);
    
    const pauseIcon = DOMHelpers.safeGetElement('pauseIconScreen');
    const pauseLabel = DOMHelpers.safeGetElement('pauseLabelScreen');
    const pauseBtn = DOMHelpers.safeGetElement('pauseBtnScreen');
    const speedDisplay = DOMHelpers.safeGetElement('speedCurrentDisplayScreen');
    
    if (state.isPaused) {
      // Pause - clear interval
      if (AppState && AppState.generationInterval) {
        clearInterval(AppState.generationInterval);
        AppState.generationInterval = null;
      }
      
      if (pauseIcon) pauseIcon.textContent = '\u25b6\ufe0f';
      if (pauseLabel) pauseLabel.textContent = 'Resume Generation';
      if (pauseBtn) pauseBtn.classList.add('paused');
      if (speedDisplay) {
        speedDisplay.innerHTML = '<strong style="color:#f87171;">\u23f8\ufe0f PAUSED</strong>';
      }
      
      safeShowNotification('combat-notif', '\u23f8\ufe0f Paused', 'Chapter generation paused.');
    } else {
      // Resume - restart interval
      if (typeof generateNewChapter === 'function') {
        generateNewChapter(); // Generate one immediately
        if (AppState) {
          AppState.generationInterval = setInterval(generateNewChapter, state.chapterInterval);
        }
      }
      
      if (pauseIcon) pauseIcon.textContent = '\u23f8\ufe0f';
      if (pauseLabel) pauseLabel.textContent = 'Pause Generation';
      if (pauseBtn) pauseBtn.classList.remove('paused');
      
      updateSpeedDisplay();
      safeShowNotification('level-notif', '\u25b6\ufe0f Resumed', 
        `Generating 1 chapter every ${formatSpeed(state.chapterInterval)}`);
    }
  };

  // Reset story to chapter 1
  const resetStory = () => {
    if (!confirm('\u26a0\ufe0f Are you sure you want to reset the story to Chapter 1?\n\nThis will:\n\u2022 Delete all generated chapters\n\u2022 Reset MC stats to level 1\n\u2022 Clear all directives\n\u2022 Keep story rules intact\n\nThis action cannot be undone!')) {
      return;
    }
    
    // Reset app state
    if (AppState) {
      AppState.chapters = [];
      AppState.currentChapter = 1;
      AppState.totalGenerated = 0;
      
      // Clear generation interval
      if (AppState.generationInterval) {
        clearInterval(AppState.generationInterval);
        AppState.generationInterval = null;
      }
    }
    
    // Reset story engine
    if (typeof StoryEngine !== 'undefined' && StoryEngine.reset) {
      StoryEngine.reset();
    }
    
    // Clear directives
    Storage.removeItem('ese_directives');
    
    // Update UI
    const storyContainer = DOMHelpers.safeGetElement('storyContainer');
    if (storyContainer) storyContainer.innerHTML = '';
    
    if (typeof updateChapterNav === 'function') updateChapterNav();
    if (typeof updateStats === 'function') updateStats();
    if (typeof updateDirectiveList === 'function') updateDirectiveList();
    
    // Restart generation
    if (typeof catchUpAndStart === 'function') {
      catchUpAndStart();
    }
    
    safeShowNotification('level-notif', '\ud83d\udd04 Story Reset', 'Story has been reset to Chapter 1!');
  };

  // Update speed display
  const updateSpeedDisplay = () => {
    const speedDisplay = DOMHelpers.safeGetElement('speedCurrentDisplayScreen');
    const speedValue = DOMHelpers.safeGetElement('speedValueDisplayScreen');
    
    if (speedDisplay && speedValue) {
      speedValue.textContent = formatSpeed(state.chapterInterval);
    }
  };

  // Highlight active speed button
  const highlightActiveSpeed = () => {
    const buttons = document.querySelectorAll('.speed-presets button[data-speed]');
    buttons.forEach(btn => {
      const speed = parseInt(btn.dataset.speed);
      if (speed === state.chapterInterval) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  // Update admin progress info
  const updateAdminProgressInfo = () => {
    const info = DOMHelpers.safeGetElement('adminProgressInfo');
    if (!info) return;
    
    if (state.generationMode === 'admin_progress') {
      info.style.display = 'block';
      const adminCh = DOMHelpers.safeGetElement('adminCurrentChapter');
      const genCount = DOMHelpers.safeGetElement('generatedChaptersCount');
      
      if (adminCh && AppState) adminCh.textContent = AppState.currentChapter;
      if (genCount && AppState) genCount.textContent = AppState.totalGenerated;
    } else {
      info.style.display = 'none';
    }
  };

  // Update all UI elements
  const updateUI = () => {
    updateSpeedDisplay();
    highlightActiveSpeed();
    updateAdminProgressInfo();
    
    // Update pause button state
    const pauseIcon = DOMHelpers.safeGetElement('pauseIconScreen');
    const pauseLabel = DOMHelpers.safeGetElement('pauseLabelScreen');
    const pauseBtn = DOMHelpers.safeGetElement('pauseBtnScreen');
    
    if (state.isPaused) {
      if (pauseIcon) pauseIcon.textContent = '\u25b6\ufe0f';
      if (pauseLabel) pauseLabel.textContent = 'Resume Generation';
      if (pauseBtn) pauseBtn.classList.add('paused');
    } else {
      if (pauseIcon) pauseIcon.textContent = '\u23f8\ufe0f';
      if (pauseLabel) pauseLabel.textContent = 'Pause Generation';
      if (pauseBtn) pauseBtn.classList.remove('paused');
    }
    
    // Update generation mode selector
    const modeSelect = DOMHelpers.safeGetElement('generationMode');
    if (modeSelect) {
      modeSelect.value = state.generationMode;
    }
  };

  // Format speed for display
  const formatSpeed = (ms) => {
    const seconds = ms / 1000;
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m`;
    } else {
      return `${Math.floor(seconds / 3600)}h`;
    }
  };

  // Get current state
  const getState = () => {
    return { ...state };
  };

  // Create namespace object
  const StoryGenerationControl = {
    initialize: initialize,
    setSpeed: setSpeed,
    setCustomSpeedScreen: setCustomSpeedScreen,
    updateGenerationMode: updateGenerationMode,
    togglePause: togglePause,
    resetStory: resetStory,
    updateSpeedDisplay: updateSpeedDisplay,
    highlightActiveSpeed: highlightActiveSpeed,
    updateAdminProgressInfo: updateAdminProgressInfo,
    updateUI: updateUI,
    getState: getState
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.StoryGenerationControl = StoryGenerationControl;
    window.setSpeed = setSpeed;
    window.setCustomSpeedScreen = setCustomSpeedScreen;
    window.updateGenerationMode = updateGenerationMode;
    window.togglePause = togglePause;
    window.resetStory = resetStory;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoryGenerationControl;
  }
})();
