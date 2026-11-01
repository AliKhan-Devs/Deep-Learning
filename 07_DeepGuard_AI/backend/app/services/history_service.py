import os
import json
import sqlite3
import threading
from typing import Dict, Any, List, Optional
from datetime import datetime

from ..config import settings
from ..core.database import get_db_connection
from ..core.logging import logger
from ..core.exceptions import AnalysisNotFoundError

_db_lock = threading.Lock()


class HistoryService:
    """
    Data access layer for forensic analysis history, records, and frame timelines.
    """

    def save_analysis(self, data: Dict[str, Any], file_path: str) -> None:
        """Inserts a new analysis record."""
        with _db_lock:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO analyses (
                    id, created_at, media_type, original_filename, file_path, model_name,
                    status, progress_pct, prediction, fake_probability, real_probability,
                    decision_threshold, faces_detected_count, frames_analyzed, frames_with_faces,
                    suspicious_frames_count, execution_duration_sec, error_message, metadata_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data["analysis_id"],
                data["created_at"],
                data["media_type"],
                data["original_filename"],
                file_path,
                data["model_name"],
                data.get("status", "PENDING"),
                data.get("progress_pct", 0),
                data.get("prediction"),
                data.get("fake_probability"),
                data.get("real_probability"),
                data.get("decision_threshold", 0.50),
                data.get("faces_detected_count", 0),
                data.get("frames_analyzed", 0),
                data.get("frames_with_faces", 0),
                data.get("suspicious_frames_count", 0),
                data.get("execution_duration_sec", 0.0),
                data.get("error_message"),
                json.dumps(data.get("faces", []) if data.get("media_type") == "image" else {}),
            ))
            conn.commit()
            conn.close()

    def update_status(self, analysis_id: str, status: str, progress_pct: int) -> None:
        """Updates progress and status of an ongoing video analysis."""
        with _db_lock:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE analyses SET status = ?, progress_pct = ? WHERE id = ?",
                (status, progress_pct, analysis_id)
            )
            conn.commit()
            conn.close()

    def save_video_frames(self, analysis_id: str, frames: List[Dict[str, Any]]) -> None:
        """Persists sampled video frame predictions for forensic review."""
        with _db_lock:
            conn = get_db_connection()
            cursor = conn.cursor()
            for f in frames:
                cursor.execute("""
                    INSERT INTO video_frames (
                        analysis_id, frame_index, timestamp_sec, thumbnail_path,
                        faces_count, fake_probability, real_probability, is_suspicious, face_boxes_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    analysis_id,
                    f["frame_index"],
                    f["timestamp_sec"],
                    f.get("thumbnail_path"),
                    f.get("faces_count", 0),
                    f["fake_probability"],
                    f["real_probability"],
                    1 if f.get("is_suspicious") else 0,
                    f.get("face_boxes_json", "[]"),
                ))
            conn.commit()
            conn.close()

    def complete_analysis(
        self,
        analysis_id: str,
        prediction: str,
        fake_prob: float,
        real_prob: float,
        frames_analyzed: int,
        frames_with_faces: int,
        suspicious_count: int,
        duration_sec: float
    ) -> None:
        """Marks analysis as completed with final metrics."""
        with _db_lock:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE analyses
                SET status = 'COMPLETED', progress_pct = 100, prediction = ?,
                    fake_probability = ?, real_probability = ?, frames_analyzed = ?,
                    frames_with_faces = ?, suspicious_frames_count = ?, execution_duration_sec = ?
                WHERE id = ?
            """, (
                prediction, fake_prob, real_prob, frames_analyzed,
                frames_with_faces, suspicious_count, duration_sec, analysis_id
            ))
            conn.commit()
            conn.close()

    def fail_analysis(self, analysis_id: str, error_message: str) -> None:
        """Marks analysis as failed with error details."""
        with _db_lock:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE analyses SET status = 'FAILED', error_message = ? WHERE id = ?",
                (error_message, analysis_id)
            )
            conn.commit()
            conn.close()

    def get_analysis(self, analysis_id: str) -> Dict[str, Any]:
        """Retrieves a single analysis record by ID."""
        with _db_lock:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM analyses WHERE id = ?", (analysis_id,))
            row = cursor.fetchone()
            conn.close()

        if not row:
            raise AnalysisNotFoundError(analysis_id)

        result = dict(row)
        return result

    def get_analysis_frames(self, analysis_id: str) -> List[Dict[str, Any]]:
        """Retrieves all frame records for a video analysis."""
        with _db_lock:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM video_frames WHERE analysis_id = ? ORDER BY frame_index ASC",
                (analysis_id,)
            )
            rows = cursor.fetchall()
            conn.close()

        frames = []
        for r in rows:
            d = dict(r)
            d["is_suspicious"] = bool(d["is_suspicious"])
            frames.append(d)
        return frames

    def list_history(self, page: int = 1, limit: int = 20) -> Tuple[List[Dict[str, Any]], int]:
        """Returns paginated history of analyses."""
        offset = (page - 1) * limit
        with _db_lock:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM analyses")
            total = cursor.fetchone()[0]

            cursor.execute(
                "SELECT * FROM analyses ORDER BY created_at DESC LIMIT ? OFFSET ?",
                (limit, offset)
            )
            rows = cursor.fetchall()
            conn.close()

        return [dict(r) for r in rows], total

    def get_dashboard_stats(self) -> Dict[str, int]:
        """Calculates accurate aggregate stats from SQLite records."""
        with _db_lock:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM analyses")
            total = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM analyses WHERE media_type = 'image'")
            total_images = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM analyses WHERE media_type = 'video'")
            total_videos = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM analyses WHERE prediction = 'Likely Manipulated'")
            manipulated = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM analyses WHERE prediction = 'Likely Authentic'")
            authentic = cursor.fetchone()[0]

            conn.close()

        return {
            "total_analyses": total,
            "total_images": total_images,
            "total_videos": total_videos,
            "manipulated_count": manipulated,
            "authentic_count": authentic,
        }

    def delete_analysis(self, analysis_id: str) -> None:
        """Deletes an analysis record and removes stored media and frame thumbnails."""
        analysis = self.get_analysis(analysis_id)
        file_path = analysis.get("file_path")

        # Delete physical file
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                logger.warning(f"Failed to remove file {file_path}: {e}")

        # Delete frame thumbnails
        frames = self.get_analysis_frames(analysis_id)
        for f in frames:
            t_path = f.get("thumbnail_path")
            if t_path and os.path.exists(t_path):
                try:
                    os.remove(t_path)
                except Exception:
                    pass

        with _db_lock:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM video_frames WHERE analysis_id = ?", (analysis_id,))
            cursor.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
            conn.commit()
            conn.close()


# Global singleton instance
history_service = HistoryService()
