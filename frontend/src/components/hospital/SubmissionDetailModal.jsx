import React from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  FileText,
  Download,
  Calendar,
  Building2,
  Clock,
  User,
  History,
  X,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { exportToCsv } from '../../services/exportService';

export function SubmissionDetailModal({ isOpen, onClose, submission, onOpenCorrection }) {
  if (!isOpen || !submission) return null;

  const handleDownloadReceipt = () => {
    const receiptData = [
      { Field: 'Submission ID', Value: submission.id },
      { Field: 'Facility Name', Value: submission.facilityName },
      { Field: 'Facility Code', Value: submission.facilityCode },
      { Field: 'Reporting Date', Value: submission.date },
      { Field: 'Channel', Value: submission.type },
      { Field: 'Total Reported Cases', Value: submission.casesReported },
      { Field: 'OPD Cases', Value: submission.opdCount || 'N/A' },
      { Field: 'IPD Cases', Value: submission.ipdCount || 'N/A' },
      { Field: 'Submitted By', Value: submission.submittedBy },
      { Field: 'Status', Value: submission.status },
      { Field: 'Clinical Observations', Value: submission.notes || 'None' },
    ];

    if (submission.itemizedCounts) {
      Object.entries(submission.itemizedCounts).forEach(([k, v]) => {
        receiptData.push({ Field: `Count - ${k.toUpperCase()}`, Value: v });
      });
    }

    exportToCsv({
      filename: `Submission_Receipt_${submission.id}.csv`,
      data: receiptData,
    });
  };

  const itemized = submission.itemizedCounts || {};
  const hasCorrections = submission.corrections && submission.corrections.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-navy-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {submission.id}
              </span>
              <Badge
                variant={
                  submission.status === 'Verified'
                    ? 'success'
                    : submission.status === 'Corrected'
                    ? 'info'
                    : 'warning'
                }
                size="sm"
              >
                {submission.status}
              </Badge>
              {hasCorrections && (
                <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                  {submission.corrections.length} Revision(s)
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-lg mt-1">
              Surveillance Transmission Record
            </h3>
            <p className="text-xs text-slate-500">
              {submission.facilityName} • {submission.facilityCode}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Reporting Date</div>
              <div className="font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                {submission.date}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Total Cases</div>
              <div className="font-extrabold text-navy-900 text-base mt-0.5">
                {submission.casesReported} patients
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">OPD / IPD Ratio</div>
              <div className="font-bold text-slate-800 mt-1">
                {submission.opdCount !== undefined ? `${submission.opdCount} OPD / ${submission.ipdCount} IPD` : 'Consolidated'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Transmission Channel</div>
              <div className="font-bold text-slate-800 mt-1 truncate">
                {submission.type}
              </div>
            </div>
          </div>

          {/* Itemized Disease Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              Itemized Disease Case Breakdown
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(itemized).map(([key, val]) => (
                <div key={key} className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className="text-base font-extrabold text-navy-900 mt-0.5">
                    {val} <span className="text-[10px] font-normal text-slate-400">cases</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Observations */}
          <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/80 text-xs">
            <span className="font-bold text-slate-700 block mb-1">Clinical Observations & Field Notes:</span>
            <p className="text-slate-600 italic">
              "{submission.notes || 'No adverse clinical observations reported with this submission.'}"
            </p>
            <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Transmitted by: {submission.submittedBy}</span>
              <span>Timestamp: {submission.timestamp}</span>
            </div>
          </div>

          {/* Revision / Correction Audit Trail */}
          {hasCorrections && (
            <div className="border border-sky-200 bg-sky-50/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-sky-700" />
                <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wide">
                  Correction & Revision Audit Trail
                </h4>
              </div>

              <div className="space-y-2.5">
                {submission.corrections.map((rev, rIdx) => (
                  <div key={rIdx} className="bg-white p-3 rounded-lg border border-sky-100 text-xs shadow-xs">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 pb-1 border-b border-slate-100">
                      <span className="text-sky-800">Revision #{rev.revisionNumber}</span>
                      <span className="text-slate-400">{rev.timestamp}</span>
                    </div>
                    <div className="mt-2 text-slate-600">
                      <span className="font-semibold text-slate-800">Reason:</span> {rev.reason}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px]">
                      <span>
                        Previous: <strong className="text-slate-700">{rev.previousCases} cases</strong>
                      </span>
                      <span>→</span>
                      <span>
                        Updated to: <strong className="text-teal-700">{rev.newCases} cases</strong>
                      </span>
                      <span className="text-slate-400 ml-auto">Author: {rev.correctedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between flex-shrink-0">
          <Button variant="outline" size="sm" icon={Download} onClick={handleDownloadReceipt}>
            Download Receipt (.csv)
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="navy"
              size="sm"
              icon={Edit3}
              onClick={() => {
                onClose();
                onOpenCorrection(submission);
              }}
            >
              Request / Make Correction
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

