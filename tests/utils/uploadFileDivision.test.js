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

  test('should return null if no file is provided', async () => {
    const result = await uploadFileDivision(null);
    expect(result).toBeNull();
  });

  test('should create upload directory if it does not exist', async () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation();

    await uploadFileDivision(fileMock);

    expect(fs.existsSync).toHaveBeenCalledWith(uploadDir);
    expect(fs.mkdirSync).toHaveBeenCalledWith(uploadDir, { recursive: true });
  });

  test('should not create upload directory if it already exists', async () => {
    fs.existsSync.mockReturnValue(true);
    
    await uploadFileDivision(fileMock);

    expect(fs.existsSync).toHaveBeenCalledWith(uploadDir);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  test(
    'should generate a random filename and write the file to the correct path',
    async () => {
      fs.existsSync.mockReturnValue(true);
      fs.writeFileSync.mockImplementation(() => {});

      crypto.randomInt.mockImplementation((max) => Math.floor(max / 2));

      const result = await uploadFileDivision(fileMock);

      const ext = path.extname(fileMock.name);
      const generatedFilename = result.split('/').pop();

      expect(generatedFilename.length).toBe(16 + ext.length);
      expect(fs.writeFileSync)
        .toHaveBeenCalledWith(path.join(uploadDir, generatedFilename), fileMock.data);
  });

  test('should return the correct file path after upload', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.writeFileSync.mockImplementation(() => {});

    const result = await uploadFileDivision(fileMock);

    expect(result).toMatch(/^\/images\/divisions\/[a-zA-Z0-9]+\.jpg$/);
  });
});