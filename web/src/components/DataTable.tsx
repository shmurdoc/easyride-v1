import React from 'react';
import EmptyState from './EmptyState';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data yet',
  emptyDescription,
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="card-flat overflow-hidden">
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-12" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card-flat">
        <EmptyState
          title={emptyMessage}
          description={emptyDescription ?? 'Data will appear here once available.'}
        />
      </div>
    );
  }

  return (
    <div className="card-flat overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink-50/60 border-b border-ink-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-ink-500"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr
                key={item.id}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={`
                  border-b border-ink-50 last:border-0
                  transition-colors duration-100
                  ${onRowClick ? 'cursor-pointer hover:bg-primary-50/40' : ''}
                  ${i % 2 === 1 ? 'bg-ink-50/20' : ''}
                `}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-ink-800 ${col.className ?? ''}`}>
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
