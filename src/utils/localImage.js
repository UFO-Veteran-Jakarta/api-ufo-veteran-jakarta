const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const filesystem = require('../config/filesystem');

const UPLOAD_DIR = path.join(filesystem.upload.baseDir, 'images');

// HELPER FUNCTIONS //

/**
 * Validates the file size.
 * @param {number} size - The size of the file in bytes.
 * @returns {number} - The file size.
 * @throws {Error} - If the file size exceeds the maximum allowed size.
 */
const validateMaxSize = (size) => {
  if (size > filesystem.upload.maxSize) {
    throw new Error('File size exceeds the maximum limit');
  }
  return size;
};

/**
 * Validates the file type.
 * @param {string} fileName - The name of the file.
 * @returns {string} - The file extension.
 * @throws {Error} - If the file type is not allowed.
 */
const validateFileType = (fileName) => {
  const fileType = path.extname(fileName).substring(1);
  if (!filesystem.upload.allowedFileTypes.includes(fileType)) {
    throw new Error('Invalid file type');
  }
  return `.${fileType}`;
};

/**
 * Generates a random file name.
 * @returns {string} - The random file name.
 */
const generateRandomFilename = async () => {
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const allChars = upperChars + lowerChars + numbers;

  const upper = upperChars[crypto.randomInt(upperChars.length)];
  const lower = lowerChars[crypto.randomInt(lowerChars.length)];
  const num = numbers[crypto.randomInt(numbers.length)];
  const remainingLength = 13;

  let remaining = '';
  for (let i = 0; i < remainingLength; i++) {
    remaining += allChars[crypto.randomInt(allChars.length)];
  }

  const combined = upper + lower + num + remaining;
  return combined
    .split('')
    .map((value) => ({ value, sort: crypto.randomInt(1000000) }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
    .join('');
};

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The path of the directory to ensure.
 */
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Directory Creation Error:`, error);
      throw error;
    }
  }
};

// MAIN FUNCTIONS //

/**
 * Uploads a file to the server.
 * @param {Object} file - The file to upload.
 * @param {string} folder - The folder to upload the file into.
 * @returns {Object} - The public URL of the uploaded file.
 * @throws {Error} - If the upload process fails.
 */
const uploadImage = async (file, folder) => {
  if (!file) return null;

  // Validate file
  const fileSize = validateMaxSize(file.size);
  const ext = validateFileType(file.name);

  // Construct the server upload directory
  const uploadDir = path.join(UPLOAD_DIR, folder);
  ensureDirectoryExists(uploadDir);

  // Construct the complete file path
  const filename = (await generateRandomFilename()) + ext;
  const filePath = path.join(uploadDir, filename);
  const publicFilePath = path.join('/images', folder, filename);

  try {
    if (fileSize > filesystem.upload.markAsLargeFile) {
      // Write streaming for large files
      const writeStream = fs.createWriteStream(filePath);
      writeStream.write(file.data);
      writeStream.end();
      writeStream.on('error', (err) => {
        deleteImage(publicFilePath);
        console.error('File Upload Error:', err);
        throw err;
      });
    } else {
      // Regular write
      fs.writeFileSync(filePath, file.data);
    }
  } catch (error) {
    deleteImage(publicFilePath);
    console.error('File Upload Error:', error);
    throw error;
  }

  // Return the public URL
  const secureUrl = publicFilePath.replace(/\\/g, '/');
  return { secure_url: secureUrl };
};

/**
 * Deletes a file if it exists.
 * @param {string} filePath - The path of the file to delete.
 */
const deleteImage = (filePath) => {
  const fullFilePath = path.join(filesystem.upload.baseDir, filePath);
  try {
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
 * Updates an image on the server by deleting the old one and uploading a new one.
 * @param {string} oldPath - The current file path of the image to delete. (public)
 * @param {Object} newFile - The new file to upload.
 * @param {string} folder - The folder to store the file.
 * @returns {Object} - The public URL of the updated file.
 * @throws {Error} - If the update process fails.
 */
const updateImage = async (oldPath, newFile, folder) => {
  try {
    // Delete the old file
    deleteImage(oldPath);

    // Create the new file path
    const ext = validateFileType(newFile.name);
    const uploadDir = path.join(UPLOAD_DIR, folder);
    ensureDirectoryExists(uploadDir);

    const randomFilename = (await generateRandomFilename()) + ext;
    const newPath = path.join(uploadDir, randomFilename);

    // Write the new file
    await fs.promises.writeFile(newPath, newFile.data);

    console.log(`File updated from '${oldPath}' to '${newPath}'`);

    // Return the public URL of the new file
    const publicFilePath = path.join('/images', folder, randomFilename);
    return publicFilePath.replace(/\\/g, '/');
  } catch (error) {
    console.error('Error updating the file:', error.message);
    throw new Error(`Failed to update file: ${error.message}`);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  updateImage,
};
