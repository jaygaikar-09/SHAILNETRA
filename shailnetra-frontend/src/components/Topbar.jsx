import React from 'react';
import { Radio, Clock } from 'lucide-react';
import { useRiskData } from '../context/RiskDataContext.jsx';
import SeismicTicker from './SeismicTicker.jsx';

export default function Topbar({ title, subtitle }) {
  const { lastSync, backendMode, stats } = useRiskData();

  return (
    <header className="border-b border-line bg-base-900/50">
      <div className="flex items-center justify-between px-6 pt-5">
        <div>
          <p className="eyebrow mb-1">{subtitle}</p>
          <h1 className="text-xl md:text-2xl font-semibold text-ink-100">{title}</h1>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-ink-500">
            <Clock className="h-3.5 w-3.5" />
            {lastSync ? lastSync.toLocaleTimeString() : '—'}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5">
            <Radio className={`h-3.5 w-3.5 ${backendMode === 'live' ? 'text-risk-low' : 'text-ochre-400'}`} />
            <span className="text-[11px] font-mono uppercase tracking-wide text-ink-300">
              {backendMode === 'live' ? 'Live sensors' : 'Simulated feed'}
            </span>
          </div>
          {stats.highRiskCount > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-risk-high/10 ring-1 ring-risk-high/30 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-high opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-risk-high" />
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wide text-risk-high">
                {stats.highRiskCount} zone{stats.highRiskCount > 1 ? 's' : ''} critical
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 px-6">
        <SeismicTicker />
      </div>
    </header>
  );
}
