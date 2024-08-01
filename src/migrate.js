const migrate = require('./migration/users');

console.log('DB NAME : ', process.env.DB_NAME);
(async () => {
  await migrate.dropTable();
  await migrate.createTable();
})();

console.log('Success migrate');
