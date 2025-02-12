const cheerio = require('cheerio');
const pool = require('../config/database');
const scraperConfig = require('../config/scraper');
const { slugToTitle } = require('../helpers/slug');
const browserLock = require('./browserLock');
const puppeteer = require('puppeteer-core');

const fetchPageContent = async (slug) => {
  // Returns promise, prevents simultaneous scraping
  if (browserLock[slug]) {
    console.log(`Browser for '${slug}' is already scraping. Waiting...`);
    return browserLock[slug];
  }

  const scrapingPromise = (async () => {
    let browser;
    try {
      let targetSlug = slug;
      if (slug === 'home') {
        targetSlug = '';
      }
  
      browser = await puppeteer.launch({
        headless: true,
        executablePath: scraperConfig.browserExecutable,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-background-networking',
          '--disable-software-rasterizer',
        ],
      });
      console.log(`Browser '${slug}' locked`);
      browserLock[slug] = scrapingPromise;
  
      const page = await browser.newPage();
      const baseUrl = scraperConfig.baseUrl;
      console.log(`FETCHING: ${baseUrl}/${targetSlug}`);
      
      await page.goto(`${baseUrl}/${targetSlug}`, {
        waitUntil: 'networkidle0',
        timeout: 60_000,
      })

      let html = await page.content();
      html = html.replace(
        '</head>',
        `
          <base href="${baseUrl}" target="_blank" />
        </head>`,
      );
      html = html.replace(/href="\/_next\//g, `href="${baseUrl}/_next/`);
  
      return html;
    } catch (error) {
      console.error('Error while fetching page content:', error);
      return null;
    } finally {
      delete browserLock[slug];
      if (browser) {
        console.log('Browser instance closed');
        await browser.close();
      } else {
        console.log('No browser instance found');
      }
    }
  })();

  return scrapingPromise;
};

/**
 * Scrapes the web page content based on the given slug.
 */
const webScrap = async (slug, postJobAction = 'store') => {
  try {
    console.log('Executing web scraping job...');

    const html = await fetchPageContent(slug);
    if (!html) return null;

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
    return { pages: result };
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

    // Update pages.full_code
    const updatedPage = await pool.query(`
      UPDATE pages SET
        full_code = $2,
        updated_at = $3
      WHERE slug = $1
      RETURNING *
    `, [slug, htmlContent, NOW]);

    const pageId = updatedPage.rows[0].id;

    // Update existing `page_sections` per batch
    const updatedPageSections = [];
    const stagedPageSections = [];
    const batchSize = 5;
    for (let i = 0; i < sections.length; i += batchSize) {
      const batch = sections.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (section) => {
          try {
            const res = await pool.query(`
              UPDATE page_sections ps
              SET content = $3,
                  updated_at = $4
              FROM pages p
              WHERE ps.page_id = p.id
                AND ps.page_id = $1
                AND ps.section_key = $2
              RETURNING 
                ps.page_id AS page_id,
                p.slug AS page_slug,
                p.title AS page_title,
                ps.section_key AS sections_section_key,
                ps.content AS sections_content,
                ps.created_at AS sections_created_at,
                ps.updated_at AS sections_updated_at
            `, [pageId, section.section_key, section.content, NOW],
            );
            
            if (res.rows.length > 0) {
              updatedPageSections.push(...res.rows);
            } else {
              stagedPageSections.push({
                page_id: pageId,
                section_key: section.section_key,
                content: section.content,
                updated_at: NOW,
              });
            }
          } catch (error) {
            console.error(`Error updating section ${section.section_key}:`, error);
          }
        })
      );
    }

    // Insert new `page_sections` values if exist
    if (stagedPageSections.length > 0) {
      const values = stagedPageSections.map((section) => [
        section.page_id,
        section.section_key,
        section.content,
        section.updated_at,
      ]);

      const res = await pool.query(`
        INSERT INTO page_sections (page_id, section_key, content, updated_at)
        VALUES ${values.map(() => '(?, ?, ?, ?)').join(', ')}
        RETURNING
          page_sections.page_id AS page_id,
          (SELECT slug FROM pages WHERE id = page_sections.page_id) AS page_slug,
          (SELECT title FROM pages WHERE id = page_sections.page_id) AS page_title,
          page_sections.section_key AS sections_section_key,
          page_sections.content AS sections_content,
          page_sections.created_at AS sections_created_at,
          page_sections.updated_at AS sections_updated_at
      `, values.flat());

      updatedPageSections.push(...res.rows);
    }

    return {
      pages: updatedPage.rows[0],
      pageSections: updatedPageSections,
    };
  } catch (error) {
    console.error('Error while updating scraped data:', error);
    return null;
  }
};

module.exports = {
  fetchPageContent,
  webScrap,
  pageSectionScrap,
  cacheLookup,
  updateScrapedData,
  htmlContentUpdate,
};
