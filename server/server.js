// Load environment variables FIRST - at the VERY TOP
require('dotenv').config({ path: __dirname + '/.env' });

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

const server = http.createServer(app);

// Render requires listening on 0.0.0.0
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'configured' : 'MISSING'}`);
});