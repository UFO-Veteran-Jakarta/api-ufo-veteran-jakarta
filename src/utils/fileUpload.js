const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const filesystem = require('../config/filesystem');
const {
  validateMaxSize,
  validateFileType,
} = require('./uploadFileValidate');

/**
 *
 * @returns string
 *
 * Generates a random file name.
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
 *
 * @param {*} file
 * @param {string} directory
 * @returns string
 *
 * Gets the full upload file path.
 */
const getUploadFilepath = async (file, directory) => {
  // File validation
  validateMaxSize(file.size);
  const ext = validateFileType(file.name);

  // Generate file path
  const randomFilename = (await generateRandomFilename()) + ext;
  const filepath = path.join('/images', directory, randomFilename);

  // Replace backslashes with forward slashes
  return filepath.replace(/\\/g, '/');
};

/**
 *
 * @param {*} filePath
 *
 * Deletes a file from a filesystem.
 */
const deleteFile = (filePath) => {
  try {
    const fullFilePath = filesystem.upload.baseDir + filePath;
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
 *
 * @param {*} file
 * @param {string} directory
 * @returns string
 *
 * Uploads a file into the local filesystem.
 */
const uploadFile = async (file, directory) => {
  if (!file) return null;

  // Validate file
  const fileSize = validateMaxSize(file.size);
  const ext = validateFileType(file.name);

  // Construct the server upload directory
  const serverUploadDir = path.join(
    filesystem.upload.baseDir,
    'images',
    directory,
  );

  if (!fs.existsSync(serverUploadDir)) {
    // Create the upload directory if not exist
    try {
      fs.mkdirSync(serverUploadDir, { recursive: true });
    } catch (error) {
      console.error(`File Upload Error (${directory}):`, error);
      throw error;
    }
  }

  // Construct the complete file path
  const randomFilename = (await generateRandomFilename()) + ext;
  const filePath = path.join(serverUploadDir, randomFilename);

  try {
    if (fileSize > filesystem.upload.markAsLargeFile) {
      // Write streaming for large files
      const writeStream = fs.createWriteStream(filePath);
      writeStream.write(file.data);
      writeStream.end();
      writeStream.on('error', (err) => {
        // Cancel write and delete file if error occurred
        console.error(`File Upload Error (${directory}):`, err);
        deleteFile(filePath);
        throw err;
      });
    } else {
      // Regular write
      fs.writeFileSync(filePath, file.data);
    }
  } catch (error) {
    // Cancel write and delete file if error occurred
    console.error(`File Upload Error (${directory}):`, error);
    deleteFile(filePath);
    throw error;
  }

  // Returns the publicly accessible file path
  const publicFilePath = path.join('/images', directory, randomFilename);
  return publicFilePath.replace(/\\/g, '/');
};

/**
 *
 * @param {*} oldFilePath
 * @param {*} newFilePath
 * @param {*} data
 *
 * Updates a file on a filesystem.
 */
const updateFile = async (oldFilePath, newFilePath, data) => {
  try {
    // Deletes the old file
    deleteFile(oldFilePath);

    // Create new file
    await fs.promises.writeFile(filesystem.upload.baseDir + newFilePath, data);

    console.log(`File updated from '${oldFilePath}' to '${newFilePath}'`);
  } catch (error) {
    // Handle any error that occurs
    console.error('Error updating the file:', error.message);
    throw new Error(`Failed to update file: ${error.message}`);
  }
};

module.exports = {
  getUploadFilepath,
  uploadFile,
  updateFile,
};