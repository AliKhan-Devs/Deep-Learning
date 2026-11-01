import sqlite3
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
import threading

from ..config import settings
from .logging import logger

_db_lock = threading.Lock()


_db_initialized = False


def get_db_connection() -> sqlite3.Connection:
    """Provides a thread-safe connection to the SQLite analysis history database."""
    global _db_initialized
    if not _db_initialized:
        init_db()
    conn = sqlite3.connect(str(settings.DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initializes tables for analysis history and video frame forensic details."""
    global _db_initialized
    with _db_lock:
        conn = sqlite3.connect(str(settings.DB_PATH), check_same_thread=False)
        cursor = conn.cursor()

        # Analysis Master Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                media_type TEXT NOT NULL,
                original_filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                model_name TEXT NOT NULL,
                status TEXT NOT NULL,
                progress_pct INTEGER DEFAULT 0,
                prediction TEXT,
                fake_probability REAL,
                real_probability REAL,
                decision_threshold REAL DEFAULT 0.50,
                faces_detected_count INTEGER DEFAULT 0,
                frames_analyzed INTEGER DEFAULT 0,
                frames_with_faces INTEGER DEFAULT 0,
                suspicious_frames_count INTEGER DEFAULT 0,
                execution_duration_sec REAL DEFAULT 0.0,
                error_message TEXT,
                metadata_json TEXT
            )
        """)

        # Video Frame Breakdown Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS video_frames (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                analysis_id TEXT NOT NULL,
                frame_index INTEGER NOT NULL,
                timestamp_sec REAL NOT NULL,
                thumbnail_path TEXT,
                faces_count INTEGER DEFAULT 0,
                fake_probability REAL NOT NULL,
                real_probability REAL NOT NULL,
                is_suspicious INTEGER DEFAULT 0,
                face_boxes_json TEXT,
                FOREIGN KEY (analysis_id) REFERENCES analyses (id) ON DELETE CASCADE
            )
        """)

        # Indexes for rapid retrieval
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_frames_analysis_id ON video_frames(analysis_id)")

        conn.commit()
        conn.close()
        _db_initialized = True
        logger.info(f"Database schema initialized successfully at: {settings.DB_PATH}")
