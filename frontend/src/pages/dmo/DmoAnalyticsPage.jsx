import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FilterBar } from '../../components/common/FilterBar';
import { DiseaseDonutChart } from '../../components/dmo/DiseaseDonutChart';
import { DemographicAnalytics } from '../../components/dmo/DemographicAnalytics';
import { useHealthData } from '../../context/HealthDataContext';
import { exportToCsv } from '../../services/exportService';
import { Download, PieChart, Users, Activity, Layers } from 'lucide-react';

export function DmoAnalyticsPage() {
  const { diseaseBreakdown, kpis, dateRange, selectedTaluk } = useHealthData();

  const handleExportBreakdown = () => {
    const csvData = diseaseBreakdown.map((item) => ({
      Disease_Name: item.name,
      Category: item.category,
      Reported_Cases: item.count,
      Percentage_Share: `${item.percentage}%`,
      Horizon: dateRange,
      Taluk_Filter: selectedTaluk,
    }));

    exportToCsv({
      filename: `Disease_Analytics_Breakdown_${dateRange}.csv`,
      data: csvData,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Disease-Wise Analytics</h1>
            <Badge variant="teal" size="sm">Epidemiological Distribution</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Donut visualizations, disease proportions, demographic cohorts, and clinical severity breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="navy" size="sm" icon={Download} onClick={handleExportBreakdown}>
            Export Breakdown (.csv)
          </Button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <FilterBar />

      {/* Disease Distribution Donut Card */}
      <Card
        title="Communicable Disease Proportions & Case Volumes"
        subtitle="Visualizing relative share among reported infectious conditions"
      >
        <DiseaseDonutChart />
      </Card>

      {/* Demographic Breakdown Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
          <Users className="w-5 h-5 text-teal-700" />
          <h3 className="font-bold text-slate-900 text-base">Demographic & Clinical Severity Analysis</h3>
        </div>

        <DemographicAnalytics />
      </div>

      {/* Comprehensive Disease Case Ledger */}
      <Card
        title="Complete Disease Incidence Ledger"
        subtitle="Ranked summary of all tracked communicable diseases"
      >
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-4">Disease Condition</th>
                <th className="py-2.5 px-4">Surveillance Category</th>
                <th className="py-2.5 px-4 text-right">Reported Cases</th>
                <th className="py-2.5 px-4 text-right">Percentage Distribution</th>
                <th className="py-2.5 px-4 text-center">Incidence Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {diseaseBreakdown.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">{item.category}</td>
                  <td className="py-2.5 px-4 text-right font-extrabold text-navy-900">{item.count}</td>
                  <td className="py-2.5 px-4 text-right font-semibold text-teal-700">{item.percentage}%</td>
                  <td className="py-2.5 px-4 text-center">
                    <div className="w-32 bg-slate-100 h-2 rounded-full mx-auto overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
