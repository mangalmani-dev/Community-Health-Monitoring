// Deterministic, consistent mock surveillance datasets for District Public Health
import { MOCK_DISEASES } from './mockDiseases';
import { MOCK_HOSPITALS } from './mockHospitals';

// Generate deterministic records for each day of the past 30 days
export function buildDeterministicSurveillance() {
  const records = [];
  const hospitalDailyRecords = [];
  const baseDate = new Date(2026, 10, 11); // 11 Nov 2026

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - dayOffset);
    const dateStr = d.toISOString().split('T')[0];
    const displayDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    // Outbreak surge pattern during the last 10 days
    const isOutbreak = dayOffset <= 9;

    // Disease counts for this day across the district
    const dengue = Math.round(18 + Math.sin(dayOffset * 0.4) * 6 + (isOutbreak ? (10 - dayOffset) * 3.5 : 0));
    const malaria = Math.round(10 + Math.cos(dayOffset * 0.3) * 4 + (isOutbreak ? 4 : 0));
    const diarrhea = Math.round(24 + Math.sin(dayOffset * 0.5) * 8 + (isOutbreak ? (10 - dayOffset) * 2.8 : 0));
    const typhoid = Math.round(12 + Math.cos(dayOffset * 0.6) * 3);
    const viralFever = Math.round(42 + Math.sin(dayOffset * 0.35) * 11 + (isOutbreak ? 15 : 0));
    const respiratory = Math.round(32 + Math.cos(dayOffset * 0.45) * 7);
    const cholera = isOutbreak && dayOffset <= 4 ? (dayOffset % 2 === 0 ? 2 : 1) : 0;
    const hepatitis = Math.round(5 + Math.sin(dayOffset * 0.25) * 2);

    const total = dengue + malaria + diarrhea + typhoid + viralFever + respiratory + cholera + hepatitis;
    const severe = Math.round(total * 0.08);
    const moderate = Math.round(total * 0.26);
    const mild = total - severe - moderate;

    // Demographics
    const male = Math.round(total * 0.49);
    const female = Math.round(total * 0.48);
    const otherGender = total - male - female;

    const pediatric = Math.round(total * 0.21); // <5 yrs
    const youth = Math.round(total * 0.24);     // 5-18 yrs
    const adult = Math.round(total * 0.40);     // 19-50 yrs
    const senior = total - pediatric - youth - adult; // 50+

    // Previous period comparison (e.g. comparing to the 30 days prior)
    const prevPeriodTotal = Math.round(total * (0.82 + (dayOffset % 5) * 0.02));

    const dayRecord = {
      date: dateStr,
      displayDate,
      dengue,
      malaria,
      diarrhea,
      typhoid,
      viralFever,
      respiratory,
      cholera,
      hepatitis,
      total,
      prevPeriodTotal,
      severe,
      moderate,
      mild,
      male,
      female,
      otherGender,
      pediatric,
      youth,
      adult,
      senior,
      movingAvg7Day: total
    };

    records.push(dayRecord);

    // Generate hospital-level sliced records for this date
    MOCK_HOSPITALS.forEach((hosp) => {
      const share = hosp.beds / 800; // distribution proportional to facility capacity
      const hTotal = Math.max(1, Math.round(total * share));
      hospitalDailyRecords.push({
        date: dateStr,
        displayDate,
        hospitalId: hosp.id,
        hospitalName: hosp.name,
        taluk: hosp.taluk,
        totalCases: hTotal,
        dengue: Math.round(dengue * share),
        diarrhea: Math.round(diarrhea * share),
        malaria: Math.round(malaria * share),
        typhoid: Math.round(typhoid * share),
        viralFever: Math.round(viralFever * share),
        respiratory: Math.round(respiratory * share),
        severe: Math.round(severe * share),
        moderate: Math.round(moderate * share),
        mild: Math.round(mild * share)
      });
    });
  }

  // Calculate 7-day moving average deterministically
  for (let i = 0; i < records.length; i++) {
    const windowStart = Math.max(0, i - 6);
    const windowSlice = records.slice(windowStart, i + 1);
    const sum = windowSlice.reduce((acc, curr) => acc + curr.total, 0);
    records[i].movingAvg7Day = Math.round(sum / windowSlice.length);
  }

  return { dailyRecords: records, hospitalDailyRecords };
}

export const { dailyRecords: STATIC_DAILY_RECORDS, hospitalDailyRecords: STATIC_HOSPITAL_DAILY_RECORDS } = buildDeterministicSurveillance();

// Static weekly aggregations derived from static daily records
export const STATIC_WEEKLY_TRENDS = [
  {
    weekId: 'W1',
    label: 'Week 1 (Oct 13 - Oct 19)',
    currentCases: STATIC_DAILY_RECORDS.slice(0, 7).reduce((a, b) => a + b.total, 0),
    prevCases: STATIC_DAILY_RECORDS.slice(0, 7).reduce((a, b) => a + b.prevPeriodTotal, 0),
    dengue: STATIC_DAILY_RECORDS.slice(0, 7).reduce((a, b) => a + b.dengue, 0),
    diarrhea: STATIC_DAILY_RECORDS.slice(0, 7).reduce((a, b) => a + b.diarrhea, 0),
    malaria: STATIC_DAILY_RECORDS.slice(0, 7).reduce((a, b) => a + b.malaria, 0),
    typhoid: STATIC_DAILY_RECORDS.slice(0, 7).reduce((a, b) => a + b.typhoid, 0),
    severe: STATIC_DAILY_RECORDS.slice(0, 7).reduce((a, b) => a + b.severe, 0),
    avgMoving: Math.round(STATIC_DAILY_RECORDS.slice(0, 7).reduce((a, b) => a + b.movingAvg7Day, 0) / 7),
  },
  {
    weekId: 'W2',
    label: 'Week 2 (Oct 20 - Oct 26)',
    currentCases: STATIC_DAILY_RECORDS.slice(7, 14).reduce((a, b) => a + b.total, 0),
    prevCases: STATIC_DAILY_RECORDS.slice(7, 14).reduce((a, b) => a + b.prevPeriodTotal, 0),
    dengue: STATIC_DAILY_RECORDS.slice(7, 14).reduce((a, b) => a + b.dengue, 0),
    diarrhea: STATIC_DAILY_RECORDS.slice(7, 14).reduce((a, b) => a + b.diarrhea, 0),
    malaria: STATIC_DAILY_RECORDS.slice(7, 14).reduce((a, b) => a + b.malaria, 0),
    typhoid: STATIC_DAILY_RECORDS.slice(7, 14).reduce((a, b) => a + b.typhoid, 0),
    severe: STATIC_DAILY_RECORDS.slice(7, 14).reduce((a, b) => a + b.severe, 0),
    avgMoving: Math.round(STATIC_DAILY_RECORDS.slice(7, 14).reduce((a, b) => a + b.movingAvg7Day, 0) / 7),
  },
  {
    weekId: 'W3',
    label: 'Week 3 (Oct 27 - Nov 02)',
    currentCases: STATIC_DAILY_RECORDS.slice(14, 21).reduce((a, b) => a + b.total, 0),
    prevCases: STATIC_DAILY_RECORDS.slice(14, 21).reduce((a, b) => a + b.prevPeriodTotal, 0),
    dengue: STATIC_DAILY_RECORDS.slice(14, 21).reduce((a, b) => a + b.dengue, 0),
    diarrhea: STATIC_DAILY_RECORDS.slice(14, 21).reduce((a, b) => a + b.diarrhea, 0),
    malaria: STATIC_DAILY_RECORDS.slice(14, 21).reduce((a, b) => a + b.malaria, 0),
    typhoid: STATIC_DAILY_RECORDS.slice(14, 21).reduce((a, b) => a + b.typhoid, 0),
    severe: STATIC_DAILY_RECORDS.slice(14, 21).reduce((a, b) => a + b.severe, 0),
    avgMoving: Math.round(STATIC_DAILY_RECORDS.slice(14, 21).reduce((a, b) => a + b.movingAvg7Day, 0) / 7),
  },
  {
    weekId: 'W4',
    label: 'Week 4 (Nov 03 - Nov 11)',
    currentCases: STATIC_DAILY_RECORDS.slice(21, 30).reduce((a, b) => a + b.total, 0),
    prevCases: STATIC_DAILY_RECORDS.slice(21, 30).reduce((a, b) => a + b.prevPeriodTotal, 0),
    dengue: STATIC_DAILY_RECORDS.slice(21, 30).reduce((a, b) => a + b.dengue, 0),
    diarrhea: STATIC_DAILY_RECORDS.slice(21, 30).reduce((a, b) => a + b.diarrhea, 0),
    malaria: STATIC_DAILY_RECORDS.slice(21, 30).reduce((a, b) => a + b.malaria, 0),
    typhoid: STATIC_DAILY_RECORDS.slice(21, 30).reduce((a, b) => a + b.typhoid, 0),
    severe: STATIC_DAILY_RECORDS.slice(21, 30).reduce((a, b) => a + b.severe, 0),
    avgMoving: Math.round(STATIC_DAILY_RECORDS.slice(21, 30).reduce((a, b) => a + b.movingAvg7Day, 0) / 9),
  }
];

// Static monthly comparisons
export const STATIC_MONTHLY_TRENDS = [
  { month: 'Jul 2026', currentCases: 3410, prevCases: 3200, dengue: 310, diarrhea: 740, malaria: 280, typhoid: 380, severe: 240, avgMoving: 110 },
  { month: 'Aug 2026', currentCases: 3820, prevCases: 3410, dengue: 480, diarrhea: 890, malaria: 320, typhoid: 410, severe: 290, avgMoving: 123 },
  { month: 'Sep 2026', currentCases: 4150, prevCases: 3820, dengue: 620, diarrhea: 950, malaria: 380, typhoid: 430, severe: 340, avgMoving: 138 },
  { month: 'Oct 2026', currentCases: 4620, prevCases: 4150, dengue: 890, diarrhea: 1120, malaria: 410, typhoid: 460, severe: 390, avgMoving: 149 },
  { month: 'Nov 2026 (MTD)', currentCases: 4892, prevCases: 4210, dengue: 1248, diarrhea: 1320, malaria: 450, typhoid: 490, severe: 412, avgMoving: 163 },
];

// Hospital Disease Breakdown Master for comparisons
export const STATIC_HOSPITAL_DISEASE_DISTRIBUTION = [
  {
    hospitalId: 'hosp-01',
    name: 'City General Civil Hospital',
    type: 'District Hospital',
    taluk: 'Central Taluk',
    totalCases: 840,
    severeCases: 64,
    complianceRate: 100,
    dengue: 284,
    diarrhea: 198,
    viralFever: 185,
    respiratory: 92,
    malaria: 48,
    typhoid: 33,
    lastSubmitted: 'Today, 09:30 AM',
    status: 'Synced'
  },
  {
    hospitalId: 'hosp-02',
    name: 'Taluk Health Center - North',
    type: 'Sub-District Hospital',
    taluk: 'North Taluk',
    totalCases: 512,
    severeCases: 38,
    complianceRate: 98,
    dengue: 142,
    diarrhea: 168,
    viralFever: 104,
    respiratory: 52,
    malaria: 28,
    typhoid: 18,
    lastSubmitted: 'Today, 10:15 AM',
    status: 'Synced'
  },
  {
    hospitalId: 'hosp-03',
    name: 'Kaveri Community Health Center',
    type: 'Community Health Center',
    taluk: 'South Taluk',
    totalCases: 390,
    severeCases: 21,
    complianceRate: 95,
    dengue: 98,
    diarrhea: 124,
    viralFever: 86,
    respiratory: 44,
    malaria: 24,
    typhoid: 14,
    lastSubmitted: 'Today, 11:00 AM',
    status: 'Synced'
  },
  {
    hospitalId: 'hosp-04',
    name: 'East Valley Primary Health Center',
    type: 'Primary Health Center',
    taluk: 'East Taluk',
    totalCases: 275,
    severeCases: 12,
    complianceRate: 92,
    dengue: 65,
    diarrhea: 84,
    viralFever: 62,
    respiratory: 38,
    malaria: 16,
    typhoid: 10,
    lastSubmitted: 'Yesterday, 06:45 PM',
    status: 'Synced'
  },
  {
    hospitalId: 'hosp-05',
    name: 'South Lake PHC Sub-center',
    type: 'Primary Health Center',
    taluk: 'South Taluk',
    totalCases: 184,
    severeCases: 7,
    complianceRate: 84,
    dengue: 36,
    diarrhea: 68,
    viralFever: 42,
    respiratory: 22,
    malaria: 10,
    typhoid: 6,
    lastSubmitted: '2 days ago',
    status: 'Lagging'
  },
  {
    hospitalId: 'hosp-06',
    name: 'Hebbal Valley Health Center',
    type: 'Primary Health Center',
    taluk: 'North Taluk',
    totalCases: 310,
    severeCases: 18,
    complianceRate: 96,
    dengue: 78,
    diarrhea: 94,
    viralFever: 72,
    respiratory: 36,
    malaria: 18,
    typhoid: 12,
    lastSubmitted: 'Today, 08:45 AM',
    status: 'Synced'
  },
  {
    hospitalId: 'hosp-07',
    name: 'Metro Town Community Clinic',
    type: 'Community Health Center',
    taluk: 'Central Taluk',
    totalCases: 445,
    severeCases: 29,
    complianceRate: 100,
    dengue: 125,
    diarrhea: 135,
    viralFever: 95,
    respiratory: 48,
    malaria: 26,
    typhoid: 16,
    lastSubmitted: 'Today, 10:30 AM',
    status: 'Synced'
  },
  {
    hospitalId: 'hosp-08',
    name: 'Whitefield Rural Clinic',
    type: 'Primary Health Center',
    taluk: 'East Taluk',
    totalCases: 215,
    severeCases: 9,
    complianceRate: 90,
    dengue: 54,
    diarrhea: 72,
    viralFever: 46,
    respiratory: 25,
    malaria: 11,
    typhoid: 7,
    lastSubmitted: 'Yesterday, 07:10 PM',
    status: 'Synced'
  }
];
