# Security Engineering Rules

## Core Standards

Security is not a feature — it is a foundational requirement. These rules are mandatory for all layers of the system.

---

## 1. Authentication

- Use **JWT** with short expiry (15 minutes access token, 7-day refresh token).
- Implement **refresh token rotation** — invalidate old refresh token on use.
- Store refresh tokens in `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
- Never store tokens in `localStorage` — vulnerable to XSS.
- Implement **multi-factor authentication (MFA)** for admin and privileged accounts.
- Use battle-tested libraries: **Auth.js**, **Passport.js**, **Keycloak**, **Auth0** — never roll your own.
- Hash passwords with **bcrypt (cost ≥ 12)** or **Argon2id**. Never MD5/SHA1.
- Implement account lockout after N failed login attempts (default: 5).

---

## 2. Authorization

- Enforce **Role-Based Access Control (RBAC)** at the use case / service layer.
- **Never** rely solely on frontend route guards — always enforce on the server.
- Use **Attribute-Based Access Control (ABAC)** for fine-grained permission policies.
- Authorization checks must happen before any data retrieval.
- Principle of **least privilege**: users and services have only the permissions they need.
- Audit all privilege escalations and access to sensitive resources.

---

## 3. Input Validation & Sanitization

- Validate and sanitize ALL user input at the API boundary.
- Use schema validation libraries (Zod, Joi, class-validator).
- **Whitelist** acceptable input formats — reject anything not on the whitelist.
- Sanitize HTML output to prevent XSS. Use DOMPurify on the client.
- Parameterized queries only — never concatenate user input into SQL.
- Validate file uploads: type, size, content (not just extension).

---

## 4. API Security

- Rate limiting on ALL public endpoints. Stricter limits on auth endpoints.
- Implement **CORS** with explicit allowlists. No wildcard `*` in production.
- Use **HTTPS only**. Redirect HTTP to HTTPS. HSTS header required.
- Security headers on all responses:
  ```
  Content-Security-Policy: default-src 'self'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=()
  ```
- Validate `Content-Type` headers on all POST/PUT/PATCH requests.
- Never expose internal error details or stack traces in API responses.

---

## 5. Secrets Management

- **ZERO hardcoded secrets** in source code — ever.
- All secrets via environment variables or secrets manager (AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager).
- `.env` files never committed to version control. Only `.env.example` committed.
- Rotate all secrets and credentials on a schedule (API keys: 90 days, passwords: 90 days).
- Use short-lived credentials where possible (IAM roles, service accounts).
- Audit secrets access via secrets manager audit logs.

---

## 6. Data Protection

- Encrypt sensitive PII at rest using AES-256 with application-managed keys.
- Encrypt all data in transit using TLS 1.2+. Disable older TLS versions.
- Implement data classification: Public, Internal, Confidential, Restricted.
- GDPR/CCPA compliance: implement data erasure, data portability, consent management.
- Mask PII in logs: email shown as `j***@example.com`, phone as `***-***-1234`.
- Backup encryption: all database backups must be encrypted.

---

## 7. Dependency Security

- Use **automated dependency scanning**: Dependabot, Snyk, OWASP Dependency-Check.
- Block PRs with known high/critical CVEs in dependencies.
- Pin dependency versions in production. Use lockfiles (`package-lock.json`, `poetry.lock`).
- Audit dependency licenses to ensure compatibility.
- Review and minimize the number of third-party dependencies.

---

## 8. Security Testing

- **SAST** (Static Application Security Testing) in CI pipeline: SonarQube, CodeQL, Semgrep.
- **DAST** (Dynamic Application Security Testing) against staging: OWASP ZAP.
- Penetration testing before major releases and at least annually.
- Regular **threat modeling** for new features handling sensitive data.
- OWASP Top 10 review checklist for every major feature.

---

## 9. Incident Response

- Maintain a documented incident response plan.
- Security incidents classified by severity (Critical, High, Medium, Low).
- Critical incidents: 1-hour response SLA, 4-hour resolution target.
- All incidents documented in a post-mortem with root cause and preventive measures.
- Security monitoring: alerts for unusual access patterns, failed auth spikes, data exfiltration signals.

---

## Anti-Patterns (FORBIDDEN)

| Anti-Pattern | Corrective Action |
|---|---|
| Hardcoded secrets | Secrets manager + env vars |
| MD5/SHA1 password hashing | bcrypt cost ≥ 12 or Argon2id |
| Tokens in localStorage | HttpOnly Secure cookies |
| Authorization in frontend only | Server-side enforcement always |
| Verbose error responses | Generic messages + server-side logging |
| HTTP in production | HTTPS with HSTS |
| Wildcard CORS | Explicit allowlist |
| SQL string concatenation | Parameterized queries |
