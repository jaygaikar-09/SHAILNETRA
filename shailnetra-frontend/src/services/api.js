// ---------------------------------------------------------------------------
// SHAILNETRA API client
//
// This file is the single integration point with the FastAPI backend
// described in the Technical Approach (module 5: "API & Backend Service").
// Every function below currently falls back to the local simulator
// (./simulator.js) so the UI is fully demoable without a live backend.
//
// To connect the real backend once it's deployed:
//   1. Set VITE_API_BASE_URL in a .env file, e.g.
//        VITE_API_BASE_URL=https://your-backend.example.com
//   2. Nothing else changes — every module already calls these functions.
// ---------------------------------------------------------------------------
import * as sim from './simulator.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_LIVE_BACKEND = Boolean(BASE_URL);

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

// GET /zones -> zone-wise risk results (see PPT section 4: Risk Classification)
export async function fetchZoneRisk() {
  if (!USE_LIVE_BACKEND) return sim.getZoneRisk();
  return request('/zones');
}

// GET /zones/:id/history -> time series for trend analytics (section 7)
export async function fetchZoneHistory(zoneId) {
  if (!USE_LIVE_BACKEND) return sim.getZoneHistory(zoneId);
  return request(`/zones/${zoneId}/history`);
}

// GET /alerts -> active + historical alerts (section 8)
export async function fetchAlerts() {
  if (!USE_LIVE_BACKEND) return sim.getAlerts();
  return request('/alerts');
}

// POST /predict -> run the model on a fresh multi-parameter reading (sections 1-3)
export async function submitReading(payload) {
  if (!USE_LIVE_BACKEND) return sim.predict(payload);
  return request('/predict', { method: 'POST', body: JSON.stringify(payload) });
}

export const backendMode = USE_LIVE_BACKEND ? 'live' : 'simulated';
