const sharp = require("sharp");
const { sendResponse } = require("../helpers/response");
const path = require("path");

exports.checkFile = (form) => {
  return async (req, res, next) => {
    const file = req?.files?.[form];

    if (!file) {
      return sendResponse(res, 500, "Work program image is required");
    }

    const extension = path.extname(file.name).toLowerCase();
    const mimeType = file.mimetype;

    if (extension !== ".webp" || mimeType !== "image/webp") {
      return sendResponse(
        res,
        500,
        "Work program image must be in WEBP Format"
      );
    }

    if (file.size > 500 * 1024) {
      // 500KB
      return sendResponse(
        res,
        500,
        "Work program image size is too big, please upload a file smaller than 500 KB"
      );
    }

    next();
  };
};

exports.checkFileForUpdate = (form) => {
  return async (req, res, next) => {
    const file = req?.files?.[form];

    if (file) {
      const extension = path.extname(file.name).toLowerCase();
      const mimeType = file.mimetype;

      if (extension !== ".webp" || mimeType !== "image/webp") {
        return sendResponse(
          res,
          500,
          "Work program image must be in WEBP Format"
        );
      }

      if (file.size > 500 * 1024) {
        // 500KB
        return sendResponse(
          res,
          500,
          "Work program image size is too big, please upload a file smaller than 500 KB"
        );
      }

    next();
  };
};
