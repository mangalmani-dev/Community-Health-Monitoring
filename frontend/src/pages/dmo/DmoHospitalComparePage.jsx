import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FilterBar } from '../../components/common/FilterBar';
import { HospitalComparisonChart } from '../../components/dmo/HospitalComparisonChart';
import { HospitalComparisonTable } from '../../components/dmo/HospitalComparisonTable';
import { useHealthData } from '../../context/HealthDataContext';
import { exportToExcel } from '../../services/exportService';
import { Building2, Download, ShieldCheck, BarChart3 } from 'lucide-react';

export function DmoHospitalComparePage() {
  const { filteredHospitals, dateRange, selectedTaluk } = useHealthData();

  const handleExportRanking = () => {
    const sheetData = filteredHospitals.map((h) => ({
      Hospital_Name: h.name,
      Facility_Type: h.type,
      Taluk: h.taluk,
      Reported_Cases: h.totalCases,
      Severe_IPD_Cases: h.severeCases,
      Reporting_Compliance: `${h.complianceRate}%`,
      Dengue_Cases: h.dengue,
      Diarrhea_Cases: h.diarrhea,
      Viral_Fever_Cases: h.viralFever,
      Last_Submitted: h.lastSubmitted,
      Sync_Status: h.status,
    }));

    exportToExcel({
      filename: `Hospital_Comparison_Report_${dateRange}.xlsx`,
      sheets: [{ name: 'Facility Caseloads', data: sheetData }],
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Hospital-Wise Comparison</h1>
            <Badge variant="primary" size="sm">30 Reporting Units</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Comparative caseloads, inpatient severity, reporting timeliness, and disease mix across network facilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="navy" size="sm" icon={Download} onClick={handleExportRanking}>
            Export Comparative Matrix (.xlsx)
          </Button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <FilterBar />

      {/* Comparative Bar Chart */}
      <Card
        title="Comparative Caseload Volume & Primary Conditions"
        subtitle="Comparing total patient admissions, Dengue and Diarrhea incidents per health facility"
      >
        <HospitalComparisonChart />
      </Card>

      {/* Sortable Hospital Table */}
      <Card
        title="Network Facility Surveillance Ledger"
        subtitle="Click any column header to sort by name, cases, severity, or reporting compliance"
      >
        <HospitalComparisonTable />
      </Card>
    </div>
  );
}
