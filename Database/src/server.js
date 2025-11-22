require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const { connectKafka } = require('./config/kafka');
const clusterRoutes = require('./routes/clusterRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3003;


app.use(helmet());
app.use(cors());

// Body parsing with error handling
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
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
  res.json({ status: 'ok', service: 'database-service', timestamp: new Date().toISOString() });
});

app.use('/api/db', clusterRoutes);

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
      console.log(`Database Service running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Configure server timeouts
    server.timeout = 30000; // 30 seconds
    server.keepAliveTimeout = 65000; // 65 seconds
    server.headersTimeout = 66000; // 66 seconds

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

