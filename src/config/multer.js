const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

module.exports = multer({
  storage,
  fileFilter(req, file, callback) {
    const extension =
      [".webp"].indexOf(path.extname(file.originalname).toLowerCase()) >= 0;
    const mimeType = ["image/webp"].indexOf(file.mimetype) >= 0;

    if (extension && mimeType) {
      return callback(null, true);
    }

    callback(
      new Error(
        "Invalid file type. Only picture file on type WEBP are allowed!"
      )
    );
  },
});
