import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Topbar from '../../components/Topbar.jsx';
import { useRiskData } from '../../context/RiskDataContext.jsx';
import { fetchZoneHistory } from '../../services/api.js';
import { riskColor } from '../../components/RiskBadge.jsx';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="panel px-3 py-2 text-xs font-mono">
      <p className="text-ink-500 mb-1">{label}</p>
      <p className="text-ink-100">{payload[0].value}% risk score</p>
    </div>
  );
}

export default function TrendAnalytics() {
  const { zones, stats } = useRiskData();
  const [searchParams, setSearchParams] = useSearchParams();
  const zoneParam = searchParams.get('zone');
  const [selectedZoneId, setSelectedZoneId] = useState(zoneParam || zones[0]?.id);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (zones.length && !selectedZoneId) setSelectedZoneId(zones[0].id);
  }, [zones, selectedZoneId]);

  useEffect(() => {
    if (!selectedZoneId) return;
    fetchZoneHistory(selectedZoneId).then(setHistory);
  }, [selectedZoneId]);

  const distribution = [
    { name: 'Low', value: stats.lowRiskCount, color: '#3ED598' },
    { name: 'Medium', value: stats.mediumRiskCount, color: '#F0A93A' },
    { name: 'High', value: stats.highRiskCount, color: '#FF5A4E' },
  ];

  const activeZone = zones.find((z) => z.id === selectedZoneId);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar subtitle="Module 07 · Dashboard & Analytics" title="Trend Analysis" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="panel p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="eyebrow mb-1">24-hour risk trend</p>
                <p className="font-semibold text-sm">{activeZone?.name || '—'}</p>
              </div>
              <select
                value={selectedZoneId || ''}
                onChange={(e) => {
                  setSelectedZoneId(e.target.value);
                  setSearchParams({ zone: e.target.value });
                }}
                className="bg-base-700 border border-line rounded-lg text-xs font-mono px-3 py-1.5 text-ink-300"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#1B232B" vertical={false} />
                <XAxis dataKey="hourLabel" stroke="#4E5A64" fontSize={11} tickLine={false} axisLine={false} interval={3} />
                <YAxis stroke="#4E5A64" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={67} stroke="#FF5A4E" strokeDasharray="4 4" strokeOpacity={0.6} />
                <ReferenceLine y={34} stroke="#F0A93A" strokeDasharray="4 4" strokeOpacity={0.4} />
                <Line
                  type="monotone"
                  dataKey="riskScore"
                  stroke={riskColor(activeZone?.riskLevel)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="panel p-5 flex flex-col">
            <p className="eyebrow mb-4">Fleet-wide risk distribution</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {distribution.map((d) => (
                    <Cell key={d.name} fill={d.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {distribution.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-2 text-ink-300">
                    <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                    {d.name}
                  </span>
                  <span className="text-ink-100">{d.value} zones</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel p-5">
          <p className="eyebrow mb-4">Zone-wise comparison</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-mono uppercase tracking-wide text-ink-500 border-b border-line">
                  <th className="pb-2 font-normal">Zone</th>
                  <th className="pb-2 font-normal">Risk score</th>
                  <th className="pb-2 font-normal">Level</th>
                  <th className="pb-2 font-normal">Vibration</th>
                  <th className="pb-2 font-normal">Crack width</th>
                  <th className="pb-2 font-normal">Updated</th>
                </tr>
              </thead>
              <tbody>
                {[...zones]
                  .sort((a, b) => b.riskScore - a.riskScore)
                  .map((z) => (
                    <tr key={z.id} className="border-b border-line/60 last:border-0">
                      <td className="py-2.5 text-ink-100">{z.name}</td>
                      <td className="py-2.5 font-mono">{z.riskScore}%</td>
                      <td className="py-2.5">
                        <span style={{ color: riskColor(z.riskLevel) }} className="font-mono text-xs uppercase">
                          {z.riskLevel}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-ink-300">{z.params.vibration} mm/s</td>
                      <td className="py-2.5 font-mono text-ink-300">{z.params.crackWidth} mm</td>
                      <td className="py-2.5 font-mono text-ink-500 text-xs">
                        {new Date(z.updatedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
