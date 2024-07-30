const pool = require("../config/database");

exports.addWorkProgram = async function insertWorkProgram(data) {
  const fields = [];
  const values = [];
  const placeholders = [];

  Object.keys(data).forEach((key, index) => {
    fields.push(key);
    values.push(data[key]);
    placeholders.push(`$${index + 1}`);
  });

  const query = `
    INSERT INTO myschema.work_programs (${fields.join(", ")})
    VALUES (${placeholders.join(", ")})
    RETURNING *;
  `;

  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error("Error inserting event:", err);
  }
};

exports.getAllWorkProgramas = async function getAllWorkProgram() {
  const query = "SELECT * FROM myschema.work_programs WHERE deleted_at IS NULL";

  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    console.error("Error fetching work programs: ", error);
  }
};

exports.getWorkProgramById = async function getWworkProgramById(id) {
  try {
    const res = await pool.query(
      `SELECT * FROM myschema.work_programs WHERE id = $1 AND deleted_at IS NULL`,
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

exports.updateWorkProgram = async (id, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  Object.keys(data).forEach((key) => {
    fields.push(`${key} = $${index}`);
    values.push(data[key]);
    index++;
  });

  const query = `
    UPDATE myschema.work_programs
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${index}
    RETURNING *;
  `;

  try {
    const res = await pool.query(query, [...values, id]);
    return res.rows[0];
  } catch (err) {
    console.error(`Error updating work program with id ${id}:`, err);
    throw err;
  }
};

exports.deleteWorkProgram = async (id) => {
  const query = `
    UPDATE myschema.work_programs
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const res = await pool.query(query, [id]);
    return res.rows[0];
  } catch (err) {
    console.error(`Error deleting work program with id ${id}:`, err);
    throw err;
  }
};
