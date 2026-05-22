import time, uuid
from collections import defaultdict
from threading import Lock
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.api.v1.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.models import AnalysisStatus, AppearanceProfile, StyleResult, User
from app.schemas.schemas import AppearanceProfileResponse, BeardUpdateRequest, FullAnalysisResponse, StyleResultResponse
from app.services.analysis_service import AnalysisService
from app.utils.storage import get_storage_backend

router = APIRouter(prefix="/analysis", tags=["Analysis"])

_rate_store = defaultdict(list)
_rate_lock = Lock()
UPLOAD_LIMIT, UPLOAD_WINDOW = 5, 3600

def check_rate_limit(user_id: str):
    now = time.time()
    with _rate_lock:
        _rate_store[user_id] = [t for t in _rate_store[user_id] if now - t < UPLOAD_WINDOW]
        if len(_rate_store[user_id]) >= UPLOAD_LIMIT:
            raise HTTPException(status_code=429, detail=f"Max {UPLOAD_LIMIT} uploads per hour.")
        _rate_store[user_id].append(now)

def get_analysis_service() -> AnalysisService:
    return AnalysisService(storage=get_storage_backend())

@router.post("/upload", response_model=FullAnalysisResponse, status_code=201)
async def upload_selfie(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db), svc: AnalysisService = Depends(get_analysis_service)):
    check_rate_limit(str(current_user.id))
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=422, detail=f"File type not allowed. Accepted: {settings.ALLOWED_IMAGE_TYPES}")
    image_bytes = await file.read()
    if len(image_bytes) > settings.MAX_IMAGE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File too large. Max {settings.MAX_IMAGE_SIZE_MB}MB.")
    if len(image_bytes) < 1024:
        raise HTTPException(status_code=422, detail="File appears empty or corrupted.")
    result = await db.execute(select(User).where(User.id == current_user.id).options(selectinload(User.appearance_profiles)))
    user = result.scalar_one()
    profile = await svc.run_full_analysis(db=db, user=user, image_bytes=image_bytes, content_type=file.content_type or "image/jpeg")
    rq = await db.execute(select(StyleResult).where(StyleResult.appearance_profile_id == profile.id))
    style_result = rq.scalar_one_or_none()
    return FullAnalysisResponse(
        profile=AppearanceProfileResponse.model_validate(profile),
        result=StyleResultResponse.model_validate(style_result) if style_result else None,
        message="Analysis complete" if profile.analysis_status == AnalysisStatus.COMPLETED else "Analysis failed — please try again with a clearer photo")

@router.get("/profile/latest", response_model=AppearanceProfileResponse)
async def get_latest_profile(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(AppearanceProfile).where(AppearanceProfile.user_id == current_user.id, AppearanceProfile.is_active == True).order_by(AppearanceProfile.created_at.desc()).limit(1))
    profile = r.scalar_one_or_none()
    if not profile: raise HTTPException(status_code=404, detail="No analysis found. Upload a selfie to get started.")
    return profile

@router.get("/results/latest", response_model=StyleResultResponse)
async def get_latest_result(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(StyleResult).where(StyleResult.user_id == current_user.id).order_by(StyleResult.created_at.desc()).limit(1))
    sr = r.scalar_one_or_none()
    if not sr: raise HTTPException(status_code=404, detail="No results found. Complete an analysis first.")
    return sr

@router.get("/results/{result_id}", response_model=StyleResultResponse)
async def get_result_by_id(result_id: uuid.UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(StyleResult).where(StyleResult.id == result_id, StyleResult.user_id == current_user.id))
    sr = r.scalar_one_or_none()
    if not sr: raise HTTPException(status_code=404, detail="Result not found")
    return sr

@router.get("/share/{share_token}", response_model=StyleResultResponse)
async def get_shared_result(share_token: str, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(StyleResult).where(StyleResult.share_token == share_token))
    sr = r.scalar_one_or_none()
    if not sr: raise HTTPException(status_code=404, detail="Shared result not found")
    return sr

@router.patch("/profile/{profile_id}/beard", response_model=AppearanceProfileResponse)
async def update_beard(profile_id: uuid.UUID, payload: BeardUpdateRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(AppearanceProfile).where(AppearanceProfile.id == profile_id, AppearanceProfile.user_id == current_user.id))
    profile = r.scalar_one_or_none()
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    profile.beard_coverage = payload.beard_coverage
    if payload.beard_density: profile.beard_density = payload.beard_density
    await db.flush()
    return profile

@router.get("/history", response_model=list[StyleResultResponse])
async def get_history(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db), limit: int = 10):
    r = await db.execute(select(StyleResult).where(StyleResult.user_id == current_user.id).order_by(StyleResult.created_at.desc()).limit(min(limit, 50)))
    return r.scalars().all()