const pool = require("../config/database");
const { hash } = require("../helpers/bcrypt");

exports.getAllContent = async () => {
  const res = await pool.query(
    "SELECT * FROM myschema.contents WHERE deleted_at IS NULL"
  );
  return res.rows;
};

exports.addContent = async (data) => {
  const res =
    await pool.query(`INSERT INTO myschema.contents (link, created_at, updated_at, deleted_at)
      VALUES ('${data.link}',   CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);`);
  return res.rows;
};

exports.getUserByUsername = async (username) => {
  const res = await pool.query(
    `SELECT * FROM myschema.users WHERE username = '${username}' AND deleted_at IS NULL`
  );

  return res.rows;
};

exports.deleteContentAll = async () => {
  const res = await pool.query(
    `UPDATE myschema.contents SET deleted_at = NOW()`
  );
  return res.rows;
};
