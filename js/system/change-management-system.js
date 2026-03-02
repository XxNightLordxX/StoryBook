/**
 * Change Management System (CMS) - Rule 4
 * Full traceability for all changes
 * 
 * Implements:
 * - Pre/post snapshots
 * - Dependency diff tracking
 * - Impact report generation
 * - Rollback point creation
 * - Change justification logging
 * - Verification results tracking
 */

(function() {
  'use strict';

  const CMS = {
    changeHistory: [],
    currentChange: null,
    rollbackStack: [],

    /**
     * Initialize a new change
     * @param {string} changeId - Unique identifier for the change
     * @param {string} justification - Reason for the change
     * @param {string[]} affectedFiles - List of files that will be modified
     * @returns {Object} Change object
     */
    initChange: function(changeId, justification, affectedFiles) {
      const change = {
        change_id: changeId,
        timestamp: Date.now(),
        justification: justification,
        affected_files: affectedFiles,
        pre_snapshot: this.createSnapshot(affectedFiles),
        post_snapshot: null,
        dependency_diff: null,
        impact_report: null,
        rollback_point: null,
        verification_results: null,
        status: 'initialized'
      };

      this.currentChange = change;
      this.changeHistory.push(change);
      
      console.log(`[CMS] Change initialized: ${changeId}`);
      return change;
    },

    /**
     * Create a snapshot of files
     * @param {string[]} files - List of files to snapshot
     * @returns {Object} Snapshot object
     */
    createSnapshot: function(files) {
      const snapshot = {
        timestamp: Date.now(),
        files: {}
      };

      files.forEach(file => {
        try {
          const content = this.getFileContent(file);
          snapshot.files[file] = {
            content: content,
            hash: this.computeHash(content),
            size: content.length
          };
        } catch (error) {
          console.error(`[CMS] Error snapshotting ${file}:`, error);
          snapshot.files[file] = {
            error: error.message,
            content: null,
            hash: null,
            size: 0
          };
        }
      });

      return snapshot;
    },

    /**
     * Get file content
     * @param {string} filepath - Path to the file
     * @returns {string} File content
     */
    getFileContent: function(filepath) {
      // In browser environment, this would need to be implemented differently
      // For now, return a placeholder
      return '';
    },

    /**
     * Compute hash of content
     * @param {string} content - Content to hash
     * @returns {string} Hash value
     */
    computeHash: function(content) {
      // Simple hash implementation
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash.toString(16);
    },

    /**
     * Complete a change with post-snapshot
     * @param {string} changeId - Change identifier
     */
    completeChange: function(changeId) {
      const change = this.getChange(changeId);
      if (!change) {
        throw new Error(`Change not found: ${changeId}`);
      }

      change.post_snapshot = this.createSnapshot(change.affected_files);
      change.dependency_diff = this.computeDependencyDiff(change.pre_snapshot, change.post_snapshot);
      change.impact_report = this.generateImpactReport(change);
      change.rollback_point = this.createRollbackPoint(change);
      change.status = 'completed';

      console.log(`[CMS] Change completed: ${changeId}`);
      return change;
    },

    /**
     * Compute dependency diff between snapshots
     * @param {Object} preSnapshot - Pre-change snapshot
     * @param {Object} postSnapshot - Post-change snapshot
     * @returns {Object} Dependency diff
     */
    computeDependencyDiff: function(preSnapshot, postSnapshot) {
      const diff = {
        added: [],
        removed: [],
        modified: [],
        unchanged: []
      };

      const preFiles = Object.keys(preSnapshot.files);
      const postFiles = Object.keys(postSnapshot.files);

      preFiles.forEach(file => {
        if (!postSnapshot.files[file]) {
          diff.removed.push(file);
        } else if (preSnapshot.files[file].hash !== postSnapshot.files[file].hash) {
          diff.modified.push({
            file: file,
            pre_hash: preSnapshot.files[file].hash,
            post_hash: postSnapshot.files[file].hash,
            size_diff: postSnapshot.files[file].size - preSnapshot.files[file].size
          });
        } else {
          diff.unchanged.push(file);
        }
      });

      postFiles.forEach(file => {
        if (!preSnapshot.files[file]) {
          diff.added.push(file);
        }
      });

      return diff;
    },

    /**
     * Generate impact report for a change
     * @param {Object} change - Change object
     * @returns {Object} Impact report
     */
    generateImpactReport: function(change) {
      const report = {
        change_id: change.change_id,
        timestamp: Date.now(),
        files_affected: change.affected_files.length,
        files_modified: change.dependency_diff.modified.length,
        files_added: change.dependency_diff.added.length,
        files_removed: change.dependency_diff.removed.length,
        total_size_change: change.dependency_diff.modified.reduce((sum, f) => sum + f.size_diff, 0),
        risk_level: this.assessRiskLevel(change),
        recommendations: this.generateRecommendations(change)
      };

      return report;
    },

    /**
     * Assess risk level of a change
     * @param {Object} change - Change object
     * @returns {string} Risk level (LOW, MEDIUM, HIGH, CRITICAL)
     */
    assessRiskLevel: function(change) {
      const modifiedCount = change.dependency_diff.modified.length;
      const removedCount = change.dependency_diff.removed.length;

      if (removedCount > 0) {
        return 'CRITICAL';
      } else if (modifiedCount > 10) {
        return 'HIGH';
      } else if (modifiedCount > 5) {
        return 'MEDIUM';
      } else {
        return 'LOW';
      }
    },

    /**
     * Generate recommendations for a change
     * @param {Object} change - Change object
     * @returns {string[]} Recommendations
     */
    generateRecommendations: function(change) {
      const recommendations = [];

      if (change.dependency_diff.removed.length > 0) {
        recommendations.push('Review removed files for dependencies');
      }

      if (change.dependency_diff.modified.length > 5) {
        recommendations.push('Consider breaking this change into smaller chunks');
      }

      if (change.impact_report.risk_level === 'HIGH' || change.impact_report.risk_level === 'CRITICAL') {
        recommendations.push('Run comprehensive tests before deployment');
        recommendations.push('Consider staging deployment');
      }

      return recommendations;
    },

    /**
     * Create rollback point for a change
     * @param {Object} change - Change object
     * @returns {Object} Rollback point
     */
    createRollbackPoint: function(change) {
      const rollbackPoint = {
        change_id: change.change_id,
        timestamp: Date.now(),
        snapshot: JSON.parse(JSON.stringify(change.pre_snapshot)),
        git_commit: this.getCurrentGitCommit(),
        rollback_instructions: this.generateRollbackInstructions(change)
      };

      this.rollbackStack.push(rollbackPoint);
      return rollbackPoint;
    },

    /**
     * Get current git commit (placeholder)
     * @returns {string} Git commit hash
     */
    getCurrentGitCommit: function() {
      // Placeholder - would need to be implemented with git API
      return 'unknown';
    },

    /**
     * Generate rollback instructions
     * @param {Object} change - Change object
     * @returns {string[]} Rollback instructions
     */
    generateRollbackInstructions: function(change) {
      const instructions = [
        `Rollback for change: ${change.change_id}`,
        `Timestamp: ${new Date(change.timestamp).toISOString()}`,
        '',
        'Steps to rollback:',
        '1. Restore files from pre_snapshot',
        '2. Revert git commit if applicable',
        '3. Clear any caches',
        '4. Restart services',
        '5. Verify system integrity'
      ];

      return instructions;
    },

    /**
     * Record verification results
     * @param {string} changeId - Change identifier
     * @param {Object} results - Verification results
     */
    recordVerificationResults: function(changeId, results) {
      const change = this.getChange(changeId);
      if (!change) {
        throw new Error(`Change not found: ${changeId}`);
      }

      change.verification_results = {
        timestamp: Date.now(),
        passed: results.passed,
        failed: results.failed,
        total: results.total,
        details: results.details,
        status: results.passed === results.total ? 'verified' : 'failed'
      };

      if (change.verification_results.status === 'verified') {
        change.status = 'verified';
      } else {
        change.status = 'verification_failed';
      }

      console.log(`[CMS] Verification results recorded for ${changeId}: ${change.verification_results.status}`);
    },

    /**
     * Get change by ID
     * @param {string} changeId - Change identifier
     * @returns {Object|null} Change object
     */
    getChange: function(changeId) {
      return this.changeHistory.find(c => c.change_id === changeId) || null;
    },

    /**
     * Rollback a change
     * @param {string} changeId - Change identifier
     * @returns {boolean} Success status
     */
    rollback: function(changeId) {
      const change = this.getChange(changeId);
      if (!change || !change.rollback_point) {
        console.error(`[CMS] Cannot rollback: change or rollback point not found`);
        return false;
      }

      console.log(`[CMS] Rolling back change: ${changeId}`);
      
      // Restore files from pre_snapshot
      Object.keys(change.rollback_point.snapshot.files).forEach(file => {
        const fileData = change.rollback_point.snapshot.files[file];
        if (fileData.content !== null) {
          this.restoreFile(file, fileData.content);
        }
      });

      change.status = 'rolled_back';
      console.log(`[CMS] Rollback completed for: ${changeId}`);
      return true;
    },

    /**
     * Restore file content
     * @param {string} filepath - Path to the file
     * @param {string} content - Content to restore
     */
    restoreFile: function(filepath, content) {
      // Placeholder - would need to be implemented with file system API
      console.log(`[CMS] Restoring file: ${filepath}`);
    },

    /**
     * Get change history
     * @returns {Array} Change history
     */
    getChangeHistory: function() {
      return this.changeHistory;
    },

    /**
     * Export change history to JSON
     * @returns {string} JSON string
     */
    exportHistory: function() {
      return JSON.stringify(this.changeHistory, null, 2);
    },

    /**
     * Import change history from JSON
     * @param {string} json - JSON string
     */
    importHistory: function(json) {
      try {
        this.changeHistory = JSON.parse(json);
        console.log(`[CMS] Imported ${this.changeHistory.length} changes`);
      } catch (error) {
        console.error('[CMS] Error importing history:', error);
      }
    }
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.CMS = CMS;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CMS;
  }
})();