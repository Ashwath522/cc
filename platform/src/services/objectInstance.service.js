import axios from 'axios';
import { url } from '../common/config';
import { getAppId, getCompany } from '../helper/utils';

const baseApi = `${url.baseUrl}${url.baseApiUrl}`;

const getAppParams = () => {
  const application_id = getAppId();
  const company_id = getCompany();
  return { application_id, company_id };
};



const listInstances = (slug, params = {}) =>
  axios.get(`${baseApi}/cms/${slug}`, {
    params: { ...params, ...getAppParams() },
  });
const getInstance = (slug, id) =>
  axios.get(`${baseApi}/cms/${slug}/${id}`, { params: getAppParams() });
const createInstance = (slug, payload) => {
  const params = getAppParams();
  const data = payload instanceof FormData ? payload : { ...payload, ...params };
  if (payload instanceof FormData) {
    data.append('application_id', params.application_id);
    data.append('company_id', params.company_id);
  }
  return axios.post(`${baseApi}/cms/${slug}`, data, { params });
};
const updateInstance = (slug, id, payload) => {
  const params = getAppParams();
  const data = payload instanceof FormData ? payload : { ...payload, ...params };
  if (payload instanceof FormData) {
    data.append('application_id', params.application_id);
    data.append('company_id', params.company_id);
  }
  return axios.put(`${baseApi}/cms/${slug}/${id}`, data, { params });
};
const deleteInstance = (slug, id) =>
  axios.delete(`${baseApi}/cms/${slug}/${id}`, { params: getAppParams() });
const getDefinitionBySlug = (slug) =>
  axios.get(`${baseApi}/cms/${slug}/definition`, { params: getAppParams() });

const downloadBulkTemplateBlob = (slug, format) =>
  axios.get(`${baseApi}/cms/${slug}/bulk/template`, {
    params: { ...getAppParams(), format },
    responseType: 'blob',
  });

const bulkImportFile = (slug, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return axios.post(`${baseApi}/cms/${slug}/bulk/import`, fd, {
    params: getAppParams(),
  });
};

const startBulkImportAsync = (slug, spreadsheet, assetsZip) => {
  const fd = new FormData();
  fd.append('spreadsheet', spreadsheet);
  fd.append('assets', assetsZip);
  return axios.post(`${baseApi}/cms/${slug}/bulk/import-async`, fd, {
    params: getAppParams(),
  });
};

const listBulkImportJobs = (slug) =>
  axios.get(`${baseApi}/cms/${slug}/bulk/jobs`, { params: getAppParams() });

const getBulkImportJobStatus = (slug, jobId) =>
  axios.get(`${baseApi}/cms/${slug}/bulk/jobs/${jobId}`, { params: getAppParams() });

const downloadBulkImportReport = (slug, jobId, format) =>
  axios.get(`${baseApi}/cms/${slug}/bulk/jobs/${jobId}/report`, {
    params: { ...getAppParams(), format },
    responseType: 'blob',
  });

export {
  listInstances,
  getInstance,
  createInstance,
  updateInstance,
  deleteInstance,
  getDefinitionBySlug,
  downloadBulkTemplateBlob,
  bulkImportFile,
  startBulkImportAsync,
  listBulkImportJobs,
  getBulkImportJobStatus,
  downloadBulkImportReport,
};
