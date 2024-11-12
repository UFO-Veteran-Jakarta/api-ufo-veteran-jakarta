const { checkFile } = require('./fileMiddleware');

/**
 * Middleware to check and validate division image upload.
 *
 * @param {string} fieldName - Name of the file field in the request.
 * @param {boolean} [isRequired=true] - Whether the file is required.
 * @param {string} [action='upload'] - The action being performed ('upload' or 'update').
 * @returns {Function} Express middleware function.
 */
exports.checkDivisionImage = (
  fieldName,
  isRequired = true,
  action = 'upload',
) => {
  return checkFile({
    fieldName,
    isRequired,
    action,
    maxSize: 500 * 1024, // 500 KB
    allowedExtensions: ['.webp'],
    uploadDir: './public/images/divisions/',
  });
};
