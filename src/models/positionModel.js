const pool = require('../config/database');
const { doInsertQuery, doUpdateQueryById } = require('../utils/queryBuilder');

async function executeQuery(query, values) {
  try {
    const res = await pool.query(query, values);
    return res.rows.length > 0 ? res.rows[0] : null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

async function addPosition(data) {
  try {
    const res = await doInsertQuery(data, 'positions');
    return res.rows[0];
  } catch (error) {
    console.error('Error inserting position:', error);
    throw error;
  }
}

async function getAllPositions() {
  const query = 'SELECT * FROM myschema.positions WHERE deleted_at IS NULL;';
  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    console.error('Error fetching positions:', error);
    throw error;
  }
}

async function getPositionById(id) {
  const query =
    'SELECT * FROM myschema.positions WHERE id = $1 AND deleted_at IS NULL;';
  const values = [id];
  return executeQuery(query, values);
}

async function updatePositionById(id, data) {
  try {
    const res = await doUpdateQueryById(data, 'positions', id);
    return res.rows[0];
  } catch (error) {
    console.error(`Error updating position with id ${id}:`, error);
    throw error;
  }
}

async function deleteAllPositions() {
  const query = 'UPDATE myschema.positions SET deleted_at = NOW()';
  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    console.error('Error deleting all positions:', error);
    throw error;
  }
}

async function deletePositionById(id) {
  const query =
    'UPDATE myschema.positions SET deleted_at = NOW() WHERE id = $1 RETURNING *;';
  const values = [id];
  return executeQuery(query, values);
}

module.exports = {
  addPosition,
  getAllPositions,
  getPositionById,
  updatePositionById,
  deletePositionById,
  deleteAllPositions,
};
