import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  LineChart,
  Building2,
  MapPin,
  FileSpreadsheet,
  PlusCircle,
  UploadCloud,
  History,
  Shield,
  Hospital,
  ChevronRight,
  DatabaseZap
} from 'lucide-react';
import { Badge } from '../common/Badge';

export function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const isDmo = user?.role === ROLES.DMO;

  const dmoNavItems = [
    {
      to: '/dmo/overview',
      label: 'District Overview',
      icon: LayoutDashboard,
      description: 'District-wide surveillance KPI',
    },
    {
      to: '/dmo/analytics',
      label: 'Disease Analytics',
      icon: Users,
      description: 'Disease-wise & age breakdown',
    },
    {
      to: '/dmo/trends',
      label: 'Trends & Outbreaks',
      icon: LineChart,
      description: 'Daily, weekly & monthly curves',
    },
    {
      to: '/dmo/hospitals',
      label: 'Hospital Comparison',
      icon: Building2,
      description: 'Caseloads & reporting compliance',
    },
    {
      to: '/dmo/map',
      label: 'Geographic GIS Map',
      icon: MapPin,
      description: 'Village & hospital hotspot map',
    },
    {
      to: '/dmo/reports',
      label: 'Reports & Exports',
      icon: FileSpreadsheet,
      description: 'CSV, Excel and PDF generation',
    },
  ];

  const hospitalNavItems = [
    {
      to: '/hospital/entry',
      label: 'Daily Disease Entry',
      icon: PlusCircle,
      description: 'Direct tally count logging',
    },
    {
      to: '/hospital/upload',
      label: 'CSV & Excel Upload',
      icon: UploadCloud,
      description: 'Batch file upload & validation',
    },
    {
      to: '/hospital/history',
      label: 'Submission History',
      icon: History,
      description: 'Audit logs & upload receipts',
    },
  ];

  const currentNavItems = isDmo ? dmoNavItems : hospitalNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDmo ? (
              <div className="p-1.5 rounded-lg bg-navy-50 text-navy-900 border border-navy-200">
                <Shield className="w-4 h-4 text-navy-700" />
              </div>
            ) : (
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                <Hospital className="w-4 h-4 text-teal-600" />
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {isDmo ? 'DMO Portal' : 'Hospital Portal'}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {isDmo ? 'District Command' : 'Reporting Terminal'}
              </div>
            </div>
          </div>
          <Badge variant={isDmo ? 'primary' : 'teal'} size="sm">
            {isDmo ? 'Officer' : 'Hospital'}
          </Badge>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isDmo ? 'District Surveillance Menu' : 'Daily Operations Menu'}
          </div>

          {currentNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? isDmo
                        ? 'bg-navy-900 text-white shadow-sm font-semibold'
                        : 'bg-teal-700 text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 transition-colors ${
                        isActive
                          ? 'text-teal-300'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <div className="flex-1 leading-snug">
                      <div className="text-sm">{item.label}</div>
                      <div
                        className={`text-[11px] font-normal leading-tight ${
                          isActive ? 'text-teal-100/90' : 'text-slate-400'
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 self-center text-teal-300/80" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Facility Information Box */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="p-3 bg-white rounded-lg border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-1.5">
              <DatabaseZap className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Surveillance Node
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-900 truncate">
              {isDmo ? user?.jurisdiction : user?.facilityName}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {isDmo ? 'All Sub-districts Synced' : `Code: ${user?.facilityCode || 'HOSP-KA-01'}`}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Live Status:</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Operational
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

