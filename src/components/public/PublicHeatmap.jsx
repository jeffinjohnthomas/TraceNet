import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import { io } from 'socket.io-client';

function MapController({ view }) {
  const map = useMap();
  useEffect(() => {
    if (view && view.center) {
      map.flyTo(view.center, view.zoom, { duration: 1.5 });
    }
  }, [view, map]);
  return null;
}

export default function PublicHeatmap() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mapView, setMapView] = useState(null);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const { data } = await api.get('/cases');
        // Filter cases that have coordinates
        const casesWithLocation = data.filter(c => c.latitude && c.longitude);
        setHeatmapData(casesWithLocation);
      } catch (err) {
        console.error("Failed to load heatmap data", err);
      }
    };
    fetchHeatmapData();

    // Listen for live updates so pins drop in real-time without refresh!
    const socket = io((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'));
    socket.on('new_case', (newCase) => {
      if (newCase.latitude && newCase.longitude) {
        setHeatmapData(prev => [newCase, ...prev]);
      }
    });

    return () => socket.disconnect();
  }, []);

  const getMarkerColor = (priority) => {
    if(priority === 'High') return { color: '#F43F5E', fillColor: '#F43F5E' }; // Rose
    if(priority === 'Medium') return { color: '#F59E0B', fillColor: '#F59E0B' }; // Amber
    return { color: '#6366F1', fillColor: '#6366F1' }; // Indigo
  };

  const locationStats = useMemo(() => {
    const stats = {};
    heatmapData.forEach(c => {
      const loc = c.location || 'Unknown Area';
      if (!stats[loc]) stats[loc] = { High: 0, Medium: 0, Low: 0, total: 0, latSum: 0, lngSum: 0, count: 0 };
      stats[loc][c.priority || 'Low'] = (stats[loc][c.priority || 'Low'] || 0) + 1;
      stats[loc].total += 1;
      
      if (c.latitude && c.longitude) {
         stats[loc].latSum += c.latitude;
         stats[loc].lngSum += c.longitude;
         stats[loc].count += 1;
      }
    });
    return Object.entries(stats).sort((a, b) => b[1].total - a[1].total).slice(0, 6);
  }, [heatmapData]);

  const handleRegionClick = (stats) => {
    if (stats.count > 0) {
      setMapView({ center: [stats.latSum / stats.count, stats.lngSum / stats.count], zoom: 11 });
    }
  };

  return (
    <section id="heatmap" className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-[rgba(15,23,42,0.65)] backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Live Regional Heatmap</h2>
            <p className="text-[#64748B] font-medium text-sm max-w-2xl">
              <strong>Goal:</strong> Provide real-time situational awareness by mapping case priorities to geographic clusters. 
              This helps the community and investigators instantly identify high-risk zones and coordinate rapid response efforts.
            </p>
          </div>
          <button 
            onClick={() => setIsFullScreen(true)}
            className="px-6 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-sm font-bold text-[#CBD5E1] hover:text-white hover:bg-[#1E293B] transition-all shadow-inner whitespace-nowrap"
          >
            View Full Map
          </button>
        </div>

        <div className={isFullScreen ? "fixed inset-0 z-[9999] bg-[#020617]" : "relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-[#334155] bg-[#020617] shadow-inner mt-6"}>
          {isFullScreen && (
            <button 
              onClick={() => setIsFullScreen(false)}
              className="absolute top-6 right-6 z-[9999] px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              Close Full Map
            </button>
          )}
          <MapContainer 
            key={isFullScreen ? 'fullscreen' : 'inline'}
            center={[20.5937, 78.9629]} 
            zoom={isFullScreen ? 6 : 5} 
            zoomControl={true} 
            className="w-full h-full" 
            style={{ background: '#020617' }}
          >
             {/* Using CartoDB Dark Matter for the premium dark aesthetic */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapController view={mapView} />
            {heatmapData.map((point) => (
              <CircleMarker 
                key={point.caseId} 
                center={[point.latitude, point.longitude]} 
                radius={point.priority === 'High' ? 12 : point.priority === 'Medium' ? 8 : 5}
                pathOptions={{ ...getMarkerColor(point.priority), fillOpacity: 0.6, weight: 2 }}
                eventHandlers={{
                  click: () => {
                    setMapView({ center: [point.latitude, point.longitude], zoom: 15 });
                  }
                }}
              >
                <Popup className="custom-dark-popup">
                  <div className="bg-[#0F172A] border border-[#334155] p-3 rounded-lg shadow-xl text-white min-w-[220px] -m-3">
                     <p className="font-bold text-sm mb-1 truncate" title={point.location}>{point.location}</p>
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-xs text-[#CBD5E1]">ID: {point.caseId}</span>
                       <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                         point.priority === 'High' ? 'bg-rose-500/20 text-rose-400' :
                         point.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                         'bg-cyan-500/20 text-cyan-400'
                       }`}>{point.priority}</span>
                     </div>
                     <p className="text-xs text-[#94A3B8] mb-3 border-t border-[#1E293B] pt-2">
                       Status: <span className="text-white">{point.status || 'Active'}</span>
                     </p>
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         const event = new CustomEvent('track_case_request', { detail: point.caseId });
                         window.dispatchEvent(event);
                         setIsFullScreen(false);
                         setTimeout(() => {
                           const el = document.getElementById('track');
                           if (el) {
                             const y = el.getBoundingClientRect().top + window.scrollY - 80;
                             window.scrollTo({ top: y, behavior: 'smooth' });
                           }
                         }, 100);
                       }}
                       className="w-full py-2 bg-[#1E293B] hover:bg-[#334155] text-cyan-400 text-xs font-bold rounded transition-colors shadow-inner"
                     >
                       View Case Record
                     </button>
                  </div>
                </Popup>
                <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-dark-tooltip">
                  <div className="bg-[#0F172A] border border-[#334155] p-2 rounded shadow-lg text-white">
                     <p className="font-bold text-sm">{point.location}</p>
                     <p className="text-[10px] text-[#64748B] uppercase">{point.priority} Priority (Click to view)</p>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* Floating Legend & Regional Stats */}
          <div className="absolute bottom-6 left-6 z-[400] flex flex-col md:flex-row gap-4 pointer-events-none">
            
            {/* Legend */}
            <div className="bg-[rgba(15,23,42,0.85)] backdrop-blur-md border border-[#334155] p-4 rounded-xl shadow-lg flex flex-col gap-3 pointer-events-auto">
               <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
                 <span className="text-xs font-bold text-[#CBD5E1]">High Priority</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                 <span className="text-xs font-bold text-[#CBD5E1]">Medium Priority</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                 <span className="text-xs font-bold text-[#CBD5E1]">Low Priority</span>
               </div>
            </div>

            {/* Regional Stats */}
            <div className="hidden md:flex bg-[rgba(15,23,42,0.85)] backdrop-blur-md border border-[#334155] p-4 rounded-xl shadow-lg flex-col gap-2 pointer-events-auto min-w-[250px]">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700 pb-2 mb-1">Active Regions Map</h4>
               {locationStats.length === 0 ? (
                 <p className="text-xs text-slate-500 italic">No active regions mapped.</p>
               ) : (
                 locationStats.map(([loc, stats]) => (
                   <div 
                     key={loc} 
                     onClick={() => handleRegionClick(stats)}
                     className="flex items-center justify-between text-sm py-1.5 px-2 -mx-2 rounded hover:bg-[#1E293B] cursor-pointer transition-colors"
                   >
                     <span className="text-slate-200 truncate max-w-[120px]" title={loc}>{loc}</span>
                     <div className="flex gap-1.5 ml-4">
                       {stats.High > 0 && <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold shadow-sm" title="High">{stats.High} H</span>}
                       {stats.Medium > 0 && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold shadow-sm" title="Medium">{stats.Medium} M</span>}
                       {stats.Low > 0 && <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-bold shadow-sm" title="Low">{stats.Low} L</span>}
                     </div>
                   </div>
                 ))
               )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
