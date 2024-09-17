const logger = require('../utils/logger');
const { sendResponse } = require('../helpers/response');
const { uploadSingle } = require('../utils/uploadFile');
const {
  addLatestActivity,
  getAllLatestActivities,
  getLatestActivityById,
  updateLatestActivity,
  deleteLatestActivity,
} = require('../services/latestActivityService');

exports.addLatestActivity = async (req, res) => {
  try {
    const latestActivityImageUpload = await uploadSingle(
      req.files.image,
      'image',
    );

    req.body.image = latestActivityImageUpload.secure_url;

    const result = await addLatestActivity(req.body);
    logger.info('Add Success: Success Add Latest Activity');
    return sendResponse(
      res,
      200,
      'Successfully Add New Latest Activity',
      result,
    );
  } catch (error) {
    logger.error('Add Error: Failed Add Latest Activity');
    return sendResponse(res, 500, error.message);
  }
};

exports.getAllLatestActivities = async (req, res, next) => {
  try {
    if (req.query.id) {
      return next();
    }

    const latestActivities = await getAllLatestActivities();
    logger.info('Successfully Get All Latest Activities');
    return sendResponse(
      res,
      200,
      'Successfully Get All Latest Activities',
      latestActivities,
    );
  } catch (error) {
    logger.error('Failed to Get All Latest Activities');
    return sendResponse(res, 500, 'Failed to Get All Latest Activities');
  }
};

exports.getLatestActivityById = async (req, res) => {
  try {
    const { id } = req.query;
    const latestActivity = await getLatestActivityById(id);

    if (!latestActivity) {
      logger.error(`Latest Activity with id ${id} not found`);
      return sendResponse(res, 404, 'Latest Activity not found');
    }

    logger.info(`Successfully Get Latest Activity with id ${id}`);
    return sendResponse(
      res,
      200,
      'Successfully Get Latest Activity',
      latestActivity,
    );
  } catch (error) {
    logger.error('Failed to Get Latest Activity');
    return sendResponse(res, 500, error.message);
  }
};

exports.updateLatestActivityById = async (req, res) => {
  try {
    const { id } = req.query;
    const latestActivity = await getLatestActivityById(id);

    if (!latestActivity) {
      logger.error(`Latest Activity with id ${id} not found`);
      return sendResponse(res, 404, 'Latest Activity not found');
    }

    if (req.file?.image) {
      const imageUpload = await uploadSingle(req.files.image, 'image');
      req.body.image = imageUpload.secure_url;
    }

    const updatedLatestActivity = await updateLatestActivity(id, req.body);

    logger.info(`Successfully Update Latest Activity with id ${id}`);
    return sendResponse(
      res,
      200,
      'Successfully Update Latest Activity',
      updatedLatestActivity,
    );
  } catch (error) {
    logger.error('Failed to Update Latest Activity');
    return sendResponse(res, 500, error.message);
  }
};

exports.deleteLatestActivityById = async (req, res) => {
  try {
    const { id } = req.query;

    const latestActivity = await getLatestActivityById(id);

    if (!latestActivity) {
      logger.error(`Latest Activity with id ${id} not found`);
      return sendResponse(res, 404, 'Latest Activity not found');
    }

    const deletedLatestActivity = await deleteLatestActivity(id);

    logger.info(`Successfully Delete Latest Activity with id ${id}`);
    return sendResponse(
      res,
      200,
      'Successfully Delete Latest Activity',
      deletedLatestActivity,
    );
  } catch (error) {
    logger.error('Failed to Delete Latest Activity');
    return sendResponse(res, 500, error.message);
  }
};
