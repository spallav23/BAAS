# Storage Service

Storage microservice for Backend-as-a-Service platform. Allows users to create buckets and upload/manage files.

## Features

- Create and manage storage buckets
- File upload and download
- File type and size restrictions per bucket
- Access control (public, authenticated, private)
- File metadata management
- Redis caching for improved performance
- Kafka for inter-service communication
- Integration with Auth service

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

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Make sure MongoDB, Redis, and Kafka are running

4. Start the service:
```bash
npm run dev
```

## Environment Variables

See `.env.example` for all required environment variables.

