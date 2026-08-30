import React from 'react';

const STYLES = {
  LOW: { bg: 'bg-risk-low/10', text: 'text-risk-low', ring: 'ring-risk-low/30', label: 'Low' },
  MEDIUM: { bg: 'bg-risk-med/10', text: 'text-risk-med', ring: 'ring-risk-med/30', label: 'Medium' },
  HIGH: { bg: 'bg-risk-high/10', text: 'text-risk-high', ring: 'ring-risk-high/30', label: 'High' },
};

export default function RiskBadge({ level, size = 'md' }) {
  const s = STYLES[level] || STYLES.LOW;
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ring-1 font-mono font-medium uppercase tracking-wide ${s.bg} ${s.text} ${s.ring} ${pad}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.text.replace('text', 'bg')}`} />
      {s.label}
    </span>
  );
}

export function riskColor(level) {
  return { LOW: '#3ED598', MEDIUM: '#F0A93A', HIGH: '#FF5A4E' }[level] || '#3ED598';
}
