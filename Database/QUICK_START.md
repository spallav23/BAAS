# Quick Start Guide - Database Service

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
cd Database
npm install
```

### 2. Environment Configuration

Create a `.env` file in the Database directory:

```bash
# Server Configuration
PORT=3003
NODE_ENV=development

# MongoDB Configuration (for service metadata)
MONGODB_URI=mongodb://localhost:27017/database-service

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=database-service
KAFKA_GROUP_ID=database-service-group

# Auth Service URL (for token verification)
AUTH_SERVICE_URL=http://localhost:3001

# Service URLs
STORAGE_SERVICE_URL=http://localhost:3002
```

**Important:** 
- The MongoDB URI is for storing cluster metadata. User data is stored in dynamically created collections.
- Make sure the Auth Service is running and accessible at `AUTH_SERVICE_URL`.

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

### 4. Start the Database Service

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The service will start on `http://localhost:3003`

### 5. Verify Installation

Check the health endpoint:
```bash
curl http://localhost:3003/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "database-service",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Testing the API

### Prerequisites
1. Make sure Auth Service is running
2. Register and login to get an access token

### Create a Cluster

```bash
curl -X POST http://localhost:3003/api/db/clusters \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Products",
    "description": "Product catalog",
    "readAccess": "private",
    "writeAccess": "private"
  }'
```

Save the `clusterId` from the response.

### Create a Document

```bash
curl -X POST http://localhost:3003/api/db/clusters/CLUSTER_ID/data \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "price": 999.99,
    "category": "Electronics",
    "inStock": true
  }'
```

### List Documents

```bash
curl -X GET "http://localhost:3003/api/db/clusters/CLUSTER_ID/data?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Document by ID

```bash
curl -X GET http://localhost:3003/api/db/clusters/CLUSTER_ID/data/DOCUMENT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Document

```bash
curl -X PUT http://localhost:3003/api/db/clusters/CLUSTER_ID/data/DOCUMENT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Laptop",
    "price": 899.99,
    "category": "Electronics",
    "inStock": false
  }'
```

### Delete Document

```bash
curl -X DELETE http://localhost:3003/api/db/clusters/CLUSTER_ID/data/DOCUMENT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Advanced Features

### Creating a Cluster with Schema

```bash
curl -X POST http://localhost:3003/api/db/clusters \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Users",
    "description": "User profiles",
    "schema": {
      "fields": [
        {
          "name": "name",
          "type": "String",
          "required": true
        },
        {
          "name": "email",
          "type": "String",
          "required": true
        },
        {
          "name": "age",
          "type": "Number",
          "required": false
        }
      ],
      "strict": true
    },
    "indexes": [
      {
        "field": "email",
        "order": 1,
        "unique": true
      }
    ]
  }'
```

### Filtering Documents

```bash
# Filter by field
curl -X GET "http://localhost:3003/api/db/clusters/CLUSTER_ID/data?inStock=true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Advanced filter with MongoDB operators
curl -X GET "http://localhost:3003/api/db/clusters/CLUSTER_ID/data?filter={\"price\":{\"$gt\":100}}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Sorting Documents

```bash
# Sort by price descending, then name ascending
curl -X GET "http://localhost:3003/api/db/clusters/CLUSTER_ID/data?sort=-price,name" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Verify `MONGODB_URI` in `.env` is correct
- Check if the database has write permissions

### Auth Service Connection Error
- Ensure Auth Service is running on the configured port
- Verify `AUTH_SERVICE_URL` in `.env` is correct
- Check network connectivity between services

### Redis Connection Error
- The service will continue without Redis, but caching won't work
- Ensure Redis is running and accessible

### Kafka Connection Error
- The service will continue without Kafka, but events won't be published
- Ensure Kafka and Zookeeper are running

## Project Structure

```
Database/
├── src/
│   ├── config/          # Configuration files (DB, Redis, Kafka, Auth)
│   ├── controllers/     # Request handlers (clusters, data)
│   ├── middleware/      # Auth, validation, cluster access, error handling
│   ├── models/          # MongoDB models (Cluster)
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions (dynamic models)
│   └── server.js        # Main server file
├── docker-compose.yml   # Docker setup for dependencies
├── package.json
└── README.md
```

## Integration with Auth Service

The Database Service verifies tokens by calling the Auth Service's `/api/auth/me` endpoint. Make sure:

1. Auth Service is running and accessible
2. `AUTH_SERVICE_URL` is correctly configured
3. Both services can communicate over the network

## Next Steps

1. Review the API documentation in `API_DOCUMENTATION.md`
2. Create clusters with appropriate schemas for your use cases
3. Set up proper indexing for better query performance
4. Configure access levels (public, authenticated, private) based on your needs
5. Integrate with your frontend or other services

