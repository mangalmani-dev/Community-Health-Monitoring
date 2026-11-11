import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FilterBar } from '../../components/common/FilterBar';
import { GeoDiseaseMap } from '../../components/dmo/GeoDiseaseMap';
import { useHealthData } from '../../context/HealthDataContext';
import { MapPin, AlertTriangle, Layers, ShieldAlert, Compass } from 'lucide-react';

export function DmoGeoMapPage() {
  const { geoEntities, selectedDisease, dateRange } = useHealthData();
  const { hospitals, villages } = geoEntities;

  const highRiskVillages = villages.filter((v) => v.riskLevel === 'High');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Geographic Disease Analysis</h1>
            <Badge variant="teal" size="sm">Interactive GIS Mapping</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Geospatial mapping of disease clusters, hospital catchments, village health posts, and outbreak radii.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="danger" size="sm">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {highRiskVillages.length} Priority Hotspots
          </Badge>
        </div>
      </div>

      {/* Global Filter Bar */}
      <FilterBar />

      {/* GIS Leaflet Map Card */}
      <Card
        title="Interactive District GIS Surveillance Map"
        subtitle="OpenStreetMap tiles with real-time case-volume-scaled radii and hospital/village pins"
        bodyClassName="p-3 sm:p-4"
      >
        <GeoDiseaseMap height="520px" />
      </Card>

      {/* Priority Village Hotspot Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Compass className="w-4 h-4 text-teal-700" />
          Active Village Surveillance Posts
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {villages.map((vil) => (
            <div
              key={vil.id}
              className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-soft hover:shadow-card transition"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant={
                    vil.riskLevel === 'High'
                      ? 'danger'
                      : vil.riskLevel === 'Moderate'
                      ? 'warning'
                      : 'success'
                  }
                  size="sm"
                >
                  {vil.riskLevel} Risk
                </Badge>
                <span className="text-[10px] text-slate-400 font-medium">{vil.taluk}</span>
              </div>
              <div className="font-bold text-sm text-slate-900">{vil.name}</div>
              <div className="text-xs text-slate-600 mt-0.5">{vil.dominantDisease}</div>
              <div className="mt-3 pt-2 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reported Cases:</span>
                  <span className="font-extrabold text-navy-900">{vil.cases}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Water Condition:</span>
                  <span className="font-medium text-amber-700 truncate max-w-[120px]">{vil.waterSource}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
