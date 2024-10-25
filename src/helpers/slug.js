const slugify = require('slugify');
const crypto = require('crypto');
const he = require('he');

exports.generateUniqueSlug = (title) => {
  const baseSlug = slugify(title, { lower: true, strict: true });
  const uniqueCode = crypto.randomBytes(4).toString('hex');
  return `${baseSlug}-${uniqueCode}`;
};

const SPECIAL_CHARS_MAP = [
  ['&', ''],
  ['<', ''],
  ['>', ''],
  ['©', ''],
  ['®', ''],
  ['™', ''],
  ['℠', ''],
  ['§', ''],
  ['¶', ''],
  ['†', ''],
  ['‡', ''],
  ['°', ''],
  ['∙', '-'],
  ['•', '-'],
  ['⋅', '-'],
  ['·', '-'],
  ['★', ''],
  ['☆', ''],
  ['♥', ''],
  ['♦', ''],
  ['♠', ''],
  ['♣', ''],
  ['\u201C', ''],
  ['\u201D', ''],
  ['\u2018', ''],
  ['\u2019', ''],
  ['«', ''],
  ['»', ''],
  ['…', ''],
  ['—', '-'],
  ['–', '-'],
  ['❤', ''],
  ['♡', ''],
  ['☺', ''],
  ['☻', ''],
  ['♪', ''],
  ['♫', ''],
  ['☼', ''],
  ['♂', ''],
  ['♀', ''],
  ['⚤', ''],
  ['⚢', ''],
  ['⚣', ''],
  ['⚥', ''],
  ['⚦', ''],
  ['⚧', ''],
  ['⚨', ''],
  ['⚩', ''],
];

exports.createSlugDivision = async (
  title,
  checkSlugExistsInDb,
  options = {},
) => {
  try {
    if (!title || typeof title !== 'string') {
      throw new Error('Division name is required');
    }

    let decodedTitle = he.decode(title);

    SPECIAL_CHARS_MAP.forEach(([char, replacement]) => {
      decodedTitle = decodedTitle.replace(new RegExp(char, 'g'), replacement);
    });

    const cleanedTitle = decodedTitle
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s-]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/(^-+|-+$)/g, '');

    const baseSlug = slugify(cleanedTitle, {
      lower: true,
      strict: true,
      trim: true,
      ...options,
    });

    const exists = await checkSlugExistsInDb(baseSlug);

    if (!exists) {
      return baseSlug;
    }

    const uniqueCode = crypto.randomBytes(4).toString('hex').substring(0, 8);

    return `${baseSlug}-${uniqueCode}`;
  } catch (error) {
    throw new Error(`Failed to generate slug: ${error.message}`);
  }
};

exports.SPECIAL_CHARS_MAP = SPECIAL_CHARS_MAP;
