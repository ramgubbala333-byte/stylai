"""
StylAI — FastAPI Application Entry Point

Initializes the FastAPI app, registers middleware, mounts routers,
and configures startup/shutdown lifecycle events.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import engine
from app.core.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle handler — runs setup on startup, teardown on shutdown."""
    setup_logging()

    # Future: warm up CV models here so first request isn't slow
    # from app.services.cv.face_analyzer import FaceAnalyzer
    # await FaceAnalyzer.preload_models()

    yield

    # Cleanup: close DB connections, flush queues, etc.
    await engine.dispose()


def create_application() -> FastAPI:
    app = FastAPI(
        title="StylAI API",
        description="AI-powered personal styling and grooming recommendations",
        version="0.1.0",
        docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
        redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
        lifespan=lifespan,
    )

    # ─── Middleware ──────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # ─── Routers ─────────────────────────────────────────────────────────────
    app.include_router(api_router, prefix="/api/v1")

    # ─── Health check ─────────────────────────────────────────────────────────
    @app.get("/health", tags=["System"])
    async def health_check():
        return {"status": "ok", "version": "0.1.0", "service": "stylai-api"}

    return app


app = create_application()
