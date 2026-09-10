'use strict';

const path = require('path');
const fsp = require('fs').promises;
const os = require('os');

const getJobWorkspaceDir = (jobId) => path.join(os.tmpdir(), 'bulk-import', `${jobId}`);

const getSpreadsheetPath = (jobId, ext) => path.join(getJobWorkspaceDir(jobId), `spreadsheet.${ext}`);

const getAssetsZipPath = (jobId) => path.join(getJobWorkspaceDir(jobId), 'assets.zip');

const getExtractDir = (jobId) => path.join(getJobWorkspaceDir(jobId), 'extracted');

const ensureJobWorkspace = async (jobId) => {
  await fsp.mkdir(getJobWorkspaceDir(jobId), { recursive: true });
};

const cleanupJobWorkspace = async (jobId) => {
  try {
    await fsp.rm(getJobWorkspaceDir(jobId), { recursive: true, force: true });
  } catch (e) {
    /* ignore */
  }
};

const detectSpreadsheetFormat = (filename) => {
  const lower = `${filename || ''}`.toLowerCase();
  return lower.endsWith('.csv') ? 'csv' : 'xlsx';
};

module.exports = {
  getJobWorkspaceDir,
  getSpreadsheetPath,
  getAssetsZipPath,
  getExtractDir,
  ensureJobWorkspace,
  cleanupJobWorkspace,
  detectSpreadsheetFormat,
};
