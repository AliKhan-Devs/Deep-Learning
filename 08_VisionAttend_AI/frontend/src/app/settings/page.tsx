"use client";

import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  Clock,
  Sliders,
  RefreshCw
} from "lucide-react";
import { api } from "../../lib/api";
import { SystemSettings } from "../../lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    work_start_time: "09:00:00",
    late_grace_minutes: 15,
    cosine_threshold: 0.65,
    liveness_enabled: true,
    liveness_threshold: 40.0,
  });

  const [_loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api
      .getSettings()
      .then((s) => setSettings(s))
      .catch((err) => console.error("Error loading settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert("Error saving settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 select-none">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-indigo-600" />
          Enterprise System Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure work shifts, late arrival thresholds, and deep facial recognition sensitivity
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Attendance Policy Card */}
        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Attendance &amp; Shift Schedule</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Standard Shift Start Time
              </label>
              <input
                type="time"
                step="1"
                value={settings.work_start_time}
                onChange={(e) =>
                  setSettings({ ...settings, work_start_time: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono transition-colors"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Official time when the workday shift commences.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Late Arrival Grace Period (Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={settings.late_grace_minutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    late_grace_minutes: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono transition-colors"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Check-ins after {settings.work_start_time.slice(0, 5)} + {settings.late_grace_minutes} mins are marked LATE.
              </p>
            </div>
          </div>
        </div>

        {/* Biometrics & Security Policy Card */}
        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Biometric Recognition &amp; Anti-Spoofing</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Cosine Threshold Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 font-medium">
                  FaceNet Vector Similarity Threshold (Cosine Metric)
                </label>
                <span className="font-mono font-semibold text-indigo-700 text-sm">
                  {settings.cosine_threshold.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.85"
                step="0.01"
                value={settings.cosine_threshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cosine_threshold: parseFloat(e.target.value),
                  })
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>0.50 (Permissive)</span>
                <span className="text-indigo-700 font-medium">0.65 (Recommended)</span>
                <span>0.85 (Strict)</span>
              </div>
            </div>

            {/* Anti-spoofing toggle */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-200">
              <div>
                <span className="font-medium text-slate-900 block">Passive Liveness Detection</span>
                <span className="text-[11px] text-slate-500">
                  Analyze Laplacian texture variance and skin chrominance to prevent 2D photo spoofing.
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.liveness_enabled}
                  onChange={(e) =>
                    setSettings({ ...settings, liveness_enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Configuration Updated Successfully
            </span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
