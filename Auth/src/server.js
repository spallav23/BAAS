require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const { connectKafka } = require('./config/kafka');
const { initEmail } = require('./config/email');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);

// Error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize services and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis
    try {
      await connectRedis();
    } catch (redisError) {
      console.warn('Redis connection failed, continuing without Redis:', redisError.message);
    }

    // Connect to Kafka
    try {
      await connectKafka();
    } catch (kafkaError) {
      console.warn('Kafka connection failed, continuing without Kafka:', kafkaError.message);
    }

    // Initialize email service
    try {
      initEmail();
    } catch (emailError) {
      console.warn('Email service initialization failed:', emailError.message);
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`Auth Service running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

