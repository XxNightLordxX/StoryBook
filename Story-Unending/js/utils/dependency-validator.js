/**
 * Dependency Validator Module
 * Ensures all required modules are loaded before they're used
 */
const DependencyValidator = (function() {
    'use strict';
    
    // Track loaded dependencies
    const loadedDependencies = new Set();
    
    // Define required dependencies for each module
    const dependencyMap = {
        'auth': ['Storage', 'RateLimiter', 'Notifications', 'Modals'],
        'admin': ['Storage', 'Notifications', 'Modals'],
        'misc': ['Storage', 'Notifications', 'Modals', 'StoryEngine'],
        'content-management': ['Storage', 'Notifications'],
        'notifications': ['Storage'],
        'modals': [],
        'story-engine': [],
        'app-state': ['Storage']
    };
    
    /**
     * Register a dependency as loaded
     * @param {string} dependencyName - Name of the dependency
     */
    const registerDependency = (dependencyName) => {
        loadedDependencies.add(dependencyName);
    };
    
    /**
     * Check if a dependency is loaded
     * @param {string} dependencyName - Name of the dependency
     * @returns {boolean}
     */
    const isDependencyLoaded = (dependencyName) => {
        return loadedDependencies.has(dependencyName);
    };
    
    /**
     * Validate that all required dependencies for a module are loaded
     * @param {string} moduleName - Name of the module
     * @returns {Object} - { valid: boolean, missing: string[] }
     */
    const validateDependencies = (moduleName) => {
        const required = dependencyMap[moduleName] || [];
        const missing = required.filter(dep => !loadedDependencies.has(dep));
        
        return {
            valid: missing.length === 0,
            missing: missing
        };
    };
    
    /**
     * Get all loaded dependencies
     * @returns {string[]}
     */
    const getLoadedDependencies = () => {
        return Array.from(loadedDependencies);
    };
    
    /**
     * Get all required dependencies for a module
     * @param {string} moduleName - Name of the module
     * @returns {string[]}
     */
    const getRequiredDependencies = (moduleName) => {
        return dependencyMap[moduleName] || [];
    };
    
    /**
     * Log dependency status for debugging
     * @param {string} moduleName - Name of the module to check
     */
    const logDependencyStatus = (moduleName) => {
        const validation = validateDependencies(moduleName);
        const required = getRequiredDependencies(moduleName);
        
    };
    
    /**
     * Auto-register global dependencies when they become available
     */
    const autoRegisterGlobalDependencies = () => {
        const globalDeps = ['Storage', 'RateLimiter', 'Notifications', 'Modals', 'StoryEngine', 'ADMIN_USER', 'StoryEngine'];
        
        globalDeps.forEach(dep => {
            if (typeof window[dep] !== 'undefined') {
                registerDependency(dep);
            }
        });
    };
    
    // Auto-register dependencies on load
    window.addEventListener('DOMContentLoaded', autoRegisterGlobalDependencies);
    
    // Also check periodically for late-loading dependencies
    setInterval(autoRegisterGlobalDependencies, 1000);
    
    // Public API
    return {
        registerDependency,
        isDependencyLoaded,
        validateDependencies,
        getLoadedDependencies,
        getRequiredDependencies,
        logDependencyStatus
    };
})();

// Export to global scope
window.DependencyValidator = DependencyValidator;