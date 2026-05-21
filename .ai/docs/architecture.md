# System Architecture Documentation

## Overview

This document describes the high-level architecture of the system, including layer design, module boundaries, communication patterns, and technology decisions.

---

## Architectural Style

This system follows **Clean Architecture** (Robert C. Martin) with **Feature-First Modularization** and **SOLID principles** enforced at every layer.

### Core Tenets
- **Dependency Rule**: Source code dependencies only point inward toward the domain.
- **Independence**: Business rules are independent of UI, database, and external agencies.
- **Testability**: Business rules can be tested without the UI, database, or web server.
- **Interchangeability**: UI, DB, and external services are replaceable without changing business rules.

---

## Layer Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Presentation Layer                  │
│  (Controllers, ViewModels, Composables, React Pages) │
├─────────────────────────────────────────────────────┤
│                 Application Layer                    │
│       (Use Cases, DTOs, Ports, Mappers)             │
├─────────────────────────────────────────────────────┤
│                   Domain Layer                       │
│    (Entities, Value Objects, Domain Events)         │
├─────────────────────────────────────────────────────┤
│               Infrastructure Layer                   │
│   (Repositories, DB, HTTP Clients, Queue Adapters)  │
└─────────────────────────────────────────────────────┘
```

### Layer Descriptions

| Layer | Responsibility | Technology |
|---|---|---|
| Domain | Business entities, rules, domain events | Pure Kotlin/TS |
| Application | Use cases, orchestration, interfaces | Kotlin/TS |
| Infrastructure | DB, APIs, queues, file system | ORM, Retrofit, Axios |
| Presentation | UI, routing, API controllers | Compose, React, Express |

---

## Module Structure

```
/
├── /core                    # Shared cross-cutting concerns
│   ├── /network             # HTTP client, interceptors
│   ├── /database            # DB connection, migrations
│   ├── /security            # Auth utilities, encryption
│   ├── /logging             # Structured logger
│   ├── /events              # Event bus
│   └── /testing             # Test utilities, fakes, factories
│
├── /domain                  # Pure business domain (no framework deps)
│   ├── /models              # Entities and value objects
│   ├── /repositories        # Repository interfaces
│   └── /usecases            # Business use case interfaces
│
├── /data                    # Data layer (implements domain interfaces)
│   ├── /repositories        # Repository implementations
│   ├── /remote              # External API data sources
│   └── /local               # Local persistence data sources
│
├── /features                # Feature modules (self-contained)
│   ├── /auth                # Authentication feature
│   ├── /orders              # Order management feature
│   └── /...
│
├── /designsystem            # UI design system (web/mobile)
│   ├── /tokens              # Design tokens
│   ├── /atoms               # Primitive components
│   └── /molecules           # Composite components
│
└── /navigation              # App navigation definitions
```

---

## Data Flow

### Read Flow
```
User Action
    → ViewModel / Controller
    → Use Case
    → Repository Interface
    → Repository Implementation
    → Database / Remote API
    → Domain Entity (mapped)
    → DTO
    → UI State
    → Rendered View
```

### Write Flow
```
User Input
    → Validation (Presentation)
    → Use Case (DTO)
    → Domain Entity (validation)
    → Repository (persist)
    → Domain Event (published)
    → Event Handler (side effects)
    → Response DTO
    → UI Update
```

---

## Communication Patterns

### Within a Service
- In-process method calls via injected interfaces.
- Domain events for cross-module side effects (loose coupling).

### Between Services (if microservices)
- **Synchronous**: REST API or gRPC for request/response.
- **Asynchronous**: Message queue (RabbitMQ, SQS) for events.
- **Resilience**: Circuit breakers on all external calls.

---

## Technology Decisions

| Concern | Decision | Rationale |
|---|---|---|
| DI Framework | Hilt (Android), NestJS DI (Node) | Battle-tested, ecosystem integration |
| State Management | StateFlow (Android), Zustand/TanStack Query (Web) | Reactive, minimal boilerplate |
| Database | PostgreSQL / Room | ACID guarantees, mature ecosystem |
| Cache | Redis | High performance, rich data structures |
| API Style | REST (external), gRPC (internal) | REST for clients, gRPC for low-latency internal |
| Authentication | JWT + refresh token rotation | Stateless, scalable |

---

## Scalability Strategy

- **Horizontal scaling**: Stateless services deployable across multiple instances.
- **Read replicas**: Database read replicas for read-heavy features.
- **Caching**: Redis cache tier for frequently accessed data.
- **Async processing**: Background queues for non-critical, time-consuming operations.
- **Feature flags**: Decouple deployment from feature activation.
- **CQRS**: Separate read and write models for high-traffic domains.

---

## Architecture Decision Records

See [decisions.md](decisions.md) for the history of architecture decisions and their rationale.
