import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Map as MapIcon } from 'lucide-react';
import { motion } from 'framer-motion';

// Use same StatusBadge as Registry or define a simple one here
function StatusBadge({ status }) {
  const styles = { 
    'Closed': "bg-teal-950/50 text-teal-400 border border-teal-500/30", 
    'In Progress': "bg-cyan-950/50 text-cyan-400 border border-cyan-500/30", 
    'Evidence Verified': "bg-cyan-950/50 text-cyan-400 border border-cyan-500/30",
    'Submitted': "bg-[#1E293B] text-[#CBD5E1] border border-[#334155]"
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || 'bg-slate-800 text-slate-400'}`}>{status || 'Submitted'}</span>;
}

const LOCATION_COORDS = {
  "Bangalore Urban": [12.9716, 77.5946],
  "Mysore": [12.2958, 76.6394],
  "Mangalore": [12.9141, 74.8560],
  "Delhi Central": [28.6139, 77.2090],
  "Mumbai Metropolitan": [19.0760, 72.8777],
  "Chennai": [13.0827, 80.2707],
};

export default function GeoRadar({ cases }) {
  const mappedCases = cases.map(c => {
    if (c.latitude && c.longitude) return c;
    const fallback = LOCATION_COORDS[c.location];
    if (fallback) {
      // Add slight jitter so multiple cases in same city don't completely overlap
      return { 
        ...c, 
        latitude: fallback[0] + (Math.random() * 0.02 - 0.01), 
        longitude: fallback[1] + (Math.random() * 0.02 - 0.01) 
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col p-6 max-w-7xl mx-auto w-full"
    >
      <div className="bg-[rgba(15,23,42,0.75)] backdrop-blur-md rounded-[2rem] border border-[#1E293B] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col h-full overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 md:p-8 border-b border-[#1E293B] bg-[#0F172A] shrink-0 gap-4">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center tracking-tight">
              <MapIcon className="w-8 h-8 text-cyan-400 mr-3"/> Live Geo-Radar
            </h2>
            <p className="text-sm text-[#64748B] font-medium mt-1">Real-time tracking of active field operations and target beacons.</p>
          </div>
          <span className="px-4 py-2 bg-cyan-950/50 text-cyan-400 rounded-xl text-sm font-bold border border-cyan-500/30 shadow-inner flex items-center">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-2"></span>
            {mappedCases.length} Active Targets
          </span>
        </div>
        
        <div className="flex-1 relative z-0 bg-[#020617]">
          {/* Tactical Overlay Elements */}
          <div className="absolute inset-0 pointer-events-none z-[400] shadow-[inset_0_0_100px_rgba(2,6,23,1)]"></div>
          
          <MapContainer center={[12.9716, 77.5946]} zoom={11} className="h-full w-full">
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {mappedCases.map(c => (
              <React.Fragment key={c.id}>
                {c.status !== 'Closed' && (
                  <Circle 
                    center={[c.latitude, c.longitude]} 
                    pathOptions={{ color: c.priority === 'High' ? '#f43f5e' : '#6366f1', fillColor: c.priority === 'High' ? '#f43f5e' : '#6366f1', fillOpacity: 0.1 }} 
                    radius={2000} 
                  />
                )}
                <Marker position={[c.latitude, c.longitude]}>
                  <Popup className="tactical-popup">
                    <div className="font-sans p-1">
                      <h3 className="font-black text-[#0F172A] text-base mb-1 tracking-tight">{c.id}</h3>
                      <p className="text-xs font-bold text-[#64748B] mb-3 uppercase tracking-wider">{c.subjectName}</p>
                      <StatusBadge status={c.status} />
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
          </MapContainer>
        </div>
      </div>
    </motion.div>
  );
}
