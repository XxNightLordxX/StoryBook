/**
 * Save/Load System Module
 * Manages game save slots and persistence
 * @module save-load
 */

(function() {
  'use strict';

  /**
   * Save slot structure
   * @typedef {Object} SaveSlot
   * @property {number} slotId - Slot identifier (1-5)
   * @property {string} name - Save slot name
   * @property {Date} timestamp - When the save was created
   * @property {number} currentChapter - Current chapter number
   * @property {number} totalGenerated - Total chapters generated
   * @property {Object} gameState - Complete game state
   */

  /**
   * Maximum number of save slots
   */
  const MAX_SAVE_SLOTS = 5;

  /**
   * Storage key for save slots
   */
  const SAVE_SLOTS_KEY = 'ese_saveSlots';

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
   * Saves a save slot to localStorage
   * @param {Array<SaveSlot>} slots - Array of save slots
   */
  const saveSaveSlots = (slots) => {
    ErrorHandler.safeExecute(() => {
      Storage.setItem(SAVE_SLOTS_KEY, slots);
    }, 'Saving save slots');
  }

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
        };
      } else {
        slots.push({
          slotId: slotId,
          name: name || `Save ${slotId}`,
          timestamp: new Date().toISOString(),
          currentChapter: AppStateModule.AppState.currentChapter,
          totalGenerated: AppStateModule.AppState.totalGenerated,
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
