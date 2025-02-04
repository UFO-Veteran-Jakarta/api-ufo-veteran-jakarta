const fetch = require('node-fetch');
const cheerio = require('cheerio');
const pool = require('../config/database');
const scraperConfig = require('../config/scraper');
const pageModel = require('../models/pageModel');
const { slugToTitle } = require('../helpers/slug');

/**
 * Scrapes the web page content based on the given slug.
 */
const webScrap = async (slug, postJobAction = 'store') => {
  try {
    let targetSlug = slug;
    if (slug === 'home') {
      targetSlug = '';
    }

    // web scrap
    const response = await fetch(`${scraperConfig.baseUrl}/${targetSlug}`);
    if (!response.ok) {
      console.error(`Failed to fetch ${slug}: ${response.status} ${response.statusText}`);
      return null;
    }

    const html = await response.text();

    // Extract page sections
    const sections = await pageSectionScrap(html);

    // Upsert separation to prevent indexing exhaustion
    if (postJobAction === 'store') {
      // Store scraped data in the database
      return await storeScrapedData(slug, html, sections);
    } else if (postJobAction === 'update') {
      // Update scraped data
      const updatedHtml = await htmlContentUpdate(html, sections);
      return await updateScrapedData(slug, updatedHtml, sections);
    }

    return null;
  } catch (error) {
    console.error('Error while web scraping:', error);
    return null;
  }
};

const pageSectionScrap = async (htmlContent) => {
  try {
    const $ = cheerio.load(htmlContent);
    const sections = [];

    // Extract sections using IDs
    $('*[id]').each((_, element) => {
      const section_key = $(element).attr('id');
      const content = $(element).html().trim();
      if (section_key && content) {
        sections.push({ section_key, content });
      }
    });

    return sections;
  } catch (error) {
    console.error('Error while scrapping page section:', error);
    return [];
  }
};

const htmlContentUpdate = async (htmlContent, sections) => {
  try {
    const $ = cheerio.load(htmlContent);

    sections.forEach(({ section_key, content }) => {
      $(`#${section_key}`).html(content);
    });

    return $.html();
  } catch (error) {
    console.error('Error while updating the page html content:', error);
    return null;
  }
};

/**
 * Checks stored content cache in the database
 * then decidee whether the cache is hit or miss.
 * 
 */
const cacheLookup = async (result) => {
  try {
    const lastUpdated = new Date(result.updated_at);
    if (Date.now() - lastUpdated.getTime() > scraperConfig.ttl) {
      // Cache miss
      console.log('CACHE MISS');

      return await webScrap(result.slug, 'update');
    }
    
    console.log('CACHE HIT');
    return result;
  } catch (error) {
    console.error('Error while cache lookup:', error);
  }
}

/**
 * Stores the scraped page and its sections in the database.
 */
const storeScrapedData = async (slug, htmlContent, sections) => {
  try {
    const NOW = new Date();
    const title = slugToTitle(slug);

    // Step 1: Insert into `pages` and get the `id`
    const pageResult = await pool.query(
      `
      INSERT INTO pages (slug, title, full_code, updated_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [slug, title, htmlContent, NOW]
    );

    const pageId = pageResult.rows[0].id;

    // Step 2: Bulk insert into `page_sections` using `UNNEST`
    if (sections.length > 0) {
      await pool.query(
        `
        INSERT INTO page_sections (page_id, section_key, content, updated_at)
        SELECT $1, unnest($2::text[]), unnest($3::text[]), unnest($4::timestamp[])
        `,
        [
          pageId,
          sections.map((s) => s.section_key),
          sections.map((s) => s.content),
          sections.map(() => NOW),
        ]
      );
    }

    return pageResult.rows[0];
  } catch (error) {
    console.error('Error while storing scraped data:', error);
    return null;
  }
};

/**
 * Updates the scraped page and its sections in the database.
 */
const updateScrapedData = async (slug, htmlContent, sections) => {
  try {
    const NOW = new Date();

    // Step 1: Update pages.full_code
    const updatedPage = await pool.query(`
      UPDATE pages SET
        full_code = $2,
        updated_at = $3
      WHERE slug = $1
      RETURNING *
    `, [slug, htmlContent, NOW]);

    const pageId = updatedPage.rows[0].id;

    // Step 2: Update existing `page_sections`
    await Promise.all(
      sections.map((section) =>
        pool.query(`
          UPDATE page_sections SET
            content = $3,
            updated_at = $4
          WHERE page_id = $1 AND section_key = $2
        `, [pageId, section.section_key, section.content, NOW],
        )
      )
    );

    // Step 3: Insert new `page_sections` if they don’t exist
    await pool.query(`
      INSERT INTO page_sections (page_id, section_key, content, updated_at)
      SELECT $1, unnest($2::text[]), unnest($3::text[]), unnest($4::timestamp[])
      WHERE NOT EXISTS (
        SELECT 1 FROM page_sections 
        WHERE page_sections.page_id = $1 
        AND page_sections.section_key = ANY($2)
      )
    `, [
        pageId,
        sections.map((s) => s.section_key),
        sections.map((s) => s.content),
        sections.map(() => NOW),
      ],
    );

    return updatedPage.rows[0];
  } catch (error) {
    console.error('Error while updating scraped data:', error);
    return null;
  }
};

module.exports = {
  webScrap,
  pageSectionScrap,
  cacheLookup,
};
