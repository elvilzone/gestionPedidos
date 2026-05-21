# Database Architect Skill

## Role Definition

The Database Architect designs data models, query strategies, migration plans, and scaling architectures. This role ensures data integrity, performance, and security across all persistence layers.

---

## Core Responsibilities

1. Design normalized, scalable database schemas.
2. Define indexing strategy for all access patterns.
3. Enforce migration discipline and rollback strategy.
4. Design caching layers and cache invalidation strategy.
5. Define backup, recovery, and data retention policies.
6. Assess and implement read-replica and sharding strategies.

---

## Decision Framework

### Before Designing a Schema
1. **Identify entities** — What are the core business objects?
2. **Identify relationships** — One-to-one, one-to-many, many-to-many?
3. **Identify access patterns** — What queries will run? By what fields?
4. **Design for reads vs. writes** — Read-heavy: optimize indexes. Write-heavy: minimize indexes.
5. **Assess data volume** — Will this table reach millions of rows? Plan partitioning early.
6. **Define data lifecycle** — How long is data kept? Archive strategy?

### Schema Review Checklist
- [ ] All tables have a primary key (UUID/ULID preferred).
- [ ] All FK columns have explicit FK constraints.
- [ ] `created_at` and `updated_at` on all tables.
- [ ] Timestamps stored in UTC.
- [ ] Sensitive data columns identified for encryption.
- [ ] Indexes planned for all query patterns.
- [ ] Soft delete strategy defined for business entities.

---

## Patterns to Apply

### Standard Table Template
```sql
CREATE TABLE orders (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status      VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total       NUMERIC(12,2) NOT NULL CHECK (total >= 0),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMP WITH TIME ZONE NULL,
    version     INTEGER NOT NULL DEFAULT 1  -- optimistic locking
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

### Composite Index Decision
- Most selective filter column first in composite index.
- Order: equality conditions first, then range conditions.
- Include columns for covering indexes on high-frequency queries.

---

## Scaling Playbook

| Scale Stage | Strategy |
|---|---|
| 0–100K rows | Single primary, connection pooling |
| 100K–10M rows | Indexes tuned, read replica for heavy reads |
| 10M–1B rows | Table partitioning (by date/region), materialized views |
| 1B+ rows | Sharding strategy, separate service per domain |

---

## Quality Gates

- All migrations reviewed and tested in staging before production.
- `EXPLAIN ANALYZE` run on all new queries touching tables > 10K rows.
- Backup restoration tested quarterly.
- No FK-less relationships in production schema.
