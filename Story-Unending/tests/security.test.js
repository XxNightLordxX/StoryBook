/**
 * Unit tests for security functions
 * Tests for RateLimiter, Validator, ErrorHandler, and sanitization functions
 */

// Mock the global functions and objects that are defined in security.js
const mockSecurity = {
  sanitizeHTML: function(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },
  
  sanitizeAttribute: function(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
  
  RateLimiter: {
    attempts: {},
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    
    check(key) {
      const now = Date.now();
      if (!this.attempts[key]) {
        this.attempts[key] = { count: 0, resetTime: now + this.windowMs };
      }
      
      const record = this.attempts[key];
      
      if (now > record.resetTime) {
        record.count = 0;
        record.resetTime = now + this.windowMs;
      }
      
      record.count++;
      return record.count <= this.maxAttempts;
    },
    
    getRemainingAttempts(key) {
      const record = this.attempts[key];
      if (!record) return this.maxAttempts;
      const now = Date.now();
      if (now > record.resetTime) return this.maxAttempts;
      return Math.max(0, this.maxAttempts - record.count);
    },
    
    getResetTime(key) {
      const record = this.attempts[key];
      if (!record) return 0;
      return record.resetTime;
    },
    
    reset(key) {
      delete this.attempts[key];
    }
  },
  
  Validator: {
    patterns: {
      username: /^[a-zA-Z0-9_]{3,20}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      password: /^.{6,100}$/,
      chapterTitle: /^.{1,100}$/,
      text: /^.{1,10000}$/
    },
    
    validate(type, value) {
      const pattern = this.patterns[type];
      if (!pattern) return { valid: true, error: null };
      
      if (!value || value.trim() === '') {
        return { valid: false, error: `${type} cannot be empty` };
      }
      
      if (!pattern.test(value)) {
        const messages = {
          username: 'Username must be 3-20 characters (letters, numbers, underscores only)',
          email: 'Please enter a valid email address',
          password: 'Password must be at least 6 characters',
          chapterTitle: 'Title must be 1-100 characters',
          text: 'Text must be 1-10000 characters'
        };
        return { valid: false, error: messages[type] || 'Invalid input' };
      }
      
      return { valid: true, error: null };
    },
    
    sanitizeAndValidate(type, value) {
      const sanitized = mockSecurity.sanitizeHTML(value.trim());
      const validation = this.validate(type, sanitized);
      return {
        sanitized,
        valid: validation.valid,
        error: validation.error
      };
    }
  },
  
  ErrorHandler: {
    handle(error, context = 'Operation') {
      console.error(`[${context}] Error:`, error);
    },
    
    safeExecute(fn, context = 'Operation', fallback = null) {
      try {
        return fn();
      } catch (error) {
        this.handle(error, context);
        return fallback;
      }
    },
    
    async safeExecuteAsync(fn, context = 'Operation', fallback = null) {
      try {
        return await fn();
      } catch (error) {
        this.handle(error, context);
        return fallback;
      }
    }
  }
};

describe('Security Functions', () => {
  
  describe('sanitizeHTML', () => {
    test('should escape HTML tags', () => {
      const input = '<script>alert("xss")</script>';
      const result = mockSecurity.sanitizeHTML(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    test('should handle empty strings', () => {
      const result = mockSecurity.sanitizeHTML('');
      expect(result).toBe('');
    });

    test('should handle null and undefined', () => {
      expect(mockSecurity.sanitizeHTML(null)).toBe(null);
      expect(mockSecurity.sanitizeHTML(undefined)).toBe(undefined);
    });

    test('should escape multiple HTML entities', () => {
      const input = '<div>&"\'</div>';
      const result = mockSecurity.sanitizeHTML(input);
      expect(result).toContain('&lt;div&gt;');
      expect(result).toContain('&amp;');
      expect(result).toContain('&quot;');
      expect(result).toContain('&#39;');
    });

    test('should preserve safe text', () => {
      const input = 'Hello, World!';
      const result = mockSecurity.sanitizeHTML(input);
      expect(result).toBe('Hello, World!');
    });
  });

  describe('sanitizeAttribute', () => {
    test('should escape quotes in attributes', () => {
      const input = 'onclick="alert(1)"';
      const result = mockSecurity.sanitizeAttribute(input);
      expect(result).toContain('&quot;');
      expect(result).not.toContain('"');
    });

    test('should handle empty strings', () => {
      const result = mockSecurity.sanitizeAttribute('');
      expect(result).toBe('');
    });

    test('should escape single quotes', () => {
      const input = "onclick='alert(1)'";
      const result = mockSecurity.sanitizeAttribute(input);
      expect(result).toContain('&#39;');
      expect(result).not.toContain("'");
    });
  });

  describe('RateLimiter', () => {
    let rateLimiter;

    beforeEach(() => {
      rateLimiter = {
        attempts: {},
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000,
        check: mockSecurity.RateLimiter.check.bind(mockSecurity.RateLimiter),
        getRemainingAttempts: mockSecurity.RateLimiter.getRemainingAttempts.bind(mockSecurity.RateLimiter),
        getResetTime: mockSecurity.RateLimiter.getResetTime.bind(mockSecurity.RateLimiter),
        reset: mockSecurity.RateLimiter.reset.bind(mockSecurity.RateLimiter)
      };
      mockSecurity.RateLimiter.attempts = {};
    });

    test('should allow attempts within limit', () => {
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.check('test')).toBe(true);
      }
    });

    test('should block attempts after limit exceeded', () => {
      for (let i = 0; i < 5; i++) {
        rateLimiter.check('test');
      }
      expect(rateLimiter.check('test')).toBe(false);
    });

    test('should return correct remaining attempts', () => {
      expect(rateLimiter.getRemainingAttempts('test')).toBe(5);
      rateLimiter.check('test');
      expect(rateLimiter.getRemainingAttempts('test')).toBe(4);
      rateLimiter.check('test');
      expect(rateLimiter.getRemainingAttempts('test')).toBe(3);
    });

    test('should return correct reset time', () => {
      rateLimiter.check('test');
      const resetTime = rateLimiter.getResetTime('test');
      expect(resetTime).toBeGreaterThan(Date.now());
      expect(resetTime).toBeLessThanOrEqual(Date.now() + 15 * 60 * 1000);
    });

    test('should reset attempts manually', () => {
      for (let i = 0; i < 5; i++) {
        rateLimiter.check('test');
      }
      expect(rateLimiter.check('test')).toBe(false);
      
      rateLimiter.reset('test');
      expect(rateLimiter.check('test')).toBe(true);
      expect(rateLimiter.getRemainingAttempts('test')).toBe(4);
    });
  });

  describe('Validator', () => {
    let validator;

    beforeEach(() => {
      validator = mockSecurity.Validator;
    });

    describe('validate', () => {
      test('should accept valid usernames', () => {
        expect(validator.validate('username', 'user123').valid).toBe(true);
        expect(validator.validate('username', 'JohnDoe').valid).toBe(true);
        expect(validator.validate('username', 'abc').valid).toBe(true);
      });

      test('should reject usernames with special characters', () => {
        expect(validator.validate('username', 'user@123').valid).toBe(false);
        expect(validator.validate('username', 'user-name').valid).toBe(false);
        expect(validator.validate('username', 'user name').valid).toBe(false);
      });

      test('should reject usernames that are too short', () => {
        expect(validator.validate('username', 'ab').valid).toBe(false);
        expect(validator.validate('username', '').valid).toBe(false);
      });

      test('should reject usernames that are too long', () => {
        expect(validator.validate('username', 'a'.repeat(21)).valid).toBe(false);
      });

      test('should accept valid email addresses', () => {
        expect(validator.validate('email', 'user@example.com').valid).toBe(true);
        expect(validator.validate('email', 'test.user@domain.co.uk').valid).toBe(true);
        expect(validator.validate('email', 'user+tag@example.org').valid).toBe(true);
      });

      test('should reject invalid email addresses', () => {
        expect(validator.validate('email', 'user@').valid).toBe(false);
        expect(validator.validate('email', '@example.com').valid).toBe(false);
        expect(validator.validate('email', 'userexample.com').valid).toBe(false);
        expect(validator.validate('email', '').valid).toBe(false);
      });

      test('should accept valid passwords', () => {
        expect(validator.validate('password', 'password123').valid).toBe(true);
        expect(validator.validate('password', 'abc123').valid).toBe(true);
        expect(validator.validate('password', 'a'.repeat(6)).valid).toBe(true);
      });

      test('should reject passwords that are too short', () => {
        expect(validator.validate('password', 'abc').valid).toBe(false);
        expect(validator.validate('password', '').valid).toBe(false);
        expect(validator.validate('password', '12345').valid).toBe(false);
      });
    });
  });

  describe('ErrorHandler', () => {
    let errorHandler;
    let consoleErrorSpy;

    beforeEach(() => {
      errorHandler = mockSecurity.ErrorHandler;
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    test('should handle errors with logging', () => {
      const error = new Error('Test error');
      errorHandler.handle(error, 'Test context');
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('should execute function successfully', () => {
      const fn = () => 'success';
      const result = errorHandler.safeExecute(fn, 'Test operation');
      
      expect(result).toBe('success');
    });

    test('should handle errors gracefully', () => {
      const fn = () => { throw new Error('Test error'); };
      const result = errorHandler.safeExecute(fn, 'Test operation');
      
      expect(result).toBeNull();
    });

    test('should return default value on error', () => {
      const fn = () => { throw new Error('Test error'); };
      const result = errorHandler.safeExecute(fn, 'Test operation', 'default');
      
      expect(result).toBe('default');
    });

    test('should execute async function successfully', async () => {
      const fn = async () => 'success';
      const result = await errorHandler.safeExecuteAsync(fn, 'Test operation');
      
      expect(result).toBe('success');
    });

    test('should handle async errors gracefully', async () => {
      const fn = async () => { throw new Error('Test error'); };
      const result = await errorHandler.safeExecuteAsync(fn, 'Test operation');
      
      expect(result).toBeNull();
    });

    test('should return default value on async error', async () => {
      const fn = async () => { throw new Error('Test error'); };
      const result = await errorHandler.safeExecuteAsync(fn, 'Test operation', 'default');
      
      expect(result).toBe('default');
    });
  });
});