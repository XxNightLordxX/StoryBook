/**
 * REST API Module
 * 
 * Core functionality for REST API including:
 * - API endpoint management
 * - Authentication and authorization
 * - Request/response handling
 * - Rate limiting
 * - Error handling
 * 
 * @namespace API
 */
(function() {
    'use strict';

    // ==================== CONSTANTS ====================
    
    const STORAGE_KEYS = {
        API_TOKEN: 'api_token',
        REFRESH_TOKEN: 'refresh_token',
        API_CONFIG: 'api_config'
    };

    const API_VERSION = 'v1';
    const BASE_URL = '/api/' + API_VERSION;

    // CORS Configuration
    const CORS_CONFIG = {
        allowedOrigins: ['*'],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        maxAge: 86400
    };


    const ENDPOINTS = {
        // Authentication
        AUTH: {
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            REFRESH: '/auth/refresh',
            VERIFY: '/auth/verify'
        },
        // Users
        USERS: {
            LIST: '/users',
            GET: '/users/:id',
            CREATE: '/users',
            UPDATE: '/users/:id',
            DELETE: '/users/:id',
            PROFILE: '/users/:id/profile',
            PREFERENCES: '/users/:id/preferences'
        },
        // Content
        CONTENT: {
          LIST: '/content',
          GET: '/content/:id',
          CREATE: '/content',
          UPDATE: '/content/:id',
          DELETE: '/content/:id',
          VERSIONS: '/content/:id/versions',
          APPROVE: '/content/:id/approve'
        },
        // Analytics
        ANALYTICS: {
          SESSIONS: '/analytics/sessions',
          CHAPTERS: '/analytics/chapters',
          ACTIONS: '/analytics/actions',
          DAILY: '/analytics/daily',
          EXPORT: '/analytics/export'
        },
        // Notifications
        NOTIFICATIONS: {
          LIST: '/notifications',
          GET: '/notifications/:id',
          CREATE: '/notifications',
          UPDATE: '/notifications/:id',
          DELETE: '/notifications/:id',
          MARK_READ: '/notifications/:id/read',
          MARK_ALL_READ: '/notifications/read-all'
        },
        // Bookmarks
        BOOKMARKS: {
          LIST: '/bookmarks',
          GET: '/bookmarks/:id',
          CREATE: '/bookmarks',
          UPDATE: '/bookmarks/:id',
          DELETE: '/bookmarks/:id'
        },
        // Search
        SEARCH: {
          CHAPTERS: '/search/chapters',
          CONTENT: '/search/content',
          USERS: '/search/users'
        }
    };

    const RATE_LIMITS = {
        DEFAULT: { requests: 100, window: 60000 }, // 100 requests per minute
        AUTH: { requests: 5, window: 60000 }, // 5 requests per minute
        WRITE: { requests: 20, window: 60000 }, // 20 requests per minute
        READ: { requests: 200, window: 60000 } // 200 requests per minute
    };

    const HTTP_STATUS = {
        OK: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        TOO_MANY_REQUESTS: 429,
        INTERNAL_SERVER_ERROR: 500
    };

    // ==================== STATE ====================
    
    let apiToken = null;
    let refreshToken = null;
    let rateLimitStore = {};
    let config = {
        baseURL: BASE_URL,
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000
    };

    // ==================== INITIALIZATION ====================
    
    /**
     * Initialize the API module
     * @returns {void}
     */
    const initialize = () => {
        try {
            loadTokens();
            loadConfig();
            startRateLimitCleanup();
            // API module initialized
        } catch (error) {
            ErrorHandler.handleError('Failed to initialize API module', error);
        }
    }

    /**
     * Load authentication tokens from storage
     * @returns {void}
     */
    const loadTokens = () => {
        try {
            apiToken = Storage.getItem(STORAGE_KEYS.API_TOKEN);
            refreshToken = Storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        } catch (error) {
            ErrorHandler.handleError('Failed to load API tokens', error);
        }
    }

    /**
     * Load API configuration from storage
     * @returns {void}
     */
    const loadConfig = () => {
        try {
            const stored = Storage.getItem(STORAGE_KEYS.API_CONFIG);
            if (stored) {
                config = { ...config, ...JSON.parse(stored) };
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to load API config', error);
        }
    }

    /**
     * Start rate limit cleanup interval
     * @returns {void}
     */
    const startRateLimitCleanup = () => {
        // Clean up old rate limit entries every minute
        const rateLimitCleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const key in rateLimitStore) {
                const entry = rateLimitStore[key];
                if (now - entry.resetTime > entry.window) {
                    delete rateLimitStore[key];
                }
            }
        }, 60000);
    }

    // ==================== RATE LIMITING ====================
    
    /**
     * Check rate limit for an endpoint
     * @param {string} endpoint - Endpoint identifier
     * @returns {Object} Rate limit status
     */
    const checkRateLimit = (endpoint) => {
        const now = Date.now();
        const limit = getRateLimitForEndpoint(endpoint);
        const key = endpoint;
        
        if (!rateLimitStore[key]) {
            rateLimitStore[key] = {
                count: 0,
                resetTime: now + limit.window,
                window: limit.window
            };
        }
        
        const entry = rateLimitStore[key];
        
        // Reset if window has expired
        if (now >= entry.resetTime) {
            entry.count = 0;
            entry.resetTime = now + limit.window;
        }
        
        const remaining = limit.requests - entry.count;
        const resetIn = Math.max(0, entry.resetTime - now);
        
        return {
            allowed: entry.count < limit.requests,
            remaining,
            resetIn,
            limit: limit.requests
        };
    }

    /**
     * Get rate limit for endpoint
     * @param {string} endpoint - Endpoint identifier
     * @returns {Object} Rate limit configuration
     */
    const getRateLimitForEndpoint = (endpoint) => {
        if (endpoint.includes('/auth/')) {
            return RATE_LIMITS.AUTH;
        } else if (['POST', 'PUT', 'DELETE'].some(method => endpoint.includes(method))) {
            return RATE_LIMITS.WRITE;
        } else if (endpoint.includes('/analytics/')) {
            return RATE_LIMITS.READ;
        }
        return RATE_LIMITS.DEFAULT;
    }

    /**
     * Increment rate limit counter
     * @param {string} endpoint - Endpoint identifier
     * @returns {void}
     */
    const incrementRateLimit = (endpoint) => {
        const key = endpoint;
        if (rateLimitStore[key]) {
            rateLimitStore[key].count++;
        }
    }

    // ==================== HTTP CLIENT ====================
    
    /**
     * Make HTTP request
     * @param {string} method - HTTP method
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Response data
     */
    const request = async (method, endpoint, options = {}) => {
        try {
            const url = buildURL(endpoint);
            const rateLimit = checkRateLimit(method + ':' + endpoint);
            
            if (!rateLimit.allowed) {
                throw new APIError('Rate limit exceeded', HTTP_STATUS.TOO_MANY_REQUESTS, {
                    retryAfter: Math.ceil(rateLimit.resetIn / 1000)
                });
            }
            
            const headers = buildHeaders(options.headers);
            const body = options.body ? JSON.stringify(options.body) : null;
            
            const requestOptions = {
                method,
                headers,
                body,
                signal: AbortSignal.timeout(config.timeout)
            };
            
            const response = await fetch(url, requestOptions);
            incrementRateLimit(method + ':' + endpoint);
            
            // Handle rate limit headers from server
            handleRateLimitHeaders(response);
            
            // Handle authentication errors
            if (response.status === HTTP_STATUS.UNAUTHORIZED && !options.skipAuthRefresh) {
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    return request(method, endpoint, { ...options, skipAuthRefresh: true });
                }
            }
            
            // Parse response
            const data = await parseResponse(response);
            
            // Handle errors
            if (!response.ok) {
                throw new APIError(data.message || 'Request failed', response.status, data);
            }
            
            return data;
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            ErrorHandler.handleError('API request failed', error);
            throw new APIError('Network error', HTTP_STATUS.INTERNAL_SERVER_ERROR, { originalError: error.message });
        }
    }

    /**
     * Build full URL for endpoint
     * @param {string} endpoint - API endpoint
     * @returns {string} Full URL
     */
    const buildURL = (endpoint) => {
        // Replace path parameters
        let url = endpoint;
        if (url.includes(':')) {
            // This is a simplified version - in production, you'd use proper URL building
            url = url.replace(/:(\w+)/g, (match, param) => {
                // In a real implementation, you'd pass parameters separately
                return match;
            });
        }
        
        // Add query parameters if present
        const queryString = url.includes('?') ? url.split('?')[1] : '';
        const path = url.split('?')[0];
        
        return config.baseURL + path + (queryString ? '?' + queryString : '');
    }

    /**
     * Build request headers
     * @param {Object} customHeaders - Custom headers
     * @returns {Object} Headers object
     */
    const buildHeaders = (customHeaders = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...customHeaders
        };
        
        if (apiToken) {
            headers['Authorization'] = `Bearer ${apiToken}`;
        }
        
        return headers;
    }

    /**
     * Parse response
     * @param {Response} response - Fetch response
     * @returns {Promise<Object>} Parsed data
     */
    const parseResponse = async (response) => {
        try {
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            if (response.status === HTTP_STATUS.NO_CONTENT) {
                return null;
            }
            
            return await response.text();
        } catch (error) {
            throw new Error(`API parseResponse failed: ${error.message}`);
        }
    }

    /**
     * Handle rate limit headers from server
     * @param {Response} response - Fetch response
     * @returns {void}
     */
    const handleRateLimitHeaders = (response) => {
        const remaining = response.headers.get('X-RateLimit-Remaining');
        const reset = response.headers.get('X-RateLimit-Reset');
        const limit = response.headers.get('X-RateLimit-Limit');
        
        if (remaining !== null && reset !== null && limit !== null) {
            // Update local rate limit based on server headers
            // This ensures client and server are in sync
        }
    }

    // ==================== AUTHENTICATION ====================
    
    /**
     * Login user
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Promise<Object>} Authentication response
     */
    const login = async (username, password) => {
        try {
            const response = await request('POST', ENDPOINTS.AUTH.LOGIN, {
                body: { username, password }
            });
            
            if (response.token) {
                apiToken = response.token;
                Storage.setItem(STORAGE_KEYS.API_TOKEN, apiToken);
            }
            
            if (response.refreshToken) {
                refreshToken = response.refreshToken;
                Storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            }
            
            return response;
        } catch (error) {
            ErrorHandler.handleError('Login failed', error);
            throw error;
        }
    }

    /**
     * Logout user
     * @returns {Promise<void>}
     */
    const logout = async () => {
        try {
            await request('POST', ENDPOINTS.AUTH.LOGOUT);
            
            apiToken = null;
            refreshToken = null;
            Storage.removeItem(STORAGE_KEYS.API_TOKEN);
            Storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        } catch (error) {
            ErrorHandler.handleError('Logout failed', error);
            // Clear tokens even if logout request fails
            apiToken = null;
            refreshToken = null;
            Storage.removeItem(STORAGE_KEYS.API_TOKEN);
            Storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        }
    }

    /**
     * Refresh access token
     * @returns {Promise<boolean>} Success status
     */
    const refreshAccessToken = async () => {
        try {
            if (!refreshToken) {
                return false;
            }
            
            const response = await request('POST', ENDPOINTS.AUTH.REFRESH, {
                body: { refreshToken },
                skipAuthRefresh: true
            });
            
            if (response.token) {
                apiToken = response.token;
                Storage.setItem(STORAGE_KEYS.API_TOKEN, apiToken);
            }
            
            if (response.refreshToken) {
                refreshToken = response.refreshToken;
                Storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            }
            
            return true;
        } catch (error) {
            ErrorHandler.handleError('Token refresh failed', error);
            // Clear tokens if refresh fails
            apiToken = null;
            refreshToken = null;
            Storage.removeItem(STORAGE_KEYS.API_TOKEN);
            Storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            return false;
        }
    }

    /**
     * Verify token
     * @returns {Promise<Object>} Verification result
     */
    const verifyToken = async () => {
        try {
            return await request('GET', ENDPOINTS.AUTH.VERIFY);
        } catch (error) {
            ErrorHandler.handleError('Token verification failed', error);
            throw error;
        }
    }

    // ==================== USER ENDPOINTS ====================
    
    /**
     * Get users list
     * @param {Object} filters - Query filters
     * @returns {Promise<Object>} Users list
     */
    const getUsers = async (filters = {}) => {
        try {
            return await request('GET', ENDPOINTS.USERS.LIST + buildQueryString(filters));
        } catch (error) {
            throw new Error(`API getUsers failed: ${error.message}`);
        }
    }

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User data
     */
    const getUser = async (userId) => {
        try {
            return await request('GET', ENDPOINTS.USERS.GET.replace(':id', userId));
        } catch (error) {
            throw new Error(`API getUser failed: ${error.message}`);
        }
    }

    /**
     * Create user
     * @param {Object} userData - User data
     * @returns {Promise<Object>} Created user
     */
    const createUser = async (userData) => {
        try {
            return await request('POST', ENDPOINTS.USERS.CREATE, { body: userData });
        } catch (error) {
            throw new Error(`API createUser failed: ${error.message}`);
        }
    }

    /**
     * Update user
     * @param {string} userId - User ID
     * @param {Object} userData - User data
     * @returns {Promise<Object>} Updated user
     */
    const updateUser = async (userId, userData) => {
        try {
            return await request('PUT', ENDPOINTS.USERS.UPDATE.replace(':id', userId), { body: userData });
        } catch (error) {
            throw new Error(`API updateUser failed: ${error.message}`);
        }
    }

    /**
     * Delete user
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    const deleteUser = async (userId) => {
        try {
            return await request('DELETE', ENDPOINTS.USERS.DELETE.replace(':id', userId));
        } catch (error) {
            throw new Error(`API deleteUser failed: ${error.message}`);
        }
    }

    // ==================== CONTENT ENDPOINTS ====================
    
    /**
     * Get content list
     * @param {Object} filters - Query filters
     * @returns {Promise<Object>} Content list
     */
    const getContent = async (filters = {}) => {
        try {
            return await request('GET', ENDPOINTS.CONTENT.LIST + buildQueryString(filters));
        } catch (error) {
            throw new Error(`API getContent failed: ${error.message}`);
        }
    }

    /**
     * Get content by ID
     * @param {string} contentId - Content ID
     * @returns {Promise<Object>} Content data
     */
    const getContentById = async (contentId) => {
        try {
            return await request('GET', ENDPOINTS.CONTENT.GET.replace(':id', contentId));
        } catch (error) {
            throw new Error(`API getContentById failed: ${error.message}`);
        }
    }

    /**
     * Create content
     * @param {Object} contentData - Content data
     * @returns {Promise<Object>} Created content
     */
    const createContent = async (contentData) => {
        try {
            return await request('POST', ENDPOINTS.CONTENT.CREATE, { body: contentData });
        } catch (error) {
            throw new Error(`API createContent failed: ${error.message}`);
        }
    }

    /**
     * Update content
     * @param {string} contentId - Content ID
     * @param {Object} contentData - Content data
     * @returns {Promise<Object>} Updated content
     */
    const updateContent = async (contentId, contentData) => {
        try {
            return await request('PUT', ENDPOINTS.CONTENT.UPDATE.replace(':id', contentId), { body: contentData });
        } catch (error) {
            throw new Error(`API updateContent failed: ${error.message}`);
        }
    }

    /**
     * Delete content
     * @param {string} contentId - Content ID
     * @returns {Promise<void>}
     */
    const deleteContent = async (contentId) => {
        try {
            return await request('DELETE', ENDPOINTS.CONTENT.DELETE.replace(':id', contentId));
        } catch (error) {
            throw new Error(`API deleteContent failed: ${error.message}`);
        }
    }

    // ==================== ANALYTICS ENDPOINTS ====================
    
    /**
     * Get analytics sessions
     * @param {Object} filters - Query filters
     * @returns {Promise<Object>} Sessions data
     */
    const getAnalyticsSessions = async (filters = {}) => {
        try {
            return await request('GET', ENDPOINTS.ANALYTICS.SESSIONS + buildQueryString(filters));
        } catch (error) {
            throw new Error(`API getAnalyticsSessions failed: ${error.message}`);
        }
    }

    /**
     * Get analytics chapters
     * @param {Object} filters - Query filters
     * @returns {Promise<Object>} Chapters data
     */
    const getAnalyticsChapters = async (filters = {}) => {
        try {
            return await request('GET', ENDPOINTS.ANALYTICS.CHAPTERS + buildQueryString(filters));
        } catch (error) {
            throw new Error(`API getAnalyticsChapters failed: ${error.message}`);
        }
    }

    /**
     * Get analytics actions
     * @param {Object} filters - Query filters
     * @returns {Promise<Object>} Actions data
     */
    const getAnalyticsActions = async (filters = {}) => {
        try {
            return await request('GET', ENDPOINTS.ANALYTICS.ACTIONS + buildQueryString(filters));
        } catch (error) {
            throw new Error(`API getAnalyticsActions failed: ${error.message}`);
        }
    }

    /**
     * Get analytics daily stats
     * @param {Object} filters - Query filters
     * @returns {Promise<Object>} Daily stats
     */
    const getAnalyticsDaily = async (filters = {}) => {
        try {
            return await request('GET', ENDPOINTS.ANALYTICS.DAILY + buildQueryString(filters));
        } catch (error) {
            throw new Error(`API getAnalyticsDaily failed: ${error.message}`);
        }
    }

    /**
     * Export analytics data
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export data
     */
    const exportAnalytics = async (options = {}) => {
        try {
            return await request('GET', ENDPOINTS.ANALYTICS.EXPORT + buildQueryString(options));
        } catch (error) {
            throw new Error(`API exportAnalytics failed: ${error.message}`);
        }
    }

    // ==================== UTILITY FUNCTIONS ====================
    
    /**
     * Build query string from object
     * @param {Object} params - Query parameters
     * @returns {string} Query string
     */
    const buildQueryString = (params) => {
        if (!params || Object.keys(params).length === 0) {
            return '';
        }
        
        const queryString = Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
        
        return '?' + queryString;
    }

    /**
     * Get current rate limit status
     * @returns {Object} Rate limit status
     */
    const getRateLimitStatus = () => {
        return {
            ...rateLimitStore
        };
    }

    /**
     * Update API configuration
     * @param {Object} newConfig - New configuration
     * @returns {void}
     */
    const updateConfig = (newConfig) => {
        config = { ...config, ...newConfig };
        Storage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(config));
    }

    /**
     * Get API configuration
     * @returns {Object} Current configuration
     */
    const getConfig = () => {
        return { ...config };
    }

    // ==================== API ERROR CLASS ====================
    
    /**
     * API Error class
     */
    class APIError extends Error {
        constructor(message, status, data = {}) {
            super(message);
            this.name = 'APIError';
            this.status = status;
            this.data = data;
        }
    }

    // ==================== EXPORT ====================
    
    window.API = {
        // Constants
        ENDPOINTS,
        HTTP_STATUS,
        API_VERSION,
        
        // Initialization
        initialize,
        
        // HTTP Client
        request,
        
        // Authentication
        login,
        logout,
        refreshAccessToken,
        verifyToken,
        
        // Users
        getUsers,
        getUser,
        createUser,
        updateUser,
        deleteUser,
        
        // Content
        getContent,
        getContentById,
        createContent,
        updateContent,
        deleteContent,
        
        // Analytics
        getAnalyticsSessions,
        getAnalyticsChapters,
        getAnalyticsActions,
        getAnalyticsDaily,
        exportAnalytics,
        
        // Utility
        getRateLimitStatus,
        updateConfig,
        getConfig,
        
        // Error Class
        APIError
    };

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();