const userModel = require('../models/userModel');

exports.getAllUser = async () => {
  return userModel.getAllUser();
};
