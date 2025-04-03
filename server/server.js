// Load environment variables FIRST - at the VERY TOP
require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const path = require('path');
const app = require('./app');
const http = require('http');

const port = process.env.PORT || 5000;

// Debugging: Log important environment variables
console.log('Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI ? '*****' : 'MISSING',  // Mask the actual URI
  JWT_SECRET: process.env.JWT_SECRET ? '*****' : 'MISSING'
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const clientBuildPath = path.join(process.cwd(), 'client', 'dist');
  app.use(express.static(clientBuildPath));

  // Handle SPA routing - return index.html for all routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

const server = http.createServer(app);

// Render requires listening on 0.0.0.0
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'configured' : 'MISSING'}`);
});