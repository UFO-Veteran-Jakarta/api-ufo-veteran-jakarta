const {
  addDivision,
  getAllDivisions,
  getDivisionBySlug,
  updateDivisionBySlug,
  deleteDivisionBySlug,
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

exports.getDivisionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const division = await getDivisionBySlug(slug);

    if (!division) {
      logger.error(`Division not found`);
      return sendResponse(res, 404, `Division not found`);
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
    const updateData = {};
    let oldData = await getDivisionBySlug(slug);

    if (!oldData) {
      return res
        .status(404)
        .json({ status: 404, message: 'Division not found' });
    }

    if (req.body.name) {
      updateData.name = req.body.name;
      updateData.slug = await createSlugDivision(
        req.body.name,
        checkSlugExistsInDb,
      );
    }

    if (req.files?.image) {
      const imagePath = uploadFileDivision(req.files.image);
      if (imagePath) {
        updateData.image = imagePath;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ status: 400, message: 'No update data provided' });
    }

    const updatedDivision = await updateDivisionBySlug(
      slug,
      updateData,
    );

    let responseData = {
      id: updatedDivision.id,
    };

    let responseMessage = 'Successfully update division';

    if (updateData.name) {
      responseData.old_name = oldData.name;
      responseData.new_name = updatedDivision.name;
      responseData.old_slug = oldData.slug;
      responseData.new_slug = updatedDivision.slug;
      responseMessage += ' name';
    }

    if (updateData.image) {
      responseData.old_image = oldData.image;
      responseData.new_image = updatedDivision.image;
      responseMessage += updateData.name ? ' and' : '';
      responseMessage += ' image';
    }

    responseData.created_at = updatedDivision.created_at;
    responseData.updated_at = updatedDivision.updated_at;
    responseData.deleted_at = updatedDivision.deleted_at;

    return res.status(200).json({
      status: 200,
      message: responseMessage,
      data: responseData,
    });
  } catch (error) {
    console.error('Error updating division:', error);
    return res
      .status(500)
      .json({ status: 500, message: 'Internal server error' });
  }
};


exports.deleteDivisionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const division = await getDivisionBySlug(slug);

    if (!division) {
      logger.error(`Division with slug ${slug} not found`);
      return sendResponse(res, 404, `Division with slug ${slug} not found`);
    }

    const deletedDivision = await deleteDivisionBySlug(slug);

    logger.info(`Successfully Delete Division with slug ${slug}`);
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
