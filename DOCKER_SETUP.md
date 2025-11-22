# Docker Compose Setup Guide

This guide explains how to run the entire BaaS Platform using Docker Compose.

## Prerequisites

- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)

## Quick Start

1. **Set Environment Variables (Optional)**

   Create a `.env` file in the root directory for sensitive configuration:

   ```bash
   # JWT Secrets (REQUIRED - Change these in production!)
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars

   # Email Configuration (Optional - for password reset/verification)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@baas-platform.com
   ```

2. **Start All Services**

   ```bash
   docker-compose up -d
   ```

   This will start:
   - **Infrastructure**: MongoDB, Redis, Zookeeper, Kafka
   - **Backend Services**: Auth Service, Database Service, Storage Service
   - **API Gateway**: Nginx reverse proxy
   - **Frontend**: React application

3. **Check Service Status**

   ```bash
   docker-compose ps
   ```

4. **View Logs**

   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f auth-service
   docker-compose logs -f frontend
   ```

## Service URLs

Once all services are running, you can access:

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **Auth Service** (direct): http://localhost:3001
- **Storage Service** (direct): http://localhost:3002
- **Database Service** (direct): http://localhost:3003
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **Kafka**: localhost:9092

## API Endpoints (via Gateway)

- **Auth**: http://localhost:3000/api/auth/*
- **Database**: http://localhost:3000/api/db/*
- **Storage**: http://localhost:3000/api/storage/*

## Health Checks

Check if services are healthy:

```bash
# API Gateway
curl http://localhost:3000/health

# Auth Service
curl http://localhost:3001/health

# Storage Service
curl http://localhost:3002/health

# Database Service
curl http://localhost:3003/health

# Frontend
curl http://localhost:5173/health
```

## Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This deletes all data!)
docker-compose down -v
```

## Rebuilding Services

If you make changes to the code:

```bash
# Rebuild specific service
docker-compose build auth-service

# Rebuild all services
docker-compose build

# Rebuild and restart
docker-compose up -d --build
```

## Development Mode

For development with hot-reload, you can run services individually:

1. Start infrastructure only:
   ```bash
   docker-compose up -d mongodb redis zookeeper kafka
   ```

2. Run services locally with `npm run dev` in each service directory.

## Production Considerations

1. **Change JWT Secrets**: Update `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env`
2. **Email Configuration**: Configure proper SMTP settings
3. **SSL/TLS**: Add SSL certificates for production
4. **Resource Limits**: Add resource limits to docker-compose.yml
5. **Backup Strategy**: Set up regular backups for MongoDB volumes
6. **Monitoring**: Add monitoring and logging solutions
7. **Security**: Review and harden security settings

## Troubleshooting

### Services won't start

1. Check if ports are already in use:
   ```bash
   lsof -i :3000 -i :3001 -i :3002 -i :3003 -i :27017 -i :6379 -i :9092
   ```

2. Check logs:
   ```bash
   docker-compose logs [service-name]
   ```

### Database connection issues

- Ensure MongoDB is healthy: `docker-compose ps mongodb`
- Check MongoDB logs: `docker-compose logs mongodb`

### Service dependencies

Services have health checks and wait for dependencies. If a service fails to start:
- Check dependency service logs
- Verify health check endpoints
- Increase health check retries if needed

## Volumes

Data is persisted in Docker volumes:
- `mongodb_data`: MongoDB database files
- `redis_data`: Redis persistence
- `storage_uploads`: Uploaded files
- `nginx_logs`: Nginx access/error logs

To backup volumes:
```bash
docker run --rm -v baas-platform_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb_backup.tar.gz /data
```

## Network

All services are connected via the `baas-network` bridge network, allowing them to communicate using service names (e.g., `auth-service:3001`).

