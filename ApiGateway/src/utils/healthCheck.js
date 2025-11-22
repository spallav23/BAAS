const axios = require('axios');
const services = require('../config/services');

/**
 * Check health of a single service
 */
const checkServiceHealth = async (serviceConfig) => {
  try {
    const response = await axios.get(`${serviceConfig.url}${serviceConfig.healthEndpoint}`, {
      timeout: 5000,
    });
    return {
      service: serviceConfig.name,
      status: 'healthy',
      statusCode: response.status,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      service: serviceConfig.name,
      status: 'unhealthy',
      statusCode: error.response?.status || 0,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Check health of all services
 */
const checkAllServices = async () => {
  const serviceConfigs = Object.values(services);
  const healthChecks = await Promise.allSettled(
    serviceConfigs.map((service) => checkServiceHealth(service))
  );

  const results = healthChecks.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      service: serviceConfigs[index].name,
      status: 'error',
      error: result.reason?.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  });

  const allHealthy = results.every((result) => result.status === 'healthy');
  const overallStatus = allHealthy ? 'healthy' : 'degraded';

  return {
    gateway: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
    overall: overallStatus,
    services: results,
  };
};

module.exports = {
  checkServiceHealth,
  checkAllServices,
};

