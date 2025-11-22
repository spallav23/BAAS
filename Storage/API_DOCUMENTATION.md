# Storage Service API Documentation

Base URL: `http://localhost:3002/api/storage`

All endpoints require authentication except where noted. Include `Authorization: Bearer <token>` header.

## Bucket Management Endpoints

### 1. Create Bucket
**POST** `/buckets`

Create a new storage bucket.

**Request Body:**
```json
{
  "name": "My Files",
  "description": "Store user uploads",
  "allowedFileTypes": ["jpg", "png", "pdf"],
  "maxFileSize": 10485760,
  "readAccess": "private",
  "writeAccess": "private"
}
```

**Response (201):**
```json
{
  "message": "Bucket created successfully",
  "bucket": {
    "id": "bucket_id",
    "name": "My Files",
    "slug": "my-files",
    "description": "Store user uploads",
    "storagePath": "bucket_userId_my-files",
    "readAccess": "private",
    "writeAccess": "private",
    "fileCount": 0,
    "totalSize": 0,
    "apiEndpoint": "/api/storage/buckets/bucket_id/files",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Access Levels:**
- `public`: Anyone can access (no auth required)
- `authenticated`: Authenticated users can access
- `private`: Only owner can access

---

### 2. List Buckets
**GET** `/buckets`

Get all buckets for the authenticated user.

**Response (200):**
```json
{
  "buckets": [
    {
      "id": "bucket_id",
      "name": "My Files",
      "slug": "my-files",
      "description": "Store user uploads",
      "fileCount": 10,
      "totalSize": 5242880,
      "readAccess": "private",
      "writeAccess": "private",
      "apiEndpoint": "/api/storage/buckets/bucket_id/files",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 3. Get Bucket Details
**GET** `/buckets/:bucketId`

Get detailed information about a specific bucket.

**Response (200):**
```json
{
  "bucket": {
    "id": "bucket_id",
    "name": "My Files",
    "slug": "my-files",
    "description": "Store user uploads",
    "storagePath": "bucket_userId_my-files",
    "allowedFileTypes": ["jpg", "png", "pdf"],
    "maxFileSize": 10485760,
    "fileCount": 10,
    "totalSize": 5242880,
    "readAccess": "private",
    "writeAccess": "private",
    "apiEnabled": true,
    "apiEndpoint": "/api/storage/buckets/bucket_id/files",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. Update Bucket
**PUT** `/buckets/:bucketId`

Update bucket settings.

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "readAccess": "authenticated",
  "writeAccess": "private",
  "maxFileSize": 20971520,
  "allowedFileTypes": ["jpg", "png", "pdf", "docx"]
}
```

**Response (200):**
```json
{
  "message": "Bucket updated successfully",
  "bucket": {
    "id": "bucket_id",
    "name": "Updated Name",
    "slug": "my-files",
    "description": "Updated description",
    "readAccess": "authenticated",
    "writeAccess": "private",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5. Delete Bucket
**DELETE** `/buckets/:bucketId`

Delete a bucket and all its files.

**Response (200):**
```json
{
  "message": "Bucket deleted successfully"
}
```

---

## File Operations Endpoints

### 6. Upload File
**POST** `/buckets/:bucketId/files`

Upload a file to the bucket.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (required) - The file to upload
- `metadata` (optional) - JSON string with additional metadata

**Response (201):**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": "file_id",
    "originalName": "document.pdf",
    "fileName": "uuid-generated-name.pdf",
    "mimeType": "application/pdf",
    "size": 524288,
    "publicUrl": "/api/storage/buckets/bucket_id/files/uuid-generated-name.pdf/download",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 7. List Files
**GET** `/buckets/:bucketId/files`

List all files in the bucket with pagination.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search by filename

**Response (200):**
```json
{
  "files": [
    {
      "id": "file_id",
      "originalName": "document.pdf",
      "fileName": "uuid-generated-name.pdf",
      "mimeType": "application/pdf",
      "size": 524288,
      "metadata": {},
      "isPublic": false,
      "publicUrl": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

### 8. Get File Details
**GET** `/buckets/:bucketId/files/:fileId`

Get detailed information about a specific file.

**Response (200):**
```json
{
  "file": {
    "id": "file_id",
    "bucketId": "bucket_id",
    "userId": "user_id",
    "originalName": "document.pdf",
    "fileName": "uuid-generated-name.pdf",
    "filePath": "./uploads/bucket_userId_my-files/uuid-generated-name.pdf",
    "mimeType": "application/pdf",
    "size": 524288,
    "metadata": {},
    "isPublic": false,
    "publicUrl": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 9. Download File
**GET** `/buckets/:bucketId/files/:fileName/download`

Download a file from the bucket.

**Response (200):**
- Content-Type: File's MIME type
- Content-Disposition: attachment; filename="original-name"
- Body: File binary data

---

### 10. Delete File
**DELETE** `/buckets/:bucketId/files/:fileId`

Delete a specific file.

**Response (200):**
```json
{
  "message": "File deleted successfully"
}
```

---

## Error Responses

**400 Bad Request:**
```json
{
  "error": "File size exceeds maximum allowed size of 10 MB"
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
  "error": "Access denied to this bucket"
}
```

**404 Not Found:**
```json
{
  "error": "Bucket not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Server error during file upload"
}
```

---

## Notes

- All endpoints require authentication token in the `Authorization` header (except for public buckets)
- Buckets are isolated per user
- Files are stored in the filesystem at `{UPLOADS_DIR}/{bucket.storagePath}/`
- File metadata is stored in MongoDB
- File type restrictions and size limits are enforced per bucket
- Maximum file size default is 10MB (configurable per bucket)
- Allowed file types are optional - if empty, all types are allowed

