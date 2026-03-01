/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Save/Load UI Module
 * Manages the save/load interface
 * @module save-load-ui
 */

(function() {
  'use strict';

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Opens the save/load modal
   */
  const openSaveLoadModal = () => {
    const modal = DOMHelpers.safeGetElement('save-load-modal');
    if (!modal) {
      createSaveLoadModal();
    }
    
    refreshSaveSlotsList();
    DOMHelpers.safeToggleClass('save-load-modal', 'active', true);
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Closes the save/load modal
   */
  const closeSaveLoadModal = () => {
    const modal = DOMHelpers.safeGetElement('save-load-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Creates the save/load modal HTML structure
   */
  const createSaveLoadModal = () => {
    const modalHTML = `
      <div id="save-load-modal" class="modal">
        <div class="modal-content save-load-content">
          <div class="modal-header">
            <h2>Save / Load Game</h2>
            <button class="close-btn" onclick="SaveLoadUI.closeModal()">&times;</button>
          </div>
          
          <div class="save-load-tabs">
            <button class="tab-btn active" data-tab="save" onclick="SaveLoadUI.switchTab('save')">Save Game</button>
            <button class="tab-btn" data-tab="load" onclick="SaveLoadUI.switchTab('load')">Load Game</button>
            <button class="tab-btn" data-tab="manage" onclick="SaveLoadUI.switchTab('manage')">Manage Saves</button>
          </div>
          
          <div class="tab-content active" id="save-tab">
            <div class="save-slots-grid" id="save-slots-grid">
              <!-- Save slots will be rendered here -->
            </div>
          </div>
          
          <div class="tab-content" id="load-tab">
            <div class="save-slots-grid" id="load-slots-grid">
              <!-- Save slots will be rendered here -->
            </div>
          </div>
          
          <div class="tab-content" id="manage-tab">
            <div class="save-slots-grid" id="manage-slots-grid">
              <!-- Save slots will be rendered here -->
            </div>
            <div class="manage-actions">
              <button class="btn btn-danger" onclick="SaveLoadUI.exportAllSaves()">Export All Saves</button>
              <button class="btn btn-danger" onclick="SaveLoadUI.clearAllSaves()">Clear All Saves</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Switches between save/load tabs
   * @param {string} tabName - Tab name ('save', 'load', or 'manage')
   */
  const switchTab = (tabName) => {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    DOMHelpers.safeGetElement(`${tabName}-tab`).classList.add('active');
    
    // Refresh the appropriate grid
    refreshSaveSlotsList();
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Refreshes the save slots list display
   */
  const refreshSaveSlotsList = () => {
    const slots = SaveLoad.getSaveSlots();
    
    // Render save tab
    renderSaveSlots('save-slots-grid', slots, 'save');
    
    // Render load tab
    renderSaveSlots('load-slots-grid', slots, 'load');
    
    // Render manage tab
    renderSaveSlots('manage-slots-grid', slots, 'manage');
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Renders save slots in a grid
   * @param {string} containerId - Container element ID
   * @param {Array} slots - Array of save slots
   * @param {string} mode - Mode ('save', 'load', or 'manage')
   */
  const renderSaveSlots = (containerId, slots, mode) => {
    const container = DOMHelpers.safeGetElement(containerId);
    if (!container) return;
    
    let html = '';
    
    for (let i = 1; i <= SaveLoad.MAX_SAVE_SLOTS; i++) {
      const slot = slots.find(s => s.slotId === i);
      const isEmpty = !slot;
      
      html += `
        <div class="save-slot ${isEmpty ? 'empty' : ''}" data-slot-id="${i}">
          <div class="slot-header">
            <span class="slot-number">Slot ${i}</span>
            ${!isEmpty ? `<span class="slot-date">${formatDate(slot.timestamp)}</span>` : ''}
          </div>
          
          ${!isEmpty ? `
            <div class="slot-info">
              <h3 class="slot-name">${sanitizeHTML(slot.name)}</h3>
              <p class="slot-details">
                Chapter ${slot.currentChapter} • ${slot.totalGenerated} chapters generated
              </p>
            </div>
          ` : `
            <div class="slot-empty">
              <p>Empty Slot</p>
            </div>
          `}
          
          <div class="slot-actions">
            ${mode === 'save' ? `
              <button class="btn btn-primary" onclick="SaveLoadUI.saveToSlot(${i})">
                ${isEmpty ? 'Save' : 'Overwrite'}
              </button>
            ` : ''}
            
            ${mode === 'load' && !isEmpty ? `
              <button class="btn btn-success" onclick="SaveLoadUI.loadFromSlot(${i})">Load</button>
            ` : ''}
            
            ${mode === 'manage' ? `
              ${!isEmpty ? `
                <button class="btn btn-info" onclick="SaveLoadUI.exportSlot(${i})">Export</button>
                <button class="btn btn-danger" onclick="SaveLoadUI.deleteSlot(${i})">Delete</button>
              ` : `
                <button class="btn btn-secondary" disabled>No Data</button>
              `}
            ` : ''}
          </div>
        </div>
      `;
    }
    
    container.innerHTML = html;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Formats a date string for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    
    // Less than 1 day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    
    // Less than 1 week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
    
    // Otherwise show full date
    return date.toLocaleDateString();
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Saves the current game to a specific slot
   * @param {number} slotId - Slot identifier
   */
  const saveToSlot = async (slotId) => {
    const slot = SaveLoad.getSaveSlot(slotId);
    const slotName = slot ? slot.name : `Save ${slotId}`;
    
    // Prompt for custom name
    const customName = await PromptModal.show(`Enter a name for this save (or leave empty for "${slotName}"):`, '', 'Input');
    
    if (customName !== null) {
      const name = customName.trim() || slotName;
      const result = SaveLoad.createSaveSlot(slotId, name);
      
      if (result) {
        UINotifications.showNotification(`Game saved to Slot ${slotId}`, 'success');
        refreshSaveSlotsList();
      } else {
        UINotifications.showNotification('Failed to save game', 'error');
      }
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Loads a game from a specific slot
   * @param {number} slotId - Slot identifier
   */
  const loadFromSlot = (slotId) => {
    const slot = SaveLoad.getSaveSlot(slotId);
    
    if (!slot) {
      UINotifications.showNotification(`Slot ${slotId} is empty`, 'error');
      return;
    }
    
    // Confirm load
    if (confirm(`Load save "${slot.name}"?\n\nChapter: ${slot.currentChapter}\nGenerated: ${slot.totalGenerated} chapters\n\nCurrent progress will be lost.`)) {
      const success = SaveLoad.loadSaveSlot(slotId);
      
      if (success) {
        closeSaveLoadModal();
        refreshSaveSlotsList();
      }
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Deletes a save slot
   * @param {number} slotId - Slot identifier
   */
  const deleteSlot = (slotId) => {
    if (confirm(`Are you sure you want to delete Slot ${slotId}? This cannot be undone.`)) {
      const success = SaveLoad.deleteSaveSlot(slotId);
      
      if (success) {
        refreshSaveSlotsList();
      }
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Exports a save slot to JSON
   * @param {number} slotId - Slot identifier
   */
  const exportSlot = (slotId) => {
    const jsonData = SaveLoad.exportSave(slotId);
    
    if (jsonData) {
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `story-unending-save-${slotId}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      UINotifications.showNotification(`Slot ${slotId} exported`, 'success');
    } else {
      UINotifications.showNotification('Failed to export save', 'error');
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Exports all save slots
   */
  const exportAllSaves = () => {
    const slots = SaveLoad.getSaveSlots();
    
    if (slots.length === 0) {
      UINotifications.showNotification('No saves to export', 'warning');
      return;
    }
    
    const jsonData = JSON.stringify(slots, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-unending-all-saves-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    UINotifications.showNotification('All saves exported', 'success');
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Clears all save slots
   */
  const clearAllSaves = () => {
    if (confirm('Are you sure you want to delete ALL save slots? This cannot be undone.')) {
      const success = SaveLoad.clearAllSaves();
      
      if (success) {
        refreshSaveSlotsList();
      }
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Imports a save from a file
   * @param {File} file - File to import
   */
  const importSaveFromFile = async (file) => {
    const reader = new FileReader();
    
    reader.onload = async function(e) {
      const jsonData = e.target.result;
      
      // Check if it's a single save or all saves
      try {
        const data = JSON.parse(jsonData);
        
        if (Array.isArray(data)) {
          // Import all saves
          data.forEach(slot => {
            SaveLoad.importSave(JSON.stringify(slot), slot.slotId);
          });
          refreshSaveSlotsList();
        } else {
          // Import single save
          const slotId = await PromptModal.show('Enter slot number (1-5) to import to:', '', 'Input');
          if (slotId && slotId >= 1 && slotId <= 5) {
            const success = SaveLoad.importSave(jsonData, parseInt(slotId));
            if (success) {
              refreshSaveSlotsList();
            }
          }
        }
      } catch (error) {
        // Error handled silently: console.error('Error importing save:', error);
        UINotifications.showNotification('Invalid save file', 'error');
      }
    };
    
    reader.readAsText(file);
  }

  // Create namespace object
  const SaveLoadUI = {
    openModal: openSaveLoadModal,
    closeModal: closeSaveLoadModal,
    switchTab: switchTab,
    saveToSlot: saveToSlot,
    loadFromSlot: loadFromSlot,
    deleteSlot: deleteSlot,
    exportSlot: exportSlot,
    exportAllSaves: exportAllSaves,
    clearAllSaves: clearAllSaves,
    importSaveFromFile: importSaveFromFile
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.SaveLoadUI = SaveLoadUI;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SaveLoadUI;
  }

})();