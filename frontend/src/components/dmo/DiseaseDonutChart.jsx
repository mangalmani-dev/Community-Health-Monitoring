import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useHealthData } from '../../context/HealthDataContext';
import { Badge } from '../common/Badge';

export function DiseaseDonutChart() {
  const { diseaseBreakdown } = useHealthData();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-navy-950 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs">
          <div className="font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            {data.name}
          </div>
          <div className="mt-1 text-slate-300">
            Reported Cases: <span className="font-extrabold text-white">{data.count}</span>
          </div>
          <div className="text-slate-400">
            Proportion: <span className="font-semibold text-teal-300">{data.percentage}%</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
            Category: {data.category}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* Donut Chart Canvas */}
      <div className="lg:col-span-6 h-72 w-full flex items-center justify-center">
        {diseaseBreakdown.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={diseaseBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
                dataKey="count"
                nameKey="name"
              >
                {diseaseBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-xs text-slate-400">No matching cases for current filter</div>
        )}
      </div>

      {/* Disease Distribution Breakdown Table */}
      <div className="lg:col-span-6 space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {diseaseBreakdown.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-200 transition"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <div className="text-xs font-bold text-slate-900">{item.name}</div>
                <div className="text-[10px] text-slate-400">{item.category}</div>
              </div>
            </div>

            <div className="text-right flex items-center gap-3">
              <div>
                <div className="text-xs font-extrabold text-navy-900">{item.count}</div>
                <div className="text-[10px] font-medium text-slate-500">cases</div>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 min-w-[48px] text-center">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

