CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS violations (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    h3_cell VARCHAR(32) NOT NULL,
    junction_name VARCHAR(160) NOT NULL,
    police_station VARCHAR(160) NOT NULL,
    vehicle_type VARCHAR(80) NOT NULL,
    violation_type VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_violations_timestamp ON violations (timestamp);
CREATE INDEX IF NOT EXISTS idx_violations_h3_cell ON violations (h3_cell);
CREATE INDEX IF NOT EXISTS idx_violations_location ON violations USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

CREATE TABLE IF NOT EXISTS hotspot_predictions (
    id SERIAL PRIMARY KEY,
    h3_cell VARCHAR(32) NOT NULL,
    prediction_time TIMESTAMPTZ NOT NULL,
    risk_score DOUBLE PRECISION NOT NULL,
    predicted_count INTEGER NOT NULL,
    impact_score DOUBLE PRECISION NOT NULL,
    risk_level VARCHAR(40) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotspot_predictions_time ON hotspot_predictions (prediction_time);
CREATE INDEX IF NOT EXISTS idx_hotspot_predictions_h3_cell ON hotspot_predictions (h3_cell);

CREATE TABLE IF NOT EXISTS patrol_assignments (
    id SERIAL PRIMARY KEY,
    officer_id VARCHAR(80) NOT NULL,
    assigned_h3_cell VARCHAR(32) NOT NULL,
    priority_score DOUBLE PRECISION NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'recommended',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
