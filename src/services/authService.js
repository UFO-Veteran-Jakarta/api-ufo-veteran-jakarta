const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.getAllUser = async () => {
  return await userModel.getAllUser();
};

exports.getUserByUsername = async (username) => {
  return await userModel.getUserByUsername(username);
};

exports.createUser = async (data) => {
  return await userModel.createUser(data);
};

exports.login = async (data) => {
  const user = await userModel.getUserByUsername(data.username);
  if (!user.length) {
    return false;
  }

  if (!(await bcrypt.compare(data.password, user[0].password))) {
    return false;
  }
  const me = user[0];
  return {
    id: me.id,
    username: me.username,
    created_at: me.created_at,
    updated_at: me.updated_at,
  };
};
