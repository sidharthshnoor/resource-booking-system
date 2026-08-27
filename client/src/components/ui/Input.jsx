import React from 'react';

export default function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || props.name;

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    width: '100%'
  };

  const inputStyle = {
    padding: '0.625rem 0.75rem',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: 'var(--color-surface)'
  };

  return (
    <div style={containerStyle} className={className}>
      {label && <label htmlFor={inputId} className="text-label" style={{ color: 'var(--color-text-primary)' }}>{label}</label>}
      <input 
        id={inputId}
        style={inputStyle}
        {...props}
      />
      {error && <span style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>{error}</span>}
    </div>
  );
}
