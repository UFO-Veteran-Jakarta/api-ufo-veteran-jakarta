const logger = require('../utils/logger');
const { sendResponse } = require('../helpers/response');
const { buildResponse } = require('../utils/buildResponseAchievement');
const { uploadSingle } = require('../utils/uploadFile');
const {
  addAchievemnt,
  getAllAchievements,
  getAchievementById,
  updateAchievement,
  updateAchievementById,
  deleteAchievement,
  StageDataUpdateAchievementById,
} = require('../services/achievementService');

exports.addAchievement = async (req, res) => {
  try {
    const logoUpload = await uploadSingle(req.files.logo, 'logo');

    req.body.logo = logoUpload.secure_url;

    const result = await addAchievemnt(req.body);

    logger.info('Add Success: Success Add Achievement');
    return sendResponse(res, 200, 'Successfully Add New Achievement', result);
  } catch (error) {
    logger.error('Add Error: Failed Add Achievement');
    return sendResponse(res, 500, error.message);
  }
};

exports.getAllAchievements = async (req, res, next) => {
  try {
    if (req.query.id) {
      return next();
    }

    const achievements = await getAllAchievements();

    if (achievements === null) {
      logger.error('Failed to Get All Achievements');
      return sendResponse(
        res,
        500,
        'Failed to Get All Achievements: No data found',
      );
    }

    logger.info('Successfully Get All Achievements');

    return sendResponse(
      res,
      200,
      'Successfully Get All Achievements',
      achievements,
    );
  } catch (error) {
    logger.error('Failed to Get All Achievements', error);
    return sendResponse(res, 500, 'Failed to Get All Achievements');
  }
};

exports.getAchievementById = async (req, res) => {
  try {
    const { id } = req.query;
    const achievement = await getAchievementById(id);

    if (!achievement) {
      logger.error(`Achievement with id ${id} not found`);
      return sendResponse(res, 404, 'Achievement not found');
    }

    logger.info(`Successfully Get Achievement with id ${id}`);
    return sendResponse(res, 200, 'Successfully Get Achievement', achievement);
  } catch (error) {
    logger.error('Failed to Get Achievement');
    return sendResponse(res, 500, error.message);
  }
};

exports.getAchievementByIdParams = async (req, res) => {
  try {
    const { id } = req.params;
    const achievement = await getAchievementById(id);

    if (!achievement) {
      logger.error(`Achievement with id ${id} not found`);
      return sendResponse(res, 404, 'Achievement not found');
    }

    logger.info(`Successfully Get Achievement with id ${id}`);
    return sendResponse(res, 200, 'Successfully Get Achievement', achievement);
  } catch (error) {
    logger.error('Failed to Get Achievement');
    return sendResponse(res, 500, error.message);
  }
};

exports.updateAchievementById = async (req, res) => {
  try {
    const { id } = req.query;
    const achievement = await getAchievementById(id);

    if (!achievement) {
      logger.error(`Achievement with id ${id} not found`);
      return sendResponse(res, 404, 'Achievement not found');
    }

    if (req.files?.logo) {
      const logoUpload = await uploadSingle(req.files.logo, 'logo');
      req.body.logo = logoUpload.secure_url;
    }

    const updatedAchievement = await updateAchievement(id, req.body);

    logger.info(`Successfully Update Achievement with id ${id}`);
    return sendResponse(
      res,
      200,
      'Successfully Update Achievement',
      updatedAchievement,
    );
  } catch (error) {
    logger.error('Failed to Update Achievement');
    return sendResponse(res, 500, error.message);
  }
};

exports.updateAchievementByIdParams = async (req, res) => {
  try {
    const { id } = req.params;
    const oldData = await getAchievementById(id);

    // Check if achievement exists
    if (!oldData) {
      return sendResponse(res, 404, 'Achievement not found');
    }

    // Stage the update data
    const [isUpdateData, updateData] =
      await StageDataUpdateAchievementById(req);
    if (!isUpdateData) {
      return sendResponse(res, 400, 'No update data provided');
    }

    // Update the achievement
    const updatedAchievement = await updateAchievementById(
      id,
      oldData,
      updateData,
    );

    // Build response
    const [responseMessage, responseData] = buildResponse(
      oldData,
      updateData,
      updatedAchievement,
    );

    return sendResponse(res, 200, responseMessage, responseData);
  } catch (error) {
    logger.error('Failed to Update Achievement:', error);
    return sendResponse(res, 500, error.message);
  }
};

exports.deleteAchievementById = async (req, res) => {
  try {
    const { id } = req.query;

    const achievement = await getAchievementById(id);

    if (!achievement) {
      logger.error(`Achievement with id ${id} not found`);
      return sendResponse(res, 404, 'Achievement not found');
    }

    const deletedAchievement = await deleteAchievement(id);

    logger.info(`Successfully Delete Achievement with id ${id}`);
    return sendResponse(
      res,
      200,
      'Successfully Delete Achievement',
      deletedAchievement,
    );
  } catch (error) {
    logger.error('Failed to Delete Achievement');
    return sendResponse(res, 500, error.message);
  }
};
