import json
from typing import List, Optional
from app.core.database import get_db_connection
from app.models.schemas import AuditLogItem, DiagnosticResult

class HistoryService:
    @staticmethod
    def save_analysis(result: DiagnosticResult, patient_id: Optional[str] = None, notes: Optional[str] = None):
        conn = get_db_connection()
        cursor = conn.cursor()
        
        prob_dict = {item.class_name: item.probability for item in result.probabilities}
        
        cursor.execute("""
        INSERT OR REPLACE INTO scan_audit_logs 
        (scan_id, patient_id, predicted_class, confidence, entropy, risk_level, probabilities_json, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            result.scan_id,
            patient_id or f"PT-{result.scan_id[:4].upper()}",
            result.predicted_class,
            result.confidence,
            result.entropy,
            result.risk_level,
            json.dumps(prob_dict),
            notes or ""
        ))
        conn.commit()
        conn.close()

    @staticmethod
    def get_history(limit: int = 50) -> List[AuditLogItem]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        SELECT id, scan_id, patient_id, predicted_class, confidence, entropy, risk_level, probabilities_json, notes, created_at
        FROM scan_audit_logs
        ORDER BY created_at DESC
        LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        conn.close()

        items = []
        for r in rows:
            prob_dict = json.loads(r["probabilities_json"]) if r["probabilities_json"] else {}
            items.append(AuditLogItem(
                id=r["id"],
                scan_id=r["scan_id"],
                patient_id=r["patient_id"],
                predicted_class=r["predicted_class"],
                confidence=r["confidence"],
                entropy=r["entropy"],
                risk_level=r["risk_level"],
                probabilities=prob_dict,
                notes=r["notes"],
                created_at=r["created_at"]
            ))
        return items

    @staticmethod
    def clear_history():
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM scan_audit_logs")
        conn.commit()
        conn.close()

history_service = HistoryService()
