/**
 * Unit tests for storage functions
 * Tests for localStorage and sessionStorage operations
 */

describe('Storage Functions', () => {
  
  beforeEach(() => {
    // Clear all storage before each test
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('localStorage operations', () => {
    test('should save and retrieve string from localStorage', () => {
      localStorage.setItem('testKey', 'testValue');
      const result = localStorage.getItem('testKey');
      expect(result).toBe('testValue');
    });

    test('should save and retrieve object from localStorage', () => {
      const testObj = { name: 'Test', value: 123 };
      localStorage.setItem('testKey', JSON.stringify(testObj));
      const retrieved = JSON.parse(localStorage.getItem('testKey'));
      expect(retrieved).toEqual(testObj);
    });

    test('should save and retrieve array from localStorage', () => {
      const testArray = [1, 2, 3, 4, 5];
      localStorage.setItem('testKey', JSON.stringify(testArray));
      const retrieved = JSON.parse(localStorage.getItem('testKey'));
      expect(retrieved).toEqual(testArray);
    });

    test('should save and retrieve number from localStorage', () => {
      localStorage.setItem('testKey', '42');
      expect(localStorage.getItem('testKey')).toBe('42');
    });

    test('should save and retrieve boolean from localStorage', () => {
      localStorage.setItem('testKey', 'true');
      expect(localStorage.getItem('testKey')).toBe('true');
    });

    test('should return null for non-existent key', () => {
      const result = localStorage.getItem('nonExistentKey');
      expect(result).toBeNull();
    });

    test('should remove item from localStorage', () => {
      localStorage.setItem('testKey', 'testValue');
      localStorage.removeItem('testKey');
      expect(localStorage.getItem('testKey')).toBeNull();
    });

    test('should clear all localStorage items', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');
      
      localStorage.clear();
      
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBeNull();
      expect(localStorage.getItem('key3')).toBeNull();
      expect(localStorage.length).toBe(0);
    });
  });

  describe('sessionStorage operations', () => {
    test('should save and retrieve string from sessionStorage', () => {
      sessionStorage.setItem('testKey', 'testValue');
      const result = sessionStorage.getItem('testKey');
      expect(result).toBe('testValue');
    });

    test('should save and retrieve object from sessionStorage', () => {
      const testObj = { name: 'Test', value: 123 };
      sessionStorage.setItem('testKey', JSON.stringify(testObj));
      const retrieved = JSON.parse(sessionStorage.getItem('testKey'));
      expect(retrieved).toEqual(testObj);
    });

    test('should remove item from sessionStorage', () => {
      sessionStorage.setItem('testKey', 'testValue');
      sessionStorage.removeItem('testKey');
      expect(sessionStorage.getItem('testKey')).toBeNull();
    });

    test('should clear all sessionStorage items', () => {
      sessionStorage.setItem('key1', 'value1');
      sessionStorage.setItem('key2', 'value2');
      
      sessionStorage.clear();
      
      expect(sessionStorage.getItem('key1')).toBeNull();
      expect(sessionStorage.getItem('key2')).toBeNull();
      expect(sessionStorage.length).toBe(0);
    });
  });

  describe('Storage Key Management', () => {
    test('should handle special characters in keys', () => {
      const specialKey = 'test-key.with_special@chars';
      localStorage.setItem(specialKey, 'value');
      expect(localStorage.getItem(specialKey)).toBe('value');
    });

    test('should handle unicode in values', () => {
      const unicodeValue = 'Hello 世界 🌍';
      localStorage.setItem('testKey', unicodeValue);
      expect(localStorage.getItem('testKey')).toBe(unicodeValue);
    });

    test('should handle large objects', () => {
      const largeObj = {};
      for (let i = 0; i < 1000; i++) {
        largeObj[`key${i}`] = `value${i}`;
      }
      localStorage.setItem('testKey', JSON.stringify(largeObj));
      const result = JSON.parse(localStorage.getItem('testKey'));
      expect(result).toEqual(largeObj);
    });
  });

  describe('Error Handling', () => {
    test('should handle corrupted JSON data gracefully', () => {
      localStorage.setItem('testKey', 'invalid json{');
      const result = localStorage.getItem('testKey');
      expect(result).toBe('invalid json{');
    });

    test('should handle empty values', () => {
      localStorage.setItem('testKey', '');
      expect(localStorage.getItem('testKey')).toBe('');
    });

    test('should handle null values', () => {
      localStorage.setItem('testKey', 'null');
      expect(localStorage.getItem('testKey')).toBe('null');
    });
  });

  describe('Storage Persistence', () => {
    test('should maintain data across multiple operations', () => {
      const testData = { key: 'value', timestamp: Date.now() };
      
      localStorage.setItem('persistentData', JSON.stringify(testData));
      
      // Perform other operations
      localStorage.setItem('tempData', 'temp');
      localStorage.removeItem('tempData');
      
      // Verify original data is still there
      const retrievedData = JSON.parse(localStorage.getItem('persistentData'));
      expect(retrievedData).toEqual(testData);
    });

    test('should handle multiple data types simultaneously', () => {
      const stringData = 'test string';
      const numberData = 42;
      const booleanData = true;
      const arrayData = [1, 2, 3];
      const objectData = { name: 'test', value: 123 };
      
      localStorage.setItem('stringKey', stringData);
      localStorage.setItem('numberKey', String(numberData));
      localStorage.setItem('booleanKey', String(booleanData));
      localStorage.setItem('arrayKey', JSON.stringify(arrayData));
      localStorage.setItem('objectKey', JSON.stringify(objectData));
      
      expect(localStorage.getItem('stringKey')).toBe(stringData);
      expect(localStorage.getItem('numberKey')).toBe(String(numberData));
      expect(localStorage.getItem('booleanKey')).toBe(String(booleanData));
      expect(JSON.parse(localStorage.getItem('arrayKey'))).toEqual(arrayData);
      expect(JSON.parse(localStorage.getItem('objectKey'))).toEqual(objectData);
    });
  });
});