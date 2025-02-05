exports.buildResponse = (oldData, updateData, updatedData) => {
  const responseData = {
    id: updatedData.id,
  };

  let responseMessage = 'Successfully update achievement';

  if (updateData.name) {
    responseData.old_name = oldData.name;
    responseData.new_name = updatedData.name;
    responseMessage += ' name';
  } else {
    responseData.name = updatedData.name;
  }

  if (updateData.year) {
    responseData.old_year = oldData.year;
    responseData.new_year = updatedData.year;
    responseMessage += updateData.name ? ' and' : '';
    responseMessage += ' year';
  } else {
    responseData.year = updatedData.year;
  }

  if (updateData.logo) {
    responseData.old_logo = oldData.logo;
    responseData.new_logo = updatedData.logo;
    responseMessage += updateData.name || updateData.year ? ' and' : '';
    responseMessage += ' logo';
  } else {
    responseData.logo = updatedData.logo;
  }

  // Add timestamps
  responseData.created_at = updatedData.created_at;
  responseData.updated_at = updatedData.updated_at;
  responseData.deleted_at = updatedData.deleted_at;

  return [responseMessage, responseData];
};
