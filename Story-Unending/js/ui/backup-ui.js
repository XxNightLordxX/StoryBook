/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Backup System UI Module
 * Provides user interface for backup management
 */

const BackupUI = (function() {
    'use strict';
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Open backup modal
     * @returns {void}
     */
    const openModal = () => {
        try {
            // Create modal if it doesn't exist
            let modal = DOMHelpers.safeGetElement('backup-modal');
            if (!modal) {
                modal = createBackupModal();
                document.body.appendChild(modal);
            }
            
            // Load backups
            loadBackups();
            
            // Show modal
            modal.style.display = 'block';
            
        } catch (error) {
            ErrorHandler.handleError('Failed to open backup modal', error);
        }
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Close backup modal
     * @returns {void}
     */
    const closeModal = () => {
        try {
            const modal = DOMHelpers.safeGetElement('backup-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to close backup modal', error);
        }
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create backup modal
     * @returns {HTMLElement} Modal element
     */
    const createBackupModal = () => {
        const modal = document.createElement('div');
        modal.id = 'backup-modal';
        modal.className = 'modal';
        
        modal.innerHTML = `
      <div class="modal-content backup-modal-content">
          <div class="modal-header">
              <h2>Backup Management</h2>
              <button class="close-button" onclick="BackupUI.closeModal()">&times;</button>
          </div>

          <div class="modal-body">
              <!-- Backup Actions -->
              <div class="backup-actions">
                  <button class="btn btn-primary" onclick="BackupUI.createBackup()">
                      <i class="icon">💾</i> Create Backup
                  </button>
                  <button class="btn btn-secondary" onclick="BackupUI.importBackup()">
                      <i class="icon">📥</i> Import Backup
                  </button>
                  <input type="file" id="backup-import-file" accept=".json" style="display: none;" onchange="BackupUI.handleFileImport(event)">
              </div>

              <!-- Backup Stats -->
              <div class="backup-stats" id="backup-stats">
                  <div class="stat-item">
                      <span class="stat-label">Total Backups:</span>
                      <span class="stat-value" id="stat-count">0</span>
                  </div>
                  <div class="stat-item">
                      <span class="stat-label">Total Size:</span>
                      <span class="stat-value" id="stat-size">0 KB</span>
                  </div>
                  <div class="stat-item">
                      <span class="stat-label">Max Backups:</span>
                      <span class="stat-value">10</span>
                  </div>
              </div>

              <!-- Backup List -->
              <div class="backup-list">
                  <h3>Backups</h3>
                  <div id="backup-list-container" class="backup-list-container">
                      <!-- Backups will be loaded here -->
                  </div>
              </div>
          </div>
      </div>
  `;
        
        return modal;
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Load backups into the UI
     * @returns {void}
     */
    const loadBackups = () => {
        try {
            const backups = BackupSystem.getBackups();
            const container = DOMHelpers.safeGetElement('backup-list-container');
            
            if (!container) return;
            
            // Update stats
            const stats = BackupSystem.getBackupStats();
            if (stats) {
                DOMHelpers.safeSetText('stat-count', stats.count);
                DOMHelpers.safeSetText('stat-size', stats.totalSizeFormatted);
            }
            
            // Clear container
            container.innerHTML = '';
            
            // Check if no backups
            if (backups.length === 0) {
                container.innerHTML = '<p class="no-backups">No backups available</p>';
                return;
            }
            
            // Render backups
            backups.forEach(backup => {
                const backupItem = createBackupItem(backup);
                container.appendChild(backupItem);
            });
            
        } catch (error) {
            ErrorHandler.handleError('Failed to load backups', error);
        }
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create backup item element
     * @param {Object} backup - Backup object
     * @returns {HTMLElement} Backup item element
     */
    const createBackupItem = (backup) => {
        const item = document.createElement('div');
        item.className = 'backup-item';
        item.dataset.backupId = backup.id;
        
        const date = new Date(backup.timestamp);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        
        item.innerHTML = `
            <div class="backup-info">
                <div class="backup-name">${sanitizeHTML(backup.name)}</div>
                <div class="backup-date">${formattedDate}</div>
                <div class="backup-size">${formatBytes(backup.size)}</div>
            </div>
            <div class="backup-actions">
                <button class="btn btn-small btn-success" onclick="BackupUI.restoreBackup('${backup.id}')" title="Restore">
                    <i class="icon">↩️</i>
                </button>
                <button class="btn btn-small btn-info" onclick="BackupUI.exportBackup('${backup.id}')" title="Export">
                    <i class="icon">📤</i>
                </button>
                <button class="btn btn-small btn-danger" onclick="BackupUI.deleteBackup('${backup.id}')" title="Delete">
                    <i class="icon">🗑️</i>
                </button>
            </div>
        `;
        
        return item;
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Create a new backup
     * @returns {void}
     */
    const createBackup = () => {
        try {
            const backup = BackupSystem.createBackup();
            
            if (backup) {
                UINotifications.showNotification('Backup created successfully', 'success');
                loadBackups();
            } else {
                UINotifications.showNotification('Failed to create backup', 'error');
            }
            
        } catch (error) {
            ErrorHandler.handleError('Failed to create backup', error);
        }
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Restore a backup
     * @param {string} backupId - Backup ID
     * @returns {void}
     */
    const restoreBackup = (backupId) => {
        try {
            // Confirm restore
            if (!confirm('Are you sure you want to restore this backup? This will replace all current data.')) {
                return;
            }
            
            const success = BackupSystem.restoreBackup(backupId);
            
            if (success) {
                UINotifications.showNotification('Backup restored successfully. Please refresh the page.', 'success');
                closeModal();
                
                // Reload page after short delay
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } else {
                UINotifications.showNotification('Failed to restore backup', 'error');
            }
            
        } catch (error) {
            ErrorHandler.handleError('Failed to restore backup', error);
        }
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Delete a backup
     * @param {string} backupId - Backup ID
     * @returns {void}
     */
    const deleteBackup = (backupId) => {
        try {
            // Confirm delete
            if (!confirm('Are you sure you want to delete this backup?')) {
                return;
            }
            
            const success = BackupSystem.deleteBackup(backupId);
            
            if (success) {
                UINotifications.showNotification('Backup deleted successfully', 'success');
                loadBackups();
            } else {
                UINotifications.showNotification('Failed to delete backup', 'error');
            }
            
        } catch (error) {
            ErrorHandler.handleError('Failed to delete backup', error);
        }
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Export a backup
     * @param {string} backupId - Backup ID
     * @returns {void}
     */
    const exportBackup = (backupId) => {
        try {
            const success = BackupSystem.exportBackup(backupId);
            
            if (success) {
                UINotifications.showNotification('Backup exported successfully', 'success');
            } else {
                UINotifications.showNotification('Failed to export backup', 'error');
            }
            
        } catch (error) {
            ErrorHandler.handleError('Failed to export backup', error);
        }
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Import a backup
     * @returns {void}
     */
    const importBackup = () => {
        try {
            const fileInput = DOMHelpers.safeGetElement('backup-import-file');
            if (fileInput) {
                fileInput.click();
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to import backup', error);
        }
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Handle file import
     * @param {Event} event - File input event
     * @returns {void}
     */
    const handleFileImport = async (event) => {
        try {
            const file = event.target.files[0];
            
            if (!file) {
                return;
            }
            
            UINotifications.showNotification('Importing backup...', 'info');
            
            const backup = await BackupSystem.importBackup(file);
            
            if (backup) {
                UINotifications.showNotification('Backup imported successfully', 'success');
                loadBackups();
            } else {
                UINotifications.showNotification('Failed to import backup', 'error');
            }
            
            // Reset file input
            event.target.value = '';
            
        } catch (error) {
            ErrorHandler.handleError('Failed to import backup', error);
            UINotifications.showNotification('Failed to import backup', 'error');
        }
    }
    
    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Format bytes for display
     * @param {number} bytes - Number of bytes
     * @returns {string} Formatted bytes
     */
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    // Public API
    return {
        openModal,
        closeModal,
        createBackup,
        restoreBackup,
        deleteBackup,
        exportBackup,
        importBackup,
        handleFileImport,
    };
})();

// Export to global scope
window.BackupUI = BackupUI;