# Quick Start Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Redis
- Kafka (with Zookeeper)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd Auth
npm install
```

### 2. Environment Configuration

Create a `.env` file in the Auth directory:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/auth-service

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=auth-service
KAFKA_GROUP_ID=auth-service-group

# Email Configuration (for password reset and verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Service URLs
STORAGE_SERVICE_URL=http://localhost:3002
DATABASE_SERVICE_URL=http://localhost:3003
```

**Important:** 
- Change `JWT_SECRET` and `JWT_REFRESH_SECRET` to strong, random strings (at least 32 characters)
- For Gmail, you'll need to generate an "App Password" in your Google Account settings
- Update email configuration with your actual SMTP settings

### 3. Start Dependencies (Using Docker Compose)

**Important:** Infrastructure services (MongoDB, Redis, Kafka) are centralized. 

Start the shared infrastructure from the root directory:

```bash
# From the root SD/ directory
cd ..
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Redis on port 6379
- Zookeeper and Kafka on port 9092

All services (Auth, Database, Storage) share these infrastructure instances.

### 4. Start the Auth Service

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The service will start on `http://localhost:3001`

### 5. Verify Installation

Check the health endpoint:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Testing the API

### Register a New User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `accessToken` from the response for protected endpoints.

### Get Current User (Protected)

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `docker ps` or check MongoDB service
- Verify `MONGODB_URI` in `.env` is correct

### Redis Connection Error
- The service will continue without Redis, but token blacklisting won't work
- Ensure Redis is running: `docker ps` or `redis-cli ping`

### Kafka Connection Error
- The service will continue without Kafka, but events won't be published
- Ensure Kafka and Zookeeper are running: `docker ps`

### Email Not Sending
- Check your email configuration in `.env`
- For Gmail, ensure you're using an App Password, not your regular password
- The service will continue even if email fails, but verification codes won't be sent

## Project Structure

```
Auth/
├── src/
│   ├── config/          # Configuration files (DB, Redis, Kafka, Email)
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions (JWT)
│   └── server.js        # Main server file
├── docker-compose.yml   # Docker setup for dependencies
├── package.json
└── README.md
```

## Next Steps

1. Review the API documentation in `API_DOCUMENTATION.md`
2. Integrate with your storage and database services
3. Set up proper logging and monitoring
4. Configure production environment variables
5. Set up CI/CD pipeline

