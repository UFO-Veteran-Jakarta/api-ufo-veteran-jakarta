const {
  addDivision,
  getAllDivisions,
  getDivisionById,
  updateDivisionById,
  deleteDivisionById,
} = require('../services/divisionSerice');
const logger = require('../utils/logger');
const { sendResponse } = require('../helpers/response');

exports.addDivision = async (req, res) => {
  try {
    const result = await addDivision(req.body);

    logger.info('Add Success: Success Add Division');
    return sendResponse(res, 200, 'Successfully Add New Division', result);
  } catch (error) {
    logger.error('Add Error: Failed Add Division');
    return sendResponse(res, 500, error.message);
  }
};

exports.getAllDivisions = async (req, res, next) => {
  try {
    if (req.query.id) {
      return next();
    }

    const divisions = await getAllDivisions();
    logger.info('Successfully Get All Divisions');
    return sendResponse(res, 200, 'Successfully Get All Divisions', divisions);
  } catch (error) {
    logger.error('Failed to Get All Divisions');
    return sendResponse(res, 500, 'Failed to Get All Divisions');
  }
};

exports.getDivisionById = async (req, res) => {
  try {
    const { id } = req.query;
    const division = await getDivisionById(id);

    if (!division) {
      logger.error(`Division with id ${id} not found`);
      return sendResponse(res, 404, `Division with id ${id} not found`);
    }

    logger.info(`Successfully Get Division with id ${id}`);
    return sendResponse(res, 200, 'Successfully Get Division', division);
  } catch (error) {
    logger.error('Failed to Get Division');
    return sendResponse(res, 500, error.message);
  }
};

exports.updateDivisionById = async (req, res) => {
  try {
    const { id } = req.query;
    const division = await getDivisionById(id);

    if (!division) {
      logger.error(`Division with id ${id} not found`);
      return sendResponse(res, 404, `Division with id ${id} not found`);
    }

    const updatedDivision = await updateDivisionById(id, req.body);

    logger.info(`Successfully Update Division with id ${id}`);
    return sendResponse(
      res,
      200,
      'Successfully Update Division',
      updatedDivision,
    );
  } catch (error) {
    logger.error('Failed to Update Division');
    return sendResponse(res, 500, error.message);
  }
};

exports.deleteDivisionById = async (req, res) => {
  try {
    const { id } = req.query;

    const division = await getDivisionById(id);

    if (!division) {
      logger.error(`Division with id ${id} not found`);
      return sendResponse(res, 404, `Division with id ${id} not found`);
    }

    const deletedDivision = await deleteDivisionById(id);

    logger.info(`Successfully Delete Division with id ${id}`);
    return sendResponse(
      res,
      200,
      'Successfully Delete Division',
      deletedDivision,
    );
  } catch (error) {
    logger.error('Failed to Delete Division');
    return sendResponse(res, 500, error.message);
  }
};
