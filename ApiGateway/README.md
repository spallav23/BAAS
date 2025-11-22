# API Gateway

Central API Gateway for the BaaS platform microservices. Acts as a single entry point for all client requests and routes them to appropriate microservices.

## Features

- **Request Routing**: Routes requests to appropriate microservices
- **Service Discovery**: Configurable service endpoints
- **Health Check Aggregation**: Monitors health of all services
- **Rate Limiting**: Protects services from abuse
- **Request Logging**: Comprehensive logging of all requests
- **Error Handling**: Centralized error handling
- **CORS**: Cross-origin resource sharing
- **Security**: Helmet for security headers

## Architecture

```
Client Request
    ↓
API Gateway (Port 3000)
    ↓
┌──────────┬──────────────┬──────────────┐
│  Auth    │  Database    │  Storage     │
│  :3001   │  :3003       │  :3002       │
└──────────┴──────────────┴──────────────┘
```

## Routes

- `/api/auth/*` → Auth Service (port 3001)
- `/api/db/*` → Database Service (port 3003)
- `/api/storage/*` → Storage Service (port 3002)
- `/health` → Gateway health + aggregated service health

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure `.env`:
```bash
PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
DATABASE_SERVICE_URL=http://localhost:3003
STORAGE_SERVICE_URL=http://localhost:3002
```

3. Start the gateway:
```bash
npm run dev
```

## Environment Variables

- `PORT` - Gateway port (default: 3000)
- `AUTH_SERVICE_URL` - Auth service URL
- `DATABASE_SERVICE_URL` - Database service URL
- `STORAGE_SERVICE_URL` - Storage service URL
- `NODE_ENV` - Environment (development/production)

