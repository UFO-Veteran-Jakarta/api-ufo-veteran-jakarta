const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const uploadFileDivision = require('../../src/utils/uploadFileDivision');

jest.mock('fs');
jest.mock('crypto');

describe('uploadFileDivision', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    fs.existsSync.mockReturnValue(false);

    crypto.randomBytes.mockReturnValue({
      toString: jest.fn().mockReturnValue('mockedRandomstrg'),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should return null if no file is provided', () => {
    const result = uploadFileDivision(null);
    expect(result).toBeNull();
  });

  test('should create upload directory if it does not exist', () => {
    const mockFile = {
      name: 'test.jpg',
      data: Buffer.from('test image data'),
    };

    uploadFileDivision(mockFile);

    expect(fs.mkdirSync).toHaveBeenCalledWith('./public/images/divisions/', {
      recursive: true,
    });
  });

  test('should not create directory if it already exists', () => {
    fs.existsSync.mockReturnValue(true);

    const mockFile = {
      name: 'test.jpg',
      data: Buffer.from('test image data'),
    };

    uploadFileDivision(mockFile);

    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  test('should generate correct file path and return proper URL', () => {
    const mockFile = {
      name: 'test.jpg',
      data: Buffer.from('test image data'),
    };

    const result = uploadFileDivision(mockFile);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('mockedRandomstrg.jpg'),
      mockFile.data,
    );

    expect(result).toMatch(/^\/images\/divisions\/mockedRandomstrg\.jpg$/);
  });

  test('should handle different file extensions correctly', () => {
    const testCases = [
      { name: 'test.png', expectedExt: '.png' },
      { name: 'test.jpeg', expectedExt: '.jpeg' },
      { name: 'test.gif', expectedExt: '.gif' },
    ];

    testCases.forEach(({ name, expectedExt }) => {
      const mockFile = {
        name,
        data: Buffer.from('test image data'),
      };

      const result = uploadFileDivision(mockFile);

      expect(result).toMatch(new RegExp(`/images/divisions/mockedRandomstrg${expectedExt}`));
    });
  });

  test('should handle write errors', () => {
    const mockFile = {
      name: 'test.jpg',
      data: Buffer.from('test image data'),
    };

    fs.writeFileSync.mockImplementation(() => {
      throw new Error('Write error');
    });

    expect(() => {
      uploadFileDivision(mockFile);
    }).toThrow('Write error');
  });

  test('should sanitize random filename correctly', () => {
    crypto.randomBytes.mockReturnValue({
      toString: jest.fn().mockReturnValue('abc+/def=='),
    });

    const mockFile = {
      name: 'test.jpg',
      data: Buffer.from('test image data'),
    };

    const result = uploadFileDivision(mockFile);

    expect(result).not.toMatch(/[+=]/);
    expect(result).toMatch(/^\/images\/divisions\/[A-Za-z0-9]+\.jpg$/);
  });
});
