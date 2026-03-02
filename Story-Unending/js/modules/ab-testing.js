/**
 * A/B Testing Framework
 * 
 * Provides comprehensive A/B testing capabilities including:
 * - Experiment management and tracking
 * - Variant assignment with consistent hashing
 * - Analytics integration
 * - Statistical significance calculation
 * - Experiment lifecycle management
 * 
 * @namespace ABTesting
 */

(function(window) {
  'use strict';

  // ============================================================================
  // EXPERIMENT STORAGE
  // ============================================================================

  const STORAGE_KEY = 'ab_experiments';
  const USER_ID_KEY = 'ab_user_id';

  /**
   * Get or create user ID for consistent assignment
   * @returns {string} User ID
   */
  const getUserId = () => {
    let userId = Storage.getItem(USER_ID_KEY);
    if (!userId) {
      userId = generateUserId();
      Storage.setItem(USER_ID_KEY, userId);
    }
    return userId;
  }

  /**
   * Generate a unique user ID
   * @returns {string} User ID
   */
  const generateUserId = () => {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get all experiments from storage
   * @returns {Object} Experiments object
   */
  const getExperiments = () => {
    try {
      const data = Storage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      // Error handled silently: console.error('Error loading experiments:', error);
      return {};
    }
  }

  /**
   * Save experiments to storage
   * @param {Object} experiments - Experiments object
   */
  const saveExperiments = (experiments) => {
    try {
      Storage.setItem(STORAGE_KEY, experiments);
    } catch (error) {
      // Error handled silently: console.error('Error saving experiments:', error);
    }
  }

  // ============================================================================
  // VARIANT ASSIGNMENT
  // ============================================================================

  /**
   * Assign variant to user using consistent hashing
   * @param {string} experimentId - Experiment ID
   * @param {Array} variants - Array of variant objects
   * @returns {string} Assigned variant ID
   */
  const assignVariant = (experimentId, variants) => {
    const userId = getUserId();
    const hash = consistentHash(experimentId + userId);
    
    // Calculate variant based on hash and weights
    let cumulativeWeight = 0;
    const totalWeight = variants.reduce((sum, v) => sum + (v.weight || 1), 0);
    const normalizedHash = (hash % totalWeight) / totalWeight;
    
    for (const variant of variants) {
      cumulativeWeight += (variant.weight || 1);
      if (normalizedHash <= cumulativeWeight / totalWeight) {
        return variant.id;
      }
    }
    
    // Fallback to first variant
    return variants[0].id;
  }

  /**
   * Consistent hash function for deterministic assignment
   * @param {string} str - String to hash
   * @returns {number} Hash value
   */
  const consistentHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  // ============================================================================
  // EXPERIMENT MANAGEMENT
  // ============================================================================

  /**
   * Create a new experiment
   * @param {Object} config - Experiment configuration
   * @returns {Object} Experiment object
   */
  const createExperiment = (config) => {
    const experiment = {
      id: config.id,
      name: config.name,
      description: config.description || '',
      variants: config.variants || [{ id: 'control', weight: 1 }],
      startDate: config.startDate || new Date().toISOString(),
      endDate: config.endDate || null,
      status: config.status || 'active',
      targetAudience: config.targetAudience || 'all',
      minSampleSize: config.minSampleSize || 100,
      confidenceLevel: config.confidenceLevel || 0.95,
      metrics: config.metrics || ['conversion'],
      createdAt: new Date().toISOString()
    };

    const experiments = getExperiments();
    experiments[experiment.id] = experiment;
    saveExperiments(experiments);

    return experiment;
  }

  /**
   * Get experiment by ID
   * @param {string} experimentId - Experiment ID
   * @returns {Object|null} Experiment object
   */
  const getExperiment = (experimentId) => {
    const experiments = getExperiments();
    return experiments[experimentId] || null;
  }

  /**
   * Get all experiments
   * @returns {Array} Array of experiment objects
   */
  const getAllExperiments = () => {
    const experiments = getExperiments();
    return Object.values(experiments);
  }

  /**
   * Update experiment
   * @param {string} experimentId - Experiment ID
   * @param {Object} updates - Updates to apply
   * @returns {Object|null} Updated experiment
   */
  const updateExperiment = (experimentId, updates) => {
    const experiments = getExperiments();
    const experiment = experiments[experimentId];
    
    if (!experiment) {
      return null;
    }

    Object.assign(experiment, updates);
    saveExperiments(experiments);

    return experiment;
  }

  /**
   * Delete experiment
   * @param {string} experimentId - Experiment ID
   * @returns {boolean} Success status
   */
  const deleteExperiment = (experimentId) => {
    const experiments = getExperiments();
    
    if (!experiments[experimentId]) {
      return false;
    }

    delete experiments[experimentId];
    saveExperiments(experiments);

    return true;
  }

  /**
   * Activate experiment
   * @param {string} experimentId - Experiment ID
   * @returns {Object|null} Activated experiment
   */
  const activateExperiment = (experimentId) => {
    return updateExperiment(experimentId, {
      status: 'active',
      startDate: new Date().toISOString()
    });
  }

  /**
   * Pause experiment
   * @param {string} experimentId - Experiment ID
   * @returns {Object|null} Paused experiment
   */
  const pauseExperiment = (experimentId) => {
    return updateExperiment(experimentId, {
      status: 'paused'
    });
  }

  /**
   * Complete experiment
   * @param {string} experimentId - Experiment ID
   * @returns {Object|null} Completed experiment
   */
  const completeExperiment = (experimentId) => {
    return updateExperiment(experimentId, {
      status: 'completed',
      endDate: new Date().toISOString()
    });
  }

  // ============================================================================
  // VARIANT TRACKING
  // ============================================================================

  /**
   * Get assigned variant for user
   * @param {string} experimentId - Experiment ID
   * @returns {string|null} Variant ID
   */
  const getVariant = (experimentId) => {
    const experiment = getExperiment(experimentId);
    
    if (!experiment || experiment.status !== 'active') {
      return null;
    }

    // Check if user already has assigned variant
    const userId = getUserId();
    const experiments = getExperiments();
    const userAssignments = experiments._userAssignments || {};
    
    if (userAssignments[userId] && userAssignments[userId][experimentId]) {
      return userAssignments[userId][experimentId];
    }

    // Assign new variant
    const variantId = assignVariant(experimentId, experiment.variants);
    
    // Store assignment
    if (!userAssignments[userId]) {
      userAssignments[userId] = {};
    }
    userAssignments[userId][experimentId] = variantId;
    experiments._userAssignments = userAssignments;
    saveExperiments(experiments);

    // Track assignment
    trackEvent(experimentId, variantId, 'assigned');

    return variantId;
  }

  /**
   * Check if user is in specific variant
   * @param {string} experimentId - Experiment ID
   * @param {string} variantId - Variant ID
   * @returns {boolean} Whether user is in variant
   */
  const isVariant = (experimentId, variantId) => {
    const assignedVariant = getVariant(experimentId);
    return assignedVariant === variantId;
  }

  /**
   * Get all variants for user
   * @returns {Object} Map of experiment ID to variant ID
   */
  const getAllVariants = () => {
    const userId = getUserId();
    const experiments = getExperiments();
    const userAssignments = experiments._userAssignments || {};
    const assignments = userAssignments[userId] || {};

    const variants = {};
    for (const [experimentId, experiment] of Object.entries(experiments)) {
      if (experiment.status === 'active') {
        variants[experimentId] = getVariant(experimentId);
      }
    }

    return variants;
  }

  // ============================================================================
  // EVENT TRACKING
  // ============================================================================

  /**
   * Track event for experiment
   * @param {string} experimentId - Experiment ID
   * @param {string} variantId - Variant ID
   * @param {string} eventType - Event type
   * @param {Object} metadata - Additional metadata
   */
  const trackEvent = (experimentId, variantId, eventType, metadata = {}) => {
    const experiments = getExperiments();
    const experiment = experiments[experimentId];
    
    if (!experiment) {
      return;
    }

    // Initialize tracking data
    if (!experiment.tracking) {
      experiment.tracking = {};
    }

    if (!experiment.tracking[variantId]) {
      experiment.tracking[variantId] = {
        users: new Set(),
        events: {},
        metrics: {}
      };
    }

    const variantTracking = experiment.tracking[variantId];

    // Track user
    const userId = getUserId();
    variantTracking.users.add(userId);

    // Track event
    if (!variantTracking.events[eventType]) {
      variantTracking.events[eventType] = {
        count: 0,
        users: new Set()
      };
    }

    variantTracking.events[eventType].count++;
    variantTracking.events[eventType].users.add(userId);

    // Track metrics
    if (metadata.metric) {
      if (!variantTracking.metrics[metadata.metric]) {
        variantTracking.metrics[metadata.metric] = {
          total: 0,
          count: 0
        };
      }

      variantTracking.metrics[metadata.metric].total += (metadata.value || 1);
      variantTracking.metrics[metadata.metric].count++;
    }

    // Convert Sets to Arrays for storage
    experiment.tracking[variantId].users = Array.from(variantTracking.users);
    for (const eventType in variantTracking.events) {
      variantTracking.events[eventType].users = Array.from(variantTracking.events[eventType].users);
    }

    saveExperiments(experiments);

    // Send to analytics if available
    if (window.Analytics) {
      window.Analytics.trackEvent('ab_test_event', {
        experimentId,
        variantId,
        eventType,
        ...metadata
      });
    }
  }

  /**
   * Track conversion event
   * @param {string} experimentId - Experiment ID
   * @param {string} variantId - Variant ID
   * @param {Object} metadata - Additional metadata
   */
  const trackConversion = (experimentId, variantId, metadata = {}) => {
    trackEvent(experimentId, variantId, 'conversion', {
      metric: 'conversion',
      value: 1,
      ...metadata
    });
  }

  /**
   * Track custom metric
   * @param {string} experimentId - Experiment ID
   * @param {string} variantId - Variant ID
   * @param {string} metricName - Metric name
   * @param {number} value - Metric value
   */
  const trackMetric = (experimentId, variantId, metricName, value) => {
    trackEvent(experimentId, variantId, 'metric', {
      metric: metricName,
      value: value
    });
  }

  // ============================================================================
  // ANALYTICS & STATISTICS
  // ============================================================================

  /**
   * Get experiment results
   * @param {string} experimentId - Experiment ID
   * @returns {Object} Experiment results
   */
  const getResults = (experimentId) => {
    const experiment = getExperiment(experimentId);
    
    if (!experiment || !experiment.tracking) {
      return null;
    }

    const results = {
      experimentId: experiment.id,
      name: experiment.name,
      status: experiment.status,
      startDate: experiment.startDate,
      endDate: experiment.endDate,
      variants: [],
      totalUsers: 0,
      totalConversions: 0
    };

    for (const [variantId, tracking] of Object.entries(experiment.tracking)) {
      const variant = experiment.variants.find(v => v.id === variantId);
      const users = tracking.users.length;
      const conversions = tracking.events.conversion ? tracking.events.conversion.count : 0;
      const conversionRate = users > 0 ? (conversions / users) * 100 : 0;

      results.variants.push({
        id: variantId,
        name: variant ? variant.name : variantId,
        users: users,
        conversions: conversions,
        conversionRate: conversionRate.toFixed(2),
        events: tracking.events,
        metrics: tracking.metrics
      });

      results.totalUsers += users;
      results.totalConversions += conversions;
    }

    // Calculate statistical significance
    if (results.variants.length >= 2) {
      results.significance = calculateSignificance(results.variants);
    }

    return results;
  }

  /**
   * Calculate statistical significance between variants
   * @param {Array} variants - Variant results
   * @returns {Object} Significance results
   */
  const calculateSignificance = (variants) => {
    if (variants.length < 2) {
      return null;
    }

    const control = variants[0];
    const treatment = variants[1];

    const p1 = control.conversionRate / 100;
    const p2 = treatment.conversionRate / 100;
    const n1 = control.users;
    const n2 = treatment.users;

    // Pooled proportion
    const p = (control.conversions + treatment.conversions) / (n1 + n2);

    // Standard error
    const se = Math.sqrt(p * (1 - p) * (1/n1 + 1/n2));

    // Z-score
    const z = (p2 - p1) / se;

    // P-value (two-tailed)
    const pValue = 2 * (1 - normalCDF(Math.abs(z)));

    // Confidence interval
    const ci = 1.96 * se;

    return {
      zScore: z.toFixed(4),
      pValue: pValue.toFixed(4),
      isSignificant: pValue < 0.05,
      confidenceInterval: {
        lower: ((p2 - p1) - ci).toFixed(4),
        upper: ((p2 - p1) + ci).toFixed(4)
      },
      uplift: ((p2 - p1) / p1 * 100).toFixed(2)
    };
  }

  /**
   * Normal cumulative distribution function
   * @param {number} x - Value
   * @returns {number} CDF value
   */
  const normalCDF = (x) => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  }

  /**
   * Check if experiment has reached statistical significance
   * @param {string} experimentId - Experiment ID
   * @returns {boolean} Whether significant
   */
  const isSignificant = (experimentId) => {
    const results = getResults(experimentId);
    return results && results.significance && results.significance.isSignificant;
  }

  /**
   * Check if experiment has enough sample size
   * @param {string} experimentId - Experiment ID
   * @returns {boolean} Whether enough samples
   */
  const hasEnoughSamples = (experimentId) => {
    const experiment = getExperiment(experimentId);
    if (!experiment) return false;

    const results = getResults(experimentId);
    if (!results) return false;

    return results.totalUsers >= experiment.minSampleSize;
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Reset user's experiment assignments
   */
  const resetUserAssignments = () => {
    const experiments = getExperiments();
    experiments._userAssignments = {};
    saveExperiments(experiments);
  }

  /**
   * Get experiment statistics
   * @returns {Object} Statistics
   */
  const getStatistics = () => {
    const experiments = getAllExperiments();
    
    return {
      total: experiments.length,
      active: experiments.filter(e => e.status === 'active').length,
      paused: experiments.filter(e => e.status === 'paused').length,
      completed: experiments.filter(e => e.status === 'completed').length,
      significant: experiments.filter(e => isSignificant(e.id)).length
    };
  }

  /**
   * Export experiment data
   * @param {string} experimentId - Experiment ID
   * @returns {Object} Export data
   */
  const exportExperiment = (experimentId) => {
    const experiment = getExperiment(experimentId);
    const results = getResults(experimentId);

    return {
      experiment: experiment,
      results: results,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import experiment data
   * @param {Object} data - Import data
   * @returns {boolean} Success status
   */
  const importExperiment = (data) => {
    try {
      if (!data.experiment) {
        return false;
      }

      const experiments = getExperiments();
      experiments[data.experiment.id] = data.experiment;
      saveExperiments(experiments);

      return true;
    } catch (error) {
      // Error handled silently: console.error('Error importing experiment:', error);
      return false;
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize A/B testing framework
   */
  const init = () => {
    // Ensure user ID exists
    getUserId();
    
    // A/B Testing Framework initialized
  }

  // Export to global scope
  window.ABTesting = {
    // User Management
    getUserId,
    generateUserId,
    
    // Experiment Management
    createExperiment,
    getExperiment,
    getAllExperiments,
    updateExperiment,
    deleteExperiment,
    activateExperiment,
    pauseExperiment,
    completeExperiment,
    
    // Variant Assignment
    getVariant,
    isVariant,
    getAllVariants,
    
    // Event Tracking
    trackEvent,
    trackConversion,
    trackMetric,
    
    // Analytics
    getResults,
    isSignificant,
    hasEnoughSamples,
    getStatistics,
    
    // Utilities
    resetUserAssignments,
    exportExperiment,
    importExperiment,
    
    // Initialization
    init
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window);