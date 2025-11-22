# Auth Service API Documentation

Base URL: `http://localhost:3001/api/auth`

## Authentication Endpoints

### 1. Register User
**POST** `/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully. Please verify your email.",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  }
}
```

---

### 2. Login
**POST** `/login`

Authenticate user and receive access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true
  }
}
```

---

### 3. Logout
**POST** `/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

### 4. Refresh Access Token
**POST** `/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "accessToken": "new_jwt_access_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true
  }
}
```

---

### 5. Get Current User
**GET** `/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## User Management Endpoints

### 6. Update User
**PUT** `/user/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

**Note:** If email is changed, user will need to verify the new email.

**Response (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "user_id",
    "email": "newemail@example.com",
    "name": "Updated Name",
    "emailVerified": false
  }
}
```

---

### 7. Delete User
**DELETE** `/user/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

## Password Management Endpoints

### 8. Forgot Password
**POST** `/forgot-password`

Request a password reset code via email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset code has been sent to your email"
}
```

---

### 9. Verify Reset Code
**POST** `/verify-code`

Verify the password reset code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "message": "Code verified successfully"
}
```

---

### 10. Reset Password
**POST** `/reset-password`

Reset password using verified code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

---

## Email Verification Endpoints

### 11. Send Verification Email
**POST** `/send-verification`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Verification code has been sent to your email"
}
```

---

### 12. Verify Email
**POST** `/verify-email`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid credentials"
}
```

**404 Not Found:**
```json
{
  "error": "User not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Server error during registration"
}
```

---

## Notes

- All verification codes expire in 10 minutes
- Access tokens expire in 24 hours (configurable)
- Refresh tokens expire in 7 days (configurable)
- Passwords must be at least 6 characters long
- Email verification codes are 6-digit numbers
- All protected routes require the `Authorization: Bearer <token>` header

