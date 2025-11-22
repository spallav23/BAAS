# Database Service API Documentation

Base URL: `http://localhost:3003/api/db`

All endpoints require authentication except where noted. Include `Authorization: Bearer <token>` header.

## Cluster Management Endpoints

### 1. Create Cluster
**POST** `/clusters`

Create a new database cluster/collection.

**Request Body:**
```json
{
  "name": "Users Collection",
  "description": "Store user profiles",
  "schema": {
    "fields": [
      {
        "name": "name",
        "type": "String",
        "required": true
      },
      {
        "name": "age",
        "type": "Number",
        "required": false
      },
      {
        "name": "email",
        "type": "String",
        "required": true,
        "unique": true
      }
    ],
    "strict": false
  },
  "indexes": [
    {
      "field": "email",
      "order": 1,
      "unique": true
    }
  ],
  "readAccess": "private",
  "writeAccess": "private"
}
```

**Response (201):**
```json
{
  "message": "Cluster created successfully",
  "cluster": {
    "id": "cluster_id",
    "name": "Users Collection",
    "slug": "users-collection",
    "description": "Store user profiles",
    "collectionName": "cluster_userId_users-collection",
    "readAccess": "private",
    "writeAccess": "private",
    "apiEndpoint": "/api/db/clusters/cluster_id/data",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Access Levels:**
- `public`: Anyone can access (no auth required)
- `authenticated`: Authenticated users can access
- `private`: Only owner can access

---

### 2. List Clusters
**GET** `/clusters`

Get all clusters for the authenticated user.

**Response (200):**
```json
{
  "clusters": [
    {
      "id": "cluster_id",
      "name": "Users Collection",
      "slug": "users-collection",
      "description": "Store user profiles",
      "documentCount": 10,
      "readAccess": "private",
      "writeAccess": "private",
      "apiEndpoint": "/api/db/clusters/cluster_id/data",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 3. Get Cluster Details
**GET** `/clusters/:clusterId`

Get detailed information about a specific cluster.

**Response (200):**
```json
{
  "cluster": {
    "id": "cluster_id",
    "name": "Users Collection",
    "slug": "users-collection",
    "description": "Store user profiles",
    "collectionName": "cluster_userId_users-collection",
    "schema": {
      "fields": [...],
      "strict": false
    },
    "indexes": [...],
    "documentCount": 10,
    "readAccess": "private",
    "writeAccess": "private",
    "apiEndpoint": "/api/db/clusters/cluster_id/data",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. Update Cluster
**PUT** `/clusters/:clusterId`

Update cluster settings.

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "readAccess": "authenticated",
  "writeAccess": "private",
  "apiEnabled": true
}
```

**Response (200):**
```json
{
  "message": "Cluster updated successfully",
  "cluster": {
    "id": "cluster_id",
    "name": "Updated Name",
    "slug": "users-collection",
    "description": "Updated description",
    "readAccess": "authenticated",
    "writeAccess": "private",
    "apiEnabled": true,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5. Delete Cluster
**DELETE** `/clusters/:clusterId`

Delete a cluster and all its documents.

**Response (200):**
```json
{
  "message": "Cluster deleted successfully"
}
```

---

## Data CRUD Endpoints

### 6. Create Document
**POST** `/clusters/:clusterId/data`

Create a new document in the cluster.

**Request Body:**
```json
{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "active": true
}
```

**Response (201):**
```json
{
  "message": "Document created successfully",
  "document": {
    "_id": "document_id",
    "name": "John Doe",
    "age": 30,
    "email": "john@example.com",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 7. List Documents
**GET** `/clusters/:clusterId/data`

List all documents with filtering, pagination, and sorting.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sort` - Sort fields (e.g., `-createdAt,name` for descending createdAt, ascending name)
- `select` - Fields to select (e.g., `name,email`)
- `filter` - JSON string for filtering (e.g., `{"age":{"$gt":25}}`)
- `search` - Text search query
- Any field name for direct filtering (e.g., `?age=30`)

**Example Request:**
```
GET /api/db/clusters/cluster_id/data?page=1&limit=10&sort=-createdAt&age=30
```

**Response (200):**
```json
{
  "documents": [
    {
      "_id": "document_id",
      "name": "John Doe",
      "age": 30,
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

**Filter Examples:**
- `?filter={"age":{"$gt":25}}` - Age greater than 25
- `?filter={"name":{"$regex":"John","$options":"i"}}` - Name contains "John" (case insensitive)
- `?filter={"active":true}` - Active is true

---

### 8. Get Document by ID
**GET** `/clusters/:clusterId/data/:documentId`

Get a specific document by ID.

**Response (200):**
```json
{
  "document": {
    "_id": "document_id",
    "name": "John Doe",
    "age": 30,
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 9. Update Document (Full Update)
**PUT** `/clusters/:clusterId/data/:documentId`

Replace the entire document.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "age": 25,
  "email": "jane@example.com",
  "active": false
}
```

**Response (200):**
```json
{
  "message": "Document updated successfully",
  "document": {
    "_id": "document_id",
    "name": "Jane Doe",
    "age": 25,
    "email": "jane@example.com",
    "active": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z"
  }
}
```

---

### 10. Partial Update Document
**PATCH** `/clusters/:clusterId/data/:documentId`

Update only specified fields.

**Request Body:**
```json
{
  "age": 31,
  "active": true
}
```

**Response (200):**
```json
{
  "message": "Document updated successfully",
  "document": {
    "_id": "document_id",
    "name": "John Doe",
    "age": 31,
    "email": "john@example.com",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z"
  }
}
```

---

### 11. Delete Document
**DELETE** `/clusters/:clusterId/data/:documentId`

Delete a specific document.

**Response (200):**
```json
{
  "message": "Document deleted successfully"
}
```

---

### 12. Delete Multiple Documents
**DELETE** `/clusters/:clusterId/data`

Delete multiple documents based on filter.

**Query Parameters:**
- Same as List Documents (filter, search, etc.)

**Example Request:**
```
DELETE /api/db/clusters/cluster_id/data?filter={"active":false}
```

**Response (200):**
```json
{
  "message": "Documents deleted successfully",
  "deletedCount": 5
}
```

---

## Error Responses

**400 Bad Request:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "error": "No token provided, authorization denied"
}
```

**403 Forbidden:**
```json
{
  "error": "Access denied to this cluster"
}
```

**404 Not Found:**
```json
{
  "error": "Cluster not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Server error during cluster creation"
}
```

---

## Notes

- All endpoints require authentication token in the `Authorization` header (except for public clusters)
- Clusters are isolated per user
- Documents automatically include `createdAt` and `updatedAt` timestamps
- Schema validation is optional and can be enabled per cluster
- Indexes can be defined when creating a cluster for better query performance
- Filter queries support MongoDB query operators (`$gt`, `$lt`, `$regex`, etc.)

