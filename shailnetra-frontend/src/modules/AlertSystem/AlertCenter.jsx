import React from 'react';
import { Mail, MessageSquare, BellRing, CheckCircle2, MapPin, Wrench, Users } from 'lucide-react';
import Topbar from '../../components/Topbar.jsx';
import { useRiskData } from '../../context/RiskDataContext.jsx';

const ACTIONS = [
  { icon: MapPin, label: 'Inspect high-risk zone' },
  { icon: BellRing, label: 'Enhanced monitoring' },
  { icon: Wrench, label: 'Slope reinforcement' },
  { icon: Users, label: 'Targeted evacuation (if required)' },
];

export default function AlertCenter() {
  const { alerts, acknowledgeAlert } = useRiskData();
  const active = alerts.filter((a) => !a.acknowledged);
  const resolved = alerts.filter((a) => a.acknowledged);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar subtitle="Module 08 · Automated Early Warning" title="Alert Center" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-3">
            <p className="eyebrow">Active alerts ({active.length})</p>
            {active.length === 0 && (
              <div className="panel p-6 text-center text-sm text-ink-500 font-mono">
                No zones above the medium-risk threshold. All quiet.
              </div>
            )}
            {active.map((alert) => (
              <div
                key={alert.id}
                className={`panel p-4 flex items-start gap-4 ${
                  alert.severity === 'HIGH' ? 'ring-1 ring-risk-high/30' : ''
                }`}
              >
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                    alert.severity === 'HIGH' ? 'bg-risk-high/10' : 'bg-risk-med/10'
                  }`}
                >
                  <BellRing
                    className={`h-4 w-4 ${alert.severity === 'HIGH' ? 'text-risk-high' : 'text-risk-med'}`}
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink-100">{alert.zoneName}</p>
                    <span className="font-mono text-xs text-ink-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-ink-300 mt-0.5">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="font-mono text-[11px] text-ink-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email sent
                    </span>
                    <span className="font-mono text-[11px] text-ink-500 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> SMS sent
                    </span>
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="ml-auto flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-ochre-400 hover:text-ochre-300"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {resolved.length > 0 && (
              <>
                <p className="eyebrow pt-3">Acknowledged ({resolved.length})</p>
                {resolved.map((alert) => (
                  <div key={alert.id} className="panel p-4 flex items-center gap-4 opacity-50">
                    <CheckCircle2 className="h-4 w-4 text-risk-low shrink-0" />
                    <p className="text-sm text-ink-300 flex-1">{alert.message}</p>
                    <span className="font-mono text-xs text-ink-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="panel p-5 h-fit">
            <p className="eyebrow mb-4">Recommended safety actions</p>
            <ul className="space-y-3">
              {ACTIONS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-ink-300">
                  <Icon className="h-4 w-4 text-ochre-400 shrink-0" strokeWidth={2} />
                  {label}
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-4 border-t border-line text-[11px] font-mono text-ink-500 leading-relaxed">
              Alerts trigger automatically once a zone's risk score crosses the{' '}
              <span className="text-risk-high">high-risk threshold (≥ 67%)</span>, per module 8 of the
              technical approach.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
