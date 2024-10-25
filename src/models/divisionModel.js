const pool = require('../config/database');

function createInsertQuery(data, tableName) {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map((_, index) => `$${index + 1}`);

  const query = `
    INSERT INTO ${tableName} (${fields.join(', ')})
    VALUES(${placeholders.join(', ')})
    RETURNING *;
    `;

  return { query, values };
}

function createUpdateQuery(data, tableName, id) {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(', ');

  const query = `
        UPDATE ${tableName}
        SET ${setClause}, updated_at  = NOW()
        WHERE id = $${fields.length + 1}
        RETURNING *;
    `;

  return { query, values: [...values, id] };
}

async function addDivision(data) {
  const { query, values } = createInsertQuery(data, 'myschema.divisions');

  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error('Error inserting division:', error);
  }
}

async function getAllDivisions() {
  const query = `
        SELECT * FROM myschema.divisions WHERE deleted_at IS NULL;
    `;

  try {
    const res = await pool.query(query);
    return res.rows.length > 0 ? res.rows : null;
  } catch (error) {
    console.error('Error fetching divisions:', error);
  }
}

async function getDivisionById(id) {
  const query = `
        SELECT * FROM myschema.divisions WHERE id = $1 AND deleted_at IS NULL
    `;

  try {
    const res = await pool.query(query, [id]);

    if (res.rows.length === 0) {
      return null;
    }

    return res.rows[0];
  } catch (error) {
    console.error('Error fetching division by id:', error);
  }
}

async function updateDivisionById(id, data) {
  const { query, values } = createUpdateQuery(data, 'myschema.divisions', id);

  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error(`Error updating latest activity with id ${id}:`, error);
  }
}

async function deleteAllDivisions() {
  const query = 'UPDATE myschema.divisions SET deleted_at = NOW()';

  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    console.error('Error deleting all divisions:', error);
  }
}

async function deleteDivisionById(id) {
  const query = `
        UPDATE myschema.divisions SET deleted_at = NOW() WHERE id = $1 RETURNING *;
    `;

  try {
    const res = await pool.query(query, [id]);
    return res.rows[0];
  } catch (error) {
    console.error(`Error deleting division with id ${id}:`, error);
  }
}

module.exports = {
  addDivision,
  getAllDivisions,
  getDivisionById,
  updateDivisionById,
  deleteAllDivisions,
  deleteDivisionById,
};
