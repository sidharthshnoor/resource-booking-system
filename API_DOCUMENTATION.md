# Resource Booking System — API Documentation

Complete endpoint reference for the Resource Booking System REST API. All endpoints are documented based on the actual backend implementation.

---

## Base URL

| Environment | Base URL |
|-------------|----------|
| Local development | `http://localhost:5000/api` |
| Production | Determined at deploy time from the Render backend service URL |

The frontend resolves the API base URL from the `VITE_API_URL` build-time environment variable (falls back to `http://localhost:5000/api` in dev, `/api` in production).

---

## Authentication

Protected endpoints require a JWT bearer token obtained from `POST /api/auth/login`.

```
Authorization: Bearer <JWT_TOKEN>
```

The JWT payload contains:
```json
{
  "sub": "<user_id>",
  "role": "USER | ADMIN | SUPER_ADMIN",
  "organization_id": "<org_id>",
  "iat": 1234567890,
  "exp": 1234571490
}
```

Tokens expire after **1 hour**. There is no refresh token mechanism.

---

## API Conventions

- All request and response bodies use **JSON** (`Content-Type: application/json`).
- All responses include a `"success": true | false` boolean field.
- All error responses include a `"message"` string with a human-readable description.
- IDs are `BIGINT` (PostgreSQL) and represented as numbers in JSON.
- Timestamps are ISO 8601 strings with timezone (`TIMESTAMPTZ`).
- The `organization_id` for scoped queries is **always derived from the JWT** — it is never accepted from the client request body or query string for security operations.

### Standard HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `204` | No content |
| `400` | Validation error / bad request |
| `401` | Missing or invalid/expired token |
| `403` | Forbidden — wrong role, deactivated account, deactivated org, or password change required |
| `404` | Not found |
| `409` | Conflict — duplicate, booking overlap, or illegal state transition |
| `500` | Internal server error |

---

## Route Groups

| Prefix | Description |
|--------|-------------|
| `/api/health` | Health check |
| `/api/auth` | Authentication, registration, password management |
| `/api/organizations` | Public organization lookup |
| `/api/resources` | Resource browsing and management |
| `/api/bookings` | User booking operations |
| `/api/admin/bookings` | Admin booking management |
| `/api/admin/users` | Admin user management |
| `/api/super-admin` | Super Admin platform management |

---

## Health

### GET /api/health

Check that the API is running.

**Authentication:** None (public)

**Response `200`:**
```json
{
  "success": true,
  "message": "Resource Booking API is running"
}
```

---

## Authentication

### POST /api/auth/register/:slug

Register a new USER account in the organization identified by `:slug`.

**Authentication:** None (public)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Organization URL slug |

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✅ | Non-empty |
| `email` | string | ✅ | Valid email format |
| `password` | string | ✅ | Min 8 characters |

**Response `201`:**
```json
{
  "success": true,
  "user": {
    "id": 42,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "USER",
    "status": "ACTIVE",
    "organization_id": 3,
    "created_at": "2026-01-01T10:00:00.000Z",
    "updated_at": "2026-01-01T10:00:00.000Z"
  }
}
```

**Errors:**
- `400` — Missing fields; password < 8 characters; invalid email format
- `403` — Organization is inactive
- `404` — Organization not found
- `409` — Email already registered

---

### POST /api/auth/login

Authenticate a user (any role) and receive a JWT.

**Authentication:** None (public)

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword",
  "organizationSlug": "acme"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | ✅ | |
| `password` | string | ✅ | |
| `organizationSlug` | string | ❌ | If provided, login is rejected if the user does not belong to this org |

**Response `200`:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 42,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "USER",
    "status": "ACTIVE",
    "organization_id": 3,
    "must_change_password": false,
    "last_login": "2026-01-01T09:00:00.000Z",
    "created_at": "2026-01-01T10:00:00.000Z",
    "updated_at": "2026-01-01T10:00:00.000Z"
  },
  "organizationSlug": "acme"
}
```

**Errors:**
- `400` — Missing email or password
- `401` — Invalid credentials; org slug mismatch
- `403` — User deactivated; organization deactivated

---

### GET /api/auth/me

Return the currently authenticated user's profile.

**Authentication:** Required (`requireAuth`, `requireTenant`)

**Response `200`:**
```json
{
  "success": true,
  "user": {
    "id": 42,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "USER",
    "status": "ACTIVE",
    "organization_id": 3,
    "must_change_password": false,
    "created_at": "2026-01-01T10:00:00.000Z",
    "updated_at": "2026-01-01T10:00:00.000Z"
  }
}
```

**Errors:**
- `401` — No token or invalid token
- `403` — User deactivated; organization deactivated

---

### POST /api/auth/change-password

Change the authenticated user's password.

**Authentication:** Required (`requireAuth`, `requireTenant`)

> Available to `USER`, `ADMIN`, and `SUPER_ADMIN`. This is also the endpoint used by `ADMIN` accounts to clear `must_change_password`.

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_secure_password"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `currentPassword` | string | ✅ | Must match stored bcrypt hash |
| `newPassword` | string | ✅ | Min 8 characters |

**Response `200`:**
```json
{
  "success": true,
  "message": "Password updated successfully.",
  "user": {
    "id": 42,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "organization_id": 3,
    "must_change_password": false,
    "created_at": "2026-01-01T10:00:00.000Z",
    "updated_at": "2026-01-01T10:30:00.000Z"
  }
}
```

**Errors:**
- `400` — Missing fields; new password < 8 characters
- `401` — Incorrect current password
- `404` — User not found

---

### POST /api/auth/invite

Invite a new user by email. Sends an invitation link via Resend email.

**Authentication:** Required (`requireAuth`, `requireTenant`, `requireAdmin`)

**Request Body:**
```json
{
  "email": "newuser@example.com"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Invitation sent successfully."
}
```

**Errors:**
- `400` — Invalid or missing email
- `403` — Not an admin; organization context missing
- `404` — Organization not found
- `409` — A user with this email already exists

---

### POST /api/auth/create-account

Complete registration using an invitation token.

**Authentication:** None (public)

**Request Body:**
```json
{
  "token": "raw_invitation_token_from_email",
  "name": "New User",
  "password": "securepassword"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `token` | string | ✅ | Raw token from the invitation link |
| `name` | string | ✅ | Non-empty |
| `password` | string | ✅ | Min 8 characters |

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created successfully."
}
```

**Errors:**
- `400` — Missing fields; password < 8 characters; invalid/expired/already-used token
- `409` — Email already registered

---

### POST /api/auth/forgot-password

Request a password reset email. Always returns a generic success message to prevent email enumeration.

**Authentication:** None (public)

**Request Body:**
```json
{
  "email": "jane@example.com"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "If an account exists for this email, a password reset link has been sent."
}
```

> **Note:** This endpoint is rate-limited: a new reset token cannot be issued within 60 seconds of the last one for the same user. The reset link expires in **2 minutes**.

---

### POST /api/auth/resend-reset

Re-trigger the forgot password flow. Identical behaviour to `POST /api/auth/forgot-password`.

**Authentication:** None (public)

**Request Body:**
```json
{
  "email": "jane@example.com"
}
```

**Response `200`:** Same as `forgot-password`.

---

### POST /api/auth/reset-password

Reset a password using a token from a password reset email.

**Authentication:** None (public)

**Request Body:**
```json
{
  "token": "raw_reset_token_from_email",
  "password": "new_secure_password"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `token` | string | ✅ | Raw token from the reset link |
| `password` | string | ✅ | Min 8 characters |

**Response `200`:**
```json
{
  "success": true,
  "message": "Password updated successfully."
}
```

**Errors:**
- `400` — Missing fields; password < 8 characters; invalid/expired/already-used token
- `404` — User not found

---

## Organizations (Public)

### GET /api/organizations/by-slug/:slug

Retrieve public organization metadata by slug.

**Authentication:** None (public)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Organization URL slug |

**Response `200`:**
```json
{
  "success": true,
  "organization": {
    "id": 3,
    "name": "Acme Corporation",
    "slug": "acme",
    "logo": "https://example.com/logo.png",
    "status": "ACTIVE"
  }
}
```

**Errors:**
- `404` — Organization not found

---

## Resources

All resource endpoints require authentication. Write operations (`POST`, `PUT`, `DELETE`) additionally require `ADMIN` role and a completed password change (`must_change_password = false`).

### GET /api/resources

List resources within the authenticated user's organization.

**Authentication:** Required (`requireAuth`, `requireTenantUser`)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by `ACTIVE`, `INACTIVE`, or `ALL` |
| `search` | string | Search by name or description (case-insensitive) |
| `type` | string | Filter by exact resource type |
| `location` | string | Filter by exact location |

**Response `200`:**
```json
{
  "success": true,
  "resources": [
    {
      "id": 10,
      "name": "Conference Room A",
      "description": "Large boardroom with projector",
      "type": "Room",
      "location": "Floor 3",
      "capacity": 20,
      "status": "ACTIVE",
      "organization_id": 3,
      "created_at": "2026-01-01T10:00:00.000Z",
      "updated_at": "2026-01-01T10:00:00.000Z"
    }
  ]
}
```

---

### GET /api/resources/:id

Get a single resource by ID.

**Authentication:** Required (`requireAuth`, `requireTenantUser`)

**Response `200`:**
```json
{
  "success": true,
  "resource": {
    "id": 10,
    "name": "Conference Room A",
    "description": "Large boardroom with projector",
    "type": "Room",
    "location": "Floor 3",
    "capacity": 20,
    "status": "ACTIVE",
    "organization_id": 3,
    "created_at": "2026-01-01T10:00:00.000Z",
    "updated_at": "2026-01-01T10:00:00.000Z"
  }
}
```

**Errors:**
- `400` — ID is not a positive integer
- `404` — Resource not found

---

### POST /api/resources

Create a new resource.

**Authentication:** Required — `ADMIN` + `requirePasswordChangeComplete`

**Request Body:**
```json
{
  "name": "Conference Room B",
  "type": "Room",
  "location": "Floor 2",
  "capacity": 10,
  "description": "Small meeting room",
  "status": "ACTIVE"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✅ | Non-empty, max 160 chars |
| `type` | string | ✅ | Non-empty, max 80 chars |
| `location` | string | ✅ | Non-empty |
| `capacity` | integer | ✅ | Positive integer |
| `description` | string | ❌ | Optional free text |
| `status` | string | ❌ | `ACTIVE` (default) or `INACTIVE` |

**Response `201`:**
```json
{
  "success": true,
  "resource": { ... }
}
```

**Errors:**
- `400` — Missing required fields; capacity ≤ 0 or not an integer; invalid status

---

### PUT /api/resources/:id

Update an existing resource.

**Authentication:** Required — `ADMIN` + `requirePasswordChangeComplete`

**Request Body:** Same fields as `POST /api/resources`. If `status` is omitted, the current value is preserved.

**Response `200`:**
```json
{
  "success": true,
  "resource": { ... }
}
```

**Errors:**
- `400` — Validation error
- `404` — Resource not found in this organization

---

### DELETE /api/resources/:id

Delete a resource.

**Authentication:** Required — `ADMIN` + `requirePasswordChangeComplete`

**Response `200`:**
```json
{
  "success": true,
  "message": "Resource deleted successfully."
}
```

**Errors:**
- `400` — ID is not a positive integer
- `404` — Resource not found
- `409` — Resource has existing bookings and cannot be deleted

---

## Bookings (User)

All booking endpoints require authentication and tenant context. `SUPER_ADMIN` users are blocked by `requireTenantUser`.

### GET /api/bookings

List all bookings belonging to the authenticated user.

**Authentication:** Required (`requireAuth`, `requireTenantUser`)

**Response `200`:**
```json
{
  "success": true,
  "bookings": [
    {
      "id": 55,
      "user_id": 42,
      "resource_id": 10,
      "start_time": "2026-06-01T09:00:00.000Z",
      "end_time": "2026-06-01T10:00:00.000Z",
      "purpose": "Team standup",
      "status": "PENDING",
      "organization_id": 3,
      "resource_name": "Conference Room A",
      "resource_type": "Room",
      "resource_location": "Floor 3",
      "created_at": "2026-05-30T08:00:00.000Z",
      "updated_at": "2026-05-30T08:00:00.000Z"
    }
  ]
}
```

---

### GET /api/bookings/:id

Get a single booking. Only the booking owner can access it.

**Authentication:** Required (`requireAuth`, `requireTenantUser`)

**Response `200`:**
```json
{
  "success": true,
  "booking": { ... }
}
```

**Errors:**
- `400` — ID is not a positive integer
- `403` — Booking does not belong to the authenticated user
- `404` — Booking not found

---

### GET /api/bookings/resource/:id

List all `PENDING` and `APPROVED` bookings for a specific resource (to check availability).

**Authentication:** Required (`requireAuth`, `requireTenantUser`)

**Response `200`:**
```json
{
  "success": true,
  "bookings": [
    {
      "id": 55,
      "start_time": "2026-06-01T09:00:00.000Z",
      "end_time": "2026-06-01T10:00:00.000Z",
      "status": "PENDING",
      "purpose": "Team standup",
      "user_id": 42,
      "user_name": "Jane Doe"
    }
  ]
}
```

**Errors:**
- `400` — Resource ID is not a positive integer

---

### POST /api/bookings

Create a new booking.

**Authentication:** Required (`requireAuth`, `requireTenantUser`)

**Request Body:**
```json
{
  "resource_id": 10,
  "start_time": "2026-06-01T09:00:00.000Z",
  "end_time": "2026-06-01T10:00:00.000Z",
  "purpose": "Team standup"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `resource_id` | integer | ✅ | Positive integer; must belong to user's org |
| `start_time` | string | ✅ | ISO 8601 datetime |
| `end_time` | string | ✅ | ISO 8601 datetime; must be after `start_time` |
| `purpose` | string | ✅ | Non-empty |

**Response `201`:**
```json
{
  "success": true,
  "booking": {
    "id": 55,
    "user_id": 42,
    "resource_id": 10,
    "start_time": "2026-06-01T09:00:00.000Z",
    "end_time": "2026-06-01T10:00:00.000Z",
    "purpose": "Team standup",
    "status": "PENDING",
    "created_at": "2026-05-30T08:00:00.000Z",
    "updated_at": "2026-05-30T08:00:00.000Z"
  }
}
```

**Errors:**
- `400` — Missing fields; `end_time` ≤ `start_time`; invalid time format
- `404` — Resource not found in this organization
- `409` — Booking overlaps with an existing `PENDING` or `APPROVED` booking (database exclusion constraint)

---

### DELETE /api/bookings/:id

Cancel a booking. Only the booking owner can cancel it. Only `PENDING` or `APPROVED` bookings can be cancelled.

**Authentication:** Required (`requireAuth`, `requireTenantUser`)

**Response `200`:**
```json
{
  "success": true,
  "booking": {
    "id": 55,
    "status": "CANCELLED",
    ...
  }
}
```

**Errors:**
- `400` — ID is not a positive integer
- `403` — Booking does not belong to the authenticated user
- `404` — Booking not found
- `409` — Booking is already `REJECTED` or `CANCELLED` and cannot be cancelled

---

## Admin — Booking Management

All endpoints require `ADMIN` role and `must_change_password = false`.

### GET /api/admin/bookings

List all bookings in the organization, with optional status filter.

**Authentication:** Required — `ADMIN` + `requirePasswordChangeComplete`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Optional. One of `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` |

**Response `200`:**
```json
{
  "success": true,
  "bookings": [
    {
      "id": 55,
      "user_id": 42,
      "resource_id": 10,
      "start_time": "2026-06-01T09:00:00.000Z",
      "end_time": "2026-06-01T10:00:00.000Z",
      "purpose": "Team standup",
      "status": "PENDING",
      "organization_id": 3,
      "resource_name": "Conference Room A",
      "resource_type": "Room",
      "resource_location": "Floor 3",
      "user_name": "Jane Doe",
      "user_email": "jane@example.com",
      "created_at": "2026-05-30T08:00:00.000Z",
      "updated_at": "2026-05-30T08:00:00.000Z"
    }
  ]
}
```

**Errors:**
- `400` — Invalid status value

---

### PUT /api/admin/bookings/:id/approve

Approve a `PENDING` booking.

**Authentication:** Required — `ADMIN` + `requirePasswordChangeComplete`

**Response `200`:**
```json
{
  "success": true,
  "booking": {
    "id": 55,
    "status": "APPROVED",
    ...
  }
}
```

**Errors:**
- `400` — ID is not a positive integer
- `404` — Booking not found
- `409` — Booking is not `PENDING`; approval would create an overlap with another approved booking

---

### PUT /api/admin/bookings/:id/reject

Reject a `PENDING` booking.

**Authentication:** Required — `ADMIN` + `requirePasswordChangeComplete`

**Response `200`:**
```json
{
  "success": true,
  "booking": {
    "id": 55,
    "status": "REJECTED",
    ...
  }
}
```

**Errors:**
- `400` — ID is not a positive integer
- `404` — Booking not found
- `409` — Booking is not `PENDING`

---

## Admin — User Management

All endpoints require `ADMIN` role and `must_change_password = false`.

### GET /api/admin/users

List all users (and admins) in the organization.

**Authentication:** Required — `ADMIN` + `requirePasswordChangeComplete`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Filter by name or email (case-insensitive) |
| `role` | string | Filter by `USER`, `ADMIN`, or `ALL` |

**Response `200`:**
```json
{
  "success": true,
  "users": [
    {
      "id": 42,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "USER",
      "status": "ACTIVE",
      "created_at": "2026-01-01T10:00:00.000Z",
      "updated_at": "2026-01-01T10:00:00.000Z",
      "last_login": "2026-06-01T08:00:00.000Z",
      "booking_count": 3
    }
  ]
}
```

> `SUPER_ADMIN` accounts are always excluded from this listing.

---

### POST /api/admin/users

Create a new `ADMIN` account in the organization.

**Authentication:** Required — `ADMIN` + `requirePasswordChangeComplete`

**Request Body:**
```json
{
  "name": "New Admin",
  "email": "newadmin@example.com",
  "password": "temporarypassword"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✅ | Non-empty |
| `email` | string | ✅ | Valid email format |
| `password` | string | ✅ | Min 8 characters |

**Response `201`:**
```json
{
  "success": true,
  "admin": {
    "id": 99,
    "name": "New Admin",
    "email": "newadmin@example.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "organization_id": 3,
    "must_change_password": true,
    "created_at": "2026-06-01T10:00:00.000Z",
    "updated_at": "2026-06-01T10:00:00.000Z"
  },
  "message": "Admin account created successfully. Share the temporary login credentials securely with the administrator."
}
```

> The created account has `must_change_password: true`. The new admin must change their password via `POST /api/auth/change-password` before accessing any admin functionality.

**Errors:**
- `400` — Missing fields; password < 8 characters; invalid email
- `409` — Email already registered

---

### PATCH /api/admin/users/:id/status

Activate or deactivate a user account.

**Authentication:** Required — `ADMIN` + `requirePasswordChangeComplete`

**Request Body:**
```json
{
  "status": "DEACTIVATED"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `status` | string | ✅ | `ACTIVE` or `DEACTIVATED` |

**Response `200`:**
```json
{
  "success": true,
  "user": {
    "id": 42,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "USER",
    "status": "DEACTIVATED",
    "created_at": "2026-01-01T10:00:00.000Z",
    "updated_at": "2026-06-01T11:00:00.000Z"
  }
}
```

**Errors:**
- `400` — Invalid status value
- `404` — User not found in this organization

> `SUPER_ADMIN` accounts cannot be targeted by this endpoint.

---

### DELETE /api/admin/users/:id

Delete a USER account. Cascades to delete the user's bookings and auth tokens.

**Authentication:** Required — `ADMIN` + `requirePasswordChangeComplete`

**Response `200`:**
```json
{
  "success": true,
  "message": "User deleted successfully."
}
```

**Errors:**
- `403` — Cannot delete your own account; cannot delete `ADMIN` or `SUPER_ADMIN` accounts
- `404` — User not found

---

## Super Admin — Platform Management

All endpoints require `SUPER_ADMIN` role. These routes are completely separate from tenant routes and do not interact with organization-scoped resource or booking data.

### GET /api/super-admin/organizations

List all organizations with aggregate counts.

**Authentication:** Required — `SUPER_ADMIN`

**Response `200`:**
```json
{
  "success": true,
  "organizations": [
    {
      "id": 3,
      "name": "Acme Corporation",
      "slug": "acme",
      "logo": null,
      "status": "ACTIVE",
      "created_at": "2026-01-01T10:00:00.000Z",
      "updated_at": "2026-01-01T10:00:00.000Z",
      "counts": {
        "users": 25,
        "resources": 8,
        "bookings": 143
      }
    }
  ]
}
```

---

### POST /api/super-admin/organizations

Create a new organization with an initial `ADMIN` account in a single atomic transaction.

**Authentication:** Required — `SUPER_ADMIN`

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "slug": "acme",
  "logo": "https://example.com/logo.png",
  "adminName": "Jane Doe",
  "adminEmail": "jane@acme.com",
  "adminPassword": "temporarypassword"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✅ | Non-empty |
| `slug` | string | ✅ | Lowercase alphanumeric + hyphens only; globally unique |
| `logo` | string | ❌ | URL string |
| `adminName` | string | ✅ | Non-empty |
| `adminEmail` | string | ✅ | Valid email; globally unique |
| `adminPassword` | string | ✅ | Min 8 characters |

**Response `201`:**
```json
{
  "success": true,
  "organization": {
    "id": 3,
    "name": "Acme Corporation",
    "slug": "acme",
    "logo": null,
    "status": "ACTIVE",
    "created_at": "2026-06-01T10:00:00.000Z"
  },
  "admin": {
    "id": 99,
    "name": "Jane Doe",
    "email": "jane@acme.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "must_change_password": true
  },
  "message": "Organization created and administrator successfully provisioned. Share the temporary password securely with the administrator."
}
```

> - The initial admin has `must_change_password: true`. They must change their password on first login before accessing admin functionality.
> - Organization creation and admin creation are **atomic** — if either fails, the entire transaction is rolled back.
> - `password_hash` is never returned in the response.

**Errors:**
- `400` — Missing required fields; slug format invalid; admin password < 8 characters
- `400` — Invalid admin email format
- `409` — Slug already taken; admin email already registered

---

### GET /api/super-admin/organizations/:id

Get detailed information about a single organization.

**Authentication:** Required — `SUPER_ADMIN`

**Response `200`:**
```json
{
  "success": true,
  "organization": {
    "id": 3,
    "name": "Acme Corporation",
    "slug": "acme",
    "logo": null,
    "status": "ACTIVE",
    "created_at": "2026-01-01T10:00:00.000Z",
    "updated_at": "2026-01-01T10:00:00.000Z"
  },
  "admins": [
    {
      "id": 99,
      "name": "Jane Doe",
      "email": "jane@acme.com",
      "role": "ADMIN",
      "status": "ACTIVE",
      "created_at": "2026-01-01T10:00:00.000Z"
    }
  ],
  "counts": {
    "users": 25,
    "admins": 2,
    "resources": 8,
    "bookings": 143
  }
}
```

**Errors:**
- `404` — Organization not found

---

### PATCH /api/super-admin/organizations/:id

Update an organization's name, slug, and/or logo.

**Authentication:** Required — `SUPER_ADMIN`

**Request Body:**
```json
{
  "name": "Acme Corp Updated",
  "slug": "acme-corp",
  "logo": "https://example.com/new-logo.png"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✅ | Non-empty |
| `slug` | string | ✅ | Lowercase alphanumeric + hyphens only |
| `logo` | string | ❌ | URL string or `null` |

**Response `200`:**
```json
{
  "success": true,
  "organization": { ... },
  "message": "Organization details updated successfully."
}
```

**Errors:**
- `400` — Missing fields; invalid slug format
- `404` — Organization not found
- `409` — Slug already taken by another organization

---

### PATCH /api/super-admin/organizations/:id/status

Activate or deactivate an organization.

**Authentication:** Required — `SUPER_ADMIN`

**Request Body:**
```json
{
  "status": "DEACTIVATED"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `status` | string | ✅ | `ACTIVE` or `DEACTIVATED` |

**Response `200`:**
```json
{
  "success": true,
  "organization": {
    "id": 3,
    "name": "Acme Corporation",
    "slug": "acme",
    "status": "DEACTIVATED"
  },
  "message": "Organization deactivated successfully."
}
```

**Errors:**
- `400` — Invalid status; cannot deactivate the `default` organization
- `404` — Organization not found

---

### POST /api/super-admin/organizations/:id/admins

Provision an additional `ADMIN` for an existing organization. Sends a password-reset email so the new admin can set their password.

**Authentication:** Required — `SUPER_ADMIN`

**Request Body:**
```json
{
  "name": "Second Admin",
  "email": "admin2@acme.com"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✅ | Non-empty |
| `email` | string | ✅ | Valid email; globally unique |

**Response `201`:**
```json
{
  "success": true,
  "admin": {
    "id": 100,
    "name": "Second Admin",
    "email": "admin2@acme.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "must_change_password": true,
    "created_at": "2026-06-01T10:00:00.000Z"
  },
  "message": "Administrator successfully added. A password setup email has been sent."
}
```

> A `PASSWORD_RESET` token (24-hour expiry) is created and a reset email is sent via Resend. If the email fails, the admin account is still created and the response message indicates the email error.

**Errors:**
- `400` — Missing fields; invalid email; organization is deactivated
- `404` — Organization not found
- `409` — Email already registered

---

### PATCH /api/super-admin/organizations/:id/admins/:adminId

Update an admin's name, email, and/or status.

**Authentication:** Required — `SUPER_ADMIN`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@acme.com",
  "status": "ACTIVE"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✅ | Non-empty |
| `email` | string | ✅ | Valid email |
| `status` | string | ❌ | `ACTIVE` or `DEACTIVATED` |

**Response `200`:**
```json
{
  "success": true,
  "admin": {
    "id": 99,
    "name": "Jane Smith",
    "email": "jane.smith@acme.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "created_at": "2026-01-01T10:00:00.000Z"
  },
  "message": "Administrator updated successfully."
}
```

**Errors:**
- `400` — Missing fields; invalid email; invalid status
- `404` — Admin not found in this organization
- `409` — Email already registered to another user

---

### DELETE /api/super-admin/organizations/:id/admins/:adminId

Remove an admin account from an organization.

**Authentication:** Required — `SUPER_ADMIN`

**Response `200`:**
```json
{
  "success": true,
  "message": "Administrator removed successfully."
}
```

**Errors:**
- `404` — Admin not found in this organization

---

### DELETE /api/super-admin/organizations/:id

Delete an organization and all its associated data (cascades via foreign keys).

**Authentication:** Required — `SUPER_ADMIN`

**Response `200`:**
```json
{
  "success": true,
  "message": "Organization and all related data successfully deleted."
}
```

**Errors:**
- `400` — Cannot delete the `default` organization; cannot delete an organization containing `SUPER_ADMIN` accounts
- `404` — Organization not found

---

## Database Schema Reference

### Enums

| Enum | Values |
|------|--------|
| `user_role` | `USER`, `ADMIN`, `SUPER_ADMIN` |
| `user_status` | `ACTIVE`, `DEACTIVATED` |
| `resource_status` | `ACTIVE`, `INACTIVE` |
| `booking_status` | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` |
| `organization_status` | `ACTIVE`, `DEACTIVATED` |
| `auth_token_type` | `INVITATION`, `PASSWORD_RESET` |

### Table: `organizations`

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT | PK, auto-generated |
| `name` | VARCHAR(255) | Not null |
| `slug` | VARCHAR(255) | Not null, unique |
| `logo` | TEXT | Nullable |
| `status` | organization_status | Default `ACTIVE` |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-updated by trigger |

### Table: `users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT | PK, auto-generated |
| `name` | VARCHAR(120) | Not null |
| `email` | VARCHAR(255) | Not null, unique (case-insensitive index) |
| `password_hash` | TEXT | Not null; bcrypt |
| `role` | user_role | Default `USER` |
| `status` | user_status | Default `ACTIVE` |
| `organization_id` | BIGINT | FK → organizations; cascade delete |
| `must_change_password` | BOOLEAN | Default `false` |
| `last_login` | TIMESTAMPTZ | Nullable |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-updated by trigger |

### Table: `resources`

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT | PK, auto-generated |
| `name` | VARCHAR(160) | Not null |
| `description` | TEXT | Nullable |
| `type` | VARCHAR(80) | Not null |
| `location` | VARCHAR(255) | Not null |
| `capacity` | INTEGER | Not null; `CHECK (capacity > 0)` |
| `status` | resource_status | Default `ACTIVE` |
| `organization_id` | BIGINT | FK → organizations; cascade delete |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-updated by trigger |

### Table: `bookings`

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT | PK, auto-generated |
| `user_id` | BIGINT | FK → users; `ON DELETE RESTRICT` |
| `resource_id` | BIGINT | FK → resources; `ON DELETE RESTRICT` |
| `start_time` | TIMESTAMPTZ | Not null |
| `end_time` | TIMESTAMPTZ | Not null |
| `purpose` | TEXT | Not null |
| `status` | booking_status | Default `PENDING` |
| `organization_id` | BIGINT | FK → organizations; cascade delete |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-updated by trigger |

**Constraint:** `bookings_no_pending_or_approved_overlap` — exclusion constraint using `btree_gist` preventing time range overlap for `PENDING` or `APPROVED` bookings on the same resource.

### Table: `auth_tokens`

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT | PK, auto-generated |
| `type` | auth_token_type | `INVITATION` or `PASSWORD_RESET` |
| `email` | VARCHAR(255) | Not null |
| `user_id` | BIGINT | FK → users; nullable; cascade delete |
| `token_hash` | TEXT | Not null; SHA-256 hash of the raw token |
| `expires_at` | TIMESTAMPTZ | Not null |
| `used_at` | TIMESTAMPTZ | Nullable; set when token is consumed |
| `organization_id` | BIGINT | FK → organizations; cascade delete |
| `created_at` | TIMESTAMPTZ | |
