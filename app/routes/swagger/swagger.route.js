'use strict';

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');

const router = express.Router();

router.get('/swagger.json', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(openapiSpec);
});

if (process.env.NODE_ENV === 'development') {
  router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
}

module.exports = router;
