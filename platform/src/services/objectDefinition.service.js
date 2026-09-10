import axios from 'axios';
import { url } from '../common/config';
import { getAppId, getCompany } from '../helper/utils';

const baseApi = `${url.baseUrl}${url.baseApiUrl}`;

const listDefinitions = () => {
  const appId = getAppId();
  const companyId = getCompany();
  return axios.get(`${baseApi}/cms/definitions?application_id=${appId}&company_id=${companyId}`);
};

const getDefinition = (definitionId) => {
  const appId = getAppId();
  const companyId = getCompany();
  return axios.get(`${baseApi}/cms/definitions/${definitionId}?application_id=${appId}&company_id=${companyId}`);
};

const createDefinition = (payload) => {
  const appId = getAppId();
  const companyId = getCompany();
  return axios.post(`${baseApi}/cms/definitions`, { ...payload, application_id: appId, company_id: companyId });
};

const updateDefinition = (definitionId, payload) => {
  const appId = getAppId();
  const companyId = getCompany();
  return axios.put(`${baseApi}/cms/definitions/${definitionId}`, {
    ...payload,
    application_id: appId,
    company_id: companyId,
  });
};

const publishDefinition = (definitionId) => {
  const appId = getAppId();
  const companyId = getCompany();
  return axios.post(`${baseApi}/cms/definitions/${definitionId}/publish?application_id=${appId}&company_id=${companyId}`);
};

const getDefinitionDeletionImpact = (definitionId) => {
  const appId = getAppId();
  const companyId = getCompany();
  return axios.get(`${baseApi}/cms/definitions/${definitionId}/deletion-impact`, {
    params: { application_id: appId, company_id: companyId },
  });
};

const deleteDefinition = (definitionId) => {
  const appId = getAppId();
  const companyId = getCompany();
  return axios.delete(`${baseApi}/cms/definitions/${definitionId}`, {
    params: { application_id: appId, company_id: companyId },
  });
};

export {
  listDefinitions,
  getDefinition,
  createDefinition,
  updateDefinition,
  publishDefinition,
  getDefinitionDeletionImpact,
  deleteDefinition,
};
