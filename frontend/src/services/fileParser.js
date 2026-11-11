import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { MOCK_DISEASES } from '../mock/mockDiseases';

// Normalized recognized disease names for fuzzy matching
const VALID_DISEASE_NAMES = MOCK_DISEASES.map((d) => d.name.toLowerCase());
const VALID_SEVERITIES = ['mild', 'moderate', 'severe'];
const VALID_WARDS = ['opd', 'ipd', 'icu', 'emergency', 'general ward'];

/**
 * Validates an individual parsed row against public health surveillance schema
 */
export function validateRow(row, rowIndex, seenKeys) {
  const errors = [];

  // 1. Mandatory Date validation
  const dateStr = (row.Date || row.date || row.DATE || '').toString().trim();
  if (!dateStr) {
    errors.push('Mandatory column "Date" is missing');
  } else {
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) {
      errors.push(`Invalid date format: "${dateStr}" (expected YYYY-MM-DD)`);
    }
  }

  // 2. Mandatory Disease name validation
  const diseaseName = (row.Disease_Name || row.disease || row.Disease || '').toString().trim();
  if (!diseaseName) {
    errors.push('Mandatory column "Disease_Name" is missing');
  } else {
    const isRecognized = VALID_DISEASE_NAMES.some(
      (valid) =>
        valid.includes(diseaseName.toLowerCase()) ||
        diseaseName.toLowerCase().includes(valid)
    );
    if (!isRecognized && !diseaseName.toLowerCase().includes('fever')) {
      errors.push(`Unrecognized disease name: "${diseaseName}"`);
    }
  }

  // 3. Mandatory Patient count validation (non-negative integer)
  const rawCount = row.Patient_Count !== undefined ? row.Patient_Count : row.count !== undefined ? row.count : row.Cases;
  const countNum = Number(rawCount);
  if (rawCount === undefined || rawCount === null || rawCount === '') {
    errors.push('Mandatory column "Patient_Count" is missing');
  } else if (isNaN(countNum)) {
    errors.push(`Count must be a numeric integer, received "${rawCount}"`);
  } else if (countNum < 0) {
    errors.push(`Negative patient count (${countNum}) is disallowed`);
  } else if (!Number.isInteger(countNum)) {
    errors.push(`Patient count must be a whole integer, received decimal "${countNum}"`);
  }

  // 4. Severity validation
  const severity = (row.Severity_Level || row.severity || row.Severity || '').toString().trim().toLowerCase();
  if (severity && !VALID_SEVERITIES.includes(severity)) {
    errors.push(`Invalid severity: "${row.Severity_Level || row.severity}" (expected Mild, Moderate, or Severe)`);
  }

  // 5. Ward type validation
  const ward = (row.Ward_Type || row.ward || row.Ward || '').toString().trim().toLowerCase();
  if (ward && !VALID_WARDS.includes(ward)) {
    errors.push(`Invalid ward: "${row.Ward_Type || row.ward}" (expected OPD, IPD, or ICU)`);
  }

  // 6. Duplicate record detection (same Date + Disease + Ward)
  if (dateStr && diseaseName) {
    const duplicateKey = `${dateStr.toLowerCase()}_${diseaseName.toLowerCase()}_${ward || 'opd'}`;
    if (seenKeys.has(duplicateKey)) {
      errors.push(`Duplicate record detected: Entry for ${diseaseName} on ${dateStr} (${(ward || 'OPD').toUpperCase()}) already exists in this file`);
    } else {
      seenKeys.add(duplicateKey);
    }
  }

  const isValid = errors.length === 0;

  return {
    id: rowIndex + 1,
    date: dateStr || new Date().toISOString().split('T')[0],
    hospitalCode: row.Hospital_Code || row.hospital_code || 'CGH-KA-042',
    disease: diseaseName || 'Unspecified Condition',
    count: isNaN(countNum) ? 0 : countNum,
    severity: severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'Mild',
    ward: ward ? ward.toUpperCase() : 'OPD',
    status: isValid ? 'Valid' : 'Invalid',
    errors,
    raw: row,
  };
}

/**
 * Parse uploaded CSV file asynchronously with duplicate detection
 */
export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        try {
          const seenKeys = new Set();
          const validatedRows = results.data.map((row, idx) => validateRow(row, idx, seenKeys));
          const validCount = validatedRows.filter((r) => r.status === 'Valid').length;
          const invalidCount = validatedRows.length - validCount;

          resolve({
            filename: file.name,
            fileSize: (file.size / 1024).toFixed(1) + ' KB',
            totalRows: validatedRows.length,
            validCount,
            invalidCount,
            rows: validatedRows,
          });
        } catch (err) {
          reject(err);
        }
      },
      error: (error) => reject(error),
    });
  });
}

/**
 * Parse uploaded Excel (.xlsx / .xls) file asynchronously with duplicate detection
 */
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const seenKeys = new Set();
        const validatedRows = jsonData.map((row, idx) => validateRow(row, idx, seenKeys));
        const validCount = validatedRows.filter((r) => r.status === 'Valid').length;
        const invalidCount = validatedRows.length - validCount;

        resolve({
          filename: file.name,
          fileSize: (file.size / 1024).toFixed(1) + ' KB',
          totalRows: validatedRows.length,
          validCount,
          invalidCount,
          rows: validatedRows,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generate standard CSV string template
 */
export function generateSampleCsvContent() {
  const rows = [
    ['Date', 'Hospital_Code', 'Disease_Name', 'Patient_Count', 'Severity_Level', 'Ward_Type'],
    ['2026-11-11', 'CGH-KA-042', 'Dengue Fever', '8', 'Moderate', 'IPD'],
    ['2026-11-11', 'CGH-KA-042', 'Acute Diarrhea (ADD)', '15', 'Mild', 'OPD'],
    ['2026-11-11', 'CGH-KA-042', 'Malaria', '4', 'Severe', 'IPD'],
    ['2026-11-11', 'CGH-KA-042', 'Typhoid (Enteric)', '5', 'Mild', 'OPD'],
    ['2026-11-11', 'CGH-KA-042', 'Viral Pyrexia (FUO)', '19', 'Mild', 'OPD'],
    ['2026-11-11', 'CGH-KA-042', 'Acute Respiratory Inf.', '12', 'Mild', 'OPD'],
  ];
  return rows.map((r) => r.join(',')).join('\n');
}
