const {
  addChairmanHistory,
  getAllChairmanHistories,
  getChairmanHistoryById,
  updateChairmanHistoryById,
  deleteChairmanHistoryById,
} = require('../models/chairmanHistoryModel');

const {
  formatChairmanHistories,
  formatChairmanHistory,
} = require('../collections/chairmanHistoryCollection');

const {
  uploadImage,
  updateImage,
  deleteImage,
} = require('../utils/cloudImage');

exports.addChairmanHistory = async (req) => {
  try {
    if (req.files?.image) {
      const imagePath = await uploadImage(req.files.image, 'chairmen');
      if (imagePath) {
        req.body.image = imagePath.secure_url;
      }
    }

    if (req.body.end_year === '') req.body.end_year = null;

    const result = await addChairmanHistory(req.body);

    const formattedResult = formatChairmanHistory(result);

    return formattedResult;
  } catch (error) {
    console.error('Error adding chairman history:', error);
    throw error;
  }
};

/**
 * Get all chairman history from database/cache with pagination.
 *
 *
 * @returns
 */
exports.getAllChairmanHistories = async ({ limit, offset }) => {
  try {
    const result = await getAllChairmanHistories({ limit, offset });

    return {
      data: formatChairmanHistories(result.data || []), // Pastikan result.data tidak null
      totalItems: result.totalItems || 0,
    };
  } catch (error) {
    console.error('Error fetching chairman histories:', error);
    throw error;
  }
};

/**
   * Get chairman history by id from database/cache.
   *
   * @param {*} id
   * @returns
   */
exports.getChairmanHistoryById = async (id) => {
  try {
    const chairmanHistory = await getChairmanHistoryById(id);

    const formattedResult = formatChairmanHistory(chairmanHistory);

    return formattedResult;
  } catch (error) {
    console.error('Error fetching chairman history by id: ', error);
    throw error;
  }
};

/**
   * Update chairman history by id on the database.
   *
   * @param {*} id
   * @param {*} oldData
   * @param {*} updateData
   * @returns
   */
exports.updateChairmanHistoryById = async (id, oldData, req) => {
  try {
    // Update image file if propagated
    if (req.files?.image) {
      const imagePath = await updateImage(oldData.image, req.files.image, 'chairmen');
      if (imagePath) {
        req.body.image = imagePath;
      }
    }

    if (req.body.image === '') delete req.body.image;

    if (req.body.end_year === '') req.body.end_year = null;

    // Update data in the database
    const result = await updateChairmanHistoryById(id, req.body);

    return [req.body, result];
  } catch (error) {
    console.error('Error updating chairman history by id:', error);
    throw error;
  }
};

/**
   * Delete chairman history by id on the database.
   *
   * @param {*} id
   * @returns
   */
exports.deleteChairmanHistoryById = async (id) => {
  try {
    const result = await deleteChairmanHistoryById(id);

    await deleteImage(result.image, 'chairmen');

    return result;
  } catch (error) {
    console.error('Error deleting chairman history by id:', error);
    throw error;
  }
};
