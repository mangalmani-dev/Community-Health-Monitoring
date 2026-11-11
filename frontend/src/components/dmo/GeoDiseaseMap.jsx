import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useHealthData } from '../../context/HealthDataContext';
import { Building2, Home, AlertTriangle, ShieldCheck, Phone, User, Droplets } from 'lucide-react';
import { Badge } from '../common/Badge';

// Custom HTML DivIcon for Hospitals
const createHospitalIcon = (cases) =>
  L.divIcon({
    className: 'custom-leaflet-hospital-icon',
    html: `
      <div style="
        background: #0b2239;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
        font-weight: bold;
        font-size: 14px;
      ">
        🏥
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });

// Custom HTML DivIcon for Villages
const createVillageIcon = (risk) => {
  const bg = risk === 'High' ? '#ef4444' : risk === 'Moderate' ? '#f59e0b' : '#10b981';
  return L.divIcon({
    className: 'custom-leaflet-village-icon',
    html: `
      <div style="
        background: ${bg};
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        border: 2px solid white;
        font-size: 11px;
      ">
        📍
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
};

export function GeoDiseaseMap({ height = '520px' }) {
  const { geoEntities, selectedDisease, districtInfo } = useHealthData();
  const [showHospitals, setShowHospitals] = useState(true);
  const [showVillages, setShowVillages] = useState(true);
  const [showHeatCircles, setShowHeatCircles] = useState(true);

  const { hospitals, villages } = geoEntities;

  return (
    <div className="space-y-3">
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-700 uppercase tracking-wider">Map Layers:</span>
          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={showHospitals}
              onChange={(e) => setShowHospitals(e.target.checked)}
              className="rounded text-navy-900 focus:ring-teal-500"
            />
            <span>Hospitals ({hospitals.length})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={showVillages}
              onChange={(e) => setShowVillages(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Villages ({villages.length})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={showHeatCircles}
              onChange={(e) => setShowHeatCircles(e.target.checked)}
              className="rounded text-rose-600 focus:ring-teal-500"
            />
            <span>Case Volume Radii</span>
          </label>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> High Outbreak (&gt;150)
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Moderate Watch (50-150)
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Baseline Controlled
          </span>
        </div>
      </div>

      {/* Map Viewport Container */}
      <div
        style={{ height }}
        className="w-full rounded-xl overflow-hidden border border-slate-300 shadow-soft relative"
      >
        <MapContainer
          center={districtInfo.center}
          zoom={districtInfo.zoom}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Free Standard OpenStreetMap Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Hospital Markers & Catchment Radii */}
          {showHospitals &&
            hospitals.map((hosp) => {
              // Circle radius scaled to caseload
              const circleRadius = Math.min(45, Math.max(16, Math.sqrt(hosp.cases) * 1.5));
              const circleColor = hosp.cases > 300 ? '#ef4444' : hosp.cases > 150 ? '#f59e0b' : '#0d9488';

              return (
                <React.Fragment key={hosp.id}>
                  {showHeatCircles && (
                    <CircleMarker
                      center={hosp.coordinates}
                      radius={circleRadius}
                      fillColor={circleColor}
                      color={circleColor}
                      weight={1.5}
                      opacity={0.8}
                      fillOpacity={0.25}
                    />
                  )}

                  <Marker position={hosp.coordinates} icon={createHospitalIcon(hosp.cases)}>
                    <Popup>
                      <div className="p-3 text-xs min-w-[220px]">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                          <span className="font-bold text-slate-900">{hosp.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{hosp.taluk}</span>
                        </div>
                        <div className="mt-2 space-y-1 text-slate-600">
                          <div>
                            Facility Type: <span className="font-semibold text-slate-800">{hosp.classification}</span>
                          </div>
                          <div>
                            Reported Cases: <span className="font-extrabold text-navy-900">{hosp.cases}</span>
                          </div>
                          <div>
                            Severe Patients (IPD): <span className="font-bold text-rose-600">{hosp.severe}</span>
                          </div>
                          <div>
                            Reporting Compliance: <span className="font-bold text-teal-700">{hosp.compliance}</span>
                          </div>
                          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1 text-slate-500">
                              <Phone className="w-3 h-3 text-slate-400" /> {hosp.phone}
                            </span>
                            <Badge variant="teal" size="sm">Active Hub</Badge>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}

          {/* Village Markers */}
          {showVillages &&
            villages.map((vil) => {
              const vColor = vil.riskLevel === 'High' ? '#ef4444' : vil.riskLevel === 'Moderate' ? '#f59e0b' : '#10b981';
              return (
                <React.Fragment key={vil.id}>
                  {showHeatCircles && (
                    <CircleMarker
                      center={vil.coordinates}
                      radius={Math.min(25, Math.max(10, Math.sqrt(vil.cases) * 1.8))}
                      fillColor={vColor}
                      color={vColor}
                      weight={1}
                      opacity={0.8}
                      fillOpacity={0.35}
                    />
                  )}

                  <Marker position={vil.coordinates} icon={createVillageIcon(vil.riskLevel)}>
                    <Popup>
                      <div className="p-3 text-xs min-w-[210px]">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                          <span className="font-bold text-slate-900">{vil.name}</span>
                          <span className="text-[10px] font-bold text-rose-600">{vil.riskLevel} Risk</span>
                        </div>
                        <div className="mt-2 space-y-1 text-slate-600">
                          <div>
                            Dominant Condition: <span className="font-semibold text-slate-800">{vil.dominantDisease}</span>
                          </div>
                          <div>
                            Village Caseload: <span className="font-extrabold text-navy-900">{vil.cases} cases</span>
                          </div>
                          <div>
                            Water Source: <span className="font-medium text-amber-700">{vil.waterSource}</span>
                          </div>
                          <div>
                            Assigned ASHA: <span className="font-semibold text-slate-700">{vil.ashaWorker}</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}
        </MapContainer>
      </div>
    </div>
  );
}

