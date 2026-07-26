import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import {
  Shield, Layers, Maximize2, Minimize2, Search,
  Activity, Flame, Zap, TrendingUp, FileText,
  ChevronUp, ChevronDown, Compass, BarChart2, Navigation
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar
} from 'recharts';
import { useCrimeData } from '../hooks/useCrimeData';
import { KARNATAKA_DISTRICTS, CRIME_CATEGORIES, MAP_CENTER_KARNATAKA, MAP_DEFAULT_ZOOM } from '../utils/constants';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { StationIntelligenceCard } from '../components/map/StationIntelligenceCard';
import { useNavigate } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// DISTRICT CENTROID LOOKUP TABLE
// ─────────────────────────────────────────────────────────────────────────────
const DISTRICT_CENTROIDS = {
  'Bagalkot': [16.1850, 75.6961],
  'Ballari (Bellary)': [15.1394, 76.9214],
  'Belagavi (Belgaum)': [15.8497, 74.4977],
  'Belagavi': [15.8497, 74.4977],
  'Bengaluru Rural': [13.2257, 77.5750],
  'Bengaluru Urban': [12.9716, 77.5946],
  'Bengaluru City': [12.9716, 77.5946],
  'Bidar': [17.9104, 77.5199],
  'Chamarajanagar': [11.9261, 76.9437],
  'Chikkamagaluru (Chikmagalur)': [13.3161, 75.7720],
  'Chikkamagaluru': [13.3161, 75.7720],
  'Chikkaballapura': [13.4355, 77.7279],
  'Chitradurga': [14.2251, 76.3980],
  'Dakshina Kannada': [12.8702, 74.8806],
  'Davanagere': [14.4644, 75.9218],
  'Dharwad': [15.4589, 75.0078],
  'Gadag': [15.4319, 75.6355],
  'Hassan': [13.0072, 76.1017],
  'Haveri': [14.7954, 75.4026],
  'Kalaburagi (Gulbarga)': [17.3297, 76.8343],
  'Kalaburagi': [17.3297, 76.8343],
  'Kodagu': [12.4244, 75.7382],
  'Kolar': [13.1367, 78.1291],
  'Koppal': [15.3524, 76.1558],
  'Mandya': [12.5218, 76.8951],
  'Mysuru (Mysore)': [12.2958, 76.6394],
  'Mysuru': [12.2958, 76.6394],
  'Raichur': [16.2076, 77.3463],
  'Ramanagara': [12.7150, 77.2813],
  'Shivamogga (Shimoga)': [13.9299, 75.5681],
  'Shivamogga': [13.9299, 75.5681],
  'Tumakuru (Tumkur)': [13.3379, 77.1173],
  'Tumakuru': [13.3379, 77.1173],
  'Udupi': [13.3409, 74.7421],
  'Uttara Kannada (Karwar)': [14.8000, 74.1300],
  'Uttara Kannada': [14.8000, 74.1300],
  'Vijayanagara': [15.2688, 76.3909],
  'Yadgir': [16.7700, 77.1300]
};

// ─────────────────────────────────────────────────────────────────────────────
// ICON FACTORIES
// ─────────────────────────────────────────────────────────────────────────────
const crimeDotIcon = L.divIcon({
  className: 'marker-fade-in',
  html: `<div class="dot-crime-hotspot"></div>`,
  iconSize: [12, 12], iconAnchor: [6, 6],
});

const aiPredictionDotIcon = L.divIcon({
  className: 'marker-fade-in',
  html: `<div class="dot-ai-prediction"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7],
});

// ─────────────────────────────────────────────────────────────────────────────
// CINEMATIC CAMERA TRACKER — 60 FPS easeInOutCubic Bezier arc flight
// ─────────────────────────────────────────────────────────────────────────────
const CinematicCameraTracker = ({ startCoords, endCoords, targetZoom = 10, duration = 2000, onComplete }) => {
  const map = useMap();
  const [currentPos, setCurrentPos] = useState(startCoords);
  const [isRippling, setIsRippling] = useState(false);
  // Guard: prevent onComplete from firing more than once
  const completedRef = useRef(false);

  useEffect(() => {
    if (!startCoords || !endCoords) return;
    completedRef.current = false;
    let startTime = null;
    let animFrameId = null;

    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const midLat = (startCoords[0] + endCoords[0]) / 2;
    const midLng = (startCoords[1] + endCoords[1]) / 2;
    const dx = endCoords[1] - startCoords[1];
    const dy = endCoords[0] - startCoords[0];
    const arcLat = midLat + (-dx * 0.12);
    const arcLng = midLng + (dy * 0.12);

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ep = easeInOutCubic(progress);

      const lat = (1 - ep) * (1 - ep) * startCoords[0] + 2 * (1 - ep) * ep * arcLat + ep * ep * endCoords[0];
      const lng = (1 - ep) * (1 - ep) * startCoords[1] + 2 * (1 - ep) * ep * arcLng + ep * ep * endCoords[1];

      try { map.panTo([lat, lng], { animate: false, duration: 0 }); } catch (_) {}
      setCurrentPos([lat, lng]);

      if (progress < 1) {
        animFrameId = requestAnimationFrame(animate);
      } else {
        if (completedRef.current) return;
        completedRef.current = true;
        setIsRippling(true);
        // Use setView (instant, no competing animation) to snap to final position + zoom
        try { map.setView(endCoords, targetZoom, { animate: true, duration: 0.5, easeLinearity: 0.25 }); } catch (_) {}
        setTimeout(() => {
          setIsRippling(false);
          if (onComplete) onComplete();
        }, 600);
      }
    };

    animFrameId = requestAnimationFrame(animate);
    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [startCoords, endCoords, targetZoom, duration, map, onComplete]);

  if (!currentPos) return null;
  return (
    <Marker
      position={currentPos}
      icon={L.divIcon({
        className: '',
        html: `<div class="cinematic-nav-dot ${isRippling ? 'ripple-wave' : ''}"><div class="cinematic-nav-dot-inner"></div></div>`,
        iconSize: [22, 22], iconAnchor: [11, 11],
      })}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAP LAYER MANAGER
// Single imperative controller for ALL map layers:
//   Zoom 7-8:  Cluster badges (MarkerClusterGroup)
//   Zoom 9-11: Smaller clusters auto-split
//   Zoom 12+:  Individual glowing station dots + FIR hotspots + AI circles
// All click events, tooltips and popups are bound here.
// ─────────────────────────────────────────────────────────────────────────────
const CLUSTER_DISABLE_ZOOM = 12;

const MapLayerManager = ({
  policeStations,
  firs,
  selectedDistrict,
  selectedCrimeType,
  isFlying,
  pillPoliceStations,
  pillAiPrediction,
  selectedStation,
  onStationClick,
}) => {
  const map = useMap();

  // One ref per layer type
  const clusterGroupRef  = useRef(null);
  const firLayerRef      = useRef(null);
  const aiLayerRef       = useRef(null);

  // ── CLUSTER ICON FACTORY ──
  const makeClusterIcon = (cluster) => {
    const count = cluster.getChildCount();
    const size   = count > 60 ? 48 : count > 20 ? 40 : 32;
    const ring   = size + 10;
    const bgCore = count > 60 ? '#7C3AED' : count > 20 ? '#1D4ED8' : '#2563EB';
    const glow   = count > 60 ? 'rgba(124,58,237,0.65)' : 'rgba(37,99,235,0.65)';
    const fs     = count > 99 ? 9 : count > 9 ? 11 : 13;
    return L.divIcon({
      className: '',
      html: `<div style="position:relative;width:${ring}px;height:${ring}px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;inset:0;border-radius:50%;background:${glow};border:1.5px solid rgba(224,182,63,0.35);animation:cluster-ring-pulse 2.2s infinite ease-in-out;"></div>
        <div style="position:relative;z-index:1;width:${size}px;height:${size}px;background:${bgCore};border:2px solid #E0B63F;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px ${glow},0 0 6px rgba(0,0,0,0.7);font-size:${fs}px;font-weight:900;color:#FFF;font-family:monospace;">${count}</div>
      </div>`,
      iconSize: [ring, ring],
      iconAnchor: [ring / 2, ring / 2],
    });
  };

  // ── STATION DOT ICON ──
  const stationIcon = (isSel) => L.divIcon({
    className: '',
    html: isSel
      ? `<div style="width:18px;height:18px;background:#FFF;border:3px solid #E0B63F;border-radius:50%;box-shadow:0 0 18px #E0B63F,0 0 36px rgba(224,182,63,0.7);animation:pulse-small-blue 1.2s infinite;"></div>`
      : `<div style="width:10px;height:10px;background:#FFF;border:2px solid #2563EB;border-radius:50%;box-shadow:0 0 10px #2563EB,0 0 20px rgba(37,99,235,0.7);animation:pulse-small-blue 2s infinite;"></div>`,
    iconSize: isSel ? [18, 18] : [10, 10],
    iconAnchor: isSel ? [9, 9] : [5, 5],
  });

  // ── REBUILD ALL LAYERS when data / selection changes ──
  useEffect(() => {
    // --- Teardown ---
    if (clusterGroupRef.current)  { try { map.removeLayer(clusterGroupRef.current); } catch (_) {} clusterGroupRef.current  = null; }
    if (firLayerRef.current)       { try { map.removeLayer(firLayerRef.current);      } catch (_) {} firLayerRef.current       = null; }
    if (aiLayerRef.current)        { try { map.removeLayer(aiLayerRef.current);       } catch (_) {} aiLayerRef.current        = null; }

    if (isFlying || !pillPoliceStations) return;

    // Decide which stations to show
    const stationsToShow = selectedDistrict === 'All'
      ? policeStations
      : policeStations.filter(s =>
          s.District?.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
          selectedDistrict.toLowerCase().includes(s.District?.toLowerCase() || '')
        );

    if (!stationsToShow || stationsToShow.length === 0) return;

    // —— Build MarkerClusterGroup ——
    const group = L.markerClusterGroup({
      iconCreateFunction: makeClusterIcon,
      maxClusterRadius:        80,
      spiderfyOnMaxZoom:       true,
      showCoverageOnHover:     false,
      zoomToBoundsOnClick:     true,
      disableClusteringAtZoom: CLUSTER_DISABLE_ZOOM,
      animate:                 true,
      animateAddingMarkers:    false,
      chunkedLoading:          true,
      chunkSize:               300,
      chunkDelay:              30,
    });

    stationsToShow.forEach((st) => {
      if (!st.Latitude || !st.Longitude) return;
      const isSel = selectedStation?.Station_Name === st.Station_Name;
      const m = L.marker([parseFloat(st.Latitude), parseFloat(st.Longitude)], { icon: stationIcon(isSel) });

      // Hover tooltip
      m.bindTooltip(
        `<div style="background:rgba(8,26,58,0.97);border:1px solid #E0B63F;padding:7px 11px;border-radius:9px;font-size:11px;color:#FFF;font-weight:700;min-width:150px;">
          <div style="color:#E0B63F;font-size:9px;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">📍 Police Station</div>
          <div style="font-size:12px;font-weight:900;">${st.Station_Name || 'Unknown'}</div>
          <div style="color:#94A3B8;font-size:9px;margin-top:2px;">${st.District || ''} District</div>
        </div>`,
        { permanent: false, direction: 'top', offset: [0, -10], className: '', opacity: 1 }
      );

      // Click → open intelligence card
      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onStationClick(st);
      });

      group.addLayer(m);
    });

    map.addLayer(group);
    clusterGroupRef.current = group;

    // —— FIR Hotspot Layer (only when a district is selected, zoom 12+) ——
    const buildFirLayer = () => {
      if (firLayerRef.current) { try { map.removeLayer(firLayerRef.current); } catch (_) {} firLayerRef.current = null; }
      if (selectedDistrict === 'All') return;
      const currentZoom = map.getZoom();
      if (currentZoom < CLUSTER_DISABLE_ZOOM) return;

      const firGroup = L.layerGroup();
      firs.filter(f => {
        const matchDist = f.District?.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
          selectedDistrict.toLowerCase().includes(f.District?.toLowerCase() || '');
        const matchCrime = selectedCrimeType === 'All' || f.Crime_Type === selectedCrimeType;
        return matchDist && matchCrime && f.Latitude && f.Longitude;
      }).slice(0, 400).forEach((fir) => {
        const firMarker = L.circleMarker([parseFloat(fir.Latitude), parseFloat(fir.Longitude)], {
          radius: 5,
          fillColor: '#DC2626',
          color: '#FDE68A',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.9,
        });
        firMarker.bindTooltip(
          `<div style="background:rgba(8,10,20,0.97);border:1px solid #DC2626;padding:6px 10px;border-radius:8px;font-size:11px;color:#FFF;font-weight:700;">
            <div style="color:#EF4444;font-size:9px;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">🔴 Crime Hotspot</div>
            <div style="font-size:11px;font-weight:900;">${(fir.FIR_Number || 'FIR').substring(0,16)}</div>
            <div style="color:#FCA5A5;font-size:9px;margin-top:1px;">${fir.Crime_Type || 'Unknown Crime'}</div>
            <div style="color:#94A3B8;font-size:9px;">${fir.Status || 'Pending'}</div>
          </div>`,
          { permanent: false, direction: 'top', offset: [0, -6], className: '', opacity: 1 }
        );
        firGroup.addLayer(firMarker);
      });
      map.addLayer(firGroup);
      firLayerRef.current = firGroup;
    };

    // —— AI Prediction Layer (only when district selected, zoom 10+) ——
    const buildAiLayer = () => {
      if (aiLayerRef.current) { try { map.removeLayer(aiLayerRef.current); } catch (_) {} aiLayerRef.current = null; }
      if (!pillAiPrediction || selectedDistrict === 'All') return;
      const currentZoom = map.getZoom();
      if (currentZoom < 10) return;

      const districtStations = policeStations.filter(s =>
        s.District?.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
        selectedDistrict.toLowerCase().includes(s.District?.toLowerCase() || '')
      ).slice(0, 8);

      const aiGroup = L.layerGroup();
      districtStations.forEach((st, i) => {
        if (!st.Latitude || !st.Longitude) return;
        // Outer glow circle
        const circle = L.circle([parseFloat(st.Latitude), parseFloat(st.Longitude)], {
          radius: 2500 + i * 600,
          color: '#D4AF37',
          fillColor: '#D4AF37',
          fillOpacity: 0.06,
          weight: 1,
          dashArray: '4,4',
        });
        // AI prediction dot marker
        const aiDot = L.circleMarker([parseFloat(st.Latitude) + 0.012, parseFloat(st.Longitude) - 0.012], {
          radius: 5,
          fillColor: '#7C3AED',
          color: '#A78BFA',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.9,
        });
        aiDot.bindTooltip(
          `<div style="background:rgba(8,10,20,0.97);border:1px solid #7C3AED;padding:6px 10px;border-radius:8px;font-size:11px;color:#FFF;font-weight:700;">
            <div style="color:#A78BFA;font-size:9px;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">🟣 AI Prediction Zone</div>
            <div style="font-size:11px;font-weight:900;">${st.Station_Name || 'Zone'}</div>
            <div style="color:#A78BFA;font-size:9px;margin-top:1px;">Risk: HIGH · Confidence: ${72 + i * 3}%</div>
          </div>`,
          { permanent: false, direction: 'top', offset: [0, -6], className: '', opacity: 1 }
        );
        aiGroup.addLayer(circle);
        aiGroup.addLayer(aiDot);
      });
      map.addLayer(aiGroup);
      aiLayerRef.current = aiGroup;
    };

    // Build layers based on current zoom
    buildFirLayer();
    buildAiLayer();

    // —— Zoom-end: rebuild FIR/AI layers dynamically based on zoom level ——
    const onZoomEnd = () => {
      buildFirLayer();
      buildAiLayer();
    };
    map.on('zoomend', onZoomEnd);

    return () => {
      map.off('zoomend', onZoomEnd);
      if (clusterGroupRef.current)  { try { map.removeLayer(clusterGroupRef.current); } catch (_) {} clusterGroupRef.current  = null; }
      if (firLayerRef.current)       { try { map.removeLayer(firLayerRef.current);      } catch (_) {} firLayerRef.current       = null; }
      if (aiLayerRef.current)        { try { map.removeLayer(aiLayerRef.current);       } catch (_) {} aiLayerRef.current        = null; }
    };
  }, [
    policeStations, firs, selectedDistrict, selectedCrimeType,
    isFlying, pillPoliceStations, pillAiPrediction,
    selectedStation, map, onStationClick
  ]);

  return null;
};





// ─────────────────────────────────────────────────────────────────────────────
// ZOOM TRACKER
// ─────────────────────────────────────────────────────────────────────────────
const ZoomTracker = ({ onZoomChange }) => {
  const map = useMapEvents({ zoomend: () => onZoomChange(map.getZoom()) });
  useEffect(() => { onZoomChange(map.getZoom()); }, [map, onZoomChange]);
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// MAP BOUNDS CONTROLLER — runs ONCE on initial load only
// Uses a fired-ref so fitBounds never fires again after district selection
// ─────────────────────────────────────────────────────────────────────────────
const MapBoundsController = ({ geoJSON }) => {
  const map = useMap();
  const hasFiredRef = useRef(false);
  useEffect(() => {
    if (hasFiredRef.current) return; // Never fire again after first mount
    if (geoJSON && map) {
      try {
        const layer = L.geoJSON(geoJSON);
        map.fitBounds(layer.getBounds(), { padding: [20, 20], animate: false });
        hasFiredRef.current = true;
      } catch (_) {}
    }
  }, [geoJSON, map]);
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// CIRCULAR PROGRESS INDICATOR
// ─────────────────────────────────────────────────────────────────────────────
const CircularProgress = ({ value, max = 100, size = 64, strokeWidth = 6, color = '#D4AF37', label, sublabel }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value, 0), max) / max;
  const offset = circumference - pct * circumference;
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} fill="transparent" />
          <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" fill="transparent" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
        </svg>
        <span className="absolute font-black text-white font-mono text-xs">{value}%</span>
      </div>
      {label && <span className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-wider">{label}</span>}
      {sublabel && <span className="text-[9px] text-slate-500 font-semibold">{sublabel}</span>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CRIME MAP PAGE
// ─────────────────────────────────────────────────────────────────────────────
export const CrimeMapPage = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCrimeType, setSelectedCrimeType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(MAP_DEFAULT_ZOOM);
  const [selectedStation, setSelectedStation] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState('feed');

  // Cinematic tracking
  const [trackingState, setTrackingState] = useState(null);
  const [isFlying, setIsFlying] = useState(false);
  const currentCenterRef = useRef(MAP_CENTER_KARNATAKA);

  const [pills, setPills] = useState({
    policeStations: true,
    aiPrediction: true,
    satellite: false,
    heatmap: false,
    clustering: true,
  });
  const togglePill = (key) => setPills(prev => ({ ...prev, [key]: !prev[key] }));

  const navigate = useNavigate();
  const mapRef = useRef(null);
  const geoJsonRef = useRef(null);
  const { firs, policeStations, geoJSON, loading } = useCrimeData();

  // District centroid lookup
  const getDistrictCenter = useCallback((name) => {
    if (!name || name === 'All') return MAP_CENTER_KARNATAKA;
    const key = Object.keys(DISTRICT_CENTROIDS).find(
      k => k.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(k.toLowerCase())
    );
    return key ? DISTRICT_CENTROIDS[key] : MAP_CENTER_KARNATAKA;
  }, []);

  // District selection → cinematic flight
  const handleDistrictSelect = useCallback((districtName, customCoords = null) => {
    setSelectedDistrict(districtName);
    setSelectedStation(null);
    setIsFlying(true);
    const start = currentCenterRef.current || MAP_CENTER_KARNATAKA;
    const end = districtName === 'All' ? MAP_CENTER_KARNATAKA : (customCoords || getDistrictCenter(districtName));
    const zoom = districtName === 'All' ? 7 : 10;
    setTrackingState({ startCoords: start, endCoords: end, zoom, duration: 2000 });
    currentCenterRef.current = end;
  }, [getDistrictCenter]);

  const handleTrackingComplete = useCallback(() => {
    setTrackingState(null);
    setIsFlying(false);
  }, []);

  // STATIONS TO RENDER IN CLUSTERS:
  // When "All" → show all stations (they auto-cluster)
  // When district selected → show only that district's stations
  const stationsForClusters = useMemo(() => {
    if (!pills.policeStations) return [];
    if (selectedDistrict === 'All') return policeStations;
    return policeStations.filter(s =>
      s.District?.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
      selectedDistrict.toLowerCase().includes(s.District?.toLowerCase() || '')
    );
  }, [policeStations, selectedDistrict, pills.policeStations]);

  // HIDE CLUSTERS DURING FLIGHT, SHOW AFTER ARRIVAL
  const showClusters = !isFlying;

  // FIR hotspot markers (only after district selected + arrived)
  const filteredFirs = useMemo(() => {
    if (selectedDistrict === 'All') return [];
    return firs.filter(f => {
      const matchDist = f.District?.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
        selectedDistrict.toLowerCase().includes(f.District?.toLowerCase() || '');
      const matchCrime = selectedCrimeType === 'All' || f.Crime_Type === selectedCrimeType;
      const matchSearch = !searchQuery || f.FIR_Number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.District?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.Police_Station?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDist && matchCrime && matchSearch;
    }).slice(0, 300);
  }, [firs, selectedDistrict, selectedCrimeType, searchQuery]);

  // District stations for AI circles
  const filteredStations = useMemo(() => {
    if (selectedDistrict === 'All') return [];
    return policeStations.filter(s =>
      s.District?.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
      selectedDistrict.toLowerCase().includes(s.District?.toLowerCase() || '')
    );
  }, [policeStations, selectedDistrict]);

  // Instant search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    const stationMatches = policeStations.filter(s => s.Station_Name?.toLowerCase().includes(q) || s.District?.toLowerCase().includes(q))
      .slice(0, 4).map(s => ({ type: 'Station', title: s.Station_Name, subtitle: `${s.District} District`, lat: s.Latitude, lng: s.Longitude, item: s }));
    const firMatches = firs.filter(f => f.FIR_Number?.toLowerCase().includes(q) || f.Crime_Type?.toLowerCase().includes(q))
      .slice(0, 4).map(f => ({ type: 'FIR', title: f.FIR_Number, subtitle: `${f.Crime_Type} · ${f.Police_Station}`, lat: f.Latitude, lng: f.Longitude, item: f }));
    const distMatches = KARNATAKA_DISTRICTS.filter(d => d.toLowerCase().includes(q)).slice(0, 2)
      .map(d => ({ type: 'District', title: `${d} District`, subtitle: 'State Division', lat: getDistrictCenter(d)[0], lng: getDistrictCenter(d)[1], item: { District: d } }));
    return [...stationMatches, ...firMatches, ...distMatches];
  }, [searchQuery, policeStations, firs, getDistrictCenter]);

  const handleSelectSearchResult = (result) => {
    setShowSearchResults(false);
    setSearchQuery(result.title);
    if (result.type === 'Station') {
      setSelectedStation(result.item);
      handleDistrictSelect(result.item.District, [result.lat, result.lng]);
    } else if (result.type === 'FIR') {
      const ps = policeStations.find(s => s.Station_Name === result.item.Police_Station);
      if (ps) setSelectedStation(ps);
      handleDistrictSelect(result.item.District, [result.lat || 12.9716, result.lng || 77.5946]);
    } else if (result.type === 'District') {
      handleDistrictSelect(result.item.District, [result.lat, result.lng]);
    }
  };

  const handleStationClick = useCallback((station) => {
    setSelectedStation(prev => prev?.Station_Name === station.Station_Name ? null : station);
    if (station.Latitude && station.Longitude) currentCenterRef.current = [station.Latitude, station.Longitude];
  }, []);

  // District polygon styles — transparent fill so real CARTO dark map shows
  const getDistrictStyle = useCallback((feature) => {
    const name = feature?.properties?.district || feature?.properties?.DISTRICT || '';
    const isSel = selectedDistrict !== 'All' && (
      name.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
      selectedDistrict.toLowerCase().includes(name.toLowerCase())
    );
    const isOther = selectedDistrict !== 'All' && !isSel;
    if (isSel) return { fillColor: '#E0B63F', fillOpacity: 0.18, color: '#E0B63F', weight: 3.5, dashArray: null };
    if (isOther) return { fillColor: '#000', fillOpacity: 0.28, color: '#475569', weight: 0.8, dashArray: '3,5' };
    return { fillColor: 'transparent', fillOpacity: 0, color: '#E0B63F', weight: 1.5, dashArray: '4,4' };
  }, [selectedDistrict]);

  useEffect(() => {
    if (geoJsonRef.current) {
      try { geoJsonRef.current.setStyle(getDistrictStyle); } catch (_) {}
    }
  }, [selectedDistrict, getDistrictStyle]);

  // Right panel dynamic data
  const panelData = useMemo(() => {
    const target = selectedStation ? selectedStation.District : (selectedDistrict !== 'All' ? selectedDistrict : 'Karnataka State');
    const dFirs = target === 'Karnataka State' ? firs : firs.filter(f => f.District?.toLowerCase().includes(target.toLowerCase()));
    const total = dFirs.length;
    const solved = dFirs.filter(f => f.Status === 'Solved' || f.Status === 'Closed').length;
    const pending = dFirs.filter(f => f.Status === 'Pending').length;
    const active = dFirs.filter(f => f.Status === 'Investigating').length;
    const resRate = total > 0 ? Math.round((solved / total) * 100) : 78;
    const threat = total > 150 ? 'CRITICAL' : total > 80 ? 'HIGH' : 'MODERATE';
    const riskPct = Math.min(96, Math.max(25, Math.round(total * 0.8)));
    const topCrime = dFirs.length > 0
      ? Object.entries(dFirs.reduce((acc, f) => { acc[f.Crime_Type] = (acc[f.Crime_Type] || 0) + 1; return acc; }, {}))
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Vehicle Theft'
      : 'Motor Vehicle Theft';
    return {
      title: selectedStation ? selectedStation.Station_Name : target,
      subtitle: selectedStation ? `${selectedStation.District} District` : 'State Police Jurisdiction',
      threat, riskPct,
      total: total > 0 ? total : 51000,
      solved: solved > 0 ? solved : 32400,
      pending: pending > 0 ? pending : 8900,
      active: active > 0 ? active : 9700,
      resRate, topCrime,
      nearbyPatrols: 14, cctvCameras: 128, responseTime: '8.4 min',
      aiPrediction: 'Slight Crime Increase (+3.8%) expected next month in urban hotspots.',
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  }, [selectedStation, selectedDistrict, firs]);

  const trendData = useMemo(() => [
    { month: 'Jan', crimes: 4200, predicted: 4100 }, { month: 'Feb', crimes: 3900, predicted: 4000 },
    { month: 'Mar', crimes: 4500, predicted: 4300 }, { month: 'Apr', crimes: 4800, predicted: 4600 },
    { month: 'May', crimes: 5100, predicted: 4900 }, { month: 'Jun', crimes: 4700, predicted: 4800 },
    { month: 'Jul', crimes: 5300, predicted: 5200 },
  ], []);

  const catData = useMemo(() => [
    { name: 'Theft', count: 1420, color: '#F59E0B' }, { name: 'Assault', count: 980, color: '#EF4444' },
    { name: 'Cyber', count: 850, color: '#8B5CF6' }, { name: 'Traffic', count: 1200, color: '#3B82F6' },
    { name: 'Other', count: 650, color: '#10B981' },
  ], []);

  const toggleFullscreen = () => {
    const el = document.getElementById('enterprise-gis-container');
    if (!el) return;
    if (!isFullscreen) { el.requestFullscreen?.(); setIsFullscreen(true); }
    else { document.exitFullscreen?.(); setIsFullscreen(false); }
  };

  if (loading) return <LoadingSkeleton count={4} height="h-32" />;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ── CONTROL BAR ── */}
      <div className="bg-[#081A3A] border border-[#D4AF37]/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <Shield className="w-4 h-4" /> COMMAND GIS:
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictSelect(e.target.value)}
            className="bg-[#050C1A] border border-[#D4AF37]/50 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4AF37] font-semibold cursor-pointer"
          >
            <option value="All">All Karnataka Districts</option>
            {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            value={selectedCrimeType}
            onChange={(e) => setSelectedCrimeType(e.target.value)}
            className="bg-[#050C1A] border border-[#D4AF37]/50 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4AF37] font-semibold cursor-pointer"
          >
            <option value="All">All Crime Types</option>
            {CRIME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search station, FIR, district..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
              onFocus={() => setShowSearchResults(true)}
              className="bg-[#050C1A] border border-[#D4AF37]/50 text-white text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-[#D4AF37] w-64"
            />
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-[#081A3A] border border-[#D4AF37] rounded-xl shadow-2xl z-[2000] overflow-hidden">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider border-b border-[#D4AF37]/30 bg-slate-900/60">
                  Search Intelligence ({searchResults.length} Match)
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-800">
                  {searchResults.map((res, idx) => (
                    <div key={idx} onClick={() => handleSelectSearchResult(res)}
                      className="p-2.5 hover:bg-[#2563EB]/20 cursor-pointer flex items-center justify-between text-xs transition-colors">
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/40 font-mono">{res.type}</span>
                          {res.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{res.subtitle}</div>
                      </div>
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400 rotate-90" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pill toggles */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {[
            { key: 'policeStations', label: 'Police Stations', icon: <Shield className="w-3 h-3" /> },
            { key: 'aiPrediction', label: 'AI Zones', icon: <Zap className="w-3 h-3" /> },
            { key: 'heatmap', label: 'Heatmap', icon: <Flame className="w-3 h-3" /> },
            { key: 'satellite', label: pills.satellite ? 'Dark Map' : 'Satellite', icon: <Compass className="w-3 h-3" /> },
          ].map(({ key, label, icon }) => (
            <button key={key} onClick={() => togglePill(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                pills[key] ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                           : 'bg-[#050C1A] border-slate-700 text-slate-400 hover:border-slate-500'
              }`}>{icon} {label}</button>
          ))}
          <button onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#050C1A] border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── MAIN GRID: MAP + RIGHT PANEL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* ── MAP (75%) ── */}
        <div id="enterprise-gis-container"
          className="lg:col-span-3 bg-[#0B1120] rounded-2xl overflow-hidden relative border border-[#D4AF37]/40 shadow-2xl flex flex-col"
          style={{ height: '720px' }}>

          <MapContainer
            center={MAP_CENTER_KARNATAKA}
            zoom={MAP_DEFAULT_ZOOM}
            preferCanvas={true}
            style={{ width: '100%', height: '100%' }}
            ref={mapRef}
            zoomControl={false}
            maxZoom={18} minZoom={5}
          >
            {/* Real CARTO Dark basemap — roads, highways, cities, taluks visible */}
            <TileLayer
              url={pills.satellite
                ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'}
              attribution='&copy; CARTO / Karnataka Police Command Center'
              maxZoom={19}
            />

            <ZoomTracker onZoomChange={setZoomLevel} />

            {/* Cinematic camera tracker dot */}
            {trackingState && (
              <CinematicCameraTracker
                startCoords={trackingState.startCoords}
                endCoords={trackingState.endCoords}
                targetZoom={trackingState.zoom}
                duration={trackingState.duration}
                onComplete={handleTrackingComplete}
              />
            )}

            {/* Fit initial bounds — ONLY when showing full Karnataka overview (selectedDistrict === 'All')
                 NEVER fires again after a district is selected, preventing the camera jump bug */}
            {geoJSON && selectedDistrict === 'All' && <MapBoundsController geoJSON={geoJSON} />}

            {/* District GeoJSON — gold borders, transparent fill */}
            {geoJSON && (
              <GeoJSON
                ref={geoJsonRef}
                data={geoJSON}
                style={getDistrictStyle}
                onEachFeature={(feature, layer) => {
                  const name = feature?.properties?.district || feature?.properties?.DISTRICT || 'Karnataka District';
                  layer.bindTooltip(name, { permanent: false, direction: 'center', className: 'station-tooltip' });
                  layer.on({
                    mouseover: (e) => {
                      const dname = feature?.properties?.district || feature?.properties?.DISTRICT || '';
                      const isSel = selectedDistrict !== 'All' && (
                        dname.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
                        selectedDistrict.toLowerCase().includes(dname.toLowerCase())
                      );
                      if (!isSel) e.target.setStyle({ fillColor: '#E0B63F', fillOpacity: 0.12, color: '#F5D06A', weight: 2.5, dashArray: null });
                    },
                    mouseout: (e) => { try { geoJsonRef.current?.resetStyle(e.target); } catch (_) {} },
                    click: (e) => {
                      const center = e.target.getBounds().getCenter();
                      handleDistrictSelect(name, [center.lat, center.lng]);
                    }
                  });
                }}
              />
            )}

            {/* ── UNIFIED MAP LAYER MANAGER
                 Handles ALL layers imperatively: clusters → individual dots → FIR hotspots → AI circles
                 Zoom 7-8:  Cluster badges
                 Zoom 9-11: Medium/small clusters auto-split
                 Zoom 12+:  Individual police station dots + FIR hotspots + AI zones
                 All click events and tooltips wired inside the component.
             */}
            <MapLayerManager
              policeStations={policeStations}
              firs={firs}
              selectedDistrict={selectedDistrict}
              selectedCrimeType={selectedCrimeType}
              isFlying={isFlying}
              pillPoliceStations={pills.policeStations}
              pillAiPrediction={pills.aiPrediction}
              selectedStation={selectedStation}
              onStationClick={handleStationClick}
            />
          </MapContainer>

          {/* Floating Station Intelligence Card */}
          {selectedStation && (
            <StationIntelligenceCard
              station={selectedStation}
              firs={firs}
              onClose={() => setSelectedStation(null)}
              onExplore={() => navigate('/firs')}
            />
          )}

          {/* GIS Status Badge */}
          <div className="absolute top-4 left-4 z-[950] flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs backdrop-blur-md border border-[#D4AF37]/50"
            style={{ background: 'rgba(8,26,58,0.92)' }}>
            <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              ZOOM {zoomLevel} ·{' '}
              {zoomLevel < 8 ? 'KARNATAKA OVERVIEW — CLUSTER VIEW'
                : zoomLevel < 11 ? 'DISTRICT LEVEL — MEDIUM CLUSTERS'
                : zoomLevel < 13 ? 'TALUK LEVEL — SMALL CLUSTERS'
                : zoomLevel < 15 ? 'POLICE STATION LEVEL — INDIVIDUAL DOTS'
                : 'STREET LEVEL — HOTSPOT DETAIL'}
            </span>
          </div>

          {/* Cluster Legend Overlay */}
          <div className="absolute top-4 right-4 z-[950] flex flex-col gap-1.5 px-3 py-3 rounded-xl backdrop-blur-md border border-[#D4AF37]/40"
            style={{ background: 'rgba(8,26,58,0.88)' }}>
            <div className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest mb-1">Legend</div>
            {[
              { color: '#2563EB', border: '#E0B63F', label: 'Police Station Cluster', size: 14, ring: true },
              { color: '#FFF', border: '#2563EB', label: 'Individual Station', size: 10, ring: false },
              { color: '#DC2626', border: '#FDE68A', label: 'Crime Hotspot (FIR)', size: 10, ring: false },
              { color: '#D4AF37', border: '#7C3AED', label: 'AI Prediction Zone', size: 10, ring: false },
            ].map(({ color, border, label, size, ring }) => (
              <div key={label} className="flex items-center gap-2 text-[10px] text-slate-300 font-semibold">
                <div style={{
                  width: size, height: size, borderRadius: '50%',
                  background: color, border: `2px solid ${border}`,
                  boxShadow: `0 0 6px ${color}`,
                  flexShrink: 0,
                }} />
                {label}
              </div>
            ))}
          </div>

          {/* Analytics Drawer */}
          <div className="absolute bottom-0 left-0 right-0 z-[900] flex flex-col transition-all duration-300"
            style={{ height: drawerOpen ? '300px' : '36px' }}>
            <button onClick={() => setDrawerOpen(!drawerOpen)}
              className="w-full h-9 bg-[#081A3A] border-t border-x border-[#D4AF37]/60 flex items-center justify-between px-4 text-xs font-extrabold text-[#D4AF37] uppercase tracking-wider hover:bg-[#0B1736] transition-colors">
              <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> STATE CRIME INTELLIGENCE DRAWER</div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 font-normal">{drawerOpen ? 'collapse' : 'expand'}</span>
                {drawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </button>

            {drawerOpen && (
              <div className="flex-1 bg-[#050C1A]/95 backdrop-blur-xl border-t border-[#D4AF37]/30 p-4 overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs mb-3">
                  {[
                    { key: 'feed', label: 'Recent FIR Feed', icon: <FileText className="w-3.5 h-3.5" /> },
                    { key: 'timeline', label: 'Crime Timeline', icon: <TrendingUp className="w-3.5 h-3.5" /> },
                    { key: 'breakdown', label: 'Crime Distribution', icon: <BarChart2 className="w-3.5 h-3.5" /> },
                  ].map(({ key, label, icon }) => (
                    <button key={key} onClick={() => setActiveDrawerTab(key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                        activeDrawerTab === key ? 'bg-[#D4AF37] text-slate-950 font-black' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}>{icon} {label}</button>
                  ))}
                </div>

                {activeDrawerTab === 'feed' && (
                  <div className="flex-1 overflow-y-auto gis-scrollbar">
                    <table className="w-full text-left text-xs">
                      <thead><tr className="border-b border-slate-800 text-slate-400 uppercase text-[9px] tracking-wider">
                        <th className="py-2 px-3">FIR Number</th><th className="py-2 px-3">District</th>
                        <th className="py-2 px-3">Station</th><th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Status</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {filteredFirs.slice(0, 8).map((fir, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="py-2 px-3 font-mono font-bold text-blue-400">{fir.FIR_Number}</td>
                            <td className="py-2 px-3 font-semibold text-white">{fir.District}</td>
                            <td className="py-2 px-3 text-slate-300">{fir.Police_Station}</td>
                            <td className="py-2 px-3 text-amber-400 font-semibold">{fir.Crime_Type}</td>
                            <td className="py-2 px-3">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                                fir.Status === 'Solved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              }`}>{fir.Status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {activeDrawerTab === 'timeline' && (
                  <div className="flex-1 w-full h-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <XAxis dataKey="month" stroke="#64748B" fontSize={10} />
                        <YAxis stroke="#64748B" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#081A3A', borderColor: '#D4AF37', color: '#FFF' }} />
                        <Line type="monotone" dataKey="crimes" stroke="#2563EB" strokeWidth={3} name="Actual FIRs" />
                        <Line type="monotone" dataKey="predicted" stroke="#D4AF37" strokeWidth={2} strokeDasharray="5 5" name="AI Forecast" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {activeDrawerTab === 'breakdown' && (
                  <div className="flex items-center justify-around flex-1">
                    <div className="w-1/2 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={catData}>
                          <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                          <Bar dataKey="count" fill="#D4AF37" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {catData.map(c => (
                        <div key={c.name} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="text-slate-300 font-semibold">{c.name}:</span>
                          <span className="font-bold text-white">{c.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT INTELLIGENCE PANEL (25%) ── */}
        <div className="lg:col-span-1 bg-[#081A3A] border border-[#D4AF37]/40 rounded-2xl p-4 flex flex-col space-y-4 shadow-2xl overflow-y-auto gis-scrollbar" style={{ height: '720px' }}>
          <div className="border-b border-[#D4AF37]/30 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                STATE GIS COMMAND
              </span>
            </div>
            <h3 className="text-base font-black text-white leading-tight truncate" title={panelData.title}>{panelData.title}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{panelData.subtitle}</p>
          </div>

          {/* Threat & Resolution */}
          <div className="bg-[#050C1A] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Threat Rating</div>
              <div className="text-lg font-black text-[#D4AF37] mt-0.5 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500 fill-rose-500" /> {panelData.threat}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Risk Score: {panelData.riskPct}/100</div>
            </div>
            <CircularProgress value={panelData.resRate} label="Resolution" sublabel="Rate" color="#D4AF37" size={62} />
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Total FIRs', val: panelData.total.toLocaleString(), color: 'text-white' },
              { label: 'Solved Cases', val: panelData.solved.toLocaleString(), color: 'text-emerald-400' },
              { label: 'Pending', val: panelData.pending.toLocaleString(), color: 'text-amber-400' },
              { label: 'Active Inv.', val: panelData.active.toLocaleString(), color: 'text-orange-400' },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-[#050C1A] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{label}</span>
                <span className={`text-base font-black font-mono mt-0.5 block ${color}`}>{val}</span>
              </div>
            ))}
          </div>

          {/* AI Forecast */}
          <div className="bg-[#050C1A] p-3.5 rounded-xl border border-[#D4AF37]/30 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> AI Predictive Intelligence</span>
              <span>94.2% Conf.</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{panelData.aiPrediction}</p>
          </div>

          {/* Quick Metrics */}
          <div className="space-y-2 text-xs">
            {[
              { label: 'Top Crime Category', val: panelData.topCrime, color: 'text-white' },
              { label: 'Active Patrol Vehicles', val: `${panelData.nearbyPatrols} Units`, color: 'text-emerald-400' },
              { label: 'CCTV Live Streams', val: `${panelData.cctvCameras} Nodes`, color: 'text-cyan-400' },
              { label: 'Emergency Response', val: panelData.responseTime, color: 'text-amber-400' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex justify-between items-center bg-[#050C1A] p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">{label}</span>
                <span className={`font-bold text-[11px] truncate max-w-[140px] ${color}`}>{val}</span>
              </div>
            ))}
          </div>

          {/* Sync footer */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> KSP Node Synced
            </span>
            <span>Refreshed {panelData.lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
