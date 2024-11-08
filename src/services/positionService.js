const {
  getAllPositions,
  getPositionById,
  addPosition,
  updatePositionById,
  deletePositionById,
  deleteAllPositions,
} = require('../models/positionModel');

exports.getAllPositions = async () => {
  try {
    return await getAllPositions();
  } catch (error) {
    console.error('Error fetching positions:', error);
    throw error;
  }
};

exports.getPositionById = async (id) => {
  try {
    return await getPositionById(id);
  } catch (error) {
    console.error(`Error fetching position with id ${id}:`, error);
    throw error;
  }
};

exports.addPosition = async (data) => {
  try {
    return await addPosition(data);
  } catch (error) {
    console.error('Error adding position:', error);
    throw error;
  }
};

exports.updatePositionById = async (id, data) => {
  try {
    return await updatePositionById(id, data);
  } catch (error) {
    console.error(`Error updating position with id ${id}:`, error);
    throw error;
  }
};

exports.deletePositionById = async (id) => {
  try {
    return await deletePositionById(id);
  } catch (error) {
    console.error(`Error deleting position with id ${id}:`, error);
    throw error;
  }
};

exports.deleteAllPositions = async () => {
  try {
    return await deleteAllPositions();
  } catch (error) {
    console.error('Error deleting all positions:', error);
    throw error;
  }
};
