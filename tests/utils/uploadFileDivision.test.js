const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const uploadFileDivision = require('../../src/utils/uploadFileDivision');

jest.mock('fs');
jest.mock('crypto');
jest.mock('path');

// Reusable mock data
const mockBuffer = Buffer.alloc(10);
const mockExtensions = ['.jpg', '.png', '.gif'];
const mockRandomString = 'Ab1DefGhIjKlMnOp';

describe('uploadFileDivision', () => {
  beforeAll(() => {
    path.join.mockImplementation((dir, file) => `${dir}${file}`);
    path.extname.mockImplementation((filename) => {
      const ext = filename.slice(filename.lastIndexOf('.'));
      return ext;
    });

    crypto.randomBytes.mockReturnValue({
      toString: () => mockRandomString,
    });
  });

  beforeEach(() => {
    fs.existsSync.mockReset().mockReturnValue(false);
    fs.mkdirSync.mockReset().mockImplementation(() => {});
    fs.writeFileSync.mockReset().mockImplementation(() => {});
  });

  afterAll(() => {
    jest.resetModules();
    if (global.gc) global.gc();
  });

  test('should return null if no file is provided', () => {
    expect(uploadFileDivision(null)).toBeNull();
  });

  test('should handle directory creation and file writing', () => {
    const mockFile = {
      name: 'test.jpg',
      data: mockBuffer,
    };

    const result = uploadFileDivision(mockFile);

    expect(fs.mkdirSync).toHaveBeenCalledWith('./public/images/divisions/', {
      recursive: true,
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(mockRandomString),
      mockBuffer,
    );
    expect(result).toMatch(/^\/images\/divisions\/[A-Za-z0-9]{16}\.jpg$/);
  });

  test('should handle different file extensions', () => {
    mockExtensions.forEach((ext) => {
      const mockFile = {
        name: `test${ext}`,
        data: mockBuffer,
      };

      const result = uploadFileDivision(mockFile);
      expect(result).toMatch(new RegExp(`${mockRandomString}\\${ext}$`));
    });
  });

  test('should handle write errors', () => {
    const errorMessage = 'Write error';
    fs.writeFileSync.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    expect(() => {
      uploadFileDivision({
        name: 'test.jpg',
        data: mockBuffer,
      });
    }).toThrow(errorMessage);
  });
});
