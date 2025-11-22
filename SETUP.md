# Centralized Infrastructure Setup Guide

## Overview

This BaaS platform uses **centralized infrastructure services** that are shared by all microservices:
- **MongoDB** - One instance, multiple databases (one per service)
- **Redis** - Shared caching and coordination
- **Kafka** - Shared event streaming for inter-service communication
- **Zookeeper** - Kafka coordination (required)

## Architecture

```
┌─────────────────────────────────────────────┐
│         Centralized Infrastructure          │
├─────────────────────────────────────────────┤
│  MongoDB (27017)                            │
│    ├── auth-service (database)              │
│    ├── database-service (database)          │
│    └── storage-service (database)           │
├─────────────────────────────────────────────┤
│  Redis (6379)                               │
│    ├── Auth Service (token blacklisting)    │
│    └── Database Service (caching)           │
├─────────────────────────────────────────────┤
│  Kafka (9092)                               │
│    ├── user-events (topic)                  │
│    ├── auth-events (topic)                  │
│    └── cluster-events (topic)               │
└─────────────────────────────────────────────┘
         │           │           │
         ▼           ▼           ▼
    Auth:3001  Database:3003  Storage:3002
```

## Setup Steps

### 1. Start Centralized Infrastructure

From the **root directory** (`SD/`):

```bash
docker-compose up -d
```

This starts:
- MongoDB on `localhost:27017`
- Redis on `localhost:6379`
- Kafka on `localhost:9092`
- Zookeeper on `localhost:2181`

### 2. Verify Infrastructure is Running

```bash
# Check all containers
docker ps

# Should show:
# - baas-mongodb
# - baas-redis
# - baas-zookeeper
# - baas-kafka

# Test MongoDB
docker exec -it baas-mongodb mongosh --eval "db.adminCommand('ping')"

# Test Redis
docker exec -it baas-redis redis-cli ping
# Should return: PONG

# Test Kafka
docker exec -it baas-kafka kafka-broker-api-versions --bootstrap-server localhost:9092
```

### 3. Configure Service .env Files

Each service connects to the **same infrastructure** but uses different databases:

#### Auth Service (.env)
```bash
MONGODB_URI=mongodb://localhost:27017/auth-service
REDIS_HOST=localhost
REDIS_PORT=6379
KAFKA_BROKERS=localhost:9092
```

#### Database Service (.env)
```bash
MONGODB_URI=mongodb://localhost:27017/database-service
REDIS_HOST=localhost
REDIS_PORT=6379
KAFKA_BROKERS=localhost:9092
AUTH_SERVICE_URL=http://localhost:3001
```

### 4. Start Microservices

**Terminal 1 - Auth Service:**
```bash
cd Auth
npm install
npm run dev
```

**Terminal 2 - Database Service:**
```bash
cd Database
npm install
npm run dev
```

## Benefits of Centralized Infrastructure

1. **Resource Efficiency**: One instance instead of multiple
2. **Easier Management**: Single point of maintenance
3. **Event Streaming**: Shared Kafka cluster for inter-service communication
4. **Consistency**: All services see the same data in Redis/Kafka
5. **Cost Effective**: Reduced resource usage

## Data Isolation

Even though services share MongoDB, data is isolated:
- Each service uses a different **database name**
- Auth Service: `auth-service` database
- Database Service: `database-service` database
- User cluster data is stored in dynamic collections with user IDs

## Kafka Topics

The shared Kafka cluster handles events from all services:

- `user-events` - User lifecycle (created, updated, deleted)
- `auth-events` - Authentication events (login, logout, password reset)
- `cluster-events` - Database cluster operations (created, updated, deleted)

## Redis Usage

Shared Redis is used for:
- **Auth Service**: Token blacklisting (logout)
- **Database Service**: Cache cluster metadata and counts

## Troubleshooting

### Infrastructure Not Starting

```bash
# Check logs
docker-compose logs

# Restart specific service
docker-compose restart mongodb
docker-compose restart redis
docker-compose restart kafka
```

### Services Can't Connect

1. Verify infrastructure is running: `docker ps`
2. Check service `.env` files have correct hostnames (`localhost`)
3. Verify ports are not already in use:
   ```bash
   lsof -i :27017  # MongoDB
   lsof -i :6379   # Redis
   lsof -i :9092   # Kafka
   ```

### MongoDB Connection Errors

```bash
# Check MongoDB is accessible
mongosh mongodb://localhost:27017

# List databases
mongosh mongodb://localhost:27017 --eval "show dbs"
```

### Kafka Connection Issues

```bash
# Check Kafka is running
docker exec -it baas-kafka kafka-topics --bootstrap-server localhost:9092 --list

# View Kafka logs
docker-compose logs kafka
```

## Stopping Infrastructure

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Production Considerations

For production:
1. Use separate MongoDB replica sets per service
2. Redis cluster for high availability
3. Kafka cluster with multiple brokers
4. Network security (internal network only)
5. Monitoring and logging (Prometheus, Grafana)
6. Backup strategies for MongoDB

## Next Steps

1. Review service-specific documentation:
   - [Auth Service Setup](./Auth/QUICK_START.md)
   - [Database Service Setup](./Database/QUICK_START.md)
2. Configure email settings for Auth Service
3. Set up monitoring and logging
4. Configure production environment variables

