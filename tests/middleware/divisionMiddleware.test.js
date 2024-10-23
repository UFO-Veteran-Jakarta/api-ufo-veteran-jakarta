const path = require('path');
const fs = require('fs');
const {
  checkFileDivision,
  checkUpdatedFileDivision,
} = require('../../src/middlewares/divisionMiddlewareFile');

jest.mock('fs');

describe('File Division Middleware Tests', () => {

  const createMockData = ({
    hasFiles = true,
    fileName = 'test.webp',
    fileSize = 300 * 1024,
  } = {}) => ({
    req: {
      files: hasFiles
        ? {
            image: {
              name: fileName,
              size: fileSize,
            },
          }
        : {},
    },
    res: {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    },
    next: jest.fn(),
  });

  const validateErrorResponse = (
    mockData,
    { expectedStatus, expectedMessage, shouldCallNext = false },
  ) => {
    expect(mockData.res.status).toHaveBeenCalledWith(expectedStatus);
    expect(mockData.res.json).toHaveBeenCalledWith({
      status: expectedStatus,
      message: expectedMessage,
    });
    if (shouldCallNext) {
      expect(mockData.next).toHaveBeenCalled();
    } else {
      expect(mockData.next).not.toHaveBeenCalled();
    }
  };

  const validateSuccessResponse = (
    mockData,
    { shouldCreateDirectory = true, directoryExists = false },
  ) => {
    if (shouldCreateDirectory && !directoryExists) {
      expect(fs.mkdirSync).toHaveBeenCalledWith('./public/images/divisions/', {
        recursive: true,
      });
    } else {
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    }
    expect(mockData.next).toHaveBeenCalled();
    expect(mockData.res.status).not.toHaveBeenCalled();
    expect(mockData.res.json).not.toHaveBeenCalled();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(false);
  });

  describe('checkFileDivision', () => {
    test('returns 400 when no image is provided', () => {
      const mockData = createMockData({ hasFiles: false });
      checkFileDivision(mockData.req, mockData.res, mockData.next);
      validateErrorResponse(mockData, {
        expectedStatus: 400,
        expectedMessage: 'Image is required.',
      });
    });

    test('returns 413 when image size exceeds limit', () => {
      const mockData = createMockData({ fileSize: 600 * 1024 });
      checkFileDivision(mockData.req, mockData.res, mockData.next);
      validateErrorResponse(mockData, {
        expectedStatus: 413,
        expectedMessage: 'Image size is more than 500 KB.',
      });
    });

    test('returns 413 when image format is invalid', () => {
      const mockData = createMockData({ fileName: 'test.jpg' });
      checkFileDivision(mockData.req, mockData.res, mockData.next);
      validateErrorResponse(mockData, {
        expectedStatus: 413,
        expectedMessage: 'Image must be in WEBP Format.',
      });
    });

    test('succeeds with valid image when directory needs creation', () => {
      const mockData = createMockData();
      checkFileDivision(mockData.req, mockData.res, mockData.next);
      validateSuccessResponse(mockData, {
        shouldCreateDirectory: true,
        directoryExists: false,
      });
    });

    test('succeeds with valid image when directory exists', () => {
      fs.existsSync.mockReturnValue(true);
      const mockData = createMockData();
      checkFileDivision(mockData.req, mockData.res, mockData.next);
      validateSuccessResponse(mockData, {
        shouldCreateDirectory: false,
        directoryExists: true,
      });
    });
  });

  describe('checkUpdatedFileDivision', () => {
    test('calls next when no image is provided', () => {
      const mockData = createMockData({ hasFiles: false });
      checkUpdatedFileDivision(mockData.req, mockData.res, mockData.next);
      validateSuccessResponse(mockData, {
        shouldCreateDirectory: false,
      });
    });

    test('returns 413 when image size exceeds limit', () => {
      const mockData = createMockData({ fileSize: 600 * 1024 });
      checkUpdatedFileDivision(mockData.req, mockData.res, mockData.next);
      validateErrorResponse(mockData, {
        expectedStatus: 413,
        expectedMessage: 'Image size is more than 500 KB.',
      });
    });

    test('returns 415 when image format is invalid', () => {
      const mockData = createMockData({ fileName: 'test.jpg' });
      checkUpdatedFileDivision(mockData.req, mockData.res, mockData.next);
      validateErrorResponse(mockData, {
        expectedStatus: 415,
        expectedMessage: 'Image must be in WEBP Format.',
      });
    });

    test('succeeds with valid image', () => {
      const mockData = createMockData();
      checkUpdatedFileDivision(mockData.req, mockData.res, mockData.next);
      validateSuccessResponse(mockData, {
        shouldCreateDirectory: true,
      });
    });

    test('succeeds with valid image when directory exists', () => {
      fs.existsSync.mockReturnValue(true);
      const mockData = createMockData();
      checkUpdatedFileDivision(mockData.req, mockData.res, mockData.next);
      validateSuccessResponse(mockData, {
        shouldCreateDirectory: false,
        directoryExists: true,
      });
    });
  });
});
