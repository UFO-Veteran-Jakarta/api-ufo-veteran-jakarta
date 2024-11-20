const fs = require('fs');
const crypto = require('crypto');
const fileUpload = require('../../src/utils/fileUpload');
const {
  validateMaxSize,
  validateFileType,
} = require('../../src/utils/uploadFileValidate');

// Mock all required modules
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn(),
  createWriteStream: jest.fn(),
  promises: {
    writeFile: jest.fn(),
  },
}));
jest.mock('crypto');
jest.mock('../../src/config/filesystem');
jest.mock('../../src/utils/uploadFileValidate');

describe('File Upload Utility', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Default validation mocks
    validateMaxSize.mockReturnValue(1000);
    validateFileType.mockReturnValue('.jpg');

    // Mock crypto.randomInt to return predictable values
    crypto.randomInt.mockImplementation((max) => Math.floor(max / 2));
  });

  describe('getUploadFilepath', () => {
    it('should generate a valid file path with correct extension', async () => {
      const mockFile = {
        name: 'test.jpg',
        size: 1000,
      };

      const filepath = await fileUpload.getUploadFilepath(mockFile, 'users');

      expect(filepath).toMatch(/^\/images\/users\/[A-Za-z0-9]{16}\.jpg$/);
      expect(validateMaxSize).toHaveBeenCalledWith(mockFile.size);
      expect(validateFileType).toHaveBeenCalledWith(mockFile.name);
    });

    it('should throw error if file validation fails', async () => {
      validateMaxSize.mockImplementation(() => {
        throw new Error('File too large');
      });

      const mockFile = {
        name: 'test.jpg',
        size: 150 * 1024 * 1024,
      };

      await expect(
        fileUpload.getUploadFilepath(mockFile, 'users'),
      ).rejects.toThrow('File too large');
    });

    it('should reject invalid file types', async () => {
      validateFileType.mockImplementation(() => {
        throw new Error('Invalid file type');
      });

      const mockFile = {
        name: 'test.pdf',
        size: 1000,
      };

      await expect(
        fileUpload.getUploadFilepath(mockFile, 'users'),
      ).rejects.toThrow('Invalid file type');
    });
  });

  describe('uploadFile', () => {
    it('should successfully upload a small file (< 16MB)', async () => {
      const mockFile = {
        name: 'test.jpg',
        size: 10 * 1024 * 1024,
        data: Buffer.from('test data'),
      };

      fs.existsSync.mockReturnValue(true);

      const filepath = await fileUpload.uploadFile(mockFile, 'users');

      expect(filepath).toMatch(/^\/images\/users\/[A-Za-z0-9]{16}\.jpg$/);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });


    it('should create directory if it does not exist', async () => {
      const mockFile = {
        name: 'test.jpg',
        size: 1000,
        data: Buffer.from('test data'),
      };

      fs.existsSync.mockReturnValue(false);

      await fileUpload.uploadFile(mockFile, 'users');

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringMatching(/public[/\\]images[/\\]users/),
        { recursive: true },
      );
    });

    it('should return null if no file is provided', async () => {
      const result = await fileUpload.uploadFile(null, 'users');
      expect(result).toBeNull();
    });

    it('should handle different allowed file types', async () => {
      const testFileTypes = ['webp', 'png', 'jpg', 'jpeg'];

      for (const type of testFileTypes) {
        validateFileType.mockReturnValue(`.${type}`);

        const mockFile = {
          name: `test.${type}`,
          size: 1000,
          data: Buffer.from('test data'),
        };

        fs.existsSync.mockReturnValue(true);

        const filepath = await fileUpload.uploadFile(mockFile, 'users');
        expect(filepath).toMatch(new RegExp(`\\.${type}$`));
      }
    });
  });

  describe('updateFile', () => {
    it('should successfully update a file', async () => {
      const oldPath = '/images/users/old.jpg';
      const newPath = '/images/users/new.jpg';
      const data = Buffer.from('new data');

      fs.existsSync.mockReturnValue(true);
      fs.promises.writeFile.mockResolvedValue(undefined);

      await fileUpload.updateFile(oldPath, newPath, data);

      expect(fs.unlinkSync).toHaveBeenCalledWith(
        expect.stringMatching(/public[/\\]images[/\\]users[/\\]old\.jpg$/),
      );
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/public[/\\]images[/\\]users[/\\]new\.jpg$/),
        data,
      );
    });

    it('should handle errors during file update', async () => {
      const oldPath = '/images/users/old.jpg';
      const newPath = '/images/users/new.jpg';
      const data = Buffer.from('new data');

      fs.promises.writeFile.mockRejectedValue(new Error('Update failed'));

      await expect(
        fileUpload.updateFile(oldPath, newPath, data),
      ).rejects.toThrow('Failed to update file: Update failed');
    });

    it('should handle non-existent old file during update', async () => {
      const oldPath = '/images/users/old.jpg';
      const newPath = '/images/users/new.jpg';
      const data = Buffer.from('new data');

      fs.existsSync.mockReturnValue(false);
      fs.promises.writeFile.mockResolvedValue(undefined);

      await fileUpload.updateFile(oldPath, newPath, data);

      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/public[/\\]images[/\\]users[/\\]new\.jpg$/),
        data,
      );
    });
  });
});
