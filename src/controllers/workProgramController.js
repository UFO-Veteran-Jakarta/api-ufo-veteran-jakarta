const { addWorkProgram } = require("../services/workProgramService");
const logger = require("../utils/logger");
const { sendResponse } = require("../helpers/response");
const { uploadSingle } = require("../utils/uploadFile");

exports.addWorkProgram = async (req, res) => {
  try {
    const workProgramImageUpload = await uploadSingle(req.files.image, "image");
    req.body.image = workProgramImageUpload.secure_url;

    const result = await addWorkProgram(req.body);
    logger.info("Add Success: Success Add Work Program");
    return sendResponse(res, 200, "Successfully Add New Work Program", result);
  } catch (error) {
    logger.error("Add Error: Failed Add Work Program");
    return sendResponse(res, 500, error.message);
  }
};
