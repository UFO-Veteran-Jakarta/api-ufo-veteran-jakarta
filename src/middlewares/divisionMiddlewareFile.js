const path = require('path');
const fs = require('fs');
const { sendResponse } = require('../helpers/response');

const checkFileDivision = (fieldName) => {
  return (req, res, next) => {
    try {
      if (!req.files?.[fieldName]) {
        return sendResponse(res, 400, `${fieldName} is required.`);
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
        return sendResponse(res, 415, 'Image must be in WEBP Format.');
      }

      const uploadDir = './public/images/divisions/';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      next();
    } catch (error) {
      return sendResponse(res, 500, 'Error processing file upload.');
    }
  };
};

const checkUpdatedFileDivision = (fieldName) => {
  return (req, res, next) => {
    try {
      if (!req.files?.[fieldName]) {
        return next();
      }

      const file = req.files[fieldName];

      // Validasi ukuran file
      const maxSize = 500 * 1024;
      if (file.size > maxSize) {
        return sendResponse(
          res,
          413,
          `${fieldName} size is more than ${maxSize / 1024} KB.`,
        );
      }

      // Validasi format file
      const ext = path.extname(file.name).toLowerCase();
      if (ext !== '.webp') {
        return sendResponse(res, 415, 'Image must be in WEBP Format.');
      }

      // Buat direktori jika belum ada
      const uploadDir = './public/images/divisions/';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      next();
    } catch (error) {
      return sendResponse(res, 500, 'Error processing file update.');
    }
  };
};

module.exports = {
  checkFileDivision,
  checkUpdatedFileDivision,
};
