const pool = require("../config/database");

exports.addPartner = async function insertParnter(data) {
  const fields = [];
  const values = [];
  const placeholders = [];

  Object.keys(data).forEach((key, index) => {
    fields.push(key);
    values.push(data[key]);
    placeholders.push(`$${index + 1}`);
  });

  const query = `
    INSERT INTO myschema.partners (${fields.join(", ")})
    VALUES (${placeholders.join(", ")})
    RETURNING *;
 `;

  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error("Error inserting partner:", error);
  }
};

exports.getAllPartners = async function getAllPartners() {
  const query = "SELECT * FROM myschema.partners WHERE deleted_at IS NULL";

  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    console.error("Error fetching partners:", error);
    throw error;
  }
};
