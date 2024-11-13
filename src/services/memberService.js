const {
  addMember,
  getAllMembers,
  getMemberById,
  updateMemberById,
  deleteMemberById,
} = require('../models/memberModel');
const { getUploadFilepath, updateFile } = require('../utils/fileUpload');

/**
 * Add new member into the database.
 *
 * @param {*} data
 * @returns
 */
exports.addMember = async (data) => {
  try {
    const result = await addMember(data);
    return result;
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

/**
 * Get all members from database.
 *
 * @returns
 */
exports.getAllMembers = async () => {
  try {
    const members = await getAllMembers();
    return members;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
};

/**
 * Get member by ID from database.
 *
 * @param {*} id
 * @returns
 */
exports.getMemberById = async (id) => {
  try {
    return await getMemberById(id);
  } catch (error) {
    console.error('Error fetching member by ID: ', error);
    throw error;
  }
};

/**
 * Update member by ID on the database.
 *
 * @param {*} id
 * @param {*} oldData
 * @param {*} updateData
 * @returns
 */
exports.updateMemberById = async (id, oldData, updateData) => {
  try {
    // Exclude imageData from updateData payload
    const { imageData, ...newData } = updateData;

    // Update data in the database
    const result = await updateMemberById(id, newData);

    // Update image file if propagated
    if (updateData?.image) {
      await updateFile(oldData.image, updateData.image, imageData);
    }

    return result;
  } catch (error) {
    console.error('Error updating member by ID:', error);
    throw error;
  }
};

/**
 * Delete member by ID on the database.
 *
 * @param {*} id
 * @returns
 */
exports.deleteMemberById = async (id) => {
  try {
    const result = await deleteMemberById(id);
    return result;
  } catch (error) {
    console.error('Error deleting member by ID:', error);
    throw error;
  }
};

/*
 * @returns Array[boolean, Object]
 *
 * Stages the payload data before executing the next action.
 * On each payload objects, this function will return the
 * appropriate string value back to the data payload.
 */
exports.stageDataUpdateMemberById = async (req) => {
  // Data payload
  const updateData = {};

  if (req.body.name) {
    updateData.name = req.body.name;
  }

  if (req.body.division_id) {
    updateData.division_id = req.body.division_id;
  }

  if (req.body.position_id) {
    updateData.position_id = req.body.position_id;
  }

  if (req.body.angkatan) {
    updateData.angkatan = req.body.angkatan;
  }

  if (req.body.instagram) {
    updateData.instagram = req.body.instagram;
  }

  if (req.body.linkedin) {
    updateData.linkedin = req.body.linkedin;
  }

  if (req.body.whatsapp) {
    updateData.whatsapp = req.body.whatsapp;
  }

  if (req.files?.image) {
    const imagePath = await getUploadFilepath(req.files.image, 'members');
    if (imagePath) {
      updateData.image = imagePath;
      updateData.imageData = req.files.image?.data;
    }
  }

  return [
    // Checks if there is a data update payload
    Object.keys(updateData).length !== 0,

    // Returns the data payload itself
    updateData,
  ];
};
