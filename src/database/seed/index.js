const seeders = require('./seeders');

console.log(`Seeding database '${process.env.DB_NAME}'`);
(async () => {
  await seeders.seed();
})();

console.log('Success seeding');
