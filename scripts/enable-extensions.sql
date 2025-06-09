-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Test UUID generation
SELECT uuid_generate_v4() as test_uuid;
SELECT gen_random_uuid() as test_uuid_2;
