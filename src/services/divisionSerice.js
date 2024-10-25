const {
  addDivision,
  getAllDivisions,
  getDivisionById,
  updateDivisionById,
  deleteDivisionById,
} = require('../models/divisionModel');

exports.addDivision = async (data) => {
  return addDivision(data);
};

exports.getAllDivisions = async () => {
  try {
    return await getAllDivisions();
  } catch (error) {
    console.error('Error fetching divisions: ', error);
  }
};

exports.getDivisionById = async (id) => {
  return getDivisionById(id);
};

exports.updateDivisionById = async (id, data) => {
  return updateDivisionById(id, data);
};

exports.deleteDivisionById = async (id) => {
  return deleteDivisionById(id);
};
