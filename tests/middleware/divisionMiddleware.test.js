const request = require('supertest');
const path = require('path');
const fs = require('fs');
const {
  checkFileDivision,
  checkUpdatedFileDivision,
} = require('../../src/middlewares/divisionMiddlewareFile');

const express = require('express');
const app = express();

const mockNext = jest.fn();
let mockResponse;

beforeEach(() => {
  mockNext.mockClear();
  mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
});

describe('checkFileDivision Middleware', () => {
  test('should return 400 when no image is provided', async () => {
    const mockRequest = {
      files: {},
    };

    await checkFileDivision(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: 'Image is required.',
    });
  });

  test('should return 413 when image size exceeds maxSize', async () => {
    const mockRequest = {
      files: {
        image: {
          size: 600 * 1024,
          name: 'test.webp',
        },
      },
    };

    await checkFileDivision(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(413);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 413,
      message: 'Image size is more than 500 KB.',
    });
  });

  test('should return 413 when image is not in WEBP format', async () => {
    const mockRequest = {
      files: {
        image: {
          size: 300 * 1024,
          name: 'test.jpg',
        },
      },
    };

    await checkFileDivision(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(413);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 413,
      message: 'Image must be in WEBP Format.',
    });
  });

  test('should create upload directory if it does not exist', async () => {
    const mockRequest = {
      files: {
        image: {
          size: 300 * 1024,
          name: 'test.webp',
        },
      },
    };

    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    const mkdirSyncMock = jest
      .spyOn(fs, 'mkdirSync')
      .mockImplementation(() => {});

    await checkFileDivision(mockRequest, mockResponse, mockNext);

    expect(mkdirSyncMock).toHaveBeenCalledWith('./public/images/divisions/', {
      recursive: true,
    });
    expect(mockNext).toHaveBeenCalled();

    mkdirSyncMock.mockRestore();
  });

  test('should call next() when all validations pass', async () => {
    const mockRequest = {
      files: {
        image: {
          size: 300 * 1024,
          name: 'test.webp',
        },
      },
    };

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    await checkFileDivision(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});

describe('checkUpdatedFileDivision Middleware', () => {
  test('should call next() when no image is provided', async () => {
    const mockRequest = {
      files: {},
    };

    await checkUpdatedFileDivision(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  test('should return 413 when updated image size exceeds maxSize', async () => {
    const mockRequest = {
      files: {
        image: {
          size: 600 * 1024,
          name: 'test.webp',
        },
      },
    };

    await checkUpdatedFileDivision(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(413);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 413,
      message: 'Image size is more than 500 KB.',
    });
  });

  test('should return 413 when updated image is not in WEBP format', async () => {
    const mockRequest = {
      files: {
        image: {
          size: 300 * 1024,
          name: 'test.jpg',
        },
      },
    };

    await checkUpdatedFileDivision(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(415);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 415,
      message: 'Image must be in WEBP Format.',
    });
  });

  test('should create upload directory if it does not exist for update', async () => {
    const mockRequest = {
      files: {
        image: {
          size: 300 * 1024,
          name: 'test.webp',
        },
      },
    };

    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    const mkdirSyncMock = jest
      .spyOn(fs, 'mkdirSync')
      .mockImplementation(() => {});

    await checkUpdatedFileDivision(mockRequest, mockResponse, mockNext);

    expect(mkdirSyncMock).toHaveBeenCalledWith('./public/images/divisions/', {
      recursive: true,
    });
    expect(mockNext).toHaveBeenCalled();

    mkdirSyncMock.mockRestore();
  });
});
