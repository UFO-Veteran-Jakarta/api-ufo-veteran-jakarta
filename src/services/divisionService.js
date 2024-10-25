const {
  addDivision,
  getAllDivisions,
  getDivisionBySlug,
  updateDivisionBySlug,
  deleteDivisionBySlug,
} = require('../models/divisionModel');

exports.checkSlugExistsInDb = async (slug) => {
  const division = await getDivisionBySlug(slug);
  return !!division;
};

exports.addDivision = async (data) => {
  return addDivision(data);
};

exports.getAllDivisions = async () => {
  try {
    const divisions = await getAllDivisions();
    return divisions;
  } catch (error) {
    console.error('Error fetching divisions:', error);
    throw error;
  }
};
exports.getDivisionBySlug = async (slug) => {
  try {
    return await getDivisionBySlug(slug);
  } catch (error) {
    console.error('Error fetching division by slug: ', error);
    throw error;
  }
};

exports.updateDivisionBySlug = async (slug, data) => {
  return updateDivisionBySlug(slug, data);
};

exports.deleteDivisionBySlug = async (slug) => {
  return deleteDivisionBySlug(slug);
};
