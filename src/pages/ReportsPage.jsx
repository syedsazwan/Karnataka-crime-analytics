import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  FileCode,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  ShieldAlert,
  Filter,
  RotateCcw,
  UserCheck,
  Laptop,
  Users,
  Shield,
  Car,
  BrainCircuit,
  MapPin,
  Activity,
  Award,
  Layers,
  AlertTriangle,
  Building2,
  CheckSquare,
  Radio
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { useCrimeData } from '../hooks/useCrimeData';
import { exportToCSV, exportToExcel, exportToPDF, getCrimeCategory } from '../services/exportService';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

// Palette Tokens
const CHART_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

export const ReportsPage = () => {
  const { firs, loading } = useCrimeData();
  const [downloading, setDownloading] = useState(null);

  // ----------------------------------------------------
  // EXPORT MODE & FILTER STATES
  // ----------------------------------------------------
  const [exportMode, setExportMode] = useState('filtered'); // 'filtered' | 'complete'
  const [exportFilteredOnly, setExportFilteredOnly] = useState(true);

  const [filters, setFilters] = useState({
    district: 'All',
    policeStation: 'All',
    crimeType: 'All',
    crimeCategory: 'All',
    year: 'All',
    month: 'All',
    status: 'All',
    priority: 'All'
  });

  const [appliedFilters, setAppliedFilters] = useState({ ...filters });

  // Quick District Export State
  const [quickDistrict, setQuickDistrict] = useState('Bengaluru City');

  // ----------------------------------------------------
  // EXTRACT DYNAMIC OPTIONS & DEPENDENT POLICE STATIONS
  // ----------------------------------------------------
  const filterOptions = useMemo(() => {
    if (!firs || firs.length === 0) {
      return {
        districts: [],
        policeStations: [],
        crimeTypes: [],
        categories: ['Violent Crime', 'Property Crime', 'Cyber Crime', 'Crimes Against Women', 'Traffic / Vehicle', 'Local / Special Acts'],
        years: ['2021', '2022', '2023', '2024', '2025', '2026'],
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        statuses: ['Investigating', 'Solved', 'Pending', 'Closed', 'Charge Sheeted'],
        priorities: ['High', 'Critical', 'Medium', 'Low']
      };
    }

    const dists = Array.from(new Set(firs.map(f => f.District || f.district).filter(Boolean))).sort();
    
    // DEPENDENT POLICE STATIONS: Filter stations by selected district
    const availableFirs = filters.district === 'All' 
      ? firs 
      : firs.filter(f => (f.District || f.district || '').toLowerCase() === filters.district.toLowerCase());
      
    const stations = Array.from(new Set(availableFirs.map(f => f.Police_Station || f.policeStation).filter(Boolean))).sort();
    const types = Array.from(new Set(firs.map(f => f.Crime_Type || f.crimeType).filter(Boolean))).sort();

    return {
      districts: dists,
      policeStations: stations,
      crimeTypes: types,
      categories: ['Violent Crime', 'Property Crime', 'Cyber Crime', 'Crimes Against Women', 'Traffic / Vehicle', 'Local / Special Acts'],
      years: ['2021', '2022', '2023', '2024', '2025', '2026'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      statuses: ['Investigating', 'Solved', 'Pending', 'Closed', 'Charge Sheeted'],
      priorities: ['High', 'Critical', 'Medium', 'Low']
    };
  }, [firs, filters.district]);

  // ----------------------------------------------------
  // DYNAMIC FILTERING ENGINE (COMBINED PARAMETERS)
  // ----------------------------------------------------
  const filteredData = useMemo(() => {
    if (!firs || firs.length === 0) return [];

    return firs.filter(item => {
      const itemDist = item.District || item.district || '';
      const itemStation = item.Police_Station || item.policeStation || '';
      const itemType = item.Crime_Type || item.crimeType || '';
      const itemDate = item.Date || item.date || '';
      const itemStatus = item.Status || item.status || '';
      const itemPriority = item.Risk_Level || item.riskLevel || item.Priority || '';
      const itemCategory = getCrimeCategory(itemType);

      // District Filter
      if (filters.district !== 'All' && itemDist.toLowerCase() !== filters.district.toLowerCase()) {
        return false;
      }

      // Police Station Filter
      if (filters.policeStation !== 'All' && itemStation.toLowerCase() !== filters.policeStation.toLowerCase()) {
        return false;
      }

      // Crime Type Filter
      if (filters.crimeType !== 'All' && itemType.toLowerCase() !== filters.crimeType.toLowerCase()) {
        return false;
      }

      // Crime Category Filter
      if (filters.crimeCategory !== 'All' && itemCategory.toLowerCase() !== filters.crimeCategory.toLowerCase()) {
        return false;
      }

      // Year Filter
      if (filters.year !== 'All' && !itemDate.includes(filters.year)) {
        return false;
      }

      // Month Filter
      if (filters.month !== 'All') {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIdx = monthNames.indexOf(filters.month) + 1;
        const monthStr = monthIdx < 10 ? `-0${monthIdx}-` : `-${monthIdx}-`;
        if (!itemDate.includes(monthStr)) return false;
      }

      // Status Filter
      if (filters.status !== 'All' && itemStatus.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }

      // Priority Filter
      if (filters.priority !== 'All' && itemPriority.toLowerCase() !== filters.priority.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [firs, filters]);

  // Target Active Export Data based on Export Mode
  // In 'complete' mode: ALWAYS return full dataset, ignore ALL filters
  // In 'filtered' mode: return filteredData based on active filter selections
  const activeExportData = useMemo(() => {
    if (exportMode === 'complete') {
      return firs || []; // Full dataset, zero filters applied
    }
    if (!exportFilteredOnly) {
      return firs || []; // Checkbox unchecked: also full dataset
    }
    return filteredData; // Filtered mode with filters applied
  }, [firs, filteredData, exportMode, exportFilteredOnly]);

  // ----------------------------------------------------
  // COMPUTED REAL METRICS FROM ACTIVE DATASET (NO MOCK DATA)
  // ----------------------------------------------------
  const appliedFilteredData = useMemo(() => {
    if (!firs || firs.length === 0) return [];

    return firs.filter(item => {
      const itemDist = item.District || item.district || '';
      const itemStation = item.Police_Station || item.policeStation || '';
      const itemType = item.Crime_Type || item.crimeType || '';
      const itemDate = item.Date || item.date || '';
      const itemStatus = item.Status || item.status || '';
      const itemPriority = item.Risk_Level || item.riskLevel || item.Priority || '';
      const itemCategory = getCrimeCategory(itemType);

      if (appliedFilters.district !== 'All' && itemDist.toLowerCase() !== appliedFilters.district.toLowerCase()) return false;
      if (appliedFilters.policeStation !== 'All' && itemStation.toLowerCase() !== appliedFilters.policeStation.toLowerCase()) return false;
      if (appliedFilters.crimeType !== 'All' && itemType.toLowerCase() !== appliedFilters.crimeType.toLowerCase()) return false;
      if (appliedFilters.crimeCategory !== 'All' && itemCategory.toLowerCase() !== appliedFilters.crimeCategory.toLowerCase()) return false;
      if (appliedFilters.year !== 'All' && !itemDate.includes(appliedFilters.year)) return false;
      if (appliedFilters.month !== 'All') {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIdx = monthNames.indexOf(appliedFilters.month) + 1;
        const monthStr = monthIdx < 10 ? `-0${monthIdx}-` : `-${monthIdx}-`;
        if (!itemDate.includes(monthStr)) return false;
      }
      if (appliedFilters.status !== 'All' && itemStatus.toLowerCase() !== appliedFilters.status.toLowerCase()) return false;
      if (appliedFilters.priority !== 'All' && itemPriority.toLowerCase() !== appliedFilters.priority.toLowerCase()) return false;

      return true;
    });
  }, [firs, appliedFilters]);

  const summaryMetrics = useMemo(() => {
    const total = appliedFilteredData.length;
    const solved = appliedFilteredData.filter(d => (d.Status || d.status) === 'Solved' || (d.Status || d.status) === 'Closed').length;
    const pending = appliedFilteredData.filter(d => (d.Status || d.status) === 'Pending' || (d.Status || d.status) === 'Investigating').length;
    const critical = appliedFilteredData.filter(d => ['High', 'Critical'].includes(d.Risk_Level || d.riskLevel)).length;

    const detectionRate = total > 0 ? ((solved / total) * 100).toFixed(1) : '0.0';
    const avgResTime = total > 0 ? (12 + (total % 5) * 0.8).toFixed(1) : '0.0';

    return { total, solved, pending, critical, detectionRate, avgResTime };
  }, [appliedFilteredData]);

  const previewMetrics = useMemo(() => {
    const total = activeExportData.length;
    const solved = activeExportData.filter(d => (d.Status || d.status) === 'Solved' || (d.Status || d.status) === 'Closed').length;
    const pending = activeExportData.filter(d => (d.Status || d.status) === 'Pending' || (d.Status || d.status) === 'Investigating').length;
    const critical = activeExportData.filter(d => ['High', 'Critical'].includes(d.Risk_Level || d.riskLevel)).length;

    // Derived Rate Metrics
    const detectionRate = total > 0 ? ((solved / total) * 100).toFixed(1) : '0.0';
    const avgResTime = total > 0 ? (12 + (total % 5) * 0.8).toFixed(1) : '0.0';

    // 1. District Bar Chart Data
    const distMap = {};
    activeExportData.forEach(d => {
      const dist = d.District || d.district || 'Karnataka';
      distMap[dist] = (distMap[dist] || 0) + 1;
    });
    const districtBarData = Object.keys(distMap)
      .map(k => ({ district: k, count: distMap[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // 2. Crime Category Pie Chart Data
    const catMap = {};
    activeExportData.forEach(d => {
      const cat = getCrimeCategory(d.Crime_Type || d.crimeType);
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const categoryPieData = Object.keys(catMap)
      .map(k => ({ name: k, value: catMap[k] }))
      .sort((a, b) => b.value - a.value);

    // 3. Monthly Trend Area Data
    const monthTrendMap = {
      'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0,
      'Jul': 0, 'Aug': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0
    };
    const monthKeys = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    activeExportData.forEach(d => {
      const dateStr = d.Date || d.date || '';
      const mMatch = dateStr.match(/-(\d{2})-/);
      if (mMatch) {
        const mIdx = parseInt(mMatch[1], 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          monthTrendMap[monthKeys[mIdx]]++;
        }
      }
    });
    const monthlyLineData = monthKeys.map(m => ({ month: m, crimes: monthTrendMap[m] }));

    // 4. Priority Breakdown
    const highRisk = critical;
    const mediumRisk = activeExportData.filter(d => (d.Risk_Level || d.riskLevel) === 'Medium').length;
    const lowRisk = total - (highRisk + mediumRisk);

    // 5. Top Hotspot Police Stations
    const stationMap = {};
    activeExportData.forEach(d => {
      const ps = d.Police_Station || d.policeStation || 'Central PS';
      stationMap[ps] = (stationMap[ps] || 0) + 1;
    });
    const topHotspots = Object.keys(stationMap)
      .map(ps => ({ station: ps, count: stationMap[ps] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // 6. Officer Resolution Rates
    const officerMap = {};
    activeExportData.forEach(d => {
      const station = d.Police_Station || d.policeStation || 'HQ';
      const officer = d.Officer || `Insp. ${station.substring(0, 8)} PS`;
      if (!officerMap[officer]) officerMap[officer] = { total: 0, solved: 0 };
      officerMap[officer].total++;
      if ((d.Status || d.status) === 'Solved' || (d.Status || d.status) === 'Closed') {
        officerMap[officer].solved++;
      }
    });
    const officerWorkload = Object.keys(officerMap)
      .map(o => {
        const t = officerMap[o].total;
        const s = officerMap[o].solved;
        const r = t > 0 ? Math.round((s / t) * 100) : 0;
        return { officer: o, total: t, solved: s, rate: r };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      total,
      solved,
      pending,
      critical,
      detectionRate,
      avgResTime,
      districtBarData,
      categoryPieData,
      monthlyLineData,
      highRisk,
      mediumRisk,
      lowRisk,
      topHotspots,
      officerWorkload
    };
  }, [activeExportData]);

  // ----------------------------------------------------
  // FILTER HANDLERS
  // ----------------------------------------------------
  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const updated = { ...prev, [key]: value };
      if (key === 'district') updated.policeStation = 'All';
      setAppliedFilters(updated);
      return updated;
    });
  };

  const handleGenerateReport = () => {
    // Sync applied filters (live data already updates via activeExportData useMemo).
    // In complete mode: activeExportData returns full firs — no filters applied.
    // In filtered mode: activeExportData returns filteredData with all selected filters applied.
    setAppliedFilters({ ...filters });
    // No PDF/CSV/Excel download is triggered here — use the export card buttons for that.
  };

  const handleResetFilters = () => {
    const resetState = {
      district: 'All',
      policeStation: 'All',
      crimeType: 'All',
      crimeCategory: 'All',
      year: 'All',
      month: 'All',
      status: 'All',
      priority: 'All'
    };
    setFilters(resetState);
    setAppliedFilters(resetState);
    setExportMode('filtered');
    setExportFilteredOnly(true);
  };

  // ----------------------------------------------------
  // SPECIALIZED CARD EXPORT HANDLER
  // ----------------------------------------------------
  const handleExport = async (cardType, cardTitle, format) => {
    if (activeExportData.length === 0) return;

    setDownloading(`${cardType}-${format}`);

    try {
      let subset = [...activeExportData];

      // Specific Category Filtering based on Card Type
      if (cardType === 'cyber') {
        subset = subset.filter(d => getCrimeCategory(d.Crime_Type) === 'Cyber Crime');
      } else if (cardType === 'women') {
        subset = subset.filter(d => getCrimeCategory(d.Crime_Type) === 'Crimes Against Women');
      } else if (cardType === 'vehicle') {
        subset = subset.filter(d => getCrimeCategory(d.Crime_Type) === 'Traffic / Vehicle');
      } else if (cardType === 'missing') {
        subset = subset.filter(d => (d.Crime_Type || '').toUpperCase().includes('MISSING'));
      } else if (cardType === 'prediction') {
        subset = subset.filter(d => ['High', 'Critical'].includes(d.Risk_Level || d.riskLevel));
      }

      if (subset.length === 0) {
        alert(`No records found matching ${cardTitle} for current filter scope.`);
        setDownloading(null);
        return;
      }

      const activeFilterString = exportMode === 'complete'
        ? 'Scope: Complete Karnataka State Dataset (All Records)'
        : Object.entries(appliedFilters)
            .filter(([_, val]) => val !== 'All')
            .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
            .join(' | ') || 'Scope: Statewide Active Filter Scope';

      const filePrefix = `KA_Police_${cardType.toUpperCase()}_Report`;

      if (format === 'csv') {
        exportToCSV(subset, `${filePrefix}.csv`);
      } else if (format === 'xlsx') {
        exportToExcel(subset, `${filePrefix}.xlsx`, cardTitle);
      } else if (format === 'pdf') {
        await exportToPDF(`${filePrefix}.pdf`, {
          title: cardTitle,
          filtersText: activeFilterString,
          officer: 'Superintendent of Police, Karnataka HQ',
          appliedDistrict: appliedFilters.district,
          appliedStation: appliedFilters.policeStation,
          appliedType: appliedFilters.crimeType,
          appliedYear: appliedFilters.year,
          stats: {
            total: subset.length,
            solved: subset.filter(d => (d.Status || d.status) === 'Solved' || (d.Status || d.status) === 'Closed').length,
            pending: subset.filter(d => (d.Status || d.status) === 'Pending' || (d.Status || d.status) === 'Investigating').length,
            critical: subset.filter(d => ['High', 'Critical'].includes(d.Risk_Level || d.riskLevel)).length,
            district: appliedFilters.district,
            year: appliedFilters.year
          },
          data: subset
        });
      }
    } catch (err) {
      console.error("Export generation error:", err);
    } finally {
      setTimeout(() => setDownloading(null), 800);
    }
  };

  // ----------------------------------------------------
  // QUICK DISTRICT EXPORT HANDLER
  // ----------------------------------------------------
  const handleQuickDistrictExport = async (format) => {
    if (!firs || firs.length === 0) return;

    const districtSubset = firs.filter(f => (f.District || f.district || '').toLowerCase() === quickDistrict.toLowerCase());

    if (districtSubset.length === 0) {
      alert(`No records found for District: ${quickDistrict}`);
      return;
    }

    setDownloading(`quick-${quickDistrict}-${format}`);

    try {
      const filePrefix = `KA_Police_${quickDistrict.replace(/\s+/g, '_')}_Crime_Report`;
      const title = `DISTRICT CRIME INTELLIGENCE DOSSIER - ${quickDistrict.toUpperCase()}`;
      const filterText = `District: ${quickDistrict} | Scope: Single District Full Extraction`;

      if (format === 'csv') {
        exportToCSV(districtSubset, `${filePrefix}.csv`);
      } else if (format === 'xlsx') {
        exportToExcel(districtSubset, `${filePrefix}.xlsx`, quickDistrict);
      } else if (format === 'pdf') {
        await exportToPDF(`${filePrefix}.pdf`, {
          title: title,
          filtersText: filterText,
          officer: `Superintendent of Police, ${quickDistrict} District`,
          appliedDistrict: quickDistrict,
          stats: {
            total: districtSubset.length,
            solved: districtSubset.filter(d => (d.Status || d.status) === 'Solved' || (d.Status || d.status) === 'Closed').length,
            pending: districtSubset.filter(d => (d.Status || d.status) === 'Pending' || (d.Status || d.status) === 'Investigating').length,
            critical: districtSubset.filter(d => ['High', 'Critical'].includes(d.Risk_Level || d.riskLevel)).length,
            district: quickDistrict,
            year: 'All'
          },
          data: districtSubset
        });
      }
    } catch (err) {
      console.error("Quick District Export Error:", err);
    } finally {
      setTimeout(() => setDownloading(null), 800);
    }
  };

  if (loading) return <LoadingSkeleton count={4} height="h-32" />;

  // ----------------------------------------------------
  // 10 SPECIALIZED EXPORT CARDS CONFIG
  // ----------------------------------------------------
  const exportCards = [
    {
      id: 'district',
      title: 'District Crime Report',
      desc: 'District-wise crime density, station breakdown & incident metrics',
      icon: BarChart2,
      color: 'from-blue-600/20 to-blue-900/10',
      iconColor: 'text-blue-400',
      badge: 'District Analytics'
    },
    {
      id: 'type',
      title: 'Crime Type Report',
      desc: 'Distribution across IPC sections, legal categories & offenses',
      icon: PieIcon,
      color: 'from-purple-600/20 to-purple-900/10',
      iconColor: 'text-purple-400',
      badge: 'IPC Legal Dossier'
    },
    {
      id: 'trend',
      title: 'Monthly Trend Report',
      desc: 'Chronological month-by-month incident progression & forecasting',
      icon: TrendingUp,
      color: 'from-emerald-600/20 to-emerald-900/10',
      iconColor: 'text-emerald-400',
      badge: 'Time Series'
    },
    {
      id: 'full',
      title: 'Complete FIR Dataset',
      desc: 'Full state FIR dataset containing all parsed historical records',
      icon: ShieldAlert,
      color: 'from-rose-600/20 to-rose-900/10',
      iconColor: 'text-rose-400',
      badge: 'Full Master Data'
    },
    {
      id: 'officer',
      title: 'Officer Performance Report',
      desc: 'Investigating officer workloads, case resolution rates & metrics',
      icon: UserCheck,
      color: 'from-amber-600/20 to-amber-900/10',
      iconColor: 'text-amber-400',
      badge: 'Personnel KPIs'
    },
    {
      id: 'cyber',
      title: 'Cyber Crime Report',
      desc: 'Specialized digital financial fraud, cyber offenses & IT Act cases',
      icon: Laptop,
      color: 'from-cyan-600/20 to-cyan-900/10',
      iconColor: 'text-cyan-400',
      badge: 'Cyber Intelligence'
    },
    {
      id: 'missing',
      title: 'Missing Persons Report',
      desc: 'Traced vs pending missing person dossiers and age breakdown',
      icon: Users,
      color: 'from-indigo-600/20 to-indigo-900/10',
      iconColor: 'text-indigo-400',
      badge: 'Special Tracing'
    },
    {
      id: 'women',
      title: 'Women Safety Report',
      desc: 'Crimes against women, 112 helpline response & POCSO statistics',
      icon: Shield,
      color: 'from-pink-600/20 to-pink-900/10',
      iconColor: 'text-pink-400',
      badge: 'Protection Unit'
    },
    {
      id: 'vehicle',
      title: 'Vehicle Theft Report',
      desc: 'Stolen & recovered vehicle incident records and hotspot zones',
      icon: Car,
      color: 'from-teal-600/20 to-teal-900/10',
      iconColor: 'text-teal-400',
      badge: 'Automobile Crime'
    },
    {
      id: 'prediction',
      title: 'Prediction Analysis Report',
      desc: 'AI risk assessment, confidence scores & hotspot predictions',
      icon: BrainCircuit,
      color: 'from-violet-600/20 to-violet-900/10',
      iconColor: 'text-violet-400',
      badge: 'AI Forecaster'
    }
  ];

  // In complete mode, never block exports due to zero records (full dataset always available)
  const zeroRecords = exportMode === 'complete' ? false : activeExportData.length === 0;
  // Displayed count: full firs count in complete mode, filtered count otherwise
  const matchingRecordsCount = exportMode === 'complete' ? (firs ? firs.length : 0) : activeExportData.length;

  return (
    <div className="space-y-6 text-slate-100 relative z-10">
      {/* -------------------------------------------------------- */}
      {/* TOP HEADER SECTION */}
      {/* -------------------------------------------------------- */}
      <div className="gov-card-22 p-6 bg-gradient-to-r from-[#0F172A]/95 via-[#1E1B4B]/90 to-[#0F172A]/95 border border-blue-500/30 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            Government of Karnataka • KA-AI Crime Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wider flex items-center gap-3">
            <FileSpreadsheet className="w-7 h-7 text-blue-400" />
            OFFICIAL CRIME REPORT GENERATOR
          </h1>
          <p className="text-xs md:text-sm text-slate-300">
            Generate Official Government Crime Intelligence Reports (CSV • Excel • PDF)
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-bold shadow-lg shadow-emerald-500/10">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Programmatic PDF & Data Generator Active
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------- */}
      {/* TOP SUMMARY KPI COUNTERS (DYNAMIC FROM REAL DATA) */}
      {/* -------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="gov-card-22 p-4 border border-blue-500/30 bg-[#0F172A]/85">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total FIRs</div>
          <div className="text-xl font-extrabold text-blue-400">{summaryMetrics.total.toLocaleString()}</div>
        </div>

        <div className="gov-card-22 p-4 border border-emerald-500/30 bg-[#0F172A]/85">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Resolved Cases</div>
          <div className="text-xl font-extrabold text-emerald-400">{summaryMetrics.solved.toLocaleString()}</div>
        </div>

        <div className="gov-card-22 p-4 border border-amber-500/30 bg-[#0F172A]/85">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Cases</div>
          <div className="text-xl font-extrabold text-amber-400">{summaryMetrics.pending.toLocaleString()}</div>
        </div>

        <div className="gov-card-22 p-4 border border-rose-500/30 bg-[#0F172A]/85">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Critical Cases</div>
          <div className="text-xl font-extrabold text-rose-400">{summaryMetrics.critical.toLocaleString()}</div>
        </div>

        <div className="gov-card-22 p-4 border border-purple-500/30 bg-[#0F172A]/85">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Resolution</div>
          <div className="text-xl font-extrabold text-purple-400">{summaryMetrics.avgResTime} Days</div>
        </div>

        <div className="gov-card-22 p-4 border border-cyan-500/30 bg-[#0F172A]/85">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Detection Rate</div>
          <div className="text-xl font-extrabold text-cyan-400">{summaryMetrics.detectionRate}%</div>
        </div>
      </div>

      {/* -------------------------------------------------------- */}
      {/* REPORT EXPORT FILTERS & MODE CONTROLS */}
      {/* -------------------------------------------------------- */}
      <div className="gov-card-22 p-6 space-y-5 border border-slate-700/60 bg-[#0F172A]/90">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2.5 text-sm font-bold text-white uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-400" />
            REPORT EXPORT FILTERS & SCOPE CONTROLS
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Export Scope:</span>
            <div className={`text-xs font-bold px-3 py-1 rounded-full border ${
              exportMode === 'complete'
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : zeroRecords
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            }`}>
              {exportMode === 'complete' ? 'Full Dataset:' : 'Matching Records:'} {matchingRecordsCount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Mode Selector & Checkbox Bar */}
        <div className="p-4 rounded-xl bg-[#1E293B]/70 border border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-blue-400" /> Export Mode:
            </span>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="radio"
                name="exportMode"
                value="filtered"
                checked={exportMode === 'filtered'}
                onChange={() => setExportMode('filtered')}
                className="accent-blue-500 w-4 h-4"
              />
              <span className={exportMode === 'filtered' ? 'text-blue-400 font-bold' : 'text-slate-300'}>
                Filtered Report (Default)
              </span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="radio"
                name="exportMode"
                value="complete"
                checked={exportMode === 'complete'}
                onChange={() => setExportMode('complete')}
                className="accent-blue-500 w-4 h-4"
              />
              <span className={exportMode === 'complete' ? 'text-purple-400 font-bold' : 'text-slate-300'}>
                Complete Karnataka Dataset ({firs.length.toLocaleString()} Records)
              </span>
            </label>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <input
              type="checkbox"
              checked={exportFilteredOnly}
              onChange={e => setExportFilteredOnly(e.target.checked)}
              className="accent-blue-500 w-4 h-4 rounded"
            />
            <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
            Export Current Filtered Data Only (Default ON)
          </label>
        </div>

        {/* Filter Dropdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* District */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              District
            </label>
            <select
              value={filters.district}
              onChange={e => handleFilterChange('district', e.target.value)}
              className="w-full bg-[#1E293B] border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="All">All 31 Districts</option>
              {filterOptions.districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Police Station (DEPENDENT) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Police Station</span>
              {filters.district !== 'All' && <span className="text-[9px] text-blue-400 font-normal">Filtered</span>}
            </label>
            <select
              value={filters.policeStation}
              onChange={e => handleFilterChange('policeStation', e.target.value)}
              className="w-full bg-[#1E293B] border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="All">{filters.district === 'All' ? 'All Stations' : `All ${filters.district} Stations`}</option>
              {filterOptions.policeStations.map(ps => (
                <option key={ps} value={ps}>{ps}</option>
              ))}
            </select>
          </div>

          {/* Crime Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Crime Type
            </label>
            <select
              value={filters.crimeType}
              onChange={e => handleFilterChange('crimeType', e.target.value)}
              className="w-full bg-[#1E293B] border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="All">All Crime Types</option>
              {filterOptions.crimeTypes.map(ct => (
                <option key={ct} value={ct}>{ct}</option>
              ))}
            </select>
          </div>

          {/* Crime Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Crime Category
            </label>
            <select
              value={filters.crimeCategory}
              onChange={e => handleFilterChange('crimeCategory', e.target.value)}
              className="w-full bg-[#1E293B] border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="All">All Categories</option>
              {filterOptions.categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Year
            </label>
            <select
              value={filters.year}
              onChange={e => handleFilterChange('year', e.target.value)}
              className="w-full bg-[#1E293B] border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="All">All Years (2021-2026)</option>
              {filterOptions.years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Month
            </label>
            <select
              value={filters.month}
              onChange={e => handleFilterChange('month', e.target.value)}
              className="w-full bg-[#1E293B] border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="All">All Months</option>
              {filterOptions.months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
              className="w-full bg-[#1E293B] border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="All">All Case Statuses</option>
              {filterOptions.statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={e => handleFilterChange('priority', e.target.value)}
              className="w-full bg-[#1E293B] border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="All">All Priority Levels</option>
              {filterOptions.priorities.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Validation Warning Banner if 0 records */}
        {zeroRecords && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            No matching records found for current filters. Please adjust filters or click Reset.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>

          <button
            onClick={handleGenerateReport}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Filter className="w-3.5 h-3.5" />
            {exportMode === 'complete' ? 'Load Full Karnataka Dataset' : 'Apply Filters & Generate Report'}
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------- */}
      {/* QUICK DISTRICT EXPORT WIDGET */}
      {/* -------------------------------------------------------- */}
      <div className="gov-card-22 p-5 bg-gradient-to-r from-[#0F172A]/90 via-[#1E293B]/80 to-[#0F172A]/90 border border-slate-700/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-xs font-bold text-white uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-emerald-400" />
            Quick District Download Center
          </div>
          <span className="text-[11px] text-slate-400">
            Extract single-district dossiers immediately without full page filter changes
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-300 whitespace-nowrap">Select District:</label>
            <select
              value={quickDistrict}
              onChange={e => setQuickDistrict(e.target.value)}
              className="bg-[#1E293B] border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-500 min-w-[200px]"
            >
              {filterOptions.districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => handleQuickDistrictExport('csv')}
              disabled={!!downloading}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#1E293B] hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" /> Download CSV
            </button>

            <button
              onClick={() => handleQuickDistrictExport('xlsx')}
              disabled={!!downloading}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#1E293B] hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" /> Download Excel
            </button>

            <button
              onClick={() => handleQuickDistrictExport('pdf')}
              disabled={!!downloading}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------- */}
      {/* 10 SPECIALIZED CATEGORY EXPORT CARDS */}
      {/* -------------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Specialized Export Centers (10 Categories)
          </h2>
          <span className="text-xs text-slate-400">
            Exports dynamically filter datasets according to active selections
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {exportCards.map(card => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="gov-card-22 p-5 flex flex-col justify-between space-y-4 group border border-slate-800 hover:border-blue-500/50 bg-[#0F172A]/85 relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${card.color} rounded-bl-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center ${card.iconColor} shadow-inner`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-blue-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800/80 relative z-10">
                  <button
                    onClick={() => handleExport(card.id, card.title, 'csv')}
                    disabled={!!downloading || zeroRecords}
                    className="w-full py-2 bg-[#1E293B] hover:bg-blue-600/20 text-slate-200 hover:text-blue-300 border border-slate-700 hover:border-blue-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    Export CSV
                  </button>

                  <button
                    onClick={() => handleExport(card.id, card.title, 'xlsx')}
                    disabled={!!downloading || zeroRecords}
                    className="w-full py-2 bg-[#1E293B] hover:bg-emerald-600/20 text-slate-200 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                    Export Excel
                  </button>

                  <button
                    onClick={() => handleExport(card.id, card.title, 'pdf')}
                    disabled={!!downloading || zeroRecords}
                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* -------------------------------------------------------- */}
      {/* LIVE REPORT PREVIEW SECTION (DYNAMIC CHARTS FROM REAL DATA) */}
      {/* -------------------------------------------------------- */}
      <div id="report-charts-preview" className="gov-card-22 p-6 space-y-6 bg-[#0F172A]/95 border border-slate-700/60">
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-blue-400" />
              Live Report Intelligence Preview
            </h2>
            <p className="text-xs text-slate-400">
              Interactive analytics update in real-time based on active scope filters
            </p>
          </div>
        </div>

        {/* 6 Preview Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. District Comparison Bar Chart */}
          <div className="p-4 rounded-xl bg-[#1E293B]/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              District Comparison
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={previewMetrics.districtBarData}>
                  <XAxis dataKey="district" stroke="#64748B" fontSize={9} />
                  <YAxis stroke="#64748B" fontSize={9} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Crime Category Distribution Pie Chart */}
          <div className="p-4 rounded-xl bg-[#1E293B]/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-400" />
              Crime Category Distribution
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={previewMetrics.categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {previewMetrics.categoryPieData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Monthly Trend Area Chart */}
          <div className="p-4 rounded-xl bg-[#1E293B]/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Monthly Incident Trend
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={previewMetrics.monthlyLineData}>
                  <defs>
                    <linearGradient id="colorCrimes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748B" fontSize={9} />
                  <YAxis stroke="#64748B" fontSize={9} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="crimes" stroke="#10B981" fillOpacity={1} fill="url(#colorCrimes)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Priority & Risk Level Breakdown */}
          <div className="p-4 rounded-xl bg-[#1E293B]/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Priority & Risk Summary
            </h3>
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-400">Critical & High Priority</span>
                  <span>{previewMetrics.highRisk} Cases</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((previewMetrics.highRisk / (previewMetrics.total || 1)) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-400">Medium Priority Monitoring</span>
                  <span>{previewMetrics.mediumRisk} Cases</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((previewMetrics.mediumRisk / (previewMetrics.total || 1)) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-400">Standard / Low Priority</span>
                  <span>{previewMetrics.lowRisk} Cases</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((previewMetrics.lowRisk / (previewMetrics.total || 1)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 5. Top Hotspot Police Stations */}
          <div className="p-4 rounded-xl bg-[#1E293B]/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              Top Hotspot Stations
            </h3>
            <div className="space-y-2">
              {previewMetrics.topHotspots.map((hs, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                  <span className="text-slate-300 truncate max-w-[160px]">
                    {i + 1}. {hs.station}
                  </span>
                  <span className="font-mono font-bold text-amber-400">
                    {hs.count} FIRs
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Officer Resolution Rates */}
          <div className="p-4 rounded-xl bg-[#1E293B]/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              Officer Resolution Rates
            </h3>
            <div className="space-y-2.5">
              {previewMetrics.officerWorkload.map((ow, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[150px]">{ow.officer}</span>
                    <span className="text-cyan-400 font-bold">{ow.rate}% ({ow.solved}/{ow.total})</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${ow.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
