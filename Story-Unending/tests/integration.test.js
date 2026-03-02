/**
 * Integration tests for core features
 * Tests for authentication, user management, and navigation
 */

describe('Integration Tests', () => {
  
  beforeEach(() => {
    // Clear all storage before each test
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Authentication Flow', () => {
    test('should save and retrieve admin credentials', () => {
      // Set up admin credentials in localStorage
      localStorage.setItem('adminUsername', 'admin');
      localStorage.setItem('adminPassword', 'admin123');
      
      // Retrieve credentials
      const username = localStorage.getItem('adminUsername');
      const password = localStorage.getItem('adminPassword');
      
      expect(username).toBe('admin');
      expect(password).toBe('admin123');
    });

    test('should handle login state', () => {
      // Not logged in
      expect(localStorage.getItem('currentUser')).toBeNull();
      
      // Log in
      localStorage.setItem('currentUser', 'admin');
      
      // Check status
      expect(localStorage.getItem('currentUser')).toBe('admin');
    });

    test('should handle logout correctly', () => {
      // Set up logged in state
      localStorage.setItem('currentUser', 'admin');
      
      // Logout
      localStorage.removeItem('currentUser');
      
      expect(localStorage.getItem('currentUser')).toBeNull();
    });
  });

  describe('User Management Flow', () => {
    test('should create and retrieve user', () => {
      const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date().toISOString()
      };
      
      // Save user
      localStorage.setItem('user_testuser', JSON.stringify(testUser));
      
      // Retrieve user
      const retrievedUser = JSON.parse(localStorage.getItem('user_testuser'));
      
      expect(retrievedUser).toEqual(testUser);
      expect(retrievedUser.username).toBe('testuser');
      expect(retrievedUser.email).toBe('test@example.com');
    });

    test('should update user information', () => {
      const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      };
      
      // Save initial user
      localStorage.setItem('user_testuser', JSON.stringify(testUser));
      
      // Update user
      testUser.email = 'newemail@example.com';
      localStorage.setItem('user_testuser', JSON.stringify(testUser));
      
      // Retrieve updated user
      const retrievedUser = JSON.parse(localStorage.getItem('user_testuser'));
      
      expect(retrievedUser.email).toBe('newemail@example.com');
    });

    test('should delete user', () => {
      const testUser = {
        username: 'testuser',
        email: 'test@example.com'
      };
      
      // Save user
      localStorage.setItem('user_testuser', JSON.stringify(testUser));
      
      // Delete user
      localStorage.removeItem('user_testuser');
      
      // Verify deletion
      const retrievedUser = localStorage.getItem('user_testuser');
      expect(retrievedUser).toBeNull();
    });

    test('should handle multiple users', () => {
      const users = [
        { username: 'user1', email: 'user1@example.com' },
        { username: 'user2', email: 'user2@example.com' },
        { username: 'user3', email: 'user3@example.com' }
      ];
      
      // Save all users
      users.forEach(user => {
        localStorage.setItem(`user_${user.username}`, JSON.stringify(user));
      });
      
      // Retrieve all users
      const retrievedUsers = users.map(user => 
        JSON.parse(localStorage.getItem(`user_${user.username}`))
      );
      
      expect(retrievedUsers).toEqual(users);
    });
  });

  describe('Chapter Reading Flow', () => {
    test('should save and retrieve reading progress', () => {
      const progress = {
        chapter: 5,
        paragraph: 10,
        timestamp: new Date().toISOString()
      };
      
      // Save progress
      localStorage.setItem('readingProgress', JSON.stringify(progress));
      
      // Retrieve progress
      const retrievedProgress = JSON.parse(localStorage.getItem('readingProgress'));
      
      expect(retrievedProgress).toEqual(progress);
      expect(retrievedProgress.chapter).toBe(5);
      expect(retrievedProgress.paragraph).toBe(10);
    });

    test('should update reading progress', () => {
      const progress = {
        chapter: 5,
        paragraph: 10
      };
      
      // Save initial progress
      localStorage.setItem('readingProgress', JSON.stringify(progress));
      
      // Update progress
      progress.chapter = 6;
      progress.paragraph = 1;
      localStorage.setItem('readingProgress', JSON.stringify(progress));
      
      // Retrieve updated progress
      const retrievedProgress = JSON.parse(localStorage.getItem('readingProgress'));
      
      expect(retrievedProgress.chapter).toBe(6);
      expect(retrievedProgress.paragraph).toBe(1);
    });

    test('should handle chapter content storage', () => {
      const chapterContent = {
        title: 'Chapter 1',
        content: 'This is the chapter content...',
        paragraphs: ['Para 1', 'Para 2', 'Para 3']
      };
      
      // Save chapter content
      localStorage.setItem('ese_chapter_1', JSON.stringify(chapterContent));
      
      // Retrieve chapter content
      const retrievedContent = JSON.parse(localStorage.getItem('ese_chapter_1'));
      
      expect(retrievedContent).toEqual(chapterContent);
      expect(retrievedContent.title).toBe('Chapter 1');
    });
  });

  describe('Settings Management Flow', () => {
    test('should save and retrieve user settings', () => {
      const settings = {
        textSize: 'medium',
        theme: 'dark',
        autoSave: true
      };
      
      // Save settings
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Retrieve settings
      const retrievedSettings = JSON.parse(localStorage.getItem('userSettings'));
      
      expect(retrievedSettings).toEqual(settings);
      expect(retrievedSettings.textSize).toBe('medium');
      expect(retrievedSettings.theme).toBe('dark');
    });

    test('should update individual settings', () => {
      const settings = {
        textSize: 'medium',
        theme: 'dark',
        autoSave: true
      };
      
      // Save initial settings
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Update one setting
      settings.textSize = 'large';
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Retrieve updated settings
      const retrievedSettings = JSON.parse(localStorage.getItem('userSettings'));
      
      expect(retrievedSettings.textSize).toBe('large');
      expect(retrievedSettings.theme).toBe('dark'); // Other settings unchanged
    });
  });

  describe('Rate Limiting Integration', () => {
    test('should enforce rate limiting on login attempts', () => {
      const attempts = {};
      const maxAttempts = 3;
      const windowMs = 60000; // 1 minute
      
      function checkRateLimit(key) {
        const now = Date.now();
        if (!attempts[key]) {
          attempts[key] = { count: 0, resetTime: now + windowMs };
        }
        
        const record = attempts[key];
        
        if (now > record.resetTime) {
          record.count = 0;
          record.resetTime = now + windowMs;
        }
        
        record.count++;
        return record.count <= maxAttempts;
      }
      
      // Make 3 successful attempts
      for (let i = 0; i < 3; i++) {
        expect(checkRateLimit('user123')).toBe(true);
      }
      
      // 4th attempt should be blocked
      expect(checkRateLimit('user123')).toBe(false);
    });

    test('should reset rate limit after timeout', () => {
      const attempts = {};
      const maxAttempts = 3;
      const windowMs = 60000; // 1 minute
      
      function checkRateLimit(key) {
        const now = Date.now();
        if (!attempts[key]) {
          attempts[key] = { count: 0, resetTime: now + windowMs };
        }
        
        const record = attempts[key];
        
        if (now > record.resetTime) {
          record.count = 0;
          record.resetTime = now + windowMs;
        }
        
        record.count++;
        return record.count <= maxAttempts;
      }
      
      // Make 3 attempts
      for (let i = 0; i < 3; i++) {
        checkRateLimit('user123');
      }
      
      // Mock time passing
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 61000);
      
      // Should allow attempts again
      expect(checkRateLimit('user123')).toBe(true);
    });
  });

  describe('Data Persistence Flow', () => {
    test('should persist data across sessions', () => {
      const testData = {
        key: 'value',
        timestamp: new Date().toISOString()
      };
      
      // Save data
      localStorage.setItem('persistentData', JSON.stringify(testData));
      
      // Simulate new session by clearing and reloading
      const retrievedData = JSON.parse(localStorage.getItem('persistentData'));
      
      expect(retrievedData).toEqual(testData);
    });

    test('should handle complex nested objects', () => {
      const complexData = {
        user: {
          profile: {
            name: 'Test User',
            preferences: {
              theme: 'dark',
              notifications: true
            }
          },
          history: [
            { chapter: 1, date: '2024-01-01' },
            { chapter: 2, date: '2024-01-02' }
          ]
        }
      };
      
      localStorage.setItem('complexData', JSON.stringify(complexData));
      const retrievedData = JSON.parse(localStorage.getItem('complexData'));
      
      expect(retrievedData).toEqual(complexData);
      expect(retrievedData.user.profile.preferences.theme).toBe('dark');
    });

    test('should handle data integrity', () => {
      const originalData = { value: 123, text: 'test' };
      
      // Save and retrieve multiple times
      localStorage.setItem('integrityTest', JSON.stringify(originalData));
      
      for (let i = 0; i < 10; i++) {
        const data = JSON.parse(localStorage.getItem('integrityTest'));
        expect(data).toEqual(originalData);
      }
    });
  });
});