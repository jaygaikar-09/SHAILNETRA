import React, { useState } from 'react';
import Topbar from '../../components/Topbar.jsx';
import { useRiskData } from '../../context/RiskDataContext.jsx';
import ZoneCard from './ZoneCard.jsx';

const FILTERS = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];

export default function ZoneRiskPanel() {
  const { zones, loading } = useRiskData();
  const [filter, setFilter] = useState('ALL');

  const visible = filter === 'ALL' ? zones : zones.filter((z) => z.riskLevel === filter);
  const sorted = [...visible].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar subtitle="Module 04 · Risk Classification" title="Zone-wise Risk" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-2 mb-5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wide transition-colors ${
                filter === f
                  ? 'bg-ochre-500/15 text-ochre-400 ring-1 ring-ochre-500/30'
                  : 'text-ink-500 hover:text-ink-300 border border-line'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading && <p className="text-ink-500 text-sm font-mono">Syncing zone data…</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((zone) => (
            <ZoneCard key={zone.id} zone={zone} />
          ))}
        </div>

        {!loading && sorted.length === 0 && (
          <p className="text-ink-500 text-sm font-mono mt-8">No zones match this filter right now.</p>
        )}
      </div>
    </div>
  );
}
