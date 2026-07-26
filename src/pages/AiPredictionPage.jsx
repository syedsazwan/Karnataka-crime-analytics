import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Target,
  AlertTriangle,
  Flame,
  Shield,
  Cpu,
  BrainCircuit,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { useCrimeData } from '../hooks/useCrimeData';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { useSettings } from '../contexts/SettingsContext';

export const AiPredictionPage = () => {
  const [selectedModel, setSelectedModel] = useState('LSTM');
  const { topDistricts, loading } = useCrimeData();
  const { aiThresholds } = useSettings();

  // Synthetic prediction forecasting curve data connected to settings window
  const baseData = [
    { month: 'Jan 2026', historical: 18400, forecast: 18400 },
    { month: 'Feb 2026', historical: 19200, forecast: 19200 },
    { month: 'Mar 2026', historical: 20100, forecast: 20100 },
    { month: 'Apr 2026', historical: 19800, forecast: 19800 },
    { month: 'May 2026', historical: 21500, forecast: 21500 },
    { month: 'Jun 2026', historical: 22100, forecast: 22100 },
    { month: 'Jul 2026', historical: 21900, forecast: 21900 },
  ];
  
  const futureMonths = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const futurePredictions = Array.from({ length: aiThresholds.predictionMonths }).map((_, i) => ({
      month: `${futureMonths[i]} 2026 (Pred)`, historical: null, forecast: 21900 + (i+1)*(200 + aiThresholds.zScore*100)
  }));
  const predictionChartData = [...baseData, ...futurePredictions];

  const predictionTable = topDistricts.map((d, i) => {
    const growthNum = (7.5 - i * 0.4) + (aiThresholds.zScore * 0.5);
    const growth = growthNum.toFixed(1);
    const predicted = Math.round(d.firsCount * (1 + parseFloat(growth) / 100));
    
    // Apply Settings AI thresholds
    let risk = 'WATCH';
    if (d.firsCount >= aiThresholds.criticalThreshold) {
        risk = 'CRITICAL';
    } else if (parseFloat(growth) >= (aiThresholds.alertIncrease / 2)) {
        risk = 'HIGH RISK';
    }

    return {
      ...d,
      predicted,
      growth: `+${growth}%`,
      risk: risk,
      action: risk === 'CRITICAL' ? 'Deploy Patrol Units & Night Watch' : 'Increase Static Checkposts'
    };
  });

  if (loading) return <LoadingSkeleton count={4} height="h-32" />;

  return (
    <div className="space-y-6">
      {/* Model Selection Header */}
      <div className="gov-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-blue-400" />
            AI Crime Predictive Intelligence Engine
          </h3>
          <p className="text-[11px] text-slate-400">Next-month incident forecasting based on temporal-spatial clustering</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-300 uppercase">Active Model:</span>
          <div className="bg-[#0F172A] p-1 rounded-xl border border-[#334155] flex gap-1">
            <button
              onClick={() => setSelectedModel('LSTM')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedModel === 'LSTM'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LSTM Neural Net
            </button>
            <button
              onClick={() => setSelectedModel('XGBoost')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedModel === 'XGBoost'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              XGBoost Gradient
            </button>
          </div>
        </div>
      </div>

      {/* 5 Prediction Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="gov-card p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Month Forecast</div>
          <div className="text-xl font-black text-white mt-1">+22,800</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +4.1% expected
          </div>
        </div>

        <div className="gov-card p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Index Score</div>
          <div className="text-xl font-black text-rose-400 mt-1">88.4 / 100</div>
          <div className="text-[11px] text-rose-400/80 mt-1 font-semibold uppercase">High Severity</div>
        </div>

        <div className="gov-card p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model Confidence</div>
          <div className="text-xl font-black text-blue-400 mt-1">94.2%</div>
          <div className="text-[11px] text-slate-400 mt-1">Validated on 1.6M FIRs</div>
        </div>

        <div className="gov-card p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hotspot District</div>
          <div className="text-lg font-black text-amber-400 mt-1 truncate">Bengaluru City</div>
          <div className="text-[11px] text-slate-400 mt-1">Highest Density</div>
        </div>

        <div className="gov-card p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">State Heat Index</div>
          <div className="text-xl font-black text-rose-500 mt-1 flex items-center gap-1">
            <Flame className="w-5 h-5 fill-rose-500" /> 7.8 / 10
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Critical Watch</div>
        </div>
      </div>

      {/* Prediction Graph */}
      <div className="gov-card p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#334155]">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              {selectedModel} Forecasting Trend Curve (2026)
            </h3>
            <p className="text-[11px] text-slate-400">Historical trend line seamlessly connecting to AI future projections</p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={predictionChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }} />
              <Line
                type="monotone"
                dataKey="historical"
                name="Historical FIRs"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ r: 4, fill: '#2563EB' }}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="AI Prediction"
                stroke="#F59E0B"
                strokeWidth={3}
                strokeDasharray="6 6"
                dot={{ r: 5, fill: '#F59E0B' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District Risk Prediction Table */}
      <div className="gov-card p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-3 border-b border-[#334155] flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          District Risk & Police Response Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#334155] text-slate-400 uppercase text-[10px] tracking-wider bg-[#0F172A]/50">
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Current Cases</th>
                <th className="py-3 px-4">Predicted (Next Month)</th>
                <th className="py-3 px-4">Growth %</th>
                <th className="py-3 px-4">Risk Rating</th>
                <th className="py-3 px-4">AI Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/60 text-slate-300">
              {predictionTable.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#0F172A]/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{row.district}</td>
                  <td className="py-3.5 px-4 font-mono">{row.firsCount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{row.predicted.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-rose-400 font-bold">{row.growth}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                      row.risk === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {row.risk}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-medium">{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
