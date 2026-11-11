import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmationModal } from '../../components/hospital/ConfirmationModal';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { useNotification } from '../../context/NotificationContext';
import { parseCsvFile, parseExcelFile, generateSampleCsvContent, validateRow } from '../../services/fileParser';
import { exportToCsv, exportToExcel } from '../../services/exportService';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileText,
  XCircle,
  Eye,
  Check,
  Building2,
  Filter,
  FileCode,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HospitalUploadPage() {
  const { user } = useAuth();
  const { addHospitalBatchUpload } = useHealthData();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'errors' | 'valid'
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File drop / select handler
  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const extension = uploadedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(extension)) {
      addToast({
        title: 'Unsupported File Format',
        message: 'Please upload a CSV (.csv) or Microsoft Excel (.xlsx, .xls) spreadsheet.',
        type: 'error',
      });
      return;
    }

    setIsProcessing(true);
    setFile({ name: uploadedFile.name, size: (uploadedFile.size / 1024).toFixed(1) + ' KB' });

    try {
      let result;
      if (extension === 'csv') {
        result = await parseCsvFile(uploadedFile);
      } else {
        result = await parseExcelFile(uploadedFile);
      }

      setParsedData(result);
      addToast({
        title: 'Spreadsheet Parsed & Validated',
        message: `Parsed ${result.totalRows} rows: ${result.validCount} compliant, ${result.invalidCount} with issues.`,
        type: result.invalidCount > 0 ? 'warning' : 'success',
      });
    } catch (err) {
      addToast({
        title: 'Parsing Failed',
        message: err.message || 'Could not parse spreadsheet structure.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Load demo spreadsheet with simulated validation issues & duplicates
  const handleLoadDemo = () => {
    const seenKeys = new Set();
    const demoRawRows = [
      { Date: '2026-11-10', Hospital_Code: 'CGH-KA-042', Disease_Name: 'Dengue Fever', Patient_Count: 8, Severity_Level: 'Moderate', Ward_Type: 'IPD' },
      { Date: '2026-11-10', Hospital_Code: 'CGH-KA-042', Disease_Name: 'Acute Diarrhea (ADD)', Patient_Count: 15, Severity_Level: 'Mild', Ward_Type: 'OPD' },
      { Date: '2026-11-10', Hospital_Code: 'CGH-KA-042', Disease_Name: 'Malaria', Patient_Count: 4, Severity_Level: 'Severe', Ward_Type: 'IPD' },
      { Date: '2026-11-10', Hospital_Code: 'CGH-KA-042', Disease_Name: 'Typhoid (Enteric)', Patient_Count: -3, Severity_Level: 'Mild', Ward_Type: 'OPD' }, // Negative count error
      { Date: '2026-11-10', Hospital_Code: 'CGH-KA-042', Disease_Name: 'Dengue Fever', Patient_Count: 4, Severity_Level: 'Moderate', Ward_Type: 'IPD' }, // Duplicate row
      { Date: '2026-11-10', Hospital_Code: 'CGH-KA-042', Disease_Name: 'Rare Neuro Virus X', Patient_Count: 2, Severity_Level: 'Severe', Ward_Type: 'ICU' }, // Unrecognized disease
      { Date: '2026-11-10', Hospital_Code: 'CGH-KA-042', Disease_Name: 'Viral Pyrexia (FUO)', Patient_Count: 18, Severity_Level: 'Mild', Ward_Type: 'OPD' },
      { Date: '2026-11-10', Hospital_Code: 'CGH-KA-042', Disease_Name: 'Acute Respiratory Inf.', Patient_Count: 11, Severity_Level: 'Mild', Ward_Type: 'OPD' },
    ];

    const validated = demoRawRows.map((r, i) => validateRow(r, i, seenKeys));
    const validCount = validated.filter((r) => r.status === 'Valid').length;
    const invalidCount = validated.length - validCount;

    setFile({ name: 'demo_hospital_batch_with_errors.xlsx', size: '18.4 KB' });
    setParsedData({
      filename: 'demo_hospital_batch_with_errors.xlsx',
      fileSize: '18.4 KB',
      totalRows: validated.length,
      validCount,
      invalidCount,
      rows: validated,
    });

    addToast({
      title: 'Demo File Loaded',
      message: 'Loaded sample with deliberate validation errors & duplicates for review.',
      type: 'info',
    });
  };

  // Download Error Report CSV containing only invalid rows
  const handleDownloadErrorReport = () => {
    if (!parsedData) return;

    const errorRows = parsedData.rows
      .filter((r) => r.status === 'Invalid')
      .map((r) => ({
        Row_Number: r.id,
        Date: r.date,
        Disease_Name: r.disease,
        Patient_Count: r.count,
        Severity: r.severity,
        Ward: r.ward,
        Validation_Errors: r.errors.join('; '),
      }));

    if (errorRows.length === 0) {
      addToast({
        title: 'No Errors Detected',
        message: 'All rows in this spreadsheet are valid!',
        type: 'info',
      });
      return;
    }

    exportToCsv({
      filename: `Validation_Errors_${file?.name || 'report'}.csv`,
      data: errorRows,
    });

    addToast({
      title: 'Error Report Downloaded',
      message: `Exported ${errorRows.length} error records to CSV with corrective diagnostic notes.`,
      type: 'info',
    });
  };

  // Download Standard Templates
  const handleDownloadTemplateCsv = () => {
    const csvStr = generateSampleCsvContent();
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hospital_surveillance_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplateExcel = () => {
    const sampleRows = [
      { Date: '2026-11-11', Hospital_Code: 'CGH-KA-042', Disease_Name: 'Dengue Fever', Patient_Count: 8, Severity_Level: 'Moderate', Ward_Type: 'IPD' },
      { Date: '2026-11-11', Hospital_Code: 'CGH-KA-042', Disease_Name: 'Acute Diarrhea (ADD)', Patient_Count: 15, Severity_Level: 'Mild', Ward_Type: 'OPD' },
      { Date: '2026-11-11', Hospital_Code: 'CGH-KA-042', Disease_Name: 'Malaria', Patient_Count: 4, Severity_Level: 'Severe', Ward_Type: 'IPD' },
      { Date: '2026-11-11', Hospital_Code: 'CGH-KA-042', Disease_Name: 'Typhoid (Enteric)', Patient_Count: 5, Severity_Level: 'Mild', Ward_Type: 'OPD' },
      { Date: '2026-11-11', Hospital_Code: 'CGH-KA-042', Disease_Name: 'Viral Pyrexia (FUO)', Patient_Count: 19, Severity_Level: 'Mild', Ward_Type: 'OPD' },
      { Date: '2026-11-11', Hospital_Code: 'CGH-KA-042', Disease_Name: 'Acute Respiratory Inf.', Patient_Count: 12, Severity_Level: 'Mild', Ward_Type: 'OPD' },
    ];

    exportToExcel({
      filename: 'hospital_surveillance_template.xlsx',
      sheets: [{ name: 'Surveillance Intake', data: sampleRows }],
    });
  };

  // Commit valid rows
  const handleConfirmCommit = () => {
    if (!parsedData) return;
    const validRows = parsedData.rows.filter((r) => r.status === 'Valid');
    if (validRows.length === 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newSub = addHospitalBatchUpload({
        filename: file?.name || 'batch_upload.xlsx',
        fileSize: file?.size || '20.0 KB',
        validRows,
        submittedBy: user?.name || 'Dr. Rajesh Varma',
        notes: `Committed ${validRows.length} valid records from ${file?.name}.`,
      });

      setIsSubmitting(false);
      setIsConfirmModalOpen(false);

      addToast({
        title: 'Batch Successfully Synchronized',
        message: `Registered ${validRows.length} records under Ref ${newSub.id}. DMO District Registry updated.`,
        type: 'success',
      });

      navigate('/hospital/history');
    }, 600);
  };

  // Rows filtered by active tab
  const displayRows = parsedData
    ? parsedData.rows.filter((r) => {
        if (filterMode === 'errors') return r.status === 'Invalid';
        if (filterMode === 'valid') return r.status === 'Valid';
        return true;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">CSV & Excel Batch Upload</h1>
            <Badge variant="teal" size="sm">Client-Side Schema Validator</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Upload institutional patient logs in bulk with automatic error checking, duplicate detection, and instant preview.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" icon={Download} onClick={handleDownloadTemplateCsv}>
            Template (.csv)
          </Button>
          <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={handleDownloadTemplateExcel}>
            Template (.xlsx)
          </Button>
          <Button variant="secondary" size="sm" icon={Sparkles} onClick={handleLoadDemo}>
            Load Demo File
          </Button>
        </div>
      </div>

      {/* Upload Zone */}
      <Card
        title="Upload Surveillance Spreadsheet"
        subtitle="Accepts standard CSV (.csv) or Microsoft Excel (.xlsx, .xls) files"
      >
        <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-teal-500 hover:bg-teal-50/20 transition-all group">
          <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isProcessing}
          />
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            {isProcessing ? 'Analyzing and validating rows...' : 'Drag & drop disease spreadsheet here, or click to browse'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            Mandatory columns: <code className="text-navy-900 bg-slate-100 px-1 py-0.5 rounded font-mono">Date</code>,{' '}
            <code className="text-navy-900 bg-slate-100 px-1 py-0.5 rounded font-mono">Disease_Name</code>,{' '}
            <code className="text-navy-900 bg-slate-100 px-1 py-0.5 rounded font-mono">Patient_Count</code>,{' '}
            <code className="text-navy-900 bg-slate-100 px-1 py-0.5 rounded font-mono">Severity_Level</code>,{' '}
            <code className="text-navy-900 bg-slate-100 px-1 py-0.5 rounded font-mono">Ward_Type</code>.
          </p>
        </div>
      </Card>

      {/* Preview Section */}
      {parsedData && (
        <Card
          title="Spreadsheet Validation Preview"
          subtitle={`File: ${file?.name} (${file?.size}) — Total: ${parsedData.totalRows} rows`}
          action={
            <div className="flex items-center gap-2">
              {parsedData.invalidCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={handleDownloadErrorReport}
                  className="text-rose-700 border-rose-300 hover:bg-rose-50"
                >
                  Download Error Report ({parsedData.invalidCount})
                </Button>
              )}
            </div>
          }
        >
          {/* Validation Banner */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Validation Summary:</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {parsedData.validCount} Valid Rows
              </span>
              {parsedData.invalidCount > 0 && (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {parsedData.invalidCount} Rejected Rows
                </span>
              )}
            </div>

            {/* Filter Tabs for table */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
              {[
                { id: 'all', label: `All (${parsedData.totalRows})` },
                { id: 'errors', label: `Errors Only (${parsedData.invalidCount})` },
                { id: 'valid', label: `Valid (${parsedData.validCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterMode(tab.id)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    filterMode === tab.id
                      ? 'bg-navy-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Disease Diagnosed</th>
                  <th className="py-2.5 px-3 text-right">Count</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Ward</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Validation Diagnostics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {displayRows.map((row) => (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      row.status === 'Invalid' ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-400 font-mono font-medium">{row.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{row.date}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{row.disease}</td>
                    <td className={`py-2.5 px-3 text-right font-extrabold ${row.count < 0 ? 'text-rose-600' : 'text-navy-900'}`}>
                      {row.count}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{row.severity}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                        {row.ward}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={row.status === 'Valid' ? 'success' : 'danger'} size="sm">
                        {row.status === 'Valid' ? 'Passed' : 'Failed'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-xs">
                      {row.errors && row.errors.length > 0 ? (
                        <div className="space-y-0.5">
                          {row.errors.map((err, eIdx) => (
                            <div key={eIdx} className="text-rose-700 font-medium flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                              <span>{err}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-500" /> Compliant
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Commit Actions */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Only the <strong>{parsedData.validCount} valid records</strong> will be synchronized to the surveillance registry.
            </span>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setParsedData(null)}>
                Clear File
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={UploadCloud}
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={parsedData.validCount === 0}
              >
                Commit {parsedData.validCount} Valid Records
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmCommit}
        isSubmitting={isSubmitting}
        title="Confirm Batch Spreadsheet Ingestion"
        description="Verify before committing parsed spreadsheet records to the district repository."
        summaryItems={[
          { label: 'Spreadsheet File', value: file?.name || 'upload.xlsx' },
          { label: 'Valid Records to Commit', value: `${parsedData?.validCount || 0} rows` },
          { label: 'Rejected Rows (Skipped)', value: `${parsedData?.invalidCount || 0} rows` },
          { label: 'Hospital Facility', value: user?.facilityName || 'City General Civil Hospital' },
        ]}
      />
    </div>
  );
}
