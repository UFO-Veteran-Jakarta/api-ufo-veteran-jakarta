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

exports.getAllAchievements = async function getAllAchievements() {
  const query = "SELECT * FROM myschema.achievements WHERE deleted_at IS NULL";

  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    console.error("Error fetching partners:", error);
    throw error;
  }
};
