const sharp = require("sharp");
const { sendResponse } = require("../helpers/response");
const path = require("path");

function validateFile(file, res) {
  const extension = path.extname(file.name).toLowerCase();
  const mimeType = file.mimetype;

  if (extension !== ".webp" || mimeType !== "image/webp") {
    sendResponse(res, 500, "Work program image must be in WEBP Format");
    return false;
  }

  if (file.size > 500 * 1024) {
    // 500KB
    sendResponse(
      res,
      500,
      "Work program image size is too big, please upload a file smaller than 500 KB"
    );
    return false;
  }

  return true;
}

exports.checkFile = (form) => {
  return async (req, res, next) => {
    const file = req?.files?.[form];

    if (!file) {
      return sendResponse(res, 500, "Work program image is required");
    }

    if (!validateFile(file, res)) {
      return;
    }

    next();
  };
};

exports.checkFileForUpdate = (form) => {
  return async (req, res, next) => {
    const file = req?.files?.[form];

    if (file && !validateFile(file, res)) {
      return;
    }

    next();
  };
};
