import React from 'react';

export default function Card({ children, className = '', style = {}, noPadding = false, ...props }) {
  const cardStyle = {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm)',
    padding: noPadding ? '0' : 'var(--spacing-6)',
    ...style
  };

  return (
    <div style={cardStyle} className={className} {...props}>
      {children}
    </div>
  );
}
