import React from 'react';

export const LoadingSkeleton = ({ count = 4, height = "h-32" }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`gov-card p-5 animate-pulse ${height} flex flex-col justify-between`}>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-slate-700/60 rounded w-1/2"></div>
            <div className="w-10 h-10 bg-slate-700/60 rounded-xl"></div>
          </div>
          <div className="h-8 bg-slate-700/80 rounded w-3/4"></div>
          <div className="h-3 bg-slate-700/40 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );
};
