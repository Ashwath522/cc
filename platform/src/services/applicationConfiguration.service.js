import axios from 'axios';
import { url } from '../common/config';
import { getAppId } from '../helper/utils';

const baseUrl = () =>
  `${url.baseUrl}${url.baseApiUrl}${url.appHome}/${getAppId()}`;

const handleManageScript = (data) => {
  return axios.post(`${baseUrl()}${url.manageScript}`, { ...data });
};

const getInjectedScripts = () => {
  return axios.get(`${baseUrl()}${url.manageScript}`);
};

const setProxy = () => {
  return axios.put(`${baseUrl()}${url.addProxy}`);
};

const removeProxy = () => {
  return axios.delete(`${baseUrl()}${url.removeProxy}`);
};

export { handleManageScript, getInjectedScripts, setProxy, removeProxy };
