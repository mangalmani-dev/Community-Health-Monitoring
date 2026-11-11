import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { useHealthData } from '../../context/HealthDataContext';
import { Users, HeartPulse, UserCheck } from 'lucide-react';

export function DemographicAnalytics() {
  const { demographics } = useHealthData();

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-navy-950 text-white p-2.5 rounded-lg shadow-xl border border-slate-700 text-xs">
          <div className="font-bold text-teal-300">{data.group || data.gender || data.level}</div>
          <div className="mt-1">
            Count: <span className="font-extrabold text-white">{data.count}</span> ({data.percentage}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Age Group Breakdown */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-soft">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Age Cohort Distribution
            </h4>
            <p className="text-[10px] text-slate-400">Pediatric to geriatric breakdown</p>
          </div>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={demographics.ageGroups}
              layout="vertical"
              margin={{ top: 5, right: 25, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="group"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={70}
                tickFormatter={(v) => v.split(' ')[0] + ' ' + v.split(' ')[1]}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-100 text-xs">
          {demographics.ageGroups.map((a, i) => (
            <div key={i} className="flex justify-between items-center text-[11px]">
              <span className="text-slate-600 truncate">{a.group}</span>
              <span className="font-bold text-navy-900">{a.count} ({a.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Gender Distribution */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-soft">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Gender Distribution
            </h4>
            <p className="text-[10px] text-slate-400">Patient gender ratios</p>
          </div>
        </div>

        <div className="h-52 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={demographics.gender}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="count"
                nameKey="gender"
              >
                {demographics.gender.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomBarTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-100 text-xs">
          {demographics.gender.map((g, i) => (
            <div key={i} className="flex justify-between items-center text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                {g.gender}
              </span>
              <span className="font-bold text-navy-900">{g.count} ({g.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Disease Severity Split */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-soft">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Clinical Severity Split
            </h4>
            <p className="text-[10px] text-slate-400">OPD vs IPD / ICU admission</p>
          </div>
        </div>

        <div className="h-52 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={demographics.severity}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="count"
                nameKey="level"
              >
                {demographics.severity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomBarTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-100 text-xs">
          {demographics.severity.map((s, i) => (
            <div key={i} className="flex justify-between items-center text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.level.split(' ')[0]}
              </span>
              <span className="font-bold text-navy-900">{s.count} ({s.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

