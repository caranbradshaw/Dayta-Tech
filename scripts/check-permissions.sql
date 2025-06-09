-- Check current user and permissions
SELECT current_user, current_database(), current_schema();

-- Check table creation permissions
SELECT has_schema_privilege(current_user, 'public', 'CREATE') as can_create_tables;

-- Check existing tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check if we can create a simple table
CREATE TABLE permission_test (id INTEGER);
DROP TABLE permission_test;
