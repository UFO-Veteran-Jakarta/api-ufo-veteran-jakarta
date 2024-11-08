const slugify = require('slugify');
const crypto = require('crypto');
const he = require('he');
const { SPECIAL_CHARS_MAP } = require('../config/slug');

exports.generateUniqueSlug = (title) => {
  const baseSlug = slugify(title, { lower: true, strict: true });
  const uniqueCode = crypto.randomBytes(4).toString('hex');
  return `${baseSlug}-${uniqueCode}`;
};

// Cleans the title from unwanted string
const generateCleanTitle = (title) => {
  // Decode title
  let decodedTitle = he.decode(title);

  // Character replacement
  SPECIAL_CHARS_MAP.forEach(([char, replacement]) => {
    decodedTitle = decodedTitle.replace(new RegExp(char, 'g'), replacement);
  });

  // Clean the unicode characters
  return decodedTitle
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/(^-+|-+$)/g, '');
};

exports.createSlugDivision = async (
  title,
  checkSlugExistsInDb,
  options = {},
) => {
  try {
    if (!title || typeof title !== 'string') {
      throw new Error('Division name is required');
    }

    // Generates a clean title string
    const cleanedTitle = generateCleanTitle(title);

    const baseSlug = slugify(cleanedTitle, {
      lower: true,
      strict: true,
      trim: true,
      ...options,
    });

    // If slug exists in database, then
    if (!await checkSlugExistsInDb(baseSlug)) {
      return baseSlug;
    }

    const uniqueCode = crypto.randomBytes(4).toString('hex').substring(0, 8);

    return `${baseSlug}-${uniqueCode}`;
  } catch (error) {
    throw new Error(`Failed to generate slug: ${error.message}`);
  }
};
