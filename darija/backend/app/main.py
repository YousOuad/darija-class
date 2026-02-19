"""DarijaLingo API -- FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.api import ai_games, auth, curriculum, games, leaderboard, lessons, progress
from app.core.config import settings
from app.core.database import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    async with engine.begin() as conn:
        import app.models  # noqa: F401

        await conn.run_sync(Base.metadata.create_all)
    yield


application = FastAPI(
    title="DarijaLingo API",
    description="Backend API for the DarijaLingo Moroccan Arabic learning platform",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
application.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
application.include_router(auth.router, prefix="/api")
application.include_router(lessons.router, prefix="/api")
application.include_router(games.router, prefix="/api")
application.include_router(progress.router, prefix="/api")
application.include_router(leaderboard.router, prefix="/api")
application.include_router(ai_games.router, prefix="/api")
application.include_router(curriculum.router, prefix="/api")


@application.get("/api/health", tags=["health"])
async def health_check():
    """Simple health-check endpoint."""
    return {"status": "ok", "service": "darijalingo-api"}


# Lambda handler (used by AWS Lambda via Mangum)
handler = Mangum(application, lifespan="auto")
