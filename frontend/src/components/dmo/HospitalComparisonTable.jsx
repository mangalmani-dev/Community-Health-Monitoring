import React, { useState, useMemo } from 'react';
import { useHealthData } from '../../context/HealthDataContext';
import { Building2, ArrowUpDown, ArrowUp, ArrowDown, Search, ShieldCheck } from 'lucide-react';
import { Badge } from '../common/Badge';

export function HospitalComparisonTable() {
  const { filteredHospitals } = useHealthData();
  const [sortField, setSortField] = useState('totalCases');
  const [sortAsc, setSortAsc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(false); // default to descending for numbers
    }
  };

  const sortedHospitals = useMemo(() => {
    let result = [...filteredHospitals];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.taluk.toLowerCase().includes(q) ||
          h.type.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [filteredHospitals, sortField, sortAsc, searchQuery]);

  const SortIndicator = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300 inline ml-1" />;
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-teal-600 inline ml-1 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-teal-600 inline ml-1 font-bold" />
    );
  };

  return (
    <div className="space-y-3">
      {/* Search Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          Showing <span className="font-bold text-navy-900">{sortedHospitals.length}</span> monitored health facilities
        </div>
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search facility or taluk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider select-none">
              <th className="py-3 px-4 cursor-pointer hover:text-navy-900" onClick={() => handleSort('name')}>
                Hospital / Health Center <SortIndicator field="name" />
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-navy-900" onClick={() => handleSort('taluk')}>
                Taluk <SortIndicator field="taluk" />
              </th>
              <th className="py-3 px-4 text-right cursor-pointer hover:text-navy-900" onClick={() => handleSort('totalCases')}>
                Reported Cases <SortIndicator field="totalCases" />
              </th>
              <th className="py-3 px-4 text-right cursor-pointer hover:text-navy-900" onClick={() => handleSort('severeCases')}>
                Severe (IPD) <SortIndicator field="severeCases" />
              </th>
              <th className="py-3 px-4 text-center cursor-pointer hover:text-navy-900" onClick={() => handleSort('complianceRate')}>
                Reporting Compliance <SortIndicator field="complianceRate" />
              </th>
              <th className="py-3 px-4">Hospital-Wise Disease Distribution</th>
              <th className="py-3 px-4 text-center">Sync Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {sortedHospitals.map((hosp) => {
              const total = hosp.totalCases || 1;
              const denguePct = Math.round((hosp.dengue / total) * 100);
              const diarrheaPct = Math.round((hosp.diarrhea / total) * 100);
              const viralPct = Math.round((hosp.viralFever / total) * 100);

              return (
                <tr key={hosp.hospitalId} className="hover:bg-teal-50/20 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {hosp.name}
                    </div>
                    <div className="text-[11px] text-slate-400">{hosp.type}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{hosp.taluk}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-navy-900 text-sm">
                    {hosp.totalCases}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-rose-600">
                    {hosp.severeCases}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full border text-[11px] ${
                        hosp.complianceRate >= 95
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : hosp.complianceRate >= 90
                          ? 'bg-teal-50 text-teal-700 border-teal-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {hosp.complianceRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 min-w-[200px]">
                    <div className="space-y-1">
                      {/* Proportional multi-segment bar */}
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                        <div style={{ width: `${denguePct}%` }} className="bg-rose-500" title={`Dengue: ${hosp.dengue} (${denguePct}%)`} />
                        <div style={{ width: `${diarrheaPct}%` }} className="bg-teal-600" title={`Diarrhea: ${hosp.diarrhea} (${diarrheaPct}%)`} />
                        <div style={{ width: `${viralPct}%` }} className="bg-indigo-500" title={`Viral: ${hosp.viralFever} (${viralPct}%)`} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span className="text-rose-600">Dengue {denguePct}%</span>
                        <span className="text-teal-700">Diarrhea {diarrheaPct}%</span>
                        <span className="text-indigo-600">Viral {viralPct}%</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={hosp.status === 'Synced' ? 'success' : 'warning'} size="sm">
                      {hosp.status}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

