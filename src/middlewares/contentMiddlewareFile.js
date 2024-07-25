const sharp = require("sharp");
const { sendResponse } = require("../helpers/response");
const path = require("path");

exports.checkFile = (form) => {
  return async (req, res, next) => {
    const file = req.files[form];

    if (!file) {
      return sendResponse(res, 500, "File not found");
    }

    const extension =
      [".png", ".jpg", ".jpeg"].indexOf(
        path.extname(file.name).toLowerCase()
      ) >= 0;
    const mimeType =
      ["image/png", "image/jpg", "image/jpeg"].indexOf(file.mimetype) >= 0;

    if (extension && mimeType) {
      return sendResponse(
        res,
        500,
        "Cover/Cover Landscape must be in WEBP Format"
      );
    }

    if (file.size > 500 * 1024) {
      // 500KB
      return sendResponse(
        res,
        500,
        "Cover/Cover Landscape size is too big, please upload a logo with size less than 500 KB"
      );
    }

    const metadata = await sharp(file.data).metadata();
    if (
      form == "cover" &&
      (metadata.width !== 1080 || metadata.height !== 1080)
    ) {
      return sendResponse(res, 500, "Cover must in 1080px x 1080px in size");
    }

    if (
      form == "cover_landscape" &&
      (metadata.width !== 2000 || metadata.height !== 1047)
    ) {
      return sendResponse(
        res,
        500,
        "Cover Landscape must in 2000px x 1047px in size"
      );
    }

    next();
  };
};
