'use strict';

const XLSX = require('xlsx');

const REPORT_STATUS_COL = 'import_status';
const REPORT_REASON_COL = 'failure_reason';
const REPORT_ID_COL = 'created_id';

const REPORT_COLUMNS = [REPORT_STATUS_COL, REPORT_REASON_COL, REPORT_ID_COL];

const cellToExportString = (value) => {
  if (value === undefined || value === null) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return `${value}`;
};

const pickDataSheetName = (workbook) => {
  const names = workbook.SheetNames || [];
  const dataSheet = names.find((n) => `${n}`.trim().toLowerCase() === 'data');
  return dataSheet || names[0];
};

/**
 * Apply import results onto the original spreadsheet buffer (adds/updates status columns).
 * @param {Buffer} buffer - original spreadsheet
 * @param {string} format - 'csv' | 'xlsx'
 * @param {object[]} rowResults - { row_number, status, failure_reason, created_id }
 */
const applyResultsToSpreadsheetBuffer = (buffer, format, rowResults = []) => {
  const fmt = `${format}`.toLowerCase() === 'csv' ? 'csv' : 'xlsx';
  const resultByRow = new Map((rowResults || []).map((r) => [r.row_number, r]));

  if (fmt === 'csv') {
    const text = buffer.toString('utf8').replace(/^\ufeff/, '');
    const lines = text.split(/\r?\n/).filter((line, idx, arr) => idx < arr.length - 1 || line.trim() !== '');
    if (!lines.length) {
      return buildBulkImportReport(rowResults, 'csv', []);
    }
    const parseLine = (line) => {
      const cells = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === ',' && !inQuotes) {
          cells.push(cur);
          cur = '';
        } else {
          cur += ch;
        }
      }
      cells.push(cur);
      return cells;
    };
    const escapeCell = (cell) => {
      const s = `${cell}`.replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = lines.map(parseLine);
    const header = rows[0] || [];
    REPORT_COLUMNS.forEach((col) => {
      if (!header.includes(col)) {
        header.push(col);
      }
    });
    rows[0] = header;

    for (let i = 1; i < rows.length; i += 1) {
      const rowNum = i + 1;
      const result = resultByRow.get(rowNum);
      while (rows[i].length < header.length) {
        rows[i].push('');
      }
      if (result) {
        rows[i][header.indexOf(REPORT_STATUS_COL)] = result.status === 'success' ? 'success' : 'failed';
        rows[i][header.indexOf(REPORT_REASON_COL)] = result.failure_reason || '';
        rows[i][header.indexOf(REPORT_ID_COL)] = result.created_id || '';
      }
    }

    const out = rows.map((row) => row.map(escapeCell).join(',')).join('\n');
    return Buffer.from(`${out}\n`, 'utf8');
  }

  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true, raw: false });
  const sheetName = pickDataSheetName(workbook);
  const sheet = workbook.Sheets[sheetName];
  const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
  if (!aoa.length) {
    return buildBulkImportReport(rowResults, 'xlsx', []);
  }

  const header = [...(aoa[0] || []).map((h) => `${h}`.trim())];
  REPORT_COLUMNS.forEach((col) => {
    if (!header.includes(col)) {
      header.push(col);
    }
  });
  aoa[0] = header;

  for (let i = 1; i < aoa.length; i += 1) {
    const rowNum = i + 1;
    const result = resultByRow.get(rowNum);
    while (aoa[i].length < header.length) {
      aoa[i].push('');
    }
    if (result) {
      aoa[i][header.indexOf(REPORT_STATUS_COL)] = result.status === 'success' ? 'success' : 'failed';
      aoa[i][header.indexOf(REPORT_REASON_COL)] = result.failure_reason || '';
      aoa[i][header.indexOf(REPORT_ID_COL)] = result.created_id || '';
    }
  }

  workbook.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(aoa);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Build CSV or XLSX report buffer from in-memory row results (fallback).
 */
const buildBulkImportReport = (rowResults, format, columnOrder = []) => {
  const sorted = [...(rowResults || [])].sort((a, b) => a.row_number - b.row_number);
  const columns = [...columnOrder];
  sorted.forEach((r) => {
    Object.keys(r.original_row || {}).forEach((k) => {
      if (!columns.includes(k)) {
        columns.push(k);
      }
    });
  });

  const headers = [...columns, ...REPORT_COLUMNS];
  const rows = sorted.map((r) => {
    const line = columns.map((col) => cellToExportString((r.original_row || {})[col]));
    line.push(r.status === 'success' ? 'success' : 'failed');
    line.push(r.failure_reason || '');
    line.push(r.created_id || '');
    return line;
  });

  const fmt = `${format}`.toLowerCase() === 'csv' ? 'csv' : 'xlsx';
  if (fmt === 'csv') {
    const escape = (cell) => {
      const s = `${cell}`.replace(/"/g, '""');
      return `"${s}"`;
    };
    const lines = [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))];
    return Buffer.from(`${lines.join('\n')}\n`, 'utf8');
  }

  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Data');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

module.exports = {
  REPORT_STATUS_COL,
  REPORT_REASON_COL,
  REPORT_ID_COL,
  applyResultsToSpreadsheetBuffer,
  buildBulkImportReport,
};
