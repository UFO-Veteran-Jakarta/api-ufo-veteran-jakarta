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

async function addFounderMember(data) {
  try {
    const res = await doInsertQuery(data, 'founder_members');
    return res.rows[0];
  } catch (error) {
    console.error('Error inserting founder member:', error);
    throw error;
  }
}

async function getAllFounderMembers({ limit = 10, offset = 0 }) {
  const query = 'SELECT COUNT(*)::INTEGER AS count FROM founder_members WHERE deleted_at IS NULL';
  const dataQuery = `
  SELECT * FROM founder_members
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
    console.error('Error fetching founder members:', error);
    throw error;
  }
}

async function getFounderMemberById(id) {
  try {
    const query = 'SELECT * FROM founder_members WHERE id = $1 AND deleted_at IS NULL;';
    const values = [id];
    return executeQuery(query, values);
  } catch (error) {
    console.error('Error fetching founder member by id:', error);
    throw error;
  }
}

async function updateFounderMemberById(id, data) {
  try {
    const res = await doUpdateQueryById(data, 'founder_members', id);
    return res.rows[0];
  } catch (error) {
    console.error(`Error updating founder member with id ${id}:`, error);
    throw error;
  }
}

async function deleteAllFounderMembers() {
  try {
    const res = await doSoftDeleteQueryById('founder_members');
    return res.rows;
  } catch (error) {
    console.error('Error deleting all founder members:', error);
    throw error;
  }
}

async function deleteFounderMemberById(id) {
  try {
    const res = await doSoftDeleteQueryById('founder_members', id);
    return res.rows[0];
  } catch (error) {
    console.error(`Error deleting founder member with slug ${id}:`, error);
    throw error;
  }
}

module.exports = {
  addFounderMember,
  getAllFounderMembers,
  getFounderMemberById,
  updateFounderMemberById,
  deleteAllFounderMembers,
  deleteFounderMemberById,
};
