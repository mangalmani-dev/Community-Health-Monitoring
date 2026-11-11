import React from 'react';
import { useHealthData } from '../../context/HealthDataContext';
import { Filter, Calendar, RotateCcw, Building2, MapPin, Activity, Sparkles } from 'lucide-react';
import { Badge } from './Badge';

export function FilterBar({ className = '' }) {
  const {
    dateRange,
    setDateRange,
    selectedDisease,
    setSelectedDisease,
    selectedHospital,
    setSelectedHospital,
    selectedTaluk,
    setSelectedTaluk,
    resetFilters,
    allDiseases,
    allHospitals,
    allTaluks,
  } = useHealthData();

  const isFiltered =
    dateRange !== '30d' ||
    selectedDisease !== 'all' ||
    selectedHospital !== 'all' ||
    selectedTaluk !== 'all';

  return (
    <div className={`bg-white p-4 rounded-xl border border-slate-200/90 shadow-soft space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Surveillance Query Filters
            </span>
            <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">
              Updates all charts, tables & GIS layers in real-time
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mock data demonstration badge */}
          <Badge variant="teal" size="sm" className="hidden md:inline-flex">
            <Sparkles className="w-3 h-3 mr-1 text-teal-600" />
            Demonstration Dataset
          </Badge>

          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-md border border-rose-200 transition"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Date Range Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            Date Horizon
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full text-xs font-semibold py-2 px-2.5 rounded-lg border border-slate-300 bg-slate-50/50 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
          >
            <option value="7d">Past 7 Days (Recent Surge)</option>
            <option value="14d">Past 14 Days (Incubation Period)</option>
            <option value="30d">Past 30 Days (Full Epidemiological Cycle)</option>
          </select>
        </div>

        {/* Disease Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-rose-600" />
            Disease Focus
          </label>
          <select
            value={selectedDisease}
            onChange={(e) => setSelectedDisease(e.target.value)}
            className="w-full text-xs font-semibold py-2 px-2.5 rounded-lg border border-slate-300 bg-slate-50/50 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
          >
            <option value="all">All Monitored Diseases</option>
            <option value="dengue">Dengue Fever (Vector)</option>
            <option value="diarrhea">Acute Diarrhea / ADD (Water)</option>
            <option value="malaria">Malaria (Vector)</option>
            <option value="typhoid">Typhoid / Enteric (Water)</option>
            <option value="viralFever">Viral Pyrexia / FUO (General)</option>
            <option value="respiratory">Acute Respiratory / ARI (Air)</option>
            <option value="cholera">Suspected Cholera (Outbreak)</option>
            <option value="hepatitis">Viral Hepatitis (Water)</option>
          </select>
        </div>

        {/* Hospital Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-navy-800" />
            Healthcare Facility
          </label>
          <select
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="w-full text-xs font-semibold py-2 px-2.5 rounded-lg border border-slate-300 bg-slate-50/50 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
          >
            <option value="all">All District Facilities (8 Units)</option>
            {allHospitals.map((hosp) => (
              <option key={hosp.id} value={hosp.id}>
                {hosp.name} ({hosp.taluk.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>

        {/* Taluk / Block Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            Administrative Taluk
          </label>
          <select
            value={selectedTaluk}
            onChange={(e) => setSelectedTaluk(e.target.value)}
            className="w-full text-xs font-semibold py-2 px-2.5 rounded-lg border border-slate-300 bg-slate-50/50 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
          >
            <option value="all">All District Taluks (4 Taluks)</option>
            {allTaluks.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

