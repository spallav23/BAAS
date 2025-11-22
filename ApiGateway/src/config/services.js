module.exports = {
  auth: {
    name: 'auth-service',
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    basePath: '/api/auth',
    healthEndpoint: '/health',
  },
  database: {
    name: 'database-service',
    url: process.env.DATABASE_SERVICE_URL || 'http://localhost:3003',
    basePath: '/api/db',
    healthEndpoint: '/health',
  },
  storage: {
    name: 'storage-service',
    url: process.env.STORAGE_SERVICE_URL || 'http://localhost:3002',
    basePath: '/api/storage',
    healthEndpoint: '/health',
  },
};

