/**
 * 
 * Reference: Laravel HTTP Resource Collection
 * 
 */
const formatPageSections = (datas) => {
  if (!datas) {
    return null;
  }

  const result = datas.reduce((acc, row) => {
    if (!acc.pages) {
      acc.pages = {
        id: row.page_id,
        slug: row.page_slug,
        title: row.page_title,
      };
      acc.sections = [];
    }
  
    acc.sections.push({
      section_key: row.sections_section_key,
      content: row.sections_content,
      created_at: row.sections_created_at,
      updated_at: row.sections_updated_at,
    });
  
    return acc;
  }, {});

  return result;
};

module.exports = {
  formatPageSections,
};