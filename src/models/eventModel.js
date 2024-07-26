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

exports.getAllEvents = async function getAllEvents() {
  const query = "SELECT * FROM myschema.events";

  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (err) {
    console.error("Error fetching events:", err);
    throw err;
  }
};

exports.getEventBySlug = async function getEventBySlug(slug) {
  const query = "SELECT * FROM myschema.events WHERE slug = $1";

  try {
    const res = await pool.query(query, [slug]);
    return res.rows[0];
  } catch (error) {
    console.error("Error fetching event by slug:", error);
    throw error;
  }
};
