import React from 'react';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-6 shadow-2xl shadow-rose-500/10">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <span className="bg-rose-500/20 text-rose-400 font-extrabold text-xs px-3 py-1 rounded-full border border-rose-500/30 uppercase tracking-widest mb-3">
        404 - RESTRICTED ACCESS / NOT FOUND
      </span>

      <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
        Invalid Portal Resource
      </h1>

      <p className="text-slate-400 max-w-md text-sm mb-8">
        The requested URL path does not exist on the official Karnataka Police CrimeGuard AI portal server.
      </p>

      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Home className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
