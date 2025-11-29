/**
 * Database Migration Runner
 * Manages schema changes in a systematic way
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/database');

// Create migrations table if it doesn't exist
async function createMigrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      version VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Get list of executed migrations
async function getExecutedMigrations() {
  const result = await db.query(
    'SELECT version FROM schema_migrations ORDER BY version'
  );
  return result.rows.map(row => row.version);
}

// Get all migration files
function getMigrationFiles() {
  const migrationsDir = __dirname;
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  return files;
}

// Execute a migration
async function executeMigration(filename) {
  const filePath = path.join(__dirname, filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  const version = filename.replace('.sql', '');
  
  console.log(`Executing migration: ${filename}`);
  
  try {
    await db.query('BEGIN');
    
    // Execute the migration SQL
    await db.query(sql);
    
    // Record the migration
    await db.query(
      'INSERT INTO schema_migrations (version, description) VALUES ($1, $2)',
      [version, `Migration from ${filename}`]
    );
    
    await db.query('COMMIT');
    console.log(`✅ Migration ${filename} completed successfully`);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(`❌ Migration ${filename} failed:`, error.message);
    throw error;
  }
}

// Run all pending migrations
async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...\n');
    
    await createMigrationsTable();
    
    const executedMigrations = await getExecutedMigrations();
    const migrationFiles = getMigrationFiles();
    
    const pendingMigrations = migrationFiles.filter(
      file => !executedMigrations.includes(file.replace('.sql', ''))
    );
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations. Database is up to date!\n');
      return;
    }
    
    console.log(`Found ${pendingMigrations.length} pending migration(s):\n`);
    pendingMigrations.forEach(file => console.log(`  - ${file}`));
    console.log('');
    
    for (const file of pendingMigrations) {
      await executeMigration(file);
    }
    
    console.log('\n🎉 All migrations completed successfully!\n');
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    // Close database connection if the pool has an end method
    if (db.end && typeof db.end === 'function') {
      await db.end();
    }
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
