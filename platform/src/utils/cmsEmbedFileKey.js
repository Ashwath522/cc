const PREFIX = '__cmsEmbedFile__';

function padBase64(b64) {
  const rem = b64.length % 4;
  if (!rem) return b64;
  return b64 + '='.repeat(4 - rem);
}

/**
 * @param {Array<string|number>} segments Path: root custom_object name, optional array index, …, file field name
 */
export function buildCmsEmbedFileFormFieldName(segments) {
  const json = JSON.stringify(segments);
  const b64 = btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `${PREFIX}${b64}`;
}

/**
 * @returns {Array<string|number>|null}
 */
export function tryParseCmsEmbedFileSegments(fieldname) {
  if (!fieldname || typeof fieldname !== 'string' || !fieldname.startsWith(PREFIX)) {
    return null;
  }
  const raw = fieldname.slice(PREFIX.length);
  const b64 = padBase64(raw.replace(/-/g, '+').replace(/_/g, '/'));
  try {
    const json = decodeURIComponent(escape(atob(b64)));
    const segments = JSON.parse(json);
    if (!Array.isArray(segments) || segments.length < 2) {
      return null;
    }
    return segments;
  } catch (e) {
    return null;
  }
}
