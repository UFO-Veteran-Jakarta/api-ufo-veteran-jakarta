const formatChairmanHistory = (data) => {
  if (!data) {
    return null;
  }
  return {
    id: data.id,
    name: data.name,
    image: data.image,
    start_year: data.start_year,
    end_year: data.end_year,
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

const formatChairmanHistories = (datas) => (Array.isArray(datas) ? datas.map(
  formatChairmanHistory,
) : []);

module.exports = {
  formatChairmanHistories,
  formatChairmanHistory,
};
