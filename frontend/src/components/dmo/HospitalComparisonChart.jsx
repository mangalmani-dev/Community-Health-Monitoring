import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useHealthData } from '../../context/HealthDataContext';

export function HospitalComparisonChart() {
  const { filteredHospitals } = useHealthData();

  // Shorten hospital names for the XAxis tick
  const chartData = filteredHospitals.map((h) => ({
    name: h.name.replace('Primary Health Center', 'PHC').replace('Community Health Center', 'CHC').replace('Hospital', 'Hosp'),
    fullName: h.name,
    totalCases: h.totalCases,
    dengue: h.dengue,
    diarrhea: h.diarrhea,
    severeCases: h.severeCases,
    complianceRate: h.complianceRate,
    taluk: h.taluk,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-navy-950 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
          <div className="font-bold text-teal-300 pb-1 border-b border-slate-800">
            {data.fullName}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{data.taluk}</div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-300">Total Cases:</span>
              <span className="font-bold text-white">{data.totalCases}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-rose-400">Severe Ratio:</span>
              <span className="font-bold text-rose-400">{data.severeCases} cases</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-teal-400">Reporting Compliance:</span>
              <span className="font-bold text-teal-400">{data.complianceRate}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            angle={-15}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
          <Bar dataKey="totalCases" name="Total Patients Reported" fill="#0b2239" radius={[4, 4, 0, 0]} />
          <Bar dataKey="dengue" name="Dengue Cases" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="diarrhea" name="Acute Diarrhea (ADD)" fill="#0d9488" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

