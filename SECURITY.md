# Security Policy

InduCore takes the security of our enterprise industrial software seriously. We appreciate the responsible disclosure of vulnerabilities.

---

## 🛡️ Supported Versions

Only the latest stable release and current main branch receive security updates:

| Version | Supported          |
| ------- | ------------------ |
| v2.x    | :white_check_mark: |
| v1.x    | :x:                |

---

## 🚨 Reporting a Vulnerability

**Do NOT report security vulnerabilities through public GitHub issues.**

Instead, please send a detailed report to **`security@inducore.io`** including:

1. Type of issue (e.g., SQL injection, Remote Code Execution, Auth Bypass, Privilege Escalation).
2. Step-by-step instructions or proof-of-concept script to reproduce the vulnerability.
3. Affected components (e.g. `api-gateway`, `background-worker`, Kafka consumer).
4. Potential impact on multi-tenant data isolation or system integrity.

### Disclosure Timeline
- **Acknowledgement**: Within 24 hours.
- **Initial Severity Assessment**: Within 72 hours.
- **Remediation & Patch Release**: Critical vulnerabilities patched within 7 business days.

---

## 🔒 Security Practices & Compliance

- **Dependencies**: Automated vulnerability scans via Dependabot and Snyk on every commit.
- **Static Analysis**: CodeQL and Semgrep SAST pipelines execute on every Pull Request.
- **Data Protection**: AES-256 encryption at rest; TLS 1.3 in transit; strict tenant isolation using PostgreSQL Row-Level Security (RLS).
