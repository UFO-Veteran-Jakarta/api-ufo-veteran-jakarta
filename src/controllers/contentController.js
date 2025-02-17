const contentService = require('../services/contentService');
const { sendResponse } = require('../helpers/response');
const buildUpdateResponse = require('../utils/updateResponseBuilder');
const fields = require('../validators/contentValidator');

const logger = require('../utils/logger');

exports.getAllContents = async (req, res) => {
  try {
    if (req.query?.id) {
      logger.info('Get Success: Success Get Content by Id');
      const result = await contentService.getContentById(req.query.id);
      return sendResponse(res, 200, 'Successfully Get Content by Id', result);
    } else {
      logger.info('Get Success: Success Get All Contents');
      const result = await contentService.getAllContents();
      return sendResponse(res, 200, 'Successfully Get All Contents', result);
    }
  } catch (error) {
    logger.error('Get Error: Failed Get Content');
    return sendResponse(res, 500, error.message);
  }
};

exports.getContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await contentService.getContentById(id);

    logger.info('Get Success: Success Get Content by Id');
    return sendResponse(res, 200, 'Successfully Get Content by Id', result);
  } catch (error) {
    logger.error('Get Error: Failed Get Content');
    return sendResponse(res, 500, error.message);
  }
};

exports.addContent = async (req, res) => {
  try {
    const result = await contentService.addContent(req);

    logger.info('Add Success: Success Add Content');
    return sendResponse(res, 200, 'Successfully Add New Content', result);
  } catch (error) {
    logger.error('Add Error: Failed Add Content');
    return sendResponse(res, 500, error.message);
  }
};

exports.updateContentById = async (req, res) => {
  try {
    const id = req.query?.id || req.params?.id;

    const oldData = await contentService.getContentById(id);
    if (!oldData) {
      return sendResponse(res, 404, 'Content not found');
    }

    const [updatedFields, updatedData] = await contentService.updateContentById(
      id, oldData, req,
    );
    if (!updatedData) {
      return sendResponse(res, 400, 'Invalid payload');
    }

    const [responseMessage, responseData] = await buildUpdateResponse({
      fields,
      resource: 'content',
      oldData,
      updatedFields,
      updatedData,
    });

    logger.info('Update Success: Successfully updated content');
    return sendResponse(res, 200, responseMessage, responseData);
  } catch (error) {
    logger.error('Update Error: Failed to update content');
    return sendResponse(res, 500, error.message);
  }
};

exports.deleteContentById = async (req, res) => {
  try {
    const id = req.query?.id || req.params?.id;
    if (!id) {
      return sendResponse(res, 400, 'ID required');
    }

    const findContent = await contentService.getContentById(id);
    if (!findContent) {
      return sendResponse(res, 404, 'Content Not Found');
    }

    const deletedContent = await contentService.deleteContentById(id);

    logger.info('Delete Success: Success Deleted Content');
    return sendResponse(res, 200, 'Successfully Delete Content', deletedContent);
  } catch (error) {
    logger.error('Delete Error: Failed Delete Content');
    return sendResponse(res, 500, error.message);
  }
};
