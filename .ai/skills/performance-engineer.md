# Performance Engineer Skill

## Role Definition

The Performance Engineer identifies, measures, and resolves performance bottlenecks across backend services, frontend applications, and mobile apps. All optimizations must be driven by measurement, not assumption.

---

## Core Responsibilities

1. Define and track performance SLOs for all services.
2. Conduct load testing before major releases.
3. Analyze query execution plans and optimize database access.
4. Implement and maintain caching strategies.
5. Profile frontend bundle size and Core Web Vitals.
6. Profile mobile app for frame drops, memory leaks, and startup time.

---

## The Performance Engineering Cycle

```
Measure → Baseline → Identify Bottleneck → Optimize → Measure Again → Document
```

**Golden Rule**: Never optimize without measuring first. Premature optimization is the root of all evil.

---

## Backend Performance Toolkit

### Step 1: Establish Baselines
- Run k6 load test against staging and record p50, p95, p99 latencies.
- Capture current database slow query log threshold (> 100ms).
- Record current error rate under load.

### Step 2: Identify Bottlenecks
- Check APM traces for slow spans.
- Review slow query log for N+1 patterns or missing indexes.
- Check external service call latencies.
- Look for synchronous operations that could be async.

### Step 3: Common Fixes
| Bottleneck | Solution |
|---|---|
| N+1 queries | Eager loading / DataLoader batching |
| Missing index | Add covering index for query pattern |
| Repeated expensive queries | Redis cache with appropriate TTL |
| Synchronous external calls | Background queue with async processing |
| Unoptimized large queries | Pagination, projections, denormalization |

---

## Frontend Performance Toolkit

### Core Web Vitals Targets
| Metric | Good | Needs Work |
|---|---|---|
| LCP | < 2.5s | > 4s |
| CLS | < 0.1 | > 0.25 |
| INP | < 200ms | > 500ms |

### Bundle Analysis Process
```bash
# Generate bundle analysis
npm run build -- --analyze

# Check for duplicate packages
npx duplicate-package-checker-webpack-plugin

# Audit unused exports
npx ts-unused-exports tsconfig.json
```

### Frontend Optimization Checklist
- [ ] Routes code-split with dynamic import.
- [ ] Images in WebP/AVIF with explicit dimensions.
- [ ] Long lists virtualized (react-virtual).
- [ ] `React.memo` on expensive pure components.
- [ ] `useMemo` on expensive derived computations.
- [ ] Third-party scripts loaded async/defer.
- [ ] Fonts preloaded.

---

## Mobile Performance Toolkit

### Android Profiling Steps
1. **CPU Profiler**: Record trace during app startup and critical interactions.
2. **Memory Profiler**: Check for memory leaks (also use LeakCanary).
3. **Layout Inspector**: Count recompositions on hot screens.
4. **Frame Timeline**: Identify frames > 16ms (< 60 FPS).

### Performance Targets
| Metric | Target |
|---|---|
| Cold start time | < 2 seconds |
| Warm start time | < 1 second |
| Frame rate | ≥ 60 FPS sustained |
| App size | < 50MB (aim for < 20MB) |

---

## Load Testing Protocol

```js
// k6 load test template
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // ramp up
    { duration: '5m', target: 100 },   // sustain
    { duration: '2m', target: 200 },   // stress
    { duration: '2m', target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<500'],  // 99% of requests < 500ms
    http_req_failed: ['rate<0.01'],    // < 1% error rate
  },
};
```

---

## Quality Gates

- Load test results documented in release notes.
- p99 latency < 500ms for all critical endpoints.
- Core Web Vitals LCP < 2.5s, CLS < 0.1, INP < 200ms.
- Bundle size regression < 10% per PR.
- No memory leaks in mobile (LeakCanary clean in CI).
