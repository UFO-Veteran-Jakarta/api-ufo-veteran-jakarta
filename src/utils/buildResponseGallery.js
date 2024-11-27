// Response builder for updateDivisionBySlug
exports.buildResponse = async (oldData, updateData, updatedGallery) => {
  const responseData = {
    id: updatedGallery.id,
  };

  let responseMessage = 'Successfully update gallery';

  if (updateData.name) {
    responseData.old_name = oldData.name;
    responseData.new_name = updatedGallery.name;
    responseData.old_slug = oldData.slug;
    responseData.new_slug = updatedGallery.slug;
    responseMessage += ' name';
  }

  if (updateData.image) {
    responseData.old_image = oldData.image;
    responseData.new_image = updatedGallery.image;
    responseMessage += updateData.name ? ' and' : '';
    responseMessage += ' image';
  }

  responseData.created_at = updatedGallery.created_at;
  responseData.updated_at = updatedGallery.updated_at;
  responseData.deleted_at = updatedGallery.deleted_at;

  return [responseMessage, responseData];
};
