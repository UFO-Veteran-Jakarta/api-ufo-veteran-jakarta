// Response builder for updateDivisionBySlug
exports.buildResponse = async (oldData, updateData, updatedGallery) => {
  const responseData = {
    id: updatedGallery.id,
  };

  const updates = [];

  const fieldsToUpdate = [
    'title', 'category_galleries_id',
    'image', 'snippet', 'author',
  ];

  fieldsToUpdate.forEach((field) => {
    if (updateData[field]) {
      responseData[`old_${field}`] = oldData[field];
      responseData[`new_${field}`] = updatedGallery[field];
      updates.push(field);

      if (field === 'title') {
        responseData.old_slug = oldData.slug;
        responseData.new_slug = updatedGallery.slug;
      }
    }
  });

  responseData.created_at = updatedGallery.created_at;
  responseData.updated_at = updatedGallery.updated_at;
  responseData.deleted_at = updatedGallery.deleted_at;

  const responseMessage = `Successfully updated gallery ${updates.join(' and ')}.`;

  return [responseMessage, responseData];
};
