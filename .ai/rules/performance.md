# Performance Engineering Rules

## Core Standards

Performance is designed in, not bolted on. These rules must be considered at every stage of development.

---

## 1. Performance Targets

Define and track SLOs (Service Level Objectives) for all services:

| Metric | Target |
|---|---|
| API response time (p50) | < 100ms |
| API response time (p99) | < 500ms |
| Page Time to Interactive (TTI) | < 3s |
| Core Web Vitals LCP | < 2.5s |
| Core Web Vitals CLS | < 0.1 |
| Core Web Vitals FID/INP | < 100ms |
| Mobile app frame rate | ≥ 60 FPS (120 FPS where supported) |
| Service availability | ≥ 99.9% uptime |

---

## 2. Backend Performance

### Database
- Index all columns in `WHERE`, `JOIN`, `ORDER BY`, `GROUP BY` clauses.
- Eliminate N+1 queries — use eager loading or batch data loaders.
- Connection pooling required. Pool size tuned for workload.
- Cache high-read / low-write data in Redis. Set appropriate TTLs.
- Paginate all list operations. No unbounded queries allowed.
- Slow query log threshold: flag any query > 100ms.
- Run `EXPLAIN ANALYZE` on all queries touching tables > 10K rows.

### Application
- Set timeouts on all external HTTP calls (default: 5s, max: 30s).
- Implement circuit breakers for all third-party service calls.
- Async processing for non-critical, time-consuming operations (email sending, PDF generation).
- Use message queues (RabbitMQ, SQS, BullMQ) for background job processing.
- Compress API responses with gzip/Brotli.
- Use HTTP/2 where supported.

### Caching Strategy
- **CDN caching**: Static assets, images, CSS, JS (long TTL + cache-busting hash).
- **Application caching**: Redis for session data, rate limit state, feature flags.
- **DB query caching**: Materialized views or Redis for expensive aggregations.
- Cache invalidation strategy must be defined alongside any cached data.

---

## 3. Frontend Performance

### Bundle Optimization
- Code-split at route level using `React.lazy` / dynamic imports.
- Analyze bundle with `webpack-bundle-analyzer` or `vite-bundle-visualizer` before each release.
- Tree-shake unused library exports.
- Target bundle size: < 200KB initial JS (gzipped).
- Remove all unused dependencies (`depcheck`).

### Asset Optimization
- Images in WebP/AVIF format.
- Use `loading="lazy"` for below-the-fold images.
- Specify `width` and `height` on all images to prevent CLS.
- SVG icons instead of icon fonts.
- Fonts preloaded with `<link rel="preload">`.

### Rendering
- Memoize expensive React components with `React.memo`.
- Use `useMemo` for expensive computations.
- Use `useCallback` to stabilize function references passed as props.
- Virtualize long lists with `react-virtual` or `@tanstack/virtual`.
- Avoid `useEffect` chains that cause cascading re-renders.

---

## 4. Mobile Performance (Android)

- **Main thread** for UI only. All IO and computation on background dispatchers.
- Avoid unnecessary recompositions — use `remember`, `derivedStateOf`, stable types.
- Measure recompositions with Layout Inspector in Android Studio.
- Use `Paging 3` library for large list pagination.
- Lazy load images with **Coil** using appropriate disk and memory cache settings.
- Profile with Android Studio Profiler before each release.
- Target smooth 60 FPS — profile frames dropping below 16ms.
- Use WorkManager for deferred, battery-aware background work.

---

## 5. Load Testing & Profiling

- Load test all critical API endpoints before major releases.
- Tools: **k6**, **Gatling**, **JMeter**, **Locust**.
- Simulate realistic traffic patterns (not just flat load).
- Identify bottlenecks at: database, application, network, and external services.
- Profile before optimizing — measure first, then fix.
- Document performance test results in release notes.

---

## 6. Monitoring & Observability

- Instrument ALL services with APM: **Datadog**, **New Relic**, **OpenTelemetry**.
- Track: request rate, error rate, latency (p50, p95, p99).
- Alert on: error rate spikes, p99 latency > 2x baseline, CPU/memory above 80%.
- Distributed tracing across all services.
- Real User Monitoring (RUM) for frontend performance in production.

---

## Anti-Patterns (FORBIDDEN)

| Anti-Pattern | Corrective Action |
|---|---|
| Synchronous blocking calls on main thread | Async/coroutines/background threads |
| Fetching full dataset without pagination | Paginate all list queries |
| N+1 queries | Eager load or batch fetch |
| No caching for expensive operations | Add cache with appropriate TTL |
| Unbundled, unminified JS in production | Build pipeline with minification |
| Images without dimensions | Always specify width and height |
| No load testing before release | k6/Gatling in CI staging pipeline |
