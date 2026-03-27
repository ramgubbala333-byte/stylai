"""
Analysis Orchestration Service

Coordinates the full analysis pipeline for a submitted selfie:
1. Save the image to storage
2. Run all CV analyzers in parallel where possible
3. Update the AppearanceProfile with extracted features
4. Run the appropriate style engine (men/women)
5. Persist the StyleResult
6. Optionally request LLM narrative layer

This is the single point of entry for the analysis pipeline.
All raw CV output is stored for auditability before recommendations are generated.
"""

import asyncio
import logging
import uuid
from datetime import datetime
from io import BytesIO
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import (
    AnalysisStatus,
    AppearanceProfile,
    FaceShape,
    Gender,
    HairDensity,
    HairTexture,
    SkinTone,
    SkinUndertone,
    StyleResult,
    User,
)
from app.services.cv.face_analyzer import FaceAnalyzer
from app.services.cv.skin_analyzer import SkinAnalyzer
from app.services.recommendations.style_engine import (
    MenStyleEngine,
    RecommendationOutput,
    WomenStyleEngine,
)
from app.utils.storage import StorageBackend

logger = logging.getLogger(__name__)


class AnalysisService:
    """
    Orchestrates the end-to-end appearance analysis and recommendation pipeline.
    """

    def __init__(self, storage: StorageBackend):
        self.storage = storage
        self.face_analyzer = FaceAnalyzer()
        self.skin_analyzer = SkinAnalyzer()
        self.men_engine = MenStyleEngine()
        self.women_engine = WomenStyleEngine()

    async def run_full_analysis(
        self,
        db: AsyncSession,
        user: User,
        image_bytes: bytes,
        content_type: str,
    ) -> AppearanceProfile:
        """
        Full pipeline: upload → CV analysis → recommendations → persist.

        Returns the completed AppearanceProfile (with linked StyleResult).
        Raises exceptions on critical failures; partial failures are logged and stored.
        """

        # ── Step 1: Upload image to storage ─────────────────────────────────
        storage_key = f"selfies/{user.id}/{uuid.uuid4()}"
        extension = "jpg" if "jpeg" in content_type else content_type.split("/")[-1]
        full_key = f"{storage_key}.{extension}"

        selfie_url = await self.storage.upload(
            key=full_key,
            data=image_bytes,
            content_type=content_type,
        )

        # ── Step 2: Create pending AppearanceProfile ─────────────────────────
        profile = AppearanceProfile(
            user_id=user.id,
            selfie_url=selfie_url,
            selfie_key=full_key,
            analysis_status=AnalysisStatus.PROCESSING,
        )

        # Deactivate old active profiles
        # (In production, do this with a proper query)
        for old_profile in user.appearance_profiles:
            old_profile.is_active = False

        profile.is_active = True
        db.add(profile)
        await db.flush()  # Get the ID before proceeding

        try:
            # ── Step 3: Run CV analysis ──────────────────────────────────────
            # Run face and skin analysis concurrently (both read-only on image)
            face_result, skin_result = await asyncio.gather(
                asyncio.to_thread(self.face_analyzer.analyze, image_bytes),
                asyncio.to_thread(self.skin_analyzer.analyze, image_bytes),
                return_exceptions=True,
            )

            # Handle face analysis
            if isinstance(face_result, Exception):
                logger.error(f"Face analysis error: {face_result}")
                face_result = None

            if isinstance(skin_result, Exception):
                logger.error(f"Skin analysis error: {skin_result}")
                skin_result = None

            # ── Step 4: Populate profile with CV results ─────────────────────
            if face_result:
                profile.face_shape = FaceShape(face_result.face_shape)
                profile.face_shape_confidence = face_result.confidence
                profile.face_landmark_ratios = face_result.landmark_ratios

            if skin_result:
                profile.skin_tone = SkinTone(skin_result.skin_tone)
                profile.skin_undertone = SkinUndertone(skin_result.skin_undertone)
                profile.skin_lab_values = skin_result.lab_values
                profile.contrast_level = skin_result.contrast_level
                profile.hair_color_hex = skin_result.hex_color

            profile.analysis_status = AnalysisStatus.COMPLETED
            profile.analyzed_at = datetime.utcnow()

            # ── Step 5: Generate recommendations ─────────────────────────────
            face_shape = face_result.face_shape if face_result else "unknown"
            undertone = skin_result.skin_undertone if skin_result else "neutral"
            contrast = skin_result.contrast_level if skin_result else 5.0
            gender = user.gender.value if user.gender else "prefer_not_to_say"

            recs = self._run_recommendation_engine(
                gender=gender,
                face_shape=face_shape,
                undertone=undertone,
                contrast=contrast,
                beard_coverage=profile.beard_coverage,
            )

            # ── Step 6: Persist StyleResult ───────────────────────────────────
            style_result = StyleResult(
                user_id=user.id,
                appearance_profile_id=profile.id,
                color_season=recs.color_season,
                recommended_colors=[
                    {"hex": c.hex, "name": c.name, "reason": c.reason}
                    for c in recs.recommended_colors
                ],
                colors_to_avoid=[
                    {"hex": c.hex, "name": c.name, "reason": c.reason}
                    for c in recs.colors_to_avoid
                ],
                hairstyle_recommendations=[
                    {"name": r.name, "reason": r.reason, "category": r.category}
                    for r in recs.hairstyle_recommendations
                ],
                hairstyles_to_avoid=[
                    {"name": r.name, "reason": r.reason, "category": r.category}
                    for r in recs.hairstyles_to_avoid
                ],
                beard_recommendations=[
                    {"name": r.name, "reason": r.reason, "category": r.category}
                    for r in recs.beard_recommendations
                ],
                outfit_directions=[
                    {"name": r.name, "reason": r.reason, "category": r.category}
                    for r in recs.outfit_directions
                ],
                clothing_details=recs.clothing_details,
                engine_version=recs.engine_version,
                share_token=str(uuid.uuid4()).replace("-", ""),
            )
            db.add(style_result)

        except Exception as e:
            logger.exception(f"Analysis pipeline failed for user {user.id}: {e}")
            profile.analysis_status = AnalysisStatus.FAILED
            profile.analysis_error = str(e)

        await db.flush()
        return profile

    def _run_recommendation_engine(
        self,
        gender: str,
        face_shape: str,
        undertone: str,
        contrast: float,
        beard_coverage: Optional[str] = None,
    ) -> RecommendationOutput:
        """Route to the correct gender-specific engine."""
        if gender == "male":
            return self.men_engine.generate(
                face_shape=face_shape,
                skin_undertone=undertone,
                contrast_level=contrast,
                beard_coverage=beard_coverage,
            )
        else:
            return self.women_engine.generate(
                face_shape=face_shape,
                skin_undertone=undertone,
                contrast_level=contrast,
            )
