const userService = require('../services/useService');
const { sendResponse } = require('../helpers/response');
const logger = require('../utils/logger');

exports.getAllUsers = async (req, res) => {
  try {
    const data = await userService.getAllUser();
    logger.info('Get All User Success');
    return sendResponse(res, 200, 'Get All User Success', data);
  } catch (error) {
    logger.error('Get All User Error');
    return sendResponse(res, 500, error.message);
  }
};
