// Response builder for updateDivisionBySlug
exports.buildResponse = async (oldData, updateData, updatedDivision) => {
  const responseData = {
    id: updatedDivision.id,
  };

  let responseMessage = 'Successfully update division';

  if (updateData.name) {
    responseData.old_name = oldData.name;
    responseData.new_name = updatedDivision.name;
    responseData.old_slug = oldData.slug;
    responseData.new_slug = updatedDivision.slug;
    responseMessage += ' name';
  }

  if (updateData.image) {
    responseData.old_image = oldData.image;
    responseData.new_image = updatedDivision.image;
    responseMessage += updateData.name ? ' and' : '';
    responseMessage += ' image';
  }

  responseData.created_at = updatedDivision.created_at;
  responseData.updated_at = updatedDivision.updated_at;
  responseData.deleted_at = updatedDivision.deleted_at;

  return [responseMessage, responseData];
};