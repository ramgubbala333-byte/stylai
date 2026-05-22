"""Initial schema

Revision ID: 001_initial
Revises:
Create Date: 2024-01-01
"""
from alembic import op

revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop everything cleanly first (idempotent — safe to re-run)
    op.execute("DROP TABLE IF EXISTS style_results CASCADE")
    op.execute("DROP TABLE IF EXISTS appearance_profiles CASCADE")
    op.execute("DROP TABLE IF EXISTS users CASCADE")
    op.execute("DROP TYPE IF EXISTS gender CASCADE")
    op.execute("DROP TYPE IF EXISTS faceshape CASCADE")
    op.execute("DROP TYPE IF EXISTS skintone CASCADE")
    op.execute("DROP TYPE IF EXISTS skinundertone CASCADE")
    op.execute("DROP TYPE IF EXISTS hairtexture CASCADE")
    op.execute("DROP TYPE IF EXISTS hairdensity CASCADE")
    op.execute("DROP TYPE IF EXISTS analysisstatus CASCADE")

    # Enable UUID extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # Create enum types
    op.execute("CREATE TYPE gender AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say')")
    op.execute("CREATE TYPE faceshape AS ENUM ('oval', 'round', 'square', 'heart', 'diamond', 'oblong', 'triangle', 'unknown')")
    op.execute("CREATE TYPE skintone AS ENUM ('fair', 'light', 'medium', 'olive', 'tan', 'deep', 'rich')")
    op.execute("CREATE TYPE skinundertone AS ENUM ('cool', 'warm', 'neutral')")
    op.execute("CREATE TYPE hairtexture AS ENUM ('straight', 'wavy', 'curly', 'coily', 'unknown')")
    op.execute("CREATE TYPE hairdensity AS ENUM ('thin', 'medium', 'thick')")
    op.execute("CREATE TYPE analysisstatus AS ENUM ('pending', 'processing', 'completed', 'failed')")

    # Create users table — raw SQL so SQLAlchemy never auto-creates enums
    op.execute("""
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email VARCHAR(255) NOT NULL UNIQUE,
            hashed_password VARCHAR(255) NOT NULL,
            full_name VARCHAR(255),
            gender gender,
            date_of_birth VARCHAR(10),
            is_active BOOLEAN DEFAULT TRUE,
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX ix_users_email ON users (email)")

    # Create appearance_profiles table
    op.execute("""
        CREATE TABLE appearance_profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES users(id),
            is_active BOOLEAN DEFAULT TRUE,
            selfie_url VARCHAR(500) NOT NULL,
            selfie_key VARCHAR(500) NOT NULL,
            analysis_status analysisstatus DEFAULT 'pending',
            analysis_error TEXT,
            analyzed_at TIMESTAMP,
            face_shape faceshape,
            face_shape_confidence FLOAT,
            face_landmark_ratios JSONB,
            skin_tone skintone,
            skin_undertone skinundertone,
            skin_lab_values JSONB,
            contrast_level FLOAT,
            hair_color_hex VARCHAR(7),
            hair_texture hairtexture,
            hair_density hairdensity,
            hairline_type VARCHAR(50),
            beard_coverage VARCHAR(50),
            beard_density VARCHAR(50),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX ix_appearance_profiles_user_id ON appearance_profiles (user_id)")

    # Create style_results table
    op.execute("""
        CREATE TABLE style_results (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES users(id),
            appearance_profile_id UUID NOT NULL REFERENCES appearance_profiles(id),
            color_season VARCHAR(50),
            recommended_colors JSONB,
            colors_to_avoid JSONB,
            hairstyle_recommendations JSONB,
            hairstyles_to_avoid JSONB,
            beard_recommendations JSONB,
            outfit_directions JSONB,
            clothing_details JSONB,
            narrative_summary TEXT,
            engine_version VARCHAR(20) DEFAULT '1.0.0',
            share_token VARCHAR(64) UNIQUE,
            result_card_url VARCHAR(500),
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX ix_style_results_user_id ON style_results (user_id)")
    op.execute("CREATE INDEX ix_style_results_share_token ON style_results (share_token)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS style_results CASCADE")
    op.execute("DROP TABLE IF EXISTS appearance_profiles CASCADE")
    op.execute("DROP TABLE IF EXISTS users CASCADE")
    op.execute("DROP TYPE IF EXISTS analysisstatus")
    op.execute("DROP TYPE IF EXISTS hairdensity")
    op.execute("DROP TYPE IF EXISTS hairtexture")
    op.execute("DROP TYPE IF EXISTS skinundertone")
    op.execute("DROP TYPE IF EXISTS skintone")
    op.execute("DROP TYPE IF EXISTS faceshape")
    op.execute("DROP TYPE IF EXISTS gender")
