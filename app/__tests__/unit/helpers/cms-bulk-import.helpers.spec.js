'use strict';

const path = require('path');
const fsp = require('fs').promises;
const os = require('os');
const AdmZip = require('adm-zip');
const {
  basenameKey,
  filenameKey,
  shouldIgnoreZipEntry,
  extractZipAndBuildAssetMap,
  lookupAssetFile,
} = require('../../../helpers/cms-bulk-asset-map.helper');
const {
  isHttpUrl,
  parseFileCellTokens,
} = require('../../../helpers/cms-bulk-file-resolve.helper');
const { buildBulkImportReport } = require('../../../helpers/cms-bulk-report.helper');
const { buildSampleDataRowValues } = require('../../../helpers/cms-bulk-import.helper');

describe('cms-bulk-asset-map.helper', () => {
  it('basenameKey and filenameKey normalize names', () => {
    expect(basenameKey('Hero.JPG')).toBe('hero');
    expect(basenameKey('folder/banner.png')).toBe('banner');
    expect(filenameKey('Hero.JPG')).toBe('hero.jpg');
    expect(filenameKey('folder/banner.png')).toBe('banner.png');
  });

  it('shouldIgnoreZipEntry skips macOS metadata and directories', () => {
    expect(shouldIgnoreZipEntry('__MACOSX/._hero.jpg')).toBe(true);
    expect(shouldIgnoreZipEntry('images/')).toBe(true);
    expect(shouldIgnoreZipEntry('.hidden')).toBe(true);
    expect(shouldIgnoreZipEntry('hero.jpg')).toBe(false);
  });

  it('extractZipAndBuildAssetMap builds map with full filename and basename keys', async () => {
    const tmp = await fsp.mkdtemp(path.join(os.tmpdir(), 'bulk-test-'));
    const zipPath = path.join(tmp, 'assets.zip');
    const extractDir = path.join(tmp, 'extracted');

    const zip = new AdmZip();
    zip.addFile('hero.jpg', Buffer.from('fake-jpeg'));
    zip.addFile('banner.png', Buffer.from('fake-png'));
    zip.writeZip(zipPath);

    const { assetMap, assetCount } = await extractZipAndBuildAssetMap(zipPath, extractDir);
    expect(assetCount).toBe(2);
    expect(assetMap.get('hero').originalname).toBe('hero.jpg');
    expect(assetMap.get('hero.jpg').originalname).toBe('hero.jpg');
    expect(assetMap.get('banner').mimetype).toBe('image/png');
    expect(assetMap.get('banner.png').originalname).toBe('banner.png');

    await fsp.rm(tmp, { recursive: true, force: true });
  });

  it('extractZipAndBuildAssetMap marks ambiguous basenames but allows full filename lookup', async () => {
    const tmp = await fsp.mkdtemp(path.join(os.tmpdir(), 'bulk-test-'));
    const zipPath = path.join(tmp, 'dup.zip');
    const extractDir = path.join(tmp, 'dup-extract');

    const zipDup = new AdmZip();
    zipDup.addFile('hero.jpg', Buffer.from('a'));
    zipDup.addFile('hero.png', Buffer.from('b'));
    zipDup.writeZip(zipPath);

    const { assetMap, ambiguousBasenames } = await extractZipAndBuildAssetMap(
      zipPath,
      path.join(tmp, 'dup-extract'),
    );
    expect(ambiguousBasenames.get('hero')).toEqual(['hero.jpg', 'hero.png']);
    expect(assetMap.has('hero')).toBe(false);
    expect(assetMap.get('hero.jpg').originalname).toBe('hero.jpg');
    expect(lookupAssetFile('hero.jpg', assetMap, ambiguousBasenames).originalname).toBe('hero.jpg');
    expect(() => lookupAssetFile('hero', assetMap, ambiguousBasenames)).toThrow(/Ambiguous asset name/);

    await fsp.rm(tmp, { recursive: true, force: true });
  });
});

describe('cms-bulk-file-resolve.helper', () => {
  const fileField = { name: 'image', field_type: 'file', multiple: false };
  const multiField = { name: 'gallery', field_type: 'file', multiple: true };

  it('isHttpUrl detects URLs', () => {
    expect(isHttpUrl('https://cdn.example.com/a.png')).toBe(true);
    expect(isHttpUrl('hero')).toBe(false);
  });

  it('parseFileCellTokens splits comma-separated filenames with or without extension', () => {
    expect(parseFileCellTokens('hero, banner', multiField)).toEqual(['hero', 'banner']);
    expect(parseFileCellTokens('hero.jpg, banner.png', multiField)).toEqual(['hero.jpg', 'banner.png']);
    expect(parseFileCellTokens('hero', fileField)).toEqual(['hero']);
    expect(parseFileCellTokens('hero.jpg', fileField)).toEqual(['hero.jpg']);
  });

  it('parseFileCellTokens parses JSON array for multiple file fields', () => {
    expect(parseFileCellTokens('["hero","banner"]', multiField)).toEqual(['hero', 'banner']);
  });
});

describe('cms-bulk-report.helper', () => {
  it('buildBulkImportReport appends status columns', () => {
    const rowResults = [
      {
        row_number: 2,
        status: 'success',
        created_id: 'abc123',
        failure_reason: '',
        original_row: { title: 'One', image: 'hero' },
      },
      {
        row_number: 3,
        status: 'failed',
        created_id: '',
        failure_reason: "Asset 'missing' not found",
        original_row: { title: 'Two', image: 'missing' },
      },
    ];

    const csv = buildBulkImportReport(rowResults, 'csv', ['title', 'image']).toString('utf8');
    expect(csv).toContain('import_status');
    expect(csv).toContain('failure_reason');
    expect(csv).toContain('created_id');
    expect(csv).toContain('success');
    expect(csv).toContain('failed');
    expect(csv).toContain("Asset 'missing' not found");
    expect(csv).toContain('abc123');

    const xlsx = buildBulkImportReport(rowResults, 'xlsx', ['title', 'image']);
    expect(Buffer.isBuffer(xlsx)).toBe(true);
    expect(xlsx.length).toBeGreaterThan(100);
  });
});

describe('buildSampleDataRowValues', () => {
  it('formats multiple file and product fields as comma-separated strings', () => {
    const definition = {
      fields: [
        { name: 'product', field_type: 'product', multiple: false },
        { name: 'model', field_type: 'file', multiple: true },
      ],
    };
    const row = buildSampleDataRowValues(definition);
    expect(row[0]).toBe('SAMPLE-SKU');
    expect(row[1]).toBe('hero,banner');
  });
});
