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

exports.getPartnerById = async (id) => {
  try {
    const res = await pool.query(
      `SELECT * FROM myschema.partners WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0];
  } catch (error) {
    return [];
  }
};

exports.updatePartner = async (id, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  Object.keys(data).forEach((key) => {
    fields.push(`${key} = $${index}`);
    values.push(data[key]);
    index++;
  });

  const query = `
    UPDATE myschema.events
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${index}
    RETURNING *;
  `;

  try {
    const res = await pool.query(query, [...values, id]);
    return res.rows[0];
  } catch (err) {
    console.error(`Error updating partner with id ${id}:`, err);
    throw err;
  }
};
