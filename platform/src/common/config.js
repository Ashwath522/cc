// import urlJoin from "url-join";
import root from 'window-or-global';
let envVars = root.env || {};
envVars.EXTENSION_BASE_URL = `${root.location.protocol}//${root.location.hostname}`;

const url = {
  baseUrl: envVars.EXTENSION_BASE_URL,
  baseApiUrl: '/api/v1',
  baseClientApiUrl: '/application/api/v1.0',
  companyHome: '/company',
  appHome: '/company/application',
};

export { url };
