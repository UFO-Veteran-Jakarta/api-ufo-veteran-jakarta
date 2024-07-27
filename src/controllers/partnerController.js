const logger = require("../utils/logger");
const { sendResponse } = require("../helpers/response");
const { addPartner } = require("../services/partnerService");
const { uploadSingle } = require("../utils/uploadFile");

exports.uploadPartner = async (req, res) => {
  try {
    const logoUplaod = await uploadSingle(req.files.logo, "cover");

    req.body.logo = logoUplaod.secure_url;

    const result = await addPartner(req.body);
    logger.info("Add Success: Success Add Partner");
    return sendResponse(res, 200, "Successfully Add New Partner", result);
  } catch (error) {
    logger.error("Add Error: Failed Add Partner");
    return sendResponse(res, 500, error.message);
  }
};
