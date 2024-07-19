const userModel = require("../models/userModel");

exports.getUser = async () => {
  return await userModel.getAllUser();
};

exports.getUserByUsername = async (username) => {
  return await userModel.getUserByUsername(username);
};

exports.createUser = async (data) => {
  return await userModel.createUser(data);
};
