const logger = require('../utils/logger');
const { sendResponse } = require('../helpers/response');
const {
  getPageBySlug,
  getPageSectionBySlug,
  updatePageSectionBySlug,
} = require('../services/pageService');

exports.getPageBySlug = async (req, res) => {   
  const { slug } = req.params;
  
  try {
    const result = await getPageBySlug(slug);

    if (!result) {
      logger.error(`Page with slug ${slug} not found`);
      return sendResponse(res, 404, 'Page not found');
    }

    logger.info(`Successfully Get Page with slug ${slug}`);
    return sendResponse(
      res,
      200,
      `Successfully retrieved data for page ${result?.title}`,
      result
    );
  } catch (error) {
    logger.error('Failed to Get Page');
    return sendResponse(res, 500, error.message);
  }
};

exports.getPageSectionBySlug = async (req, res) => {   
  const { slug } = req.params;

  try {
    const result = await getPageSectionBySlug(slug);

    if (!result) {
      logger.error(`Editable section data with slug ${slug} not found`);
      return sendResponse(res, 404, 'Editable section data not found');
    }

    logger.info(`Successfully get editable section data with slug ${slug}`);
    return sendResponse(
      res,
      200,
      `Successfully retrieved editable section data for ${slug} page`,
      result,
    );
  } catch (error) {
    logger.error(`Failed to get editable section data for ${slug}`);
    return sendResponse(res, 500, error.message);
  }
};

exports.updatePageSectionBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await getPageSectionBySlug(slug);

    if (!result) {
      logger.error(`Page with slug ${slug} not found`);
      return sendResponse(res, 404, 'pages not found');
    }

    const updatedPage = await updatePageSectionBySlug(slug, req.body);

    logger.info(`Successfully update page section with slug ${slug}`);
    return sendResponse(
      res,
      200,
      `Successfully update ${result?.pages.title} content`,
      updatedPage,
    );
  } catch (error) {
    logger.error(`Failed to update page section for slug ${slug}`);
    return sendResponse(res, 500, error.message);
  }
};
