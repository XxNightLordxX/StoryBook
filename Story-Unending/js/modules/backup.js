/**
 * Automated Backup System Module
 * Provides backup, export, and import functionality
 */

const BackupSystem = (function() {
    'use strict';
    
    // Backup configuration
    const BACKUP_KEY = 'story_unending_backups';
    const MAX_BACKUPS = 10;
    const AUTO_BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
    
    /**
     * Create a backup of all application data
     * @param {string} name - Backup name (optional)
     * @returns {Object} Backup object
     */
    const createBackup = (name = null) => {
        try {
            const timestamp = new Date().toISOString();
            const backupName = name || `Backup ${formatDate(timestamp)}`;
            
            // Collect all data from localStorage
            const data = {};
            const keys = Storage.getAllKeys();
            for (const key of keys) {
                const value = Storage.getItem(key);
                
                // Skip backup-related keys
                if (key === BACKUP_KEY || key.startsWith('backup_')) {
                    continue;
                }
                
                data[key] = value;
            }
            
            // Create backup object
            const backup = {
                id: generateBackupId(),
                name: backupName,
                timestamp: timestamp,
                version: '1.0.0',
                data: data,
                size: JSON.stringify(data).length,
            };
            
            // Save backup
            saveBackup(backup);
            
            return backup;
            
        } catch (error) {
            ErrorHandler.handleError('Failed to create backup', error);
            return null;
        }
    }
    
    /**
     * Save a backup to localStorage
     * @param {Object} backup - Backup object
     * @returns {boolean} Success status
     */
    const saveBackup = (backup) => {
        try {
            // Get existing backups
            const backups = getBackups();
            
            // Add new backup
            backups.push(backup);
            
            // Sort by timestamp (newest first)
            backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // Keep only MAX_BACKUPS
            if (backups.length > MAX_BACKUPS) {
                backups.splice(MAX_BACKUPS);
            }
            
            // Save to localStorage
            Storage.setItem(BACKUP_KEY, backups);
            
            return true;
            
        } catch (error) {
            ErrorHandler.handleError('Failed to save backup', error);
            return false;
        }
    }
    
    /**
     * Get all backups
     * @returns {Array} Array of backup objects
     */
    const getBackups = () => {
        try {
            const backups = Storage.getItem(BACKUP_KEY, []);
            return backups;
        } catch (error) {
            ErrorHandler.handleError('Failed to get backups', error);
            return [];
        }
    }
    
    /**
     * Get a specific backup by ID
     * @param {string} backupId - Backup ID
     * @returns {Object|null} Backup object or null
     */
    const getBackup = (backupId) => {
        try {
            const backups = getBackups();
            return backups.find(b => b.id === backupId) || null;
        } catch (error) {
            ErrorHandler.handleError('Failed to get backup', error);
            return null;
        }
    }
    
    /**
     * Restore a backup
     * @param {string} backupId - Backup ID
     * @returns {boolean} Success status
     */
    const restoreBackup = (backupId) => {
        try {
            const backup = getBackup(backupId);
            
            if (!backup) {
                throw new Error('Backup not found');
            }
            
            // Clear existing data (except backup-related keys)
            const keys = Storage.getAllKeys();
            for (const key of keys) {
                if (key !== BACKUP_KEY && !key.startsWith('backup_')) {
                    Storage.removeItem(key);
                }
            }
            
            // Restore data
            for (const [key, value] of Object.entries(backup.data)) {
                Storage.setItem(key, value);
            }
            
            return true;
            
        } catch (error) {
            ErrorHandler.handleError('Failed to restore backup', error);
            return false;
        }
    }
    
    /**
     * Delete a backup
     * @param {string} backupId - Backup ID
     * @returns {boolean} Success status
     */
    const deleteBackup = (backupId) => {
        try {
            const backups = getBackups();
            const filteredBackups = backups.filter(b => b.id !== backupId);
            
            Storage.setItem(BACKUP_KEY, filteredBackups);
            
            return true;
            
        } catch (error) {
            ErrorHandler.handleError('Failed to delete backup', error);
            return false;
        }
    }
    
    /**
     * Export a backup as JSON file
     * @param {string} backupId - Backup ID
     * @returns {boolean} Success status
     */
    const exportBackup = (backupId) => {
        try {
            const backup = getBackup(backupId);
            
            if (!backup) {
                throw new Error('Backup not found');
            }
            
            // Create JSON blob
            const json = JSON.stringify(backup, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = `story-unending-backup-${backup.id}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up
            URL.revokeObjectURL(url);
            
            return true;
            
        } catch (error) {
            ErrorHandler.handleError('Failed to export backup', error);
            return false;
        }
    }
    
    /**
     * Import a backup from JSON file
     * @param {File} file - JSON file
     * @returns {Promise<Object>} Backup object
     */
    const importBackup = async (file) => {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    try {
                    const backup = JSON.parse(e.target.result);
                        
                        // Validate backup structure
                    if (!backup.id || !backup.timestamp || !backup.data) {
                    throw new Error('Invalid backup file');
                    }
                        
                        // Save backup
                    saveBackup(backup);
                        
                    resolve(backup);
                        
                    } catch (error) {
                    reject(new Error('Failed to parse backup file'));
                    }
                };
                
                reader.onerror = () => {
                    reject(new Error('Failed to read backup file'));
                };
                
                reader.readAsText(file);
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Create automatic backup
     * @returns {Object|null} Backup object or null
     */
    const createAutoBackup = () => {
        try {
            const lastBackupTime = Storage.getItem('last_auto_backup');
            const now = Date.now();
            
            // Check if auto backup is needed
            if (lastBackupTime && (now - parseInt(lastBackupTime)) < AUTO_BACKUP_INTERVAL) {
                return null;
            }
            
            // Create backup
            const backup = createBackup('Auto Backup');
            
            if (backup) {
                Storage.setItem('last_auto_backup', now.toString());
            }
            
            return backup;
            
        } catch (error) {
            ErrorHandler.handleError('Failed to create auto backup', error);
            return null;
        }
    }
    
    /**
     * Get backup statistics
     * @returns {Object} Statistics object
     */
    const getBackupStats = () => {
        try {
            const backups = getBackups();
            
            const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
            const oldestBackup = backups[backups.length - 1];
            const newestBackup = backups[0];
            
            return {
                count: backups.length,
                totalSize: totalSize,
                totalSizeFormatted: formatBytes(totalSize),
                oldestBackup: oldestBackup ? oldestBackup.timestamp : null,
                newestBackup: newestBackup ? newestBackup.timestamp : null,
                maxBackups: MAX_BACKUPS,
            };
            
        } catch (error) {
            ErrorHandler.handleError('Failed to get backup stats', error);
            return null;
        }
    }
    
    /**
     * Generate a unique backup ID
     * @returns {string} Backup ID
     */
    const generateBackupId = () => {
        return 'backup_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Format date for display
     * @param {string} isoString - ISO date string
     * @returns {string} Formatted date
     */
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    
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
        createBackup,
        getBackups,
        getBackup,
        restoreBackup,
        deleteBackup,
        exportBackup,
        importBackup,
        createAutoBackup,
        getBackupStats,
    };
})();

// Export to global scope
window.BackupSystem = BackupSystem;