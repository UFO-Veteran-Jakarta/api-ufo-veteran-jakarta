const {
  addPartner,
  getAllPartners,
  updatePartner,
  getPartnerById,
} = require("../models/partnerModel");

exports.addPartner = async (data) => {
  return await addPartner(data);
};

exports.getAllPartners = async () => {
  try {
    return await getAllPartners();
  } catch (error) {
    console.error("Error fetching partners:", error);
    throw error;
  }
};

exports.getPartnerById = async (id) => {
  return await getPartnerById(id);
};

exports.updatePartner = async (id, data) => {
  return await updatePartner(id, data);
};
