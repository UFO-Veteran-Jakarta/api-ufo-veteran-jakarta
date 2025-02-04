const {
  getPageBySlug,
  getPageSectionBySlug,
  updatePageSectionBySlug,
} = require('../models/pageModel');
const { formatPageSections } = require('../collections/pageCollection');
const scraper = require('../utils/scraper');

exports.getPageBySlug = async (slug) => {
  try {
    let result = await getPageBySlug(slug);
    if (!result) {
      // case: data not found in database
      result = await scraper.webScrap(slug);
    } else {
      // decide cache hit or miss
      result = await scraper.cacheLookup(result);
    }

    return result;
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

    await scraper.updatePageContent(sections);

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
