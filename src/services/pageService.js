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
      const cacheLookup = await scraper.cacheLookup(result);
      result = cacheLookup.pages;
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
    const htmlContent = await scraper.fetchPageContent(slug);
    const sections = data.sections;

    const updatedHtml = await scraper.htmlContentUpdate(
      htmlContent, sections,
    );

    const updatedPage = await scraper.updateScrapedData(
      slug, updatedHtml, sections,
    );
    const formattedResult = formatPageSections(updatedPage.pageSections);

    return formattedResult;
  } catch (error) {
    console.error('Error updating page section by slug:', error);
    throw error;
  }
};
