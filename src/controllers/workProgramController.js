const {
  addWorkProgram,
  getAllWorkPrograms,
} = require("../services/workProgramService");
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

exports.getAllWorkPrograms = async (req, res) => {
  try {
    const workPrograms = await getAllWorkPrograms();
    logger.info("Successfully Get All Work Programs");
    return sendResponse(
      res,
      200,
      "Successfully Get All Work Programs",
      workPrograms
    );
  } catch (error) {
    logger.error("Failed to Get All Work Programs");
    return sendResponse(res, 500, "Failed to Get All Work Programs");
  }
};
