/**
 *
 * Reference: galleryCollection
 *
 */
const formatFounderMember = (data) => {
  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    image: data.image,
    created_at: data.created_at,
    updated_at: data.updated_at,
    deleted_at: data.deleted_at,
  };
};

const formatFounderMembers = (datas) => (Array.isArray(datas) ? datas.map(
  formatFounderMember,
) : []);

module.exports = {
  formatFounderMember,
  formatFounderMembers,
};
