import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FilterBar } from '../../components/common/FilterBar';
import { useHealthData } from '../../context/HealthDataContext';
import { useNotification } from '../../context/NotificationContext';
import { exportToExcel, exportToCsv } from '../../services/exportService';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Printer,
  CheckCircle2,
  Calendar,
  Building2,
  Activity,
  Layers
} from 'lucide-react';

export function DmoReportsPage() {
  const { filteredHospitals, diseaseBreakdown, kpis, dateRange, selectedTaluk } = useHealthData();
  const { addToast } = useNotification();
  const [reportType, setReportType] = useState('epidemic_summary');
  const [isExporting, setIsExporting] = useState(false);

  // Prepare active report dataset
  const generateExportPayload = () => {
    if (reportType === 'hospital_caseloads') {
      return filteredHospitals.map((h) => ({
        Facility_Name: h.name,
        Classification: h.type,
        Taluk: h.taluk,
        Total_Cases: h.totalCases,
        Severe_Cases_IPD: h.severeCases,
        Dengue_Count: h.dengue,
        Diarrhea_Count: h.diarrhea,
        Viral_Fever_Count: h.viralFever,
        Compliance_Rate: `${h.complianceRate}%`,
        Last_Reported: h.lastSubmitted,
        Sync_Status: h.status,
      }));
    }

    // Default: epidemic_summary
    return diseaseBreakdown.map((d) => ({
      Condition: d.name,
      Category: d.category,
      Total_Reported_Cases: d.count,
      Percentage_Share: `${d.percentage}%`,
      Horizon: dateRange,
      Taluk_Filter: selectedTaluk,
      Reporting_Facilities_Count: filteredHospitals.length,
    }));
  };

  const handleExportCsv = () => {
    setIsExporting(true);
    const data = generateExportPayload();
    const filename = `Kaveri_District_${reportType}_${dateRange}.csv`;

    exportToCsv({ filename, data });
    setIsExporting(false);

    addToast({
      title: 'CSV File Exported',
      message: `Downloaded ${filename} (${data.length} records).`,
      type: 'success',
    });
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    const summaryData = diseaseBreakdown.map((d) => ({
      Condition: d.name,
      Category: d.category,
      Total_Reported_Cases: d.count,
      Percentage_Share: `${d.percentage}%`,
    }));

    const hospitalData = filteredHospitals.map((h) => ({
      Facility: h.name,
      Type: h.type,
      Taluk: h.taluk,
      Cases: h.totalCases,
      Severe: h.severeCases,
      Compliance: `${h.complianceRate}%`,
    }));

    const filename = `Kaveri_District_Surveillance_Bulletin_${dateRange}.xlsx`;

    exportToExcel({
      filename,
      sheets: [
        { name: 'Disease Breakdown', data: summaryData },
        { name: 'Hospital Caseloads', data: hospitalData },
      ],
    });
    setIsExporting(false);

    addToast({
      title: 'Excel Workbook Exported',
      message: `Downloaded multi-sheet workbook ${filename}.`,
      type: 'success',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const activePayload = generateExportPayload();

  return (
    <div className="space-y-6">
      {/* Page Header (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Reports & Surveillance Data Exports</h1>
            <Badge variant="primary" size="sm">Official Dissemination</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Generate standardized epidemiological bulletins, hospital compliance sheets, and printable official audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint}>
            Print Report
          </Button>
          <Button variant="outline" size="sm" icon={FileText} onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Button variant="navy" size="sm" icon={FileSpreadsheet} onClick={handleExportExcel}>
            Export Excel (.xlsx)
          </Button>
        </div>
      </div>

      {/* Global Filter Bar (Hidden when printing) */}
      <div className="print:hidden">
        <FilterBar />
      </div>

      {/* Printable Report Header (Visible on screen and in print) */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-soft space-y-4">
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase">
                Official Health Surveillance Bulletin
              </span>
              <span className="text-xs text-slate-400 font-medium">Ref: DMO-KVR-2026/W45</span>
            </div>
            <h2 className="text-xl font-extrabold text-navy-900 mt-1.5">
              District Public Health Surveillance & Incidence Summary
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Office of the District Medical Officer, Kaveri Health Division, Karnataka
            </p>
          </div>

          <div className="text-right text-xs">
            <div className="font-bold text-slate-900">Reporting Horizon: {dateRange.toUpperCase()}</div>
            <div className="text-slate-500 mt-0.5">
              Compiled on: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Quick Snapshot Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Total Cases Logged</div>
            <div className="text-lg font-extrabold text-navy-900 mt-0.5">{kpis.totalCases.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Severe IPD Inpatients</div>
            <div className="text-lg font-extrabold text-rose-600 mt-0.5">{kpis.severeCases.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Facilities Reporting</div>
            <div className="text-lg font-extrabold text-navy-900 mt-0.5">{filteredHospitals.length} Units</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Reporting Compliance</div>
            <div className="text-lg font-extrabold text-emerald-700 mt-0.5">{kpis.reportingCompliance}</div>
          </div>
        </div>

        {/* Report Slice Selector (Hidden when printing) */}
        <div className="pt-2 flex items-center justify-between print:hidden">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setReportType('epidemic_summary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                reportType === 'epidemic_summary'
                  ? 'bg-navy-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Disease Distribution Table
            </button>
            <button
              type="button"
              onClick={() => setReportType('hospital_caseloads')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                reportType === 'hospital_caseloads'
                  ? 'bg-navy-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Hospital Caseload Table
            </button>
          </div>

          <span className="text-xs text-slate-400">
            Previewing {activePayload.length} rows ready for export
          </span>
        </div>

        {/* Live Report Preview Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                {activePayload.length > 0 &&
                  Object.keys(activePayload[0]).map((key) => (
                    <th key={key} className="py-2.5 px-3">
                      {key.replace(/_/g, ' ')}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activePayload.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  {Object.values(row).map((val, cIdx) => (
                    <td key={cIdx} className="py-2 px-3 text-slate-800">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Signature Footer for Print View */}
        <div className="pt-8 border-t border-slate-200 hidden print:block">
          <div className="flex justify-between items-end text-xs text-slate-600">
            <div>
              <p className="font-semibold text-slate-900">Dr. Ananya Sharma, MD</p>
              <p>District Medical Officer (DMO)</p>
              <p>Kaveri District Public Health Authority</p>
            </div>
            <div className="text-right">
              <p>Government of Karnataka</p>
              <p>Department of Health & Family Welfare</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
