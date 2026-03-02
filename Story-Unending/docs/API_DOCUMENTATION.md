# Story-Unending REST API Documentation

## Overview

The Story-Unending REST API provides programmatic access to all platform features including user management, content management, analytics, notifications, and more.

**Base URL**: `/api/v1`

**Authentication**: Bearer Token (JWT)

**Content-Type**: `application/json`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Content](#content)
4. [Analytics](#analytics)
5. [Notifications](#notifications)
6. [Bookmarks](#bookmarks)
7. [Search](#search)
8. [Rate Limiting](#rate-limiting)
9. [Error Handling](#error-handling)

---

## Authentication

### Login

Authenticate a user and receive access tokens.

**Endpoint**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "user|admin"
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### Logout

Invalidate the current session.

**Endpoint**: `POST /api/v1/auth/logout`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Refresh Token

Refresh an expired access token using a refresh token.

**Endpoint**: `POST /api/v1/auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "string"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Verify Token

Verify if a token is valid and get user information.

**Endpoint**: `GET /api/v1/auth/verify`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "valid": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "user|admin"
  }
}
```

---

## Users

### Get Users List

Retrieve a list of users with optional filtering.

**Endpoint**: `GET /api/v1/users`

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20)
- `search` (string, optional): Search term
- `role` (string, optional): Filter by role

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "user|admin",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### Get User

Retrieve a specific user by ID.

**Endpoint**: `GET /api/v1/users/:id`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "user|admin",
    "profile": {
      "avatar": "string",
      "bio": "string",
      "location": "string"
    },
    "preferences": {
      "theme": "light|dark",
      "language": "en",
      "notifications": true
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLogin": "2024-01-01T00:00:00Z"
  }
}
```

---

### Create User

Create a new user account.

**Endpoint**: `POST /api/v1/users`

**Request Body**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "user"
}
```

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Update User

Update user information.

**Endpoint**: `PUT /api/v1/users/:id`

**Request Body**:
```json
{
  "email": "string",
  "profile": {
    "avatar": "string",
    "bio": "string",
    "location": "string"
  },
  "preferences": {
    "theme": "light|dark",
    "language": "en",
    "notifications": true
  }
}
```

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "user",
    "profile": {
      "avatar": "string",
      "bio": "string",
      "location": "string"
    },
    "preferences": {
      "theme": "light|dark",
      "language": "en",
      "notifications": true
    },
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Delete User

Delete a user account.

**Endpoint**: `DELETE /api/v1/users/:id`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Content

### Get Content List

Retrieve a list of content items with optional filtering.

**Endpoint**: `GET /api/v1/content`

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20)
- `type` (string, optional): Filter by type
- `status` (string, optional): Filter by status (draft, published, archived)
- `search` (string, optional): Search term

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "type": "chapter|story|article",
      "title": "string",
      "content": "string",
      "status": "draft|published|archived",
      "author": {
        "id": "string",
        "username": "string"
      },
      "version": 1,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### Get Content

Retrieve a specific content item by ID.

**Endpoint**: `GET /api/v1/content/:id`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "type": "chapter|story|article",
    "title": "string",
    "content": "string",
    "status": "draft|published|archived",
    "author": {
      "id": "string",
      "username": "string"
    },
    "version": 1,
    "metadata": {
      "wordCount": 1000,
      "readingTime": 5
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Create Content

Create a new content item.

**Endpoint**: `POST /api/v1/content`

**Request Body**:
```json
{
  "type": "chapter|story|article",
  "title": "string",
  "content": "string",
  "status": "draft|published",
  "metadata": {
    "tags": ["string"],
    "category": "string"
  }
}
```

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "type": "chapter|story|article",
    "title": "string",
    "content": "string",
    "status": "draft|published",
    "author": {
      "id": "string",
      "username": "string"
    },
    "version": 1,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Update Content

Update an existing content item.

**Endpoint**: `PUT /api/v1/content/:id`

**Request Body**:
```json
{
  "title": "string",
  "content": "string",
  "status": "draft|published|archived",
  "metadata": {
    "tags": ["string"],
    "category": "string"
  }
}
```

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "type": "chapter|story|article",
    "title": "string",
    "content": "string",
    "status": "draft|published|archived",
    "version": 2,
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Delete Content

Delete a content item.

**Endpoint**: `DELETE /api/v1/content/:id`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Content deleted successfully"
}
```

---

## Analytics

### Get Sessions

Retrieve session analytics data.

**Endpoint**: `GET /api/v1/analytics/sessions`

**Query Parameters**:
- `startDate` (string, optional): Start date (ISO 8601)
- `endDate` (string, optional): End date (ISO 8601)
- `limit` (integer, optional): Limit results

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "sessionId": "string",
      "userId": "string",
      "startTime": "2024-01-01T00:00:00Z",
      "endTime": "2024-01-01T01:00:00Z",
      "duration": 3600,
      "pagesViewed": 10,
      "chaptersRead": 5
    }
  ],
  "summary": {
    "totalSessions": 100,
    "averageDuration": 1800,
    "totalChaptersRead": 500
  }
}
```

---

### Get Chapters Analytics

Retrieve chapter reading analytics.

**Endpoint**: `GET /api/v1/analytics/chapters`

**Query Parameters**:
- `startDate` (string, optional): Start date (ISO 8601)
- `endDate` (string, optional): End date (ISO 8601)
- `limit` (integer, optional): Limit results

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "chapterId": "string",
      "chapterNumber": 1,
      "title": "string",
      "views": 100,
      "uniqueReaders": 80,
      "averageReadingTime": 300,
      "completionRate": 0.75
    }
  ],
  "summary": {
    "totalViews": 1000,
    "totalUniqueReaders": 800,
    "averageCompletionRate": 0.70
  }
}
```

---

### Get Actions Analytics

Retrieve user action analytics.

**Endpoint**: `GET /api/v1/analytics/actions`

**Query Parameters**:
- `startDate` (string, optional): Start date (ISO 8601)
- `endDate` (string, optional): End date (ISO 8601)
- `type` (string, optional): Filter by action type

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "actionType": "save|bookmark|search|share",
      "count": 100,
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ],
  "summary": {
    "totalActions": 500,
    "mostCommonAction": "save"
  }
}
```

---

### Get Daily Stats

Retrieve daily statistics.

**Endpoint**: `GET /api/v1/analytics/daily`

**Query Parameters**:
- `startDate` (string, optional): Start date (ISO 8601)
- `endDate` (string, optional): End date (ISO 8601)
- `days` (integer, optional): Number of days (default: 30)

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "sessions": 10,
      "views": 100,
      "chaptersRead": 50,
      "actions": 20
    }
  ],
  "summary": {
    "totalSessions": 300,
    "totalViews": 3000,
    "totalChaptersRead": 1500,
    "totalActions": 600
  }
}
```

---

### Export Analytics

Export analytics data in various formats.

**Endpoint**: `GET /api/v1/analytics/export`

**Query Parameters**:
- `format` (string, optional): Export format (json, csv) - default: json
- `type` (string, optional): Data type (sessions, chapters, actions, daily)
- `startDate` (string, optional): Start date (ISO 8601)
- `endDate` (string, optional): End date (ISO 8601)

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "format": "json",
    "type": "sessions",
    "exportedAt": "2024-01-01T00:00:00Z",
    "records": [...]
  }
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse and ensure fair usage.

### Rate Limits

| Endpoint Type | Requests | Window |
|---------------|----------|--------|
| Authentication | 5 | 1 minute |
| Write Operations | 20 | 1 minute |
| Read Operations | 200 | 1 minute |
| Default | 100 | 1 minute |

### Rate Limit Headers

All API responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Error

When rate limit is exceeded:

**Response** (429 Too Many Requests):
```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## Error Handling

### Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_CREDENTIALS` | Invalid username or password |
| `TOKEN_EXPIRED` | Access token has expired |
| `TOKEN_INVALID` | Invalid access token |
| `USER_NOT_FOUND` | User not found |
| `USER_EXISTS` | User already exists |
| `CONTENT_NOT_FOUND` | Content not found |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `VALIDATION_ERROR` | Request validation failed |
| `PERMISSION_DENIED` | Insufficient permissions |

---

## SDK Usage

### JavaScript SDK

The API module provides a convenient JavaScript SDK:

```javascript
// Initialize
API.initialize();

// Login
const response = await API.login('username', 'password');
console.log(response.token);

// Get users
const users = await API.getUsers({ page: 1, limit: 20 });

// Create content
const content = await API.createContent({
  type: 'chapter',
  title: 'Chapter 1',
  content: 'Once upon a time...',
  status: 'draft'
});

// Get analytics
const sessions = await API.getAnalyticsSessions({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

// Logout
await API.logout();
```

### Error Handling

```javascript
try {
  const user = await API.getUser('user-id');
  console.log(user);
} catch (error) {
  if (error instanceof API.APIError) {
    console.error(`API Error: ${error.message}`);
    console.error(`Status: ${error.status}`);
    console.error(`Data:`, error.data);
  } else {
    console.error('Network error:', error);
  }
}
```

---

## Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** (use httpOnly cookies in production)
3. **Handle rate limits** gracefully with exponential backoff
4. **Validate input** before sending to API
5. **Use pagination** for large datasets
6. **Cache responses** when appropriate
7. **Implement retry logic** for transient failures
8. **Log errors** for debugging
9. **Use appropriate HTTP methods** (GET for read, POST for create, etc.)
10. **Keep tokens fresh** by refreshing before expiration

---

## Support

For API support and questions:
- Documentation: [API Documentation](./API_DOCUMENTATION.md)
- Issues: [GitHub Issues](https://github.com/XxNightLordxX/Story-Unending/issues)
- Email: support@story-unending.com

---

**Version**: 1.0.0  
**Last Updated**: 2025-02-27  
**Status**: ✅ Production Ready