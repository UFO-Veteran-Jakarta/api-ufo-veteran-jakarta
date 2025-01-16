const { updatePartnerById } = require('../controllers/partnerController');
const {
  addPartner,
  getAllPartners,
  updatePartner,
  getPartnerById,
  deletePartner,
} = require('../models/partnerModel');

exports.addPartner = async (data) => {
  return addPartner(data);
};

exports.getAllPartners = async () => {
  try {
    return await getAllPartners();
  } catch (error) {
    console.error('Error fetching partners:', error);
    throw error;
  }
};

exports.getPartnerById = async (id) => {
  return getPartnerById(id);
};

exports.updatePartner = async (id, data) => {
  return updatePartner(id, data);
};

exports.deletePartner = async (id) => {
  return deletePartner(id);
};
