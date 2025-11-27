# Database Migration Guide

## Running Migrations Safely

This guide explains how to run database migrations for Timewave Radio.

## Available Migration Scripts

1. **01-create-tables.sql** - Initial database schema (users, newsletter, sessions, requests)
2. **02-add-song-history.sql** - Adds song history tracking table
3. **03-schedule-table.sql** - Adds schedule management table
4. **04-user-profiles-friends-safe.sql** - Adds user profile fields and friends system (safe to re-run)

## How to Run Migrations

### Option 1: Using MySQL Command Line

\`\`\`bash
# From your project directory
mysql -h liamradford.me -u liamradf_timewaveradio -p liamradf_timewaveradio < scripts/04-user-profiles-friends-safe.sql
\`\`\`

### Option 2: Using cPanel phpMyAdmin

1. Log into your cPanel
2. Open phpMyAdmin
3. Select your database: `liamradf_timewaveradio`
4. Click the "SQL" tab
5. Copy and paste the contents of the migration file
6. Click "Go" to execute

### Option 3: Using the Setup Script

\`\`\`bash
# Run the automated database setup
npm run setup-db
\`\`\`

## Checking What's Been Run

To see what tables and columns exist in your database:

\`\`\`sql
-- Show all tables
SHOW TABLES;

-- Show columns in users table
DESCRIBE users;

-- Show columns in a specific table
DESCRIBE user_friends;
\`\`\`

## Common Migration Issues

### Issue: "Duplicate column name"

This means the column already exists. Use the `-safe` version of migration scripts which check for existing columns before adding them.

**Solution:**
\`\`\`bash
# Use the safe migration script
mysql -h liamradford.me -u liamradf_timewaveradio -p liamradf_timewaveradio < scripts/04-user-profiles-friends-safe.sql
\`\`\`

### Issue: "Table already exists"

This is normal - the migration uses `CREATE TABLE IF NOT EXISTS` which safely skips table creation if it already exists.

### Issue: Foreign key constraint fails

This means you're trying to reference a table or column that doesn't exist yet. Run migrations in order:
1. Run 01-create-tables.sql first
2. Then run subsequent migrations in numerical order

## Verifying Migration Success

After running a migration, verify it worked:

\`\`\`sql
-- Check if favorite_song_title column exists
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' 
AND COLUMN_NAME = 'favorite_song_title';

-- Check if user_friends table exists
SHOW TABLES LIKE 'user_friends';

-- Test a query
SELECT id, username, favorite_song_title FROM users LIMIT 1;
\`\`\`

## Rolling Back Migrations

If you need to undo a migration:

\`\`\`sql
-- Remove columns added in 04-user-profiles-friends-safe.sql
ALTER TABLE users DROP COLUMN IF EXISTS favorite_song_title;
ALTER TABLE users DROP COLUMN IF EXISTS favorite_song_artist;
ALTER TABLE users DROP COLUMN IF EXISTS favorite_song_itunes_id;
ALTER TABLE users DROP COLUMN IF EXISTS favorite_song_artwork;
ALTER TABLE users DROP COLUMN IF EXISTS about_me;
ALTER TABLE users DROP COLUMN IF EXISTS profile_picture_url;

-- Drop tables
DROP TABLE IF EXISTS profile_views;
DROP TABLE IF EXISTS user_friends;
\`\`\`

## Best Practices

1. **Always backup your database before running migrations**
   \`\`\`bash
   mysqldump -h liamradford.me -u liamradf_timewaveradio -p liamradf_timewaveradio > backup_$(date +%Y%m%d_%H%M%S).sql
   \`\`\`

2. **Run migrations in a test environment first** (if available)

3. **Keep track of which migrations have been run** - Consider creating a migrations log table

4. **Use the safe versions of migration scripts** - They check for existing columns/tables

5. **Test the application after migrations** - Ensure everything works as expected

## Need Help?

If you encounter issues:
1. Check the server logs: `pm2 logs timewave-radio`
2. Verify database connection in `.env.local`
3. Test database connectivity: `mysql -h liamradford.me -u liamradf_timewaveradio -p`
4. Review the TROUBLESHOOTING.md guide
