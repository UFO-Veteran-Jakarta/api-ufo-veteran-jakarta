const { sendResponse } = require("../helpers/response");
const path = require("path");

exports.checkFile = (form) => {
  return async (req, res, next) => {
    const file = req?.files?.[form];

    if (!file) {
      return sendResponse(res, 500, "Partner logo are required");
    }

    const extension = path.extname(file.name).toLowerCase();
    const mimeType = file.mimeType;

    if (extension !== ".webp" || mimeType !== "image/webp") {
      return sendResponse(res, 500, "Partner logo must be in WEBP format");
    }

    if (file.size > 500 * 1024) {
      // 500KB
      return sendResponse(
        res,
        500,
        "Partner logo size is too big, please upload a file smaller than 500 KB"
      );
    }

    next();
  };
};
