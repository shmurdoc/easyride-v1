import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  sparkline?: number[];
  isCurrency?: boolean;
}

export function MetricCard({ label, value, sparkline }: MetricCardProps) {
  return (
    <div className="card-flat p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</p>
      <p className="mt-1.5 text-2xl font-display font-bold text-ink-900">{value}</p>
      {sparkline && (
        <svg className="mt-3 w-full" height="40" viewBox={`0 0 ${sparkline.length * 10} 40}`}>
          <polyline
            fill="none"
            stroke="#3563ff"
            strokeWidth="2"
            points={sparkline.map((v, i) => `${i * 10},${40 - (v / Math.max(...sparkline)) * 35}`).join(' ')}
          />
        </svg>
      )}
    </div>
  );
}
