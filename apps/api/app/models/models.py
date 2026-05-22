import uuid
from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional
from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Gender(str, PyEnum):
    MALE = "male"; FEMALE = "female"; NON_BINARY = "non_binary"; PREFER_NOT_TO_SAY = "prefer_not_to_say"

class FaceShape(str, PyEnum):
    OVAL = "oval"; ROUND = "round"; SQUARE = "square"; HEART = "heart"
    DIAMOND = "diamond"; OBLONG = "oblong"; TRIANGLE = "triangle"; UNKNOWN = "unknown"

class SkinTone(str, PyEnum):
    FAIR = "fair"; LIGHT = "light"; MEDIUM = "medium"; OLIVE = "olive"
    TAN = "tan"; DEEP = "deep"; RICH = "rich"

class SkinUndertone(str, PyEnum):
    COOL = "cool"; WARM = "warm"; NEUTRAL = "neutral"

class HairTexture(str, PyEnum):
    STRAIGHT = "straight"; WAVY = "wavy"; CURLY = "curly"; COILY = "coily"; UNKNOWN = "unknown"

class HairDensity(str, PyEnum):
    THIN = "thin"; MEDIUM = "medium"; THICK = "thick"

class AnalysisStatus(str, PyEnum):
    PENDING = "pending"; PROCESSING = "processing"; COMPLETED = "completed"; FAILED = "failed"

class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    gender: Mapped[Optional[Gender]] = mapped_column(Enum(Gender))
    date_of_birth: Mapped[Optional[str]] = mapped_column(String(10))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    appearance_profiles: Mapped[list["AppearanceProfile"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    style_results: Mapped[list["StyleResult"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class AppearanceProfile(Base):
    __tablename__ = "appearance_profiles"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    selfie_url: Mapped[str] = mapped_column(String(500), nullable=False)
    selfie_key: Mapped[str] = mapped_column(String(500), nullable=False)
    analysis_status: Mapped[AnalysisStatus] = mapped_column(Enum(AnalysisStatus), default=AnalysisStatus.PENDING)
    analysis_error: Mapped[Optional[str]] = mapped_column(Text)
    analyzed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    face_shape: Mapped[Optional[FaceShape]] = mapped_column(Enum(FaceShape))
    face_shape_confidence: Mapped[Optional[float]] = mapped_column(Float)
    face_landmark_ratios: Mapped[Optional[dict]] = mapped_column(JSONB)
    skin_tone: Mapped[Optional[SkinTone]] = mapped_column(Enum(SkinTone))
    skin_undertone: Mapped[Optional[SkinUndertone]] = mapped_column(Enum(SkinUndertone))
    skin_lab_values: Mapped[Optional[dict]] = mapped_column(JSONB)
    contrast_level: Mapped[Optional[float]] = mapped_column(Float)
    hair_color_hex: Mapped[Optional[str]] = mapped_column(String(7))
    hair_texture: Mapped[Optional[HairTexture]] = mapped_column(Enum(HairTexture))
    hair_density: Mapped[Optional[HairDensity]] = mapped_column(Enum(HairDensity))
    hairline_type: Mapped[Optional[str]] = mapped_column(String(50))
    beard_coverage: Mapped[Optional[str]] = mapped_column(String(50))
    beard_density: Mapped[Optional[str]] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    user: Mapped["User"] = relationship(back_populates="appearance_profiles")
    style_results: Mapped[list["StyleResult"]] = relationship(back_populates="appearance_profile", cascade="all, delete-orphan")

class StyleResult(Base):
    __tablename__ = "style_results"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    appearance_profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("appearance_profiles.id"), nullable=False)
    color_season: Mapped[Optional[str]] = mapped_column(String(50))
    recommended_colors: Mapped[Optional[list]] = mapped_column(JSONB)
    colors_to_avoid: Mapped[Optional[list]] = mapped_column(JSONB)
    hairstyle_recommendations: Mapped[Optional[list]] = mapped_column(JSONB)
    hairstyles_to_avoid: Mapped[Optional[list]] = mapped_column(JSONB)
    beard_recommendations: Mapped[Optional[list]] = mapped_column(JSONB)
    outfit_directions: Mapped[Optional[list]] = mapped_column(JSONB)
    clothing_details: Mapped[Optional[dict]] = mapped_column(JSONB)
    narrative_summary: Mapped[Optional[str]] = mapped_column(Text)
    engine_version: Mapped[str] = mapped_column(String(20), default="1.0.0")
    share_token: Mapped[Optional[str]] = mapped_column(String(64), unique=True, index=True)
    result_card_url: Mapped[Optional[str]] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    user: Mapped["User"] = relationship(back_populates="style_results")
    appearance_profile: Mapped["AppearanceProfile"] = relationship(back_populates="style_results")