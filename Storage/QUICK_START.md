# Quick Start Guide - Storage Service

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (separate instance for the service metadata)
- Redis
- Kafka (with Zookeeper)
- Auth Service running (for authentication)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd Storage
npm install
```

### 2. Environment Configuration

Create a `.env` file in the Storage directory:

```bash
# Server Configuration
PORT=3002
NODE_ENV=development

# MongoDB Configuration (for service metadata)
MONGODB_URI=mongodb://localhost:27017/storage-service

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=storage-service
KAFKA_GROUP_ID=storage-service-group

# Auth Service URL (for token verification)
AUTH_SERVICE_URL=http://localhost:3001

# Storage Configuration
UPLOADS_DIR=./uploads
```

**Important:** 
- The MongoDB URI is for storing bucket metadata. Actual files are stored in the filesystem.
- Make sure the Auth Service is running and accessible at `AUTH_SERVICE_URL`.
- The `UPLOADS_DIR` is where uploaded files will be stored.

### 3. Start Dependencies (Centralized Infrastructure)

**Important:** Infrastructure services (MongoDB, Redis, Kafka) are centralized and shared by all services.

Start the shared infrastructure from the root directory:

```bash
# From the root SD/ directory
cd ..
docker-compose up -d
```

This will start:
- MongoDB on port 27017 (shared)
- Redis on port 6379 (shared)
- Zookeeper and Kafka on port 9092 (shared)

All services (Auth, Database, Storage) connect to these same infrastructure instances. Each service uses its own database within MongoDB but shares the same MongoDB instance.

### 4. Start the Storage Service

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The service will start on `http://localhost:3002`

### 5. Verify Installation

Check the health endpoint:
```bash
curl http://localhost:3002/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "storage-service",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## API Endpoints

### Bucket Management
- `POST /api/storage/buckets` - Create a new bucket
- `GET /api/storage/buckets` - List all user's buckets
- `GET /api/storage/buckets/:bucketId` - Get bucket details
- `PUT /api/storage/buckets/:bucketId` - Update bucket settings
- `DELETE /api/storage/buckets/:bucketId` - Delete a bucket

### File Operations
- `POST /api/storage/buckets/:bucketId/files` - Upload a file
- `GET /api/storage/buckets/:bucketId/files` - List files in bucket
- `GET /api/storage/buckets/:bucketId/files/:fileId` - Get file details
- `GET /api/storage/buckets/:bucketId/files/:fileName/download` - Download file
- `DELETE /api/storage/buckets/:bucketId/files/:fileId` - Delete file

## Notes

- Files are stored in the filesystem at the path specified by `UPLOADS_DIR`
- Each bucket has its own directory: `{UPLOADS_DIR}/{bucket.storagePath}/`
- File metadata is stored in MongoDB
- Buckets support file type restrictions and size limits
- Access control: public, authenticated, or private

