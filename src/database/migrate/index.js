const fs = require('fs');
const pool = require('../../config/database');

// Function to run migrations
async function runMigrations() {
  const client = await pool.connect();
  try {
    // Step 1: Scan the migrations directory for all migration files
    const migrationFiles = fs.readdirSync('./migrations')
      .filter(file => file.endsWith('.js'))
      .sort();

    // Step 2: Query the database to get all applied migrations
    const { rows: appliedMigrations } = await client.query(`
      SELECT name FROM _migrations GROUP BY name ORDER BY MAX(created_at) DESC
    `);
    const appliedMigrationNames = appliedMigrations.map(m => m.name);

    // Step 3: Find migrations that have not been applied yet
    const migrationsToApply = migrationFiles.filter(file => !appliedMigrationNames.includes(file));

    // Step 4: For each unapplied migration, load and run it
    for (const migrationFile of migrationsToApply) {
      const migrationPath = `./migrations/${migrationFile}`;
      
      if (fs.existsSync(migrationPath)) {
        console.log(`Applying migration: ${migrationFile}`);

        // Dynamically load the migration file
        const migrationFileModule = require(migrationPath);

        // Run the migration (assuming each migration file exports a 'migrate' function)
        await migrationFileModule.migrate(client);

        // Step 5: Insert a record into _migrations to mark it as applied
        await client.query(
          'INSERT INTO _migrations (name) VALUES ($1)',
          [migrationFile]
        );

        console.log(`Migration applied: ${migrationFile}`);
      } else {
        console.error(`Migration file not found: ${migrationPath}`);
      }
    }

  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    client.release(); // Release the database client back to the pool
  }
}

// Run the migration process
runMigrations().catch(error => console.error('Migration process failed', error));
