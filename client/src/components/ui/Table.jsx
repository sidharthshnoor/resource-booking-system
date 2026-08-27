import React from 'react';

export default function Table({ headers, data, renderRow, emptyMessage = 'No data available.' }) {
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  };

  const thStyle = {
    padding: 'var(--spacing-4)',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface-muted)',
    color: 'var(--color-text-secondary)'
  };

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={thStyle} className="text-label-sm">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ padding: 'var(--spacing-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => renderRow(item, index))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Sub-component for standard rows
export function TableRow({ children, className = '' }) {
  const rowStyle = {
    borderBottom: '1px solid var(--color-border)',
    transition: 'background-color 0.2s',
  };

  return (
    <tr 
      style={rowStyle} 
      className={className} 
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td style={{ padding: 'var(--spacing-4)', fontSize: '0.875rem' }} className={className}>
      {children}
    </td>
  );
}
