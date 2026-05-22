import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: Optional[str] = None
    gender: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str]
    gender: Optional[str]
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}

class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None

class AppearanceProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    is_active: bool
    selfie_url: str
    analysis_status: str
    analysis_error: Optional[str]
    analyzed_at: Optional[datetime]
    face_shape: Optional[str]
    face_shape_confidence: Optional[float]
    skin_tone: Optional[str]
    skin_undertone: Optional[str]
    contrast_level: Optional[float]
    hair_color_hex: Optional[str]
    hair_texture: Optional[str]
    hair_density: Optional[str]
    beard_coverage: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}

class ColorRecommendationSchema(BaseModel):
    hex: str; name: str; reason: str

class StyleRecommendationSchema(BaseModel):
    name: str; reason: str; category: str; image_ref: Optional[str] = None

class StyleResultResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    appearance_profile_id: uuid.UUID
    color_season: Optional[str]
    recommended_colors: Optional[List[ColorRecommendationSchema]]
    colors_to_avoid: Optional[List[ColorRecommendationSchema]]
    hairstyle_recommendations: Optional[List[StyleRecommendationSchema]]
    hairstyles_to_avoid: Optional[List[StyleRecommendationSchema]]
    beard_recommendations: Optional[List[StyleRecommendationSchema]]
    outfit_directions: Optional[List[StyleRecommendationSchema]]
    clothing_details: Optional[Dict[str, Any]]
    narrative_summary: Optional[str]
    share_token: Optional[str]
    result_card_url: Optional[str]
    engine_version: str
    created_at: datetime
    model_config = {"from_attributes": True}

class FullAnalysisResponse(BaseModel):
    profile: AppearanceProfileResponse
    result: Optional[StyleResultResponse]
    message: str

class BeardUpdateRequest(BaseModel):
    beard_coverage: str
    beard_density: Optional[str] = None

class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None