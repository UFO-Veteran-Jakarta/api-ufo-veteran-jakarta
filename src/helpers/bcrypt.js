const bcrypt = require("bcrypt");
exports.hash = async (password) => {
  return await bcrypt.hash(password, 10);
};
