# ParkSight AI

Predictive Parking Intelligence System for identifying illegal parking hotspots, estimating congestion impact, and recommending targeted enforcement deployments.

## What is Included

- FastAPI backend with analytics, hotspot, prediction, patrol, and health APIs
- Dynamic `.pkl` model loading through a reusable `MLService`
- Mock data and fallback predictions when trained models are unavailable
- SQLAlchemy models for violations, hotspot predictions, and patrol assignments
- PostgreSQL/PostGIS schema
- React + Vite + TypeScript frontend with dark command-center dashboard
- Docker and Docker Compose setup

## Project Structure

```text
backend/
  app/
    api/routes/
    core/
    models/
    schemas/
    services/
    utils/
    ml_models/
  tests/
  requirements.txt
  Dockerfile
frontend/
  src/
    components/
    hooks/
    pages/
    services/
    types/
database/
  schema.sql
  sample_data.sql
docker-compose.yml
.env.example
```

## Quick Start

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Start the full stack:

```bash
docker compose up --build
```

3. Open:

- Backend API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs
- Frontend: http://localhost:5173

## Local Backend Development

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Local Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## ML Model Integration

Place trained models in:

```text
backend/app/ml_models/
```

Expected filenames:

- `hotspot_model.pkl`
- `volume_model.pkl`
- `congestion_model.pkl`

The backend loads available models on startup and falls back to deterministic mock predictions when models are missing.

## API Endpoints

- `GET /api/health`
- `GET /api/analytics`
- `GET /api/hotspots`
- `POST /api/predict`
- `GET /api/patrol/recommendations`

