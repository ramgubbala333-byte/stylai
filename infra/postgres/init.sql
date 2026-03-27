-- StylAI PostgreSQL initialization
-- This runs once when the container is first created

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for future fuzzy search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Confirm
SELECT 'StylAI database initialized' AS status;
