/**
 * 
 * Reference: Laravel HTTP Resource Collection
 * 
 */
const formatGallery = (data) => {
  if (!data) {
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    category_galleries: {
      id: data.category_galleries_id,
      name: data.category_galleries_name,
    },
    title: data.title,
    image: data.image,
    snippet: data.snippet,
    author: data.author,
    created_at: data.created_at,
    updated_at: data.updated_at,
    deleted_at: data.deleted_at,
  };
};

const formatGalleries = (datas) => datas.map(formatGallery);

module.exports = {
  formatGallery,
  formatGalleries,
};
