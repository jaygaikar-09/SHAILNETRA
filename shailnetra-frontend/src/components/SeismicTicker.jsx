import React, { useMemo } from 'react';

// Generates a jagged seismograph-style path used as the app's signature
// ambient element — a nod to the "ground vibration" sensor parameter.
function buildWave(seed, width, height, points) {
  let d = `M0 ${height / 2}`;
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 1; i <= points; i += 1) {
    const x = (width / points) * i;
    const spike = rand();
    const y = height / 2 + (spike - 0.5) * (spike > 0.85 ? height * 0.9 : height * 0.22);
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

export default function SeismicTicker({ tone = 'ochre' }) {
  const width = 1200;
  const height = 40;
  const stroke = tone === 'ochre' ? '#D9A441' : '#3ED598';

  const segment = useMemo(() => buildWave(17, width, height, 90), []);

  return (
    <div className="seismic-track h-10 w-full opacity-70" aria-hidden="true">
      <svg width={width * 2} height={height} viewBox={`0 0 ${width * 2} ${height}`} preserveAspectRatio="none">
        <path d={segment} stroke={stroke} strokeWidth="1" fill="none" opacity="0.9" />
        <path d={segment} transform={`translate(${width}, 0)`} stroke={stroke} strokeWidth="1" fill="none" opacity="0.9" />
      </svg>
    </div>
  );
}
