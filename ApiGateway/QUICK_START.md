# API Gateway Quick Start

## Overview

The API Gateway is the single entry point for all client requests. It routes requests to the appropriate microservices and provides centralized features like rate limiting, health checks, and logging.

## Setup

### 1. Install Dependencies

```bash
cd ApiGateway
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
PORT=3000
NODE_ENV=development

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
DATABASE_SERVICE_URL=http://localhost:3003
STORAGE_SERVICE_URL=http://localhost:3002

# CORS (optional)
CORS_ORIGIN=*
```

### 3. Start the Gateway

```bash
npm run dev
```

The gateway will start on `http://localhost:3000`

## Routes

All requests go through the gateway:

- **Auth Service**: `http://localhost:3000/api/auth/*`
- **Database Service**: `http://localhost:3000/api/db/*`
- **Storage Service**: `http://localhost:3000/api/storage/*`
- **Health Check**: `http://localhost:3000/health`

## Example Usage

### Before (Direct Service Access)
```bash
# Auth Service
curl http://localhost:3001/api/auth/login

# Database Service
curl http://localhost:3003/api/db/clusters
```

### After (Through Gateway)
```bash
# Auth Service
curl http://localhost:3000/api/auth/login

# Database Service
curl http://localhost:3000/api/db/clusters
```

## Health Check

Check gateway and all services health:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "gateway": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "overall": "healthy",
  "services": [
    {
      "service": "auth-service",
      "status": "healthy",
      "statusCode": 200,
      "data": { "status": "ok", "service": "auth-service" },
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "service": "database-service",
      "status": "healthy",
      "statusCode": 200,
      "data": { "status": "ok", "service": "database-service" },
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Rate Limiting

The gateway implements rate limiting:

- **Auth endpoints**: 20 requests per 15 minutes per IP
- **Database endpoints**: 100 requests per 15 minutes per IP
- **Storage endpoints**: 50 requests per 15 minutes per IP

Rate limit headers are included in responses:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Remaining requests in window
- `RateLimit-Reset`: Time when the rate limit resets

## Features

### Request Routing
- Automatically routes requests to correct microservice
- Preserves all headers and query parameters
- Transparent proxy (client doesn't know about individual services)

### Health Monitoring
- Aggregates health from all services
- Returns overall system status
- Useful for monitoring and alerting

### Security
- Helmet for security headers
- CORS configuration
- Rate limiting protection
- Request logging

### Error Handling
- Centralized error handling
- Service unavailable detection
- User-friendly error messages

## Architecture

```
Client
  ↓
API Gateway (Port 3000)
  ↓
┌─────────────┬──────────────┬──────────────┐
│ Auth :3001  │ Database:3003│ Storage:3002 │
└─────────────┴──────────────┴──────────────┘
```

## Troubleshooting

### Gateway can't reach services

1. Verify services are running:
```bash
curl http://localhost:3001/health  # Auth
curl http://localhost:3003/health  # Database
```

2. Check service URLs in `.env` file

3. Check network connectivity

### Rate limit errors

If you hit rate limits:
- Wait for the time window to reset
- Adjust rate limits in `src/middleware/rateLimiter.js`
- Use different IP addresses for testing

### Service unavailable errors

If you get 503 errors:
- Check if the target service is running
- Verify service URLs in `.env`
- Check service logs for errors

## Production Considerations

1. **Load Balancing**: Add multiple instances behind a load balancer
2. **SSL/TLS**: Use HTTPS in production
3. **Monitoring**: Integrate with monitoring tools (Prometheus, Grafana)
4. **Logging**: Set up centralized logging (ELK stack, CloudWatch)
5. **Rate Limits**: Adjust based on expected traffic
6. **Caching**: Add Redis for response caching
7. **Service Discovery**: Use service discovery instead of hardcoded URLs

