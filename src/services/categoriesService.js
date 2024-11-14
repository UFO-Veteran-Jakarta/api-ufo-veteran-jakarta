const {
  addCategories,
  getAllCategories,
  getCategoriesById,
  updateCategoriesById,
  deleteCategoriesById,
  deleteAllCategories,
} = require('../models/categoriesModel');

exports.addCategories = async (data) => {
  try {
    return await addCategories(data);
  } catch (error) {
    console.error('Error add category:', error);
    throw error;
  }
};
exports.getAllCategories = async () => {
  try {
    return await getAllCategories();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
exports.getCategoriesById = async (id) => {
  try {
    return await getCategoriesById(id);
  } catch (error) {
    console.error(`Error fetching category with id ${id}:`, error);
    throw error;
  }
};

exports.updateCategoriesById = async (id, data) => {
  try {
    return await updateCategoriesById(id, data);
  } catch (error) {
    console.error(`Error updating category with id ${id}:`, error);
    throw error;
  }
};

exports.deleteCategoriesById = async (id) => {
  try {
    return await deleteCategoriesById(id);
  } catch (error) {
    console.error(`Error deleting category with id ${id}:`, error);
    throw error;
  }
};

exports.deleteAllCategories = async () => {
  try {
    return await deleteAllCategories();
  } catch (error) {
    console.error('Error deleting all categories:', error);
    throw error;
  }
};
