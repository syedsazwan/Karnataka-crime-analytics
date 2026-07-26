import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Shield,
  Layers,
  Filter,
  Maximize2,
  Minimize2,
  Flame,
  Search,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useCrimeData } from '../hooks/useCrimeData';
import { KARNATAKA_DISTRICTS, CRIME_CATEGORIES, MAP_CENTER_KARNATAKA, MAP_DEFAULT_ZOOM } from '../utils/constants';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

// Custom Blue Shield Icon for Police Stations
const policeIcon = L.divIcon({
  className: 'custom-police-marker',
  html: `<div style="background-color: #2563EB; border: 2px solid #FFFFFF; width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(37,99,235,0.5);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
         </div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

// Custom Red Icon for Crime Points
const crimeIcon = L.divIcon({
  className: 'custom-crime-marker',
  html: `<div style="background-color: #DC2626; border: 2px solid #F59E0B; width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 10px #DC2626; animation: pulse 2s infinite;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// Map Controller Component for Bounds Fitting
const MapBoundsController = ({ geoJSON }) => {
  const map = useMap();

  useEffect(() => {
    if (geoJSON && map) {
      try {
        const layer = L.geoJSON(geoJSON);
        map.fitBounds(layer.getBounds(), { padding: [20, 20] });
      } catch (e) {
        console.error("Bounds fit error:", e);
      }
    }
  }, [geoJSON, map]);

  return null;
};

export const CrimeMapPage = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCrimeType, setSelectedCrimeType] = useState('All');
  const [searchMap, setSearchMap] = useState('');
  const [showPoliceStations, setShowPoliceStations] = useState(true);
  const [showCrimeMarkers, setShowCrimeMarkers] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mapRef = useRef(null);

  const { firs, policeStations, geoJSON, loading } = useCrimeData();

  // Filter FIRs for map display
  const filteredFirs = firs.filter(f => {
    const matchDist = selectedDistrict === 'All' || f.District === selectedDistrict;
    const matchCrime = selectedCrimeType === 'All' || f.Crime_Type === selectedCrimeType;
    const matchSearch = !searchMap ||
      f.FIR_Number?.toLowerCase().includes(searchMap.toLowerCase()) ||
      f.District?.toLowerCase().includes(searchMap.toLowerCase()) ||
      f.Police_Station?.toLowerCase().includes(searchMap.toLowerCase());

    return matchDist && matchCrime && matchSearch;
  }).slice(0, 300); // Cap map markers for high performance rendering

  // Filter Police Stations
  const filteredStations = policeStations.filter(s => {
    return selectedDistrict === 'All' || s.District === selectedDistrict;
  });

  // District GeoJSON Style matching Government GIS screenshot 3
  const districtStyle = {
    fillColor: '#F59E0B',
    fillOpacity: 0.15,
    color: '#DC2626',
    weight: 2,
    dashArray: '3, 3'
  };

  const toggleFullscreen = () => {
    const mapElem = document.getElementById('crime-map-container');
    if (!mapElem) return;
    if (!isFullscreen) {
      if (mapElem.requestFullscreen) mapElem.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) return <LoadingSkeleton count={4} height="h-32" />;

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="gov-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-400" />
            GIS Map Filters:
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-[#0F172A] border border-[#334155] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="All">All Karnataka Districts</option>
            {KARNATAKA_DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedCrimeType}
            onChange={(e) => setSelectedCrimeType(e.target.value)}
            className="bg-[#0F172A] border border-[#334155] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="All">All Crime Types</option>
            {CRIME_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search station or FIR..."
              value={searchMap}
              onChange={(e) => setSearchMap(e.target.value)}
              className="bg-[#0F172A] border border-[#334155] text-white text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
            <input
              type="checkbox"
              checked={showPoliceStations}
              onChange={() => setShowPoliceStations(!showPoliceStations)}
              className="rounded bg-[#0F172A] border-[#334155] text-blue-600 focus:ring-0"
            />
            Police Stations ({filteredStations.length})
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
            <input
              type="checkbox"
              checked={showCrimeMarkers}
              onChange={() => setShowCrimeMarkers(!showCrimeMarkers)}
              className="rounded bg-[#0F172A] border-[#334155] text-rose-600 focus:ring-0"
            />
            Crime FIR Hotspots ({filteredFirs.length})
          </label>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#0F172A] border border-[#334155] hover:text-white transition-colors text-slate-300"
            title="Toggle Fullscreen Map"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div
        id="crime-map-container"
        className="gov-card h-[600px] w-full rounded-2xl overflow-hidden relative border border-[#334155]"
      >
        <MapContainer
          center={MAP_CENTER_KARNATAKA}
          zoom={MAP_DEFAULT_ZOOM}
          style={{ width: '100%', height: '100%' }}
          ref={mapRef}
          zoomControl={false}
        >
          {/* CartoDB Dark Matter Tile Layer */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a> Karnataka GIS Portal'
          />

          {/* Fit Bounds Controller */}
          {geoJSON && <MapBoundsController geoJSON={geoJSON} />}

          {/* District Polygons (Yellow Fill, Red Border) */}
          {geoJSON && (
            <GeoJSON
              data={geoJSON}
              style={districtStyle}
              onEachFeature={(feature, layer) => {
                const name = feature.properties?.district || 'Karnataka District';
                layer.bindTooltip(name, {
                  permanent: false,
                  direction: 'center',
                  className: 'bg-[#1E293B] text-amber-400 font-bold border border-[#334155] text-xs px-2 py-1 rounded'
                });
              }}
            />
          )}

          {/* Police Stations Markers */}
          {showPoliceStations &&
            filteredStations.map((st, i) => (
              <Marker
                key={`ps-${i}`}
                position={[st.Latitude, st.Longitude]}
                icon={policeIcon}
              >
                <Popup>
                  <div className="p-1 space-y-2 text-xs min-w-[200px]">
                    <div className="flex items-center gap-2 border-b border-[#334155] pb-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <strong className="text-white text-sm font-bold">{st.Station_Name}</strong>
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">District</span>
                      {st.District}
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Address</span>
                      {st.Address}
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Officer In Charge</span>
                      {st.Officer_In_Charge} ({st.Phone})
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Crime Markers */}
          {showCrimeMarkers &&
            filteredFirs.map((fir, i) => (
              <Marker
                key={`fir-${i}`}
                position={[fir.Latitude, fir.Longitude]}
                icon={crimeIcon}
              >
                <Popup>
                  <div className="p-1 space-y-2 text-xs min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-[#334155] pb-2">
                      <span className="font-mono font-bold text-blue-400">{fir.FIR_Number}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                        {fir.Status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Crime Type</span>
                      <strong className="text-white font-semibold">{fir.Crime_Type}</strong>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">District</span>
                        {fir.District}
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Station</span>
                        {fir.Police_Station}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        {/* Floating Legend Overlay matching Government GIS spec */}
        <div className="absolute bottom-6 right-6 bg-[#1E293B]/90 backdrop-blur-md border border-[#334155] p-4 rounded-xl shadow-2xl z-[1000] text-xs space-y-2">
          <div className="font-bold text-white uppercase tracking-wider text-[11px] border-b border-[#334155] pb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-500" /> GIS Layer Legend
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-600 border border-white flex items-center justify-center text-[9px] text-white">★</div>
            <span className="text-slate-300">Police Station</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-600 border border-amber-400" />
            <span className="text-slate-300">Crime Incident Location</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-amber-500/20 border border-rose-600" />
            <span className="text-slate-300">District Boundary Polygon</span>
          </div>
        </div>
      </div>
    </div>
  );
};
