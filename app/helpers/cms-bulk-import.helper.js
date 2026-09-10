'use strict';

const _ = require('lodash');
const XLSX = require('xlsx');
const fs = require('fs').promises;
const { parse: parseCsv } = require('csv-parse/sync');
const {
  normalizeRelationFieldValue,
  normalizeEmbeddedCustomObjectInput,
  normalizeEmbeddedCustomObjectArrayInput,
} = require('./dynamic-collection.helper');
const { parseProductCellTokens } = require('./cms-bulk-product-resolve.helper');

const isBulkImportableField = (field) =>
  field && field.name;

const getBulkImportableFields = (definition) =>
  (definition.fields || []).filter(isBulkImportableField);

/**
 * Normalize a single cell into a raw payload value (before relation/embedded normalization).
 */
const cellToRawValue = (cellValue, field) => {
  if (cellValue === undefined || cellValue === null) {
    return undefined;
  }
  if (typeof cellValue === 'number' && Number.isNaN(cellValue)) {
    return undefined;
  }

  if (typeof cellValue === 'number' && field.field_type === 'number') {
    return cellValue;
  }

  if (cellValue instanceof Date) {
    if (field.field_type === 'date') {
      return cellValue.toISOString().slice(0, 10);
    }
    return cellValue.toISOString();
  }

  let str =
    typeof cellValue === 'string'
      ? cellValue
      : cellValue != null && typeof cellValue.toString === 'function'
        ? cellValue.toString()
        : `${cellValue}`;
  str = str.trim();
  if (str === '') {
    return undefined;
  }

  if (field.field_type === 'number') {
    const n = Number(str);
    return Number.isNaN(n) ? undefined : n;
  }

  if (field.field_type === 'json') {
    try {
      return JSON.parse(str);
    } catch (e) {
      throw new Error(`Invalid JSON for field "${field.name}"`);
    }
  }

  if (field.field_type === 'custom_object') {
    try {
      const parsed = JSON.parse(str);
      if (field.multiple) {
        return Array.isArray(parsed) ? parsed : [parsed];
      }
      return parsed;
    } catch (e) {
      throw new Error(`Invalid JSON for field "${field.name}"`);
    }
  }

  if (field.field_type === 'product') {
    return parseProductCellTokens(str, field);
  }

  if (field.field_type === 'collection') {
    try {
      const parsed = JSON.parse(str);
      if (field.multiple) {
        return Array.isArray(parsed) ? parsed : [parsed];
      }
      return parsed;
    } catch (e) {
      throw new Error(`Invalid JSON for field "${field.name}" (use JSON object or array)`);
    }
  }

  /** File fields: filename with or without extension, or HTTPS CDN URLs. */
  if (field.field_type === 'file') {
    if (!str) {
      return undefined;
    }
    if (field.multiple) {
      if (str.startsWith('[')) {
        try {
          const parsed = JSON.parse(str);
          if (!Array.isArray(parsed)) {
            throw new Error(`File field "${field.name}" expects a JSON array of URLs`);
          }
          return parsed.map((u) => `${u}`.trim()).filter(Boolean);
        } catch (e) {
          throw new Error(e.message || `Invalid JSON for file field "${field.name}"`);
        }
      }
      return str.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return str.trim();
  }

  if (field.field_type === 'multiple_values' && (field.options || []).length) {
    if (str.startsWith('[')) {
      try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        throw new Error(`Invalid JSON array for field "${field.name}"`);
      }
    }
    return str.split(',').map((s) => s.trim()).filter(Boolean);
  }

  if (field.field_type === 'multiple_values' && !(field.options || []).length) {
    return str.split(',').map((s) => s.trim()).filter(Boolean);
  }

  if (field.field_type === 'checkbox' && field.multiple) {
    if (str.startsWith('[')) {
      try {
        return JSON.parse(str);
      } catch (e) {
        throw new Error(`Invalid JSON array for field "${field.name}"`);
      }
    }
    return str.split(',').map((s) => s.trim()).filter(Boolean);
  }

  if (str.startsWith('{') || str.startsWith('[')) {
    try {
      return JSON.parse(str);
    } catch (e) {
      /* fall through to string */
    }
  }

  return str;
};

const applyFieldNormalizers = (payload, definition) => {
  definition.fields.forEach((field) => {
    if (payload[field.name] === undefined) {
      return;
    }
    let v = payload[field.name];

    if (field.field_type === 'product') {
      if (typeof v === 'string') {
        payload[field.name] = v;
        return;
      }
      if (field.multiple && Array.isArray(v)) {
        const allStrings = v.every((item) => typeof item === 'string');
        if (allStrings) {
          payload[field.name] = v;
          return;
        }
        v = v.map((item) => normalizeRelationFieldValue(item)).filter((x) => x != null);
      } else {
        const ref = normalizeRelationFieldValue(v);
        v = ref == null ? null : ref;
      }
    } else if (field.field_type === 'collection') {
      if (field.multiple) {
        v = normalizeEmbeddedCustomObjectArrayInput(Array.isArray(v) ? v : [v]);
      } else {
        v = normalizeEmbeddedCustomObjectInput(v);
      }
    }

    payload[field.name] = v;
  });
};

/**
 * Build one payload object from a plain row { colName: value } using definition field names as keys.
 */
const isRowEffectivelyEmpty = (row) => {
  if (!row || typeof row !== 'object') {
    return true;
  }
  return !Object.keys(row).some((k) => {
    const v = row[k];
    if (v === undefined || v === null) {
      return false;
    }
    if (v instanceof Date) {
      return true;
    }
    const s = `${v}`.trim();
    return s.length > 0;
  });
};

const rowObjectToPayload = (row, definition) => {
  const payload = {};
  const fields = getBulkImportableFields(definition);

  for (const field of fields) {
    const raw = row[field.name];
    if (raw === undefined || raw === null || raw === '') {
      continue;
    }
    let value;
    try {
      value = cellToRawValue(raw, field);
    } catch (e) {
      throw e;
    }
    if (value !== undefined) {
      payload[field.name] = value;
    }
  }

  applyFieldNormalizers(payload, definition);
  return payload;
};

/**
 * CSV rows often split unquoted JSON across columns when the payload contains commas
 * (SheetJS emits the overflow as __EMPTY, __EMPTY_1, …). Rejoin fragments so JSON fields parse.
 */
const mergeSplitJsonCells = (row) => {
  if (!row || typeof row !== 'object') {
    return row;
  }
  const out = { ...row };
  let emptyKeys = Object.keys(out)
    .filter((k) => /^__EMPTY/.test(k))
    .sort((a, b) => {
      const na = a === '__EMPTY' ? 0 : Number(String(a).replace(/\D/g, '') || 0);
      const nb = b === '__EMPTY' ? 0 : Number(String(b).replace(/\D/g, '') || 0);
      return na - nb;
    });
  if (!emptyKeys.length) {
    return out;
  }

  const dataKeys = Object.keys(out).filter((k) => !/^__EMPTY/.test(k));
  for (const k of dataKeys) {
    const v = out[k];
    if (typeof v !== 'string') {
      continue;
    }
    const t = v.trim();
    if (!t || (!t.startsWith('{') && !t.startsWith('['))) {
      continue;
    }
    try {
      JSON.parse(t);
      continue;
    } catch {
      /* merge overflow columns */
    }
    let merged = v;
    const consumed = [];
    for (let i = 0; i < emptyKeys.length; i += 1) {
      const ek = emptyKeys[i];
      const part = out[ek];
      if (part == null || part === '') {
        continue;
      }
      merged = `${merged},${part}`;
      consumed.push(ek);
      try {
        JSON.parse(merged.trim());
        out[k] = merged;
        consumed.forEach((c) => {
          delete out[c];
        });
        emptyKeys = emptyKeys.filter((ek2) => !consumed.includes(ek2));
        break;
      } catch {
        /* need more fragments */
      }
    }
  }

  Object.keys(out).forEach((k) => {
    if (/^__EMPTY/.test(k)) {
      delete out[k];
    }
  });
  return out;
};

const stripUtf8Bom = (text) => (text.length && text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);

/**
 * RFC 4180 CSV parsing so cells can contain commas when quoted (multi-value lists, JSON, etc.).
 */
const parseCsvBufferToRows = (buffer) => {
  const text = stripUtf8Bom(buffer.toString('utf8'));
  if (!text.trim()) {
    return [];
  }
  const records = parseCsv(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    relax_quotes: true,
  });
  if (!Array.isArray(records)) {
    return [];
  }
  return records.map((row) => {
    if (!row || typeof row !== 'object') {
      return row;
    }
    const out = {};
    Object.keys(row).forEach((k) => {
      const key = `${k}`.trim().replace(/^\ufeff/, '');
      out[key] = row[k];
    });
    return mergeSplitJsonCells(out);
  });
};

const parseWorkbookToRows = (buffer, originalName = '') => {
  const lower = (originalName || '').toLowerCase();
  const isCsv = lower.endsWith('.csv');
  if (isCsv) {
    try {
      return parseCsvBufferToRows(buffer);
    } catch (e) {
      /* fall through to SheetJS for unusual exports */
    }
  }
  const workbook = XLSX.read(buffer, {
    type: 'buffer',
    raw: false,
    cellDates: true,
    ...(isCsv ? { FS: ',' } : {}),
  });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return [];
  }
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false,
    blankrows: false,
  });
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((row) => {
    if (!row || typeof row !== 'object') {
      return row;
    }
    const out = {};
    Object.keys(row).forEach((k) => {
      const key = `${k}`.trim().replace(/^\ufeff/, '');
      out[key] = row[k];
    });
    return mergeSplitJsonCells(out);
  });
};

const MAX_EMBED_SAMPLE_DEPTH = 4;

/**
 * Sample scalar / JSON-serializable value for a field (parent or embedded child).
 */
const SAMPLE_FILE_BASENAME = 'hero';
const SAMPLE_FILE_BASENAME_2 = 'banner';

const SAMPLE_PRODUCT_SKU = 'SAMPLE-SKU';
const SAMPLE_PRODUCT_SKU_2 = 'SKU-2';

const sampleValueForField = (field, childDefinitionsBySlug, depth) => {
  if (!field) {
    return null;
  }
  if (field.field_type === 'file') {
    return field.multiple ? [SAMPLE_FILE_BASENAME, SAMPLE_FILE_BASENAME_2] : SAMPLE_FILE_BASENAME;
  }
  if (field.field_type === 'custom_object' && field.ref_definition_slug && depth < MAX_EMBED_SAMPLE_DEPTH) {
    const childDef = childDefinitionsBySlug[field.ref_definition_slug];
    const embedded = sampleEmbedObjectPayload(childDef, childDefinitionsBySlug, depth + 1);
    return field.multiple ? [embedded] : embedded;
  }

  switch (field.field_type) {
    case 'text':
    case 'long_text':
      return depth > 0 ? 'Child text' : 'Example text';
    case 'number':
      return depth > 0 ? 10 : 1;
    case 'date':
      return '2026-06-01';
    case 'date_time':
      return '2026-06-01T12:00:00.000Z';
    case 'url':
      return 'https://example.com';
    case 'json':
      return { example: true };
    case 'html':
      return depth > 0 ? '<p>Child HTML</p>' : '<p>Example HTML</p>';
    case 'multiple_values': {
      const opts = field.options || [];
      if (opts.length >= 2) {
        return [opts[0], opts[1]];
      }
      if (opts.length === 1) {
        return [opts[0]];
      }
      return ['alpha', 'beta'];
    }
    case 'dropdown':
    case 'radio':
      return (field.options && field.options[0]) || 'option_a';
    case 'checkbox':
      if (field.multiple) {
        const opts = field.options || [];
        if (opts.length >= 2) {
          return [opts[0], opts[1]];
        }
        if (opts.length === 1) {
          return [opts[0]];
        }
        return ['option_a', 'option_b'];
      }
      return (field.options && field.options[0]) || 'option_a';
    case 'product':
      return field.multiple ? [SAMPLE_PRODUCT_SKU, SAMPLE_PRODUCT_SKU_2] : SAMPLE_PRODUCT_SKU;
    case 'collection':
    case 'custom_object':
      return {};
    default:
      return 'value';
  }
};

const sampleEmbedObjectPayload = (childDef, childDefinitionsBySlug, depth) => {
  if (!childDef || !childDef.fields || depth > MAX_EMBED_SAMPLE_DEPTH) {
    return {};
  }
  const out = {};
  for (const f of childDef.fields) {
    if (!f || !f.name) {
      continue;
    }
    const v = sampleValueForField(f, childDefinitionsBySlug, depth);
    if (v !== undefined && v !== null) {
      out[f.name] = v;
    }
  }
  return out;
};

/**
 * One sample row (parallel to getBulkImportableFields order) for templates.
 * @param {object} definition
 * @param {Record<string, object>} childDefinitionsBySlug published child defs by slug
 */
/**
 * Format a sample cell for CSV/XLSX templates (comma-separated where bulk import expects it).
 */
const formatSampleCellValue = (raw, field) => {
  if (raw === null || raw === undefined) {
    return '';
  }
  if (Array.isArray(raw)) {
    const commaSeparatedTypes = new Set(['file', 'product', 'multiple_values']);
    if (commaSeparatedTypes.has(field.field_type) || (field.field_type === 'checkbox' && field.multiple)) {
      return raw.map((item) => `${item}`.trim()).filter(Boolean).join(',');
    }
    return JSON.stringify(raw);
  }
  if (typeof raw === 'object') {
    return JSON.stringify(raw);
  }
  return `${raw}`;
};

const buildSampleDataRowValues = (definition, childDefinitionsBySlug = {}) => {
  const fields = getBulkImportableFields(definition);
  return fields.map((f) => {
    const raw = sampleValueForField(f, childDefinitionsBySlug, 0);
    return formatSampleCellValue(raw, f);
  });
};

/**
 * Build instruction rows for Excel "Field guide" sheet.
 */
const buildFieldGuideRows = (definition) => {
  const header = ['field_name', 'label', 'type', 'multiple', 'format_notes'];
  const rows = [header];
  for (const f of getBulkImportableFields(definition)) {
    let notes = '';
    switch (f.field_type) {
      case 'date':
        notes = 'YYYY-MM-DD';
        break;
      case 'date_time':
        notes = 'ISO-8601 datetime';
        break;
      case 'json':
      case 'custom_object':
        notes =
          'JSON object as string in cell. In CSV, quote the whole cell if JSON contains commas (or use Excel .xlsx).';
        break;
      case 'product':
        notes = f.multiple
          ? 'Product SKU codes, comma-separated (e.g. SKU-1,SKU-2). JSON {uid,slug,name} array still accepted.'
          : 'Product SKU code (e.g. SAMPLE-SKU). JSON {"uid":"","slug":"","name":""} still accepted.';
        break;
      case 'collection':
        notes = f.multiple ? 'JSON array of {uid,slug,name}' : 'JSON {"uid":"","slug":"","name":""}';
        break;
      case 'file':
        notes = f.multiple
          ? 'Filename(s) with or without extension, comma-separated (e.g. hero,banner or hero.jpg,banner.png). Must match files in the assets ZIP. HTTPS URLs also accepted.'
          : 'Filename with or without extension (e.g. hero or hero.jpg) matching a file in the assets ZIP, or an HTTPS CDN URL';
        break;
      case 'multiple_values':
        notes = (f.options || []).length
          ? 'JSON array of allowed choices, e.g. ["a","b"] (comma-separated list also works in CSV if the cell is quoted)'
          : 'Comma-separated values, or JSON array e.g. ["a","b"]; quote the CSV cell if values contain commas';
        break;
      case 'checkbox':
        notes = f.multiple
          ? 'Comma-separated options, or JSON array; quote CSV cells when options contain commas'
          : 'single option value';
        break;
      default:
        notes = 'plain text or number';
    }
    rows.push([f.name, f.label || '', f.field_type, f.multiple ? 'yes' : 'no', notes]);
  }
  rows.push([
    '',
    '',
    '',
    '',
    'File fields: use filename with or without extension (comma-separated for multiple). Upload matching files in the assets ZIP. Row 2 on Data is example — replace before import.',
  ]);
  return rows;
};

const buildTemplateWorkbook = (definition, childDefinitionsBySlug = {}) => {
  const fields = getBulkImportableFields(definition);
  const headers = fields.map((f) => f.name);
  const sampleRow = buildSampleDataRowValues(definition, childDefinitionsBySlug);
  const dataSheet = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
  const guideRows = buildFieldGuideRows(definition);
  const guideSheet = XLSX.utils.aoa_to_sheet(guideRows);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, dataSheet, 'Data');
  XLSX.utils.book_append_sheet(wb, guideSheet, 'Field guide');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

const buildTemplateCsv = (definition, childDefinitionsBySlug = {}) => {
  const fields = getBulkImportableFields(definition);
  const headers = fields.map((f) => f.name);
  const sampleRow = buildSampleDataRowValues(definition, childDefinitionsBySlug);
  const escape = (cell) => {
    const s = `${cell}`.replace(/"/g, '""');
    return `"${s}"`;
  };
  const lines = [headers.map(escape).join(','), sampleRow.map(escape).join(',')];
  return Buffer.from(`${lines.join('\n')}\n`, 'utf8');
};

const unlinkSafe = async (path) => {
  try {
    await fs.unlink(path);
  } catch (e) {
    /* ignore */
  }
};

module.exports = {
  isBulkImportableField,
  getBulkImportableFields,
  rowObjectToPayload,
  parseWorkbookToRows,
  isRowEffectivelyEmpty,
  buildTemplateWorkbook,
  buildTemplateCsv,
  buildSampleDataRowValues,
  unlinkSafe,
};
