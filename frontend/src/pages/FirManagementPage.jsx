import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Shield,
  MapPin,
  Calendar,
  X
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { useCrimeData } from '../hooks/useCrimeData';
import { KARNATAKA_DISTRICTS, CRIME_CATEGORIES, FIR_STATUSES } from '../utils/constants';
import { exportToCSV } from '../services/exportService';
import { formatDate } from '../utils/formatters';

export const FirManagementPage = () => {
  const { searchFilter } = useOutletContext() || { searchFilter: '' };
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCrimeType, setSelectedCrimeType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [localSearch, setLocalSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFirModal, setSelectedFirModal] = useState(null);

  const pageSize = 12;
  const { firs, loading } = useCrimeData();

  const querySearch = localSearch || searchFilter;

  const filteredFirs = useMemo(() => {
    return firs.filter(item => {
      const matchDistrict = selectedDistrict === 'All' || item.District === selectedDistrict;
      const matchCrime = selectedCrimeType === 'All' || item.Crime_Type === selectedCrimeType;
      const matchStatus = selectedStatus === 'All' || item.Status === selectedStatus;
      const matchSearch = !querySearch ||
        item.FIR_Number?.toLowerCase().includes(querySearch.toLowerCase()) ||
        item.District?.toLowerCase().includes(querySearch.toLowerCase()) ||
        item.Police_Station?.toLowerCase().includes(querySearch.toLowerCase()) ||
        item.Crime_Type?.toLowerCase().includes(querySearch.toLowerCase()) ||
        item.IPC_Sections?.toLowerCase().includes(querySearch.toLowerCase());

      return matchDistrict && matchCrime && matchStatus && matchSearch;
    });
  }, [firs, selectedDistrict, selectedCrimeType, selectedStatus, querySearch]);

  const totalPages = Math.ceil(filteredFirs.length / pageSize) || 1;
  const paginatedFirs = filteredFirs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCSV = () => {
    exportToCSV(filteredFirs, `Karnataka_FIR_Registry_${selectedDistrict}.csv`);
  };

  if (loading) return <LoadingSkeleton count={6} height="h-28" />;

  return (
    <div className="space-y-6">
      {/* Top Controls & Multi-Filters */}
      <div className="gov-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-[#334155]">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              FIR Registry Management
            </h3>
            <p className="text-[11px] text-slate-400">Search and filter active First Information Reports across Karnataka</p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
          >
            <Download className="w-4 h-4" />
            Export Filtered CSV
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search FIR, IPC, Station..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0F172A] border border-[#334155] text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* District Dropdown */}
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0F172A] border border-[#334155] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="All">All Districts ({KARNATAKA_DISTRICTS.length})</option>
            {KARNATAKA_DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Crime Category */}
          <select
            value={selectedCrimeType}
            onChange={(e) => {
              setSelectedCrimeType(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0F172A] border border-[#334155] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="All">All Crime Types</option>
            {CRIME_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0F172A] border border-[#334155] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="All">All Statuses</option>
            {FIR_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main FIR Table */}
      <div className="gov-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#334155] text-slate-400 uppercase text-[10px] tracking-wider bg-[#0F172A]/50">
                <th className="py-3 px-4">FIR Number</th>
                <th className="py-3 px-4">Crime Offense</th>
                <th className="py-3 px-4">IPC Sections</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Police Station</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/60 text-slate-300">
              {paginatedFirs.length > 0 ? (
                paginatedFirs.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#0F172A]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{row.FIR_Number}</td>
                    <td className="py-3.5 px-4 font-semibold text-white max-w-xs truncate">{row.Crime_Type}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-amber-400">{row.IPC_Sections || 'N/A'}</td>
                    <td className="py-3.5 px-4">{row.District}</td>
                    <td className="py-3.5 px-4 text-slate-400">{row.Police_Station}</td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(row.Date)}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={row.Status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedFirModal(row)}
                        className="px-3 py-1 bg-slate-700/60 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors border border-slate-600/50"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No matching FIR records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 pt-4 border-t border-[#334155] flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-bold">{Math.min(filteredFirs.length, (currentPage - 1) * pageSize + 1)}</span> to{' '}
            <span className="text-white font-bold">{Math.min(filteredFirs.length, currentPage * pageSize)}</span> of{' '}
            <span className="text-white font-bold">{filteredFirs.length}</span> FIRs
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 rounded-lg bg-[#0F172A] border border-[#334155] hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-2 rounded-lg bg-[#0F172A] border border-[#334155] hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FIR Detail Modal */}
      {selectedFirModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedFirModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-[#334155]">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">OFFICIAL FIR DOSSIER</div>
                <h3 className="text-lg font-black text-white font-mono">{selectedFirModal.FIR_Number}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#0F172A] p-3 rounded-xl border border-[#334155]">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Crime Type</span>
                <span className="font-semibold text-white mt-1 block">{selectedFirModal.Crime_Type}</span>
              </div>
              <div className="bg-[#0F172A] p-3 rounded-xl border border-[#334155]">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">IPC Sections</span>
                <span className="font-semibold text-amber-400 mt-1 block font-mono">{selectedFirModal.IPC_Sections}</span>
              </div>
              <div className="bg-[#0F172A] p-3 rounded-xl border border-[#334155]">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">District</span>
                <span className="font-semibold text-white mt-1 block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" /> {selectedFirModal.District}
                </span>
              </div>
              <div className="bg-[#0F172A] p-3 rounded-xl border border-[#334155]">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Police Station</span>
                <span className="font-semibold text-slate-200 mt-1 block">{selectedFirModal.Police_Station}</span>
              </div>
              <div className="bg-[#0F172A] p-3 rounded-xl border border-[#334155]">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Date Registered</span>
                <span className="font-semibold text-slate-200 mt-1 block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-400" /> {formatDate(selectedFirModal.Date)}
                </span>
              </div>
              <div className="bg-[#0F172A] p-3 rounded-xl border border-[#334155]">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Investigation Status</span>
                <div className="mt-1">
                  <StatusBadge status={selectedFirModal.Status} />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">AI Crime Risk Assessment</span>
              <div className="flex items-center justify-between text-slate-300">
                <span>Prediction Flag: <strong className="text-amber-400">{selectedFirModal.Prediction_Flag || 'Standard Monitoring'}</strong></span>
                <span>Confidence: <strong className="text-emerald-400">{selectedFirModal.AI_Confidence || 94.2}%</strong></span>
              </div>
            </div>

            <button
              onClick={() => setSelectedFirModal(null)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
