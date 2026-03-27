"""
API Schemas — Pydantic models for request validation and response serialization.

All API responses should use these schemas, not raw ORM models.
This separation keeps the API contract stable even if DB models change.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ─── Auth Schemas ─────────────────────────────────────────────────────────────

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    full_name: Optional[str] = Field(None, max_length=255)
    gender: Optional[str] = None  # "male" | "female" | "non_binary" | "prefer_not_to_say"

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v):
        valid = {"male", "female", "non_binary", "prefer_not_to_say", None}
        if v not in valid:
            raise ValueError(f"Gender must be one of: {valid}")
        return v


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ─── User Schemas ─────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str]
    gender: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, max_length=255)
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None  # ISO date string: YYYY-MM-DD


# ─── Analysis Schemas ─────────────────────────────────────────────────────────

class AnalysisInitiateResponse(BaseModel):
    """Returned immediately after image upload — before analysis completes."""
    profile_id: uuid.UUID
    status: str  # "pending" | "processing"
    message: str


class AppearanceProfileResponse(BaseModel):
    """Full appearance profile — returned after analysis completes."""
    id: uuid.UUID
    user_id: uuid.UUID
    is_active: bool

    # Image
    selfie_url: str

    # Analysis state
    analysis_status: str
    analysis_error: Optional[str]
    analyzed_at: Optional[datetime]

    # Face
    face_shape: Optional[str]
    face_shape_confidence: Optional[float]

    # Skin
    skin_tone: Optional[str]
    skin_undertone: Optional[str]
    contrast_level: Optional[float]
    hair_color_hex: Optional[str]

    # Hair
    hair_texture: Optional[str]
    hair_density: Optional[str]

    # Beard
    beard_coverage: Optional[str]

    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Recommendation Schemas ───────────────────────────────────────────────────

class ColorRecommendationSchema(BaseModel):
    hex: str
    name: str
    reason: str


class StyleRecommendationSchema(BaseModel):
    name: str
    reason: str
    category: str
    image_ref: Optional[str] = None


class StyleResultResponse(BaseModel):
    """Complete style result — the main product output."""
    id: uuid.UUID
    user_id: uuid.UUID
    appearance_profile_id: uuid.UUID

    # Color
    color_season: Optional[str]
    recommended_colors: Optional[List[ColorRecommendationSchema]]
    colors_to_avoid: Optional[List[ColorRecommendationSchema]]

    # Hairstyles
    hairstyle_recommendations: Optional[List[StyleRecommendationSchema]]
    hairstyles_to_avoid: Optional[List[StyleRecommendationSchema]]

    # Beard (men)
    beard_recommendations: Optional[List[StyleRecommendationSchema]]

    # Outfits
    outfit_directions: Optional[List[StyleRecommendationSchema]]
    clothing_details: Optional[Dict[str, Any]]

    # Narrative
    narrative_summary: Optional[str]

    # Sharing
    share_token: Optional[str]
    result_card_url: Optional[str]

    engine_version: str
    created_at: datetime

    model_config = {"from_attributes": True}


class StyleResultSummaryResponse(BaseModel):
    """Lighter version for list views."""
    id: uuid.UUID
    color_season: Optional[str]
    face_shape: Optional[str]  # Pulled from linked profile
    created_at: datetime


# ─── Full Analysis Response ───────────────────────────────────────────────────

class FullAnalysisResponse(BaseModel):
    """Combined profile + result — single response after analysis completes."""
    profile: AppearanceProfileResponse
    result: Optional[StyleResultResponse]
    message: str


# ─── Beard Update Schema ──────────────────────────────────────────────────────

class BeardUpdateRequest(BaseModel):
    """
    User self-reports beard growth pattern.
    CV beard detection is less reliable than face/skin — user input is preferred.
    """
    beard_coverage: str  # "full" | "patchy" | "chin_only" | "none"
    beard_density: Optional[str] = None  # "light" | "medium" | "thick"

    @field_validator("beard_coverage")
    @classmethod
    def validate_coverage(cls, v):
        valid = {"full", "patchy", "chin_only", "none"}
        if v not in valid:
            raise ValueError(f"beard_coverage must be one of: {valid}")
        return v


# ─── Error Schemas ────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None
