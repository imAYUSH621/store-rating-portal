import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function SortableHeader({
  label,
  field,
  currentSort,
  currentOrder,
  onSort
}) {
  const isActive = currentSort === field;

  return (
    <th
      className="sortable"
      onClick={() => onSort(field)}
      style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
      title={`Sort by ${label}`}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <span>{label}</span>
        {isActive ? (
          currentOrder === 'asc' ? (
            <ArrowUp size={14} color="#4f46e5" strokeWidth={2.5} />
          ) : (
            <ArrowDown size={14} color="#4f46e5" strokeWidth={2.5} />
          )
        ) : (
          <ArrowUpDown size={13} style={{ opacity: 0.35 }} />
        )}
      </div>
    </th>
  );
}
