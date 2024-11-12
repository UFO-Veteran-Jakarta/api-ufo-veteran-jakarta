const path = require('path');
const fs = require('fs');
const { sendResponse } = require('../helpers/response');

/**
 * Middleware to check and validate file upload.
 *
 * @param {Object} options - Configuration options for file checking.
 * @param {string} options.fieldName - Name of the file field in the request.
 * @param {boolean} [options.isRequired=true] - Whether the file is required.
 * @param {string} [options.action='upload'] - The action being performed ('upload' or 'update').
 * @param {number} [options.maxSize=500*1024] - Maximum file size in bytes.
 * @param {string[]} [options.allowedExtensions=['.webp']] - Array of allowed file extensions.
 * @param {string} [options.uploadDir='./public/images/'] - Directory for file upload.
 * @returns {Function} Express middleware function.
 */
exports.checkFile = (options) => {
  const {
    fieldName,
    isRequired = true,
    action = 'upload',
    maxSize = 500 * 1024,
    allowedExtensions = ['.webp'],
    uploadDir = './public/images/',
  } = options;

  return (req, res, next) => {
    try {
      if (!req.files?.[fieldName]) {
        return isRequired
          ? sendResponse(res, 400, `${fieldName} is required.`)
          : next();
      }

      const file = req.files[fieldName];

      // Check file size
      if (file.size > maxSize) {
        return sendResponse(
          res,
          413,
          `${fieldName} size is more than ${maxSize / 1024} KB.`,
        );
      }

      // Check file extension
      const ext = path.extname(file.name).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        return sendResponse(
          res,
          415,
          `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`,
        );
      }

      // Ensure upload directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      next();
    } catch (error) {
      return sendResponse(res, 500, `Error processing file ${action}.`);
    }
  };
};
