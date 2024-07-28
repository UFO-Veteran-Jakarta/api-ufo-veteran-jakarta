const { addPartner, getAllPartners } = require("../models/partnerModel");

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
