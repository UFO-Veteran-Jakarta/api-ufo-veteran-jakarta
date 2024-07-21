const pool = require("../config/database");
const { hash } = require("../helpers/bcrypt");

exports.getAllUser = async () => {
  const res = await pool.query(
    "SELECT * FROM myschema.users WHERE deleted_at IS NULL"
  );
  return res.rows;
};
exports.getUserByUsername = async (username) => {
  const res = await pool.query(
    `SELECT * FROM myschema.users WHERE username = '${username}' AND deleted_at IS NULL`
  );

  return res.rows;
};

exports.deleteUserByUsername = async (username) => {
  const res = await pool.query(
    `UPDATE  myschema.users SET deleted_at = NOW() WHERE username = '${username}'`
  );
  return res.rows;
};

exports.createUser = async (data) => {
  data.password = await hash(data.password);

  const result =
    await pool.query(`INSERT INTO myschema.users (username, password, created_at, updated_at, deleted_at)
      VALUES ('${data.username}', '${data.password}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);`);

  return result.rows;
};
