import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  MapPin,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Crime Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'FIR Management', path: '/firs', icon: FileText },
    { name: 'Crime Map', path: '/map', icon: MapPin },
    { name: 'AI Prediction', path: '/prediction', icon: Sparkles },
    { name: 'Officers', path: '/officers', icon: ShieldCheck },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`bg-[#0F172A]/90 backdrop-blur-xl border-r border-[#334155]/60 h-screen sticky top-0 flex flex-col justify-between transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header Logo */}
      <div>
        <div className="h-20 flex items-center px-5 border-b border-[#334155]/60 gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 shadow-lg shadow-amber-500/10 overflow-hidden">
            <img src="/karnataka_emblem.png" alt="Karnataka Emblem" className="w-7 h-7 object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col justify-center leading-tight overflow-hidden whitespace-nowrap">
              <span className="font-black text-amber-500 text-xs tracking-wider uppercase">
                KARNATAKA POLICE
              </span>
              <span className="font-bold text-blue-400 text-[10px] tracking-widest uppercase mt-0.5">
                AI CRIME DETECTION
              </span>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-3 rounded-[14px] text-xs font-semibold transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/30 to-blue-500/15 text-blue-400 border border-blue-500/40 shadow-lg shadow-blue-500/15 border-l-4 border-l-blue-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/70 border border-transparent hover:translate-x-0.5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    {!collapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Box & Collapse Toggle */}
      <div className="p-3 border-t border-[#334155]/60">
        {!collapsed ? (
          <div className="bg-[#1E293B]/70 border border-[#334155]/60 p-3 rounded-[14px] mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM ONLINE
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">
              KA-AI v2.4 Active • Models Synced
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full h-9 bg-[#1E293B]/70 border border-[#334155]/60 rounded-[14px] flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};

