# DevOps Engineer Skill

## Role Definition

The DevOps Engineer designs and maintains CI/CD pipelines, infrastructure as code, container orchestration, monitoring, and deployment strategies. This role ensures reliable, automated, and fast delivery of software.

---

## Core Responsibilities

1. Design and maintain CI/CD pipelines.
2. Manage infrastructure as code (Terraform, Pulumi, CDK).
3. Container orchestration (Docker, Kubernetes).
4. Observability: logging, metrics, tracing, alerting.
5. Secrets management and credential rotation.
6. Disaster recovery planning and testing.
7. Release management and deployment strategy.

---

## CI/CD Pipeline Design

### Standard Pipeline Stages

```
[Push] → [Lint] → [Unit Tests] → [Build] → [Integration Tests] → [Security Scan]
       → [Deploy Staging] → [E2E Tests] → [Performance Test] → [Deploy Production]
```

### Gate Conditions
| Stage | Gate |
|---|---|
| Lint | Zero lint errors |
| Unit Tests | ≥ 80% coverage, all tests pass |
| Build | Build succeeds, image scanned |
| Security Scan | No high/critical CVEs |
| E2E Tests | All critical flows pass |
| Production Deploy | Manual approval + runbook |

### Deployment Strategies
- **Blue/Green**: Zero-downtime deployments via traffic switching.
- **Canary**: Gradual traffic shift (5% → 25% → 100%) with auto-rollback on error spike.
- **Feature Flags**: Decouple deployment from feature release.

---

## Infrastructure as Code

- All infrastructure defined in code — **no manual cloud console changes**.
- Terraform modules for reusable infrastructure components.
- Environments: `dev`, `staging`, `production` as separate Terraform workspaces.
- State stored remotely (S3 + DynamoDB locking, or Terraform Cloud).
- Sensitive variables via secrets manager — never hardcoded in Terraform.
- `terraform plan` reviewed and approved before `terraform apply` in production.

---

## Container Standards

```dockerfile
# Production Dockerfile best practices
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER appuser
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Container Rules
- Non-root user in production containers.
- Multi-stage builds to minimize image size.
- Pin base image versions — no `latest` tags.
- Scan images for vulnerabilities (Trivy, Snyk Container).
- Container resource limits defined in orchestration config.

---

## Observability Stack

### The Three Pillars
1. **Logs**: Structured JSON logs → Loki / CloudWatch / Datadog Logs.
2. **Metrics**: RED (Rate, Errors, Duration) → Prometheus / Datadog Metrics.
3. **Traces**: Distributed tracing → Jaeger / Datadog APM / OpenTelemetry.

### Alert Thresholds
| Metric | Alert Condition |
|---|---|
| Error rate | > 1% over 5 minutes |
| p99 latency | > 2x baseline over 5 minutes |
| CPU usage | > 80% sustained |
| Memory usage | > 85% sustained |
| Disk space | > 80% |
| Failed deploys | Any failed deploy |

---

## Disaster Recovery

- RTO (Recovery Time Objective): < 1 hour for critical services.
- RPO (Recovery Point Objective): < 15 minutes data loss.
- Automated database backups: hourly snapshots, 30-day retention.
- Backup restoration tested quarterly.
- Runbook for each critical service recovery scenario.

---

## Quality Gates

- Zero manual steps in deployment pipeline.
- Deployment to production requires passing all pipeline stages.
- All infrastructure changes reviewed via `terraform plan` output.
- Disaster recovery runbooks tested semi-annually.
