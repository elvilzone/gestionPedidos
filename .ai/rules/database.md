# Database Engineering Rules

## Core Standards

These rules govern all database design, query engineering, and data persistence decisions.

---

## 1. Schema Design Principles

- All schemas must be at least **3rd Normal Form (3NF)** by default.
- Every table must have a **surrogate primary key** (UUID v7 or ULID preferred).
- Table names: `snake_case`, plural: `orders`, `users`, `product_categories`.
- Column names: `snake_case`, singular: `created_at`, `user_id`.
- Foreign keys: `{referenced_table_singular}_id`.
- Every table must have `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`.
- Mutable tables must have `updated_at TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP`.
- All timestamps stored in **UTC**.
- Use soft deletes (`deleted_at TIMESTAMP NULL`) for all business-critical entities.

---

## 2. Constraints & Relationships

- ALL FK relationships must have explicit DB-level constraints.
- Cascade behavior must be explicit: `ON DELETE RESTRICT` by default.
- Unique constraints at DB level for uniqueness invariants.
- Check constraints for domain invariants: `CHECK (amount > 0)`.

---

## 3. Indexing Strategy

- All FK columns must be indexed.
- All `WHERE`, `JOIN ON`, `ORDER BY` columns evaluated for indexes.
- Composite indexes ordered by selectivity (most selective first).
- Use `EXPLAIN ANALYZE` on all queries against tables > 10K rows.
- Remove unused indexes — they degrade write performance.

---

## 4. Query Engineering

- **NO raw SQL string concatenation** — parameterized queries always.
- Never use `SELECT *` — list columns explicitly.
- Always apply `LIMIT` on potentially unbounded queries.
- Eliminate all N+1 queries via eager loading or batch queries.
- Use CTEs for complex, readable queries.

---

## 5. Migrations

- ALL schema changes via versioned migration scripts.
- Use: **Flyway**, **Liquibase**, **Prisma Migrate**, **Room Migrations**, or **Alembic**.
- Never modify an already-applied migration.
- Breaking changes done in multiple steps:
  1. Add new column.
  2. Backfill data.
  3. Switch application.
  4. Drop old column in a future release.

---

## 6. Transactions & Concurrency

- Use transactions for multi-record atomic operations.
- Keep transactions short-lived — commit/rollback immediately.
- Use optimistic locking (version column) for high-contention flows.
- Implement retry logic with exponential backoff for deadlocks.

---

## 7. Security

- **Never store plaintext passwords.** Use bcrypt (cost 12+) or Argon2id.
- Encrypt sensitive PII at rest using application-level encryption.
- DB credentials rotated every 90 days via secrets manager.
- App DB user has only required permissions — no DDL rights in production.
- Enable audit logging on sensitive tables.

---

## 8. Performance

- Connection pooling mandatory: PgBouncer, HikariCP, or ORM pooling.
- Read replicas for read-heavy workloads.
- Redis cache for frequently-read, rarely-changed data.
- Implement query timeouts at application level.
- Partition or archive tables before they grow unmanageably large.

---

## Anti-Patterns (FORBIDDEN)

| Anti-Pattern | Corrective Action |
|---|---|
| Raw SQL in business logic | ORM / query builder with parameterized queries |
| Missing FK constraints | Add and enforce FK constraints |
| Storing JSON blobs for structured data | Normalize into columns/tables |
| Timestamps without UTC | Always UTC, convert at app layer |
| Shared DB user across services | One user per service, least privilege |
| Direct DDL on production | Always via migration scripts |
