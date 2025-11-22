const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');

/**
 * Create proxy middleware for a service
 */
const createServiceProxy = (serviceConfig) => {
  return createProxyMiddleware({
    target: serviceConfig.url,
    changeOrigin: true,
    pathRewrite: {
      [`^${serviceConfig.basePath}`]: serviceConfig.basePath, // Keep the path as is
    },
    onProxyReq: (proxyReq, req, res) => {
      // Log the proxied request
      console.log(`[Proxy] ${req.method} ${req.originalUrl} → ${serviceConfig.name}`);
      
      // Preserve original host header if needed
      if (req.headers.host) {
        proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
      }
      
      // Add gateway identification
      proxyReq.setHeader('X-Gateway', 'api-gateway');
      proxyReq.setHeader('X-Forwarded-For', req.ip || req.connection.remoteAddress);
    },
    onProxyRes: (proxyRes, req, res) => {
      // Log response
      console.log(`[Proxy] ${req.method} ${req.originalUrl} → ${proxyRes.statusCode}`);
      
      // Add gateway headers
      proxyRes.headers['X-Gateway'] = 'api-gateway';
    },
    onError: (err, req, res) => {
      console.error(`[Proxy Error] ${req.method} ${req.originalUrl}:`, err.message);
      res.status(503).json({
        error: 'Service unavailable',
        service: serviceConfig.name,
        message: 'The requested service is currently unavailable',
      });
    },
    logLevel: 'silent', // We handle logging ourselves
  });
};

/**
 * Get proxy middleware for auth service
 */
const authProxy = createServiceProxy(services.auth);

/**
 * Get proxy middleware for database service
 */
const databaseProxy = createServiceProxy(services.database);

/**
 * Get proxy middleware for storage service
 */
const storageProxy = createServiceProxy(services.storage);

module.exports = {
  authProxy,
  databaseProxy,
  storageProxy,
  createServiceProxy,
};

