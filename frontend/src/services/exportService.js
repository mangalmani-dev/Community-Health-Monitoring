import * as XLSX from 'xlsx';

/**
 * Exports JSON data to Excel (.xlsx) file and triggers browser download
 */
export function exportToExcel({ filename = 'District_Surveillance_Report.xlsx', sheets = [] }) {
  const workbook = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const worksheet = XLSX.utils.json_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.substring(0, 31));
  });

  XLSX.writeFile(workbook, filename);
}

/**
 * Exports JSON data to CSV (.csv) file and triggers browser download
 */
export function exportToCsv({ filename = 'District_Surveillance_Report.csv', data = [] }) {
  if (!data || data.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

