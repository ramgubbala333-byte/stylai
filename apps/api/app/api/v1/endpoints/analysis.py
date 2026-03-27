"""
Analysis endpoints — selfie upload, status polling, results retrieval.
"""

import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.deps import get_current_user, get_current_user_optional
from app.core.config import settings
from app.core.database import get_db
from app.models.models import AnalysisStatus, AppearanceProfile, StyleResult, User
from app.schemas.schemas import (
    AnalysisInitiateResponse,
    AppearanceProfileResponse,
    BeardUpdateRequest,
    FullAnalysisResponse,
    StyleResultResponse,
)
from app.services.analysis_service import AnalysisService
from app.utils.storage import get_storage_backend

router = APIRouter(prefix="/analysis", tags=["Analysis"])


def get_analysis_service() -> AnalysisService:
    return AnalysisService(storage=get_storage_backend())


@router.post("/upload", response_model=FullAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def upload_selfie(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    analysis_service: AnalysisService = Depends(get_analysis_service),
):
    """
    Upload a selfie and trigger full appearance analysis.
    Returns the complete analysis result synchronously (MVP approach).
    
    Production note: For scale, move analysis to a background task/queue
    and return 202 Accepted with a job ID to poll.
    """
    # Validate file type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"File type not allowed. Accepted: {settings.ALLOWED_IMAGE_TYPES}",
        )

    # Validate file size
    image_bytes = await file.read()
    max_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
    if len(image_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {settings.MAX_IMAGE_SIZE_MB}MB",
        )

    # Eagerly load relationships needed for analysis
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(User)
        .where(User.id == current_user.id)
        .options(selectinload(User.appearance_profiles))
    )
    user = result.scalar_one()

    # Run full pipeline
    profile = await analysis_service.run_full_analysis(
        db=db,
        user=user,
        image_bytes=image_bytes,
        content_type=file.content_type,
    )

    # Fetch linked style result
    result_q = await db.execute(
        select(StyleResult).where(StyleResult.appearance_profile_id == profile.id)
    )
    style_result = result_q.scalar_one_or_none()

    return FullAnalysisResponse(
        profile=AppearanceProfileResponse.model_validate(profile),
        result=StyleResultResponse.model_validate(style_result) if style_result else None,
        message="Analysis complete" if profile.analysis_status == AnalysisStatus.COMPLETED
                else "Analysis failed — please try again with a clearer photo",
    )


@router.get("/profile/latest", response_model=AppearanceProfileResponse)
async def get_latest_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the user's most recent appearance profile."""
    result = await db.execute(
        select(AppearanceProfile)
        .where(
            AppearanceProfile.user_id == current_user.id,
            AppearanceProfile.is_active == True,
        )
        .order_by(AppearanceProfile.created_at.desc())
        .limit(1)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="No analysis found. Upload a selfie to get started.")

    return profile


@router.get("/results/latest", response_model=StyleResultResponse)
async def get_latest_result(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the user's most recent style recommendations."""
    result = await db.execute(
        select(StyleResult)
        .join(AppearanceProfile)
        .where(
            StyleResult.user_id == current_user.id,
            AppearanceProfile.is_active == True,
        )
        .order_by(StyleResult.created_at.desc())
        .limit(1)
    )
    style_result = result.scalar_one_or_none()

    if not style_result:
        raise HTTPException(status_code=404, detail="No results found. Complete an analysis first.")

    return style_result


@router.get("/results/{result_id}", response_model=StyleResultResponse)
async def get_result_by_id(
    result_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StyleResult).where(
            StyleResult.id == result_id,
            StyleResult.user_id == current_user.id,
        )
    )
    style_result = result.scalar_one_or_none()

    if not style_result:
        raise HTTPException(status_code=404, detail="Result not found")

    return style_result


@router.get("/share/{share_token}", response_model=StyleResultResponse)
async def get_shared_result(
    share_token: str,
    db: AsyncSession = Depends(get_db),
):
    """Public endpoint — view a shared style result without authentication."""
    result = await db.execute(
        select(StyleResult).where(StyleResult.share_token == share_token)
    )
    style_result = result.scalar_one_or_none()

    if not style_result:
        raise HTTPException(status_code=404, detail="Shared result not found or expired")

    return style_result


@router.patch("/profile/{profile_id}/beard", response_model=AppearanceProfileResponse)
async def update_beard_info(
    profile_id: uuid.UUID,
    payload: BeardUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Allow users to self-report beard growth pattern.
    CV beard detection is unreliable — user input produces better recommendations.
    """
    result = await db.execute(
        select(AppearanceProfile).where(
            AppearanceProfile.id == profile_id,
            AppearanceProfile.user_id == current_user.id,
        )
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile.beard_coverage = payload.beard_coverage
    profile.beard_density = payload.beard_density
    await db.flush()

    return profile


@router.get("/history", response_model=list[StyleResultResponse])
async def get_analysis_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 10,
):
    """Get the user's full analysis history, newest first."""
    result = await db.execute(
        select(StyleResult)
        .where(StyleResult.user_id == current_user.id)
        .order_by(StyleResult.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()
