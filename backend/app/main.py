from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import analytics, health, hotspots, patrol, predictions
from app.core.config import settings
from app.core.logging import configure_logging, logger
from app.services.ml_service import ml_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    logger.info("Starting %s", settings.app_name)
    ml_service.load_models()
    yield
    logger.info("Shutting down %s", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Predictive parking enforcement intelligence APIs.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=settings.api_v1_prefix, tags=["health"])
app.include_router(analytics.router, prefix=settings.api_v1_prefix, tags=["analytics"])
app.include_router(hotspots.router, prefix=settings.api_v1_prefix, tags=["hotspots"])
app.include_router(predictions.router, prefix=settings.api_v1_prefix, tags=["predictions"])
app.include_router(patrol.router, prefix=settings.api_v1_prefix, tags=["patrol"])
