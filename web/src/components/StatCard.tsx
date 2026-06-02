import React from 'react';

type Tone = 'primary' | 'accent' | 'warn' | 'danger' | 'neutral';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  tone?: Tone;
  pulse?: boolean;
}

const toneStyles: Record<Tone, { wrap: string; icon: string }> = {
  primary: { wrap: 'from-primary-500/5 to-primary-500/0', icon: 'bg-primary-50 text-primary-600' },
  accent:  { wrap: 'from-accent-500/5 to-accent-500/0',  icon: 'bg-accent-50 text-accent-600' },
  warn:    { wrap: 'from-warn-500/5 to-warn-500/0',     icon: 'bg-warn-50 text-warn-600' },
  danger:  { wrap: 'from-danger-500/5 to-danger-500/0', icon: 'bg-danger-50 text-danger-600' },
  neutral: { wrap: 'from-ink-500/5 to-ink-500/0',        icon: 'bg-ink-100 text-ink-700' },
};

export default function StatCard({ label, value, icon, sub, tone = 'primary', pulse = false }: StatCardProps) {
  const t = toneStyles[tone];
  return (
    <div className={`relative overflow-hidden card-flat p-5 bg-gradient-to-br ${t.wrap}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</p>
          <p className="mt-1.5 text-2xl sm:text-[1.7rem] font-display font-bold text-ink-900 leading-none truncate">
            {value}
          </p>
          {sub && <p className="mt-1.5 text-xs text-ink-500">{sub}</p>}
        </div>
        <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.icon}`}>
          {icon}
          {pulse && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-500 ring-2 ring-white animate-pulse-slow" />
          )}
        </div>
      </div>
    </div>
  );
}
