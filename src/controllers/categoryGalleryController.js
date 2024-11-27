const {
  addCategoryGallery,
  getAllCategoryGalleries,
  getCategoryGalleryById,
  updateCategoryGalleryById,
  deleteCategoryGalleryById,
  stageDataUpdateCategoryGalleryById,
} = require('../services/categoryGalleryService');
const { buildResponse } = require('../utils/buildResponseGallery');
const logger = require('../utils/logger');
const { sendResponse } = require('../helpers/response');

exports.addCategoryGallery = async (req, res) => {
  try {
    const result = await addCategoryGallery(req.body);

    logger.info('Add Success: Success Add Category Gallery');
    return sendResponse(res, 201, 'Successfully insert category gallery data', result);
  } catch (error) {
    logger.error('Add Error: Failed Add Category Gallery', error);
    return sendResponse(res, 500, error.message);
  }
};

exports.getAllCategoryGalleries = async (req, res) => {
  try {
    const galleries = await getAllCategoryGalleries();

    if (galleries.length === 0) {
      logger.info('No category galleries data available.');
      return sendResponse(res, 204, 'No category galleries data are available.', []);
    }

    logger.info('Successfully retrieved all category galleries data');
    return sendResponse(
      res,
      200,
      'Successfully retrieved all category galleries data',
      galleries,
    );
  } catch (error) {
    logger.error('Failed to retrieve category galleries data:', error);
    return sendResponse(res, 500, 'Failed to retrieve category galleries data.', []);
  }
};

exports.getCategoryGalleryById = async (req, res) => {
  try {
    const { id } = req.params;
    const gallery = await getCategoryGalleryById(id);

    if (!gallery) {
      logger.error('Category gallery not found');
      return sendResponse(res, 404, 'Category gallery not found');
    }

    logger.info(`Successfully Get Category Gallery with id '${id}'`);
    return sendResponse(res, 200, 'Successfully Get Category Gallery', gallery);
  } catch (error) {
    logger.error('Failed to Get Category Gallery', error);
    return sendResponse(res, 500, error.message);
  }
};

exports.updateCategoryGalleryById = async (req, res) => {
  try {
    const { id } = req.params;
    const oldData = await getCategoryGalleryById(id);

    // Checks the old data existence
    if (!oldData) {
      return sendResponse(res, 404, 'Category gallery not found');
    }

    // Stage the update data payload before inserted into database
    const [isUpdateData, updateData] = await stageDataUpdateCategoryGalleryById(id);
    if (!isUpdateData) {
      return sendResponse(res, 400, 'No update data provided');
    }

    // Update the data
    const updatedGallery = await updateCategoryGalleryById(slug, oldData, updateData);

    // Build the response
    const [responseMessage, responseData] = await buildResponse(
      oldData,
      updateData,
      updatedGallery,
    );

    return sendResponse(res, 200, responseMessage, responseData);
  } catch (error) {
    console.error('Error updating category gallery:', error);
    return sendResponse(res, 500, 'Internal server error');
  }
};

exports.deleteCategoryGalleryById = async (req, res) => {
  try {
    const { id } = req.params;
    const gallery = await getCategoryGalleryById(id);

    if (!gallery) {
      logger.error('Category gallery not found.');
      return sendResponse(res, 404, 'Category gallery not found.');
    }

    const deletedGallery = await deleteCategoryGalleryById(id);

    logger.info(`Successfully Delete Category Gallery with id ${id}`);
    return sendResponse(
      res,
      200,
      'Successfully delete category gallery data',
      deletedGallery,
    );
  } catch (error) {
    logger.error('Failed to Delete Category Gallery');
    return sendResponse(res, 500, error.message);
  }
};
