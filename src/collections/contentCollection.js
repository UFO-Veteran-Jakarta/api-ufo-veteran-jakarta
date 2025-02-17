const formatContent = (data) => {
  if (!data) {
    return null;
  }

  return {
    id: data.id,
    link: data.link,
    caption: data.caption,
    image: data.image,
    created_at: data.created_at,
    updated_at: data.updated_at,
    deleted_at: data.deleted_at,
  };
};

const formatContents = (datas) => datas.map(formatContent);

module.exports = {
  formatContent,
  formatContents,
};
