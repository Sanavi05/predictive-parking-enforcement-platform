# ParkSight AI

Predictive Parking Enforcement Platform for identifying illegal parking hotspots, estimating parking-induced congestion impact, and recommending targeted enforcement deployments.

## Problem Statement

On-street illegal parking and spillover parking near commercial areas, metro stations, and event zones can choke carriageways and intersections. ParkSight AI uses historical parking violation data, geospatial cells, and trained ML models to help enforcement teams move from reactive patrols to targeted, evidence-based deployment.

The project addresses:

- Illegal parking hotspot detection
- Predicted violation volume by location and time
- Congestion impact scoring
- Risk-based patrol prioritization
- Officer and tow truck recommendations

## Current Status

The core demo flow is implemented:

- FastAPI backend with health, analytics, hotspot, prediction, patrol, and dashboard summary APIs
- React, Vite, and TypeScript frontend dashboard
- Three trained model artifact groups under `models/`
- Startup model loading for all prediction models
- Dataset-backed feature engineering from `datasets/parksight_processed.csv` and model training datasets
- PostgreSQL/PostGIS schema
- Docker and Docker Compose setup

Important data note:

- The prediction endpoint uses the trained `.pkl` model artifacts and does not use fake prediction logic.
- On Docker startup, the backend seeds the `violations` table from `datasets/parksight_processed.csv` when the table has fewer than 1000 rows.
- `database/sample_data.sql` still exists as a tiny database initializer, but those starter rows are replaced by the processed dataset during backend startup.
- Analytics, hotspots, and patrol recommendations are derived from the database when available, and from the processed dataset if the database is unavailable.

## Project Structure

```text
backend/
  .env.example
  Dockerfile
  requirements.txt
  app/
    api/
      routes/
    core/
    models/
    schemas/
    services/
    utils/
  tests/

frontend/
  Dockerfile
  package.json
  src/
    components/
    hooks/
    pages/
    services/
    types/

database/
  schema.sql
  sample_data.sql

datasets/
  parksight_processed.csv
  model1_hotspot_classifier.csv
  model2_volume_predictor.csv
  model3_congestion_scorer.csv

models/
  volume/
    volume_model.pkl
    volume_features.pkl
    volume_metrics.json
    volume_metadata.json
  hotspot/
    hotspot_model.pkl
    hotspot_features.pkl
    hotspot_metrics.json
    hotspot_metadata.json
  congestion/
    congestion_model.pkl
    congestion_features.pkl
    congestion_metrics.json
    congestion_metadata.json

docker-compose.yml
requirements.txt
README.md
```

## Backend Model Loading

FastAPI loads the trained model artifacts once during startup in `backend/app/main.py`.

The startup loader validates:

- `models/volume/volume_model.pkl`
- `models/volume/volume_features.pkl`
- `models/volume/volume_metrics.json`
- `models/volume/volume_metadata.json`
- `models/hotspot/hotspot_model.pkl`
- `models/hotspot/hotspot_features.pkl`
- `models/hotspot/hotspot_metrics.json`
- `models/hotspot/hotspot_metadata.json`
- `models/congestion/congestion_model.pkl`
- `models/congestion/congestion_features.pkl`
- `models/congestion/congestion_metrics.json`
- `models/congestion/congestion_metadata.json`

If any required artifact is missing, the backend fails fast instead of serving fake predictions.

## API Endpoints

Base URL:

```text
http://localhost:8000/api
```

Endpoints:

- `GET /health`
- `GET /analytics`
- `GET /hotspots`
- `GET /dashboard-summary`
- `POST /predict`
- `GET /patrol/recommendations`

Prediction request:

```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "timestamp": "2026-06-18T14:00:00"
}
```

Prediction response:

```json
{
  "predicted_violations": 32.0,
  "risk_score": 84.0,
  "risk_level": "Critical",
  "congestion_score": 71.0,
  "congestion_level": "High",
  "recommended_officers": 4,
  "recommended_tow_trucks": 1
}
```

## Run With Docker

From the repository root:

```bash
docker compose up --build
```

Open:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

Stop the stack:

```bash
docker compose down
```

Reset the database volume and reseed from the processed dataset:

```bash
docker compose down -v
docker compose up --build
```

For public deployment on a VPS, use the production Docker Compose file:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

See `DEPLOYMENT.md` for the full deployment guide.

## Local Backend Development

Use Python 3.11.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The backend expects the repository root to contain `models/` and `datasets/`. Run local backend commands from `backend/`; the code discovers the repository root automatically.

For a local PostgreSQL database, set `DATABASE_URL` in `backend/.env`.

Default value:

```text
postgresql+psycopg2://parksight:parksight@localhost:5432/parksight
```

Run backend tests:

```bash
cd backend
source .venv/bin/activate
pytest
```

## Local Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

If the backend runs somewhere other than `http://localhost:8000/api`, create a frontend environment file:

```bash
cd frontend
printf "VITE_API_BASE_URL=http://localhost:8000/api\n" > .env
```

Build the frontend:

```bash
cd frontend
npm run build
```

Preview the production build:

```bash
cd frontend
npm run preview
```

## Data Flow

```text
User selects a location and timestamp
Backend converts latitude and longitude to H3 cell
FeatureBuilder creates engineered features from historical datasets
Volume model predicts expected violations
Hotspot model predicts risk score
Congestion model predicts congestion score
PredictionEngine classifies severity and recommends resources
Frontend updates dashboard cards and map details
```

## Notes For Reviewers

- This is a demo-oriented implementation, but the main prediction path uses trained model artifacts.
- Database analytics are real when the processed dataset has seeded successfully.
- The app still includes a small SQL starter seed because Docker initializes Postgres before the backend runs. Backend startup replaces it with processed dataset rows.
- The map view is a lightweight visual layer, not a full GIS map implementation.
