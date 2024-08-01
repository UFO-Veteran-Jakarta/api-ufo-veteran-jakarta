const path = require('path');
const { sendResponse } = require('../helpers/response');

function validateFile(file, res) {
  const extension = path.extname(file.name).toLowerCase();
  const mimeType = file.mimetype;

  if (extension !== '.webp' || mimeType !== 'image/webp') {
    sendResponse(res, 500, 'Latest activity image must be in WEBP Format');
    return false;
  }

  if (file.size > 500 * 1024) {
    // 500KB
    sendResponse(
      res,
      500,
      'Latest activity image size is too big, please upload a file smaller than 500 KB',
    );
    return false;
  }

  return true;
}

exports.checkFile = (form) => async (req, res, next) => {
  const file = req?.files?.[form];

  if (!file) {
    return sendResponse(res, 500, 'Latest activity image is required');
  }

  if (!validateFile(file, res)) {
    return;
  }

  next();
};

exports.checkFileForUpdate = (form) => async (req, res, next) => {
  const file = req?.files?.[form];

  if (file && !validateFile(file, res)) {
    return;
  }

  next();
};
