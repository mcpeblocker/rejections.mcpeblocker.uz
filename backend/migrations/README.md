# Database Migrations

This directory contains database migration files that manage schema changes systematically.

## Migration System

The migration system uses a `schema_migrations` table to track which migrations have been executed. Each migration is run exactly once and recorded in the database.

## Running Migrations

### Development
```bash
# Run from backend directory
npm run migrate

# Or run from Docker
docker exec rejection-backend npm run migrate
```

### Production
Migrations should be run as part of the deployment process, before starting the application server.

## Creating New Migrations

1. **Create a new SQL file** in this directory with the naming convention:
   ```
   XXX_descriptive_name.sql
   ```
   Where XXX is a sequential number (001, 002, 003, etc.)

2. **Write your SQL migration**:
   ```sql
   -- Migration: Brief description
   -- Created: YYYY-MM-DD
   -- Description: Detailed description of what this migration does

   -- Your SQL statements here
   ALTER TABLE users ADD COLUMN new_field VARCHAR(255);
   CREATE INDEX idx_name ON table(column);
   ```

3. **Test the migration**:
   ```bash
   npm run migrate
   ```

4. **Commit both files**: The SQL file and any code changes that depend on it.

## Migration Best Practices

1. **Always use `IF NOT EXISTS` / `IF EXISTS`** to make migrations idempotent when possible:
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS new_field VARCHAR(255);
   CREATE INDEX IF NOT EXISTS idx_name ON table(column);
   ```

2. **One migration per logical change**: Don't mix unrelated schema changes.

3. **Never modify executed migrations**: Once a migration has been run in any environment, create a new migration to make additional changes.

4. **Test rollback strategy**: Consider how to undo changes if needed (create a separate rollback migration if necessary).

5. **Document data migrations**: If you're not just changing schema but also migrating data, document the assumptions and transformations clearly.

## Migration Files

### 001_add_user_profile_fields.sql
- **Date**: 2025-11-29
- **Description**: Adds user profile fields (full_name, bio, avatar_url) and performance indexes
- **Changes**:
  - Added `full_name` VARCHAR(255)
  - Added `bio` TEXT
  - Added `avatar_url` VARCHAR(500)
  - Added index on `username` for faster lookups
  - Added index on `rejection_count DESC` for leaderboard queries

## Troubleshooting

### Migration fails with "relation already exists"
- Use `IF NOT EXISTS` clauses in your SQL
- Check if a previous partial migration left objects behind

### Migration runs but doesn't create objects
- Check Docker logs: `docker logs rejection-backend`
- Verify database connection: `docker exec rejection-db psql -U rejectionuser -d rejectiondb`
- Ensure SQL syntax is correct for PostgreSQL

### Need to re-run a migration
```sql
-- Connect to database
docker exec -it rejection-db psql -U rejectionuser -d rejectiondb

-- Delete the migration record
DELETE FROM schema_migrations WHERE version = '001_add_user_profile_fields';

-- Exit and re-run migrations
npm run migrate
```

## Adding Migrations to Docker Startup

To automatically run migrations when the backend container starts, you can modify the `backend/Dockerfile` or create a startup script that runs migrations before starting the server.

Example startup script (`backend/start.sh`):
```bash
#!/bin/sh
echo "Running database migrations..."
npm run migrate
echo "Starting server..."
npm start
```
