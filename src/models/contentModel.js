const pool = require('../config/database');

exports.getAllContent = async () => {
  const res = await pool.query(
    'SELECT * FROM contents WHERE deleted_at IS NULL',
  );
  return res.rows;
};

exports.getContentById = async (id) => {
  try {
    const res = await pool.query(
      'SELECT * FROM contents WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return res.rows;
  } catch (err) {
    return [];
  }
};

exports.addContent = async (data) => {
  const res =
    await pool.query(`INSERT INTO contents (link, created_at, updated_at, deleted_at)
      VALUES ('${data.link}',   CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL) RETURNING *;`);

  return res.rows;
};

exports.getUserByUsername = async (username) => {
  const res = await pool.query(
    `SELECT * FROM users WHERE username = '${username}' AND deleted_at IS NULL`,
  );

  return res.rows;
};

exports.updateContent = async (id, link) => {
  const res = await pool.query(
    'UPDATE contents SET link = $1 WHERE id = $2 RETURNING *',
    [link, id],
  );

  return res.rows;
};

exports.deleteContentAll = async () => {
  const res = await pool.query(
    'UPDATE contents SET deleted_at = NOW()',
  );
  return res.rows;
};

exports.deleteContent = async (id) => {
  const res = await pool.query(
    'UPDATE contents SET deleted_at = NOW() WHERE id = $1',
    [id],
  );

  return res.rows;
};
