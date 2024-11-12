const divisionService = require('../services/divisionService');
const { sendResponse } = require('../helpers/response');
const logger = require('../utils/logger');

exports.addDivision = async (req, res) => {
  try {
    const result = await divisionService.addDivision(
      req.body,
      req.files?.image,
    );
    logger.info('Add Success: Success Add Division');
    return sendResponse(res, 201, 'Successfully insert division data', result);
  } catch (error) {
    logger.error('Add Error: Failed Add Division', error);
    return sendResponse(res, error.statusCode || 500, error.message);
  }
};

exports.getAllDivisions = async (req, res) => {
  try {
    const divisions = await divisionService.getAllDivisions();
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

exports.getDivisionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const division = await divisionService.getDivisionBySlug(slug);
    if (!division) {
      logger.error('Division not found');
      return sendResponse(res, 404, 'Division not found');
    }
    logger.info(`Successfully Get Division with slug '${slug}'`);
    return sendResponse(res, 200, 'Successfully Get Division', division);
  } catch (error) {
    logger.error('Failed to Get Division', error);
    return sendResponse(res, 500, error.message);
  }
};

exports.updateDivisionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await divisionService.updateDivisionBySlug(
      slug,
      req.body,
      req.files?.image,
    );
    logger.info(`Successfully updated Division with slug '${slug}'`);
    return sendResponse(res, 200, 'Successfully updated division data', result);
  } catch (error) {
    logger.error('Failed to update Division', error);
    return sendResponse(res, error.statusCode || 500, error.message);
  }
};

exports.deleteDivisionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await divisionService.deleteDivisionBySlug(slug);
    logger.info(`Successfully Delete Division with slug ${slug}`);
    return sendResponse(res, 200, 'Successfully delete division data', result);
  } catch (error) {
    logger.error('Failed to Delete Division', error);
    return sendResponse(res, error.statusCode || 500, error.message);
  }
};
