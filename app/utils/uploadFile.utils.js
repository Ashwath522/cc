const fsp = require('fs').promises;
const axios = require('axios');
const config = require('../common/config');
const { UPLOAD_NAMESPACE } = require('../constants/constant');
const logger = require('./../common/logger');

const uploadToFileStorage = async (platformAppCli, { originalname, mimetype, size, buffer }) => {
  const startBody = {
    file_name: originalname,
    content_type: mimetype,
    size,
  };
  startBody.params = {};
  startBody.params.extension_slug = config.APP_IDENTIFIER;
  const startUpload = await platformAppCli.fileStorage.appStartUpload({
    namespace: UPLOAD_NAMESPACE,
    body: startBody,
  });
  await axios.put(startUpload.upload.url, buffer, {
    withCredentials: false,
    headers: { 'Content-Type': mimetype },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  logger.info(`Uploading file to fileStorage: ${originalname}`);
  const completeUpload = await platformAppCli.fileStorage.appCompleteUpload({
    namespace: UPLOAD_NAMESPACE,
    body: startUpload,
  });
  return completeUpload;
};

const uploadFileUtils = async (platformAppCli, file) => {
  logger.info(`Path of file during upload :: ${file.path}`);
  const contents = await fsp.readFile(file.path);
  const completeUpload = await uploadToFileStorage(platformAppCli, {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    buffer: contents,
  });
  return completeUpload.cdn.url;
};

const uploadBufferUtils = async (platformAppCli, { buffer, originalname, mimetype }) => {
  const completeUpload = await uploadToFileStorage(platformAppCli, {
    originalname,
    mimetype,
    size: buffer.length,
    buffer,
  });
  return completeUpload;
};

const downloadUrlToBuffer = async (url, maxBytes = 60 * 1024 * 1024) => {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    maxContentLength: maxBytes,
    maxBodyLength: maxBytes,
    timeout: 120000,
  });
  return Buffer.from(response.data);
};

/**
 * Download a platform-uploaded file. Tries CDN URL first, then signed URL via platform API
 * (required when CDN is not publicly reachable from app pods).
 */
const downloadPlatformFileToBuffer = async (platformClient, url, maxBytes = 60 * 1024 * 1024) => {
  const fileUrl = `${url || ''}`.trim();
  if (!fileUrl) {
    throw new Error('File URL is empty');
  }

  try {
    return await downloadUrlToBuffer(fileUrl, maxBytes);
  } catch (directErr) {
    logger.warn(`Direct CDN download failed (${fileUrl}): ${directErr.message}`);
  }

  if (!platformClient || !platformClient.fileStorage) {
    throw new Error('Could not download file from storage (no platform client)');
  }

  const signed = await platformClient.fileStorage.getSignUrls({
    body: { urls: [fileUrl], expiry: 600 },
  });
  const signedUrl = signed?.urls?.[0]?.signed_url;
  if (!signedUrl) {
    throw new Error('Could not obtain signed URL for file download');
  }

  try {
    return await downloadUrlToBuffer(signedUrl, maxBytes);
  } catch (signedErr) {
    logger.warn(`Signed URL download failed (${fileUrl}): ${signedErr.message}`);
  }

  try {
    const proxied = await platformClient.fileStorage.proxy({ url: fileUrl });
    if (typeof proxied === 'string' && proxied.length) {
      return Buffer.from(proxied, 'binary');
    }
  } catch (proxyErr) {
    logger.warn(`Platform proxy download failed (${fileUrl}): ${proxyErr.message}`);
  }

  throw new Error('Could not download file from storage (CDN, signed URL, and proxy all failed)');
};

module.exports = {
  uploadFileUtils,
  uploadBufferUtils,
  downloadUrlToBuffer,
  downloadPlatformFileToBuffer,
};
