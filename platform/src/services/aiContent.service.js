import axios from 'axios';
import { url } from '../common/config';
import { getAppId, getCompany } from '../helper/utils';

const baseApi = `${url.baseUrl}${url.baseApiUrl}`;

const getAppParams = () => {
  const application_id = getAppId();
  const company_id = getCompany();
  return { application_id, company_id };
};

const startAiJob = (payload) => {
  const params = getAppParams();
  return axios.post(`${baseApi}/ai-content/jobs`, { ...payload, ...params }, { params });
};

const listAiJobs = (params = {}) =>
  axios.get(`${baseApi}/ai-content/jobs`, {
    params: { ...params, ...getAppParams() },
  });

const getAiJobStatus = (jobId) =>
  axios.get(`${baseApi}/ai-content/jobs/${jobId}`, {
    params: getAppParams(),
  });

const listReviewRows = (jobId, params = {}) =>
  axios.get(`${baseApi}/ai-content/jobs/${jobId}/review`, {
    params: { ...params, ...getAppParams() },
  });

const editReviewRow = (jobId, rowId, generated_content) =>
  axios.put(
    `${baseApi}/ai-content/jobs/${jobId}/review/${rowId}`,
    { generated_content, ...getAppParams() },
    { params: getAppParams() },
  );

const regenerateReviewRow = (jobId, rowId) =>
  axios.post(
    `${baseApi}/ai-content/jobs/${jobId}/review/${rowId}/regenerate`,
    { ...getAppParams() },
    { params: getAppParams() },
  );

const pushReviewRow = (jobId, rowId, payload = {}) =>
  axios.post(
    `${baseApi}/ai-content/jobs/${jobId}/review/${rowId}/push`,
    { ...payload, ...getAppParams() },
    { params: getAppParams() },
  );

const revertField = (fieldHistoryId, payload = {}) =>
  axios.post(
    `${baseApi}/ai-content/fields/${fieldHistoryId}/revert`,
    { ...payload, ...getAppParams() },
    { params: getAppParams() },
  );

const submitFeedback = (payload = {}) =>
  axios.post(`${baseApi}/ai-content/feedback`, { ...payload, ...getAppParams() }, { params: getAppParams() });

const previewAiJob = (jobId, payload = {}) =>
  axios.post(
    `${baseApi}/ai-content/jobs/${jobId}/preview`,
    { ...payload, ...getAppParams() },
    { params: getAppParams() },
  );

const confirmAiJob = (jobId, payload = {}) =>
  axios.post(
    `${baseApi}/ai-content/jobs/${jobId}/confirm`,
    { ...payload, ...getAppParams() },
    { params: getAppParams() },
  );

const getTonePreset = (toneId) =>
  axios.get(`${baseApi}/ai-content/tones/${toneId}`, {
    params: getAppParams(),
  });

const updateTonePreset = (toneId, rule_text) =>
  axios.put(
    `${baseApi}/ai-content/tones/${toneId}`,
    { rule_text, ...getAppParams() },
    { params: getAppParams() },
  );

const resetTonePreset = (toneId) =>
  axios.post(
    `${baseApi}/ai-content/tones/${toneId}/reset`,
    { ...getAppParams() },
    { params: getAppParams() },
  );

export {
  startAiJob,
  listAiJobs,
  getAiJobStatus,
  previewAiJob,
  confirmAiJob,
  listReviewRows,
  editReviewRow,
  regenerateReviewRow,
  pushReviewRow,
  revertField,
  submitFeedback,
  getTonePreset,
  updateTonePreset,
  resetTonePreset,
};
