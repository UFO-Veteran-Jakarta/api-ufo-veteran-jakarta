exports.buildResponse = async (oldData, updateData, updatedArticle) => {
  let responseData = {
    id: updatedArticle.id,
  };

  const updates = [];

  const addUpdate = (field, oldField, newField) => {
    responseData[`old_${field}`] = oldField;
    responseData[`new_${field}`] = newField;
    updates.push(field);
  };

  if (updateData.title) {
    addUpdate('slug', oldData.slug, updatedArticle.slug);
    addUpdate('title', oldData.title, updatedArticle.title);
  }
  if (updateData.category_id) {
    addUpdate('category_id', oldData.category_id, updatedArticle.category_id);
  }
  if (updateData.author) {
    addUpdate('author', oldData.member_author, updatedArticle.author);
  }
  if (updateData.cover) {
    addUpdate('cover', oldData.cover, updatedArticle.cover);
  }
  if (updateData.cover_landscape) {
    addUpdate('cover_landscape', oldData.cover_landscape, updatedArticle.cover_landscape);
  }
  if (updateData.snippets) {
    addUpdate('snippets', oldData.snippets, updatedArticle.snippets);
  }
  if (updateData.body) {
    addUpdate('body', oldData.body, updatedArticle.body);
  }

  // Add timestamps at the end
  responseData = {
    ...responseData,
    created_at: updatedArticle.created_at,
    updated_at: updatedArticle.updated_at,
    deleted_at: updatedArticle.deleted_at,
  };

  const responseMessage = `Successfully updated article ${updates.join(' and ')}.`;

  return [responseMessage, responseData];
};
