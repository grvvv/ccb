const express = require('express');
const config = require('./src/config');

const app = express();
const API_VERSION = process.env.API_VERSION

// Middlewares
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method == 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
      return res.status(200).json({});
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.static("public"))

const routesPath = `./src/api/routes`;
app.use(`/api/`, require(routesPath));

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    environment: config.env,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
