const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

exports.getAllUser = async () => {
  return userModel.getAllUser();
};

exports.getUserByUsername = async (username) => {
  return userModel.getUserByUsername(username);
};

exports.createUser = async (data) => {
  return userModel.createUser(data);
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
