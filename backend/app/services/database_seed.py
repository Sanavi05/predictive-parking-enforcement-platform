from __future__ import annotations

from pathlib import Path

import pandas as pd
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.logging import logger
from app.models.violation import Violation


def _project_root() -> Path:
    for parent in Path(__file__).resolve().parents:
        if (parent / "datasets").exists():
            return parent
    return Path(__file__).resolve().parents[3]


DATASET_PATH = _project_root() / "datasets" / "parksight_processed.csv"


def seed_violations_from_dataset(db: Session, minimum_rows: int = 1000) -> None:
    try:
        current_count = db.query(Violation.id).count()
        if current_count >= minimum_rows:
            logger.info("Violations table already has %d rows; skipping dataset seed", current_count)
            return

        if current_count:
            logger.info("Replacing %d starter violation rows with processed dataset rows", current_count)
            db.query(Violation).delete()
            db.commit()

        inserted = 0
        for chunk in pd.read_csv(DATASET_PATH, chunksize=5000):
            rows = []
            for record in chunk.to_dict("records"):
                rows.append(
                    Violation(
                        timestamp=pd.to_datetime(record["created_datetime"], errors="coerce"),
                        latitude=float(record["latitude"]),
                        longitude=float(record["longitude"]),
                        h3_cell=str(record["h3_cell"]),
                        junction_name=str(record.get("junction_name") or "Unknown"),
                        police_station=str(record.get("police_station") or "Unknown"),
                        vehicle_type=str(record.get("vehicle_type") or record.get("vehicle_category") or "Unknown"),
                        violation_type=str(record.get("primary_violation") or "Unknown"),
                    )
                )
            db.bulk_save_objects(rows)
            db.commit()
            inserted += len(rows)

        logger.info("Seeded %d violation rows from %s", inserted, DATASET_PATH)
    except (SQLAlchemyError, OSError, ValueError) as exc:
        db.rollback()
        logger.warning("Could not seed violations table from dataset: %s", exc)
