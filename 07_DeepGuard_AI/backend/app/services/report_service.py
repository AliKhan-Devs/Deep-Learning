import json
from typing import Dict, Any
from jinja2 import Template

from ..config import settings
from .history_service import history_service


HTML_REPORT_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>DeepGuard AI - Forensic Analysis Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            background-color: #f8fafc;
            padding: 40px;
            margin: 0;
        }
        .report-card {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.5px;
        }
        .badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 9999px;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .badge-fake {
            background-color: #fee2e2;
            color: #b91c1c;
            border: 1px solid #f87171;
        }
        .badge-real {
            background-color: #dcfce7;
            color: #15803d;
            border: 1px solid #4ade80;
        }
        .badge-inconclusive {
            background-color: #fef3c7;
            color: #b45309;
            border: 1px solid #fcd34d;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-box {
            background: #f1f5f9;
            padding: 16px;
            border-radius: 8px;
        }
        .metric-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 4px;
        }
        .metric-value {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
        }
        .disclaimer-box {
            margin-top: 40px;
            padding: 16px;
            background-color: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 8px;
            font-size: 13px;
            color: #92400e;
            line-height: 1.5;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="report-card">
        <div class="header">
            <div>
                <div class="logo">DeepGuard AI</div>
                <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Forensic Deepfake Assessment Certificate</div>
            </div>
            <div>
                {% if analysis.prediction == 'Likely Manipulated' %}
                <span class="badge badge-fake">Likely Manipulated</span>
                {% elif analysis.prediction == 'Likely Authentic' %}
                <span class="badge badge-real">Likely Authentic</span>
                {% else %}
                <span class="badge badge-inconclusive">Inconclusive</span>
                {% endif %}
            </div>
        </div>

        <div class="grid">
            <div class="metric-box">
                <div class="metric-label">Analysis Reference ID</div>
                <div class="metric-value" style="font-size: 14px; font-family: monospace;">{{ analysis.id }}</div>
            </div>
            <div class="metric-box">
                <div class="metric-label">Timestamp (UTC)</div>
                <div class="metric-value" style="font-size: 14px;">{{ analysis.created_at }}</div>
            </div>
            <div class="metric-box">
                <div class="metric-label">Original Filename</div>
                <div class="metric-value" style="font-size: 15px; word-break: break-all;">{{ analysis.original_filename }}</div>
            </div>
            <div class="metric-box">
                <div class="metric-label">Media Type</div>
                <div class="metric-value" style="font-size: 15px; text-transform: uppercase;">{{ analysis.media_type }}</div>
            </div>
            <div class="metric-box">
                <div class="metric-label">Evaluated Architecture</div>
                <div class="metric-value">{{ analysis.model_name }}</div>
            </div>
            <div class="metric-box">
                <div class="metric-label">Processing Duration</div>
                <div class="metric-value">{{ analysis.execution_duration_sec }}s</div>
            </div>
            <div class="metric-box">
                <div class="metric-label">Fake Manipulation Score</div>
                <div class="metric-value" style="color: #b91c1c;">{{ "%.2f"|format((analysis.fake_probability or 0.0) * 100) }}%</div>
            </div>
            <div class="metric-box">
                <div class="metric-label">Authenticity Score</div>
                <div class="metric-value" style="color: #15803d;">{{ "%.2f"|format((analysis.real_probability or 0.0) * 100) }}%</div>
            </div>
        </div>

        {% if analysis.media_type == 'video' %}
        <h3 style="font-size: 15px; margin-bottom: 12px; color: #334155;">Video Frame Breakdown</h3>
        <div class="grid" style="margin-bottom: 20px;">
            <div class="metric-box">
                <div class="metric-label">Sampled Frames</div>
                <div class="metric-value">{{ analysis.frames_analyzed }}</div>
            </div>
            <div class="metric-box">
                <div class="metric-label">Frames with Detectable Faces</div>
                <div class="metric-value">{{ analysis.frames_with_faces }}</div>
            </div>
            <div class="metric-box">
                <div class="metric-label">Suspicious Anomaly Frames</div>
                <div class="metric-value">{{ analysis.suspicious_frames_count }}</div>
            </div>
            <div class="metric-box">
                <div class="metric-label">Decision Threshold</div>
                <div class="metric-value">{{ analysis.decision_threshold }}</div>
            </div>
        </div>
        {% endif %}

        <div class="disclaimer-box">
            <strong>Mandatory Forensic Disclaimer:</strong><br>
            This result is an AI-generated forensic assessment and is not definitive proof of media authenticity or manipulation.
            Deep learning detection models evaluate subtle statistical and frequency-domain boundary artifacts that can be influenced
            by heavy compression, poor resolution, lighting artifacts, or post-production video editing.
        </div>

        <div class="footer">
            Generated by DeepGuard AI v{{ version }} &bull; Open-Source Deepfake Detection Portfolio Platform
        </div>
    </div>
</body>
</html>
"""


class ReportService:
    """Generates downloadable JSON and HTML forensic analysis reports."""

    def generate_json_report(self, analysis_id: str) -> Dict[str, Any]:
        """Produces comprehensive structured JSON report."""
        analysis = history_service.get_analysis(analysis_id)
        frames = []
        if analysis.get("media_type") == "video":
            frames = history_service.get_analysis_frames(analysis_id)

        return {
            "report_type": "DeepGuard_AI_Forensic_Report",
            "version": settings.VERSION,
            "analysis": analysis,
            "frames": frames,
            "disclaimer": (
                "This result is an AI-generated assessment and is not definitive proof "
                "of media authenticity or manipulation."
            )
        }

    def generate_html_report(self, analysis_id: str) -> str:
        """Renders printable, styled HTML forensic report."""
        analysis = history_service.get_analysis(analysis_id)
        template = Template(HTML_REPORT_TEMPLATE)
        return template.render(analysis=analysis, version=settings.VERSION)


# Global singleton instance
report_service = ReportService()
