const {
  addFounderMember,
  getAllFounderMembers,
  getFounderMemberById,
  updateFounderMemberById,
  deleteFounderMemberById,
} = require('../models/founderMemberModel');
const {
  formatFounderMember,
  formatFounderMembers,
} = require('../collections/founderMemberCollection');
const {
  uploadImage,
  updateImage,
  deleteImage,
} = require('../utils/localImage');

exports.addFounderMember = async (req) => {
  try {
    if (req.files?.image) {
      const imagePath = await uploadImage(req.files.image, 'founder-members');
      if (imagePath) {
        req.body.image = imagePath.secure_url;
      }
    }

    const result = await addFounderMember(req.body);

    const formattedResult = formatFounderMember(result);// belum diubah

    return formattedResult;
  } catch (error) {
    console.error('Error adding founder member:', error);
    throw error;
  }
};

/**
 * Get all founder member from database/cache with pagination.
 *
 *
 * @returns
 */
exports.getAllFounderMembers = async ({ limit, offset }) => {
  try {
    const result = await getAllFounderMembers({ limit, offset });

    return {
      data: formatFounderMembers(result.data || []), // Pastikan result.data tidak null
      totalItems: result.totalItems || 0,
    };
  } catch (error) {
    console.error('Error fetching founder members:', error);
    throw error;
  }
};

/**
   * Get founder member by id from database/cache.
   *
   * @param {*} id
   * @returns
   */
exports.getFounderMemberById = async (id) => {
  try {
    const founderMember = await getFounderMemberById(id);

    const formattedResult = formatFounderMember(founderMember);

    return formattedResult;
  } catch (error) {
    console.error('Error fetching founder member by id: ', error);
    throw error;
  }
};

/**
   * Update founder member by id on the database.
   *
   * @param {*} id
   * @param {*} oldData
   * @param {*} updateData
   * @returns
   */
exports.updateFounderMemberById = async (id, oldData, req) => {
  try {
    // Update image file if propagated
    if (req.files?.image) {
      const imagePath = await updateImage(oldData.image, req.files.image, 'founder-members');
      if (imagePath) {
        req.body.image = imagePath;
      }
    }

    // Update data in the database
    const result = await updateFounderMemberById(id, req.body);

    return [req.body, result];
  } catch (error) {
    console.error('Error updating founder member by id:', error);
    throw error;
  }
};

/**
   * Delete founder member by id on the database.
   *
   * @param {*} id
   * @returns
   */
exports.deleteFounderMemberById = async (id) => {
  try {
    const result = await deleteFounderMemberById(id);

    await deleteImage(result.image, 'founder-members');

    return result;
  } catch (error) {
    console.error('Error deleting founder member by id:', error);
    throw error;
  }
};
