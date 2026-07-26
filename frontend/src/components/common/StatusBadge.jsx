import React from 'react';

export const StatusBadge = ({ status }) => {
  let badgeStyle = "bg-slate-700/50 text-slate-300 border-slate-600";

  switch (status?.toLowerCase()) {
    case 'investigating':
    case 'on duty':
      badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/30";
      break;
    case 'solved':
    case 'active':
    case 'closed':
      badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      break;
    case 'pending':
    case 'leave':
      badgeStyle = "bg-rose-500/10 text-rose-400 border-rose-500/30";
      break;
    case 'critical':
    case 'high risk':
      badgeStyle = "bg-red-600/20 text-red-400 border-red-500/40 font-black tracking-wider uppercase";
      break;
    default:
      badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/30";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status}
    </span>
  );
};
