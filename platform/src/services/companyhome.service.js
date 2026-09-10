import axios from 'axios';
import { url } from '../common/config';
import URLS from './endpoint.service';
import { getCompany } from '../helper/utils';

let companyApiBaseUrl = `${url.baseUrl}${url.baseApiUrl}${url.companyHome}`;

axios.interceptors.request.use((config) => {
  config.headers['x-company-id'] = getCompany();
  return config;
});

const getCompanySalesChannels = async () => {
  const headers = {};
  const data = {};
  return axios.get(URLS.GET_ALL_APPLICATIONS(), {
    headers,
    data,
  });
};

const getAppDetails = async (appId) => {
  const headers = {};
  const data = {};
  return axios.get(`${companyApiBaseUrl}/application/${appId}/details`, {
    headers,
    data,
  });
};

export { getCompanySalesChannels, getAppDetails };
