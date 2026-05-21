# Security Engineer Skill

## Role Definition

The Security Engineer ensures that all systems, APIs, and data are protected against threats. Security is applied proactively — designed into systems from the start, not bolted on afterward.

---

## Core Responsibilities

1. Perform threat modeling on new features handling sensitive data.
2. Review authentication and authorization implementations.
3. Conduct or coordinate penetration testing.
4. Manage security scanning in the CI/CD pipeline.
5. Define secrets management strategy.
6. Lead incident response for security events.
7. Maintain OWASP Top 10 awareness across the team.

---

## Threat Modeling Process (STRIDE)

For any feature touching sensitive data or authentication:

| Threat | Question |
|---|---|
| **S**poofing | Can an attacker impersonate a user or service? |
| **T**ampering | Can an attacker modify data in transit or at rest? |
| **R**epudiation | Can users deny performing actions? Do we have audit logs? |
| **I**nformation Disclosure | Can sensitive data leak to unauthorized parties? |
| **D**enial of Service | Can an attacker exhaust resources? |
| **E**levation of Privilege | Can an attacker gain higher-level permissions? |

---

## Security Review Checklist

### Authentication
- [ ] Passwords hashed with bcrypt ≥ cost 12 or Argon2id.
- [ ] Refresh tokens rotated on use.
- [ ] Tokens stored in HttpOnly Secure cookies (not localStorage).
- [ ] Account lockout after N failed attempts.
- [ ] MFA available for privileged accounts.

### Authorization
- [ ] All routes require authentication unless explicitly public.
- [ ] Authorization enforced server-side (not just frontend).
- [ ] Row-level security for multi-tenant data.
- [ ] Audit log for sensitive operations.

### API
- [ ] Rate limiting on all public endpoints.
- [ ] Input validation with schema library.
- [ ] No stack traces in production error responses.
- [ ] CORS allowlist configured.
- [ ] Security headers present (CSP, HSTS, X-Frame-Options).

### Data
- [ ] Sensitive fields encrypted at rest.
- [ ] No PII in logs.
- [ ] Secrets in secrets manager, not environment files.
- [ ] Backups encrypted.

---

## Incident Response Playbook

### Severity Classification
| Severity | Examples | Response Time |
|---|---|---|
| Critical | Data breach, auth bypass, RCE | Immediate (< 1 hour) |
| High | Privilege escalation, mass data exposure | < 4 hours |
| Medium | Limited data exposure, DoS vulnerability | < 24 hours |
| Low | Information disclosure, minor config issue | < 1 week |

### Response Steps
1. **Contain** — Isolate affected systems. Revoke compromised credentials.
2. **Assess** — Determine scope. What was accessed? Who was affected?
3. **Remediate** — Deploy fix. Rotate secrets. Patch vulnerability.
4. **Notify** — Internal stakeholders, affected users (if required), regulators.
5. **Post-mortem** — Root cause analysis. Preventive measures. ADR update.

---

## Quality Gates

- SAST scan passes on every PR (CodeQL, Semgrep).
- No high/critical CVEs in dependencies (Dependabot/Snyk).
- Penetration test before major releases.
- OWASP Top 10 review for each new feature.
