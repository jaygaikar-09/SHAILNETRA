import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchZoneRisk, fetchAlerts, backendMode } from '../services/api.js';

const RiskDataContext = createContext(null);

const POLL_INTERVAL_MS = 8000;

export function RiskDataProvider({ children }) {
  const [zones, setZones] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [zoneData, alertData] = await Promise.all([fetchZoneRisk(), fetchAlerts()]);
      setZones(zoneData);
      setAlerts(alertData);
      setLastSync(new Date());
    } catch (err) {
      console.error('SHAILNETRA: failed to sync risk data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const acknowledgeAlert = useCallback((alertId) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)));
  }, []);

  const highRiskCount = zones.filter((z) => z.riskLevel === 'HIGH').length;
  const mediumRiskCount = zones.filter((z) => z.riskLevel === 'MEDIUM').length;
  const lowRiskCount = zones.filter((z) => z.riskLevel === 'LOW').length;
  const avgRisk = zones.length
    ? Math.round(zones.reduce((sum, z) => sum + z.riskScore, 0) / zones.length)
    : 0;

  const value = {
    zones,
    alerts,
    loading,
    lastSync,
    refresh,
    acknowledgeAlert,
    backendMode,
    stats: { highRiskCount, mediumRiskCount, lowRiskCount, avgRisk, total: zones.length },
  };

  return <RiskDataContext.Provider value={value}>{children}</RiskDataContext.Provider>;
}

export function useRiskData() {
  const ctx = useContext(RiskDataContext);
  if (!ctx) throw new Error('useRiskData must be used within RiskDataProvider');
  return ctx;
}
