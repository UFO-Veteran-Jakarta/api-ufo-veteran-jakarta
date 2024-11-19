exports.buildResponse = async (oldData, updateData, updatedMember) => {
  let responseData = {
    id: updatedMember.id,
  };

  const updates = [];

  const addUpdate = (field, oldField, newField) => {
    responseData[`old_${field}`] = oldField;
    responseData[`new_${field}`] = newField;
    updates.push(field);
  };

  if (updateData.name) {
    addUpdate('name', oldData.member_name, updatedMember.name);
  }
  if (updateData.image) {
    addUpdate('image', oldData.member_image, updatedMember.image);
  }
  if (updateData.division_id) {
    addUpdate('division_id', oldData.division_id, updatedMember.division_id);
  }
  if (updateData.position_id) {
    addUpdate('position_id', oldData.position_id, updatedMember.position_id);
  }
  if (updateData.angkatan) {
    addUpdate('angkatan', oldData.angkatan, updatedMember.angkatan);
  }
  if (updateData.instagram) {
    addUpdate('instagram', oldData.instagram, updatedMember.instagram);
  }
  if (updateData.linkedin) {
    addUpdate('linkedin', oldData.linkedin, updatedMember.linkedin);
  }
  if (updateData.whatsapp) {
    addUpdate('whatsapp', oldData.whatsapp, updatedMember.whatsapp);
  }

  // Add timestamps at the end
  responseData = {
    ...responseData,
    created_at: updatedMember.created_at,
    updated_at: updatedMember.updated_at,
    deleted_at: updatedMember.deleted_at,
  };

  const responseMessage = `Successfully updated member ${updates.join(' and ')}.`;

  return [responseMessage, responseData];
};
