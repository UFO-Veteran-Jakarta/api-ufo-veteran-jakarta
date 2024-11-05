const pool = require('../config/database');

function createInsertQuery(data, tableName) {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map((_, index) => `$${index + 1}`);

  const query = `
        INSERT INTO ${tableName} (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
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
        SET ${setClause}, updated_at = NOW()
        WHERE id = $${fields.length + 1}
        RETURNING *;
    `;

  return { query, values: [...values, id] };
}

async function addPosition(data) {
  const { query, values } = createInsertQuery(data, 'myschema.positions');

  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error('Error inserting position:', error);
  }
}

async function getAllPositions() {
  const query = 'SELECT * FROM myschema.positions WHERE deleted_at IS NULL;';

  try {
    const res = await pool.query(query);
    return res.rows.length > 0 ? res.rows : [];
  } catch (error) {
    console.error('Error fetching positions:', error);
  }
}

async function getPositionById(id) {
  const query = 'SELECT * FROM myschema.positions WHERE id = $1 AND deleted_at IS NULL;';

  try {
    const res = await pool.query(query, [id]);
    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0];
  } catch (error) {
    console.error(`Error fetching position with id ${id}:`, error);
    return null;
  }
}

async function updatePositionById(id, data) {
  const { query, values } = createUpdateQuery(data, 'myschema.positions', id);

  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error(`Error updating position with id ${id}:`, error);
  }
}

async function deleteAllPositions() {
  const query = 'UPDATE myschema.positions SET deleted_at = NOW()';

  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    console.error('Error deleting all positions:', error);
  }
}

async function deletePositionById(id) {
  const query = 'UPDATE myschema.positions SET deleted_at = NOW() WHERE id = $1 RETURNING *;';

  try {
    const res = await pool.query(query, [id]);
    return res.rows[0];
  } catch (error) {
    console.error(`Error deleting position with id ${id}:`, error);
  }
}

module.exports = {
  addPosition,
  getAllPositions,
  getPositionById,
  updatePositionById,
  deletePositionById,
  deleteAllPositions,
};
