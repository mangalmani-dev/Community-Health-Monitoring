import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FilterBar } from '../../components/common/FilterBar';
import { DiseaseDonutChart } from '../../components/dmo/DiseaseDonutChart';
import { useHealthData } from '../../context/HealthDataContext';
import {
  Users,
  Activity,
  AlertTriangle,
  Building2,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  ArrowRight,
  HeartPulse
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function DmoOverviewPage() {
  const { kpis, filteredHospitals, dateRange } = useHealthData();

  const horizonLabel =
    dateRange === '7d' ? 'Past 7 Days' : dateRange === '14d' ? 'Past 14 Days' : 'Past 30 Days';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">District Overview</h1>
            <Badge variant="primary" size="sm">Kaveri District HQ</Badge>
            <Badge variant="teal" size="sm">Live Surveillance Active</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Aggregated epidemiological surveillance, patient caseloads & facility compliance for Kaveri District.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Cycle: {horizonLabel}</span>
          </div>
          <Link to="/dmo/reports">
            <Button variant="navy" size="sm">Export Report</Button>
          </Link>
        </div>
      </div>

      {/* Global Filter Bar */}
      <FilterBar />

      {/* Dynamic KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-soft hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Reported Patients
            </span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-navy-900 tracking-tight">
              {kpis.totalCases.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center text-xs font-semibold text-teal-700 gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{kpis.percentDelta}% vs previous period</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-soft hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Severe Cases (IPD)
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-rose-600 tracking-tight">
              {kpis.severeCases.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center text-xs font-medium text-slate-500">
              <span>{((kpis.severeCases / (kpis.totalCases || 1)) * 100).toFixed(1)}% severe admission ratio</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-soft hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Network Facilities
            </span>
            <div className="p-2 rounded-lg bg-navy-50 text-navy-800">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-navy-900 tracking-tight">
              {kpis.activeHospitals} Units
            </div>
            <div className="mt-1 flex items-center text-xs font-semibold text-emerald-600 gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{kpis.reportingCompliance} compliance score</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-soft hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Outbreak Clusters
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-amber-700 tracking-tight">
              {kpis.activeHotspots} Focus Areas
            </div>
            <div className="mt-1 flex items-center text-xs font-medium text-slate-500">
              <span>Dengue & Waterborne watch list</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disease Distribution Donut & Compliance Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card
            title="Disease-Wise Analytics Snapshot"
            subtitle="Relative proportion and case volume for the selected query filters"
            action={
              <Link to="/dmo/analytics" className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1">
                Deep-dive Analytics <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <DiseaseDonutChart />
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card
            title="Facility Caseload Hierarchy"
            subtitle="Hospitals sorted by active patient volume"
            action={
              <Link to="/dmo/hospitals" className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1">
                View All Facilities <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="space-y-3">
              {filteredHospitals.slice(0, 5).map((hosp) => (
                <div
                  key={hosp.hospitalId}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50/80 border border-slate-100 hover:bg-white hover:border-slate-200 transition"
                >
                  <div className="overflow-hidden pr-2">
                    <div className="font-bold text-xs text-slate-900 truncate">{hosp.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {hosp.taluk} • <span className="font-semibold text-rose-600">{hosp.severeCases} severe</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-extrabold text-navy-900">{hosp.totalCases} cases</div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {hosp.complianceRate}% sync
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/dmo/trends"
          className="block p-4 rounded-xl bg-white border border-slate-200/80 shadow-soft hover:border-teal-500 hover:shadow-card transition group"
        >
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm text-navy-900 group-hover:text-teal-700">
              Epidemic Trends & Moving Averages
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compare daily, weekly, and monthly surveillance curves with 7-day moving averages.
          </p>
        </Link>

        <Link
          to="/dmo/map"
          className="block p-4 rounded-xl bg-white border border-slate-200/80 shadow-soft hover:border-teal-500 hover:shadow-card transition group"
        >
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm text-navy-900 group-hover:text-teal-700">
              Geographic Disease GIS Map
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Explore interactive hospital and village cluster map with caseload-scaled radii.
          </p>
        </Link>

        <Link
          to="/dmo/reports"
          className="block p-4 rounded-xl bg-white border border-slate-200/80 shadow-soft hover:border-teal-500 hover:shadow-card transition group"
        >
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm text-navy-900 group-hover:text-teal-700">
              Official Data Exports (CSV & Excel)
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Download validated Excel sheets, CSV records, and print official surveillance reports.
          </p>
        </Link>
      </div>
    </div>
  );
}
