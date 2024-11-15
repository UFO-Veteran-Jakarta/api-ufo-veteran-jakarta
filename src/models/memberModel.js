const pool = require('../config/database');

function createInsertQuery(data, tableName) {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map((_, index) => `$${index + 1}`);

  const query = `
    WITH inserted_member AS (
      INSERT INTO ${tableName} (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    )
    SELECT 
      members.id AS member_id, 
      members.name AS member_name, 
      members.image AS member_image,
      members.angkatan, 
      members.instagram, 
      members.linkedin, 
      members.whatsapp,
      members.created_at, 
      members.updated_at, 
      members.deleted_at,
      divisions.id AS division_id, 
      divisions.name AS division_name, 
      divisions.image AS division_image,
      positions.id AS position_id, 
      positions.name AS position_name
    FROM inserted_member AS members
    JOIN divisions ON members.division_id = divisions.id
    JOIN positions ON members.position_id = positions.id;
  `;

  return { query, values };
}

const updateMemberQuery = (data, id) => {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(', ');

  const query = `
    UPDATE members
    SET ${setClause}, updated_at = NOW()
    WHERE id = $${fields.length + 1}
    RETURNING *;
  `;

  return { query, values: [...values, id] };
};

const selectMemberQuery = (conditions = []) => {
  const whereClause = conditions.length
    ? `WHERE ${
      conditions
        .map(
          ([field, operator], index) => `${field} ${operator} $${index + 1}`,
        )
        .join(' AND ')}`
    : '';

  return `
    SELECT 
      members.id AS member_id, members.name AS member_name, members.image AS member_image,
      members.angkatan, members.instagram, members.linkedin, members.whatsapp,
      members.created_at, members.updated_at, members.deleted_at,
      divisions.id AS division_id, divisions.name AS division_name, divisions.image AS division_image,
      positions.id AS position_id, positions.name AS position_name
    FROM members
    JOIN divisions ON members.division_id = divisions.id
    JOIN positions ON members.position_id = positions.id
    ${whereClause} AND members.deleted_at IS NULL;
  `;
};

const addMember = async (data) => {
  const { query, values } = createInsertQuery(data, 'members');
  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

const getAllMembers = async () => {
  const query = selectMemberQuery();
  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
};

const getMemberById = async (id) => {
  const query = selectMemberQuery([['members.id', '=', id]]);
  try {
    const res = await pool.query(query, [id]);
    return res.rows[0];
  } catch (error) {
    console.error('Error fetching member by id:', error);
    throw error;
  }
};

const updateMemberById = async (id, data) => {
  const { query, values } = updateMemberQuery(data, id);
  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error('Error updating member by id:', error);
    throw error;
  }
};

const deleteMemberById = async (id) => {
  const query = `
    UPDATE members
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;
  const values = [id];

  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error('Error deleting member by id:', error);
    throw error;
  }
};

module.exports = {
  addMember,
  getAllMembers,
  getMemberById,
  updateMemberById,
  deleteMemberById,
};
