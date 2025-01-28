const contentService = require('../services/contentService');
const { sendResponse } = require('../helpers/response');

const logger = require('../utils/logger');

exports.getAll = async (req, res) => {
  try {
    let result;

    if (req.query?.id) {
      result = await contentService.getContentById(req.query.id);
    } else {
      result = await contentService.getAll();
    }

    logger.info('Get Success: Success Get Content');
    return sendResponse(res, 200, 'Successfully Get All Contents', result);
  } catch (error) {
    logger.error('Get Error: Failed Get Content');
    return sendResponse(res, 500, error.message);
  }
};

exports.getContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await contentService.getContentById(id);

    logger.info('Get Success: Success Get Content');
    return sendResponse(res, 200, 'Successfully Get Content', result);
  } catch (error) {
    logger.error('Get Error: Failed Get Content');
    return sendResponse(res, 500, error.message);
  }
};

exports.addContent = async (req, res) => {
  try {
    const result = await contentService.addContent(req.body);

    logger.info('Add Success: Success Add Content');
    return sendResponse(res, 200, 'Successfully Add New Content', result);
  } catch (error) {
    logger.error('Add Error: Failed Add Content');
    return sendResponse(res, 500, error.message);
  }
};

exports.updateContent = async (req, res) => {
  try {
    if (!req.query?.id) {
      return sendResponse(res, 404, 'Content Not Found');
    }

    const findContent = await contentService.getContentById(req.query.id);
    if (!findContent.length) {
      return sendResponse(res, 404, 'Content Not Found');
    }
    const result = await contentService.updateContent(
      req.query.id,
      req.body.link,
    );

    logger.info('Update Success: Success Updated Content');
    return sendResponse(res, 200, 'Successfully Update Content', result);
  } catch (error) {
    logger.error('Update Error: Failed Update Content');
    return sendResponse(res, 500, error.message);
  }
};

exports.updateContentById = async (req, res) => {
  try {
    const { id } = req.params;

    const existingContent = await contentService.getContentByIdParams(id);
    if (!existingContent) {
      return sendResponse(res, 404, 'Content not found');
    }

    const oldLink = existingContent.link;

    const updatedContent = await contentService.updateContentById(id, req.body);

    const response = {
      id: updatedContent.id,
      old_link: oldLink,
      new_link: updatedContent.link,
      created_at: updatedContent.created_at,
      updated_at: updatedContent.updated_at,
      deleted_at: updatedContent.deleted_at,
    };

    logger.info('Update Success: Successfully updated content');
    return sendResponse(res, 200, 'Successfully Updated Content', response);
  } catch (error) {
    logger.error('Update Error: Failed to update content');
    return sendResponse(res, 500, error.message);
  }
};

exports.deleteContent = async (req, res) => {
  try {
    if (!req.query?.id) {
      return sendResponse(res, 404, 'Content Not Found');
    }

    const findContent = await contentService.getContentById(req.query.id);
    if (!findContent.length) {
      return sendResponse(res, 404, 'Content Not Found');
    }

    await contentService.deleteContent(req.query.id);
    logger.info('Delete Success: Success Deleted Content');
    return sendResponse(res, 200, 'Successfully Delete Content');
  } catch (err) {
    logger.error('Delete Error: Failed Delete Content');
    return sendResponse(res, 500, err.message);
  }
};
