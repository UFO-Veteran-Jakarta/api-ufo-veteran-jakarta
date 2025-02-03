const init = require('./script');

console.log(`Initializing database '${process.env.DB_NAME}'`);
(async () => {
  await init.dropTable();
  await init.createTable();
})();

console.log('Success init');