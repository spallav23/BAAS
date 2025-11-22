# Auth Service

Authentication microservice for Backend-as-a-Service platform.

## Features

- User registration and management
- JWT-based authentication
- Password reset with email verification
- Email verification
- Token refresh mechanism
- Redis for token blacklisting
- Kafka for inter-service communication
- MongoDB for data persistence

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

### User Management
- `PUT /api/auth/user/:id` - Update user
- `DELETE /api/auth/user/:id` - Delete user

### Password Management
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-code` - Verify reset code
- `POST /api/auth/reset-password` - Reset password with code

### Email Verification
- `POST /api/auth/send-verification` - Send verification email
- `POST /api/auth/verify-email` - Verify email with code

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

