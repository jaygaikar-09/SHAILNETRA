// Lightweight stand-in for the XGBoost backend described in the PPT.
// Produces plausible zone-wise risk data, history, and alerts so every
// module is fully interactive during offline/demo use.

const ZONE_DEFS = [
  { id: 'zone-a', name: 'Zone A — North Bench', base: 15, x: -3.2, z: -1.4 },
  { id: 'zone-b', name: 'Zone B — East Slope', base: 43, x: 2.6, z: -2.1 },
  { id: 'zone-c', name: 'Zone C — Haul Road Cut', base: 82, x: 0.4, z: 3.1 },
  { id: 'zone-d', name: 'Zone D — South Pit Wall', base: 28, x: -2.0, z: 2.4 },
  { id: 'zone-e', name: 'Zone E — West Bench', base: 57, x: 3.4, z: 1.2 },
  { id: 'zone-f', name: 'Zone F — Overburden Dump', base: 9, x: -0.6, z: -3.4 },
];

function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function wobble(base, amplitude = 6) {
  return clamp(Math.round(base + (Math.random() - 0.5) * amplitude));
}

function riskLevel(score) {
  if (score >= 67) return 'HIGH';
  if (score >= 34) return 'MEDIUM';
  return 'LOW';
}

// Multi-parameter inputs per zone (rainfall, slope angle, displacement, crack width, vibration)
function paramsFor(zone) {
  const intensity = zone.base / 100;
  return {
    rainfall: +(2 + intensity * 30 + Math.random() * 4).toFixed(1), // mm/hr
    slopeAngle: +(28 + intensity * 20 + Math.random() * 2).toFixed(1), // degrees
    displacement: +(intensity * 12 + Math.random() * 1.5).toFixed(2), // mm
    crackWidth: +(intensity * 5 + Math.random() * 0.6).toFixed(2), // mm
    vibration: +(intensity * 8 + Math.random() * 1.2).toFixed(2), // mm/s
  };
}

export function getZoneRisk() {
  const timestamp = new Date().toISOString();
  return ZONE_DEFS.map((zone) => {
    const score = wobble(zone.base);
    return {
      id: zone.id,
      name: zone.name,
      position: { x: zone.x, z: zone.z },
      riskScore: score,
      riskLevel: riskLevel(score),
      params: paramsFor(zone),
      updatedAt: timestamp,
    };
  });
}

export function getZoneHistory(zoneId) {
  const zone = ZONE_DEFS.find((z) => z.id === zoneId) || ZONE_DEFS[0];
  const points = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i -= 1) {
    points.push({
      t: new Date(now - i * 60 * 60 * 1000).toISOString(),
      hourLabel: `${23 - i}h ago`,
      riskScore: wobble(zone.base, 14),
    });
  }
  return points;
}

const ALERT_TEMPLATES = [
  { severity: 'HIGH', message: 'crossed the high-risk threshold (≥ 67%)' },
  { severity: 'MEDIUM', message: 'trending upward over the last 3 hours' },
];

export function getAlerts() {
  const zones = getZoneRisk();
  return zones
    .filter((z) => z.riskScore >= 55)
    .map((z, i) => ({
      id: `alert-${z.id}-${i}`,
      zoneId: z.id,
      zoneName: z.name,
      severity: z.riskScore >= 67 ? 'HIGH' : 'MEDIUM',
      riskScore: z.riskScore,
      message:
        z.riskScore >= 67
          ? `${z.name} ${ALERT_TEMPLATES[0].message}`
          : `${z.name} ${ALERT_TEMPLATES[1].message}`,
      timestamp: new Date(Date.now() - i * 42 * 60 * 1000).toISOString(),
      acknowledged: false,
    }));
}

// Very small heuristic mirroring the model's likely feature weighting —
// enough to make the "Data Input / Simulation" module feel real.
export function predict(payload) {
  const {
    rainfall = 0,
    slopeAngle = 30,
    displacement = 0,
    crackWidth = 0,
    vibration = 0,
  } = payload || {};

  const score = clamp(
    Math.round(
      rainfall * 0.9 +
        Math.max(0, slopeAngle - 30) * 1.4 +
        displacement * 3.2 +
        crackWidth * 4.5 +
        vibration * 3.0
    )
  );

  return {
    riskScore: score,
    riskLevel: riskLevel(score),
    contributingFactors: [
      { factor: 'Rainfall', weight: +(rainfall * 0.9).toFixed(1) },
      { factor: 'Slope angle', weight: +(Math.max(0, slopeAngle - 30) * 1.4).toFixed(1) },
      { factor: 'Displacement', weight: +(displacement * 3.2).toFixed(1) },
      { factor: 'Crack width', weight: +(crackWidth * 4.5).toFixed(1) },
      { factor: 'Ground vibration', weight: +(vibration * 3.0).toFixed(1) },
    ],
  };
}
