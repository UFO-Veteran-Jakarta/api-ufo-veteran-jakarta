const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const filesystem = require('../config/filesystem');
const {
  validateMaxSize,
  validateFileType,
} = require('./uploadFileValidateDivision');

const generateRandomFilename = () => {
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

const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('File deleted successfully:', filePath);
    } else {
      console.warn('File not found, cannot delete:', filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error.message);
  }
};

const uploadFileDivision = (file) => {
  if (!file) return null;

  const fileSize = validateMaxSize(file.size);
  const ext = validateFileType(file.name);

  const baseSubDir = '/images/divisions/';
  const uploadDir = filesystem.upload.baseDir + baseSubDir;

  if (!fs.existsSync(uploadDir)) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
    } catch (error) {
      console.error('File Division Upload Error:', error);
      throw error;
    }
  }

  const randomFilename = generateRandomFilename() + ext;
  const filePath = path.join(uploadDir, randomFilename);

  try {
    if (fileSize > filesystem.upload.markAsLargeFile) {
      // Write streaming for large files
      const writeStream = fs.createWriteStream(filePath);
      writeStream.write(fileData);
      writeStream.end();
      writeStream.on('error', (err) => {
        console.error('File Division Upload Error:', error);
        deleteFile(filePath);
        throw err;
      });
    } else {
      // Regular write
      fs.writeFileSync(filePath, file.data);
    }
  } catch (error) {
    console.error('File Division Upload Error:', error);
    deleteFile(filePath);
    throw error;
  }

  return baseSubDir + randomFilename;
};

module.exports = uploadFileDivision;
