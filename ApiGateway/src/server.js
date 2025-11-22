require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { authProxy, databaseProxy, storageProxy } = require('./middleware/proxy');
const { apiLimiter, authLimiter, writeLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const healthRouter = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use('/health', healthRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'BaaS Platform API Gateway',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      database: '/api/db',
      storage: '/api/storage',
      health: '/health',
    },
    timestamp: new Date().toISOString(),
  });
});

// API Routes with rate limiting
// Auth service routes (stricter rate limiting)
app.use('/api/auth', authLimiter, authProxy);

// Database service routes
app.use('/api/db', apiLimiter, databaseProxy);

// Storage service routes (stricter for write operations)
app.use('/api/storage', writeLimiter, storageProxy);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: {
      auth: '/api/auth',
      database: '/api/db',
      storage: '/api/storage',
      health: '/health',
    },
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n Available Routes:`);
  console.log(`   Auth Service:     /api/auth/*`);
  console.log(`   Database Service: /api/db/*`);
  console.log(`   Storage Service:  /api/storage/*`);
  console.log(`   Health Check:      /health\n`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing API Gateway');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing API Gateway');
  process.exit(0);
});

