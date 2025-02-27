/**
 * Builds HTTP response for update endpoints
 * 
 * fields<Array>: List of updateable fields in validator file.
 * resource<string>: Resource name
 * oldData<Array>: Old data retrieved from database.
 * updatedFields<Array>: List of fields inputted by user.
 * updatedData<array>: New (updated) data retrieved from database.
 * 
 * @param {*} param0 
 * @returns 
 */
const buildUpdateResponse = async ({
  fields, resource, oldData, updatedFields, updatedData,
}) => {
  const responseData = {
    id: updatedData.id,
  };

  const updates = [];

  fields.forEach((field) => {
    if (updatedFields[field.name]) {
      responseData[`old_${field.name}`] = oldData[field.name];
      responseData[`new_${field.name}`] = updatedData[field.name];
      updates.push(field.name);

      if (field.name === 'title') {
        responseData.old_slug = oldData.slug;
        responseData.new_slug = updatedData.slug;
      }
    }
  });

  responseData.created_at = updatedData.created_at;
  responseData.updated_at = updatedData.updated_at;
  responseData.deleted_at = updatedData.deleted_at;

  const responseMessage = `Successfully updated ${resource} ${updates.join(' and ')}.`;

  return [responseMessage, responseData];
};

module.exports = buildUpdateResponse;
