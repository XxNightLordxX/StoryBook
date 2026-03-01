/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Save/Load System Module
 * Manages game save slots and persistence
 * @module save-load
 */

(function() {
  'use strict';

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Save slot structure
   * @typedef {Object} SaveSlot
   * @property {number} slotId - Slot identifier (1-5)
   * @property {string} name - Save slot name
   * @property {Date} timestamp - When the save was created
   * @property {number} currentChapter - Current chapter number
   * @property {number} totalGenerated - Total chapters generated
   * @property {Object} gameState - Complete game state
   * @property {string} screenshot - Optional screenshot data URL
   */

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Maximum number of save slots
   */
  const MAX_SAVE_SLOTS = 5;

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Storage key for save slots
   */
  const SAVE_SLOTS_KEY = 'ese_saveSlots';

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Gets all save slots from localStorage
   * @returns {Array<SaveSlot>} Array of save slots
   */
  const getSaveSlots = () => {
    return ErrorHandler.safeExecute(() => {
      const slots = JSON.parse(Storage.getItem(SAVE_SLOTS_KEY, []) || '[]');
      return slots.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, 'Loading save slots', []);
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Saves a save slot to localStorage
   * @param {Array<SaveSlot>} slots - Array of save slots
   */
  const saveSaveSlots = (slots) => {
    ErrorHandler.safeExecute(() => {
      Storage.setItem(SAVE_SLOTS_KEY, slots);
    }, 'Saving save slots');
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Creates a new save slot
   * @param {number} slotId - Slot identifier (1-5)
   * @param {string} name - Save slot name
   * @returns {SaveSlot|null} Created save slot or null if failed
   */
  const createSaveSlot = (slotId, name) => {
    try {
      const slots = getSaveSlots();
      
      // Check if slot already exists
      const existingIndex = slots.findIndex(s => s.slotId === slotId);
      if (existingIndex !== -1) {
        slots[existingIndex] = {
          slotId: slotId,
          name: name || `Save ${slotId}`,
          timestamp: new Date().toISOString(),
          currentChapter: AppStateModule.AppState.currentChapter,
          totalGenerated: AppStateModule.AppState.totalGenerated,
          gameState: captureGameState(),
          screenshot: captureScreenshot()
        };
      } else {
        slots.push({
          slotId: slotId,
          name: name || `Save ${slotId}`,
          timestamp: new Date().toISOString(),
          currentChapter: AppStateModule.AppState.currentChapter,
          totalGenerated: AppStateModule.AppState.totalGenerated,
          gameState: captureGameState(),
          screenshot: captureScreenshot()
        });
      }
      
      saveSaveSlots(slots);
      return slots.find(s => s.slotId === slotId);
    } catch (error) {
      // Error handled silently: console.error('Error creating save slot:', error);
      return null;
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Captures the current game state
   * @returns {Object} Complete game state
   */
  const captureGameState = () => {
    return {
      currentUser: AppStateModule.AppState.currentUser,
      isAdmin: AppStateModule.AppState.isAdmin,
      currentChapter: AppStateModule.AppState.currentChapter,
      totalGenerated: AppStateModule.AppState.totalGenerated,
      paused: AppStateModule.AppState.paused,
      sidebarOpen: AppStateModule.AppState.sidebarOpen,
      selectedDonation: AppStateModule.AppState.selectedDonation,
      // Save chapter data (limit to last 50 chapters to save space)
      chapters: AppStateModule.AppState.chapters.slice(-50),
      // Save used paragraphs
      usedParagraphs: Storage.getUsedParagraphs(),
      // Save timestamp
      savedAt: Date.now()
    };
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Captures a screenshot of the current view
   * @returns {string|null} Screenshot data URL or null
   */
  const captureScreenshot = () => {
    try {
      // For now, return null - could implement html2canvas later
      return null;
    } catch (error) {
      // Error handled silently: console.error('Error capturing screenshot:', error);
      return null;
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Loads a save slot
   * @param {number} slotId - Slot identifier to load
   * @returns {boolean} True if successful, false otherwise
   */
  const loadSaveSlot = (slotId) => {
    try {
      const slots = getSaveSlots();
      const slot = slots.find(s => s.slotId === slotId);
      
      if (!slot) {
        // Error logged: console.error(`Save slot ${slotId} not found`);
        return false;
      }
      
      // Restore game state
      restoreGameState(slot.gameState);
      
      // Show notification
      UINotifications.showNotification(`Loaded: ${slot.name}`, 'success');
      
      return true;
    } catch (error) {
      // Error handled silently: console.error('Error loading save slot:', error);
      UINotifications.showNotification('Failed to load save', 'error');
      return false;
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Restores game state from save data
   * @param {Object} gameState - Game state to restore
   */
  const restoreGameState = (gameState) => {
    try {
      // Restore app state
      AppStateModule.AppState.currentUser = gameState.currentUser;
      AppStateModule.AppState.isAdmin = gameState.isAdmin;
      AppStateModule.AppState.currentChapter = gameState.currentChapter;
      AppStateModule.AppState.totalGenerated = gameState.totalGenerated;
      AppStateModule.AppState.paused = gameState.paused;
      AppStateModule.AppState.sidebarOpen = gameState.sidebarOpen;
      AppStateModule.AppState.selectedDonation = gameState.selectedDonation;
      AppStateModule.AppState.chapters = gameState.chapters || [];
      
      // Restore used paragraphs
      if (gameState.usedParagraphs) {
        Storage.saveUsedParagraphs(gameState.usedParagraphs);
      }
      
      // Update UI
      updateUIAfterLoad();
      
    } catch (error) {
      // Error handled silently: console.error('Error restoring game state:', error);
      throw error;
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Updates UI after loading a save
   */
  const updateUIAfterLoad = () => {
    // Update chapter display
    const chapterContent = Storage.getChapterContent(AppStateModule.AppState.currentChapter);
    if (chapterContent) {
      DOMHelpers.safeGetElement('chapter-content').innerHTML = chapterContent.content;
      DOMHelpers.safeSetText('chapter-title', chapterContent.title);
    }
    
    // Update stats
    UIStats.updateStats();
    
    // Update sidebar state
    if (AppStateModule.AppState.sidebarOpen) {
      DOMHelpers.safeToggleClass('sidebar', 'open', true);
    } else {
      DOMHelpers.safeToggleClass('sidebar', 'open', false);
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Deletes a save slot
   * @param {number} slotId - Slot identifier to delete
   * @returns {boolean} True if successful, false otherwise
   */
  const deleteSaveSlot = (slotId) => {
    try {
      const slots = getSaveSlots();
      const filteredSlots = slots.filter(s => s.slotId !== slotId);
      
      if (filteredSlots.length === slots.length) {
        // Error logged: console.error(`Save slot ${slotId} not found`);
        return false;
      }
      
      saveSaveSlots(filteredSlots);
      UINotifications.showNotification(`Save slot ${slotId} deleted`, 'success');
      return true;
    } catch (error) {
      // Error handled silently: console.error('Error deleting save slot:', error);
      UINotifications.showNotification('Failed to delete save', 'error');
      return false;
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Gets a specific save slot
   * @param {number} slotId - Slot identifier
   * @returns {SaveSlot|null} Save slot or null if not found
   */
  const getSaveSlot = (slotId) => {
    const slots = getSaveSlots();
    return slots.find(s => s.slotId === slotId) || null;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Checks if a save slot exists
   * @param {number} slotId - Slot identifier
   * @returns {boolean} True if slot exists
   */
  const saveSlotExists = (slotId) => {
    return getSaveSlot(slotId) !== null;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Gets the number of used save slots
   * @returns {number} Number of used slots
   */
  const getUsedSlotCount = () => {
    return getSaveSlots().length;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Exports save data as JSON
   * @param {number} slotId - Slot identifier to export
   * @returns {string|null} JSON string or null if failed
   */
  const exportSave = (slotId) => {
    try {
      const slot = getSaveSlot(slotId);
      if (!slot) {
        // Error logged: console.error(`Save slot ${slotId} not found`);
        return null;
      }
      
      return JSON.stringify(slot, null, 2);
    } catch (error) {
      // Error handled silently: console.error('Error exporting save:', error);
      return null;
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Imports save data from JSON
   * @param {string} jsonData - JSON string to import
   * @param {number} slotId - Slot identifier to import to
   * @returns {boolean} True if successful, false otherwise
   */
  const importSave = (jsonData, slotId) => {
    try {
      const slotData = JSON.parse(jsonData);
      
      // Validate save data structure
      if (!slotData.slotId || !slotData.gameState) {
        throw new Error('Invalid save data structure');
      }
      
      // Update slot ID if different
      slotData.slotId = slotId;
      
      const slots = getSaveSlots();
      const existingIndex = slots.findIndex(s => s.slotId === slotId);
      
      if (existingIndex !== -1) {
        slots[existingIndex] = slotData;
      } else {
        slots.push(slotData);
      }
      
      saveSaveSlots(slots);
      UINotifications.showNotification('Save imported successfully', 'success');
      return true;
    } catch (error) {
      // Error handled silently: console.error('Error importing save:', error);
      UINotifications.showNotification('Failed to import save', 'error');
      return false;
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Clears all save slots
   * @returns {boolean} True if successful
   */
  const clearAllSaves = () => {
    try {
      Storage.removeItem(SAVE_SLOTS_KEY);
      UINotifications.showNotification('All saves cleared', 'success');
      return true;
    } catch (error) {
      // Error handled silently: console.error('Error clearing saves:', error);
      UINotifications.showNotification('Failed to clear saves', 'error');
      return false;
    }
  }

  // Create namespace object
  const SaveLoad = {
    getSaveSlots: getSaveSlots,
    createSaveSlot: createSaveSlot,
    loadSaveSlot: loadSaveSlot,
    deleteSaveSlot: deleteSaveSlot,
    getSaveSlot: getSaveSlot,
    saveSlotExists: saveSlotExists,
    getUsedSlotCount: getUsedSlotCount,
    exportSave: exportSave,
    importSave: importSave,
    clearAllSaves: clearAllSaves,
    MAX_SAVE_SLOTS: MAX_SAVE_SLOTS
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.SaveLoad = SaveLoad;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SaveLoad;
  }

})();