import sqlite3
from typing import Generator
from app.config import settings
from app.core.logging import logger

def init_db():
    conn = sqlite3.connect(settings.DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scan_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scan_id TEXT NOT NULL UNIQUE,
        patient_id TEXT,
        predicted_class TEXT NOT NULL,
        confidence REAL NOT NULL,
        entropy REAL NOT NULL,
        risk_level TEXT NOT NULL,
        probabilities_json TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    conn.close()
    logger.info("Initialized SQLite database: %s", settings.DB_PATH)

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(settings.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
