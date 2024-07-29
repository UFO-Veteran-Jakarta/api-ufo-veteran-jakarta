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
    return res.rows.length > 0 ? res.rows : null;
  } catch (error) {
    console.error("Error fetching partners:", error);
    throw error;
  }
};

exports.getAchievementById = async (id) => {
  try {
    const res = await pool.query(
      `SELECT * FROM myschema.achievements WHERE id = $1 AND deleted_at IS NULL`,
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

exports.updateAchievement = async (id, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  Object.keys(data).forEach((key) => {
    fields.push(`${key} = $${index}`);
    values.push(data[key]);
    index++;
  });

  const query = `
    UPDATE myschema.achievements
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${index}
    RETURNING *;
  `;

  try {
    const res = await pool.query(query, [...values, id]);
    return res.rows[0];
  } catch (error) {
    console.error(`Error updating achievement with id ${id}:`, error);
    throw error;
  }
};

exports.deleteAchievementAll = async () => {
  const res = await pool.query(
    `UPDATE myschema.achievements SET deleted_at = NOW()`
  );
  return res.rows;
};

exports.deleteAchievement = async (id) => {
  const query = `
    UPDATE myschema.achievements
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const res = await pool.query(query, [id]);
    return res.rows[0];
  } catch (error) {
    console.error(`Error deleting achievement with id ${id}:`, error);
    throw error;
  }
};
