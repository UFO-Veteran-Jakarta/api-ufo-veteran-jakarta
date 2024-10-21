const {
  addDivision,
  getAllDivisions,
  getDivisionById,
  updateDivisionById,
  deleteDivisionById,
  checkSlugExistsInDb,
} = require('../services/divisionSerice');
const logger = require('../utils/logger');
const { sendResponse } = require('../helpers/response');
const {createSlugDivision } = require('../helpers/slug');
const uploadFileDivision = require('../utils/uploadFileDivision');

exports.addDivision = async (req, res) => {
  try {
    req.body.slug = await createSlugDivision(
      req.body.name,
      checkSlugExistsInDb,
    );

    if (req.files?.image) {
      const imagePath = uploadFileDivision(req.files.image);
      if (imagePath) {
        req.body.image = imagePath;
      }
    }

    const result = await addDivision(req.body);

    logger.info('Add Success: Success Add Division');
    return sendResponse(res, 201, 'Successfully insert division data', result);
  } catch (error) {
    logger.error('Add Error: Failed Add Division', error);
    return sendResponse(res, 500, error.message);
  }
};

exports.getAllDivisions = async (req, res, next) => {
  try {
    const divisions = await getAllDivisions();

    if (divisions.length === 0) {
      logger.info('No divisions data available.');
      return sendResponse(res, 204, 'No divisions data are available.', []);
    }

    logger.info('Successfully retrieved all divisions data');
    return sendResponse(
      res,
      200,
      'Successfully retrieved all divisions data',
      divisions,
    );
  } catch (error) {
    logger.error('Failed to retrieve divisions data:', error);
    return sendResponse(res, 500, 'Failed to retrieve divisions data.', []);
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
