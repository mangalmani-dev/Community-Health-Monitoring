import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useHealthData } from '../../context/HealthDataContext';

export function DiseaseTrendsChart() {
  const { trendsChartData, trendGranularity, setTrendGranularity, selectedDisease } = useHealthData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-navy-950 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[200px]">
          <div className="font-bold text-teal-300 pb-1.5 border-b border-slate-700">
            {data.fullLabel || label}
          </div>
          <div className="space-y-1.5 mt-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Current Cases:
              </span>
              <span className="font-extrabold text-white">{data.currentCases}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-1 border-b-2 border-dashed border-slate-400 inline-block" /> Prev Period:
              </span>
              <span className="font-semibold text-slate-300">{data.prevCases}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="flex items-center gap-1.5 text-rose-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> 7-Day Moving Avg:
              </span>
              <span className="font-bold text-rose-300">{data.movingAvg}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Temporal Granularity Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          Showing <span className="font-bold text-navy-900">{selectedDisease.toUpperCase()}</span> surveillance curve comparison against preceding cycle
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          {['daily', 'weekly', 'monthly'].map((gran) => (
            <button
              key={gran}
              type="button"
              onClick={() => setTrendGranularity(gran)}
              className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition ${
                trendGranularity === gran
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {gran} Curve
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={trendsChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="currentCasesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
            />

            {/* Current period area fill */}
            <Area
              type="monotone"
              dataKey="currentCases"
              name="Current Cases"
              stroke="#0d9488"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#currentCasesGradient)"
            />

            {/* Previous period comparison line */}
            <Line
              type="monotone"
              dataKey="prevCases"
              name="Previous Period Baseline"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />

            {/* 7-Day Moving Average trendline */}
            <Line
              type="monotone"
              dataKey="movingAvg"
              name="7-Day Moving Average"
              stroke="#ef4444"
              strokeWidth={2.2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

