const {
  addWorkProgram,
  getAllWorkPrograms,
  getWorkProgramById,
  updateWorkProgram,
  deleteWorkProgram,
} = require("../models/workProgramModel");

exports.addWorkProgram = async (data) => {
  return await addWorkProgram(data);
};

exports.getAllWorkPrograms = async () => {
  try {
    return await getAllWorkPrograms();
  } catch (error) {
    console.error("Error fetching work programs: ", error);
    throw error;
  }
};

exports.getWorkProgramById = async (id) => {
  return await getWorkProgramById(id);
};

exports.updateWorkProgram = async (id, data) => {
  return await updateWorkProgram(id, data);
};

exports.deleteWorkProgram = async (id) => {
  return await deleteWorkProgram(id);
};
