const {
  addWorkProgram,
  getAllWorkProgramas,
} = require("src/models/workPorgramModel");

exports.addWorkProgram = async (data) => {
  return await addWorkProgram(data);
};

exports.getAllWorkPrograms = async () => {
  try {
    return await getAllWorkProgramas();
  } catch (error) {
    console.error("Error fetching work programs: ", error);
    throw error;
  }
};
