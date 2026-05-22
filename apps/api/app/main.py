from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import engine
from app.core.logging import setup_logging

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    Path(settings.LOCAL_STORAGE_PATH).mkdir(parents=True, exist_ok=True)
    yield
    await engine.dispose()

def create_application() -> FastAPI:
    app = FastAPI(title="StylAI API", version="0.1.0",
        docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
        redoc_url=None, lifespan=lifespan)
    app.add_middleware(CORSMiddleware, allow_origins=settings.ALLOWED_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.include_router(api_router, prefix="/api/v1")
    if settings.STORAGE_BACKEND == "local":
        storage_path = Path(settings.LOCAL_STORAGE_PATH)
        storage_path.mkdir(parents=True, exist_ok=True)
        app.mount("/static", StaticFiles(directory=str(storage_path)), name="static")

    @app.get("/health", tags=["System"])
    async def health():
        return {"status": "ok", "version": "0.1.0", "environment": settings.ENVIRONMENT}

    @app.exception_handler(Exception)
    async def global_error(request: Request, exc: Exception):
        import logging
        logging.getLogger(__name__).exception(f"Error: {exc}")
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    return app

app = create_application()