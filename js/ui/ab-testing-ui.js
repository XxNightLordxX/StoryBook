/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * A/B Testing UI Component
 * 
 * Provides user interface for:
 * - Creating and managing experiments
 * - Viewing experiment results
 * - Analyzing statistical significance
 * - Managing experiment lifecycle
 * 
 * @namespace ABTestingUI
 */

(function(window) {
  'use strict';

  // ============================================================================
  // MODAL MANAGEMENT
  // ============================================================================

  let modalElement = null;
  let currentTab = 'experiments';

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Open A/B testing modal
   */
  const openModal = () => {
    if (!modalElement) {
      createModal();
    }
    modalElement.style.display = 'flex';
    loadExperiments();
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Close A/B testing modal
   */
  const closeModal = () => {
    if (modalElement) {
      modalElement.style.display = 'none';
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Create modal element
   */
  const createModal = () => {
    modalElement = document.createElement('div');
    modalElement.className = 'ab-testing-modal';
    modalElement.innerHTML = `
      <div class="ab-testing-modal-content">
        <div class="ab-testing-modal-header">
          <h2>A/B Testing Dashboard</h2>
          <button class="ab-testing-close-btn" onclick="ABTestingUI.closeModal()">&times;</button>
        </div>
        
        <div class="ab-testing-tabs">
          <button class="ab-testing-tab active" data-tab="experiments" onclick="ABTestingUI.switchTab('experiments')">
            Experiments
          </button>
          <button class="ab-testing-tab" data-tab="create" onclick="ABTestingUI.switchTab('create')">
            Create Experiment
          </button>
          <button class="ab-testing-tab" data-tab="results" onclick="ABTestingUI.switchTab('results')">
            Results
          </button>
          <button class="ab-testing-tab" data-tab="statistics" onclick="ABTestingUI.switchTab('statistics')">
            Statistics
          </button>
        </div>
        
        <div class="ab-testing-tab-content" id="ab-testing-experiments">
          <div class="ab-testing-toolbar">
            <button class="ab-testing-btn ab-testing-btn-primary" onclick="ABTestingUI.switchTab('create')">
              + New Experiment
            </button>
            <select class="ab-testing-filter" id="ab-testing-status-filter" onchange="ABTestingUI.filterExperiments()">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div class="ab-testing-experiments-list" id="ab-testing-experiments-list">
            <!-- Experiments will be loaded here -->
          </div>
        </div>
        
        <div class="ab-testing-tab-content" id="ab-testing-create" style="display: none;">
          <form id="ab-testing-create-form" onsubmit="ABTestingUI.createExperiment(event)">
            <div class="ab-testing-form-group">
              <label for="experiment-id">Experiment ID *</label>
              <input type="text" id="experiment-id" required placeholder="e.g., homepage_hero_test">
            </div>
            
            <div class="ab-testing-form-group">
              <label for="experiment-name">Experiment Name *</label>
              <input type="text" id="experiment-name" required placeholder="e.g., Homepage Hero Test">
            </div>
            
            <div class="ab-testing-form-group">
              <label for="experiment-description">Description</label>
              <textarea id="experiment-description" rows="3" placeholder="Describe the experiment..."></textarea>
            </div>
            
            <div class="ab-testing-form-group">
              <label>Variants *</label>
              <div id="ab-testing-variants-container">
                <div class="ab-testing-variant-row">
                  <input type="text" placeholder="Variant ID (e.g., control)" required class="variant-id">
                  <input type="text" placeholder="Variant Name (e.g., Control)" required class="variant-name">
                  <input type="number" placeholder="Weight" value="1" min="1" class="variant-weight">
                  <button type="button" class="ab-testing-btn ab-testing-btn-danger" onclick="ABTestingUI.removeVariant(this)">
                    Remove
                  </button>
                </div>
              </div>
              <button type="button" class="ab-testing-btn ab-testing-btn-secondary" onclick="ABTestingUI.addVariant()">
                + Add Variant
              </button>
            </div>
            
            <div class="ab-testing-form-group">
              <label for="min-sample-size">Minimum Sample Size</label>
              <input type="number" id="min-sample-size" value="100" min="10">
            </div>
            
            <div class="ab-testing-form-group">
              <label for="confidence-level">Confidence Level</label>
              <select id="confidence-level">
                <option value="0.90">90%</option>
                <option value="0.95" selected>95%</option>
                <option value="0.99">99%</option>
              </select>
            </div>
            
            <div class="ab-testing-form-actions">
              <button type="submit" class="ab-testing-btn ab-testing-btn-primary">Create Experiment</button>
              <button type="button" class="ab-testing-btn ab-testing-btn-secondary" onclick="ABTestingUI.switchTab('experiments')">
                Cancel
              </button>
            </div>
          </form>
        </div>
        
        <div class="ab-testing-tab-content" id="ab-testing-results" style="display: none;">
          <div class="ab-testing-toolbar">
            <select class="ab-testing-filter" id="ab-testing-results-filter" onchange="ABTestingUI.loadResults()">
              <option value="">Select Experiment</option>
            </select>
          </div>
          <div class="ab-testing-results-container" id="ab-testing-results-container">
            <!-- Results will be loaded here -->
          </div>
        </div>
        
        <div class="ab-testing-tab-content" id="ab-testing-statistics" style="display: none;">
          <div class="ab-testing-statistics-grid" id="ab-testing-statistics-grid">
            <!-- Statistics will be loaded here -->
          </div>
        </div>
      </div>
    </div>
    `;

    document.body.appendChild(modalElement);
  }

  // ============================================================================
  // TAB MANAGEMENT
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Switch to a different tab
   * @param {string} tabName - Tab name
   */
  const switchTab = (tabName) => {
    currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.ab-testing-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      }
    });

    // Update tab content
    document.querySelectorAll('.ab-testing-tab-content').forEach(content => {
      content.style.display = 'none';
    });

    const activeContent = DOMHelpers.safeGetElement(`ab-testing-${tabName}`);
    if (activeContent) {
      activeContent.style.display = 'block';
    }

    // Load content based on tab
    if (tabName === 'experiments') {
      loadExperiments();
    } else if (tabName === 'results') {
      loadResultsFilter();
    } else if (tabName === 'statistics') {
      loadStatistics();
    }
  }

  // ============================================================================
  // EXPERIMENT MANAGEMENT
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Load experiments list
   */
  const loadExperiments = () => {
    const experiments = window.ABTesting.getAllExperiments();
    const container = DOMHelpers.safeGetElement('ab-testing-experiments-list');
    const statusFilter = DOMHelpers.safeGetElement('ab-testing-status-filter').value;

    let filteredExperiments = experiments;
    if (statusFilter !== 'all') {
      filteredExperiments = experiments.filter(e => e.status === statusFilter);
    }

    if (filteredExperiments.length === 0) {
      container.innerHTML = `
        <div class="ab-testing-empty-state">
          <p>No experiments found</p>
          <button class="ab-testing-btn ab-testing-btn-primary" onclick="ABTestingUI.switchTab('create')">
            Create First Experiment
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredExperiments.map(exp => `
      <div class="ab-testing-experiment-card" data-status="${exp.status}">
        <div class="ab-testing-experiment-header">
          <h3>${exp.name}</h3>
          <span class="ab-testing-status ab-testing-status-${exp.status}">${exp.status}</span>
        </div>
        <p class="ab-testing-experiment-description">${exp.description || 'No description'}</p>
        <div class="ab-testing-experiment-info">
          <span>ID: ${exp.id}</span>
          <span>Variants: ${exp.variants.length}</span>
          <span>Started: ${new Date(exp.startDate).toLocaleDateString()}</span>
        </div>
        <div class="ab-testing-experiment-actions">
          <button class="ab-testing-btn ab-testing-btn-small" onclick="ABTestingUI.viewResults('${exp.id}')">
            View Results
          </button>
          ${exp.status === 'active' ? `
            <button class="ab-testing-btn ab-testing-btn-small ab-testing-btn-warning" onclick="ABTestingUI.pauseExperiment('${exp.id}')">
              Pause
            </button>
          ` : ''}
          ${exp.status === 'paused' ? `
            <button class="ab-testing-btn ab-testing-btn-small ab-testing-btn-success" onclick="ABTestingUI.activateExperiment('${exp.id}')">
              Resume
            </button>
          ` : ''}
          ${exp.status !== 'completed' ? `
            <button class="ab-testing-btn ab-testing-btn-small ab-testing-btn-danger" onclick="ABTestingUI.completeExperiment('${exp.id}')">
              Complete
            </button>
          ` : ''}
          <button class="ab-testing-btn ab-testing-btn-small ab-testing-btn-danger" onclick="ABTestingUI.deleteExperiment('${exp.id}')">
            Delete
          </button>
        </div>
      </div>
    `).join('');
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Filter experiments by status
   */
  const filterExperiments = () => {
    loadExperiments();
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Create new experiment
   * @param {Event} event - Form submit event
   */
  const createExperiment = (event) => {
    event.preventDefault();

    const id = DOMHelpers.safeGetElement('experiment-id').value.trim();
    const name = DOMHelpers.safeGetElement('experiment-name').value.trim();
    const description = DOMHelpers.safeGetElement('experiment-description').value.trim();
    const minSampleSize = parseInt(DOMHelpers.safeGetElement('min-sample-size').value);
    const confidenceLevel = parseFloat(DOMHelpers.safeGetElement('confidence-level').value);

    // Collect variants
    const variantRows = document.querySelectorAll('.ab-testing-variant-row');
    const variants = [];
    
    variantRows.forEach(row => {
      const variantId = row.querySelector('.variant-id').value.trim();
      const variantName = row.querySelector('.variant-name').value.trim();
      const weight = parseInt(row.querySelector('.variant-weight').value);

      if (variantId && variantName) {
        variants.push({
          id: variantId,
          name: variantName,
          weight: weight
        });
      }
    });

    if (variants.length < 2) {
      showNotification('Please add at least 2 variants');
      return;
    }

    // Create experiment
    window.ABTesting.createExperiment({
      id,
      name,
      description,
      variants,
      minSampleSize,
      confidenceLevel
    });

    // Reset form and switch to experiments tab
    DOMHelpers.safeGetElement('ab-testing-create-form').reset();
    switchTab('experiments');

    // Show success notification
    if (window.UINotifications) {
      window.UINotifications.showNotification('Experiment created successfully', 'success');
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Activate experiment
   * @param {string} experimentId - Experiment ID
   */
  const activateExperiment = (experimentId) => {
    if (confirm('Are you sure you want to activate this experiment?')) {
      window.ABTesting.activateExperiment(experimentId);
      loadExperiments();
      
      if (window.UINotifications) {
        window.UINotifications.showNotification('Experiment activated', 'success');
      }
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Pause experiment
   * @param {string} experimentId - Experiment ID
   */
  const pauseExperiment = (experimentId) => {
    if (confirm('Are you sure you want to pause this experiment?')) {
      window.ABTesting.pauseExperiment(experimentId);
      loadExperiments();
      
      if (window.UINotifications) {
        window.UINotifications.showNotification('Experiment paused', 'warning');
      }
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Complete experiment
   * @param {string} experimentId - Experiment ID
   */
  const completeExperiment = (experimentId) => {
    if (confirm('Are you sure you want to complete this experiment? This cannot be undone.')) {
      window.ABTesting.completeExperiment(experimentId);
      loadExperiments();
      
      if (window.UINotifications) {
        window.UINotifications.showNotification('Experiment completed', 'success');
      }
    }
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Delete experiment
   * @param {string} experimentId - Experiment ID
   */
  const deleteExperiment = (experimentId) => {
    if (confirm('Are you sure you want to delete this experiment? This cannot be undone.')) {
      window.ABTesting.deleteExperiment(experimentId);
      loadExperiments();
      
      if (window.UINotifications) {
        window.UINotifications.showNotification('Experiment deleted', 'success');
      }
    }
  }

  // ============================================================================
  // VARIANT MANAGEMENT
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Add variant row to form
   */
  const addVariant = () => {
    const container = DOMHelpers.safeGetElement('ab-testing-variants-container');
    const variantRow = document.createElement('div');
    variantRow.className = 'ab-testing-variant-row';
    variantRow.innerHTML = `
      <input type="text" placeholder="Variant ID (e.g., variant_a)" required class="variant-id">
      <input type="text" placeholder="Variant Name (e.g., Variant A)" required class="variant-name">
      <input type="number" placeholder="Weight" value="1" min="1" class="variant-weight">
      <button type="button" class="ab-testing-btn ab-testing-btn-danger" onclick="ABTestingUI.removeVariant(this)">
        Remove
      </button>
    `;
    container.appendChild(variantRow);
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Remove variant row
   * @param {HTMLElement} button - Remove button
   */
  const removeVariant = (button) => {
    const container = DOMHelpers.safeGetElement('ab-testing-variants-container');
    if (container.children.length > 1) {
      button.parentElement.remove();
    } else {
      showNotification('You must have at least 2 variants');
    }
  }

  // ============================================================================
  // RESULTS & ANALYTICS
  // ============================================================================

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Load results filter dropdown
   */
  const loadResultsFilter = () => {
    const experiments = window.ABTesting.getAllExperiments();
    const filter = DOMHelpers.safeGetElement('ab-testing-results-filter');
    
    filter.textContent = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Select Experiment';
    filter.appendChild(defaultOpt);
    experiments.forEach(exp => {
      const opt = document.createElement('option');
      opt.value = exp.id;
      opt.textContent = `${exp.name} (${exp.status})`;
      filter.appendChild(opt);
    });
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Load experiment results
   */
  const loadResults = () => {
    const experimentId = DOMHelpers.safeGetElement('ab-testing-results-filter').value;
    const container = DOMHelpers.safeGetElement('ab-testing-results-container');

    if (!experimentId) {
      container.innerHTML = '<p class="ab-testing-empty-state">Select an experiment to view results</p>';
      return;
    }

    const results = window.ABTesting.getResults(experimentId);

    if (!results) {
      container.innerHTML = '<p class="ab-testing-empty-state">No results available for this experiment</p>';
      return;
    }

    container.innerHTML = `
      <div class="ab-testing-results-summary">
        <h3>${results.name}</h3>
        <div class="ab-testing-results-stats">
          <div class="ab-testing-stat">
            <span class="ab-testing-stat-label">Total Users</span>
            <span class="ab-testing-stat-value">${results.totalUsers}</span>
          </div>
          <div class="ab-testing-stat">
            <span class="ab-testing-stat-label">Total Conversions</span>
            <span class="ab-testing-stat-value">${results.totalConversions}</span>
          </div>
          <div class="ab-testing-stat">
            <span class="ab-testing-stat-label">Overall Rate</span>
            <span class="ab-testing-stat-value">${((results.totalConversions / results.totalUsers) * 100).toFixed(2)}%</span>
          </div>
        </div>
      </div>
      
      <div class="ab-testing-variants-results">
        ${results.variants.map(variant => `
          <div class="ab-testing-variant-result">
            <h4>${variant.name}</h4>
            <div class="ab-testing-variant-stats">
              <div class="ab-testing-variant-stat">
                <span>Users</span>
                <strong>${variant.users}</strong>
              </div>
              <div class="ab-testing-variant-stat">
                <span>Conversions</span>
                <strong>${variant.conversions}</strong>
              </div>
              <div class="ab-testing-variant-stat">
                <span>Conversion Rate</span>
                <strong class="${variant.conversionRate > 0 ? 'ab-testing-positive' : ''}">${variant.conversionRate}%</strong>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      ${results.significance ? `
        <div class="ab-testing-significance">
          <h4>Statistical Significance</h4>
          <div class="ab-testing-significance-results">
            <div class="ab-testing-significance-item">
              <span>Z-Score</span>
              <strong>${results.significance.zScore}</strong>
            </div>
            <div class="ab-testing-significance-item">
              <span>P-Value</span>
              <strong class="${results.significance.isSignificant ? 'ab-testing-significant' : ''}">${results.significance.pValue}</strong>
            </div>
            <div class="ab-testing-significance-item">
              <span>Significant</span>
              <strong class="${results.significance.isSignificant ? 'ab-testing-significant' : ''}">${results.significance.isSignificant ? 'Yes' : 'No'}</strong>
            </div>
            <div class="ab-testing-significance-item">
              <span>Uplift</span>
              <strong class="${parseFloat(results.significance.uplift) > 0 ? 'ab-testing-positive' : 'ab-testing-negative'}">${results.significance.uplift}%</strong>
            </div>
          </div>
          <div class="ab-testing-confidence-interval">
            <span>95% Confidence Interval:</span>
            <span>[${results.significance.confidenceInterval.lower}, ${results.significance.confidenceInterval.upper}]</span>
          </div>
        </div>
      ` : ''}
    `;
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * View results for specific experiment
   * @param {string} experimentId - Experiment ID
   */
  const viewResults = (experimentId) => {
    switchTab('results');
    DOMHelpers.safeGetElement('ab-testing-results-filter').value = experimentId;
    loadResults();
  }

  /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
   * Load statistics
   */
  const loadStatistics = () => {
    const stats = window.ABTesting.getStatistics();
    const container = DOMHelpers.safeGetElement('ab-testing-statistics-grid');

    container.innerHTML = `
      <div class="ab-testing-stat-card">
        <h3>Total Experiments</h3>
        <p class="ab-testing-stat-number">${stats.total}</p>
      </div>
      <div class="ab-testing-stat-card">
        <h3>Active</h3>
        <p class="ab-testing-stat-number ab-testing-stat-active">${stats.active}</p>
      </div>
      <div class="ab-testing-stat-card">
        <h3>Paused</h3>
        <p class="ab-testing-stat-number ab-testing-stat-paused">${stats.paused}</p>
      </div>
      <div class="ab-testing-stat-card">
        <h3>Completed</h3>
        <p class="ab-testing-stat-number ab-testing-stat-completed">${stats.completed}</p>
      </div>
      <div class="ab-testing-stat-card">
        <h3>Statistically Significant</h3>
        <p class="ab-testing-stat-number ab-testing-stat-significant">${stats.significant}</p>
      </div>
    `;
  }

  // Export to global scope
  window.ABTestingUI = {
    openModal,
    closeModal,
    switchTab,
    loadExperiments,
    filterExperiments,
    createExperiment,
    activateExperiment,
    pauseExperiment,
    completeExperiment,
    deleteExperiment,
    addVariant,
    removeVariant,
    loadResultsFilter,
    loadResults,
    viewResults,
    loadStatistics
  };

})(window);