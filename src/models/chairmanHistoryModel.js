const pool = require('../config/database');
const {
  doInsertQuery,
  doUpdateQueryById,
  doSoftDeleteQueryById,
} = require('../utils/queryBuilder');

async function executeQuery(query, values) {
  try {
    const res = await pool.query(query, values);
    return res.rows.length > 0 ? res.rows[0] : null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

async function addChairmanHistory(data) {
  try {
    const res = await doInsertQuery(data, 'chairman_histories');
    return res.rows[0];
  } catch (error) {
    console.error('Error inserting chairman history:', error);
    throw error;
  }
}

async function getAllChairmanHistories({ limit = 10, offset = 0 }) {
  const query = 'SELECT COUNT(*)::INTEGER AS count FROM chairman_histories WHERE deleted_at IS NULL';
  const dataQuery = `
    SELECT * FROM chairman_histories
    WHERE deleted_at IS NULL
    ORDER BY id ASC
    LIMIT $1 OFFSET $2
    `;

  try {
    const countRes = await pool.query(query);

    const totalItems = countRes.rows?.[0]?.count || 0;

    const dataRes = await pool.query(dataQuery, [limit, offset]);

    return {
      data: dataRes.rows, // Pool query otomatis mengembalikan array
      totalItems,
    };
  } catch (error) {
    console.error('Error fetching chairman histories:', error);
    throw error;
  }
}

async function getChairmanHistoryById(id) {
  const query =
    'SELECT * FROM chairman_histories WHERE id = $1 AND deleted_at IS NULL;';
  const values = [id];
  return executeQuery(query, values);
}

async function getActiveChairman() {
  const query = 'SELECT * FROM chairman_histories WHERE is_active = TRUE AND deleted_at IS NULL LIMIT 1;';
  return executeQuery(query, []);
}

async function updateChairmanHistoryById(id, data) {
  try {
    const res = await doUpdateQueryById(data, 'chairman_histories', id);
    return res.rows[0];
  } catch (error) {
    console.error(`Error updating chairman history with id ${id}:`, error);
    throw error;
  }
}

async function deleteAllChairmanHistories() {
  try {
    const res = await doSoftDeleteQueryById('chairman_histories');
    return res.rows;
  } catch (error) {
    console.error('Error deleting all chairman histories:', error);
    throw error;
  }
}

async function deleteChairmanHistoryById(id) {
  try {
    const res = await doSoftDeleteQueryById('chairman_histories', id);
    return res.rows[0];
  } catch (error) {
    console.error(`Error deleting chairman history with id ${id}:`, error);
    throw error;
  }
}

module.exports = {
  addChairmanHistory,
  getAllChairmanHistories,
  getChairmanHistoryById,
  getActiveChairman,
  updateChairmanHistoryById,
  deleteAllChairmanHistories,
  deleteChairmanHistoryById,
};
