const { pool } = require('../config/database');
const { hash } = require('../helpers/bcrypt');

exports.getAllUser = async () => {
  const res = await pool.query(
    'SELECT * FROM users WHERE deleted_at IS NULL',
  );
  return res.rows;
};

exports.getUserByUsername = async (username) => {
  const res = await pool.query(
    'SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL',
    [username],
  );

  return res.rows;
};

exports.deleteUserByUsername = async (username) => {
  const res = await pool.query(
    `UPDATE users SET deleted_at = NOW() WHERE username = '${username}'`,
  );
  return res.rows;
};

exports.createUser = async (data) => {
  const hashedPassword = await hash(data.password);

  const result = await pool.query(
    `INSERT INTO users (username, password, created_at, updated_at, deleted_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL) RETURNING *;`,
    [data.username, hashedPassword],
  );

  return result.rows;
};
