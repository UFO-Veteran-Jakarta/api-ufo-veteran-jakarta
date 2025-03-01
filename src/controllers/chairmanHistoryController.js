const {
  addChairmanHistory,
  getAllChairmanHistories,
  getChairmanHistoryById,
  updateChairmanHistoryById,
  deleteChairmanHistoryById,
} = require('../services/chairmanHistoryService');

const buildUpdateResponse = require('../utils/updateResponseBuilder');
const logger = require('../utils/logger');
const { sendResponse } = require('../helpers/response');
const fields = require('../validators/chairmanValidator');

exports.addChairmanHistory = async (req, res) => {
  try {
    const result = await addChairmanHistory(req);
    logger.info('Add Success: Success Add chairman');
    return sendResponse(res, 200, 'Successfully Creating a Chairman', result);
  } catch (error) {
    logger.error('Add Error: Failed Add Chairman', error);
    return sendResponse(res, 500, error.message);
  }
};

exports.getAllChairmanHistories = async (req, res) => {
  try {
    const currentPage = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (currentPage - 1) * limit;

    const {
      data: chairmanHistories,
      totalItems,
    } = await getAllChairmanHistories({ limit, offset });

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    if (chairmanHistories.length === 0) {
      logger.info('No chairmans data available.');
      return sendResponse(res, 204, 'No chairmans data are available.', {
        chairmen: [],
        pagination: {
          current_page: currentPage,
          total_pages: totalPages,
          total_items: totalItems,
          limit,
        },
      });
    }

    // Format the response according to the required structure
    const response = {
      chairmen: chairmanHistories,
      pagination: {
        current_page: currentPage,
        total_pages: totalPages,
        total_items: totalItems,
        limit,
      },
    };

    logger.info('Successfully retrieved chairmans data');
    return sendResponse(res, 200, 'Successfully get all chairmans data.', response);
  } catch (error) {
    logger.error('Failed to retrieve chairman histories data:', error);
    return sendResponse(res, 500, error.message, []);
  }
};

exports.getChairmanHistoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const chairmanHistory = await getChairmanHistoryById(id);

    if (!chairmanHistory) {
      logger.info(`Chairman record with id ${id} not found`);
      return sendResponse(res, 404, 'Chairman record not found');
    }

    logger.info('Successfully retrieved chairman data');
    return sendResponse(res, 200, 'Successfully get chairman data', chairmanHistory);
  } catch (error) {
    logger.error('Failed to retrieve chairman data:', error);
    return sendResponse(res, 500, error.message);
  }
};

exports.updateChairmanHistoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Checks the old data existence
    const oldData = await getChairmanHistoryById(id);
    if (!oldData) {
      return sendResponse(res, 404, 'Chairman record not found');
    }

    // Update the data
    const [updatedFields, updatedData] = await updateChairmanHistoryById(id, oldData, req);

    const [responseMessage, responseData] = await buildUpdateResponse({
      fields,
      resource: 'chairman_histories',
      oldData,
      updatedFields,
      updatedData,
    });

    return sendResponse(res, 200, responseMessage, responseData);
  } catch (error) {
    console.error('Error updating chairman history:', error);
    return sendResponse(res, 500, 'Internal server error');
  }
};

exports.deleteChairmanHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const chairmanHistory = await getChairmanHistoryById(id);

    if (!chairmanHistory) {
      logger.error('chairman record not found.');
      return sendResponse(res, 404, 'Chairman record not found.');
    }

    const deletedChairmanHistory = await deleteChairmanHistoryById(id);

    logger.info(`Successfully Delete Chairman with id ${id}`);
    return sendResponse(
      res,
      200,
      'Chairman record successfully deleted',
      deletedChairmanHistory,
    );
  } catch (error) {
    logger.error('Failed to Delete chairman record');
    return sendResponse(res, 500, error.message);
  }
};
