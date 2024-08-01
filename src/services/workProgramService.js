const {
  addWorkProgram,
  getAllWorkPrograms,
  getWorkProgramById,
  updateWorkProgram,
  deleteWorkProgram,
} = require('../models/workProgramModel');

exports.addWorkProgram = async (data) => {
  await addWorkProgram(data);
};

exports.getAllWorkPrograms = async () => {
  try {
    return await getAllWorkPrograms();
  } catch (error) {
    console.error('Error fetching work programs: ', error);
    throw error;
  }
};

exports.getWorkProgramById = async (id) => {
  return getWorkProgramById(id);
};

exports.updateWorkProgram = async (id, data) => {
  return updateWorkProgram(id, data);
};

exports.deleteWorkProgram = async (id) => {
  return deleteWorkProgram(id);
};
