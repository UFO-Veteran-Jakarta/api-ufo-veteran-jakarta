const {
  addFounderMember,
  getAllFounderMembers,
  getFounderMemberById,
  updateFounderMemberById,
  deleteFounderMemberById,
} = require('../services/founderMemberService');

const buildUpdateResponse = require('../utils/updateResponseBuilder');
const logger = require('../utils/logger');
const { sendResponse } = require('../helpers/response');
const fields = require('../validators/founderMemberValidator');

exports.addFounderMember = async (req, res) => {
  try {
    const result = await addFounderMember(req);
    logger.info('Add Success: Success Add Founder Member');
    return sendResponse(res, 200, 'Successfully Creating a Founder Member', result);
  } catch (error) {
    logger.error('Add Error: Failed Add Founder Member', error);
    return sendResponse(res, 500, error.message);
  }
};

exports.getAllFounderMembers = async (req, res) => {
  try {
    const currentPage = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (currentPage - 1) * limit;

    const { data: founderMembers, totalItems } = await getAllFounderMembers({ limit, offset });

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    if (founderMembers.length === 0) {
      logger.info('No founder members data available.');
      return sendResponse(res, 204, 'No founder members data are available.', {
        founders: [],
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
      founders: founderMembers,
      pagination: {
        current_page: currentPage,
        total_pages: totalPages,
        total_items: totalItems,
        limit,
      },
    };

    logger.info('Successfully retrieved founder members data');
    return sendResponse(res, 200, 'Successfully get all founder members data.', response);
  } catch (error) {
    logger.error('Failed to retrieve founder members data:', error);
    return sendResponse(res, 500, error.message, []);
  }
};

exports.getFounderMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const founderMember = await getFounderMemberById(id);

    if (!founderMember) {
      logger.info(`Founder member with id ${id} not found`);
      return sendResponse(res, 404, 'Founder member not found');
    }

    logger.info('Successfully retrieved founder member data');
    return sendResponse(res, 200, 'Successfully get founder member data', founderMember);
  } catch (error) {
    logger.error('Failed to retrieve founder member data:', error);
    return sendResponse(res, 500, error.message);
  }
};

exports.updateFounderMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    // Checks the old data existence
    const oldData = await getFounderMemberById(id);
    if (!oldData) {
      return sendResponse(res, 404, 'Founder Member not found');
    }

    // Update the data
    const [updatedFields, updatedData] = await updateFounderMemberById(id, oldData, req);

    const [responseMessage, responseData] = await buildUpdateResponse({
      fields,
      resource: 'founder_members',
      oldData,
      updatedFields,
      updatedData,
    });

    return sendResponse(res, 200, responseMessage, responseData);
  } catch (error) {
    console.error('Error updating founder member:', error);
    return sendResponse(res, 500, 'Internal server error');
  }
};

exports.deleteFounderMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const founderMember = await getFounderMemberById(id);

    if (!founderMember) {
      logger.error('founder member not found.');
      return sendResponse(res, 404, 'founder member not found.');
    }

    const deletedFounderMember = await deleteFounderMemberById(id);

    logger.info(`Successfully Delete Founder Member with id ${id}`);
    return sendResponse(
      res,
      200,
      'Successfully delete founder member data',
      deletedFounderMember,
    );
  } catch (error) {
    logger.error('Failed to Delete Founder Member');
    return sendResponse(res, 500, error.message);
  }
};
