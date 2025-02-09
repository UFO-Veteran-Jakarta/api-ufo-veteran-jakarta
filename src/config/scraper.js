// HTML scraper configuration
module.exports = {
  baseUrl: process.env.SCRAPER_BASE_URL || 'https://ufoveteran.com',
  ttl: 60 * 60 * 1000, // minutes * seconds * ms = 1 hour
  browserExecutable: process.env.SCRAPER_BROWSER_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
};
