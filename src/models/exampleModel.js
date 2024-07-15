const pool = require("../config/database");

exports.getExampleData = async () => {
  const res = await pool.query("SELECT * FROM example");
  return res.rows;
};
