'use strict';

const { applyResultsToSpreadsheetBuffer } = require('../../../helpers/cms-bulk-report.helper');

describe('applyResultsToSpreadsheetBuffer', () => {
  it('writes failure reason into xlsx rows', () => {
    const XLSX = require('xlsx');
    const wb = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([
      ['product', 'title'],
      ['SKU-1', 'One'],
      ['SKU-2', 'Two'],
    ]);
    XLSX.utils.book_append_sheet(wb, sheet, 'Data');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const rowResults = [
      { row_number: 2, status: 'failed', failure_reason: 'Asset missing', created_id: '' },
      { row_number: 3, status: 'success', failure_reason: '', created_id: 'id123' },
    ];

    const out = applyResultsToSpreadsheetBuffer(buffer, 'xlsx', rowResults);
    const parsed = XLSX.read(out, { type: 'buffer' });
    const data = XLSX.utils.sheet_to_json(parsed.Sheets.Data, { defval: '' });
    expect(data[0].import_status).toBe('failed');
    expect(data[0].failure_reason).toBe('Asset missing');
    expect(data[1].import_status).toBe('success');
    expect(data[1].created_id).toBe('id123');
  });
});
