// Usage reference on src/utils/fieldValidator.js
const fields = [
  {
    name: 'name',
    type: 'string',
  },
  {
    name: 'start_year',
    type: 'chairman_start_year',
    optional: true,
  },
  {
    name: 'end_year',
    type: 'chairman_end_year',
  },
  {
    name: 'is_active',
    type: 'chairman_active',
  },
  {
    name: 'image',
    type: 'image',
  },
];

module.exports = fields;
