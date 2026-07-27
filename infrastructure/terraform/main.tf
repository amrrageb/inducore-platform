terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

variable "gcp_project_id" {
  type    = string
  default = "inducore-enterprise-prod"
}

variable "gcp_region" {
  type    = string
  default = "us-central1"
}

resource "google_container_cluster" "primary" {
  name     = "inducore-gke-cluster"
  location = var.gcp_region

  initial_node_count = 3
  deletion_protection = false

  node_config {
    machine_type = "e2-standard-4"
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}
