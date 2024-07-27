const { addPartner } = require("../models/partnerModel");

exports.addPartner = async (data) => {
  return await addPartner(data);
};
