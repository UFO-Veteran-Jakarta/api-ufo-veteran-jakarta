const pool = require("../config/database");

function createInsertQuery(data, tableName) {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map((_, index) => `$${index + 1}`);

  const query = `
    INSERT INTO ${tableName} (${fields.join(", ")})
    VALUES (${placeholders.join(", ")})
    RETURNING *;
  `;

  return { query, values };
}

function createUpdateQuery(data, tableName, id) {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  const query = `
    UPDATE ${tableName}
    SET ${setClause}, updated_at = NOW()
    WHERE id = $${fields.length + 1}
    RETURNING *;
  `;

  return { query, values: [...values, id] };
}

async function addWorkProgram(data) {
  const { query, values } = createInsertQuery(data, "myschema.work_programs");

  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error("Error inserting work program:", err);
  }
}

async function getAllWorkPrograms() {
  const query = "SELECT * FROM myschema.work_programs WHERE deleted_at IS NULL";

  try {
    const res = await pool.query(query);
    return res.rows.length > 0 ? res.rows : null;
  } catch (error) {
    console.error("Error fetching work programs:", error);
  }
}

async function getWorkProgramById(id) {
  const query = `
    SELECT * FROM myschema.work_programs
    WHERE id = $1 AND deleted_at IS NULL
  `;

  try {
    const res = await pool.query(query, [id]);

    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0];
  } catch (error) {
    console.error(`Error fetching work program with id ${id}:`, error);
    return null;
  }
}

async function updateWorkProgram(id, data) {
  const { query, values } = createUpdateQuery(
    data,
    "myschema.work_programs",
    id
  );

  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error(`Error updating work program with id ${id}:`, err);
    throw err;
  }
}

async function deleteAllWorkPrograms() {
  const query = "UPDATE myschema.work_programs SET deleted_at = NOW()";

  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    console.error("Error deleting all work programs:", error);
    throw error;
  }
}

async function deleteWorkProgram(id) {
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
}

module.exports = {
  addWorkProgram,
  getAllWorkPrograms,
  getWorkProgramById,
  updateWorkProgram,
  deleteAllWorkPrograms,
  deleteWorkProgram,
};
