import urlJoin from 'url-join';
import root from 'window-or-global';
let envVars = root.env || {};

// envVars.GROOT_MAIN_URL = `${root.location.protocol}//${root.location.hostname}`;
envVars.GROOT_MAIN_URL = `${root.location.protocol}//${root.location.hostname}:${root.location.port}`;

if (
  root &&
  root.process &&
  root.process.env &&
  root.process.NODE_ENV == 'test'
) {
  envVars.GROOT_MAIN_URL = 'http://localhost:8082';
}

const Endpoints = {
  GET_TEST_API() {
    return urlJoin(envVars.GROOT_MAIN_URL, '/api/v1/test-api');
  },
  GET_ALL_APPLICATIONS() {
    return urlJoin(envVars.GROOT_MAIN_URL, '/api/v1/applications');
  },
};

export default Endpoints;
