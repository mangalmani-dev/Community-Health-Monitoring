import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmationModal } from '../../components/hospital/ConfirmationModal';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { useNotification } from '../../context/NotificationContext';
import {
  PlusCircle,
  Calendar,
  Building2,
  Save,
  RotateCcw,
  FileUp,
  FileCheck2,
  Users,
  Stethoscope,
  HeartPulse,
  AlertCircle,
  HelpCircle,
  Bookmark
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function HospitalEntryPage() {
  const { user } = useAuth();
  const { addHospitalDailyEntry, draftDailyEntry, saveDraft, clearDraft } = useHealthData();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [reportingDate, setReportingDate] = useState(() => {
    return draftDailyEntry?.date || new Date().toISOString().split('T')[0];
  });

  const [ward, setWard] = useState(() => draftDailyEntry?.ward || 'General OPD & IPD');
  const [medicalOfficer, setMedicalOfficer] = useState(() => {
    return draftDailyEntry?.submittedBy || user?.name || 'Dr. Rajesh Varma';
  });

  // Separate OPD and IPD counts for realistic hospital triage
  const [opdCounts, setOpdCounts] = useState(() => {
    return (
      draftDailyEntry?.opdCounts || {
        dengue: 4,
        malaria: 2,
        diarrhea: 10,
        typhoid: 3,
        viralFever: 14,
        respiratory: 12,
        cholera: 0,
        hepatitis: 1,
      }
    );
  });

  const [ipdCounts, setIpdCounts] = useState(() => {
    return (
      draftDailyEntry?.ipdCounts || {
        dengue: 2,
        malaria: 1,
        diarrhea: 3,
        typhoid: 1,
        viralFever: 2,
        respiratory: 3,
        cholera: 0,
        hepatitis: 0,
      }
    );
  });

  // Clinical severity & age cohort breakdown
  const [ageCohort, setAgeCohort] = useState(() => {
    return draftDailyEntry?.ageCohort || { pediatric: 22, youth: 24, adult: 38, senior: 16 };
  });

  const [observations, setObservations] = useState(() => draftDailyEntry?.notes || '');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live consolidated counts
  const diseaseKeys = ['dengue', 'malaria', 'diarrhea', 'typhoid', 'viralFever', 'respiratory', 'cholera', 'hepatitis'];

  const consolidatedCounts = diseaseKeys.reduce((acc, key) => {
    acc[key] = (Number(opdCounts[key]) || 0) + (Number(ipdCounts[key]) || 0);
    return acc;
  }, {});

  const totalOpd = Object.values(opdCounts).reduce((a, b) => a + Number(b || 0), 0);
  const totalIpd = Object.values(ipdCounts).reduce((a, b) => a + Number(b || 0), 0);
  const totalPatients = totalOpd + totalIpd;
  const severeAdmissions = Math.round(totalIpd * 0.85);

  const handleOpdChange = (disease, val) => {
    const parsed = Math.max(0, parseInt(val, 10) || 0);
    setOpdCounts((prev) => ({ ...prev, [disease]: parsed }));
  };

  const handleIpdChange = (disease, val) => {
    const parsed = Math.max(0, parseInt(val, 10) || 0);
    setIpdCounts((prev) => ({ ...prev, [disease]: parsed }));
  };

  // Draft operations
  const handleSaveDraft = () => {
    saveDraft({
      date: reportingDate,
      ward,
      submittedBy: medicalOfficer,
      opdCounts,
      ipdCounts,
      ageCohort,
      notes: observations,
    });
    addToast({
      title: 'Draft Saved',
      message: 'Your entries have been saved locally. You may resume anytime.',
      type: 'info',
    });
  };

  const handleClearDraft = () => {
    clearDraft();
    setOpdCounts({ dengue: 0, malaria: 0, diarrhea: 0, typhoid: 0, viralFever: 0, respiratory: 0, cholera: 0, hepatitis: 0 });
    setIpdCounts({ dengue: 0, malaria: 0, diarrhea: 0, typhoid: 0, viralFever: 0, respiratory: 0, cholera: 0, hepatitis: 0 });
    setObservations('');
    addToast({
      title: 'Form Reset',
      message: 'Cleared draft state and reset disease counts.',
      type: 'info',
    });
  };

  // Commit Submission
  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newSub = addHospitalDailyEntry({
        date: reportingDate,
        facilityCode: user?.facilityCode || 'CGH-KA-042',
        facilityName: user?.facilityName || 'City General Civil Hospital',
        submittedBy: medicalOfficer,
        counts: consolidatedCounts,
        opdCounts,
        ipdCounts,
        severityBreakdown: {
          mild: totalOpd,
          moderate: Math.round(totalIpd * 0.4),
          severe: severeAdmissions,
        },
        notes: observations,
      });

      setIsSubmitting(false);
      setIsConfirmModalOpen(false);

      addToast({
        title: 'Report Transmitted Successfully',
        message: `Registered ${totalPatients} cases for ${reportingDate} under Ref ${newSub.id}. DMO database synchronized.`,
        type: 'success',
      });

      navigate('/hospital/history');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Daily Disease Count Entry</h1>
            <Badge variant="teal" size="sm">Hospital Reporting Terminal</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Log validated outpatient (OPD) and inpatient admission (IPD) communicable disease cases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {draftDailyEntry && (
            <Badge variant="warning" size="sm" className="hidden sm:inline-flex">
              <Bookmark className="w-3 h-3 mr-1" />
              Draft in Progress
            </Badge>
          )}
          <Link to="/hospital/upload">
            <Button variant="outline" size="sm" icon={FileUp}>Batch CSV / Excel Upload</Button>
          </Link>
        </div>
      </div>

      {/* Facility & Date Reporting Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Reporting Facility</div>
            <div className="text-base font-bold text-slate-900">{user?.facilityName || 'City General Civil Hospital'}</div>
            <div className="text-xs text-slate-500">
              Code: <span className="font-mono font-semibold">{user?.facilityCode || 'CGH-KA-042'}</span> • {user?.district || 'Kaveri District'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              Surveillance Date
            </label>
            <input
              type="date"
              value={reportingDate}
              onChange={(e) => setReportingDate(e.target.value)}
              className="text-xs font-bold py-1.5 px-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="pl-4 border-l border-slate-200 text-right">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Live Patient Tally</div>
            <div className="text-2xl font-extrabold text-navy-900 mt-0.5">
              {totalPatients} <span className="text-xs font-semibold text-teal-700">({totalOpd} OPD / {totalIpd} IPD)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disease Input Matrix */}
      <Card
        title="Communicable Disease Patient Matrix"
        subtitle="Specify validated patient counts divided into Outpatient (OPD) and Inpatient Hospital Admissions (IPD)"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'dengue', label: 'Dengue Fever', category: 'Vector-Borne', tagColor: 'danger' },
            { id: 'malaria', label: 'Malaria (Pv / Pf)', category: 'Vector-Borne', tagColor: 'warning' },
            { id: 'diarrhea', label: 'Acute Diarrhea (ADD)', category: 'Water-Borne', tagColor: 'teal' },
            { id: 'typhoid', label: 'Typhoid (Enteric)', category: 'Water-Borne', tagColor: 'teal' },
            { id: 'viralFever', label: 'Viral Pyrexia (FUO)', category: 'General Infection', tagColor: 'primary' },
            { id: 'respiratory', label: 'Acute Respiratory Inf.', category: 'Airborne', tagColor: 'primary' },
            { id: 'cholera', label: 'Suspected Cholera', category: 'Water-Borne', tagColor: 'danger' },
            { id: 'hepatitis', label: 'Viral Hepatitis', category: 'Water-Borne', tagColor: 'warning' },
          ].map((item) => {
            const diseaseTotal = (Number(opdCounts[item.id]) || 0) + (Number(ipdCounts[item.id]) || 0);

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-400 transition-all shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.category}
                  </span>
                  <Badge variant={item.tagColor} size="sm">
                    {diseaseTotal} Total
                  </Badge>
                </div>

                <div className="font-bold text-xs text-slate-900 leading-tight">
                  {item.label}
                </div>

                {/* Sub-inputs: OPD & IPD */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      OPD (Outpatient)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={opdCounts[item.id]}
                      onChange={(e) => handleOpdChange(item.id, e.target.value)}
                      className="w-full text-xs font-bold py-1.5 px-2 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-teal-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-rose-600 mb-0.5">
                      IPD (Admitted)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={ipdCounts[item.id]}
                      onChange={(e) => handleIpdChange(item.id, e.target.value)}
                      className="w-full text-xs font-bold py-1.5 px-2 border border-rose-200 rounded bg-rose-50/30 focus:ring-1 focus:ring-rose-500 text-rose-900"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clinical Observations & Sign-off */}
        <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Clinical Observations & Outbreak Context (Optional)
            </label>
            <textarea
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="e.g. Inflow of pediatric diarrhea patients originating from Rampur village near downstream canal; water sample tests sent for microbiology..."
              className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Signing Medical In-charge
            </label>
            <input
              type="text"
              value={medicalOfficer}
              onChange={(e) => setMedicalOfficer(e.target.value)}
              className="w-full p-2.5 text-xs font-semibold border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Authorized supervisor recorded in the surveillance ledger.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleClearDraft}>
              Reset Form
            </Button>
            <Button variant="secondary" size="sm" icon={Bookmark} onClick={handleSaveDraft}>
              Save Draft
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Ready to submit: <strong>{totalPatients} patients</strong> ({totalOpd} OPD, {totalIpd} IPD)
            </span>
            <Button
              variant="primary"
              size="md"
              icon={FileCheck2}
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={totalPatients === 0}
            >
              Submit Daily Report ({totalPatients})
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
        title="Confirm Surveillance Submission"
        description="Verify the case counts before transmission to the district surveillance network."
        summaryItems={[
          { label: 'Reporting Hospital', value: user?.facilityName || 'City General Civil Hospital' },
          { label: 'Surveillance Date', value: reportingDate },
          { label: 'Total Patients Logged', value: `${totalPatients} cases` },
          { label: 'Outpatient (OPD)', value: `${totalOpd} cases` },
          { label: 'Inpatient (IPD Admissions)', value: `${totalIpd} cases` },
          { label: 'Submitting Officer', value: medicalOfficer },
        ]}
      />
    </div>
  );
}
