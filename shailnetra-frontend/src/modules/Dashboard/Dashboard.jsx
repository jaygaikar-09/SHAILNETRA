import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, ShieldX, Gauge, ArrowUpRight } from 'lucide-react';
import Topbar from '../../components/Topbar.jsx';
import StatCard from '../../components/StatCard.jsx';
import RiskBadge from '../../components/RiskBadge.jsx';
import { useRiskData } from '../../context/RiskDataContext.jsx';

export default function Dashboard() {
  const { zones, alerts, stats } = useRiskData();
  const topZones = [...zones].sort((a, b) => b.riskScore - a.riskScore).slice(0, 4);
  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar subtitle="Rockfall Early Warning · Open-Pit Mine" title="Operations Overview" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Zones monitored" value={stats.total} icon={Gauge} />
          <StatCard label="Low risk" value={stats.lowRiskCount} tone="low" icon={ShieldCheck} />
          <StatCard label="Medium risk" value={stats.mediumRiskCount} tone="med" icon={ShieldAlert} />
          <StatCard label="High risk" value={stats.highRiskCount} tone="high" icon={ShieldX} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 panel p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="eyebrow">Highest-risk zones</p>
              <Link
                to="/zones"
                className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wide text-ochre-400 hover:text-ochre-300"
              >
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {topZones.map((zone) => (
                <div key={zone.id} className="flex items-center gap-4">
                  <div className="w-28 shrink-0">
                    <p className="text-sm text-ink-100">{zone.name}</p>
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-base-700 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${zone.riskScore}%`,
                        background:
                          zone.riskLevel === 'HIGH'
                            ? '#FF5A4E'
                            : zone.riskLevel === 'MEDIUM'
                            ? '#F0A93A'
                            : '#3ED598',
                      }}
                    />
                  </div>
                  <span className="font-mono text-sm w-10 text-right">{zone.riskScore}%</span>
                  <RiskBadge level={zone.riskLevel} size="sm" />
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="eyebrow">Active alerts</p>
              <Link
                to="/alerts"
                className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wide text-ochre-400 hover:text-ochre-300"
              >
                Open <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            {activeAlerts.length === 0 ? (
              <p className="text-sm text-ink-500 font-mono">No active alerts. All zones nominal.</p>
            ) : (
              <div className="space-y-3">
                {activeAlerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                        alert.severity === 'HIGH' ? 'bg-risk-high' : 'bg-risk-med'
                      }`}
                    />
                    <div>
                      <p className="text-sm text-ink-100">{alert.zoneName}</p>
                      <p className="text-xs text-ink-500">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="panel p-5">
          <p className="eyebrow mb-2">About this system</p>
          <p className="text-sm text-ink-300 max-w-3xl leading-relaxed">
            SHAILNETRA replaces manual, reactive slope inspection with a continuous AI-driven early
            warning system. Multi-parameter geotechnical readings (rainfall, slope angle, displacement,
            crack width, ground vibration) feed a zone-wise risk model; results are mapped onto a 3D
            digital twin of the mine and trigger automated alerts before failure occurs.
          </p>
        </div>
      </div>
    </div>
  );
}
