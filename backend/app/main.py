from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import analytics, health, hotspots, patrol, predictions
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.logging import configure_logging, logger
from app.services.database_seed import seed_violations_from_dataset
from app.services.prediction_engine import prediction_engine


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Predictive parking enforcement intelligence APIs.",
    docs_url=f"{settings.api_v1_prefix}/docs",
    redoc_url=f"{settings.api_v1_prefix}/redoc",
    openapi_url=f"{settings.api_v1_prefix}/openapi.json",
)


@app.on_event("startup")
def load_prediction_models() -> None:
    configure_logging()
    logger.info("Starting %s", settings.app_name)
    prediction_engine.load_models()
    with SessionLocal() as db:
        seed_violations_from_dataset(db)


@app.on_event("shutdown")
def shutdown() -> None:
    logger.info("Shutting down %s", settings.app_name)

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
