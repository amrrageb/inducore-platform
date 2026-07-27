# GitHub CI/CD Workflows Overview

This directory contains automated workflow pipelines for InduCore enterprise integration and delivery.

## Active Workflows

1. **`ci.yml`**: Runs on push/PR to `main` and `develop`. Executes TypeScript type checking, ESLint rules, unit tests, and integration tests across monorepo packages.
2. **`cd.yml`**: Triggers on merges to `main`. Handles containerization, database migration dry-runs, and staging cluster releases.
3. **`security-scan.yml`**: Automated CodeQL static code analysis (SAST) and weekly dependency auditing for vulnerabilities.
4. **`lint.yml`**: Lightweight pull request check enforcing Prettier code formatting and ESLint standards.
