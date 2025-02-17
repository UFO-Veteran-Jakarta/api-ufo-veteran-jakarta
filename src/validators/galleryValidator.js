// Usage reference on src/utils/fieldValidator.js
const fields = [
  {
    name: 'category_galleries_id',
    type: 'integer', 
  },
  {
    name: 'title',
    type: 'string',
  },
  {
    name: 'snippet',
    type: 'string',
    optional: true,
  },
  {
    name: 'author',
    type: 'string',
    optional: true,
  },
  {
    name: 'image',
    type: 'image',
  },
];

module.exports = fields;
