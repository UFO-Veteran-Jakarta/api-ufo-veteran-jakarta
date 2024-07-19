const pool = require("../config/database");
const { hash } = require("../helpers/bcrypt");

exports.getAllUser = async () => {
  const res = await pool.query("SELECT * FROM users");
  return res.rows;
};
exports.getUserByUsername = async (username) => {
  const res = await pool.query(
    `SELECT * FROM users WHERE username = '${username}'`
  );
  return res.rows;
};
exports.deleteUserByUsername = async (username) => {
  const res = await pool.query(
    `DELETE FROM users WHERE username = '${username}'`
  );
  return res.rows;
};

exports.createUser = async (data) => {
  data.password = await hash(data.password);

  const result =
    await pool.query(`INSERT INTO users (username, password, created_at, updated_at, deleted_at)
      VALUES ('${data.username}', '${data.password}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);`);

  return result.rows;
};
