import React, { useState } from 'react';
import { Play, CloudRain, Triangle, ArrowUpDown, Ruler, Activity } from 'lucide-react';
import Topbar from '../../components/Topbar.jsx';
import RiskBadge from '../../components/RiskBadge.jsx';
import { submitReading } from '../../services/api.js';

const FIELDS = [
  { key: 'rainfall', label: 'Rainfall', unit: 'mm/hr', icon: CloudRain, min: 0, max: 40, default: 6 },
  { key: 'slopeAngle', label: 'Slope angle', unit: '°', icon: Triangle, min: 20, max: 55, default: 32 },
  { key: 'displacement', label: 'Lateral displacement', unit: 'mm', icon: ArrowUpDown, min: 0, max: 15, default: 2 },
  { key: 'crackWidth', label: 'Crack width', unit: 'mm', icon: Ruler, min: 0, max: 8, default: 1 },
  { key: 'vibration', label: 'Ground vibration', unit: 'mm/s', icon: Activity, min: 0, max: 12, default: 2 },
];

export default function SensorInputForm() {
  const [values, setValues] = useState(() =>
    FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: f.default }), {})
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (key, val) => setValues((prev) => ({ ...prev, [key]: Number(val) }));

  const handleRun = async () => {
    setLoading(true);
    try {
      const prediction = await submitReading(values);
      setResult(prediction);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar subtitle="Modules 01–03 · Data Collection & Risk Prediction" title="Simulate a Sensor Reading" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 panel p-5">
            <p className="eyebrow mb-5">Multi-parameter input</p>
            <div className="space-y-5">
              {FIELDS.map(({ key, label, unit, icon: Icon, min, max }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm text-ink-300">
                      <Icon className="h-3.5 w-3.5 text-ochre-400" />
                      {label}
                    </span>
                    <span className="font-mono text-sm text-ink-100">
                      {values[key]} {unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step="0.5"
                    value={values[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full accent-ochre-500"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleRun}
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-ochre-500 hover:bg-ochre-400 disabled:opacity-60 text-base-950 font-semibold text-sm py-2.5 transition-colors"
            >
              <Play className="h-4 w-4" />
              {loading ? 'Running model…' : 'Run risk prediction'}
            </button>
          </div>

          <div className="lg:col-span-2 panel p-5 flex flex-col">
            <p className="eyebrow mb-5">Model output</p>
            {!result ? (
              <div className="flex-1 flex items-center justify-center text-center text-sm text-ink-500 font-mono">
                Adjust the parameters and run the model to see a predicted risk score.
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <p className="font-mono text-4xl font-semibold text-ink-100">
                    {result.riskScore}
                    <span className="text-base text-ink-500">%</span>
                  </p>
                  <RiskBadge level={result.riskLevel} />
                </div>
                <p className="eyebrow mb-3">Contributing factors</p>
                <div className="space-y-2.5">
                  {result.contributingFactors.map((f) => (
                    <div key={f.factor}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-ink-300">{f.factor}</span>
                        <span className="font-mono text-ink-500">{f.weight}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-base-700 overflow-hidden">
                        <div
                          className="h-full bg-ochre-500 rounded-full"
                          style={{ width: `${Math.min(100, f.weight * 3)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
