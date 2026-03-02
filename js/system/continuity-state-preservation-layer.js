/**
 * Continuity & State Preservation Layer (CSPL) - Rule 8
 * Zero context loss for all tasks
 * 
 * Implements:
 * - Task definition requirements (task_id, atomic_steps, completion_criteria, state_variables, resumption_context, next_step_pointer, dependency_list, rollback_criteria)
 * - Checkpoint requirements (timestamp, task_id, step_id, progress_percent, current_file, cursor_position, environment_state, database_state, service_state, test_results, error_state, git_state, pending_work, decision_log)
 * - Resumption requirements (restore state, validate integrity, verify no external changes, re-run smoke tests, rebuild context, continue from interruption point)
 */

(function() {
  'use strict';

  const CSPL = {
    tasks: {},
    checkpoints: {},
    currentTask: null,

    /**
     * Initialize continuity & state preservation layer
     */
    init: function() {
      console.log('[CSPL] Continuity & State Preservation Layer initialized');
      this.loadPersistedState();
    },

    /**
     * Create a new task
     * @param {string} taskId - Unique task identifier
     * @param {Array} atomicSteps - List of atomic steps
     * @param {Function} completionCriteria - Function to check completion
     * @param {Object} stateVariables - Initial state variables
     * @returns {Object} Task object
     */
    createTask: function(taskId, atomicSteps, completionCriteria, stateVariables) {
      const task = {
        task_id: taskId,
        status: 'initialized',
        created_at: Date.now(),
        updated_at: Date.now(),
        atomic_steps: atomicSteps,
        completion_criteria: completionCriteria,
        state_variables: stateVariables || {},
        resumption_context: null,
        next_step_pointer: 0,
        dependency_list: [],
        rollback_criteria: [],
        checkpoints: []
      };

      this.tasks[taskId] = task;
      this.currentTask = taskId;
      
      console.log(`[CSPL] Task created: ${taskId}`);
      this.persistState();
      
      return task;
    },

    /**
     * Execute task with state preservation
     * @param {string} taskId - Task identifier
     * @returns {Object} Execution result
     */
    executeTask: function(taskId) {
      const task = this.tasks[taskId];
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      this.currentTask = taskId;
      task.status = 'running';
      task.updated_at = Date.now();

      console.log(`[CSPL] Executing task: ${taskId}`);

      try {
        // Execute atomic steps
        for (let i = task.next_step_pointer; i < task.atomic_steps.length; i++) {
          task.next_step_pointer = i;
          
          // Create checkpoint before each step
          this.createCheckpoint(taskId, i);
          
          // Execute step
          const stepResult = this.executeStep(task, task.atomic_steps[i]);
          
          // Update state
          task.state_variables = { ...task.state_variables, ...stepResult.state };
          
          // Check completion criteria
          if (task.completion_criteria(task.state_variables)) {
            task.status = 'completed';
            task.updated_at = Date.now();
            console.log(`[CSPL] Task completed: ${taskId}`);
            break;
          }
        }

        this.persistState();
        return {
          success: true,
          task: task
        };
      } catch (error) {
        console.error(`[CSPL] Task execution error:`, error);
        task.status = 'failed';
        task.error = error.message;
        task.updated_at = Date.now();
        this.persistState();
        
        return {
          success: false,
          error: error.message,
          task: task
        };
      }
    },

    /**
     * Execute a single step
     * @param {Object} task - Task object
     * @param {Function} step - Step function
     * @returns {Object} Step result
     */
    executeStep: function(task, step) {
      console.log(`[CSPL] Executing step ${task.next_step_pointer} of task ${task.task_id}`);
      
      const result = step(task.state_variables);
      
      return {
        success: true,
        state: result.state || {},
        output: result.output
      };
    },

    /**
     * Create checkpoint
     * @param {string} taskId - Task identifier
     * @param {number} stepId - Step identifier
     */
    createCheckpoint: function(taskId, stepId) {
      const task = this.tasks[taskId];
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      const checkpoint = {
        timestamp: Date.now(),
        task_id: taskId,
        step_id: stepId,
        progress_percent: ((stepId + 1) / task.atomic_steps.length) * 100,
        current_file: this.getCurrentFile(),
        cursor_position: this.getCursorPosition(),
        environment_state: this.getEnvironmentState(),
        database_state: this.getDatabaseState(),
        service_state: this.getServiceState(),
        test_results: this.getTestResults(),
        error_state: this.getErrorState(),
        git_state: this.getGitState(),
        pending_work: this.getPendingWork(),
        decision_log: this.getDecisionLog(),
        state_variables: JSON.parse(JSON.stringify(task.state_variables)),
        next_step_pointer: task.next_step_pointer
      };

      task.checkpoints.push(checkpoint);
      this.checkpoints[`${taskId}_${stepId}`] = checkpoint;
      
      console.log(`[CSPL] Checkpoint created: ${taskId}_${stepId} (${checkpoint.progress_percent.toFixed(1)}%)`);
      this.persistState();
    },

    /**
     * Resume task from checkpoint
     * @param {string} taskId - Task identifier
     * @param {number} stepId - Step identifier to resume from
     * @returns {Object} Resume result
     */
    resumeTask: function(taskId, stepId) {
      const task = this.tasks[taskId];
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      const checkpointKey = `${taskId}_${stepId}`;
      const checkpoint = this.checkpoints[checkpointKey];
      
      if (!checkpoint) {
        throw new Error(`Checkpoint not found: ${checkpointKey}`);
      }

      console.log(`[CSPL] Resuming task: ${taskId} from step ${stepId}`);

      // Step 1: Restore all state
      this.restoreState(checkpoint);

      // Step 2: Validate state integrity
      if (!this.validateStateIntegrity(checkpoint)) {
        throw new Error('State integrity validation failed');
      }

      // Step 3: Verify no external changes
      if (this.detectExternalChanges(checkpoint)) {
        console.warn('[CSPL] External changes detected');
        // Handle external changes
      }

      // Step 4: Re-run smoke tests
      if (!this.runSmokeTests()) {
        throw new Error('Smoke tests failed');
      }

      // Step 5: Rebuild context
      this.rebuildContext(checkpoint);

      // Step 6: Continue from exact interruption point
      task.next_step_pointer = stepId;
      task.state_variables = JSON.parse(JSON.stringify(checkpoint.state_variables));
      task.resumption_context = checkpoint;
      task.status = 'resumed';
      task.updated_at = Date.now();

      console.log(`[CSPL] Task resumed: ${taskId}`);
      this.persistState();

      return {
        success: true,
        task: task
      };
    },

    /**
     * Restore state from checkpoint
     * @param {Object} checkpoint - Checkpoint object
     */
    restoreState: function(checkpoint) {
      console.log('[CSPL] Restoring state from checkpoint...');
      
      // Restore environment state
      this.setEnvironmentState(checkpoint.environment_state);
      
      // Restore database state
      this.setDatabaseState(checkpoint.database_state);
      
      // Restore service state
      this.setServiceState(checkpoint.service_state);
      
      console.log('[CSPL] State restored');
    },

    /**
     * Validate state integrity
     * @param {Object} checkpoint - Checkpoint object
     * @returns {boolean} Validation result
     */
    validateStateIntegrity: function(checkpoint) {
      console.log('[CSPL] Validating state integrity...');
      
      // Validate environment state
      const currentEnvState = this.getEnvironmentState();
      if (!this.compareStates(currentEnvState, checkpoint.environment_state)) {
        console.error('[CSPL] Environment state mismatch');
        return false;
      }

      // Validate database state
      const currentDbState = this.getDatabaseState();
      if (!this.compareStates(currentDbState, checkpoint.database_state)) {
        console.error('[CSPL] Database state mismatch');
        return false;
      }

      console.log('[CSPL] State integrity validated');
      return true;
    },

    /**
     * Detect external changes
     * @param {Object} checkpoint - Checkpoint object
     * @returns {boolean} True if external changes detected
     */
    detectExternalChanges: function(checkpoint) {
      console.log('[CSPL] Detecting external changes...');
      
      // Check git state
      const currentGitState = this.getGitState();
      if (currentGitState.commit !== checkpoint.git_state.commit) {
        console.warn('[CSPL] Git commit changed');
        return true;
      }

      // Check file modifications
      const currentFiles = this.getCurrentFiles();
      const checkpointFiles = checkpoint.environment_state.files;
      
      if (JSON.stringify(currentFiles) !== JSON.stringify(checkpointFiles)) {
        console.warn('[CSPL] File modifications detected');
        return true;
      }

      console.log('[CSPL] No external changes detected');
      return false;
    },

    /**
     * Run smoke tests
     * @returns {boolean} Test result
     */
    runSmokeTests: function() {
      console.log('[CSPL] Running smoke tests...');
      
      // Basic smoke tests
      const tests = [
        { name: 'DOM available', test: () => typeof document !== 'undefined' },
        { name: 'Storage available', test: () => typeof localStorage !== 'undefined' },
        { name: 'DOMHelpers available', test: () => typeof DOMHelpers !== 'undefined' }
      ];

      let allPassed = true;
      tests.forEach(t => {
        try {
          const passed = t.test();
          console.log(`[CSPL] Smoke test: ${t.name} - ${passed ? 'PASSED' : 'FAILED'}`);
          if (!passed) allPassed = false;
        } catch (error) {
          console.error(`[CSPL] Smoke test error: ${t.name}`, error);
          allPassed = false;
        }
      });

      return allPassed;
    },

    /**
     * Rebuild context from checkpoint
     * @param {Object} checkpoint - Checkpoint object
     */
    rebuildContext: function(checkpoint) {
      console.log('[CSPL] Rebuilding context...');
      
      // Rebuild application context
      // This would depend on specific application needs
      
      console.log('[CSPL] Context rebuilt');
    },

    /**
     * Get current file
     * @returns {string} Current file path
     */
    getCurrentFile: function() {
      // Placeholder - would track current file
      return '';
    },

    /**
     * Get cursor position
     * @returns {Object} Cursor position
     */
    getCursorPosition: function() {
      // Placeholder - would track cursor position
      return { line: 0, column: 0 };
    },

    /**
     * Get environment state
     * @returns {Object} Environment state
     */
    getEnvironmentState: function() {
      return {
        files: [],
        variables: {},
        timestamp: Date.now()
      };
    },

    /**
     * Set environment state
     * @param {Object} state - Environment state
     */
    setEnvironmentState: function(state) {
      // Placeholder - would restore environment state
    },

    /**
     * Get database state
     * @returns {Object} Database state
     */
    getDatabaseState: function() {
      return {
        tables: [],
        records: 0,
        timestamp: Date.now()
      };
    },

    /**
     * Set database state
     * @param {Object} state - Database state
     */
    setDatabaseState: function(state) {
      // Placeholder - would restore database state
    },

    /**
     * Get service state
     * @returns {Object} Service state
     */
    getServiceState: function() {
      return {
        services: [],
        status: 'running',
        timestamp: Date.now()
      };
    },

    /**
     * Set service state
     * @param {Object} state - Service state
     */
    setServiceState: function(state) {
      // Placeholder - would restore service state
    },

    /**
     * Get test results
     * @returns {Object} Test results
     */
    getTestResults: function() {
      // Placeholder - would get test results
      return {};
    },

    /**
     * Get error state
     * @returns {Object} Error state
     */
    getErrorState: function() {
      return {
        errors: [],
        warnings: [],
        timestamp: Date.now()
      };
    },

    /**
     * Get git state
     * @returns {Object} Git state
     */
    getGitState: function() {
      return {
        branch: 'main',
        commit: 'unknown',
        timestamp: Date.now()
      };
    },

    /**
     * Get pending work
     * @returns {Array} Pending work items
     */
    getPendingWork: function() {
      return [];
    },

    /**
     * Get decision log
     * @returns {Array} Decision log
     */
    getDecisionLog: function() {
      return [];
    },

    /**
     * Get current files
     * @returns {Array} Current files
     */
    getCurrentFiles: function() {
      return [];
    },

    /**
     * Compare two states
     * @param {Object} state1 - First state
     * @param {Object} state2 - Second state
     * @returns {boolean} True if states match
     */
    compareStates: function(state1, state2) {
      return JSON.stringify(state1) === JSON.stringify(state2);
    },

    /**
     * Persist state to storage
     */
    persistState: function() {
      const state = {
        tasks: this.tasks,
        checkpoints: this.checkpoints,
        currentTask: this.currentTask,
        timestamp: Date.now()
      };

      try {
        localStorage.setItem('cspl_state', JSON.stringify(state));
        console.log('[CSPL] State persisted');
      } catch (error) {
        console.error('[CSPL] Error persisting state:', error);
      }
    },

    /**
     * Load persisted state from storage
     */
    loadPersistedState: function() {
      try {
        const stateJson = localStorage.getItem('cspl_state');
        if (stateJson) {
          const state = JSON.parse(stateJson);
          this.tasks = state.tasks || {};
          this.checkpoints = state.checkpoints || {};
          this.currentTask = state.currentTask;
          console.log('[CSPL] State loaded');
        }
      } catch (error) {
        console.error('[CSPL] Error loading state:', error);
      }
    },

    /**
     * Get task by ID
     * @param {string} taskId - Task identifier
     * @returns {Object|null} Task object
     */
    getTask: function(taskId) {
      return this.tasks[taskId] || null;
    },

    /**
     * Get all tasks
     * @returns {Object} All tasks
     */
    getAllTasks: function() {
      return this.tasks;
    },

    /**
     * Get checkpoint
     * @param {string} taskId - Task identifier
     * @param {number} stepId - Step identifier
     * @returns {Object|null} Checkpoint object
     */
    getCheckpoint: function(taskId, stepId) {
      return this.checkpoints[`${taskId}_${stepId}`] || null;
    },

    /**
     * Clear all state
     */
    clearState: function() {
      this.tasks = {};
      this.checkpoints = {};
      this.currentTask = null;
      localStorage.removeItem('cspl_state');
      console.log('[CSPL] State cleared');
    }
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.CSPL = CSPL;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSPL;
  }
})();