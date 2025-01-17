const path = require('path');
const fs = require('fs');
const { sendResponse } = require('../helpers/response');

exports.checkFileArticle = (fieldName, isRequired = true, action = 'upload') => {
  return (req, res, next) => {
    try {
      if (!req.files?.[fieldName]) {
        return isRequired
          ? sendResponse(res, 400, `${fieldName} is required.`)
          : next();
      }

      const file = req.files[fieldName];
      const maxSize = 500 * 1024;
      if (file.size > maxSize) {
        return sendResponse(
          res,
          413,
          `${fieldName} size is more than ${maxSize / 1024} KB.`,
        );
      }

      const ext = path.extname(file.name).toLowerCase();
      if (ext !== '.webp') {
        return sendResponse(res, 415, `${fieldName} must be in WEBP Format.`);
      }

      const uploadDir = `./public/images/articles/${fieldName}`;
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      next();
    } catch (error) {
      return sendResponse(res, 500, `Error processing file ${action}.`);
    }
  };
};
