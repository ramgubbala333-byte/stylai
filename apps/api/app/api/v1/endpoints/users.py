"""
User profile endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_current_user
from app.core.database import get_db
from app.models.models import Gender, User
from app.schemas.schemas import UserResponse, UserUpdateRequest

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_me(
    payload: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name

    if payload.gender is not None:
        try:
            current_user.gender = Gender(payload.gender)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid gender value")

    if payload.date_of_birth is not None:
        current_user.date_of_birth = payload.date_of_birth

    await db.flush()
    return current_user
