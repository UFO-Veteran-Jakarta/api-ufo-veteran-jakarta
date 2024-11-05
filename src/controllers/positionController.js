const {
  getAllPositions,
  getPositionById,
  addPosition,
  updatePositionById,
  deletePositionById,
  deleteAllPositions,
} = require('../services/positionService');
const logger = require('../utils/logger');
const { sendResponse } = require('../helpers/response');

exports.addPosition = async (req, res) => {
  try {
    const newPosition = await addPosition(req.body);
    logger.info('Add Success: Success Add Position');
    return sendResponse(res, 201, 'Successfully insert position data', newPosition);
  } catch (error) {
    logger.error('Add Error: Failed Add Position', error);
    return sendResponse(res, 500, error.message);
  }
};

exports.getAllPositions = async (req, res) => {
  try {
    const allPositions = await getAllPositions();

    if (allPositions.length === 0) {
      logger.info('No positions data are available.');
      return sendResponse(res, 204, 'No positions data are available.', []);
    }

    logger.info('Get Success: Success Get Position');
    return sendResponse(
      res,
      200,
      'Successfully retrieved all positions data',
      allPositions,
    );
  } catch (error) {
    logger.error('Failed to retrieved positions data.');
    return sendResponse(res, 500, error.message);
  }
};

exports.getPositionById = async (req, res) => {
  try {
    const { id } = req.params;
    const positionById = await getPositionById(id);

    if (!positionById) {
      return sendResponse(res, 404, 'Position Not Found');
    }

    logger.info('Get Success: Success Get Position');
    return sendResponse(res, 200, 'Successfully Get Position', positionById);
  } catch (error) {
    logger.error('Get Error: Failed Get Position');
    return sendResponse(res, 500, error.message);
  }
};

exports.updatePositionById = async (req, res) => {
  try {
    const { id } = req.params;

    const positionById = await getPositionById(id);
    if (!positionById) {
      return sendResponse(res, 404, 'Position Not Found');
    }

    const updatedPosition = await updatePositionById(id, req.body);
    logger.info('Update Success: Successfully update position name');
    return sendResponse(
      res,
      201,
      'Successfully update position name',
      updatedPosition,
    );
  } catch (error) {
    logger.error('Update Error: Failed to update position name');
    return sendResponse(res, 500, error.message);
  }
};

exports.deleteAllPositions = async (req, res) => {
  try {
    const deletePositions = await deleteAllPositions();
    logger.info('Delete Success: Successfully delete all positions');
    return sendResponse(res, 200, 'Successfully delete all positions', deletePositions);
  } catch (error) {
    logger.error('Delete Error: Failed to delete all positions');
    return sendResponse(res, 500, error.message);
  }
};

exports.deletePositionById = async (req, res) => {
  try {
    const { id } = req.params;
    const positionById = await getPositionById(id);
    if (!positionById) {
      return sendResponse(res, 404, 'Position Not Found');
    }

    await deletePositionById(id);
    logger.info('Delete Success: Successfully delete position');
    return sendResponse(res, 200, 'Successfully delete position');
  } catch (error) {
    logger.error('Delete Error: Failed to delete position');
    return sendResponse(res, 500, error.message);
  }
};
