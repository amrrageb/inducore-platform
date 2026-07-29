import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 virtual users
    { duration: '1m', target: 250 },  // Spike to 250 virtual users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'], // 95% of requests must complete below 100ms
    http_req_failed: ['rate<0.01'],    // Error rate must be under 1%
  },
};

export default function () {
  const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

  // 1. Healthcheck probe
  const healthRes = http.get(`${BASE_URL}/v1/admin/health`);
  check(healthRes, { 'Healthcheck HTTP 200': (r) => r.status === 200 });

  // 2. Fetch Pipelines
  const pipeRes = http.get(`${BASE_URL}/v1/devops/pipelines`);
  check(pipeRes, { 'DevOps Pipelines HTTP 200': (r) => r.status === 200 });

  sleep(1);
}
