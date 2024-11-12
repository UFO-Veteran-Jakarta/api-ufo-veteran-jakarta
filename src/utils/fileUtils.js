const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const filesystem = require('../config/filesystem');

/**
 * Validates the file size against the maximum allowed size.
 *
 * @param {number} size - The size of the file in bytes.
 * @param {number} [maxSize=filesystem.upload.maxSize] - The maximum allowed size in bytes.
 * @throws {Error} If the file size exceeds the maximum limit.
 * @returns {number} The validated file size.
 */
const validateFileSize = (size, maxSize = filesystem.upload.maxSize) => {
  if (size > maxSize) {
    throw new Error(`File size exceeds the maximum limit of ${maxSize} bytes`);
  }
  return size;
};

/**
 * Validates the file type based on its extension.
 *
 * @param {string} fileName - The name of the file.
 * @param {string[]} [allowedTypes=filesystem.upload.allowedFileTypes] - Array of allowed file extensions.
 * @throws {Error} If the file type is not allowed.
 * @returns {string} The validated file extension (with dot).
 */
const validateFileType = (
  fileName,
  allowedTypes = filesystem.upload.allowedFileTypes,
) => {
  const fileType = path.extname(fileName).toLowerCase();
  if (!allowedTypes.includes(fileType.substring(1))) {
    throw new Error(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    );
  }
  return fileType;
};

/**
 * Generates a random filename.
 *
 * @returns {Promise<string>} A promise that resolves to a random filename.
 */
const generateRandomFilename = async () => {
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';

  const upper = upperChars[crypto.randomInt(upperChars.length)];
  const lower = lowerChars[crypto.randomInt(lowerChars.length)];
  const num = numbers[crypto.randomInt(numbers.length)];

  const allChars = upperChars + lowerChars + numbers;
  const remainingLength = 13;

  let remaining = '';
  for (let i = 0; i < remainingLength; i += 1) {
    remaining += allChars[crypto.randomInt(allChars.length)];
  }

  const combined = upper + lower + num + remaining;
  const shuffled = combined
    .split('')
    .map((value) => ({ value, sort: crypto.randomInt(1000000) }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
    .join('');

  return shuffled;
};

/**
 * Gets the full upload file path.
 *
 * @param {Object} file - The file object from the request.
 * @param {string} [uploadDir='/uploads/'] - The upload directory.
 * @returns {Promise<string>} A promise that resolves to the full upload file path.
 */
const getUploadFilepath = async (file, uploadDir = '/uploads/') => {
  validateFileSize(file.size);
  const ext = validateFileType(file.name);

  const randomFilename = (await generateRandomFilename()) + ext;
  return path.join(uploadDir, randomFilename);
};

/**
 * Deletes a file from the filesystem.
 *
 * @param {string} filePath - The path of the file to delete.
 */
const deleteFile = (filePath) => {
  try {
    const fullFilePath = path.join(filesystem.upload.baseDir, filePath);
    if (fs.existsSync(fullFilePath)) {
      fs.unlinkSync(fullFilePath);
      console.log('File deleted successfully:', filePath);
    } else {
      console.warn('File not found, cannot delete:', filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error.message);
  }
};

/**
 * Uploads a file to the local filesystem.
 *
 * @param {Object} file - The file object from the request.
 * @param {string} [uploadDir='/uploads/'] - The upload directory.
 * @returns {Promise<string|null>} A promise that resolves to the public file path or null if upload fails.
 */
const uploadFile = async (file, uploadDir = '/uploads/') => {
  if (!file) return null;

  validateFileSize(file.size);
  const ext = validateFileType(file.name);

  const serverUploadDir = path.join(filesystem.upload.baseDir, uploadDir);

  if (!fs.existsSync(serverUploadDir)) {
    try {
      fs.mkdirSync(serverUploadDir, { recursive: true });
    } catch (error) {
      console.error('File Upload Error:', error);
      throw error;
    }
  }

  const randomFilename = (await generateRandomFilename()) + ext;
  const filePath = path.join(serverUploadDir, randomFilename);

  try {
    if (file.size > filesystem.upload.markAsLargeFile) {
      await new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath);
        writeStream.write(file.data);
        writeStream.end();
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    } else {
      await fs.promises.writeFile(filePath, file.data);
    }
  } catch (error) {
    console.error('File Upload Error:', error);
    deleteFile(filePath);
    throw error;
  }

  return path.join(uploadDir, randomFilename);
};

/**
 * Updates a file on the filesystem.
 *
 * @param {string} oldFilePath - The path of the old file to be replaced.
 * @param {string} newFilePath - The path where the new file will be saved.
 * @param {Buffer} data - The data of the new file.
 * @throws {Error} If the file update fails.
 */
const updateFile = async (oldFilePath, newFilePath, data) => {
  try {
    deleteFile(oldFilePath);

    await fs.promises.writeFile(
      path.join(filesystem.upload.baseDir, newFilePath),
      data,
    );

    console.log(`File updated from '${oldFilePath}' to '${newFilePath}'`);
  } catch (error) {
    console.error('Error updating the file:', error.message);
    throw new Error(`Failed to update file: ${error.message}`);
  }
};

module.exports = {
  validateFileSize,
  validateFileType,
  getUploadFilepath,
  deleteFile,
  uploadFile,
  updateFile,
};
