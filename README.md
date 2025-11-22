# Backend-as-a-Service (BaaS) Platform

A microservices-based BaaS platform similar to Appwrite and Firebase, built with Node.js, Express, MongoDB, Redis, and Kafka.

## Architecture

The platform consists of multiple microservices, all sharing centralized infrastructure:

### Infrastructure Services (Shared)
- **MongoDB** - Centralized database (each service uses its own database)
- **Redis** - Shared caching and coordination layer
- **Kafka** - Inter-service messaging and event streaming
- **Zookeeper** - Kafka coordination

### Microservices

1. **Auth Service** (Port 3001)
   - User authentication and authorization
   - JWT token management
   - Email verification
   - Password reset

2. **Database Service** (Port 3003)
   - Dynamic database cluster/collection management
   - CRUD API generation per cluster
   - Data isolation per user

3. **Storage Service** (Coming soon)
   - File upload and management
   - Storage API endpoints

## Quick Start

### 1. Start Infrastructure Services

Start all shared infrastructure services:

```bash
docker-compose up -d
```

This starts:
- MongoDB on port `27017`
- Redis on port `6379`
- Kafka on port `9092`
- Zookeeper on port `2181`

### 2. Start Microservices

**Auth Service:**
```bash
cd Auth
npm install
# Create .env file (see Auth/QUICK_START.md)
npm run dev
```

**Database Service:**
```bash
cd Database
npm install
# Create .env file (see Database/QUICK_START.md)
npm run dev
```

## Directory Structure

```
SD/
├── docker-compose.yml          # Centralized infrastructure
├── Auth/                       # Authentication microservice
│   ├── src/
│   ├── package.json
│   └── ...
├── Database/                   # Database microservice
│   ├── src/
│   ├── package.json
│   └── ...
├── Storage/                    # Storage microservice (to be implemented)
└── README.md
```

## Environment Configuration

Each service has its own `.env` file but they all connect to the same infrastructure:

### MongoDB
All services connect to: `mongodb://localhost:27017`
- Auth Service uses database: `auth-service`
- Database Service uses database: `database-service`

### Redis
All services connect to: `localhost:6379`

### Kafka
All services connect to: `localhost:9092`

## Service Communication

- **Synchronous**: Services communicate via HTTP/REST (e.g., Database Service verifies tokens with Auth Service)
- **Asynchronous**: Services publish events to Kafka topics:
  - `user-events` - User lifecycle events
  - `auth-events` - Authentication events
  - `cluster-events` - Database cluster events

## Development

### Starting Everything

1. Start infrastructure:
```bash
docker-compose up -d
```

2. Start services in separate terminals:
```bash
# Terminal 1
cd Auth && npm run dev

# Terminal 2
cd Database && npm run dev
```

### Stopping Everything

```bash
# Stop all services (Ctrl+C in each terminal)
# Stop infrastructure
docker-compose down
```

## Health Checks

- Infrastructure: `docker ps` to see running containers
- Auth Service: `http://localhost:3001/health`
- Database Service: `http://localhost:3003/health`

## Documentation

- [Auth Service Documentation](./Auth/README.md)
- [Database Service Documentation](./Database/README.md)
- [Auth API Docs](./Auth/API_DOCUMENTATION.md)
- [Database API Docs](./Database/API_DOCUMENTATION.md)

## Notes

- All services are designed to work without Redis/Kafka (graceful degradation)
- MongoDB is required for all services
- Auth Service must be running for Database Service to verify tokens
- Services communicate on the same Kafka cluster for event streaming

