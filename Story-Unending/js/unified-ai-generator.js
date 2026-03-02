/**
 * Unified AI Generator
 * Combines all AI generation systems into a single, unified system
 * Features from AIContentGenerator, AIIntegration, AIWebSearcher, and StoryAIIntegration
 */

const UnifiedAIGenerator = (function() {
    'use strict';

    // Configuration
    let config = {
        // WebLLM models (Chrome/Edge)
        webllmModel: 'Llama-2-7b-chat-hf-q4f16_1-MLC',
        
        // Transformers.js models (Safari)
        transformersModel: 'Xenova/phi-2',
        
        // Generation settings
        maxTokens: 200,
        temperature: 0.8,
        
        // Feature toggles
        enableParallelGeneration: true,
        enableEnsemble: true,
        enableWebGPU: true,
        enableWebAssembly: true,
        enableFallback: true,
        enableLogging: true,
        
        // AI percentage
        aiPercentage: 40, // 40% AI, 60% template
        
        enabled: false
    };

    // Engines
    let webllmEngine = null;
    let transformersPipeline = null;
    
    // Model status
    let webllmLoaded = false;
    let transformersLoaded = false;
    let loadingProgress = 0;

    // Cache for performance
    const cache = new Map();
    const MAX_CACHE_SIZE = 1000;

    // Statistics
    const stats = {
        totalGenerated: 0,
        cacheHits: 0,
        webllmGenerations: 0,
        transformersGenerations: 0,
        parallelGenerations: 0,
        ensembleGenerations: 0,
        aiGenerations: 0,
        templateGenerations: 0,
        fallbacks: 0,
        errors: 0,
        modelLoadTime: 0
    };

    // Template generation functions (will be set during initialization)
    let templateGenerators = {};

    /**
     * Detect browser capabilities
     * @returns {Object} Browser capabilities
     */
    function detectBrowserCapabilities() {
        const capabilities = {
            webgpu: typeof navigator !== 'undefined' && navigator.gpu !== undefined,
            webassembly: typeof WebAssembly !== 'undefined',
            browser: detectBrowser(),
            preferredBackend: null
        };

        // Select best backend based on capabilities
        if (capabilities.webgpu && (capabilities.browser === 'chrome' || capabilities.browser === 'edge')) {
            capabilities.preferredBackend = 'weblm';
        } else if (capabilities.webassembly) {
            capabilities.preferredBackend = 'transformers';
        }

        return capabilities;
    }

    /**
     * Detect browser
     * @returns {string} Browser name
     */
    function detectBrowser() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
            return 'chrome';
        } else if (userAgent.includes('edg')) {
            return 'edge';
        } else if (userAgent.includes('firefox')) {
            return 'firefox';
        } else if (userAgent.includes('safari')) {
            return 'safari';
        }
        
        return 'unknown';
    }

    /**
     * Initialize the unified AI generator
     * @param {Object} configuration - Configuration object
     * @param {Object} generators - Template generation functions
     */
    async function initialize(configuration, generators) {
        if (configuration) {
            config = { ...config, ...configuration };
        }
        
        if (generators) {
            templateGenerators = generators;
        }

        // Detect browser capabilities
        const capabilities = detectBrowserCapabilities();
        log(`UnifiedAIGenerator: Browser capabilities:`, capabilities);

        // Initialize based on capabilities
        const startTime = Date.now();

        if (capabilities.preferredBackend === 'weblm' && config.enableWebGPU) {
            await initializeWebLLM();
        } else if (capabilities.preferredBackend === 'transformers' && config.enableWebAssembly) {
            await initializeTransformers();
        } else if (config.enableWebAssembly) {
            // Fallback to Transformers.js
            await initializeTransformers();
        } else {
            log('UnifiedAIGenerator: No suitable backend found. AI generation disabled.');
            config.enabled = false;
            return;
        }

        const loadTime = (Date.now() - startTime) / 1000;
        stats.modelLoadTime = loadTime;
        
        log(`UnifiedAIGenerator: Initialized in ${loadTime.toFixed(2)} seconds`);
        log(`UnifiedAIGenerator: AI percentage: ${config.aiPercentage}%`);
    }

    /**
     * Initialize WebLLM engine
     */
    async function initializeWebLLM() {
        if (typeof CreateMLCEngine === 'undefined') {
            log('UnifiedAIGenerator: WebLLM not available.');
            return;
        }

        try {
            log(`UnifiedAIGenerator: Loading WebLLM model ${config.webllmModel}...`);
            
            webllmEngine = await CreateMLCEngine(
                config.webllmModel,
                {
                    initProgressCallback: (report) => {
                        loadingProgress = report.progress;
                        log(`UnifiedAIGenerator: Loading WebLLM... ${loadingProgress.toFixed(1)}%`);
                    }
                }
            );

            webllmLoaded = true;
            config.enabled = true;
            log('UnifiedAIGenerator: WebLLM loaded successfully');
        } catch (error) {
            log('UnifiedAIGenerator: Error loading WebLLM:', error);
            webllmLoaded = false;
        }
    }

    /**
     * Initialize Transformers.js pipeline
     */
    async function initializeTransformers() {
        if (typeof pipeline === 'undefined') {
            log('UnifiedAIGenerator: Transformers.js not available.');
            return;
        }

        try {
            log(`UnifiedAIGenerator: Loading Transformers.js model ${config.transformersModel}...`);
            
            transformersPipeline = await pipeline(
                'text-generation',
                config.transformersModel,
                {
                    progress_callback: (progress) => {
                        if (progress.status === 'progress') {
                            loadingProgress = progress.progress;
                            log(`UnifiedAIGenerator: Loading Transformers.js... ${loadingProgress.toFixed(1)}%`);
                        }
                    }
                }
            );

            transformersLoaded = true;
            config.enabled = true;
            log('UnifiedAIGenerator: Transformers.js loaded successfully');
        } catch (error) {
            log('UnifiedAIGenerator: Error loading Transformers.js:', error);
            transformersLoaded = false;
        }
    }

    /**
     * Decide whether to use AI for generation
     * @param {number} chapterNum - Chapter number
     * @param {string} paragraphType - Type of paragraph
     * @returns {boolean} True if should use AI
     */
    function shouldUseAI(chapterNum, paragraphType) {
        // Use random number to decide based on percentage
        const random = Math.random() * 100;
        return random < config.aiPercentage;
    }

    /**
     * Generate a unique paragraph using AI
     * @param {Object} context - Context for generation
     * @param {number} chapterNum - Chapter number
     * @param {string} paragraphType - Type of paragraph
     * @returns {Promise<string>} Generated paragraph
     */
    async function generateParagraph(context, chapterNum, paragraphType) {
        if (!config.enabled) {
            throw new Error('AI generation is not enabled. No models loaded.');
        }

        // Check cache first
        const cacheKey = `${chapterNum}-${paragraphType}-${JSON.stringify(context)}`;
        if (cache.has(cacheKey)) {
            stats.cacheHits++;
            return cache.get(cacheKey);
        }

        try {
            let paragraph;

            // Use parallel generation if enabled and multiple models available
            if (config.enableParallelGeneration && webllmLoaded && transformersLoaded) {
                paragraph = await generateParallel(context, chapterNum, paragraphType);
                stats.parallelGenerations++;
            } else if (webllmLoaded) {
                paragraph = await generateWithWebLLM(context, chapterNum, paragraphType);
                stats.webllmGenerations++;
            } else if (transformersLoaded) {
                paragraph = await generateWithTransformers(context, chapterNum, paragraphType);
                stats.transformersGenerations++;
            } else {
                throw new Error('No models loaded');
            }

            // Cache the result
            cacheParagraph(cacheKey, paragraph);

            // Update statistics
            stats.totalGenerated++;
            stats.aiGenerations++;

            return paragraph;
        } catch (error) {
            stats.errors++;
            log('UnifiedAIGenerator: Error generating paragraph:', error);
            throw error;
        }
    }

    /**
     * Generate multiple paragraphs
     * @param {Object} context - Context for generation
     * @param {number} chapterNum - Chapter number
     * @param {string} paragraphType - Type of paragraph
     * @param {number} count - Number of paragraphs to generate
     * @returns {Promise<string[]>} Array of generated paragraphs
     */
    async function generateMultipleParagraphs(context, chapterNum, paragraphType, count) {
        const paragraphs = [];
        
        for (let i = 0; i < count; i++) {
            const paragraphContext = { ...context, index: i };
            const paragraph = await generateParagraph(paragraphContext, chapterNum, paragraphType);
            paragraphs.push(paragraph);
        }

        return paragraphs;
    }

    /**
     * Generate with parallel models
     * @param {Object} context - Context for generation
     * @param {number} chapterNum - Chapter number
     * @param {string} paragraphType - Type of paragraph
     * @returns {Promise<string>} Generated paragraph
     */
    async function generateParallel(context, chapterNum, paragraphType) {
        const prompt = generatePrompt(context, chapterNum, paragraphType);
        
        // Generate with both models in parallel
        const promises = [];
        
        if (webllmLoaded) {
            promises.push(generateWithWebLLMPrompt(prompt));
        }
        
        if (transformersLoaded) {
            promises.push(generateWithTransformersPrompt(prompt));
        }
        
        const results = await Promise.all(promises);
        
        // Use ensemble to select best result
        if (config.enableEnsemble && results.length > 1) {
            const bestResult = selectBestResult(results);
            stats.ensembleGenerations++;
            return bestResult;
        }
        
        return results[0];
    }

    /**
     * Generate with WebLLM
     * @param {Object} context - Context for generation
     * @param {number} chapterNum - Chapter number
     * @param {string} paragraphType - Type of paragraph
     * @returns {Promise<string>} Generated paragraph
     */
    async function generateWithWebLLM(context, chapterNum, paragraphType) {
        const prompt = generatePrompt(context, chapterNum, paragraphType);
        return await generateWithWebLLMPrompt(prompt);
    }

    /**
     * Generate with WebLLM using prompt
     * @param {string} prompt - Prompt for generation
     * @returns {Promise<string>} Generated text
     */
    async function generateWithWebLLMPrompt(prompt) {
        if (!webllmEngine) {
            throw new Error('WebLLM engine not loaded');
        }

        const messages = [
            { role: 'system', content: 'You are a creative writer. Generate engaging, unique content.' },
            { role: 'user', content: prompt }
        ];

        const reply = await webllmEngine.chat.completions.create({ messages });
        return reply.choices[0].message.content;
    }

    /**
     * Generate with Transformers.js
     * @param {Object} context - Context for generation
     * @param {number} chapterNum - Chapter number
     * @param {string} paragraphType - Type of paragraph
     * @returns {Promise<string>} Generated paragraph
     */
    async function generateWithTransformers(context, chapterNum, paragraphType) {
        const prompt = generatePrompt(context, chapterNum, paragraphType);
        return await generateWithTransformersPrompt(prompt);
    }

    /**
     * Generate with Transformers.js using prompt
     * @param {string} prompt - Prompt for generation
     * @returns {Promise<string>} Generated text
     */
    async function generateWithTransformersPrompt(prompt) {
        if (!transformersPipeline) {
            throw new Error('Transformers.js pipeline not loaded');
        }

        const output = await transformersPipeline(prompt, {
            max_new_tokens: config.maxTokens,
            temperature: config.temperature,
            do_sample: true
        });

        return output[0].generated_text;
    }

    /**
     * Select best result from ensemble
     * @param {Array<string>} results - Array of generated results
     * @returns {string} Best result
     */
    function selectBestResult(results) {
        // Score each result
        const scoredResults = results.map(result => ({
            text: result,
            score: scoreResult(result)
        }));

        // Sort by score (descending)
        scoredResults.sort((a, b) => b.score - a.score);

        // Return best result
        return scoredResults[0].text;
    }

    /**
     * Score result for quality
     * @param {string} text - Text to score
     * @returns {number} Score
     */
    function scoreResult(text) {
        let score = 0;

        // Length score (prefer longer text)
        score += Math.min(text.length / 100, 10);

        // Sentence count score
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        score += Math.min(sentences.length * 2, 10);

        // Vocabulary diversity score
        const words = text.split(/\s+/);
        const uniqueWords = new Set(words.map(w => w.toLowerCase()));
        score += (uniqueWords.size / words.length) * 10;

        return score;
    }

    /**
     * Generate a paragraph with fallback mechanism
     * @param {Object} context - Context for generation
     * @param {number} chapterNum - Chapter number
     * @param {string} paragraphType - Type of paragraph
     * @param {Function} templateGenerator - Template generation function
     * @returns {Promise<string>} Generated paragraph
     */
    async function generateWithFallback(context, chapterNum, paragraphType, templateGenerator) {
        stats.totalGenerations++;

        try {
            // Decide whether to use AI
            const useAI = shouldUseAI(chapterNum, paragraphType);

            if (useAI && isEnabled()) {
                // Use AI generation
                log(`UnifiedAIGenerator: Using AI for chapter ${chapterNum}, type ${paragraphType}`);
                const paragraph = await generateParagraph(context, chapterNum, paragraphType);
                stats.aiGenerations++;
                return paragraph;
            } else {
                // Use template generation
                log(`UnifiedAIGenerator: Using template for chapter ${chapterNum}, type ${paragraphType}`);
                const paragraph = templateGenerator(context, chapterNum);
                stats.templateGenerations++;
                return paragraph;
            }
        } catch (error) {
            stats.errors++;
            log(`UnifiedAIGenerator: Error occurred: ${error.message}`);

            // Fallback to template generation if enabled
            if (config.enableFallback && templateGenerator) {
                log(`UnifiedAIGenerator: Falling back to template generation`);
                stats.fallbacks++;
                const paragraph = templateGenerator(context, chapterNum);
                stats.templateGenerations++;
                return paragraph;
            } else {
                throw error;
            }
        }
    }

    /**
     * Generate multiple paragraphs with fallback
     * @param {Object} context - Context for generation
     * @param {number} chapterNum - Chapter number
     * @param {string} paragraphType - Type of paragraph
     * @param {number} count - Number of paragraphs to generate
     * @param {Function} templateGenerator - Template generation function
     * @returns {Promise<string[]>} Array of generated paragraphs
     */
    async function generateMultipleWithFallback(context, chapterNum, paragraphType, count, templateGenerator) {
        const paragraphs = [];
        
        for (let i = 0; i < count; i++) {
            const paragraphContext = { ...context, index: i };
            const paragraph = await generateWithFallback(paragraphContext, chapterNum, paragraphType, templateGenerator);
            paragraphs.push(paragraph);
        }

        return paragraphs;
    }

    /**
     * Story Engine Integration - Generate paragraph with AI
     * @param {Object} context - Context for generation
     * @param {number} chapterNum - Chapter number
     * @param {string} paragraphType - Type of paragraph
     * @returns {Promise<string>} Generated paragraph
     */
    async function generateParagraphWithAI(context, chapterNum, paragraphType) {
        return await generateParagraph(context, chapterNum, paragraphType);
    }

    /**
     * Story Engine Integration - Generate chapter with AI
     * @param {number} chapterNum - Chapter number
     * @param {Object} context - Context for generation
     * @returns {Promise<Object>} Generated chapter
     */
    async function generateChapterWithAI(chapterNum, context) {
        const paragraphs = [];
        
        // Generate multiple paragraphs for the chapter
        const paragraphCount = 10; // Default paragraph count
        for (let i = 0; i < paragraphCount; i++) {
            const paragraphContext = { ...context, index: i };
            const paragraph = await generateParagraph(paragraphContext, chapterNum, 'body');
            paragraphs.push(paragraph);
        }

        return {
            chapterNum: chapterNum,
            paragraphs: paragraphs,
            generatedWithAI: true
        };
    }

    /**
     * Story Engine Integration - Initialize AI
     */
    function initializeAI() {
        log('UnifiedAIGenerator: AI initialized for story engine');
    }

    /**
     * Web Search Integration - Search web content
     * @param {string} query - Search query
     * @param {number} count - Number of results
     * @returns {Promise<Array>} Search results
     */
    async function searchWebContent(query, count) {
        // Placeholder for web search integration
        log(`UnifiedAIGenerator: Web search for "${query}" (${count} results)`);
        return [];
    }

    /**
     * Web Search Integration - Filter content
     * @param {Array} content - Content to filter
     * @returns {Array} Filtered content
     */
    function filterContent(content) {
        // Placeholder for content filtering
        return content;
    }

    /**
     * Web Search Integration - Extract content
     * @param {Array} content - Content to extract
     * @returns {Array} Extracted content
     */
    function extractContent(content) {
        // Placeholder for content extraction
        return content;
    }

    /**
     * Check if paragraph is unique
     * @param {string} paragraph - Paragraph to check
     * @returns {boolean} True if unique
     */
    function isParagraphUnique(paragraph) {
        // Placeholder for uniqueness checking
        return true;
    }

    /**
     * Cache paragraph
     * @param {string} key - Cache key
     * @param {string} paragraph - Paragraph to cache
     */
    function cacheParagraph(key, paragraph) {
        if (cache.size >= MAX_CACHE_SIZE) {
            // Remove oldest entry
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }
        cache.set(key, paragraph);
    }

    /**
     * Generate prompt for AI
     * @param {Object} context - Context for generation
     * @param {number} chapterNum - Chapter number
     * @param {string} paragraphType - Type of paragraph
     * @returns {string} Generated prompt
     */
    function generatePrompt(context, chapterNum, paragraphType) {
        let prompt = `Generate a ${paragraphType} paragraph for chapter ${chapterNum}.`;
        
        if (context && context.theme) {
            prompt += ` Theme: ${context.theme}.`;
        }
        
        if (context && context.characters) {
            prompt += ` Characters: ${context.characters.join(', ')}.`;
        }
        
        prompt += ' Make it engaging and unique.';
        
        return prompt;
    }

    /**
     * Get statistics
     * @returns {Object} Statistics object
     */
    function getStats() {
        return {
            ...stats,
            aiPercentage: config.aiPercentage,
            aiUsageRate: stats.totalGenerations > 0 ? (stats.aiGenerations / stats.totalGenerations * 100).toFixed(2) + '%' : '0%',
            templateUsageRate: stats.totalGenerations > 0 ? (stats.templateGenerations / stats.totalGenerations * 100).toFixed(2) + '%' : '0%',
            fallbackRate: stats.totalGenerations > 0 ? (stats.fallbacks / stats.totalGenerations * 100).toFixed(2) + '%' : '0%',
            errorRate: stats.totalGenerations > 0 ? (stats.errors / stats.totalGenerations * 100).toFixed(2) + '%' : '0%',
            webllmLoaded: webllmLoaded,
            transformersLoaded: transformersLoaded,
            enabled: config.enabled
        };
    }

    /**
     * Reset statistics
     */
    function resetStats() {
        stats.totalGenerated = 0;
        stats.cacheHits = 0;
        stats.webllmGenerations = 0;
        stats.transformersGenerations = 0;
        stats.parallelGenerations = 0;
        stats.ensembleGenerations = 0;
        stats.aiGenerations = 0;
        stats.templateGenerations = 0;
        stats.fallbacks = 0;
        stats.errors = 0;
        stats.modelLoadTime = 0;
    }

    /**
     * Clear cache
     */
    function clearCache() {
        cache.clear();
        log('UnifiedAIGenerator: Cache cleared');
    }

    /**
     * Check if enabled
     * @returns {boolean} True if enabled
     */
    function isEnabled() {
        return config.enabled && (webllmLoaded || transformersLoaded);
    }

    /**
     * Check if WebGPU is supported
     * @returns {boolean} True if supported
     */
    function isWebGPUSupported() {
        return typeof navigator !== 'undefined' && navigator.gpu !== undefined;
    }

    /**
     * Check if WebAssembly is supported
     * @returns {boolean} True if supported
     */
    function isWebAssemblySupported() {
        return typeof WebAssembly !== 'undefined';
    }

    /**
     * Get loading progress
     * @returns {number} Loading progress (0-100)
     */
    function getLoadingProgress() {
        return loadingProgress;
    }

    /**
     * Get available models
     * @returns {Array} Available models
     */
    function getAvailableModels() {
        const models = [];
        
        if (webllmLoaded) {
            models.push({ name: config.webllmModel, type: 'weblm' });
        }
        
        if (transformersLoaded) {
            models.push({ name: config.transformersModel, type: 'transformers' });
        }
        
        return models;
    }

    /**
     * Set AI configuration
     * @param {Object} newConfig - New configuration
     */
    function setAIConfig(newConfig) {
        config = { ...config, ...newConfig };
        log('UnifiedAIGenerator: AI configuration updated');
    }

    /**
     * Get AI configuration
     * @returns {Object} Current configuration
     */
    function getAIConfig() {
        return { ...config };
    }

    /**
     * Set AI percentage
     * @param {number} percentage - Percentage (0-100)
     */
    function setAIPercentage(percentage) {
        if (percentage < 0 || percentage > 100) {
            throw new Error('AI percentage must be between 0 and 100');
        }
        config.aiPercentage = percentage;
        log(`UnifiedAIGenerator: AI percentage set to ${percentage}%`);
    }

    /**
     * Get AI percentage
     * @returns {number} Current percentage
     */
    function getAIPercentage() {
        return config.aiPercentage;
    }

    /**
     * Enable or disable AI generation
     * @param {boolean} enabled - True to enable
     */
    function setAIEnabled(enabled) {
        if (enabled) {
            setAIPercentage(config.aiPercentage > 0 ? config.aiPercentage : 40);
        } else {
            setAIPercentage(0);
        }
    }

    /**
     * Check if AI generation is enabled
     * @returns {boolean} True if enabled
     */
    function isAIEnabled() {
        return config.aiPercentage > 0 && isEnabled();
    }

    /**
     * Update configuration
     * @param {Object} newConfig - New configuration
     */
    function updateConfig(newConfig) {
        config = { ...config, ...newConfig };
        log('UnifiedAIGenerator: Configuration updated');
    }

    /**
     * Get configuration
     * @returns {Object} Current configuration
     */
    function getConfig() {
        return { ...config };
    }

    /**
     * Log message if logging is enabled
     * @param {string} message - Message to log
     */
    function log(message) {
        if (config.enableLogging) {
        }
    }

    // Public API
    return {
        // Core Functions
        initialize,
        detectBrowserCapabilities,
        detectBrowser,
        isEnabled,

        // Model Initialization
        initializeWebLLM,
        initializeTransformers,
        isWebGPUSupported,
        isWebAssemblySupported,
        getLoadingProgress,
        getAvailableModels,

        // Generation Functions
        generateParagraph,
        generateMultipleParagraphs,
        generateParallel,
        generateWithWebLLM,
        generateWithTransformers,
        generateWithFallback,
        generateMultipleWithFallback,

        // Quality Functions
        selectBestResult,
        scoreResult,

        // Story Engine Integration
        generateParagraphWithAI,
        generateChapterWithAI,
        initializeAI,

        // Web Search Integration
        searchWebContent,
        filterContent,
        extractContent,

        // Utility Functions
        isParagraphUnique,
        cacheParagraph,
        generatePrompt,
        shouldUseAI,

        // Configuration Functions
        setAIConfig,
        getAIConfig,
        setAIPercentage,
        getAIPercentage,
        setAIEnabled,
        isAIEnabled,
        updateConfig,
        getConfig,

        // Statistics Functions
        getStats,
        resetStats,
        clearCache
    };
})();

// Export to global scope
if (typeof window !== 'undefined') {
    window.UnifiedAIGenerator = UnifiedAIGenerator;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedAIGenerator;
}