const { sendResponse } = require("../helpers/response");
const multer = require("../config/multer");
const single = multer.single("file");
exports.uploadEvent = (req, res) => {
  single(req, res, (err) => {
    if (err) {
      return sendResponse(res, 500, err.message);
    }

    sendResponse(res, 200, "AMAN");
  });
};
