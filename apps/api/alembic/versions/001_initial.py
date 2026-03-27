"""Initial schema — users, appearance_profiles, style_results

Revision ID: 001_initial
Revises: 
Create Date: 2024-01-01 00:00:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Enums ────────────────────────────────────────────────────────────────
    op.execute("CREATE TYPE gender AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say')")
    op.execute("CREATE TYPE faceshape AS ENUM ('oval', 'round', 'square', 'heart', 'diamond', 'oblong', 'triangle', 'unknown')")
    op.execute("CREATE TYPE skintone AS ENUM ('fair', 'light', 'medium', 'olive', 'tan', 'deep', 'rich')")
    op.execute("CREATE TYPE skinundertone AS ENUM ('cool', 'warm', 'neutral')")
    op.execute("CREATE TYPE hairtexture AS ENUM ('straight', 'wavy', 'curly', 'coily', 'unknown')")
    op.execute("CREATE TYPE hairdensity AS ENUM ('thin', 'medium', 'thick')")
    op.execute("CREATE TYPE analysisstatus AS ENUM ('pending', 'processing', 'completed', 'failed')")

    # ── users ────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255)),
        sa.Column("gender", sa.Enum("male", "female", "non_binary", "prefer_not_to_say", name="gender")),
        sa.Column("date_of_birth", sa.String(10)),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("is_verified", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # ── appearance_profiles ───────────────────────────────────────────────────
    op.create_table(
        "appearance_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("selfie_url", sa.String(500), nullable=False),
        sa.Column("selfie_key", sa.String(500), nullable=False),
        sa.Column("analysis_status", sa.Enum("pending", "processing", "completed", "failed", name="analysisstatus")),
        sa.Column("analysis_error", sa.Text),
        sa.Column("analyzed_at", sa.DateTime),
        sa.Column("face_shape", sa.Enum("oval", "round", "square", "heart", "diamond", "oblong", "triangle", "unknown", name="faceshape")),
        sa.Column("face_shape_confidence", sa.Float),
        sa.Column("face_landmark_ratios", postgresql.JSONB),
        sa.Column("skin_tone", sa.Enum("fair", "light", "medium", "olive", "tan", "deep", "rich", name="skintone")),
        sa.Column("skin_undertone", sa.Enum("cool", "warm", "neutral", name="skinundertone")),
        sa.Column("skin_lab_values", postgresql.JSONB),
        sa.Column("contrast_level", sa.Float),
        sa.Column("hair_color_hex", sa.String(7)),
        sa.Column("hair_texture", sa.Enum("straight", "wavy", "curly", "coily", "unknown", name="hairtexture")),
        sa.Column("hair_density", sa.Enum("thin", "medium", "thick", name="hairdensity")),
        sa.Column("hairline_type", sa.String(50)),
        sa.Column("beard_coverage", sa.String(50)),
        sa.Column("beard_density", sa.String(50)),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_appearance_profiles_user_id", "appearance_profiles", ["user_id"])

    # ── style_results ─────────────────────────────────────────────────────────
    op.create_table(
        "style_results",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("appearance_profile_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("appearance_profiles.id"), nullable=False),
        sa.Column("color_season", sa.String(50)),
        sa.Column("recommended_colors", postgresql.JSONB),
        sa.Column("colors_to_avoid", postgresql.JSONB),
        sa.Column("hairstyle_recommendations", postgresql.JSONB),
        sa.Column("hairstyles_to_avoid", postgresql.JSONB),
        sa.Column("beard_recommendations", postgresql.JSONB),
        sa.Column("outfit_directions", postgresql.JSONB),
        sa.Column("clothing_details", postgresql.JSONB),
        sa.Column("narrative_summary", sa.Text),
        sa.Column("engine_version", sa.String(20), default="1.0.0"),
        sa.Column("share_token", sa.String(64), unique=True),
        sa.Column("result_card_url", sa.String(500)),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_style_results_user_id", "style_results", ["user_id"])
    op.create_index("ix_style_results_share_token", "style_results", ["share_token"])


def downgrade() -> None:
    op.drop_table("style_results")
    op.drop_table("appearance_profiles")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS analysisstatus")
    op.execute("DROP TYPE IF EXISTS hairdensity")
    op.execute("DROP TYPE IF EXISTS hairtexture")
    op.execute("DROP TYPE IF EXISTS skinundertone")
    op.execute("DROP TYPE IF EXISTS skintone")
    op.execute("DROP TYPE IF EXISTS faceshape")
    op.execute("DROP TYPE IF EXISTS gender")
