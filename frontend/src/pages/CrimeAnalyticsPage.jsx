import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ShieldAlert, TrendingUp, Clock, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useCrimeData } from '../hooks/useCrimeData';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const CrimeAnalyticsPage = () => {
  const { monthlyTrend, crimeCategories, topDistricts, loading } = useCrimeData();

  if (loading) return <LoadingSkeleton count={4} height="h-32" />;

  return (
    <div className="space-y-6">
      {/* Top Grid Layout matching screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Monthly Trend Chart (Left 2 columns) */}
        <div className="lg:col-span-2 gov-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#334155]">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Monthly Crime Trend Analytics
              </h3>
              <p className="text-[11px] text-slate-400">Historical occurrence data vs AI predictive forecast curve</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-blue-400">
                <span className="w-3 h-1 bg-blue-500 rounded-full" /> Historical
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-1 border-t-2 border-dashed border-emerald-400" /> AI Forecast
              </div>
            </div>
          </div>

          <div className="h-80 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }}
                />
                <Line
                  type="monotone"
                  dataKey="crimes"
                  name="Historical Crimes"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="AI Prediction"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Donut Chart (Right Top Column) */}
        <div className="gov-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Categories
              </h3>
              <p className="text-[11px] text-slate-400">Distribution by offense type</p>
            </div>
          </div>

          <div className="flex items-center justify-between my-2">
            {/* Donut Chart with Center Text */}
            <div className="relative w-44 h-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={crimeCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {crimeCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-black text-white">100.0%</span>
                <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">TOTAL</span>
              </div>
            </div>

            {/* Custom Right Legend matching screenshot 2 */}
            <div className="space-y-2 text-xs w-full pl-2">
              {crimeCategories.slice(0, 6).map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-300 truncate">{cat.name}</span>
                  </div>
                  <span className="font-bold text-white ml-2">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top 10 Dangerous Districts & Heat Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heat Statistics (Left Column) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="gov-card p-4 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              Crime Increase
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 mt-2">+14.2%</div>
            <div className="text-[10px] text-slate-400 mt-1">High density areas</div>
          </div>

          <div className="gov-card p-4 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              Crime Reduction
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-2">-8.4%</div>
            <div className="text-[10px] text-slate-400 mt-1">Patrolled sectors</div>
          </div>

          <div className="gov-card p-4 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              Prediction Accuracy
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400 mt-2">94.2%</div>
            <div className="text-[10px] text-slate-400 mt-1">LSTM neural model</div>
          </div>

          <div className="gov-card p-4 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              Avg Response Time
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-2">12.4 m</div>
            <div className="text-[10px] text-slate-400 mt-1">Dispatch speed</div>
          </div>
        </div>

        {/* Top 10 Dangerous Districts List (Right 2 columns) */}
        <div className="lg:col-span-2 gov-card p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#334155]">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Top 10 Dangerous Districts
              </h3>
              <p className="text-[11px] text-slate-400">Ranked by registered cases & AI risk index</p>
            </div>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {topDistricts.map((item) => (
              <div key={item.rank} className="flex items-center gap-4 bg-[#0F172A] border border-[#334155] p-3 rounded-xl">
                <span className="w-6 text-xs font-black text-slate-500">{item.rank}.</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-white truncate">{item.district}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">{item.firsCount.toLocaleString()} FIRs</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                        item.riskLevel === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {item.riskLevel}
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.riskLevel === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, (item.firsCount / 425408) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
