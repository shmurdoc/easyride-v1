import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, eyebrow, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 animate-slide-down">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-2xs font-semibold uppercase tracking-wider text-primary-600 mb-1.5">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink-900 tracking-tight text-balance">
          {title}
        </h1>
        {subtitle && <p className="text-ink-500 mt-1.5 text-sm sm:text-base text-pretty">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
