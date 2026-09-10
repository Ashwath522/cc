'use strict';

const path = require('path');

const MB = 1024 * 1024;

/** Common image MIME types */
const IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/tiff',
  'image/x-icon',
]);

/** Common video MIME types */
const VIDEO_MIMES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-ms-wmv',
  'application/x-mpegURL',
  'video/3gpp',
  'video/x-flv',
  'application/mp4',
]);

/** Common document MIME types */
const DOCUMENT_MIMES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
]);

const getDefaultFileConfig = () => ({
  allow_all: true,
  allow_images: false,
  allow_videos: false,
  allow_documents: false,
  custom_extensions: '',
  image_max_mb: 20,
  video_max_mb: 1024,
  document_max_mb: 10,
});

const normalizeFileConfig = (fc) => ({
  ...getDefaultFileConfig(),
  ...(fc && typeof fc === 'object' ? fc : {}),
});

const extensionMatches = (originalname, extList) => {
  const ext = path.extname(originalname || '').replace(/^\./, '').toLowerCase();
  if (!ext) {
    return false;
  }
  return extList.some((e) => e.toLowerCase() === ext);
};

/**
 * @param {object} file - multer file { mimetype, size, originalname }
 * @param {object} field - definition field with field_type file and optional file_config
 * @returns {{ ok: boolean, error?: string }}
 */
const validateMulterFileAgainstField = (file, field) => {
  if (!file || !field || field.field_type !== 'file') {
    return { ok: true };
  }

  const fc = normalizeFileConfig(field.file_config);
  if (fc.allow_all) {
    return { ok: true };
  }

  const hasCategory =
    fc.allow_images || fc.allow_videos || fc.allow_documents || `${fc.custom_extensions || ''}`.trim();

  if (!hasCategory) {
    return {
      ok: false,
      error: `File field "${field.label || field.name}" restricts types but none are selected`,
    };
  }

  const mime = `${file.mimetype || ''}`.toLowerCase();
  const size = Number(file.size) || 0;
  let allowed = false;

  if (fc.allow_images && IMAGE_MIMES.has(mime) && size <= fc.image_max_mb * MB) {
    allowed = true;
  }
  if (fc.allow_videos && VIDEO_MIMES.has(mime) && size <= fc.video_max_mb * MB) {
    allowed = true;
  }
  if (fc.allow_documents && DOCUMENT_MIMES.has(mime) && size <= fc.document_max_mb * MB) {
    allowed = true;
  }

  const customExts = `${fc.custom_extensions || ''}`
    .split(/[,;\s]+/)
    .map((x) => x.replace(/^\./, '').trim())
    .filter(Boolean);

  if (customExts.length && extensionMatches(file.originalname, customExts)) {
    allowed = true;
  }

  if (!allowed) {
    return {
      ok: false,
      error: `File "${file.originalname}" is not an allowed type or exceeds the size limit for "${field.label || field.name}"`,
    };
  }

  return { ok: true };
};

module.exports = {
  validateMulterFileAgainstField,
  getDefaultFileConfig,
  normalizeFileConfig,
};
