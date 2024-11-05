const {
  addDivision,
  getAllDivisions,
  getDivisionBySlug,
  updateDivisionBySlug,
  deleteDivisionBySlug,
  checkSlugExistsInDb,
  stageDataUpdateDivisionBySlug
} = require('../services/divisionService');
const { buildResponse } = require('../utils/buildResponseDivision');
const logger = require('../utils/logger');
const { sendResponse } = require('../helpers/response');
const { createSlugDivision } = require('../helpers/slug');
const { uploadFileDivision } = require('../utils/uploadFileDivision');

exports.addDivision = async (req, res) => {
  try {
    req.body.slug = await createSlugDivision(
      req.body.name,
      checkSlugExistsInDb,
    );

    if (req.files?.image) {
      const imagePath = await uploadFileDivision(req.files.image);
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

exports.getAllDivisions = async (req, res) => {
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

exports.getDivisionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const division = await getDivisionBySlug(slug);

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
    const oldData = await getDivisionBySlug(slug);

    // Checks the old data existence
    if (!oldData) {
      return sendResponse(res, 404, 'Division not found');
    }

    // Stage the update data payload before inserted into database
    const [isUpdateData, updateData] = await stageDataUpdateDivisionBySlug(req);
    if (!isUpdateData) {
      return sendResponse(res, 400, 'No update data provided');
    }

    // Update the data
    const updatedDivision = await updateDivisionBySlug(slug, oldData, updateData);

    // Build the response
    const [responseMessage, responseData] = await buildResponse(
      oldData, updateData, updatedDivision
    );

    return sendResponse(res, 200, responseMessage, responseData);
  } catch (error) {
    console.error('Error updating division:', error);
    return sendResponse(res, 500, 'Internal server error');
  }
};

exports.deleteDivisionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const division = await getDivisionBySlug(slug);

    if (!division) {
      logger.error('Division not found.');
      return sendResponse(res, 404, 'Division not found.');
    }

    const deletedDivision = await deleteDivisionBySlug(slug);

    logger.info(`Successfully Delete Division with slug ${slug}`);
    return sendResponse(
      res,
      200,
      'Successfully delete division data',
      deletedDivision,
    );
  } catch (error) {
    logger.error('Failed to Delete Division');
    return sendResponse(res, 500, error.message);
  }
};
