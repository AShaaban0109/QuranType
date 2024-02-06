import utils from './utils.js';
  
  // Example test suite
  describe('Test convertToArabicNumber function', () => {
    test('convertToArabicNumber should convert English numbers to Arabic', () => {
      expect(utils.convertToArabicNumber('123')).toEqual('١٢٣');
      expect(utils.convertToArabicNumber('456')).toEqual('٤٥٦');
    });
  });
  
  // Add more test suites for other functions
  
  // Run your tests using Jest
  