# Database Service

Database microservice for Backend-as-a-Service platform. Allows users to create clusters (collections) and perform CRUD operations through exposed APIs.

## Features

- Create and manage database clusters/collections
- Dynamic CRUD API endpoints for each cluster
- Data isolation per user
- Schema validation (optional)
- Indexing support
- Redis caching for improved performance
- Kafka for inter-service communication
- Integration with Auth service

## API Endpoints

### Cluster Management
- `POST /api/db/clusters` - Create a new cluster
- `GET /api/db/clusters` - List all user's clusters
- `GET /api/db/clusters/:clusterId` - Get cluster details
- `DELETE /api/db/clusters/:clusterId` - Delete a cluster
- `PUT /api/db/clusters/:clusterId` - Update cluster settings

### CRUD Operations (Dynamic)
- `POST /api/db/clusters/:clusterId/data` - Create document
- `GET /api/db/clusters/:clusterId/data` - List documents (with filtering, pagination)
- `GET /api/db/clusters/:clusterId/data/:documentId` - Get document by ID
- `PUT /api/db/clusters/:clusterId/data/:documentId` - Update document
- `PATCH /api/db/clusters/:clusterId/data/:documentId` - Partial update document
- `DELETE /api/db/clusters/:clusterId/data/:documentId` - Delete document
- `DELETE /api/db/clusters/:clusterId/data` - Delete multiple documents (with filter)

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

