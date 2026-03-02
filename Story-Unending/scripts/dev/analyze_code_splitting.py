#!/usr/bin/env python3
"""
Analyze JavaScript modules for code splitting opportunities.
Identify critical vs non-critical modules for lazy loading.
"""

import os
import re
from pathlib import Path

# Module categories
CRITICAL_MODULES = [
    # Core utilities - needed immediately
    'js/utils/security.js',
    'js/utils/storage.js',
    'js/utils/helpers.js',
    'js/utils/formatters.js',
    'js/utils/ui-helpers.js',
    
    # Core modules - needed for basic functionality
    'js/modules/app-state.js',
    'js/modules/auth.js',
    'js/modules/navigation.js',
    'js/modules/initialization.js',
    
    # Core UI - needed for basic interface
    'js/ui/dropdown.js',
    'js/ui/text-size.js',
    'js/ui/modals.js',
    'js/ui/notifications.js',
    
    # Story engines - needed for content
    'backstory-engine.js',
    'story-engine.js',
]

LAZY_LOAD_MODULES = {
    'admin': [
        'js/modules/admin.js',
        'js/ui/admin-ui.js',
    ],
    'analytics': [
        'js/modules/analytics.js',
        'js/ui/analytics-ui.js',
    ],
    'bookmarks': [
        'js/modules/bookmarks.js',
        'js/ui/bookmarks-ui.js',
    ],
    'search': [
        'js/modules/search.js',
        'js/ui/search-ui.js',
    ],
    'save-load': [
        'js/modules/save-load.js',
        'js/ui/save-load-ui.js',
    ],
    'reading-history': [
        'js/modules/reading-history.js',
        'js/ui/reading-history-ui.js',
    ],
    'performance': [
        'js/modules/performance.js',
        'js/ui/performance-ui.js',
    ],
    'content-management': [
        'js/modules/content-management.js',
        'js/ui/content-management-ui.js',
    ],
    'user-features': [
        'js/modules/user-profiles.js',
        'js/modules/user-preferences.js',
        'js/modules/achievements.js',
        'js/modules/social-features.js',
        'js/modules/messaging.js',
        'js/ui/user-features-ui.js',
    ],
    'notifications': [
        'js/modules/notifications.js',
        'js/ui/notifications-ui.js',
    ],
    'api': [
        'js/modules/api.js',
    ],
    'branching': [
        'js/modules/branching-narrative.js',
    ],
    'dynamic-content': [
        'js/modules/dynamic-content.js',
    ],
    'other': [
        'js/modules/generation.js',
        'js/modules/donation.js',
        'js/modules/directive.js',
        'js/modules/reset-password.js',
        'js/modules/misc.js',
        'js/ui/sidebar.js',
        'js/ui/stats.js',
    ],
}

def analyze_module_sizes():
    """Analyze sizes of all JavaScript modules."""
    print("=" * 80)
    print("CODE SPLITTING ANALYSIS")
    print("=" * 80)
    
    total_critical_size = 0
    total_lazy_size = 0
    
    print("\n📦 CRITICAL MODULES (Load Immediately)")
    print("-" * 80)
    for module in CRITICAL_MODULES:
        if os.path.exists(module):
            size = os.path.getsize(module)
            total_critical_size += size
            print(f"  ✓ {module:50s} {size:8,} bytes")
        else:
            print(f"  ✗ {module:50s} NOT FOUND")
    
    print(f"\n  Total Critical Size: {total_critical_size:,} bytes ({total_critical_size/1024:.1f} KB)")
    
    print("\n📦 LAZY LOAD MODULES (Load on Demand)")
    print("-" * 80)
    for category, modules in LAZY_LOAD_MODULES.items():
        category_size = 0
        print(f"\n  {category.upper()}:")
        for module in modules:
            if os.path.exists(module):
                size = os.path.getsize(module)
                category_size += size
                total_lazy_size += size
                print(f"    ✓ {module:50s} {size:8,} bytes")
            else:
                print(f"    ✗ {module:50s} NOT FOUND")
        print(f"    Category Total: {category_size:,} bytes ({category_size/1024:.1f} KB)")
    
    print(f"\n  Total Lazy Load Size: {total_lazy_size:,} bytes ({total_lazy_size/1024:.1f} KB)")
    
    print("\n📊 SUMMARY")
    print("-" * 80)
    total_size = total_critical_size + total_lazy_size
    print(f"  Total Size: {total_size:,} bytes ({total_size/1024:.1f} KB)")
    print(f"  Critical: {total_critical_size:,} bytes ({total_critical_size/total_size*100:.1f}%)")
    print(f"  Lazy Load: {total_lazy_size:,} bytes ({total_lazy_size/total_size*100:.1f}%)")
    print(f"  Initial Load Reduction: {total_lazy_size/1024:.1f} KB")
    print(f"  Performance Improvement: ~{total_lazy_size/total_size*100:.1f}% faster initial load")
    
    return {
        'critical_size': total_critical_size,
        'lazy_size': total_lazy_size,
        'total_size': total_size,
        'improvement': total_lazy_size/total_size*100
    }

def generate_lazy_loader():
    """Generate lazy loader module."""
    print("\n🔧 GENERATING LAZY LOADER MODULE")
    print("-" * 80)
    
    lazy_loader_code = '''/**
 * Lazy Loader Module
 * Dynamically loads non-critical modules on demand
 */
const LazyLoader = (function() {
    'use strict';
    
    // Cache for loaded modules
    const loadedModules = new Set();
    
    // Module definitions
    const modules = {
        admin: {
            files: ['js/modules/admin.js', 'js/ui/admin-ui.js'],
            css: ['css/admin.css']
        },
        analytics: {
            files: ['js/modules/analytics.js', 'js/ui/analytics-ui.js'],
            css: ['css/analytics.css']
        },
        bookmarks: {
            files: ['js/modules/bookmarks.js', 'js/ui/bookmarks-ui.js'],
            css: ['css/bookmarks.css']
        },
        search: {
            files: ['js/modules/search.js', 'js/ui/search-ui.js'],
            css: ['css/search.css']
        },
        'save-load': {
            files: ['js/modules/save-load.js', 'js/ui/save-load-ui.js'],
            css: ['css/save-load.css']
        },
        'reading-history': {
            files: ['js/modules/reading-history.js', 'js/ui/reading-history-ui.js'],
            css: ['css/reading-history.css']
        },
        performance: {
            files: ['js/modules/performance.js', 'js/ui/performance-ui.js'],
            css: ['css/performance.css']
        },
        'content-management': {
            files: ['js/modules/content-management.js', 'js/ui/content-management-ui.js'],
            css: ['css/content-management.css']
        },
        'user-features': {
            files: [
                'js/modules/user-profiles.js',
                'js/modules/user-preferences.js',
                'js/modules/achievements.js',
                'js/modules/social-features.js',
                'js/modules/messaging.js',
                'js/ui/user-features-ui.js'
            ],
            css: ['css/user-features.css']
        },
        notifications: {
            files: ['js/modules/notifications.js', 'js/ui/notifications-ui.js'],
            css: ['css/notifications.css']
        },
        api: {
            files: ['js/modules/api.js'],
            css: []
        },
        branching: {
            files: ['js/modules/branching-narrative.js'],
            css: []
        },
        'dynamic-content': {
            files: ['js/modules/dynamic-content.js'],
            css: []
        }
    };
    
    /**
     * Load a CSS file
     * @param {string} href - CSS file path
     * @returns {Promise<void>}
     */
    function loadCSS(href) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (document.querySelector(`link[href="${href}"]`)) {
                resolve();
                return;
            }
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }
    
    /**
     * Load a JavaScript file
     * @param {string} src - JavaScript file path
     * @returns {Promise<void>}
     */
    function loadJS(src) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (loadedModules.has(src)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => {
                loadedModules.add(src);
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    /**
     * Load a module and its dependencies
     * @param {string} moduleName - Name of the module to load
     * @returns {Promise<void>}
     */
    async function loadModule(moduleName) {
        if (!modules[moduleName]) {
            throw new Error(`Unknown module: ${moduleName}`);
        }
        
        const module = modules[moduleName];
        
        // Load CSS files first
        for (const cssFile of module.css) {
            try {
                await loadCSS(cssFile);
            } catch (error) {
                console.error(`Failed to load CSS: ${cssFile}`, error);
            }
        }
        
        // Load JavaScript files
        for (const jsFile of module.files) {
            try {
                await loadJS(jsFile);
            } catch (error) {
                console.error(`Failed to load JS: ${jsFile}`, error);
                throw error;
            }
        }
    }
    
    /**
     * Preload a module (load in background)
     * @param {string} moduleName - Name of the module to preload
     * @returns {Promise<void>}
     */
    async function preloadModule(moduleName) {
        try {
            await loadModule(moduleName);
        } catch (error) {
            console.warn(`Failed to preload module: ${moduleName}`, error);
        }
    }
    
    /**
     * Check if a module is loaded
     * @param {string} moduleName - Name of the module to check
     * @returns {boolean}
     */
    function isModuleLoaded(moduleName) {
        if (!modules[moduleName]) {
            return false;
        }
        
        return modules[moduleName].files.every(file => loadedModules.has(file));
    }
    
    /**
     * Get list of available modules
     * @returns {string[]}
     */
    function getAvailableModules() {
        return Object.keys(modules);
    }
    
    // Public API
    return {
        loadModule,
        preloadModule,
        isModuleLoaded,
        getAvailableModules
    };
})();

// Export to global scope
window.LazyLoader = LazyLoader;
'''
    
    with open('js/utils/lazy-loader.js', 'w') as f:
        f.write(lazy_loader_code)
    
    print("  ✓ Created js/utils/lazy-loader.js")
    print(f"  ✓ {len(lazy_loader_code)} lines of code")

if __name__ == '__main__':
    stats = analyze_module_sizes()
    generate_lazy_loader()
    
    print("\n✅ Code splitting analysis complete!")
    print("\n📋 NEXT STEPS:")
    print("  1. Update index.html to remove lazy-loaded script tags")
    print("  2. Add lazy-loader.js to critical modules")
    print("  3. Update UI components to use LazyLoader.loadModule()")
    print("  4. Configure Vite for code splitting")
    print("  5. Test performance improvements")