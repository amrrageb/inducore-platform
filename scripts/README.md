# InduCore Developer Scripts Directory (`/scripts`)

This directory contains shell automation and validation scripts for developer setup and architectural checks within the **InduCore** monorepo.

---

## 🛠️ Script Catalog

| Script | Path | Purpose |
| :--- | :--- | :--- |
| **Dev Environment Setup** | [`dev-setup.sh`](./dev-setup.sh) | Verifies local dependencies (`node`, `pnpm`, `docker`), provisions `.env` from template, and boots Docker containers. |
| **Architecture Validator** | [`validate-architecture.sh`](./validate-architecture.sh) | Scans workspace package imports to verify Clean Architecture boundary rules are strictly maintained. |

---

## 🚀 Usage Instructions

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run local development setup
./scripts/dev-setup.sh

# Run layer dependency validation
./scripts/validate-architecture.sh
```
