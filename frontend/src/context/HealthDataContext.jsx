import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { MOCK_DISTRICT } from '../mock/mockDistricts';
import { MOCK_DISEASES } from '../mock/mockDiseases';
import { MOCK_HOSPITALS } from '../mock/mockHospitals';
import { MOCK_VILLAGES } from '../mock/mockVillages';
import { INITIAL_HOSPITAL_SUBMISSIONS } from '../mock/mockSubmissions';
import {
  STATIC_DAILY_RECORDS,
  STATIC_WEEKLY_TRENDS,
  STATIC_MONTHLY_TRENDS,
  STATIC_HOSPITAL_DISEASE_DISTRIBUTION,
  STATIC_HOSPITAL_DAILY_RECORDS
} from '../mock/mockSurveillanceData';

const HealthDataContext = createContext(null);

export function HealthDataProvider({ children }) {
  // Global filter state for DMO & Hospital views
  const [dateRange, setDateRange] = useState('30d'); // '7d' | '14d' | '30d'
  const [selectedDisease, setSelectedDisease] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState('all');
  const [selectedTaluk, setSelectedTaluk] = useState('all');
  const [trendGranularity, setTrendGranularity] = useState('daily'); // 'daily' | 'weekly' | 'monthly'

  // Submissions state
  const [submissions, setSubmissions] = useState(() => {
    const saved = localStorage.getItem('schm_hospital_submissions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_HOSPITAL_SUBMISSIONS;
      }
    }
    return INITIAL_HOSPITAL_SUBMISSIONS;
  });

  // Draft daily entry persistence
  const [draftDailyEntry, setDraftDailyEntry] = useState(() => {
    const saved = localStorage.getItem('schm_hospital_entry_draft');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Dynamic user-added records delta that updates DMO surveillance in real-time
  const [dynamicAddition, setDynamicAddition] = useState(() => {
    const saved = localStorage.getItem('schm_dynamic_addition');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { total: 0, dengue: 0, diarrhea: 0, malaria: 0, typhoid: 0, viralFever: 0, respiratory: 0, severe: 0 };
      }
    }
    return { total: 0, dengue: 0, diarrhea: 0, malaria: 0, typhoid: 0, viralFever: 0, respiratory: 0, severe: 0 };
  });

  // Persist submissions & additions to localStorage
  useEffect(() => {
    localStorage.setItem('schm_hospital_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('schm_dynamic_addition', JSON.stringify(dynamicAddition));
  }, [dynamicAddition]);

  const resetFilters = () => {
    setDateRange('30d');
    setSelectedDisease('all');
    setSelectedHospital('all');
    setSelectedTaluk('all');
    setTrendGranularity('daily');
  };

  /**
   * Action: Save draft for Daily Entry form
   */
  const saveDraft = useCallback((draftData) => {
    setDraftDailyEntry(draftData);
    localStorage.setItem('schm_hospital_entry_draft', JSON.stringify(draftData));
  }, []);

  const clearDraft = useCallback(() => {
    setDraftDailyEntry(null);
    localStorage.removeItem('schm_hospital_entry_draft');
  }, []);

  /**
   * Action: Add daily disease tally from Hospital Entry Form
   */
  const addHospitalDailyEntry = useCallback((entryData) => {
    const {
      date,
      facilityCode,
      facilityName,
      submittedBy,
      counts,
      opdCounts,
      ipdCounts,
      ageBreakdown,
      severityBreakdown,
      notes,
    } = entryData;

    const totalCount = Object.values(counts).reduce((a, b) => a + Number(b || 0), 0);
    const opdTotal = Object.values(opdCounts || {}).reduce((a, b) => a + Number(b || 0), 0);
    const ipdTotal = Object.values(ipdCounts || {}).reduce((a, b) => a + Number(b || 0), 0);
    const severeCount = severityBreakdown?.severe || Math.round(totalCount * 0.12);

    const newSubId = `SUB-${date.replace(/-/g, '')}-${String(Math.floor(Math.random() * 90) + 10)}`;

    const newSubmission = {
      id: newSubId,
      date,
      type: 'Direct Entry',
      casesReported: totalCount,
      opdCount: opdTotal,
      ipdCount: ipdTotal,
      submittedBy: submittedBy || 'Dr. Rajesh Varma',
      timestamp: 'Today, ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'Verified',
      fileSize: '—',
      notes: notes || `Direct clinical logging across OPD (${opdTotal}) and IPD (${ipdTotal}) wards.`,
      itemizedCounts: counts,
      opdCounts: opdCounts || {},
      ipdCounts: ipdCounts || {},
      demographics: {
        ageGroups: ageBreakdown || {
          pediatric: Math.round(totalCount * 0.22),
          youth: Math.round(totalCount * 0.25),
          adult: Math.round(totalCount * 0.38),
          senior: totalCount - Math.round(totalCount * 0.85),
        },
        severity: severityBreakdown || {
          mild: totalCount - severeCount - Math.round(totalCount * 0.25),
          moderate: Math.round(totalCount * 0.25),
          severe: severeCount,
        },
      },
      corrections: [],
      facilityCode: facilityCode || 'CGH-KA-042',
      facilityName: facilityName || 'City General Civil Hospital',
    };

    setSubmissions((prev) => [newSubmission, ...prev]);

    // Update dynamic addition to reflect in DMO metrics & charts immediately
    setDynamicAddition((prev) => ({
      total: prev.total + totalCount,
      dengue: prev.dengue + Number(counts.dengue || 0),
      diarrhea: prev.diarrhea + Number(counts.diarrhea || 0),
      malaria: prev.malaria + Number(counts.malaria || 0),
      typhoid: prev.typhoid + Number(counts.typhoid || 0),
      viralFever: prev.viralFever + Number(counts.viralFever || 0),
      respiratory: prev.respiratory + Number(counts.respiratory || 0),
      severe: prev.severe + severeCount,
    }));

    clearDraft();
    return newSubmission;
  }, [clearDraft]);

  /**
   * Action: Add batch upload from CSV/Excel
   */
  const addHospitalBatchUpload = useCallback((batchData) => {
    const { filename, fileSize, validRows, submittedBy, notes } = batchData;
    const totalCount = validRows.reduce((a, r) => a + Number(r.count || 0), 0);
    const opdCount = validRows.filter((r) => r.ward === 'OPD').reduce((a, r) => a + Number(r.count || 0), 0);
    const ipdCount = totalCount - opdCount;
    const dateStr = validRows[0]?.date || new Date().toISOString().split('T')[0];
    const isCsv = filename.toLowerCase().endsWith('.csv');

    const itemized = {
      dengue: 0,
      diarrhea: 0,
      malaria: 0,
      typhoid: 0,
      viralFever: 0,
      respiratory: 0,
      cholera: 0,
      hepatitis: 0,
    };

    let severeCount = 0;
    validRows.forEach((r) => {
      const d = r.disease.toLowerCase();
      if (d.includes('dengue')) itemized.dengue += r.count;
      else if (d.includes('diarrhea') || d.includes('add')) itemized.diarrhea += r.count;
      else if (d.includes('malaria')) itemized.malaria += r.count;
      else if (d.includes('typhoid')) itemized.typhoid += r.count;
      else if (d.includes('respiratory') || d.includes('ari')) itemized.respiratory += r.count;
      else if (d.includes('cholera')) itemized.cholera += r.count;
      else if (d.includes('hepatitis')) itemized.hepatitis += r.count;
      else itemized.viralFever += r.count;

      if (r.severity === 'Severe') severeCount += r.count;
    });

    const newSubId = `SUB-${dateStr.replace(/-/g, '')}-${String(Math.floor(Math.random() * 90) + 10)}`;

    const newSubmission = {
      id: newSubId,
      date: dateStr,
      type: isCsv ? 'CSV Batch Upload' : 'Excel Batch Upload',
      casesReported: totalCount,
      opdCount,
      ipdCount,
      submittedBy: submittedBy || 'Dr. Rajesh Varma',
      timestamp: 'Today, ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'Verified',
      fileSize: fileSize || '22.0 KB',
      filename,
      notes: notes || `Batch validated upload containing ${validRows.length} standardized rows.`,
      itemizedCounts: itemized,
      corrections: [],
      facilityCode: 'CGH-KA-042',
      facilityName: 'City General Civil Hospital',
    };

    setSubmissions((prev) => [newSubmission, ...prev]);

    setDynamicAddition((prev) => ({
      total: prev.total + totalCount,
      dengue: prev.dengue + itemized.dengue,
      diarrhea: prev.diarrhea + itemized.diarrhea,
      malaria: prev.malaria + itemized.malaria,
      typhoid: prev.typhoid + itemized.typhoid,
      viralFever: prev.viralFever + itemized.viralFever,
      respiratory: prev.respiratory + itemized.respiratory,
      severe: prev.severe + (severeCount || Math.round(totalCount * 0.1)),
    }));

    return newSubmission;
  }, []);

  /**
   * Action: Correction Workflow
   * Allows hospital to correct a previously submitted report while preserving full audit history!
   */
  const correctSubmission = useCallback((submissionId, updatedCounts, correctionReason, correctedBy) => {
    let diffTotal = 0;
    let diffDengue = 0;
    let diffDiarrhea = 0;

    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== submissionId) return sub;

        const previousCases = sub.casesReported;
        const newTotal = Object.values(updatedCounts).reduce((a, b) => a + Number(b || 0), 0);
        diffTotal = newTotal - previousCases;
        diffDengue = Number(updatedCounts.dengue || 0) - Number(sub.itemizedCounts?.dengue || 0);
        diffDiarrhea = Number(updatedCounts.diarrhea || 0) - Number(sub.itemizedCounts?.diarrhea || 0);

        const correctionEntry = {
          revisionNumber: (sub.corrections?.length || 0) + 1,
          previousCases,
          newCases: newTotal,
          previousItemized: { ...sub.itemizedCounts },
          newItemized: { ...updatedCounts },
          reason: correctionReason || 'Routine clinical audit correction',
          correctedBy: correctedBy || 'Dr. Rajesh Varma',
          timestamp: 'Corrected on ' + new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        };

        return {
          ...sub,
          casesReported: newTotal,
          itemizedCounts: { ...updatedCounts },
          status: 'Corrected',
          corrections: [...(sub.corrections || []), correctionEntry],
        };
      })
    );

    // Adjust dynamic addition for DMO metrics
    if (diffTotal !== 0 || diffDengue !== 0 || diffDiarrhea !== 0) {
      setDynamicAddition((prev) => ({
        ...prev,
        total: Math.max(0, prev.total + diffTotal),
        dengue: Math.max(0, prev.dengue + diffDengue),
        diarrhea: Math.max(0, prev.diarrhea + diffDiarrhea),
      }));
    }
  }, []);

  // 1. Sliced daily records based on date range
  const filteredDailyRecords = useMemo(() => {
    let daysToInclude = 30;
    if (dateRange === '7d') daysToInclude = 7;
    else if (dateRange === '14d') daysToInclude = 14;

    const sliced = STATIC_DAILY_RECORDS.slice(STATIC_DAILY_RECORDS.length - daysToInclude);

    // Merge dynamic additions into the latest day so DMO views reflect all submissions
    const records = sliced.map((r, idx) => {
      if (idx === sliced.length - 1 && dynamicAddition.total > 0) {
        return {
          ...r,
          total: r.total + dynamicAddition.total,
          dengue: r.dengue + dynamicAddition.dengue,
          diarrhea: r.diarrhea + dynamicAddition.diarrhea,
          malaria: r.malaria + dynamicAddition.malaria,
          typhoid: r.typhoid + dynamicAddition.typhoid,
          viralFever: r.viralFever + dynamicAddition.viralFever,
          respiratory: r.respiratory + dynamicAddition.respiratory,
          severe: r.severe + dynamicAddition.severe,
          movingAvg7Day: r.movingAvg7Day + Math.round(dynamicAddition.total / 7),
        };
      }
      return r;
    });

    // If a hospital is selected, scale or filter by that hospital's portion
    if (selectedHospital !== 'all') {
      const hosp = MOCK_HOSPITALS.find((h) => h.id === selectedHospital);
      const share = hosp ? hosp.beds / 800 : 1;
      return records.map((r) => {
        const total = Math.max(1, Math.round(r.total * share));
        return {
          ...r,
          total,
          dengue: Math.round(r.dengue * share),
          diarrhea: Math.round(r.diarrhea * share),
          malaria: Math.round(r.malaria * share),
          typhoid: Math.round(r.typhoid * share),
          viralFever: Math.round(r.viralFever * share),
          respiratory: Math.round(r.respiratory * share),
          prevPeriodTotal: Math.round(r.prevPeriodTotal * share),
          movingAvg7Day: Math.round(r.movingAvg7Day * share),
          severe: Math.round(r.severe * share),
          moderate: Math.round(r.moderate * share),
          mild: Math.round(r.mild * share),
          male: Math.round(r.male * share),
          female: Math.round(r.female * share),
          otherGender: Math.round(r.otherGender * share),
          pediatric: Math.round(r.pediatric * share),
          youth: Math.round(r.youth * share),
          adult: Math.round(r.adult * share),
          senior: Math.round(r.senior * share),
        };
      });
    }

    // If a taluk is selected, filter by that taluk's population proportion
    if (selectedTaluk !== 'all') {
      const talukObj = MOCK_DISTRICT.taluks.find((t) => t.name === selectedTaluk);
      const proportion = talukObj ? talukObj.population / MOCK_DISTRICT.totalPopulation : 0.3;
      return records.map((r) => {
        const total = Math.max(1, Math.round(r.total * proportion));
        return {
          ...r,
          total,
          dengue: Math.round(r.dengue * proportion),
          diarrhea: Math.round(r.diarrhea * proportion),
          malaria: Math.round(r.malaria * proportion),
          typhoid: Math.round(r.typhoid * proportion),
          viralFever: Math.round(r.viralFever * proportion),
          respiratory: Math.round(r.respiratory * proportion),
          prevPeriodTotal: Math.round(r.prevPeriodTotal * proportion),
          movingAvg7Day: Math.round(r.movingAvg7Day * proportion),
          severe: Math.round(r.severe * proportion),
          moderate: Math.round(r.moderate * proportion),
          mild: Math.round(r.mild * proportion),
          male: Math.round(r.male * proportion),
          female: Math.round(r.female * proportion),
          otherGender: Math.round(r.otherGender * proportion),
          pediatric: Math.round(r.pediatric * proportion),
          youth: Math.round(r.youth * proportion),
          adult: Math.round(r.adult * proportion),
          senior: Math.round(r.senior * proportion),
        };
      });
    }

    return records;
  }, [dateRange, selectedHospital, selectedTaluk, dynamicAddition]);

  // 2. Aggregate KPIs based on filtered slice
  const kpis = useMemo(() => {
    let totalCases = 0;
    let prevPeriodCases = 0;
    let severeCases = 0;

    filteredDailyRecords.forEach((r) => {
      if (selectedDisease === 'all') {
        totalCases += r.total;
        prevPeriodCases += r.prevPeriodTotal;
      } else {
        const val = r[selectedDisease] || 0;
        totalCases += val;
        prevPeriodCases += Math.round(val * 0.85);
      }
      severeCases += r.severe;
    });

    const percentDelta = prevPeriodCases > 0
      ? (((totalCases - prevPeriodCases) / prevPeriodCases) * 100).toFixed(1)
      : '0.0';

    return {
      totalCases,
      prevPeriodCases,
      percentDelta,
      isIncrease: Number(percentDelta) >= 0,
      severeCases,
      activeHospitals: MOCK_HOSPITALS.filter((h) => selectedTaluk === 'all' || h.taluk === selectedTaluk).length,
      reportingCompliance: '96.4%',
      activeHotspots: selectedDisease === 'all' ? 4 : 2,
    };
  }, [filteredDailyRecords, selectedDisease, selectedTaluk]);

  // 3. Disease-wise totals and percentage distribution
  const diseaseBreakdown = useMemo(() => {
    const counts = {
      dengue: 0,
      diarrhea: 0,
      viralFever: 0,
      respiratory: 0,
      malaria: 0,
      typhoid: 0,
      cholera: 0,
      hepatitis: 0,
    };

    filteredDailyRecords.forEach((r) => {
      counts.dengue += r.dengue;
      counts.diarrhea += r.diarrhea;
      counts.viralFever += r.viralFever;
      counts.respiratory += r.respiratory;
      counts.malaria += r.malaria;
      counts.typhoid += r.typhoid;
      counts.cholera += r.cholera;
      counts.hepatitis += r.hepatitis;
    });

    const totalSum = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

    const list = [
      { id: 'dengue', name: 'Dengue Fever', count: counts.dengue, color: '#ef4444', category: 'Vector-Borne' },
      { id: 'diarrhea', name: 'Acute Diarrhea (ADD)', count: counts.diarrhea, color: '#0d9488', category: 'Water-Borne' },
      { id: 'viralFever', name: 'Viral Pyrexia (FUO)', count: counts.viralFever, color: '#6366f1', category: 'General' },
      { id: 'respiratory', name: 'Acute Respiratory Inf.', count: counts.respiratory, color: '#8b5cf6', category: 'Airborne' },
      { id: 'malaria', name: 'Malaria', count: counts.malaria, color: '#f97316', category: 'Vector-Borne' },
      { id: 'typhoid', name: 'Typhoid (Enteric)', count: counts.typhoid, color: '#0284c7', category: 'Water-Borne' },
      { id: 'hepatitis', name: 'Viral Hepatitis', count: counts.hepatitis, color: '#eab308', category: 'Water-Borne' },
      { id: 'cholera', name: 'Suspected Cholera', count: counts.cholera, color: '#dc2626', category: 'Water-Borne' },
    ];

    return list
      .map((item) => ({
        ...item,
        percentage: ((item.count / totalSum) * 100).toFixed(1),
      }))
      .filter((item) => selectedDisease === 'all' || item.id === selectedDisease)
      .sort((a, b) => b.count - a.count);
  }, [filteredDailyRecords, selectedDisease]);

  // 4. Time series data for trends chart
  const trendsChartData = useMemo(() => {
    if (trendGranularity === 'weekly') {
      return STATIC_WEEKLY_TRENDS.map((w) => ({
        label: w.weekId,
        fullLabel: w.label,
        currentCases: selectedDisease === 'all' ? w.currentCases : (w[selectedDisease] || Math.round(w.currentCases * 0.2)),
        prevCases: selectedDisease === 'all' ? w.prevCases : Math.round((w[selectedDisease] || w.currentCases * 0.2) * 0.85),
        movingAvg: w.avgMoving,
      }));
    }

    if (trendGranularity === 'monthly') {
      return STATIC_MONTHLY_TRENDS.map((m) => ({
        label: m.month.split(' ')[0],
        fullLabel: m.month,
        currentCases: selectedDisease === 'all' ? m.currentCases : (m[selectedDisease] || Math.round(m.currentCases * 0.2)),
        prevCases: selectedDisease === 'all' ? m.prevCases : Math.round((m[selectedDisease] || m.currentCases * 0.2) * 0.85),
        movingAvg: m.avgMoving,
      }));
    }

    // Default: Daily trends from filtered records
    return filteredDailyRecords.map((r) => {
      const current = selectedDisease === 'all' ? r.total : r[selectedDisease] || 0;
      const prev = selectedDisease === 'all' ? r.prevPeriodTotal : Math.round(current * 0.84);
      return {
        label: r.displayDate,
        date: r.date,
        currentCases: current,
        prevCases: prev,
        movingAvg: selectedDisease === 'all' ? r.movingAvg7Day : Math.round(current * 0.95),
        dengue: r.dengue,
        diarrhea: r.diarrhea,
        malaria: r.malaria,
        typhoid: r.typhoid,
        viralFever: r.viralFever,
      };
    });
  }, [trendGranularity, filteredDailyRecords, selectedDisease]);

  // 5. Hospital list with dynamic filtering and case computation
  const filteredHospitals = useMemo(() => {
    let list = STATIC_HOSPITAL_DISEASE_DISTRIBUTION;

    if (selectedTaluk !== 'all') {
      list = list.filter((h) => h.taluk === selectedTaluk);
    }

    if (selectedHospital !== 'all') {
      list = list.filter((h) => h.hospitalId === selectedHospital);
    }

    const scale = dateRange === '7d' ? 0.25 : dateRange === '14d' ? 0.5 : 1.0;

    return list.map((h) => {
      const isCivilHospital = h.hospitalId === 'hosp-01';
      const dynamicBonus = isCivilHospital ? dynamicAddition.total : 0;
      const total = Math.max(1, Math.round(h.totalCases * scale) + dynamicBonus);

      return {
        ...h,
        totalCases: total,
        severeCases: Math.max(1, Math.round(h.severeCases * scale) + (isCivilHospital ? dynamicAddition.severe : 0)),
        dengue: Math.round(h.dengue * scale) + (isCivilHospital ? dynamicAddition.dengue : 0),
        diarrhea: Math.round(h.diarrhea * scale) + (isCivilHospital ? dynamicAddition.diarrhea : 0),
        malaria: Math.round(h.malaria * scale) + (isCivilHospital ? dynamicAddition.malaria : 0),
        typhoid: Math.round(h.typhoid * scale) + (isCivilHospital ? dynamicAddition.typhoid : 0),
        viralFever: Math.round(h.viralFever * scale) + (isCivilHospital ? dynamicAddition.viralFever : 0),
      };
    });
  }, [selectedTaluk, selectedHospital, dateRange, dynamicAddition]);

  // 6. Demographics
  const demographics = useMemo(() => {
    let pediatric = 0, youth = 0, adult = 0, senior = 0;
    let male = 0, female = 0, otherGender = 0;
    let mild = 0, moderate = 0, severe = 0;

    filteredDailyRecords.forEach((r) => {
      pediatric += r.pediatric;
      youth += r.youth;
      adult += r.adult;
      senior += r.senior;

      male += r.male;
      female += r.female;
      otherGender += r.otherGender;

      mild += r.mild;
      moderate += r.moderate;
      severe += r.severe;
    });

    const totalAge = pediatric + youth + adult + senior || 1;
    const totalGender = male + female + otherGender || 1;
    const totalSeverity = mild + moderate + severe || 1;

    return {
      ageGroups: [
        { group: '< 5 Years (Pediatric)', count: pediatric, percentage: ((pediatric / totalAge) * 100).toFixed(1) },
        { group: '5 - 18 Years (Youth)', count: youth, percentage: ((youth / totalAge) * 100).toFixed(1) },
        { group: '19 - 50 Years (Adult)', count: adult, percentage: ((adult / totalAge) * 100).toFixed(1) },
        { group: '50+ Years (Geriatric)', count: senior, percentage: ((senior / totalAge) * 100).toFixed(1) },
      ],
      gender: [
        { gender: 'Male', count: male, percentage: ((male / totalGender) * 100).toFixed(1), color: '#0d9488' },
        { gender: 'Female', count: female, percentage: ((female / totalGender) * 100).toFixed(1), color: '#6366f1' },
        { gender: 'Other', count: otherGender, percentage: ((otherGender / totalGender) * 100).toFixed(1), color: '#94a3b8' },
      ],
      severity: [
        { level: 'Mild (Outpatient OPD)', count: mild, percentage: ((mild / totalSeverity) * 100).toFixed(1), color: '#10b981' },
        { level: 'Moderate (Observation)', count: moderate, percentage: ((moderate / totalSeverity) * 100).toFixed(1), color: '#f59e0b' },
        { level: 'Severe (Admitted IPD / ICU)', count: severe, percentage: ((severe / totalSeverity) * 100).toFixed(1), color: '#ef4444' },
      ],
    };
  }, [filteredDailyRecords]);

  // 7. Geographic pins (hospitals + villages)
  const geoEntities = useMemo(() => {
    const scale = dateRange === '7d' ? 0.25 : dateRange === '14d' ? 0.5 : 1.0;

    const hospitals = MOCK_HOSPITALS
      .filter((h) => selectedTaluk === 'all' || h.taluk === selectedTaluk)
      .filter((h) => selectedHospital === 'all' || h.id === selectedHospital)
      .map((h) => ({
        id: h.id,
        type: 'hospital',
        name: h.name,
        classification: h.type,
        taluk: h.taluk,
        coordinates: h.coordinates,
        cases: Math.round(h.totalCasesThisMonth * scale) + (h.id === 'hosp-01' ? dynamicAddition.total : 0),
        severe: Math.round(h.severeCasesCount * scale) + (h.id === 'hosp-01' ? dynamicAddition.severe : 0),
        compliance: h.complianceRate,
        doctor: h.medicalSuperintendent,
        phone: h.phone,
        status: h.status,
      }));

    const villages = MOCK_VILLAGES
      .filter((v) => selectedTaluk === 'all' || v.taluk === selectedTaluk)
      .filter((v) => selectedDisease === 'all' || v.dominantDisease.toLowerCase().includes(selectedDisease))
      .map((v) => ({
        id: v.id,
        type: 'village',
        name: v.name,
        taluk: v.taluk,
        coordinates: v.coordinates,
        cases: Math.round(v.cases * scale * 3.5),
        severe: Math.round(v.severeCases * scale * 2),
        dominantDisease: v.dominantDisease,
        riskLevel: v.riskLevel,
        waterSource: v.waterSourceStatus,
        ashaWorker: v.ashaWorker,
      }));

    return { hospitals, villages };
  }, [selectedTaluk, selectedHospital, selectedDisease, dateRange, dynamicAddition]);

  return (
    <HealthDataContext.Provider
      value={{
        // Filter values and setters
        dateRange,
        setDateRange,
        selectedDisease,
        setSelectedDisease,
        selectedHospital,
        setSelectedHospital,
        selectedTaluk,
        setSelectedTaluk,
        trendGranularity,
        setTrendGranularity,
        resetFilters,

        // Submissions, draft & hospital mutations
        submissions,
        draftDailyEntry,
        saveDraft,
        clearDraft,
        addHospitalDailyEntry,
        addHospitalBatchUpload,
        correctSubmission,

        // Computed reactive data
        kpis,
        diseaseBreakdown,
        trendsChartData,
        filteredHospitals,
        demographics,
        geoEntities,

        // Raw master arrays for dropdowns
        allDiseases: MOCK_DISEASES,
        allHospitals: MOCK_HOSPITALS,
        allTaluks: MOCK_DISTRICT.taluks,
        districtInfo: MOCK_DISTRICT,
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
}

export function useHealthData() {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
}
