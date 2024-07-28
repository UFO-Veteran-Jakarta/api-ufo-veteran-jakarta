const logger = require("../utils/logger");
const { sendResponse } = require("../helpers/response");
const { addPartner, getAllPartners } = require("../services/partnerService");
const { uploadSingle } = require("../utils/uploadFile");

exports.uploadPartner = async (req, res) => {
  try {
    const logoUplaod = await uploadSingle(req.files.logo, "logo");

    req.body.logo = logoUplaod.secure_url;

    const result = await addPartner(req.body);
    logger.info("Add Success: Success Add Partner");
    return sendResponse(res, 200, "Successfully Add New Partner", result);
  } catch (error) {
    logger.error("Add Error: Failed Add Partner");
    return sendResponse(res, 500, error.message);
  }
};

exports.getAllPartners = async (req, res) => {
  try {
    const partners = await getAllPartners();
    logger.info("Successfully Get All Partners");
    return sendResponse(res, 200, "Successfully Get All Partners", partners);
  } catch (error) {
    logger.error("Failed to Get All Partners");
    return sendResponse(res, 500, "Failed to Get All Partners");
  }
};
