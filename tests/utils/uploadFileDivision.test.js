const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { uploadFileDivision } = require('../../src/utils/uploadFileDivision');

jest.mock('fs');
jest.mock('crypto');

describe('uploadFileDivision', () => {
  const fileMock = {
    name: 'testfile.jpg',
    data: Buffer.from('file content'),
  };

  const uploadDir = './public/images/divisions/';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return null if no file is provided', () => {
    const result = uploadFileDivision(null);
    expect(result).toBeNull();
  });

  test('should create upload directory if it does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation();

    uploadFileDivision(fileMock);

    expect(fs.existsSync).toHaveBeenCalledWith(uploadDir);
    expect(fs.mkdirSync).toHaveBeenCalledWith(uploadDir, { recursive: true });
  });

  test('should not create upload directory if it already exists', () => {
    fs.existsSync.mockReturnValue(true);
    
    uploadFileDivision(fileMock);

    expect(fs.existsSync).toHaveBeenCalledWith(uploadDir);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  test('should generate a random filename and write the file to the correct path', () => {
    fs.existsSync.mockReturnValue(true);
    fs.writeFileSync.mockImplementation(() => {});

    crypto.randomInt.mockImplementation((max) => Math.floor(max / 2));

    const result = uploadFileDivision(fileMock);

    const ext = path.extname(fileMock.name);
    const generatedFilename = result.split('/').pop();

    expect(generatedFilename.length).toBe(16 + ext.length);
    expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(uploadDir, generatedFilename), fileMock.data);
  });

  test('should return the correct file path after upload', () => {
    fs.existsSync.mockReturnValue(true);
    fs.writeFileSync.mockImplementation(() => {});

    const result = uploadFileDivision(fileMock);

    expect(result).toMatch(/^\/images\/divisions\/[a-zA-Z0-9]+\.jpg$/);
  });
});