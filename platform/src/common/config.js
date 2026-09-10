// import urlJoin from "url-join";
import root from 'window-or-global';
let envVars = root.env || {};

// In development or when EXTENSION_BASE_URL points to localhost without port,
// use empty baseUrl ('') so Axios requests relative path '/api/v1/...'
// which webpack devServer proxy automatically forwards to port 8082 without CORS or port issues.
let baseUrl = '';
if (envVars.EXTENSION_BASE_URL && !envVars.EXTENSION_BASE_URL.includes('localhost') && !envVars.EXTENSION_BASE_URL.includes('127.0.0.1')) {
  baseUrl = envVars.EXTENSION_BASE_URL;
}

const url = {
  baseUrl,
  baseApiUrl: '/api/v1',
  baseClientApiUrl: '/application/api/v1.0',
  companyHome: '/company',
  appHome: '/company/application',
};

export { url };
