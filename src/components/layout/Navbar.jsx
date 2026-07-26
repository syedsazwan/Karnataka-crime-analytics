import React, { useState, useEffect } from 'react';
import { Search, Bell, LogOut, Calendar, Clock, ShieldAlert, CheckCircle2, Info, Moon, Sun } from 'lucide-react';
import { HeaderBadge } from '../common/HeaderBadge';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';

export const Navbar = ({ searchFilter, setSearchFilter, firs = [] }) => {
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { theme, toggleTheme } = useSettings();

  const location = useLocation();
  const navigate = useNavigate();

  // Get Page Title from route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/analytics': return 'AI CRIME ANALYTICS';
      case '/firs': return 'FIR MANAGEMENT REGISTRY';
      case '/map': return 'KARNATAKA GIS CRIME MAP';
      case '/prediction': return 'AI PREDICTION & FORECASTING';
      case '/officers': return 'ACTIVE OFFICERS REGISTRY';
      case '/reports': return 'CRIME REPORTS & EXPORTS';
      case '/settings': return 'SYSTEM & MODEL SETTINGS';
      default: return 'KARNATAKA CRIME DASHBOARD';
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeOpts = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      const dateOpts = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
      setTimeString(now.toLocaleTimeString('en-US', timeOpts));
      setDateString(now.toLocaleDateString('en-US', dateOpts));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const searchResults = searchFilter.trim()
    ? firs.filter(f =>
        f.FIR_Number?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        f.District?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        f.Police_Station?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        f.Crime_Type?.toLowerCase().includes(searchFilter.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="h-20 bg-[#0F172A]/85 backdrop-blur-xl border-b border-[#334155]/60 px-6 flex items-center justify-between sticky top-0 z-30 shadow-lg">
      {/* Title & Badge */}
      <HeaderBadge title={getPageTitle()} />

      {/* Center Search Input (Flex 1 Auto Expand) */}
      <div className="relative flex-1 max-w-md xl:max-w-lg mx-6 hidden lg:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search FIRs, districts, stations..."
            value={searchFilter}
            onChange={(e) => {
              setSearchFilter(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            className="w-full bg-[#1E293B]/80 border border-[#334155]/70 text-white text-xs rounded-[14px] pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500 font-medium"
          />
        </div>

        {/* Autocomplete Search Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-[#1E293B] border border-[#334155] rounded-[14px] shadow-2xl overflow-hidden z-50 py-2">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#334155]">
              Quick Results ({searchResults.length})
            </div>
            {searchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSearchFilter(item.FIR_Number);
                  navigate('/firs');
                }}
                className="px-4 py-2.5 hover:bg-slate-700/50 cursor-pointer flex items-center justify-between border-b border-slate-800/50 last:border-none"
              >
                <div>
                  <div className="text-xs font-bold text-white">{item.FIR_Number}</div>
                  <div className="text-[11px] text-slate-400">{item.Crime_Type} • {item.District}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                  {item.Status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live Clock Card */}
        <div className="bg-[#1E293B]/70 border border-[#334155]/70 px-3.5 py-2 rounded-[14px] flex items-center gap-3 text-xs hidden sm:flex">
          <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-slate-200">{dateString}</span>
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-amber-400 inline" />
              {timeString}
            </span>
          </div>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-[14px] bg-[#1E293B]/70 border border-[#334155]/70 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2.5 right-2.5 ring-2 ring-[#0F172A] animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1E293B] border border-[#334155] rounded-[14px] shadow-2xl overflow-hidden z-50 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  System Notifications
                </h4>
                <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded border border-rose-500/30">
                  3 New
                </span>
              </div>
              <div className="space-y-3 mt-3">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50 flex gap-3 text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-200">High Risk Spike Alert</div>
                    <div className="text-[11px] text-slate-400">Bengaluru City recorded +12.4% vehicle theft anomaly.</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50 flex gap-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-200">AI Model Synced</div>
                    <div className="text-[11px] text-slate-400">LSTM weights recalculated with 94.2% accuracy.</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50 flex gap-3 text-xs">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-200">District Boundary GIS</div>
                    <div className="text-[11px] text-slate-400">GeoJSON polygons updated for all 31 districts.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle (Pill Switch) */}
        <button
          onClick={toggleTheme}
          className="relative w-[52px] h-[28px] rounded-full bg-[#1E293B]/70 border border-[#334155]/70 flex items-center p-1 transition-colors duration-300 hover:border-slate-500 focus:outline-none"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          <div className="absolute flex justify-between w-full px-[5px] pointer-events-none">
            <Moon className="w-3.5 h-3.5 text-slate-400" />
            <Sun className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div
            className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center z-10 ${
              theme === 'dark' ? 'translate-x-0' : 'translate-x-[24px]'
            }`}
          >
            {theme === 'dark' ? (
              <Moon className="w-3 h-3 text-slate-800" />
            ) : (
              <Sun className="w-3 h-3 text-amber-500" />
            )}
          </div>
        </button>

        {/* Officer Avatar Badge */}
        <div className="flex items-center gap-2.5 bg-[#1E293B]/70 border border-[#334155]/70 p-1.5 pr-3.5 rounded-[14px]">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold text-xs flex items-center justify-center shrink-0">
            OF
          </div>
          <div className="hidden xl:block text-left leading-tight">
            <div className="text-xs font-bold text-white">officer</div>
            <div className="text-[10px] text-slate-400 font-medium">Karnataka State Police</div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-[14px] text-xs font-bold transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>

      </div>
    </header>
  );
};

