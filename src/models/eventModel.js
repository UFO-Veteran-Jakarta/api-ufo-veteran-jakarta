const pool = require("../config/database");

exports.addEvent = async function insertEvent(data) {
  const fields = [];
  const values = [];
  const placeholders = [];

  Object.keys(data).forEach((key, index) => {
    fields.push(key);
    values.push(data[key]);
    placeholders.push(`$${index + 1}`);
  });

  const query = `
    INSERT INTO myschema.events (${fields.join(", ")})
    VALUES (${placeholders.join(", ")})
    RETURNING *;
  `;

  try {
    const res = await pool.query(query, values);
    console.log("Inserted event:", res.rows[0]);
    return res.rows[0];
  } catch (err) {
    console.error("Error inserting event:", err);
  }
};
