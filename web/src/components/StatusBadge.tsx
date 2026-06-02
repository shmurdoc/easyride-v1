import React from 'react';
import { clsx } from 'clsx';

const statusStyles: Record<string, string> = {
  pending: 'bg-warn-50 text-warn-700 border-warn-200',
  pending_approval: 'bg-warn-50 text-warn-700 border-warn-200',
  searching: 'bg-primary-50 text-primary-700 border-primary-200',
  accepted: 'bg-primary-50 text-primary-700 border-primary-200',
  arrived: 'bg-primary-50 text-primary-700 border-primary-200',
  in_progress: 'bg-primary-50 text-primary-700 border-primary-200',
  completed: 'bg-accent-50 text-accent-700 border-accent-200',
  active: 'bg-accent-50 text-accent-700 border-accent-200',
  online: 'bg-accent-50 text-accent-700 border-accent-200',
  approved: 'bg-accent-50 text-accent-700 border-accent-200',
  resolved: 'bg-accent-50 text-accent-700 border-accent-200',
  cancelled: 'bg-danger-50 text-danger-700 border-danger-200',
  rejected: 'bg-danger-50 text-danger-700 border-danger-200',
  failed: 'bg-danger-50 text-danger-700 border-danger-200',
  offline: 'bg-ink-100 text-ink-600 border-ink-200',
  refunded: 'bg-warn-50 text-warn-700 border-warn-200',
  open: 'bg-warn-50 text-warn-700 border-warn-200',
  standard: 'bg-ink-100 text-ink-700 border-ink-200',
  premium: 'bg-primary-50 text-primary-700 border-primary-200',
  luxury: 'bg-warn-50 text-warn-700 border-warn-200',
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider border capitalize',
      statusStyles[status] || 'bg-ink-100 text-ink-700 border-ink-200'
    )}>
      <span className="w-1 h-1 rounded-full bg-current opacity-60" />
      {status.replace(/_/g, ' ')}
    </span>
  );
}
