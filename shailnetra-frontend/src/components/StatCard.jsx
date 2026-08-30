import React from 'react';

export default function StatCard({ label, value, unit, tone = 'default', icon: Icon }) {
  const toneMap = {
    default: 'text-ink-100',
    low: 'text-risk-low',
    med: 'text-risk-med',
    high: 'text-risk-high',
    ochre: 'text-ochre-400',
  };
  return (
    <div className="panel px-4 py-3.5 flex items-center justify-between">
      <div>
        <p className="eyebrow mb-1.5">{label}</p>
        <p className={`stat-value text-2xl ${toneMap[tone]}`}>
          {value}
          {unit && <span className="text-sm text-ink-500 ml-1">{unit}</span>}
        </p>
      </div>
      {Icon && (
        <div className="h-9 w-9 rounded-lg bg-base-700/60 flex items-center justify-center">
          <Icon className={`h-4.5 w-4.5 ${toneMap[tone]}`} strokeWidth={2} />
        </div>
      )}
    </div>
  );
}
