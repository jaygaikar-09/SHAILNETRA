import React from 'react';
import { Link } from 'react-router-dom';
import RiskBadge, { riskColor } from '../../components/RiskBadge.jsx';

export default function ZoneCard({ zone }) {
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (zone.riskScore / 100) * circumference;

  return (
    <div className="panel p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-sm text-ink-100">{zone.name}</p>
          <p className="text-[11px] font-mono text-ink-500 mt-0.5">{zone.id.toUpperCase()}</p>
        </div>
        <RiskBadge level={zone.riskLevel} size="sm" />
      </div>

      <div className="flex items-center gap-4">
        <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
          <circle cx="32" cy="32" r="26" stroke="#232B33" strokeWidth="5" fill="none" />
          <circle
            cx="32"
            cy="32"
            r="26"
            stroke={riskColor(zone.riskLevel)}
            strokeWidth="5"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 32 32)"
          />
          <text x="32" y="37" textAnchor="middle" className="font-mono" fontSize="15" fill="#EDF1F4">
            {zone.riskScore}
          </text>
        </svg>

        <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-mono">
          <span className="text-ink-500">Rain</span>
          <span className="text-ink-300 text-right">{zone.params.rainfall}mm/h</span>
          <span className="text-ink-500">Slope</span>
          <span className="text-ink-300 text-right">{zone.params.slopeAngle}°</span>
          <span className="text-ink-500">Displ.</span>
          <span className="text-ink-300 text-right">{zone.params.displacement}mm</span>
          <span className="text-ink-500">Crack</span>
          <span className="text-ink-300 text-right">{zone.params.crackWidth}mm</span>
        </div>
      </div>

      <Link
        to={`/analytics?zone=${zone.id}`}
        className="text-[11px] font-mono uppercase tracking-wide text-ochre-400 hover:text-ochre-300 transition-colors"
      >
        View trend →
      </Link>
    </div>
  );
}
