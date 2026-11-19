import sqlite3
import json
from contextlib import contextmanager
from typing import Generator
from ..config import settings
from .logging import logger


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(settings.DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Database transaction rollback due to error: {e}")
        raise e
    finally:
        conn.close()


def init_db():
    """Initializes tables and seeds default demo data if empty."""
    with get_db() as conn:
        cursor = conn.cursor()

        # Employees table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_code TEXT UNIQUE NOT NULL,
                full_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                department TEXT NOT NULL,
                role TEXT NOT NULL,
                avatar_path TEXT,
                embedding TEXT,  -- JSON string representation of 512-d float list
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Attendance records table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS attendance_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                check_in_time TEXT,
                check_out_time TEXT,
                status TEXT NOT NULL, -- ON_TIME, LATE, HALF_DAY, PRESENT
                confidence_score REAL,
                method TEXT DEFAULT 'FACIAL_RECOGNITION',
                snapshot_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
                UNIQUE (employee_id, date)
            )
        """)

        # System settings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        """)

        # Create indexes for high-speed queries
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_emp_code ON employees (employee_code)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_att_date ON attendance_records (date)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_att_emp_date ON attendance_records (employee_id, date)")

        logger.info("Database initialized successfully.")
