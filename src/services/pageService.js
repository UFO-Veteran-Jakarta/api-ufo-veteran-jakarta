const {
  getPageBySlug,
  getPageSectionBySlug,
  updatePageSectionBySlug,
} = require('../models/pageModel');
const { formatPageSections } = require('../collections/pageCollection');

exports.getPageBySlug = async (slug) => {
  try {
    return await getPageBySlug(slug);
  } catch (error) {
    console.error('Error fetching page by slug:', error);
    throw error;
  }
};

exports.getPageSectionBySlug = async (slug) => {
  try {
    const result = await getPageSectionBySlug(slug);
    const formattedResult = formatPageSections(result);
    return formattedResult;
  } catch (error) {
    console.error('Error fetching page section by slug:', error);
    throw error;
  }
};

exports.updatePageSectionBySlug = async (slug, data) => {
  try {
    const results = [];

    for (const section of data?.sections) {
      const result = await updatePageSectionBySlug(slug, section);
      results.push(result);
    }

    const formattedResult = formatPageSections(results)

    return formattedResult;
  } catch (error) {
    console.error('Error updating page section by slug:', error);
    throw error;
  }
};
