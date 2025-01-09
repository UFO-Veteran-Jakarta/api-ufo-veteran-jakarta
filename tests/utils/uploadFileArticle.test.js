const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { uploadFileArticle } = require('../../src/utils/uploadFileArticle');

jest.mock('fs');
jest.mock('crypto');

describe('uploadFileArticle', () => {
  const fileMock = {
    name: 'testfile.jpg',
    data: Buffer.from('file content'),
  };

  const uploadDir = './public/images/articles/';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return null if no file is provided in cover', async () => {
    const result = await uploadFileArticle(null, 'cover');
    expect(result).toBeNull();
  });

  test('should return null if no file is provided in cover landscape', async () => {
    const result = await uploadFileArticle(null, 'cover_landscape');
    expect(result).toBeNull();
  });

  test('should create upload cover directory if it does not exist', async () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation();

    await uploadFileArticle(fileMock, 'cover');

    expect(fs.existsSync).toHaveBeenCalledWith(uploadDir + 'cover');
    expect(fs.mkdirSync).toHaveBeenCalledWith(uploadDir + 'cover', { recursive: true });
  });

  test('should create upload cover_landscape directory if it does not exist', async () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation();

    await uploadFileArticle(fileMock, 'cover_landscape');

    expect(fs.existsSync).toHaveBeenCalledWith(uploadDir + 'cover_landscape');
    expect(fs.mkdirSync).toHaveBeenCalledWith(uploadDir + 'cover_landscape', { recursive: true });
  });

  test('should not create upload cover directory if it already exists', async () => {
    fs.existsSync.mockReturnValue(true);
    
    await uploadFileArticle(fileMock, 'cover');

    expect(fs.existsSync).toHaveBeenCalledWith(uploadDir + 'cover');
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  test('should not create upload cover_landscape directory if it already exists', async () => {
    fs.existsSync.mockReturnValue(true);
    
    await uploadFileArticle(fileMock, 'cover_landscape');

    expect(fs.existsSync).toHaveBeenCalledWith(uploadDir + 'cover_landscape');
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  test(
    'should generate a random filename and write the file to the correct path',
    async () => {
      fs.existsSync.mockReturnValue(true);
      fs.writeFileSync.mockImplementation(() => {});

      crypto.randomInt.mockImplementation((max) => Math.floor(max / 2));

      const result = await uploadFileArticle(fileMock, 'cover');

      const ext = path.extname(fileMock.name);
      const generatedFilename = result.split('/').pop();

      expect(generatedFilename.length).toBe(16 + ext.length);
      expect(fs.writeFileSync)
        .toHaveBeenCalledWith(path.join(uploadDir, 'cover', '/', generatedFilename), fileMock.data);
  });

  test(
    'should generate a random filename and write the file to the correct path',
    async () => {
      fs.existsSync.mockReturnValue(true);
      fs.writeFileSync.mockImplementation(() => {});

      crypto.randomInt.mockImplementation((max) => Math.floor(max / 2));

      const result = await uploadFileArticle(fileMock, 'cover_landscape');

      const ext = path.extname(fileMock.name);
      const generatedFilename = result.split('/').pop();

      expect(generatedFilename.length).toBe(16 + ext.length);
      expect(fs.writeFileSync)
        .toHaveBeenCalledWith(path.join(uploadDir, 'cover_landscape', '/', generatedFilename), fileMock.data);
  });

  test('should return the correct file path after upload', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.writeFileSync.mockImplementation(() => {});

    const result = await uploadFileArticle(fileMock, 'cover');

    expect(result).toMatch(/^\/images\/articles\/cover\/[a-zA-Z0-9]+\.jpg$/);
  });
  
  test('should return the correct file path after upload', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.writeFileSync.mockImplementation(() => {});

    const result = await uploadFileArticle(fileMock, 'cover_landscape');

    expect(result).toMatch(/^\/images\/articles\/cover_landscape\/[a-zA-Z0-9]+\.jpg$/);
  });
  
});