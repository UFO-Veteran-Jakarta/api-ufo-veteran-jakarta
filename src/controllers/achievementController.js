const logger = require("../utils/logger");
const { sendResponse } = require("../helpers/response");
const { uploadSingle } = require("src/utils/uploadFile");
const { addAchievemnt } = require("src/services/achievementService");

exports.addAchievement = async (req, res) => {
  try {
    const logoUpload = await uploadSingle(req.files.logo, "logo");

    req.body.logo = logoUpload.secure_url;

    const result = await addAchievemnt(req.body);

    logger.info("Add Success: Success Add Achievement");
    return sendResponse(res, 200, "Successfully Add New Achievement", result);
  } catch (error) {
    logger.error("Add Error: Failed Add Achievement");
    return sendResponse(res, 500, error.message);
  }
};
