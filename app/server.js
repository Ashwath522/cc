'use strict';
const config = require('./common/config');
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const compression = require('compression');
const healthzRouter = require('./routes/healthz.router');
const v1Router = require('./routes/v1.router');
const { fdkExtension } = require('./fdk');
const swaggerRoute = require('./routes/swagger/swagger.route');
const { publicListObjectInstances } = require('./routes/controllers/dynamicObject.controller');
const app = express();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-company-id, x-application-id');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(cookieParser('ext.session'));
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: false }));
app.get('/env.js', (req, res) => {
  res.type('application/javascript');
  const commonEnvs = {
    sentry: config.sentry,
    env: config.env,
  };
  res.send(
    `window.env = ${JSON.stringify(
      { ...config.BROWSER_CONFIG, ...commonEnvs },
      null,
      4,
    )}`,
  );
});
app.use(swaggerRoute);
app.use('/', healthzRouter);
// Only intercepts GET /cms/:slug when x-application-data is present (see publicListObjectInstances);
// otherwise it calls next() and falls through to the normal FDK session-gated route below, unchanged.
app.get('/api/v1/cms/:slug', publicListObjectInstances);
// Direct API mount for frontend dev server / local requests
app.use('/api/v1', v1Router);
app.use(express.static('platform/dist'));
app.use('/', fdkExtension.fdkHandler);
const apiRoutes = fdkExtension.apiRoutes;
apiRoutes.use('/v1', v1Router);
app.use('/api', apiRoutes);
app.get('*', (req, res) => {
  res.contentType('text/html');
  res.sendFile(path.join(__dirname, '../platform/', 'dist/index.html'));
});
module.exports = app;
