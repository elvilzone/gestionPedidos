# {Project Name}

> {One-line project description. Replace with your project's purpose.}

---

## Overview

{Replace with your project overview. Describe what the system does, who uses it, and what problems it solves.}

---

## Architecture

This project follows **Clean Architecture** with **Feature-First Modularization**, enforcing SOLID principles, SRP, and Separation of Concerns at every layer.

```
┌──────────────────────────────────────────┐
│           Presentation Layer             │
│   (Controllers / ViewModels / UI)        │
├──────────────────────────────────────────┤
│          Application Layer               │
│     (Use Cases / DTOs / Ports)           │
├──────────────────────────────────────────┤
│            Domain Layer                  │
│   (Entities / Value Objects / Events)    │
├──────────────────────────────────────────┤
│        Infrastructure Layer              │
│ (Repositories / DB / HTTP / Queues)      │
└──────────────────────────────────────────┘
```

**Dependency rule**: Outer layers depend on inner layers. Never the reverse.

### Module Structure

```
/core              # Shared cross-cutting concerns
/domain            # Pure business domain (no framework deps)
/data              # Data layer (implements domain interfaces)
/features          # Feature modules (self-contained)
/designsystem      # UI design system
/navigation        # Navigation definitions
```

See [Architecture Documentation](.ai/docs/architecture.md) for full details.

---

## Tech Stack

| Concern | Technology |
|---|---|
| **Language** | {Kotlin / TypeScript / Swift} |
| **UI** | {Jetpack Compose / React / SwiftUI} |
| **State** | {StateFlow + Hilt / Zustand + TanStack Query} |
| **Database** | {Room / PostgreSQL / SQLite} |
| **Networking** | {Retrofit / Axios} |
| **DI** | {Hilt / NestJS DI} |
| **Testing** | {JUnit5 + Turbine / Vitest + Testing Library} |
| **CI/CD** | {GitHub Actions / GitLab CI} |

---

## Getting Started

### Prerequisites

- {Requirement 1 — e.g., Node.js 20+}
- {Requirement 2 — e.g., Android Studio Hedgehog+}
- {Requirement 3 — e.g., Docker}

### Setup

```bash
# Clone the repository
git clone {repo-url}
cd {project-name}

# Install dependencies
{npm install / gradle build}

# Configure environment
cp .env.example .env
# Edit .env with your local values

# Run database migrations
{npm run migrate / ./gradlew migrate}

# Start development server
{npm run dev / ./gradlew :app:installDebug}
```

### Environment Variables

See `.env.example` for all required environment variables and their descriptions.

---

## Development Guide

### Branching Strategy

```
main              ← Production-ready code
  └── feature/*   ← Feature development
  └── fix/*       ← Bug fixes
  └── release/*   ← Release candidates
  └── hotfix/*    ← Critical production fixes
```

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): short description
fix(scope): short description
refactor(scope): short description
```

### Development Workflows

| Task | Reference |
|---|---|
| New feature | [Feature Workflow](.ai/workflows/feature-workflow.md) |
| Bug fix | [Bugfix Workflow](.ai/workflows/bugfix-workflow.md) |
| Refactoring | [Refactor Workflow](.ai/workflows/refactor-workflow.md) |
| Release | [Release Workflow](.ai/workflows/release-workflow.md) |

---

## Testing

```bash
# Run all unit tests
{npm run test:unit}

# Run integration tests
{npm run test:integration}

# Run E2E tests
{npm run test:e2e}

# Run all tests with coverage report
{npm run test:coverage}
```

Coverage thresholds:
- Use cases / Domain logic: ≥ 90%
- Infrastructure / Adapters: ≥ 70%
- Overall: ≥ 80%

---

## Engineering Standards

All contributors must follow the engineering rules defined in `.ai/rules/`:

| Domain | Rules |
|---|---|
| Architecture | [architecture.md](.ai/rules/architecture.md) |
| Backend | [backend.md](.ai/rules/backend.md) |
| Frontend | [frontend.md](.ai/rules/frontend.md) |
| Mobile | [mobile.md](.ai/rules/mobile.md) |
| Database | [database.md](.ai/rules/database.md) |
| Security | [security.md](.ai/rules/security.md) |
| Testing | [testing.md](.ai/rules/testing.md) |
| Performance | [performance.md](.ai/rules/performance.md) |
| API | [api.md](.ai/rules/api.md) |
| Naming | [naming.md](.ai/rules/naming.md) |

---

## AI Assistant Setup

This project includes full configuration for AI coding assistants:

- **`CLAUDE.md`** — Instructions for Claude and other AI assistants.
- **`AGENTS.md`** — Configuration for autonomous AI agents.
- **`.ai/rules/`** — Detailed engineering rules per domain.
- **`.ai/skills/`** — Specialist role profiles for AI agents.
- **`.ai/workflows/`** — Step-by-step development workflows.
- **`.ai/docs/`** — Architecture documentation, conventions, ADRs, templates.

---

## Documentation

| Document | Location |
|---|---|
| Architecture Overview | [.ai/docs/architecture.md](.ai/docs/architecture.md) |
| Engineering Conventions | [.ai/docs/conventions.md](.ai/docs/conventions.md) |
| Architecture Decisions | [.ai/docs/decisions.md](.ai/docs/decisions.md) |
| PRD Template | [.ai/docs/prd-template.md](.ai/docs/prd-template.md) |
| RFC Template | [.ai/docs/rfc-template.md](.ai/docs/rfc-template.md) |

---

## Contributing

1. Read the [Engineering Conventions](.ai/docs/conventions.md) before contributing.
2. Follow the [Feature Workflow](.ai/workflows/feature-workflow.md) for new features.
3. Ensure all CI checks pass before requesting review.
4. PRs require at least 1 approval before merging.

---

## License

{Your license — e.g., MIT, Apache 2.0, Proprietary}
