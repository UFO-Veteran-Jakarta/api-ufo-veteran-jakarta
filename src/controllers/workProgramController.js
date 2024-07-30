const {
  addWorkProgram,
  getAllWorkPrograms,
  getWorkProgramById,
  updateWorkProgram,
  deleteWorkProgram,
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

exports.getAllWorkPrograms = async (req, res, next) => {
  try {
    if (req.query.id) {
      return next();
    }

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

exports.getWorkProgramById = async (req, res) => {
  try {
    const { id } = req.query;
    const workProgram = await getWorkProgramById(id);

    if (!workProgram) {
      logger.error(`Work Program with id ${id} not found`);
      return sendResponse(res, 404, "Work Program not found");
    }

    logger.info(`Successfully Get Work Program with id ${id}`);
    return sendResponse(res, 200, "Successfully Get Work Program", workProgram);
  } catch (error) {
    logger.error("Failed to Get Work Program");
    return sendResponse(res, 500, error.message);
  }
};

exports.updateWorkProgramById = async (req, res) => {
  try {
    const { id } = req.query;
    const workProgram = await getWorkProgramById(id);

    if (!workProgram) {
      logger.error(`Work Program with id ${id} not found`);
      return sendResponse(res, 404, "Work Program not found");
    }

    if (req.file?.image) {
      const imageUpload = await uploadSingle(req.files.image, "image");
      req.body.image = imageUpload.secure_url;
    }

    const updatedWorkProgram = await updateWorkProgram(id, req.body);

    logger.info(`Successfully Update Work Program with id ${id}`);
    return sendResponse(
      res,
      200,
      "Successfully Update Work Program",
      updatedWorkProgram
    );
  } catch (error) {
    logger.error("Failed to Update Work Program");
    return sendResponse(res, 500, error.message);
  }
};

exports.deleteWorkProgramById = async (req, res) => {
  try {
    const id = req.query.id;

    const workProgram = await getWorkProgramById(id);

    if (!workProgram) {
      logger.error(`Work Program with id ${id} not found`);
      return sendResponse(res, 404, "Work Program not found");
    }

    const deletedWorkProgram = await deleteWorkProgram(id);

    logger.info(`Successfully Delete Work Program with id ${id}`);
    return sendResponse(
      res,
      200,
      "Successfully Delete Work Program",
      deletedWorkProgram
    );
  } catch (error) {
    logger.error("Failed to Delete Work Program");
    return sendResponse(res, 500, error.message);
  }
};
