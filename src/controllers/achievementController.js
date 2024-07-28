const logger = require("../utils/logger");
const { sendResponse } = require("../helpers/response");
const { uploadSingle } = require("src/utils/uploadFile");
const {
  addAchievemnt,
  getAllAchievements,
  getAchievementById,
  updateAchievement,
} = require("src/services/achievementService");

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

exports.getAllAchievements = async (req, res, next) => {
  try {
    if (req.query.id) {
      return next();
    }

    const achievements = await getAllAchievements();
    logger.info("Successfully Get All Achievements");

    return sendResponse(
      res,
      200,
      "Successfully Get All Achievements",
      achievements
    );
  } catch (error) {
    logger.error("Failed to Get All Achievements", error);
    return sendResponse(res, 500, "Failed to Get All Achievements");
  }
};

exports.getAchievementById = exports.updateAchievement = async (req, res) => {
  try {
    const { id } = req.query;
    const achievement = await getAchievementById(id);

    if (!achievement) {
      logger.error(`Achievement with id ${id} not found`);
      return sendResponse(res, 404, "Achievement not found");
    }

    logger.info(`Successfully Get Achievement with id ${id}`);
    return sendResponse(res, 200, "Successfully Get Achievement", achievement);
  } catch (error) {
    logger.error("Failed to Get Achievement");
    return sendResponse(res, 500, error.message);
  }
};

exports.updateAchievementById = async (req, res) => {
  try {
    const id = req.query.id;

    const achievement = await getAchievementById(id);

    if (!achievement) {
      logger.error(`Achievement with id ${id} not found`);
      return sendResponse(res, 404, "Achievement not found");
    }

    if (req.files?.logo) {
      const logoUpload = await uploadSingle(req.files.logo, "logo");
      req.body.logo = logoUpload.secure_url;
    }

    const updatedAchievement = await updateAchievement(id, req.body);

    logger.info(`Successfully Update Achievement with id ${id}`);

    return sendResponse(
      res,
      200,
      "Successfully Update Achievement",
      updatedAchievement
    );
  } catch (error) {
    logger.error("Failed to Get Achievement");
    return sendResponse(res, 500, error.message);
  }
};
