const {
  doSelectQuery,
  doInsertQuery,
  doUpdateQueryById,
  doSoftDeleteQueryById,
} = require('../utils/queryBuilder');

exports.getAllContents = async () => {
  try {
    const res = await doSelectQuery('contents');
    return res.rows;
  } catch (error) {
    console.error('Error fetching contents:', error);
    throw error;
  }
};

exports.getContentById = async (id) => {
  try {
    const res = await doSelectQuery('contents', [['id', '=', id]]);
    return res.rows[0];
  } catch (error) {
    console.error('Error fetching content by id:', error);
    throw error;
  }
};

exports.addContent = async (data) => {
  try {
    const res = await doInsertQuery(data, 'contents');
    return res.rows[0];
  } catch (error) {
    console.error('Error inserting content:', error);
    throw error;
  }
};

exports.updateContentById = async function (id, data) {
  try {
    const res = await doUpdateQueryById(data, 'contents', id);
    return res.rows[0];
  } catch (error) {
    console.error(`Error updating position with id ${id}:`, error);
    throw error;
  }
};

exports.deleteContentById = async (id) => {
  try {
    const res = await doSoftDeleteQueryById('contents', id);
    return res.rows[0];
  } catch (error) {
    console.error(`Error deleting content with id ${id}:`, error);
    throw error;
  }
};
