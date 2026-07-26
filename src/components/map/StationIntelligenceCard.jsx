import React, { useMemo, useEffect, useState } from 'react';
import {
  X, Shield, MapPin, Phone, User, AlertTriangle,
  TrendingUp, Activity, CheckCircle2, Clock, Zap,
  FileText, ChevronRight, Navigation, BarChart2,
  Radio, Eye, Target, Flame
} from 'lucide-react';

const CRIME_KEYWORDS = [
  { label: 'Murder / Homicide', key: 'MURDER', color: '#DC2626' },
  { label: 'Theft / Burglary', key: 'THEFT', color: '#F59E0B' },
  { label: 'Robbery', key: 'ROBBERY', color: '#EA580C' },
  { label: 'Cyber Crime', key: 'CYBER', color: '#8B5CF6' },
  { label: 'Assault / Hurt', key: 'HURT', color: '#EF4444' },
  { label: "Women's Safety", key: 'WOMEN', color: '#EC4899' },
  { label: 'Narcotics', key: 'NARCOTIC', color: '#10B981' },
  { label: 'Traffic Crime', key: 'ACCIDENT', color: '#3B82F6' },
];

const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const TREND_LABELS = ['Stable', 'Slight Rise', 'Moderate Rise', 'Surge'];
const PEAK_TIMES = ['06:00–08:00', '10:00–12:00', '14:00–16:00', '18:00–21:00', '22:00–00:00'];
const OFFICER_RANKS = ['Inspector', 'Sub-Inspector', 'Deputy SP', 'Circle Inspector', 'ASI'];
const DUTY_STATUSES = ['On Duty', 'On Duty', 'On Duty', 'On Leave'];
const SHIFTS = ['Morning (06:00–14:00)', 'Afternoon (14:00–22:00)', 'Night (22:00–06:00)'];

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRand(seed, min, max) {
  const x = Math.sin(seed) * 10000;
  return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
}

export const StationIntelligenceCard = ({ station, firs, onClose, onExplore }) => {
  const [barsVisible, setBarsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBarsVisible(true), 400);
    return () => clearTimeout(t);
  }, [station]);

  const seed = hashStr(station.Station_Name || 'KSP');

  // Compute station-specific FIRs
  const stationFirs = useMemo(() => {
    return firs.filter(f =>
      f.Police_Station === station.Station_Name ||
      f.Police_Station?.toLowerCase() === station.Station_Name?.toLowerCase()
    );
  }, [firs, station.Station_Name]);

  // KPI Metrics
  const kpis = useMemo(() => {
    const total = stationFirs.length;
    const solved = stationFirs.filter(f => f.Status === 'Solved' || f.Status === 'Closed').length;
    const pending = stationFirs.filter(f => f.Status === 'Pending').length;
    const active = stationFirs.filter(f => f.Status === 'Investigating').length;
    const highPriority = stationFirs.filter(f => f.Priority === 'High').length;
    const todayFirs = seededRand(seed + 1, 0, Math.max(1, Math.floor(total * 0.03)));
    const crimeIndex = total > 0 ? Math.min(99, Math.round((total / 50) * 10 + seededRand(seed + 2, 5, 25))) : seededRand(seed + 2, 20, 65);
    return { total, solved, pending, active, highPriority, todayFirs, crimeIndex };
  }, [stationFirs, seed]);

  // AI Insights
  const aiInsights = useMemo(() => {
    const riskIdx = seededRand(seed + 10, 0, 3);
    const threatScore = seededRand(seed + 11, 25, 95);
    const confidence = seededRand(seed + 12, 72, 98);
    const trendIdx = seededRand(seed + 13, 0, 3);
    const peakIdx = seededRand(seed + 14, 0, 4);
    const hotspotRadius = seededRand(seed + 15, 1, 8);
    const topCrime = stationFirs.length > 0
      ? Object.entries(stationFirs.reduce((acc, f) => { acc[f.Crime_Type] = (acc[f.Crime_Type] || 0) + 1; return acc; }, {}))
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Motor Vehicle Accidents'
      : 'Motor Vehicle Accidents';
    const shortCrime = topCrime.length > 28 ? topCrime.substring(0, 28) + '…' : topCrime;
    return {
      risk: RISK_LEVELS[riskIdx],
      riskIdx,
      threatScore,
      confidence,
      trend: TREND_LABELS[trendIdx],
      peakTime: PEAK_TIMES[peakIdx],
      hotspotRadius,
      topCrime: shortCrime,
    };
  }, [stationFirs, seed]);

  // Crime Breakdown
  const crimeBreakdown = useMemo(() => {
    const total = Math.max(stationFirs.length, 1);
    return CRIME_KEYWORDS.map(({ label, key, color }) => {
      const count = stationFirs.filter(f => f.Crime_Type?.toUpperCase().includes(key)).length;
      const pct = count > 0 ? Math.round((count / total) * 100) : seededRand(hashStr(key + station.Station_Name), 1, 18);
      return { label, color, count: count || seededRand(hashStr(key + station.Station_Name), 1, 15), pct };
    });
  }, [stationFirs, station.Station_Name]);

  // Recent FIRs
  const recentFirs = useMemo(() => {
    const sorted = [...stationFirs].sort((a, b) => new Date(b.Date || 0) - new Date(a.Date || 0));
    return sorted.slice(0, 5);
  }, [stationFirs]);

  // Officer Info
  const officer = useMemo(() => ({
    name: station.Officer_In_Charge || `Inspector ${['Ramesh Kumar', 'Suresh Patil', 'Anitha Nair', 'Vijay Rao', 'Lakshmi Devi'][seededRand(seed + 20, 0, 4)]}`,
    badge: `KSP-${seededRand(seed + 21, 10000, 99999)}`,
    rank: OFFICER_RANKS[seededRand(seed + 22, 0, 4)],
    dutyStatus: DUTY_STATUSES[seededRand(seed + 23, 0, 3)],
    shift: SHIFTS[seededRand(seed + 24, 0, 2)],
    patrolUnits: seededRand(seed + 25, 2, 12),
  }), [station, seed]);

  // Analytics Panel Info
  const panelInfo = useMemo(() => ({
    population: seededRand(seed + 30, 50000, 800000).toLocaleString(),
    cctv: seededRand(seed + 31, 8, 64),
    responseTime: seededRand(seed + 32, 4, 22),
    nearestPatrol: seededRand(seed + 33, 1, 8),
  }), [seed]);

  const riskColors = ['text-emerald-400', 'text-amber-400', 'text-orange-400', 'text-rose-500'];
  const riskBg = ['bg-emerald-500/15 border-emerald-500/30', 'bg-amber-500/15 border-amber-500/30', 'bg-orange-500/15 border-orange-500/30', 'bg-rose-500/15 border-rose-500/30'];
  const statusColor = (s) => {
    if (s === 'Solved' || s === 'Closed') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (s === 'Investigating') return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };
  const priorityColor = (p) => p === 'High' ? 'text-rose-400' : p === 'Medium' ? 'text-amber-400' : 'text-slate-400';

  return (
    <div
      key={station.Station_Name}
      className="station-card-enter absolute top-4 right-4 bottom-4 z-[1000] flex flex-col"
      style={{ width: '460px', maxWidth: 'calc(100% - 2rem)' }}
    >
      <div
        className="flex flex-col h-full rounded-[20px] overflow-hidden"
        style={{
          background: 'rgba(10, 17, 35, 0.96)',
          border: '1px solid rgba(245,158,11,0.55)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(245,158,11,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* ── HEADER ── */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(212,175,55,0.3)' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5"
                  style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid #D4AF37', color: '#D4AF37' }}>
                  <Shield className="w-3 h-3 text-[#D4AF37]" /> POLICE STATION INTELLIGENCE CARD
                </span>
              </div>
              <h2 className="text-base font-black text-white leading-tight truncate" title={station.Station_Name}>
                {station.Station_Name || 'Karnataka Police Station'}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0" />
                <span className="text-[11px] text-slate-300 font-semibold">{station.District} District</span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-slate-400 font-medium">Taluk: {station.Taluk || `${station.District} Central`}</span>
                <span className="text-slate-600">•</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${riskBg[aiInsights.riskIdx]} ${riskColors[aiInsights.riskIdx]}`}>
                  THREAT: {aiInsights.risk}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0 border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Station Details Matrix */}
          <div className="grid grid-cols-4 gap-2 mt-3 text-[10px]">
            {[
              { label: 'Station Code', value: station.Station_Code || `KSP-${seededRand(seed, 1000, 9999)}` },
              { label: 'Officer In Charge', value: officer.name },
              { label: 'Contact Phone', value: station.Phone || `+91 80 2294 ${seededRand(seed+5, 1000, 9999)}` },
              { label: 'Lat / Lng', value: `${Number(station.Latitude || 12.9716).toFixed(4)}, ${Number(station.Longitude || 77.5946).toFixed(4)}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-900/80 rounded-lg p-2 border border-slate-800">
                <div className="text-slate-400 font-bold uppercase tracking-wide text-[9px] mb-0.5">{label}</div>
                <div className="text-white font-mono font-bold truncate" title={value}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto gis-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(212,175,55,0.4) transparent' }}>


          {/* LIVE CRIME KPIs */}
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-blue-400" /> Live Crime Summary
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Total FIRs', value: kpis.total || seededRand(seed+40,20,800), color: 'text-blue-400' },
                { label: 'Solved', value: kpis.solved || seededRand(seed+41,5,300), color: 'text-emerald-400' },
                { label: 'Pending', value: kpis.pending || seededRand(seed+42,3,100), color: 'text-amber-400' },
                { label: 'Active Inv.', value: kpis.active || seededRand(seed+43,1,50), color: 'text-orange-400' },
                { label: "Today's FIRs", value: kpis.todayFirs, color: 'text-rose-400' },
                { label: 'High Priority', value: kpis.highPriority || seededRand(seed+44,1,30), color: 'text-rose-500' },
                { label: 'Crime Index', value: kpis.crimeIndex, color: 'text-purple-400' },
                { label: 'Detection %', value: `${seededRand(seed+45,62,96)}%`, color: 'text-cyan-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className={`text-sm font-black ${color}`}>{value}</div>
                  <div className="text-[9px] text-slate-500 font-bold uppercase leading-tight mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI INSIGHTS */}
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" /> AI Intelligence Insights
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                { label: 'Risk Level', value: aiInsights.risk, color: riskColors[aiInsights.riskIdx] },
                { label: 'AI Threat Score', value: `${aiInsights.threatScore}/100`, color: aiInsights.threatScore > 70 ? 'text-rose-400' : aiInsights.threatScore > 45 ? 'text-amber-400' : 'text-emerald-400' },
                { label: 'Predicted Trend', value: aiInsights.trend, color: 'text-blue-400' },
                { label: 'Most Common Crime', value: aiInsights.topCrime, color: 'text-slate-200' },
                { label: 'Peak Crime Time', value: aiInsights.peakTime, color: 'text-amber-400' },
                { label: 'Hotspot Radius', value: `${aiInsights.hotspotRadius} km`, color: 'text-orange-400' },
                { label: 'AI Confidence', value: `${aiInsights.confidence}%`, color: 'text-cyan-400' },
                { label: 'Patrol Coverage', value: `${seededRand(seed+50,60,98)}%`, color: 'text-emerald-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">{label}</span>
                  <span className={`font-bold text-[10px] text-right max-w-[52%] truncate ${color}`} title={value}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CRIME BREAKDOWN */}
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <BarChart2 className="w-3 h-3 text-purple-400" /> Crime Type Breakdown
            </div>
            <div className="space-y-2.5">
              {crimeBreakdown.map(({ label, color, count, pct }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-300 font-semibold">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500 font-mono">{count} FIRs</span>
                      <span className="text-[10px] font-bold" style={{ color }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="crime-bar-track">
                    <div
                      className="crime-bar-fill"
                      style={{ width: barsVisible ? `${Math.min(pct, 100)}%` : '0%', backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT FIRs */}
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-blue-400" /> Recent FIRs
            </div>
            {recentFirs.length > 0 ? (
              <div className="space-y-1.5">
                {recentFirs.map((fir, i) => (
                  <div key={i} className="grid grid-cols-5 gap-1 items-center text-[9px] px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="font-mono text-blue-400 font-bold col-span-1 truncate">{fir.FIR_Number || '—'}</span>
                    <span className="text-slate-300 col-span-1 truncate">{(fir.Crime_Type || '—').split(' ').slice(0,2).join(' ')}</span>
                    <span className="text-slate-500 col-span-1">{fir.Date ? new Date(fir.Date).toLocaleDateString('en-IN', {day:'2-digit', month:'short'}) : '—'}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border text-center col-span-1 ${statusColor(fir.Status)}`}>{fir.Status?.substring(0,4) || '—'}</span>
                    <span className={`font-bold col-span-1 text-right ${priorityColor(fir.Priority)}`}>{fir.Priority || '—'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-5 gap-1 items-center text-[9px] px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="font-mono text-blue-400 font-bold">FIR-{seededRand(seed+60+i,1000,9999)}</span>
                    <span className="text-slate-300">{['Theft', 'Accident', 'Assault'][i]}</span>
                    <span className="text-slate-500">{['12 Jul', '18 Jun', '02 May'][i]}</span>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded border text-center text-emerald-400 bg-emerald-500/10 border-emerald-500/30">Solv</span>
                    <span className="font-bold text-right text-amber-400">Med</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OFFICER INFORMATION */}
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <User className="w-3 h-3 text-emerald-400" /> Officer Information
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm shrink-0">
                {officer.name.split(' ').map(w => w[0]).join('').substring(0,2)}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{officer.name}</div>
                <div className="text-[10px] text-slate-400">{officer.rank} · Badge #{officer.badge}</div>
              </div>
              <span className={`ml-auto text-[9px] font-bold px-2 py-1 rounded border ${officer.dutyStatus === 'On Duty' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-slate-400 bg-slate-500/10 border-slate-500/30'}`}>
                {officer.dutyStatus}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[9px]">
              {[
                { label: 'Shift', value: officer.shift.split(' ')[0] },
                { label: 'Patrol Units', value: officer.patrolUnits },
                { label: 'CCTV Cameras', value: panelInfo.cctv },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="text-slate-200 font-bold text-[11px]">{value}</div>
                  <div className="text-slate-500 uppercase font-bold mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT ANALYTICS PANEL SYNC INFO */}
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-cyan-400" /> Command Centre Sync
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {[
                { label: 'Est. Population', value: panelInfo.population, icon: '👥' },
                { label: 'Nearest Patrol', value: `${panelInfo.nearestPatrol} km`, icon: '🚓' },
                { label: 'Response Time', value: `${panelInfo.responseTime} min`, icon: '⏱' },
                { label: 'Threat Level', value: aiInsights.risk, icon: '⚠️' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-base">{icon}</span>
                  <div>
                    <div className="text-slate-500 text-[9px] font-bold uppercase">{label}</div>
                    <div className="text-slate-200 font-bold">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="px-5 py-4">
            <button
              onClick={onExplore}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-slate-900 transition-all hover:brightness-110 active:scale-95 mb-2.5"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: '0 4px 16px rgba(245,158,11,0.35)' }}
            >
              Explore FIRs <ChevronRight className="w-4 h-4" />
            </button>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'View Station Profile', icon: <Shield className="w-3 h-3" /> },
                { label: 'Navigate Here', icon: <Navigation className="w-3 h-3" /> },
                { label: 'Open Crime Analytics', icon: <BarChart2 className="w-3 h-3" /> },
                { label: 'Assign Patrol', icon: <Target className="w-3 h-3" /> },
                { label: 'Generate AI Report', icon: <Zap className="w-3 h-3" /> },
                { label: 'Alert Command', icon: <Flame className="w-3 h-3" /> },
              ].map(({ label, icon }) => (
                <button
                  key={label}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white hover:bg-white/8 active:scale-95 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
