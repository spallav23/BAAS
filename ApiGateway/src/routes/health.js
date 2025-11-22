const express = require('express');
const router = express.Router();
const { checkAllServices } = require('../utils/healthCheck');

/**
 * Gateway health check endpoint
 * Returns gateway status and aggregated service health
 */
router.get('/', async (req, res) => {
  try {
    const health = await checkAllServices();
    const statusCode = health.overall === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      gateway: {
        status: 'error',
        timestamp: new Date().toISOString(),
      },
      error: error.message,
    });
  }
});

module.exports = router;

