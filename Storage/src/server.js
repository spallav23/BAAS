require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const { connectKafka } = require('./config/kafka');
const bucketRoutes = require('./routes/bucketRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());

// Body parsing with error handling
app.use(express.json({ 
  limit: '100mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '100mb' 
}));

// Handle aborted requests gracefully
app.use((req, res, next) => {
  req.on('aborted', () => {
    if (!res.headersSent) {
      res.status(499).json({ error: 'Request aborted by client' });
    }
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'storage-service', timestamp: new Date().toISOString() });
});

app.use('/api/storage', bucketRoutes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const startServer = async () => {
  try {
    await connectDB();

    try {
      await connectRedis();
    } catch (redisError) {
      console.warn('Redis connection failed, continuing without Redis:', redisError.message);
    }

    try {
      await connectKafka();
    } catch (kafkaError) {
      console.warn('Kafka connection failed, continuing without Kafka:', kafkaError.message);
    }

    // Start server with timeout settings
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Storage Service running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Configure server timeouts
    server.timeout = 300000; // 5 minutes for file uploads
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;

    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error('Server error:', err);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

