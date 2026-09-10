'use strict';

const path = require('path');
const fsp = require('fs').promises;
const AdmZip = require('adm-zip');

const EXT_MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  pdf: 'application/pdf',
  csv: 'text/csv',
  txt: 'text/plain',
};

const guessMimeType = (filename) => {
  const ext = path.extname(filename).replace(/^\./, '').toLowerCase();
  return EXT_MIME[ext] || 'application/octet-stream';
};

const IGNORED_ZIP_PREFIXES = ['__MACOSX/', '__MACOSX\\'];

const shouldIgnoreZipEntry = (entryName) => {
  const normalized = `${entryName}`.replace(/\\/g, '/');
  if (!normalized || normalized.endsWith('/')) {
    return true;
  }
  const base = path.basename(normalized);
  if (!base || base.startsWith('.')) {
    return true;
  }
  return IGNORED_ZIP_PREFIXES.some((p) => normalized.startsWith(p));
};

const normalizeFileToken = (filename) =>
  path.basename(`${filename}`.replace(/\\/g, '/')).trim().toLowerCase();

const basenameKey = (filename) => {
  const base = normalizeFileToken(filename);
  const ext = path.extname(base);
  const name = ext ? base.slice(0, -ext.length) : base;
  return name.trim();
};

const filenameKey = (filename) => normalizeFileToken(filename);


const extractZipBufferAndBuildAssetMap = async (zipBuffer, extractDir) => {
  await fsp.mkdir(extractDir, { recursive: true });

  let zip;
  try {
    zip = new AdmZip(zipBuffer);
  } catch (e) {
    throw new Error(`Could not read ZIP file: ${e.message}`);
  }

  const entries = zip.getEntries().filter((e) => !e.isDirectory && !shouldIgnoreZipEntry(e.entryName));
  if (!entries.length) {
    throw new Error('ZIP contains no usable files');
  }

  zip.extractAllTo(extractDir, true);

  const descriptors = [];

  for (const entry of entries) {
    const normalized = entry.entryName.replace(/\\/g, '/');
    const originalname = path.basename(normalized);
    const absPath = path.join(extractDir, ...normalized.split('/'));
    let stat;
    try {
      stat = await fsp.stat(absPath);
    } catch (e) {
      continue;
    }
    if (!stat.isFile()) {
      continue;
    }

    descriptors.push({
      path: absPath,
      originalname,
      mimetype: guessMimeType(originalname),
      size: stat.size,
    });
  }

  if (!descriptors.length) {
    throw new Error('ZIP contains no usable files after extraction');
  }

  const assetMap = new Map();
  const byBasename = new Map();

  for (const descriptor of descriptors) {
    const fullKey = filenameKey(descriptor.originalname);
    if (assetMap.has(fullKey)) {
      throw new Error(
        `Duplicate filename in ZIP: '${descriptor.originalname}' appears more than once`,
      );
    }
    assetMap.set(fullKey, descriptor);

    const baseKey = basenameKey(descriptor.originalname);
    if (!byBasename.has(baseKey)) {
      byBasename.set(baseKey, []);
    }
    byBasename.get(baseKey).push(descriptor);
  }

  const ambiguousBasenames = new Map();
  for (const [baseKey, list] of byBasename.entries()) {
    if (list.length === 1) {
      assetMap.set(baseKey, list[0]);
    } else {
      ambiguousBasenames.set(
        baseKey,
        list.map((d) => d.originalname),
      );
    }
  }

  return {
    assetMap,
    assetCount: descriptors.length,
    ambiguousBasenames,
  };
};

/**
 * Extract ZIP to extractDir and build lookup map (full filename and unique basename keys).
 * @returns {{ assetMap: Map<string, object>, assetCount: number, ambiguousBasenames: Map<string, string[]> }}
 */
const extractZipAndBuildAssetMap = async (zipPath, extractDir) => {
  await fsp.mkdir(extractDir, { recursive: true });

  let zip;
  try {
    zip = new AdmZip(zipPath);
  } catch (e) {
    throw new Error(`Could not read ZIP file: ${e.message}`);
  }

  const entries = zip.getEntries().filter((e) => !e.isDirectory && !shouldIgnoreZipEntry(e.entryName));
  if (!entries.length) {
    throw new Error('ZIP contains no usable files');
  }

  zip.extractAllTo(extractDir, true);

  const descriptors = [];

  for (const entry of entries) {
    const normalized = entry.entryName.replace(/\\/g, '/');
    const originalname = path.basename(normalized);
    const absPath = path.join(extractDir, ...normalized.split('/'));
    let stat;
    try {
      stat = await fsp.stat(absPath);
    } catch (e) {
      continue;
    }
    if (!stat.isFile()) {
      continue;
    }

    descriptors.push({
      path: absPath,
      originalname,
      mimetype: guessMimeType(originalname),
      size: stat.size,
    });
  }

  if (!descriptors.length) {
    throw new Error('ZIP contains no usable files after extraction');
  }

  const assetMap = new Map();
  const byBasename = new Map();

  for (const descriptor of descriptors) {
    const fullKey = filenameKey(descriptor.originalname);
    if (assetMap.has(fullKey)) {
      throw new Error(
        `Duplicate filename in ZIP: '${descriptor.originalname}' appears more than once`,
      );
    }
    assetMap.set(fullKey, descriptor);

    const baseKey = basenameKey(descriptor.originalname);
    if (!byBasename.has(baseKey)) {
      byBasename.set(baseKey, []);
    }
    byBasename.get(baseKey).push(descriptor);
  }

  const ambiguousBasenames = new Map();
  for (const [baseKey, list] of byBasename.entries()) {
    if (list.length === 1) {
      assetMap.set(baseKey, list[0]);
    } else {
      ambiguousBasenames.set(
        baseKey,
        list.map((d) => d.originalname),
      );
    }
  }

  return {
    assetMap,
    assetCount: descriptors.length,
    ambiguousBasenames,
  };
};

/**
 * Resolve a spreadsheet token to a file descriptor from the asset map.
 */
const lookupAssetFile = (token, assetMap, ambiguousBasenames = new Map()) => {
  const trimmed = `${token}`.trim();
  if (!trimmed) {
    return null;
  }

  const fullKey = filenameKey(trimmed);
  if (assetMap.has(fullKey)) {
    return assetMap.get(fullKey);
  }

  const baseKey = basenameKey(trimmed);
  if (ambiguousBasenames.has(baseKey)) {
    const names = ambiguousBasenames.get(baseKey).join(', ');
    const err = new Error(`Ambiguous asset name '${trimmed}' (${names}); use full filename with extension`);
    err.isAmbiguous = true;
    throw err;
  }

  if (assetMap.has(baseKey)) {
    return assetMap.get(baseKey);
  }

  return null;
};

module.exports = {
  basenameKey,
  filenameKey,
  shouldIgnoreZipEntry,
  extractZipAndBuildAssetMap,
  extractZipBufferAndBuildAssetMap,
  lookupAssetFile,
};
