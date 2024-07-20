const pool = require("../config/database");
const { hash } = require("../helpers/bcrypt");

exports.getAllUser = async () => {
  const res = await pool.query("SELECT * FROM users WHERE deleted_at IS NULL");
  return res.rows;
};
exports.getUserByUsername = async (username) => {
  const res = await pool.query(
    `SELECT * FROM users WHERE username = '${username}' AND deleted_at IS NULL`
  );

  return res.rows;
};

exports.deleteContentAll = async () => {
  const res = await pool.query(`UPDATE contents SET deleted_at = NOW()`);
  return res.rows;
};
exports.createUser = async (data) => {
  data.password = await hash(data.password);

  const result =
    await pool.query(`INSERT INTO users (username, password, created_at, updated_at, deleted_at)
      VALUES ('${data.username}', '${data.password}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);`);

  return result.rows;
};
