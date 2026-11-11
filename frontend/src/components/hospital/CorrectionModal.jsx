import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useHealthData } from '../../context/HealthDataContext';
import { useNotification } from '../../context/NotificationContext';
import { Edit3, CheckCircle2, AlertCircle, X, RotateCcw } from 'lucide-react';

export function CorrectionModal({ isOpen, onClose, submission }) {
  if (!isOpen || !submission) return null;

  const { correctSubmission } = useHealthData();
  const { addToast } = useNotification();

  const [counts, setCounts] = useState({
    dengue: submission.itemizedCounts?.dengue ?? 0,
    malaria: submission.itemizedCounts?.malaria ?? 0,
    diarrhea: submission.itemizedCounts?.diarrhea ?? 0,
    typhoid: submission.itemizedCounts?.typhoid ?? 0,
    viralFever: submission.itemizedCounts?.viralFever ?? 0,
    respiratory: submission.itemizedCounts?.respiratory ?? 0,
    cholera: submission.itemizedCounts?.cholera ?? 0,
    hepatitis: submission.itemizedCounts?.hepatitis ?? 0,
  });

  const [reason, setReason] = useState('');
  const [correctedBy, setCorrectedBy] = useState('Dr. Rajesh Varma (Medical Superintendent)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCountChange = (disease, val) => {
    const parsed = Math.max(0, parseInt(val, 10) || 0);
    setCounts((prev) => ({ ...prev, [disease]: parsed }));
  };

  const newTotal = Object.values(counts).reduce((a, b) => a + Number(b || 0), 0);
  const caseDiff = newTotal - submission.casesReported;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      addToast({
        title: 'Correction Reason Required',
        message: 'Please provide a clinical audit justification for modifying this record.',
        type: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      correctSubmission(submission.id, counts, reason.trim(), correctedBy);
      setIsSubmitting(false);

      addToast({
        title: 'Correction Successfully Committed',
        message: `Submission ${submission.id} updated to ${newTotal} cases. Audit history preserved.`,
        type: 'success',
      });

      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Audited Report Correction</h3>
                <span className="font-mono text-xs text-slate-600 bg-white px-2 py-0.5 rounded border">
                  {submission.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Reporting Date: {submission.date} • Currently logged: {submission.casesReported} cases
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Delta Banner */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Original Total: </span>
              <strong className="text-slate-800">{submission.casesReported} cases</strong>
            </div>
            <div>
              <span className="text-slate-500">Corrected Total: </span>
              <strong className="text-navy-900 text-sm font-extrabold">{newTotal} cases</strong>
            </div>
            <div>
              <span className="text-slate-500">Net Delta: </span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full ${
                  caseDiff > 0
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : caseDiff < 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {caseDiff > 0 ? `+${caseDiff}` : caseDiff}
              </span>
            </div>
          </div>

          {/* Disease Inputs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Update Case Tallies per Disease
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'dengue', label: 'Dengue Fever' },
                { id: 'malaria', label: 'Malaria' },
                { id: 'diarrhea', label: 'Acute Diarrhea' },
                { id: 'typhoid', label: 'Typhoid' },
                { id: 'viralFever', label: 'Viral Pyrexia' },
                { id: 'respiratory', label: 'Acute Respiratory' },
                { id: 'cholera', label: 'Cholera' },
                { id: 'hepatitis', label: 'Hepatitis' },
              ].map((item) => (
                <div key={item.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {item.label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={counts[item.id]}
                    onChange={(e) => handleCountChange(item.id, e.target.value)}
                    className="w-full text-xs font-bold py-1 px-2 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Clinical Justification for Correction <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Revised after PCR lab test re-confirmation; 2 patients were reclassified from Viral Pyrexia to Dengue..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Authorizing Medical Officer
            </label>
            <input
              type="text"
              value={correctedBy}
              onChange={(e) => setCorrectedBy(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Audit log will preserve pre-correction tallies permanently.
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} icon={CheckCircle2}>
                {isSubmitting ? 'Recording...' : 'Commit Audited Correction'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

