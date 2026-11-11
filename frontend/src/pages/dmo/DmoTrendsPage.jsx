import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FilterBar } from '../../components/common/FilterBar';
import { DiseaseTrendsChart } from '../../components/dmo/DiseaseTrendsChart';
import { useHealthData } from '../../context/HealthDataContext';
import { exportToCsv } from '../../services/exportService';
import { LineChart, Calendar, TrendingUp, AlertTriangle, Download, ArrowUpRight } from 'lucide-react';

export function DmoTrendsPage() {
  const { kpis, trendsChartData, trendGranularity, selectedDisease } = useHealthData();

  const handleExportTrends = () => {
    const csvData = trendsChartData.map((t) => ({
      Interval: t.fullLabel || t.label,
      Current_Cases: t.currentCases,
      Previous_Period_Baseline: t.prevCases,
      Moving_Average_7Day: t.movingAvg,
      Disease_Focus: selectedDisease,
      Granularity: trendGranularity,
    }));

    exportToCsv({
      filename: `Surveillance_Trends_${trendGranularity}_${selectedDisease}.csv`,
      data: csvData,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Epidemic Trends & Surveillance Curves</h1>
            <Badge variant="teal" size="sm">Time Series Modeling</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Analyze daily moving averages, weekly outbreak velocity, and comparison against previous period baseline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="navy" size="sm" icon={Download} onClick={handleExportTrends}>
            Export Trend Points (.csv)
          </Button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <FilterBar />

      {/* Epidemic Trend Summary Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
            <span>7-Day Moving Average</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 mt-2">
            {trendsChartData.length > 0 ? trendsChartData[trendsChartData.length - 1]?.movingAvg : 0} cases / day
          </div>
          <div className="text-xs text-rose-600 font-semibold mt-1">
            +{kpis.percentDelta}% vs previous period
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
            <span>Total Cases in Horizon</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 mt-2">
            {kpis.totalCases.toLocaleString()} cases
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Preceding baseline: {kpis.prevPeriodCases.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
            <span>Surveillance Alert Condition</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-2">
            Active Surge Watch
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            7-day average exceeds threshold curve
          </div>
        </div>
      </div>

      {/* Interactive Trends Chart */}
      <Card
        title="Epidemiological Surveillance Curve Comparison"
        subtitle="Comparing active daily cases against historical baseline and 7-day moving average"
      >
        <DiseaseTrendsChart />
      </Card>
    </div>
  );
}
