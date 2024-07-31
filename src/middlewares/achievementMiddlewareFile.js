const path = require('path');
const { sendResponse } = require('../helpers/response');

const validateFilePresence = (file, res) => {
  if (!file) {
    sendResponse(res, 500, 'Achievement logo are required');
    return false;
  }
  return true;
};

const validateFileFormat = (file, res) => {
  const extension = path.extname(file.name).toLowerCase();
  const mimeType = file.mimetype;

  if (extension !== '.webp' || mimeType !== 'image/webp') {
    sendResponse(res, 500, 'Achievement logo must be in WEBP format');
    return false;
  }
  return true;
};

const validateFileSize = (file, res) => {
  if (file.size > 500 * 1024) {
    // 500KB
    sendResponse(
      res,
      500,
      'Achievement logo size is too big, please upload a file smaller than 500 KB',
    );
    return false;
  }
  return true;
};

exports.checkFile = (form) => async (req, res, next) => {
  const file = req?.files?.[form];

  if (
    validateFilePresence(file, res) &&
    validateFileFormat(file, res) &&
    validateFileSize(file, res)
  ) {
    next();
  }
};

exports.checkUpdateFile = (form) => async (req, res, next) => {
  const file = req?.files?.[form];

  if (file) {
    if (validateFileFormat(file, res) && validateFileSize(file, res)) {
      next();
    }
  } else {
    next();
  }
};
