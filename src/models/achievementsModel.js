const pool = require("../config/database");

exports.addAchievement = async function insertAchievement(data) {
  const fields = [];
  const values = [];
  const placeholders = [];

  Object.keys(data).forEach((key, index) => {
    fields.push(key);
    values.push(data[key]);
    placeholders.push(`$${index + 1}`);
  });

  const query = `
    INSERT INTO myschema.achievements (${fields.join(", ")})
    VALUES (${placeholders.join(", ")})
    RETURNING *;
 `;

  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error("Error inserting achievement:", error);
  }
};