const logger = require('../utils/logger');
const { sendResponse } = require('../helpers/response');
const { uploadFile } = require('../utils/fileUpload');
const {
  addFormattedMember,
  getFormattedMembers,
  formatMember,
} = require('../collections/memberCollection');
const { buildResponse } = require('../utils/buildUpdateResponse');

const {
  stageDataUpdateMemberById,
  updateMemberById,
  getMemberById,
  deleteMemberById,
} = require('../services/memberService');

// Untuk menambahkan member baru
exports.addMember = async (req, res) => {
  try {
    if (req.files?.image) {
      const imagePath = await uploadFile(req.files.image, 'members');
      if (imagePath) {
        req.body.image = imagePath;
      }
    }

    // Menambahkan member dan memformat responsnya
    const formattedMember = await addFormattedMember(req.body);

    logger.info('Add Success: Successfully added member');
    return sendResponse(res, 201, 'Successfully inserted member data', [
      formattedMember,
    ]);
  } catch (error) {
    logger.error('Add Error: Failed to add member', error);
    return sendResponse(res, 500, error.message);
  }
};

// Untuk mengambil semua member
exports.getAllMembers = async (req, res) => {
  try {
    const members = await getFormattedMembers();

    if (members.length === 0) {
      logger.info('No members data available.');
      return sendResponse(res, 204, 'No members data are available.', []);
    }

    logger.info('Successfully retrieved all members data');
    return sendResponse(
      res,
      200,
      'Successfully retrieved all members data',
      members,
    );
  } catch (error) {
    logger.error('Failed to retrieve members data:', error);
    return sendResponse(res, 500, 'Failed to retrieve members data.', []);
  }
};

// Untuk mengambil member berdasarkan ID
exports.getMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const formattedMember = await getMemberById(id);

    if (!formattedMember) {
      logger.error('Member not found');
      return sendResponse(res, 404, 'Member not found');
    }

    const member = formatMember(formattedMember);

    logger.info(`Successfully retrieved member with ID '${id}'`);
    return sendResponse(
      res,
      200,
      'Successfully retrieved member',
      member,
    );
  } catch (error) {
    logger.error('Failed to retrieve member', error);
    return sendResponse(res, 500, error.message);
  }
};

// Untuk memperbarui data member
exports.updateMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const oldMemberData = await getMemberById(id);

    if (!oldMemberData) {
      return sendResponse(res, 404, 'Member not found');
    }

    const [isUpdateData, updateData] = await stageDataUpdateMemberById(req);
    if (!isUpdateData) {
      return sendResponse(res, 400, 'No update data provided');
    }

    const updatedMember = await updateMemberById(id, oldMemberData, updateData);

    const [responseMessage, responseData] = await buildResponse(
      oldMemberData,
      updateData,
      updatedMember,
    );

    return sendResponse(res, 200, responseMessage, responseData);
  } catch (error) {
    console.error('Error updating member:', error);
    return sendResponse(res, 500, 'Internal server error');
  }
};

exports.deleteMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteMemberById(id);

    return sendResponse(res, 200, 'Successfully deleted member', result);
  } catch (error) {
    console.error('Error deleting member:', error);
    return sendResponse(res, 500, 'Internal server error');
  }
};
