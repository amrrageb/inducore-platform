# Package 15: Infrastructure Specification (`/docs/packages/15_INFRASTRUCTURE.md`)

## 1. Overview
Defines Kubernetes manifests, Helm charts, Docker Compose orchestrations, and GCP Terraform configurations.

## 2. Infrastructure Components
1. **`docker-compose.yml`**: Local dev stack orchestrating PostgreSQL 16, Redis 7, Apache Kafka & Zookeeper, API Gateway, Background Worker.
2. **`/infrastructure/kubernetes/`**:
   - `deployment.yaml`: API Gateway 3-replica Kubernetes deployment with liveness/readiness probes.
   - `ingress.yaml`: NGINX Ingress controller configuration with cert-manager Let's Encrypt TLS.
3. **`/infrastructure/terraform/`**:
   - `main.tf`: Google Kubernetes Engine (GKE) cluster provisioning script.
