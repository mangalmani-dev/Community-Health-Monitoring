import React, { useState, useMemo } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SubmissionDetailModal } from '../../components/hospital/SubmissionDetailModal';
import { CorrectionModal } from '../../components/hospital/CorrectionModal';
import { useHealthData } from '../../context/HealthDataContext';
import { useNotification } from '../../context/NotificationContext';
import { exportToCsv, exportToExcel } from '../../services/exportService';
import {
  History,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Search,
  Eye,
  Edit3,
  Filter,
  PlusCircle,
  FileUp,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function HospitalHistoryPage() {
  const { submissions } = useHealthData();
  const { addToast } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);

  // Filtered and searched submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesSearch =
        sub.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.date.includes(searchQuery) ||
        (sub.submittedBy && sub.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sub.notes && sub.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' ||
        sub.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchQuery, statusFilter]);

  const handleOpenDetail = (sub) => {
    setSelectedSubmission(sub);
    setDetailModalOpen(true);
  };

  const handleOpenCorrection = (sub) => {
    setSelectedSubmission(sub);
    setCorrectionModalOpen(true);
  };

  const handleExportAllSubmissions = () => {
    const exportData = filteredSubmissions.map((s) => ({
      Submission_ID: s.id,
      Reporting_Date: s.date,
      Channel: s.type,
      Total_Cases: s.casesReported,
      OPD_Cases: s.opdCount ?? '—',
      IPD_Cases: s.ipdCount ?? '—',
      Submitted_By: s.submittedBy,
      Recorded_Timestamp: s.timestamp,
      Status: s.status,
      Revisions_Count: s.corrections ? s.corrections.length : 0,
      Notes: s.notes || '',
    }));

    exportToExcel({
      filename: `Hospital_Submission_History_${new Date().toISOString().split('T')[0]}.xlsx`,
      sheets: [{ name: 'Submissions Audit', data: exportData }],
    });

    addToast({
      title: 'Ledger Exported',
      message: `Exported ${exportData.length} submission audit logs to Excel.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Submission History & Audit Trail</h1>
            <Badge variant="teal" size="sm">Audited Ledger</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Historical audit log of daily disease entries and spreadsheet uploads with revision history and corrections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Download} onClick={handleExportAllSubmissions}>
            Export Ledger (.xlsx)
          </Button>
          <Link to="/hospital/entry">
            <Button variant="primary" size="sm" icon={PlusCircle}>New Daily Entry</Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ID, date, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-slate-50/50 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <span className="text-slate-400 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {['all', 'verified', 'corrected', 'flagged'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md capitalize transition ${
                  statusFilter === st
                    ? 'bg-navy-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong>{filteredSubmissions.length}</strong> of {submissions.length} total transmissions
        </div>
      </div>

      {/* History Table Card */}
      <Card
        title="Surveillance Transmission Ledger"
        subtitle="Every transmission is cryptographically timestamped and maintains full audit revisions"
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Submission Ref ID</th>
                <th className="py-3 px-4">Reporting Date</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4 text-right">Reported Cases</th>
                <th className="py-3 px-4">Submitted By</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Revisions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredSubmissions.map((sub) => {
                const revisionsCount = sub.corrections?.length || 0;

                return (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-navy-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      {sub.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{sub.date}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        {sub.type.includes('Batch') ? (
                          <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-navy-800" />
                        )}
                        {sub.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-extrabold text-navy-900 text-sm">
                        {sub.casesReported}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">cases</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{sub.submittedBy}</td>
                    <td className="py-3 px-4 text-slate-400">{sub.timestamp}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          sub.status === 'Verified'
                            ? 'success'
                            : sub.status === 'Corrected'
                            ? 'info'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {revisionsCount > 0 ? (
                        <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                          {revisionsCount} Rev
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(sub)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition"
                          title="View Submission Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenCorrection(sub)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition"
                          title="Make Audited Correction"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredSubmissions.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No matching submission records found for current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      <SubmissionDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        submission={selectedSubmission}
        onOpenCorrection={handleOpenCorrection}
      />

      {/* Correction Modal */}
      <CorrectionModal
        isOpen={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        submission={selectedSubmission}
      />
    </div>
  );
}
