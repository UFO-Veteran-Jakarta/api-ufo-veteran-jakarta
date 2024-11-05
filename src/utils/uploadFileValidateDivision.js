const path = require('path');
const filesystem = require('../config/filesystem');

const validateMaxSize = (size) => {
  if (size > filesystem.upload.maxSize) {
    throw new Error('File size exceeds the maximum limit');
  }

  return size;
};

const validateFileType = (fileName) => {
  const fileType = path.extname(fileName).substring(1);

  if (!filesystem.upload.allowedFileTypes.includes(fileType)) {
    throw new Error('Invalid file type');
  }

  return `.${fileType}`;
};

module.exports = {
  validateMaxSize,
  validateFileType,
};
