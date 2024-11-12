const {
  doInsertQuery,
  doSelectQuery,
  doUpdateQueryById,
  doSoftDeleteQueryById,
} = require('../utils/queryBuilder');

async function addMember(data) {
  try {
    const res = await doInsertQuery(data, 'members');
    return res.rows[0];
  } catch (error) {
    console.error('Error inserting member:', error);
    throw error;
  }
}

async function getAllMembers() {
  try {
    const res = await doSelectQuery('members');
    return res.rows;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
}

async function getMemberById(id) {
  try {
    const res = await doSelectQuery('members', [['id', '=', id]]);
    return res.rows[0];
  } catch (error) {
    console.error('Error fetching member by id:', error);
    throw error;
  }
}

async function updateMemberById(id, data) {
  try {
    const res = await doUpdateQueryById(data, 'members', id);
    return res.rows[0];
  } catch (error) {
    console.error('Error updating member by id:', error);
    throw error;
  }
}

async function deleteMemberById(id) {
  try {
    const res = await doSoftDeleteQueryById('members', id);
    return res.rows[0];
  } catch (error) {
    console.error('Error deleting member by id:', error);
    throw error;
  }
}


module.exports = {
  addMember,
  getAllMembers,
  getMemberById,
  updateMemberById,
  deleteMemberById,
};