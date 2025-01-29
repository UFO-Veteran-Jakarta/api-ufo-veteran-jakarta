const {
  addGallery,
  getAllGalleries,
  getGalleryBySlug,
  updateGalleryBySlug,
  deleteGalleryBySlug,
  checkSlugExistsInDb,
  stageDataUpdateGalleryBySlug,
} = require('../services/galleryService');
const { getCategoryGalleryById } = require('../services/categoryGalleryService');
const { buildResponse } = require('../utils/buildResponseGallery');
const logger = require('../utils/logger');
const { sendResponse } = require('../helpers/response');
const { createSlugDivision } = require('../helpers/slug');
const { uploadFileGallery } = require('../utils/uploadFileGallery');

exports.addGallery = async (req, res) => {
  try {
    req.body.slug = await createSlugDivision(
      req.body.title,
      checkSlugExistsInDb,
    );

    const { category_galleries_id } = req.body;

    const categoryGallery = await getCategoryGalleryById(category_galleries_id);
    if (!categoryGallery) {
      return sendResponse(res, 404, 'Category gallery not found');
    }

    if (req.files?.image) {
      const imagePath = await uploadFileGallery(req.files.image);
      if (imagePath) {
        req.body.image = imagePath;
      }
    }

    const result = await addGallery(req.body);

    logger.info('Add Success: Success Add Gallery');
    return sendResponse(res, 201, 'Successfully insert gallery data', result);
  } catch (error) {
    logger.error('Add Error: Failed Add Gallery', error);
    return sendResponse(res, 500, error.message);
  }
};

exports.getAllGalleries = async (req, res) => {
  try {
    const galleries = await getAllGalleries();

    if (galleries.length === 0) {
      logger.info('No galleries data available.');
      return sendResponse(res, 204, 'No galleries data are available.', []);
    }

    logger.info('Successfully retrieved all galleries data');
    return sendResponse(
      res,
      200,
      'Successfully retrieved all galleries data',
      galleries,
    );
  } catch (error) {
    logger.error('Failed to retrieve galleries data:', error);
    return sendResponse(res, 500, 'Failed to retrieve galleries data.', []);
  }
};

exports.getGalleryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const gallery = await getGalleryBySlug(slug);

    if (!gallery) {
      logger.error('Gallery not found');
      return sendResponse(res, 404, 'Gallery not found');
    }

    logger.info(`Successfully Get Gallery with slug '${slug}'`);
    return sendResponse(res, 200, 'Successfully Get Gallery', gallery);
  } catch (error) {
    logger.error('Failed to Get Gallery', error);
    return sendResponse(res, 500, error.message);
  }
};

exports.updateGalleryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const oldData = await getGalleryBySlug(slug);

    // Checks the old data existence
    if (!oldData) {
      return sendResponse(res, 404, 'Gallery not found');
    }

    const { category_galleries_id } = req.body;
    if (category_galleries_id) {
      const categoryGallery = await getCategoryGalleryById(category_galleries_id);
      
      if (!categoryGallery) {
        return sendResponse(res, 404, 'Category gallery not found');
      }
    }

    // Stage the update data payload before inserted into database
    let updateData = await stageDataUpdateGalleryBySlug(req);
    updateData = { ...updateData, ...req.body };

    // Update the data
    const updatedGallery = await updateGalleryBySlug(slug, oldData, updateData);

    // Build the response
    const [responseMessage, responseData] = await buildResponse(
      oldData,
      updateData,
      updatedGallery,
    );

    return sendResponse(res, 200, responseMessage, responseData);
  } catch (error) {
    console.error('Error updating gallery:', error);
    return sendResponse(res, 500, 'Internal server error');
  }
};

exports.deleteGalleryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const gallery = await getGalleryBySlug(slug);

    if (!gallery) {
      logger.error('Gallery not found.');
      return sendResponse(res, 404, 'Gallery not found.');
    }

    const deletedGallery = await deleteGalleryBySlug(slug);

    logger.info(`Successfully Delete Gallery with slug ${slug}`);
    return sendResponse(
      res,
      200,
      'Successfully delete gallery data',
      deletedGallery,
    );
  } catch (error) {
    logger.error('Failed to Delete Gallery');
    return sendResponse(res, 500, error.message);
  }
};
