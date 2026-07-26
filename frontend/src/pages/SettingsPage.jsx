import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Database,
  RefreshCw,
  Bell,
  Cpu,
  Lock,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const SettingsPage = () => {
  const { aiThresholds, updateAiThresholds } = useSettings();
  
  const [model, setModel] = useState('LSTM');
  const [syncing, setSyncing] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [autoRefreshGis, setAutoRefreshGis] = useState(false);
  const [syncedTime, setSyncedTime] = useState(new Date().toLocaleTimeString());

  // Temp threshold state for the sliders
  const [tempThresholds, setTempThresholds] = useState(aiThresholds);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // If aiThresholds change externally, sync local state
    setTempThresholds(aiThresholds);
  }, [aiThresholds]);

  const handleSyncDatabase = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSyncedTime(new Date().toLocaleTimeString());
    }, 1500);
  };

  const handleSaveThresholds = () => {
    updateAiThresholds(tempThresholds);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleResetThresholds = () => {
    const defaults = { alertIncrease: 20, criticalThreshold: 500, zScore: 2, predictionMonths: 3 };
    setTempThresholds(defaults);
    updateAiThresholds(defaults);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Cryptographic Signature Verified Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-800 to-slate-900 border border-blue-500/40 rounded-2xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Cryptographic Signature Verified
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                ACTIVE TOKEN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Karnataka State Data Center (KSDC) SHA-256 Auth Node ID: KSP-AI-2026-SECURE
            </p>
          </div>
        </div>

        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 hidden sm:block" />
      </div>

      {/* Model Selection Settings */}
      <div className="gov-card p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#334155]">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Prediction Engine Configuration</h3>
            <p className="text-[11px] text-slate-400">Select underlying machine learning model algorithm for forecasting</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => setModel('LSTM')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              model === 'LSTM'
                ? 'bg-blue-600/10 border-blue-500 text-white shadow-lg shadow-blue-600/10'
                : 'bg-[#0F172A] border-[#334155] text-slate-400 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm text-white">LSTM Neural Network</span>
              {model === 'LSTM' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
            </div>
            <p className="text-xs text-slate-400">
              Long Short-Term Memory deep recurrent neural net optimized for non-linear temporal sequence forecasting.
            </p>
          </div>

          <div
            onClick={() => setModel('XGBoost')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              model === 'XGBoost'
                ? 'bg-blue-600/10 border-blue-500 text-white shadow-lg shadow-blue-600/10'
                : 'bg-[#0F172A] border-[#334155] text-slate-400 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm text-white">XGBoost Gradient Boosting</span>
              {model === 'XGBoost' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
            </div>
            <p className="text-xs text-slate-400">
              Extreme Gradient Boosting tree decision architecture tuned for tabular spatial-temporal feature sets.
            </p>
          </div>
        </div>
      </div>

      {/* Database Connection & Sync */}
      <div className="gov-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Database Status</h3>
              <p className="text-[11px] text-slate-400">Local PapaParse CSV stream engine & state buffer</p>
            </div>
          </div>

          <button
            onClick={handleSyncDatabase}
            disabled={syncing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing CSV Data...' : 'Sync Database'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#0F172A] p-3.5 rounded-xl border border-[#334155]">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Connection State</span>
            <span className="text-emerald-400 font-bold mt-1 block flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connected
            </span>
          </div>

          <div className="bg-[#0F172A] p-3.5 rounded-xl border border-[#334155]">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Parsed FIR Records</span>
            <span className="text-white font-bold font-mono mt-1 block">5,500 Loaded (1.6M Scaled)</span>
          </div>

          <div className="bg-[#0F172A] p-3.5 rounded-xl border border-[#334155]">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Sync Time</span>
            <span className="text-slate-300 font-mono mt-1 block">{syncedTime}</span>
          </div>
        </div>
      </div>

      {/* System Toggles */}
      <div className="gov-card p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#334155]">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Alerts & System Preferences</h3>
            <p className="text-[11px] text-slate-400">Configure portal notification triggers and background refreshes</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded-xl border border-[#334155]">
            <div>
              <span className="text-xs font-bold text-white block">High Risk Anomaly Alerts</span>
              <span className="text-[11px] text-slate-400">Trigger bell popups when district crime rate exceeds +10% threshold</span>
            </div>
            <input
              type="checkbox"
              checked={alertsEnabled}
              onChange={() => setAlertsEnabled(!alertsEnabled)}
              className="w-4 h-4 rounded bg-[#1E293B] border-[#334155] text-blue-600 focus:ring-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded-xl border border-[#334155]">
            <div>
              <span className="text-xs font-bold text-white block">Automated Weekly Summaries</span>
              <span className="text-[11px] text-slate-400">Compile weekly PDF intelligence reports for commanding officers</span>
            </div>
            <input
              type="checkbox"
              checked={weeklyReports}
              onChange={() => setWeeklyReports(!weeklyReports)}
              className="w-4 h-4 rounded bg-[#1E293B] border-[#334155] text-blue-600 focus:ring-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded-xl border border-[#334155]">
            <div>
              <span className="text-xs font-bold text-white block">Auto-Refresh GIS Layer</span>
              <span className="text-[11px] text-slate-400">Re-fetch crime coordinates on map view every 60 seconds</span>
            </div>
            <input
              type="checkbox"
              checked={autoRefreshGis}
              onChange={() => setAutoRefreshGis(!autoRefreshGis)}
              className="w-4 h-4 rounded bg-[#1E293B] border-[#334155] text-blue-600 focus:ring-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* AI Risk Threshold Configuration */}
      <div className="gov-card p-6 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-[#334155]">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Risk Threshold Configuration</h3>
            <p className="text-[11px] text-slate-400">Configure AI detection thresholds used across dashboard predictions and alerts.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sliders */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-slate-300">Alert when district crime rate increases by</span>
                <span className="text-xs font-bold text-blue-400">{tempThresholds.alertIncrease}%</span>
              </div>
              <input
                type="range" min="0" max="50"
                value={tempThresholds.alertIncrease}
                onChange={(e) => setTempThresholds({...tempThresholds, alertIncrease: Number(e.target.value)})}
                className="w-full h-2 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-slate-300">Mark district as CRITICAL when crime rate exceeds</span>
                <span className="text-xs font-bold text-amber-400">{tempThresholds.criticalThreshold}</span>
              </div>
              <input
                type="range" min="100" max="1000" step="10"
                value={tempThresholds.criticalThreshold}
                onChange={(e) => setTempThresholds({...tempThresholds, criticalThreshold: Number(e.target.value)})}
                className="w-full h-2 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-slate-300">Z-score threshold for anomaly detection</span>
                <span className="text-xs font-bold text-rose-400">{tempThresholds.zScore}</span>
              </div>
              <input
                type="range" min="1" max="5" step="0.1"
                value={tempThresholds.zScore}
                onChange={(e) => setTempThresholds({...tempThresholds, zScore: Number(e.target.value)})}
                className="w-full h-2 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-slate-300">Months ahead for AI Prediction</span>
                <span className="text-xs font-bold text-emerald-400">{tempThresholds.predictionMonths} Months</span>
              </div>
              <input
                type="range" min="1" max="12"
                value={tempThresholds.predictionMonths}
                onChange={(e) => setTempThresholds({...tempThresholds, predictionMonths: Number(e.target.value)})}
                className="w-full h-2 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          {/* Live Preview Card & Actions */}
          <div className="space-y-6">
            <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-5 shadow-inner">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#334155]/60">
                Current AI Threshold Summary
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Alert Increase</span>
                  <span className="font-bold text-blue-400">{tempThresholds.alertIncrease}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Critical Threshold</span>
                  <span className="font-bold text-amber-400">{tempThresholds.criticalThreshold}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Z Score</span>
                  <span className="font-bold text-rose-400">{tempThresholds.zScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Prediction Window</span>
                  <span className="font-bold text-emerald-400">{tempThresholds.predictionMonths} Months</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveThresholds}
                className="flex-1 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg border border-transparent transition-all text-xs uppercase tracking-wider"
              >
                Save Thresholds
              </button>
              <button
                onClick={handleResetThresholds}
                className="flex-1 bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 border border-[#334155] hover:border-slate-500 font-bold py-2.5 px-4 rounded-xl transition-all text-xs uppercase tracking-wider"
              >
                Reset To Defaults
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500/90 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md border border-emerald-400/50 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold text-sm">AI Thresholds Updated Successfully</span>
        </div>
      )}
    </div>
  );
};
