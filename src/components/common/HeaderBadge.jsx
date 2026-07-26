import React from 'react';

export const HeaderBadge = ({ title = "KARNATAKA CRIME DASHBOARD" }) => {
  return (
    <div className="flex items-center gap-3 py-1">
      {/* Emblem Gold Box with Karnataka State Emblem */}
      <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10 shrink-0">
        <img 
          src="/karnataka_emblem.png" 
          alt="Karnataka State Emblem" 
          className="w-8 h-8 object-contain" 
        />
      </div>

      {/* Title & Badge */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold tracking-wider text-amber-500 uppercase">
            GOVERNMENT OF KARNATAKA
          </span>
          <span className="bg-blue-600/20 border border-blue-500/30 text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            KA-AI CRIME PORTAL
          </span>
        </div>
        <h1 className="text-xl font-black text-white tracking-tight uppercase leading-tight mt-0.5">
          {title}
        </h1>
      </div>
    </div>
  );
};


