# API Engineering Rules

## Core Standards

All APIs are products. They must be designed for longevity, developer experience, and correctness from day one.

---

## 1. Design Principles

- **Contract-first**: Define the API contract (OpenAPI/Swagger) before implementation.
- **Consistent**: All endpoints follow the same conventions. No exceptions.
- **Versioned**: Every API surface is versioned from launch.
- **Documented**: Every endpoint has description, request/response schemas, and examples.
- **Idempotent**: `GET`, `PUT`, `DELETE` must be idempotent. `POST` must document idempotency key support.

---

## 2. RESTful Conventions

- Resources are nouns, not verbs: `/orders`, not `/createOrder`.
- Plural nouns for collections: `/products`, `/users`.
- Nest resources max one level: `/orders/{id}/items`.
- Use HTTP verbs correctly:
  - `GET` — read, never modifies state.
  - `POST` — create a new resource.
  - `PUT` — full replacement of a resource.
  - `PATCH` — partial update of a resource.
  - `DELETE` — remove a resource.

### HTTP Status Codes
| Code | Usage |
|---|---|
| 200 OK | Successful GET, PATCH, PUT |
| 201 Created | Successful POST with `Location` header |
| 204 No Content | Successful DELETE |
| 400 Bad Request | Validation error |
| 401 Unauthorized | Missing or invalid auth |
| 403 Forbidden | Authenticated but not authorized |
| 404 Not Found | Resource not found |
| 409 Conflict | Duplicate resource, concurrent modification |
| 422 Unprocessable Entity | Business logic validation failure |
| 429 Too Many Requests | Rate limit exceeded |
| 500 Internal Server Error | Unexpected server error |

---

## 3. Request / Response Standards

### Standard Success Response
```json
{
  "data": { ... },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Paginated Response
```json
{
  "data": [ ... ],
  "pagination": {
    "total": 200,
    "page": 1,
    "perPage": 20,
    "totalPages": 10,
    "nextCursor": "cursor_token"
  }
}
```

### Error Response (RFC 7807)
```json
{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation Error",
  "status": 422,
  "detail": "Field 'email' is required",
  "instance": "/api/v1/users",
  "requestId": "uuid"
}
```

---

## 4. Versioning

- URL path versioning: `/api/v1/`, `/api/v2/`.
- Never break an existing version without a deprecation period (minimum 3 months).
- Communicate deprecation via `Deprecation` and `Sunset` HTTP headers.
- Maintain changelogs for each API version.

---

## 5. Security

- All endpoints require authentication unless explicitly documented as public.
- Authorization enforced at the use case layer — not just in middleware.
- Rate limiting on all endpoints. Stricter on auth endpoints (5 req/min).
- Request body size limits enforced (default: 1MB, max: 10MB for file uploads).
- CORS policy explicitly configured. No wildcards in production.

---

## 6. OpenAPI Specification

- OpenAPI 3.0+ specification maintained alongside the code.
- Auto-generate from code annotations or validate code against spec.
- Every endpoint documents: summary, description, request body schema, all response schemas.
- API spec published to developer portal.
- Breaking changes detected via `openapi-diff` in CI.

---

## 7. Webhooks (Event-Driven APIs)

- Webhooks must include event type, timestamp, and unique event ID.
- Webhook payload must be signed (HMAC-SHA256) for receiver verification.
- Webhook delivery with automatic retries (3x with exponential backoff).
- Provide a webhook delivery log and manual replay mechanism.

---

## Anti-Patterns (FORBIDDEN)

| Anti-Pattern | Corrective Action |
|---|---|
| Verbs in resource URLs | Use nouns only |
| Inconsistent response shapes | Use standard response envelope |
| Returning 200 for errors | Use correct HTTP status codes |
| Breaking API changes without versioning | Version the API first |
| No request body validation | Validate all input at boundary |
| Exposing internal errors | Generic error messages + request ID for tracing |
